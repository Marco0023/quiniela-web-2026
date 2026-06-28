"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/admin/auth";
import { resolveClassificationGroups } from "@/lib/classification/groups";
import { scoreClassificationPrediction } from "@/lib/classification/rules";
import { getPredictionType, isPredictionLocked, validateScoreConsistency } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Match, MatchResult, Outcome, Team } from "@/lib/types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (raw === "") return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function redirectWithError(message: string): never {
  redirect(`/admin/pendientes?error=${encodeURIComponent(message)}`);
}

function dateKeyInTimezone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function mapMatchFromRow(row: {
  id: string;
  phase: Match["phase"];
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_placeholder?: string | null;
  away_placeholder?: string | null;
  kickoff_at: string;
  tournament_group?: string | null;
  status: Match["status"];
}): Match {
  return {
    id: row.id,
    phase: row.phase,
    matchNumber: row.match_number,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homePlaceholder: row.home_placeholder ?? undefined,
    awayPlaceholder: row.away_placeholder ?? undefined,
    kickoffAt: row.kickoff_at,
    tournamentGroup: row.tournament_group,
    status: row.status
  };
}

export async function saveAdminMatchPrediction(formData: FormData) {
  const adminProfile = await requireAdminProfile();
  const matchId = text(formData, "matchId");
  const targetUserId = text(formData, "targetUserId");

  if (!matchId || !targetUserId) {
    redirectWithError("Selecciona partido y participante.");
  }

  const admin = createAdminClient();
  const [{ data: adminTimezone }, { data: targetProfile }, { data: matchRow }, { data: existing }, { data: result }] =
    await Promise.all([
      admin.from("profiles").select("timezone").eq("id", adminProfile.id).single<{ timezone: string }>(),
      admin.from("profiles").select("id,group_id,role").eq("id", targetUserId).single<{ id: string; group_id: string | null; role: string }>(),
      admin.from("matches").select("*").eq("id", matchId).single(),
      admin.from("match_predictions").select("id").eq("match_id", matchId).eq("user_id", targetUserId).maybeSingle<{ id: string }>(),
      admin.from("match_results").select("match_id").eq("match_id", matchId).maybeSingle<{ match_id: string }>()
    ]);

  if (!targetProfile || targetProfile.role !== "participant" || !targetProfile.group_id) {
    redirectWithError("Participante no encontrado.");
  }

  if (!matchRow) {
    redirectWithError("Partido no encontrado.");
  }

  if (existing) {
    redirectWithError("Ese participante ya tiene prediccion para este partido.");
  }

  if (result) {
    redirectWithError("Este partido ya tiene resultado guardado.");
  }

  const match = mapMatchFromRow(matchRow);
  const timezone = adminTimezone?.timezone ?? "America/Bogota";
  const todayKey = dateKeyInTimezone(new Date(), timezone);
  const yesterdayKey = dateKeyInTimezone(addDays(new Date(), -1), timezone);
  const matchKey = dateKeyInTimezone(new Date(match.kickoffAt), timezone);

  if (matchKey !== todayKey && matchKey !== yesterdayKey) {
    redirectWithError("Solo puedes cargar predicciones faltantes de partidos de hoy o de ayer.");
  }

  if (!isPredictionLocked(match.kickoffAt)) {
    redirectWithError("Este partido todavia esta abierto para que el usuario prediga.");
  }
  if (!match.homeTeamId || !match.awayTeamId) {
    redirectWithError("Este partido todavia no tiene los dos equipos definidos.");
  }

  const predictionType = getPredictionType(match);
  const predictedOutcomeRaw = text(formData, "predictedOutcome");
  const predictedOutcome = ["home", "draw", "away"].includes(predictedOutcomeRaw) ? (predictedOutcomeRaw as Outcome) : null;
  const predictedWinnerTeamId = text(formData, "predictedWinnerTeamId") || null;
  const predictedHomeScore = optionalNumber(formData, "predictedHomeScore");
  const predictedAwayScore = optionalNumber(formData, "predictedAwayScore");
  const predictsExtraTime = formData.get("predictsExtraTime") === "true";
  const predictsPenalties = formData.get("predictsPenalties") === "true";

  if (predictionType === "group_stage") {
    if (!predictedOutcome) {
      redirectWithError("Selecciona ganador o empate.");
    }
    if (!validateScoreConsistency(predictedOutcome, predictedHomeScore, predictedAwayScore)) {
      redirectWithError("El marcador no coincide con la seleccion principal.");
    }
  }

  if (predictionType === "knockout" || predictionType === "final") {
    if (!predictedWinnerTeamId) {
      redirectWithError("Selecciona quien gana o avanza.");
    }
    if (![match.homeTeamId, match.awayTeamId].includes(predictedWinnerTeamId)) {
      redirectWithError("Seleccion invalida para este partido.");
    }
    if (predictedHomeScore === null || predictedAwayScore === null) {
      redirectWithError("En eliminatorias debes agregar marcador de 90 minutos.");
    }
  }

  const { error } = await admin.from("match_predictions").insert({
    match_id: matchId,
    user_id: targetUserId,
    group_id: targetProfile.group_id,
    prediction_type: predictionType,
    predicted_outcome: predictionType === "group_stage" ? predictedOutcome : null,
    predicted_winner_team_id: predictionType === "group_stage" ? null : predictedWinnerTeamId,
    predicted_home_score: predictedHomeScore,
    predicted_away_score: predictedAwayScore,
    predicts_extra_time: predictionType === "group_stage" ? null : predictsExtraTime,
    predicts_penalties: predictionType === "group_stage" ? null : predictsPenalties,
    points_awarded: 0,
    updated_at: new Date().toISOString()
  });

  if (error) {
    redirectWithError("No se pudo guardar la prediccion faltante.");
  }

  revalidatePath("/admin/pendientes");
  revalidatePath("/dashboard");
  revalidatePath("/partidos");
  revalidatePath("/historial");
  revalidatePath("/ranking");
  revalidatePath("/inicio-admin");
  redirect("/admin/pendientes?saved=partido");
}

export async function saveAdminClassificationPrediction(formData: FormData) {
  await requireAdminProfile();

  const targetUserId = text(formData, "targetUserId");
  const tournamentGroup = text(formData, "tournamentGroup");
  const orderedTeamIds = text(formData, "orderedTeamIds")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!targetUserId || !tournamentGroup || orderedTeamIds.length !== 4 || new Set(orderedTeamIds).size !== 4) {
    redirectWithError("Clasificación incompleta");
  }

  const admin = createAdminClient();
  const [{ data: targetProfile }, { data: existing }, { data: teamRows }, { data: matchRows }, { data: resultRows }] = await Promise.all([
    admin.from("profiles").select("id,group_id,role").eq("id", targetUserId).single<{ id: string; group_id: string | null; role: string }>(),
    admin
      .from("group_classification_predictions")
      .select("id")
      .eq("user_id", targetUserId)
      .eq("tournament_group", tournamentGroup)
      .maybeSingle<{ id: string }>(),
    admin.from("teams").select("id,name,short_name,flag_url").order("name"),
    admin.from("matches").select("*").eq("phase", "group_stage"),
    admin.from("match_results").select("*")
  ]);

  if (!targetProfile || targetProfile.role !== "participant" || !targetProfile.group_id) {
    redirectWithError("Participante no encontrado");
  }

  if (existing) {
    redirectWithError("Ese participante ya tiene clasificación guardada para ese grupo");
  }

  const teams = (teamRows ?? []).map(
    (row): Team => ({
      id: row.id,
      name: row.name,
      shortName: row.short_name,
      flagUrl: row.flag_url ?? ""
    })
  );
  const classificationGroup = resolveClassificationGroups(teams).find((group) => group.code === tournamentGroup);
  const expectedTeamIds = classificationGroup?.teams.map((team) => team.id).filter((id): id is string => Boolean(id)) ?? [];
  const expectedSet = new Set(expectedTeamIds);

  if (expectedTeamIds.length !== 4 || orderedTeamIds.some((teamId) => !expectedSet.has(teamId))) {
    redirectWithError("Ese grupo no tiene equipos importados completos.");
  }

  const matches = (matchRows ?? []).map(mapMatchFromRow) satisfies Match[];
  const results = (resultRows ?? []).map((row) => ({
    matchId: row.match_id,
    homeScore90: row.home_score_90,
    awayScore90: row.away_score_90,
    homeScoreFinal: row.home_score_final,
    awayScoreFinal: row.away_score_final,
    winnerTeamId: row.winner_team_id,
    wentExtraTime: row.went_extra_time,
    wentPenalties: row.went_penalties
  })) satisfies MatchResult[];

  const score = scoreClassificationPrediction({
    groupCode: tournamentGroup,
    matches,
    orderedTeamIds,
    results
  });

  const { error } = await admin.from("group_classification_predictions").insert({
    user_id: targetUserId,
    app_group_id: targetProfile.group_id,
    tournament_group: tournamentGroup,
    ordered_team_ids: orderedTeamIds,
    points_awarded: score ?? 0,
    status: score === null ? "pending" : "scored",
    updated_at: new Date().toISOString()
  });

  if (error) {
    redirectWithError("No se pudo guardar la clasificación.");
  }

  revalidatePath("/admin/pendientes");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  revalidatePath("/partidos");
  revalidatePath("/inicio-admin");
  redirect("/admin/pendientes?saved=clasificacion");
}
