import { scoreCompletedClassificationPredictions } from "@/lib/classification/scoring-service";
import { recordBadgeEventsForMatch } from "@/lib/badge-events";
import { scorePrediction } from "@/lib/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/pagination";
import type { FootballApiProvider, SyncedMatch, SyncedResult, SyncedTeam } from "@/lib/football-api/provider";
import type { ChampionPrediction, Match, MatchResult, Prediction } from "@/lib/types";

type SyncType = "teams" | "matches" | "results" | "full";

type TeamRow = {
  id: string;
  api_id: string | null;
};

type MatchRow = {
  id: string;
  api_id: string | null;
  phase: Match["phase"];
  match_number: number;
  home_team_id: string | null;
  away_team_id: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  kickoff_at: string;
  tournament_group: string | null;
  status: Match["status"];
};

type PredictionRow = {
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
};

export async function runFootballSync(provider: FootballApiProvider, syncType: SyncType = "full") {
  const admin = createAdminClient();
  const metadata = {
    teams: 0,
    teamsUpserted: 0,
    matches: 0,
    matchesUpserted: 0,
    results: 0,
    resultsUpserted: 0,
    resultsSkippedByManualOverride: 0,
    predictionsScored: 0
  };

  let syncedTeams: SyncedTeam[] = [];
  let syncedMatches: SyncedMatch[] = [];
  let syncedResults: SyncedResult[] = [];

  if (syncType === "teams" || syncType === "full") {
    syncedTeams = await provider.syncTeams();
    metadata.teams = syncedTeams.length;
    metadata.teamsUpserted = await upsertTeams(admin, syncedTeams);
  }

  if (syncType === "matches" || syncType === "results" || syncType === "full") {
    syncedMatches = await provider.syncMatches();
    const embeddedTeams = teamsFromMatches(syncedMatches);
    if (embeddedTeams.length > 0) {
      metadata.teamsUpserted += await upsertTeams(admin, embeddedTeams);
    }

    if (syncType === "matches" || syncType === "full") {
      metadata.matches = syncedMatches.length;
      metadata.matchesUpserted = await upsertMatches(admin, syncedMatches);
    }
  }

  if (syncType === "results" || syncType === "full") {
    syncedResults = await provider.syncResults();
    metadata.results = syncedResults.length;
    const resultStats = await upsertResultsAndScore(admin, syncedResults);
    metadata.resultsUpserted = resultStats.resultsUpserted;
    metadata.resultsSkippedByManualOverride = resultStats.resultsSkippedByManualOverride;
    metadata.predictionsScored = resultStats.predictionsScored;
  }

  return metadata;
}

async function upsertTeams(admin: ReturnType<typeof createAdminClient>, teams: SyncedTeam[]) {
  const uniqueTeams = [...new Map(teams.map((team) => [team.apiId, team])).values()];
  if (uniqueTeams.length === 0) return 0;

  const { error } = await admin.from("teams").upsert(
    uniqueTeams.map((team) => ({
      api_id: team.apiId,
      name: team.name,
      short_name: team.shortName,
      flag_url: team.flagUrl,
      tournament_group: team.groupCode ?? null,
      updated_at: new Date().toISOString()
    })),
    { onConflict: "api_id" }
  );

  if (error) throw new Error(`No se pudieron sincronizar equipos: ${error.message}`);
  return uniqueTeams.length;
}

async function upsertMatches(admin: ReturnType<typeof createAdminClient>, matches: SyncedMatch[]) {
  if (matches.length === 0) return 0;

  const teamIds = await getTeamIdsByApiId(admin);
  const payload = matches.map((match) => ({
    api_id: match.apiId,
    phase: match.phase,
    match_number: match.matchNumber,
    home_team_id: match.homeTeam ? teamIds.get(match.homeTeam.apiId) ?? null : null,
    away_team_id: match.awayTeam ? teamIds.get(match.awayTeam.apiId) ?? null : null,
    home_placeholder: match.homePlaceholder,
    away_placeholder: match.awayPlaceholder,
    kickoff_at: match.kickoffAt,
    status: match.status,
    tournament_group: match.groupCode ?? null,
    updated_at: new Date().toISOString()
  }));

  const { error } = await admin.from("matches").upsert(payload, { onConflict: "api_id" });
  if (error) throw new Error(`No se pudieron sincronizar partidos: ${error.message}`);
  return matches.length;
}

async function upsertResultsAndScore(admin: ReturnType<typeof createAdminClient>, results: SyncedResult[]) {
  if (results.length === 0) {
    return {
      resultsUpserted: 0,
      resultsSkippedByManualOverride: 0,
      predictionsScored: 0
    };
  }

  const [{ data: matchRows }, { data: resultRows }] = await Promise.all([
    admin.from("matches").select("*").in("api_id", results.map((result) => result.matchApiId)),
    admin.from("match_results").select("match_id,is_manual_override")
  ]);

  const matchesByApiId = new Map((matchRows as MatchRow[] | null ?? []).filter((row) => row.api_id).map((row) => [row.api_id as string, row]));
  const manualResultIds = new Set(
    (resultRows as { match_id: string; is_manual_override: boolean }[] | null ?? [])
      .filter((row) => row.is_manual_override)
      .map((row) => row.match_id)
  );
  const teamIds = await getTeamIdsByApiId(admin);

  let resultsUpserted = 0;
  let resultsSkippedByManualOverride = 0;
  let predictionsScored = 0;

  for (const result of results) {
    const matchRow = matchesByApiId.get(result.matchApiId);
    if (!matchRow) continue;
    if (manualResultIds.has(matchRow.id)) {
      resultsSkippedByManualOverride += 1;
      continue;
    }

    const winnerTeamId = result.winnerTeamApiId ? teamIds.get(result.winnerTeamApiId) ?? null : null;
    const penaltyWinnerTeamId = result.penaltyWinnerTeamApiId ? teamIds.get(result.penaltyWinnerTeamApiId) ?? null : null;

    const { error } = await admin.from("match_results").upsert(
      {
        match_id: matchRow.id,
        home_score_90: result.homeScore90,
        away_score_90: result.awayScore90,
        home_score_final: result.homeScoreFinal,
        away_score_final: result.awayScoreFinal,
        winner_team_id: winnerTeamId,
        went_extra_time: result.wentExtraTime,
        went_penalties: result.wentPenalties,
        penalty_winner_team_id: penaltyWinnerTeamId,
        is_manual_override: false,
        updated_at: new Date().toISOString()
      },
      { onConflict: "match_id" }
    );

    if (error) throw new Error(`No se pudo guardar resultado del partido ${result.matchApiId}: ${error.message}`);

    if (result.status === "finished") {
      await admin.from("matches").update({ status: "finished", updated_at: new Date().toISOString() }).eq("id", matchRow.id);
      predictionsScored += await scoreMatchPredictions(admin, matchRow, {
        matchId: matchRow.id,
        homeScore90: result.homeScore90,
        awayScore90: result.awayScore90,
        homeScoreFinal: result.homeScoreFinal,
        awayScoreFinal: result.awayScoreFinal,
        winnerTeamId,
        wentExtraTime: result.wentExtraTime,
        wentPenalties: result.wentPenalties
      });
    }

    resultsUpserted += 1;
  }

  return {
    resultsUpserted,
    resultsSkippedByManualOverride,
    predictionsScored
  };
}

async function scoreMatchPredictions(admin: ReturnType<typeof createAdminClient>, matchRow: MatchRow, result: MatchResult) {
  const [{ data: predictionRows }, { data: championRows }] = await Promise.all([
    admin.from("match_predictions").select("*").eq("match_id", matchRow.id),
    admin.from("champion_predictions").select("user_id,team_id,created_at")
  ]);

  const champions = new Map(
    (championRows ?? []).map((row) => [
      row.user_id,
      { userId: row.user_id, teamId: row.team_id, createdAt: row.created_at } satisfies ChampionPrediction
    ])
  );

  const match: Match = {
    id: matchRow.id,
    phase: matchRow.phase,
    matchNumber: matchRow.match_number,
    homeTeamId: matchRow.home_team_id,
    awayTeamId: matchRow.away_team_id,
    homePlaceholder: matchRow.home_placeholder ?? undefined,
    awayPlaceholder: matchRow.away_placeholder ?? undefined,
    kickoffAt: matchRow.kickoff_at,
    tournamentGroup: matchRow.tournament_group,
    status: "finished"
  };

  for (const row of predictionRows as PredictionRow[] | null ?? []) {
    const prediction = toPrediction(row);
    const breakdown = scorePrediction({
      match,
      result,
      prediction,
      championPrediction: champions.get(prediction.userId) ?? null,
      worldChampionTeamId: match.phase === "final" ? result.winnerTeamId : null
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

  await scoreCompletedClassificationPredictions(admin);
  await recordRankingSnapshots(admin, matchRow.id);
  await recordBadgeEventsForMatch(admin, matchRow.id);
  return predictionRows?.length ?? 0;
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

    return rankedRows.map((row, index) => {
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
  });

  if (snapshots.length === 0) return;
  await admin.from("ranking_snapshots").upsert(snapshots, { onConflict: "group_id,user_id,match_id" });
}

async function getTeamIdsByApiId(admin: ReturnType<typeof createAdminClient>) {
  const { data, error } = await admin.from("teams").select("id,api_id").not("api_id", "is", null);
  if (error) throw new Error(`No se pudieron leer equipos sincronizados: ${error.message}`);

  return new Map((data as TeamRow[] | null ?? []).filter((row) => row.api_id).map((row) => [row.api_id as string, row.id]));
}

function teamsFromMatches(matches: SyncedMatch[]) {
  const teams = matches.flatMap((match) => [match.homeTeam, match.awayTeam]).filter((team): team is SyncedTeam => Boolean(team));
  return [...new Map(teams.map((team) => [team.apiId, team])).values()];
}

function toPrediction(row: PredictionRow): Prediction {
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
