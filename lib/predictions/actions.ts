"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPredictionType, isPredictionLocked, validateScoreConsistency } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Match, Outcome } from "@/lib/types";

export type SavePredictionState = {
  status: "saved";
  redirectTo: string;
} | null;

export type QuickPredictionResult = {
  ok: boolean;
  error?: string;
};

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return String(raw ?? "").trim();
}

function optionalNumber(formData: FormData, key: string) {
  const raw = value(formData, key);
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function fail(matchId: string, message: string): never {
  redirect(`/partidos/${matchId}?error=${encodeURIComponent(message)}`);
}

function quickFail(message: string): QuickPredictionResult {
  return {
    ok: false,
    error: message
  };
}

export async function savePrediction(_state: SavePredictionState, formData: FormData): Promise<SavePredictionState> {
  const matchId = value(formData, "matchId");
  if (!matchId) redirect("/partidos");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id,group_id,role")
    .eq("id", authData.user.id)
    .single();

  if (!profile?.group_id) {
    fail(matchId, "Tu usuario no tiene grupo asignado.");
  }

  const { data: match } = await admin.from("matches").select("*").eq("id", matchId).single<{
    id: string;
    phase: Match["phase"];
    kickoff_at: string;
    home_team_id: string | null;
    away_team_id: string | null;
  }>();

  if (!match) {
    fail(matchId, "Partido no encontrado.");
  }

  if (isPredictionLocked(match.kickoff_at)) {
    fail(matchId, "La predicción ya está cerrada para este partido.");
  }

  const predictionType = getPredictionType({
    id: match.id,
    phase: match.phase,
    kickoffAt: match.kickoff_at,
    homeTeamId: match.home_team_id,
    awayTeamId: match.away_team_id,
    matchNumber: 0,
    status: "scheduled"
  });

  const predictedOutcomeRaw = value(formData, "predictedOutcome");
  const predictedOutcome = ["home", "draw", "away"].includes(predictedOutcomeRaw)
    ? (predictedOutcomeRaw as Outcome)
    : null;
  const predictedWinnerTeamId = value(formData, "predictedWinnerTeamId") || null;
  const predictedHomeScore = optionalNumber(formData, "predictedHomeScore");
  const predictedAwayScore = optionalNumber(formData, "predictedAwayScore");
  const predictsExtraTime = formData.get("predictsExtraTime") === "true";
  const predictsPenalties = formData.get("predictsPenalties") === "true";

  if (predictionType === "group_stage") {
    if (!predictedOutcome) {
      fail(matchId, "Selecciona ganador o empate.");
    }
    if (!validateScoreConsistency(predictedOutcome, predictedHomeScore, predictedAwayScore)) {
      fail(matchId, "El marcador no coincide con tu seleccion principal.");
    }
  }

  if (predictionType === "knockout" || predictionType === "final") {
    if (!predictedWinnerTeamId) {
      fail(matchId, "Selecciona quién gana o avanza.");
    }
    if (![match.home_team_id, match.away_team_id].includes(predictedWinnerTeamId)) {
      fail(matchId, "Selección inválida para este partido.");
    }
  }

  const { error } = await admin.from("match_predictions").upsert(
    {
      match_id: matchId,
      user_id: authData.user.id,
      group_id: profile.group_id,
      prediction_type: predictionType,
      predicted_outcome: predictionType === "group_stage" ? predictedOutcome : null,
      predicted_winner_team_id: predictionType === "group_stage" ? null : predictedWinnerTeamId,
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
      predicts_extra_time: predictionType === "group_stage" ? null : predictsExtraTime,
      predicts_penalties: predictionType === "group_stage" ? null : predictsPenalties,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "match_id,user_id"
    }
  );

  if (error) {
    fail(matchId, "No se pudo guardar la predicción.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/partidos");
  revalidatePath(`/partidos/${matchId}`);
  revalidatePath("/historial");
  if (predictionType === "group_stage") {
    return {
      status: "saved",
      redirectTo: "/partidos?saved=prediccion"
    };
  }

  redirect(`/partidos/${matchId}?saved=1`);
}

export async function saveQuickGroupPrediction(formData: FormData): Promise<QuickPredictionResult> {
  const matchId = value(formData, "matchId");
  if (!matchId) return quickFail("Partido no encontrado.");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return quickFail("Tu sesión expiró. Inicia sesión otra vez.");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id,group_id,role")
    .eq("id", authData.user.id)
    .single();

  if (!profile?.group_id) return quickFail("Tu usuario no tiene grupo asignado.");

  const { data: match } = await admin.from("matches").select("*").eq("id", matchId).single<{
    id: string;
    phase: Match["phase"];
    kickoff_at: string;
    home_team_id: string | null;
    away_team_id: string | null;
  }>();

  if (!match || match.phase !== "group_stage") return quickFail("Este flujo solo funciona para Fase de grupos.");
  if (isPredictionLocked(match.kickoff_at)) return quickFail("La predicción ya está cerrada para este partido.");

  const predictedOutcomeRaw = value(formData, "predictedOutcome");
  const predictedOutcome = ["home", "draw", "away"].includes(predictedOutcomeRaw)
    ? (predictedOutcomeRaw as Outcome)
    : null;
  const predictedHomeScore = optionalNumber(formData, "predictedHomeScore");
  const predictedAwayScore = optionalNumber(formData, "predictedAwayScore");

  if (!predictedOutcome) return quickFail("Selecciona ganador o empate.");
  if (!validateScoreConsistency(predictedOutcome, predictedHomeScore, predictedAwayScore)) {
    return quickFail("El marcador no coincide con tu selección principal.");
  }

  const { error } = await admin.from("match_predictions").upsert(
    {
      match_id: matchId,
      user_id: authData.user.id,
      group_id: profile.group_id,
      prediction_type: "group_stage",
      predicted_outcome: predictedOutcome,
      predicted_winner_team_id: null,
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
      predicts_extra_time: null,
      predicts_penalties: null,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "match_id,user_id"
    }
  );

  if (error) return quickFail("No se pudo guardar la predicción.");

  revalidatePath("/dashboard");
  revalidatePath("/partidos");
  revalidatePath("/historial");
  revalidatePath("/ranking");

  return { ok: true };
}
