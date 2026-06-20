"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isClassificationLocked, scoreClassificationPrediction } from "@/lib/classification/rules";
import { getCurrentProfile } from "@/lib/repository";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Match, MatchResult } from "@/lib/types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveGroupClassificationPrediction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.groupId) redirect("/partidos?tab=classification&error=Grupo no encontrado");

  const tournamentGroup = text(formData, "tournamentGroup");
  const orderedTeamIds = text(formData, "orderedTeamIds")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!tournamentGroup || orderedTeamIds.length !== 4 || new Set(orderedTeamIds).size !== 4) {
    redirect("/partidos?tab=classification&error=Clasificación incompleta");
  }

  const admin = createAdminClient();
  const [{ data: matchRows }, { data: resultRows }] = await Promise.all([
    admin.from("matches").select("*").eq("phase", "group_stage"),
    admin.from("match_results").select("*")
  ]);
  const matches = (matchRows ?? []).map((row) => ({
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
  })) satisfies Match[];
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

  if (isClassificationLocked(tournamentGroup, matches)) {
    redirect("/partidos?tab=classification&error=La clasificación de este grupo ya está cerrada.");
  }

  const score = scoreClassificationPrediction({
    groupCode: tournamentGroup,
    matches,
    orderedTeamIds,
    results
  });
  const pointsAwarded = score ?? 0;
  const status = score === null ? "pending" : "scored";

  const { error } = await admin.from("group_classification_predictions").upsert(
    {
      user_id: profile.id,
      app_group_id: profile.groupId,
      tournament_group: tournamentGroup,
      ordered_team_ids: orderedTeamIds,
      points_awarded: pointsAwarded,
      status,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,tournament_group" }
  );

  if (error) redirect(`/partidos?tab=classification&error=${encodeURIComponent("No se pudo guardar la clasificación.")}`);

  revalidatePath("/partidos");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  revalidatePath("/inicio-admin");
  redirect(`/partidos?tab=classification&saved=clasificacion&group=${encodeURIComponent(tournamentGroup)}`);
}
