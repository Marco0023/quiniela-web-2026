"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/admin/auth";
import { recordBadgeEventsForMatch } from "@/lib/badge-events";
import { scoreCompletedClassificationPredictions } from "@/lib/classification/scoring-service";
import { propagateKnockoutResult } from "@/lib/knockout-bracket";
import { scorePrediction } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/pagination";
import type { ChampionPrediction, Match, MatchResult, Prediction } from "@/lib/types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function bool(formData: FormData, key: string) {
  return text(formData, key) === "true";
}

function toPrediction(row: {
  id: string;
  match_id: string;
  user_id: string;
  group_id: string;
  prediction_type: Prediction["predictionType"];
  predicted_outcome: Prediction["predictedOutcome"];
  predicted_winner_team_id: string | null;
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  predicts_extra_time: boolean | null;
  predicts_penalties: boolean | null;
  points_awarded: number;
  updated_at: string;
}): Prediction {
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    groupId: row.group_id,
    predictionType: row.prediction_type,
    predictedOutcome: row.predicted_outcome,
    predictedWinnerTeamId: row.predicted_winner_team_id,
    predictedHomeScore: row.predicted_home_score,
    predictedAwayScore: row.predicted_away_score,
    predictsExtraTime: row.predicts_extra_time,
    predictsPenalties: row.predicts_penalties,
    pointsAwarded: row.points_awarded,
    updatedAt: row.updated_at
  };
}

export async function saveMatchResult(formData: FormData) {
  await requireAdminProfile();

  const matchId = text(formData, "matchId");
  const returnTo = text(formData, "returnTo");
  const redirectPath = returnTo === "/inicio-admin" ? "/inicio-admin" : "/admin/resultados";
  const redirectWithError = (message: string): never => redirect(`${redirectPath}?error=${encodeURIComponent(message)}`);
  if (!matchId) redirectWithError("Partido no encontrado");

  const admin = createAdminClient();
  const { data: matchRow } = await admin.from("matches").select("*").eq("id", matchId).single<{
    id: string;
    phase: Match["phase"];
    match_number: number;
    home_team_id: string | null;
    away_team_id: string | null;
    home_placeholder: string | null;
    away_placeholder: string | null;
    kickoff_at: string;
    tournament_group: string | null;
    status: Match["status"];
  }>();

  if (!matchRow) redirectWithError("Partido no encontrado");
  const matchData = matchRow!;

  const homeScore90 = optionalNumber(formData, "homeScore90");
  const awayScore90 = optionalNumber(formData, "awayScore90");
  const winnerTeamId = text(formData, "winnerTeamId") || null;
  const wentExtraTime = bool(formData, "wentExtraTime");
  const wentPenalties = bool(formData, "wentPenalties");

  if (homeScore90 === null || awayScore90 === null) {
    redirectWithError("Ingresa marcador de 90 minutos.");
  }

  if (matchData.phase !== "group_stage" && !winnerTeamId) {
    redirectWithError("Selecciona ganador o quién avanza.");
  }
  if (winnerTeamId && ![matchData.home_team_id, matchData.away_team_id].includes(winnerTeamId)) {
    redirectWithError("El ganador no pertenece a este partido.");
  }

  const computedWinner =
    winnerTeamId ??
    (homeScore90 !== null && awayScore90 !== null && homeScore90 > awayScore90
      ? matchData.home_team_id
      : homeScore90 !== null && awayScore90 !== null && awayScore90 > homeScore90
        ? matchData.away_team_id
        : null);

  const resultPayload = {
    match_id: matchId,
    home_score_90: homeScore90,
    away_score_90: awayScore90,
    home_score_final: homeScore90,
    away_score_final: awayScore90,
    winner_team_id: computedWinner,
    went_extra_time: wentExtraTime,
    went_penalties: wentPenalties,
    penalty_winner_team_id: wentPenalties ? computedWinner : null,
    is_manual_override: true,
    updated_at: new Date().toISOString()
  };

  const { error: resultError } = await admin.from("match_results").upsert(resultPayload, { onConflict: "match_id" });
  if (resultError) {
    redirectWithError("No se pudo guardar el resultado.");
  }

  await admin.from("matches").update({ status: "finished", updated_at: new Date().toISOString() }).eq("id", matchId);
  if (matchData.phase !== "group_stage") {
    await propagateKnockoutResult({
      admin,
      awayTeamId: matchData.away_team_id,
      homeTeamId: matchData.home_team_id,
      matchNumber: matchData.match_number,
      winnerTeamId: computedWinner
    });
  }

  const { data: predictionRows } = await admin.from("match_predictions").select("*").eq("match_id", matchId);
  const { data: championRows } = await admin.from("champion_predictions").select("user_id,team_id,created_at");
  const champions = new Map(
    (championRows ?? []).map((row) => [
      row.user_id,
      { userId: row.user_id, teamId: row.team_id, createdAt: row.created_at } satisfies ChampionPrediction
    ])
  );

  const match: Match = {
    id: matchData.id,
    phase: matchData.phase,
    matchNumber: matchData.match_number,
    homeTeamId: matchData.home_team_id,
    awayTeamId: matchData.away_team_id,
    homePlaceholder: matchData.home_placeholder ?? undefined,
    awayPlaceholder: matchData.away_placeholder ?? undefined,
    kickoffAt: matchData.kickoff_at,
    tournamentGroup: matchData.tournament_group,
    status: "finished"
  };

  const result: MatchResult = {
    matchId,
    homeScore90,
    awayScore90,
    homeScoreFinal: homeScore90,
    awayScoreFinal: awayScore90,
    winnerTeamId: computedWinner,
    wentExtraTime,
    wentPenalties
  };

  for (const row of predictionRows ?? []) {
    const prediction = toPrediction(row);
    const breakdown = scorePrediction({
      match,
      result,
      prediction,
      championPrediction: champions.get(prediction.userId) ?? null,
      worldChampionTeamId: match.phase === "final" ? computedWinner : null
    });

    await admin
      .from("match_predictions")
      .update({ points_awarded: breakdown.totalPoints, status: "scored", updated_at: new Date().toISOString() })
      .eq("id", prediction.id);

    await admin.from("prediction_score_breakdown").delete().eq("prediction_id", prediction.id);
    await admin.from("prediction_score_breakdown").insert({
      prediction_id: prediction.id,
      winner_points: breakdown.winnerPoints,
      exact_score_points: breakdown.exactScorePoints,
      goal_difference_points: breakdown.goalDifferencePoints,
      extra_time_points: breakdown.extraTimePoints,
      penalties_points: breakdown.penaltiesPoints,
      champion_points: breakdown.championPoints,
      champion_bonus_points: breakdown.championBonusPoints,
      total_points: breakdown.totalPoints
    });
  }

  const classificationPredictionsScored = await scoreCompletedClassificationPredictions(admin);
  await recordRankingSnapshots(admin, matchId);
  await recordBadgeEventsForMatch(admin, matchId);

  await admin.from("sync_logs").insert({
    provider: "manual",
    sync_type: "results",
    status: "success",
    message: `Resultado manual guardado para partido ${matchData.match_number}.`,
    metadata: {
      matchId,
      predictionsScored: predictionRows?.length ?? 0,
      classificationPredictionsScored
    }
  });

  revalidatePath("/admin/resultados");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  revalidatePath("/historial");
  revalidatePath("/inicio-admin");
  revalidatePath("/partidos");
  redirect(`${redirectPath}?saved=1`);
}

async function recordRankingSnapshots(admin: ReturnType<typeof createAdminClient>, matchId: string) {
  const [{ data: profileRows }, predictionRows] = await Promise.all([
    admin.from("profiles").select("id,group_id,role").eq("role", "participant"),
    fetchAllRows<{ user_id: string; group_id: string; points_awarded: number }>(() =>
      admin.from("match_predictions").select("user_id,group_id,points_awarded").order("user_id", { ascending: true })
    )
  ]);
  const classificationRows = await fetchAllRows<{ user_id: string; app_group_id: string; points_awarded: number }>(() =>
    admin.from("group_classification_predictions").select("user_id,app_group_id,points_awarded").order("user_id", { ascending: true })
  );

  const usersByGroup = new Map<string, { id: string; group_id: string }[]>();
  for (const profile of profileRows ?? []) {
    if (!profile.group_id) continue;
    const users = usersByGroup.get(profile.group_id) ?? [];
    users.push({ id: profile.id, group_id: profile.group_id });
    usersByGroup.set(profile.group_id, users);
  }

  const snapshots = [...usersByGroup.entries()].flatMap(([groupId, users]) => {
    const rankedRows = users
      .map((user) => ({
        userId: user.id,
        groupId,
        points: predictionRows
          .filter((prediction) => prediction.user_id === user.id)
          .reduce((total, prediction) => total + Number(prediction.points_awarded ?? 0), 0) +
          classificationRows
            .filter((prediction) => prediction.user_id === user.id)
            .reduce((total, prediction) => total + Number(prediction.points_awarded ?? 0), 0)
      }))
      .sort((a, b) => b.points - a.points);

    let lastPoints: number | null = null;
    let lastRank = 0;

    const rankedWithTies = rankedRows.map((row, index) => {
      const rank = lastPoints === row.points ? lastRank : index + 1;
      lastPoints = row.points;
      lastRank = rank;

      return {
        group_id: row.groupId,
        user_id: row.userId,
        match_id: matchId,
        rank,
        points: row.points,
        total_participants: users.length,
        created_at: new Date().toISOString()
      };
    });

    return rankedWithTies;
  });

  if (snapshots.length === 0) return;

  await admin.from("ranking_snapshots").upsert(snapshots, { onConflict: "group_id,user_id,match_id" });
}
