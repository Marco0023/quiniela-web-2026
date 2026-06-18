"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/admin/auth";
import { resolveClassificationGroups } from "@/lib/classification/groups";
import { scoreClassificationPrediction } from "@/lib/classification/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Match, MatchResult, Team } from "@/lib/types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function redirectWithError(message: string): never {
  redirect(`/admin/pendientes?error=${encodeURIComponent(message)}`);
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
  redirect("/admin/pendientes?saved=clasificacion");
}
