import { evaluateBadgesForUser, liveBadgeIds, type BadgeId } from "@/lib/badges";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChampionPrediction, Match, MatchResult, Prediction, Profile, RankingSnapshot } from "@/lib/types";

type AdminClient = ReturnType<typeof createAdminClient>;

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  alias: string;
  email: string;
  role: Profile["role"];
  group_id: string | null;
  timezone_country: string;
  timezone: string;
};

type MatchRow = {
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

type ResultRow = {
  match_id: string;
  home_score_90: number | null;
  away_score_90: number | null;
  home_score_final: number | null;
  away_score_final: number | null;
  winner_team_id: string | null;
  went_extra_time: boolean | null;
  went_penalties: boolean | null;
  updated_at?: string;
};

type ChampionRow = {
  user_id: string;
  team_id: string;
  created_at: string;
};

type RankingSnapshotRow = {
  group_id: string;
  user_id: string;
  match_id: string;
  rank: number;
  points: number;
  total_participants: number;
  created_at: string;
};

type ClassificationPredictionRow = {
  user_id: string;
  app_group_id: string;
  points_awarded: number;
};

type RankingRow = {
  user: { id: string };
  points: number;
  rank: number;
};

export async function recordBadgeEventsForMatch(admin: AdminClient, matchId: string) {
  const [
    profilesResponse,
    matchesResponse,
    resultsResponse,
    predictionsResponse,
    championsResponse,
    snapshotsResponse,
    classificationsResponse
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("role", "participant"),
    admin.from("matches").select("*").order("kickoff_at"),
    admin.from("match_results").select("*"),
    admin.from("match_predictions").select("*"),
    admin.from("champion_predictions").select("user_id,team_id,created_at"),
    admin.from("ranking_snapshots").select("*").order("created_at", { ascending: true }),
    admin.from("group_classification_predictions").select("user_id,app_group_id,points_awarded")
  ]);

  const profiles = ((profilesResponse.data as ProfileRow[] | null) ?? []).map(mapProfile).filter((profile) => profile.groupId);
  const matches = ((matchesResponse.data as MatchRow[] | null) ?? []).map(mapMatch);
  const results = ((resultsResponse.data as ResultRow[] | null) ?? []).map(mapResult);
  const predictions = ((predictionsResponse.data as PredictionRow[] | null) ?? []).map(mapPrediction);
  const championPredictions = ((championsResponse.data as ChampionRow[] | null) ?? []).map(mapChampion);
  const rankingSnapshots = ((snapshotsResponse.data as RankingSnapshotRow[] | null) ?? []).map(mapRankingSnapshot);
  const classificationRows = (classificationsResponse.data as ClassificationPredictionRow[] | null) ?? [];
  const match = matches.find((item) => item.id === matchId);

  if (!match) return;

  const afterRanking = buildRanking(profiles, predictions, classificationRows);
  const beforeRanking = buildRanking(
    profiles,
    predictions.map((prediction) =>
      prediction.matchId === matchId ? { ...prediction, pointsAwarded: 0 } : prediction
    ),
    classificationRows
  );
  const afterResults = results;
  const beforeResults = results.filter((result) => result.matchId !== matchId);
  const afterSnapshots = rankingSnapshots;
  const beforeSnapshots = rankingSnapshots.filter((snapshot) => snapshot.matchId !== matchId);
  const finalResult = match.phase === "final" ? results.find((result) => result.matchId === matchId) : null;
  const rows = [];

  for (const profile of profiles) {
    if (!profile.groupId) continue;

    const groupUserIds = new Set(profiles.filter((user) => user.groupId === profile.groupId).map((user) => user.id));
    const groupPredictions = predictions.filter((prediction) => groupUserIds.has(prediction.userId));
    const groupChampionPredictions = championPredictions.filter((prediction) => groupUserIds.has(prediction.userId));

    const beforeBadges = new Set(
      evaluateBadgesForUser({
        userId: profile.id,
        ranking: beforeRanking.get(profile.groupId) ?? [],
        matches,
        results: beforeResults,
        predictions: groupPredictions,
        championPredictions: groupChampionPredictions,
        rankingSnapshots: beforeSnapshots.filter((snapshot) => snapshot.groupId === profile.groupId),
        worldChampionTeamId: null
      }).map((badge) => badge.id)
    );

    const afterBadges = evaluateBadgesForUser({
      userId: profile.id,
      ranking: afterRanking.get(profile.groupId) ?? [],
      matches,
      results: afterResults,
      predictions: groupPredictions,
      championPredictions: groupChampionPredictions,
      rankingSnapshots: afterSnapshots.filter((snapshot) => snapshot.groupId === profile.groupId),
      worldChampionTeamId: finalResult?.winnerTeamId ?? null
    });

    for (const badge of afterBadges) {
      if (!liveBadgeIds.has(badge.id) && beforeBadges.has(badge.id)) continue;
      if (
        badge.id === "missed_three_predictions" &&
        predictions.some((prediction) => prediction.userId === profile.id && prediction.matchId === matchId)
      ) {
        continue;
      }
      rows.push({
        group_id: profile.groupId,
        user_id: profile.id,
        match_id: matchId,
        badge_id: badge.id,
        event_key: `${matchId}:${profile.id}:${badge.id}`
      });
    }
  }

  if (rows.length === 0) return;

  const { error } = await admin.from("badge_events").upsert(rows, { onConflict: "event_key" });
  if (error) {
    console.error("No se pudieron registrar insignias:", error.message);
  }
}

function buildRanking(
  profiles: Profile[],
  predictions: Prediction[],
  classificationRows: ClassificationPredictionRow[]
) {
  const rankingByGroup = new Map<string, RankingRow[]>();
  const groupIds = [...new Set(profiles.map((profile) => profile.groupId).filter((groupId): groupId is string => Boolean(groupId)))];

  for (const groupId of groupIds) {
    const rows = profiles
      .filter((profile) => profile.groupId === groupId)
      .map((profile) => ({
        user: { id: profile.id },
        points:
          predictions
            .filter((prediction) => prediction.userId === profile.id)
            .reduce((total, prediction) => total + prediction.pointsAwarded, 0) +
          classificationRows
            .filter((prediction) => prediction.user_id === profile.id)
            .reduce((total, prediction) => total + Number(prediction.points_awarded ?? 0), 0)
      }))
      .sort((a, b) => b.points - a.points);

    let lastPoints: number | null = null;
    let lastRank = 0;
    rankingByGroup.set(
      groupId,
      rows.map((row, index) => {
        const rank = lastPoints === row.points ? lastRank : index + 1;
        lastPoints = row.points;
        lastRank = rank;
        return { ...row, rank };
      })
    );
  }

  return rankingByGroup;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    alias: row.alias,
    email: row.email,
    role: row.role,
    groupId: row.group_id,
    timezoneCountry: row.timezone_country,
    timezone: row.timezone
  };
}

function mapMatch(row: MatchRow): Match {
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

function mapPrediction(row: PredictionRow): Prediction {
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

function mapResult(row: ResultRow): MatchResult {
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

function mapChampion(row: ChampionRow): ChampionPrediction {
  return {
    userId: row.user_id,
    teamId: row.team_id,
    createdAt: row.created_at
  };
}

function mapRankingSnapshot(row: RankingSnapshotRow): RankingSnapshot {
  return {
    groupId: row.group_id,
    userId: row.user_id,
    matchId: row.match_id,
    rank: row.rank,
    points: row.points,
    totalParticipants: row.total_participants,
    createdAt: row.created_at
  };
}
