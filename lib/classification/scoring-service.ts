import { groupCodeFromLabel, scoreClassificationPrediction } from "@/lib/classification/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Match, MatchResult } from "@/lib/types";

export async function scoreCompletedClassificationPredictions(admin: ReturnType<typeof createAdminClient>) {
  const [{ data: matchRows }, { data: resultRows }, { data: predictionRows }] = await Promise.all([
    admin.from("matches").select("*").eq("phase", "group_stage"),
    admin.from("match_results").select("*"),
    admin.from("group_classification_predictions").select("*")
  ]);

  const matches = (matchRows ?? []).map(mapMatchRow);
  const results = (resultRows ?? []).map(mapResultRow);
  let updated = 0;

  for (const prediction of predictionRows ?? []) {
    const score = scoreClassificationPrediction({
      groupCode: prediction.tournament_group,
      matches,
      orderedTeamIds: prediction.ordered_team_ids ?? [],
      results
    });

    if (score === null) continue;

    await admin
      .from("group_classification_predictions")
      .update({ points_awarded: score, status: "scored", updated_at: new Date().toISOString() })
      .eq("id", prediction.id);
    updated += 1;
  }

  return updated;
}

export function groupCodeForMatch(match: Match) {
  return groupCodeFromLabel(match.tournamentGroup);
}

function mapMatchRow(row: {
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

function mapResultRow(row: {
  match_id: string;
  home_score_90: number | null;
  away_score_90: number | null;
  home_score_final: number | null;
  away_score_final: number | null;
  winner_team_id: string | null;
  went_extra_time: boolean | null;
  went_penalties: boolean | null;
}): MatchResult {
  return {
    matchId: row.match_id,
    homeScore90: row.home_score_90,
    awayScore90: row.away_score_90,
    homeScoreFinal: row.home_score_final,
    awayScoreFinal: row.away_score_final,
    winnerTeamId: row.winner_team_id,
    wentExtraTime: row.went_extra_time,
    wentPenalties: row.went_penalties
  };
}
