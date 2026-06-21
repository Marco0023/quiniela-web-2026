import { redirect } from "next/navigation";
import { championPredictions, currentUser, matches as mockMatches, predictions as mockPredictions, profiles, teams as mockTeams } from "@/lib/mock-data";
import { GROUPS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllRows } from "@/lib/supabase/pagination";
import { createClient } from "@/lib/supabase/server";
import type {
  ChampionPrediction,
  BadgeEvent,
  Group,
  GroupClassificationPrediction,
  Match,
  MatchResult,
  Prediction,
  Profile,
  RankingSnapshot,
  Team
} from "@/lib/types";

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

type GroupRow = {
  id: string;
  name: string;
  invite_code: string;
};

type TeamRow = {
  id: string;
  api_id?: string | null;
  name: string;
  short_name: string;
  flag_url: string | null;
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

type ChampionRow = {
  user_id: string;
  team_id: string;
  created_at: string;
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
  tournament_group: string;
  ordered_team_ids: string[];
  points_awarded: number;
  status: GroupClassificationPrediction["status"];
  updated_at: string;
};

type BadgeEventRow = {
  id: string;
  group_id: string;
  user_id: string;
  match_id: string | null;
  badge_id: string;
  event_key: string;
  created_at: string;
};

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

function mapGroup(row: GroupRow): Group {
  return {
    id: row.id,
    slug: row.id as Group["slug"],
    name: row.name,
    inviteCode: row.invite_code
  };
}

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    flagUrl: row.flag_url ?? ""
  };
}

function sortTeamsBySpanishName(teams: Team[]) {
  return [...teams].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
}

function uniqueTeamRowsBySpanishName(rows: TeamRow[]) {
  const teams = new Map<string, TeamRow>();

  for (const row of rows) {
    const key = row.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    const current = teams.get(key);
    const currentIsApiTeam = current?.api_id?.startsWith("football-data:");
    const nextIsApiTeam = row.api_id?.startsWith("football-data:");

    if (!current || (!currentIsApiTeam && nextIsApiTeam)) {
      teams.set(key, row);
    }
  }

  return [...teams.values()];
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

function mapChampion(row: ChampionRow): ChampionPrediction {
  return {
    userId: row.user_id,
    teamId: row.team_id,
    createdAt: row.created_at
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
    wentPenalties: row.went_penalties,
    updatedAt: row.updated_at
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

function mapClassificationPrediction(row: ClassificationPredictionRow): GroupClassificationPrediction {
  return {
    userId: row.user_id,
    groupId: row.app_group_id,
    tournamentGroup: row.tournament_group,
    orderedTeamIds: row.ordered_team_ids,
    pointsAwarded: row.points_awarded,
    status: row.status,
    updatedAt: row.updated_at
  };
}

function mapBadgeEvent(row: BadgeEventRow): BadgeEvent {
  return {
    id: row.id,
    groupId: row.group_id,
    userId: row.user_id,
    matchId: row.match_id,
    badgeId: row.badge_id,
    eventKey: row.event_key,
    createdAt: row.created_at
  };
}

function filterContradictoryMissedPredictionEvents(events: BadgeEvent[], predictions: Prediction[]) {
  return events.filter((event) => {
    if (event.badgeId !== "missed_three_predictions" || !event.matchId) return true;
    return !predictions.some((prediction) => prediction.userId === event.userId && prediction.matchId === event.matchId);
  });
}

async function getSessionUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").select("*").eq("id", user.id).single<ProfileRow>();
  if (error || !data) redirect("/login");
  return mapProfile(data);
}

export async function getTeams() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("teams").select("id,api_id,name,short_name,flag_url").order("name");
    if (error || !data || data.length === 0) return sortTeamsBySpanishName(mockTeams);
    return sortTeamsBySpanishName(uniqueTeamRowsBySpanishName(data as TeamRow[]).map(mapTeam));
  } catch {
    return sortTeamsBySpanishName(mockTeams);
  }
}

export async function getMatches() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("matches").select("*").order("kickoff_at");
    if (error || !data || data.length === 0) return mockMatches;
    return (data as MatchRow[]).map(mapMatch);
  } catch {
    return mockMatches;
  }
}

export async function getAdminResultsData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [teamsResponse, matchesResponse, resultsResponse] = await Promise.all([
    admin.from("teams").select("id,name,short_name,flag_url").order("name"),
    admin.from("matches").select("*").order("kickoff_at"),
    admin.from("match_results").select("*")
  ]);

  const resultsByMatchId = new Map(
    (resultsResponse.data ?? []).map((result) => [
      result.match_id as string,
      {
        matchId: result.match_id as string,
        homeScore90: result.home_score_90 as number | null,
        awayScore90: result.away_score_90 as number | null,
        homeScoreFinal: result.home_score_final as number | null,
        awayScoreFinal: result.away_score_final as number | null,
        winnerTeamId: result.winner_team_id as string | null,
        wentExtraTime: result.went_extra_time as boolean | null,
        wentPenalties: result.went_penalties as boolean | null
      }
    ])
  );

  const teams =
    teamsResponse.data && teamsResponse.data.length > 0
      ? sortTeamsBySpanishName((teamsResponse.data as TeamRow[]).map(mapTeam))
      : sortTeamsBySpanishName(mockTeams);
  const matches = matchesResponse.data && matchesResponse.data.length > 0 ? (matchesResponse.data as MatchRow[]).map(mapMatch) : mockMatches;
  const sortedMatches = [...matches].sort((a, b) => {
    const aHasResult = resultsByMatchId.has(a.id);
    const bHasResult = resultsByMatchId.has(b.id);
    if (aHasResult !== bHasResult) return aHasResult ? 1 : -1;
    return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
  });

  return {
    profile,
    teams,
    matches: sortedMatches,
    resultsByMatchId
  };
}

export async function getAdminOverviewData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [
    usersResponse,
    predictionsResponse,
    matchesResponse,
    finishedMatchesResponse,
    pendingPredictionsResponse,
    logsResponse
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("match_predictions").select("id", { count: "exact", head: true }),
    admin.from("matches").select("id", { count: "exact", head: true }),
    admin.from("matches").select("id", { count: "exact", head: true }).eq("status", "finished"),
    admin.from("match_predictions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("sync_logs").select("id", { count: "exact", head: true })
  ]);

  return {
    profile,
    stats: {
      users: usersResponse.count ?? 0,
      predictions: predictionsResponse.count ?? 0,
      matches: matchesResponse.count ?? 0,
      finishedMatches: finishedMatchesResponse.count ?? 0,
      pendingPredictions: pendingPredictionsResponse.count ?? 0,
      logs: logsResponse.count ?? 0
    }
  };
}

export async function getAdminHomeData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [
    groupsResponse,
    profilesResponse,
    teamsResponse,
    matchesResponse,
    predictionRows,
    resultsResponse,
    classificationPredictionRows,
    badgeEventRows
  ] = await Promise.all([
    admin.from("groups").select("id,name,invite_code").order("name"),
    admin.from("profiles").select("*").eq("role", "participant").order("alias"),
    admin.from("teams").select("id,name,short_name,flag_url").order("name"),
    admin.from("matches").select("*").order("kickoff_at"),
    fetchAllRows<PredictionRow>(() => admin.from("match_predictions").select("*").order("updated_at", { ascending: true })),
    admin.from("match_results").select("*"),
    fetchAllRows<ClassificationPredictionRow>(() =>
      admin.from("group_classification_predictions").select("*").order("updated_at", { ascending: true })
    ),
    fetchAllRows<BadgeEventRow>(() => admin.from("badge_events").select("*").order("created_at", { ascending: false }))
  ]);

  const groups = groupsResponse.data ? (groupsResponse.data as GroupRow[]).map(mapGroup) : [];
  const users = profilesResponse.data ? (profilesResponse.data as ProfileRow[]).map(mapProfile) : [];
  const teams =
    teamsResponse.data && teamsResponse.data.length > 0
      ? sortTeamsBySpanishName((teamsResponse.data as TeamRow[]).map(mapTeam))
      : sortTeamsBySpanishName(mockTeams);
  const matches =
    matchesResponse.data && matchesResponse.data.length > 0 ? (matchesResponse.data as MatchRow[]).map(mapMatch) : mockMatches;
  const predictions = predictionRows.map(mapPrediction);
  const results = resultsResponse.data ? (resultsResponse.data as ResultRow[]).map(mapResult) : [];
  const classificationPredictions = classificationPredictionRows.map(mapClassificationPrediction);
  const rawBadgeEvents = badgeEventRows.map(mapBadgeEvent);
  const badgeEvents = filterContradictoryMissedPredictionEvents(rawBadgeEvents, predictions);
  const todayKey = dateKeyInTimezone(new Date(), profile.timezone);
  const todayMatches = matches.filter((match) => dateKeyInTimezone(new Date(match.kickoffAt), profile.timezone) === todayKey);
  const closedWithoutResults = matches
    .filter((match) => new Date(match.kickoffAt).getTime() <= Date.now() && !results.some((result) => result.matchId === match.id))
    .sort((a, b) => Math.abs(new Date(a.kickoffAt).getTime() - Date.now()) - Math.abs(new Date(b.kickoffAt).getTime() - Date.now()));
  const pendingPredictionCount = todayMatches.reduce((total, match) => {
    const missing = users.filter(
      (user) => user.groupId && !predictions.some((prediction) => prediction.matchId === match.id && prediction.userId === user.id)
    ).length;
    return total + missing;
  }, 0);

  const rankingsByGroup = groups.map((group) => {
    const groupUsers = users.filter((user) => user.groupId === group.id);
    const latestGroupResult = [...results]
      .filter((result) => result.updatedAt)
      .filter((result) => badgeEvents.some((event) => event.groupId === group.id && event.matchId === result.matchId))
      .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())[0];
    const activeBadgeEvents = latestGroupResult
      ? badgeEvents.filter((event) => event.groupId === group.id && event.matchId === latestGroupResult.matchId)
      : [];
    const rows = groupUsers
      .map((user) => ({
        user,
        points:
          predictions
            .filter((prediction) => prediction.userId === user.id)
            .reduce((total, prediction) => total + prediction.pointsAwarded, 0) +
          classificationPredictions
            .filter((prediction) => prediction.userId === user.id)
            .reduce((total, prediction) => total + prediction.pointsAwarded, 0),
        badgeIds: activeBadgeEvents.filter((event) => event.userId === user.id).map((event) => event.badgeId)
      }))
      .sort((a, b) => b.points - a.points);

    const ranking: { user: Profile; points: number; rank: number; badgeIds: string[] }[] = [];
    rows.forEach((row, index) => {
      const previous = ranking[index - 1];
      const rank = previous && previous.points === row.points ? previous.rank : index + 1;
      ranking.push({ ...row, rank });
    });

    return {
      group,
      ranking
    };
  });

  return {
    profile,
    groups,
    users,
    teams,
    matches,
    todayMatches,
    predictions,
    results,
    rankingsByGroup,
    closedWithoutResults,
    pendingPredictionCount
  };
}

export async function getAdminLogsData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const { data } = await admin
    .from("sync_logs")
    .select("id,provider,sync_type,status,message,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    profile,
    logs: (data ?? []) as {
      id: string;
      provider: string;
      sync_type: string;
      status: "success" | "error" | "partial";
      message: string | null;
      metadata: Record<string, unknown>;
      created_at: string;
    }[]
  };
}

export async function getAdminUsersData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [profilesResponse, groupsResponse] = await Promise.all([
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("groups").select("id,name,invite_code")
  ]);

  return {
    profile,
    users: profilesResponse.data ? (profilesResponse.data as ProfileRow[]).map(mapProfile) : [],
    groups: groupsResponse.data ? (groupsResponse.data as GroupRow[]).map(mapGroup) : []
  };
}

export async function getAdminPredictionsData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [predictionRows, profilesResponse, matchesResponse, teamsResponse] = await Promise.all([
    fetchAllRows<PredictionRow>(() => admin.from("match_predictions").select("*").order("updated_at", { ascending: false })),
    admin.from("profiles").select("*"),
    admin.from("matches").select("*").order("kickoff_at"),
    admin.from("teams").select("id,name,short_name,flag_url").order("name")
  ]);

  return {
    profile,
    predictions: predictionRows.map(mapPrediction),
    users: profilesResponse.data ? (profilesResponse.data as ProfileRow[]).map(mapProfile) : [],
    matches: matchesResponse.data ? (matchesResponse.data as MatchRow[]).map(mapMatch) : [],
    teams: teamsResponse.data ? sortTeamsBySpanishName((teamsResponse.data as TeamRow[]).map(mapTeam)) : []
  };
}

export async function getAdminPendingPredictionsData() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");

  const admin = createAdminClient();
  const [
    groupsResponse,
    profilesResponse,
    teamsResponse,
    matchesResponse,
    predictionRows,
    classificationPredictionRows,
    resultsResponse
  ] =
    await Promise.all([
      admin.from("groups").select("id,name,invite_code").order("name"),
      admin.from("profiles").select("*").eq("role", "participant").order("alias"),
      admin.from("teams").select("id,name,short_name,flag_url").order("name"),
      admin.from("matches").select("*").order("kickoff_at"),
      fetchAllRows<PredictionRow>(() => admin.from("match_predictions").select("*").order("updated_at", { ascending: true })),
      fetchAllRows<ClassificationPredictionRow>(() =>
        admin.from("group_classification_predictions").select("*").order("updated_at", { ascending: true })
      ),
      admin.from("match_results").select("*")
    ]);

  const groups = groupsResponse.data ? (groupsResponse.data as GroupRow[]).map(mapGroup) : [];
  const users = profilesResponse.data ? (profilesResponse.data as ProfileRow[]).map(mapProfile) : [];
  const teams =
    teamsResponse.data && teamsResponse.data.length > 0
      ? sortTeamsBySpanishName((teamsResponse.data as TeamRow[]).map(mapTeam))
      : sortTeamsBySpanishName(mockTeams);
  const matches =
    matchesResponse.data && matchesResponse.data.length > 0 ? (matchesResponse.data as MatchRow[]).map(mapMatch) : mockMatches;
  const predictions = predictionRows.map(mapPrediction);
  const classificationPredictions = classificationPredictionRows.map(mapClassificationPrediction);
  const results = resultsResponse.data ? (resultsResponse.data as ResultRow[]).map(mapResult) : [];
  const todayKey = dateKeyInTimezone(new Date(), profile.timezone);
  const todayMatches = matches.filter((match) => dateKeyInTimezone(new Date(match.kickoffAt), profile.timezone) === todayKey);

  return {
    profile,
    groups,
    users,
    teams,
    matches,
    todayMatches,
    predictions,
    results,
    classificationPredictions
  };
}

function dateKeyInTimezone(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export async function getVisibleMatchPredictions(matchId: string) {
  const profile = await getCurrentProfile();
  const admin = createAdminClient();
  const { data: matchRow } = await admin.from("matches").select("*").eq("id", matchId).single<MatchRow>();
  if (!matchRow) {
    return {
      profile,
      isRevealed: false,
      predictions: [],
      users: []
    };
  }

  const match = mapMatch(matchRow);
  const isRevealed = profile.role === "admin" || new Date().getTime() >= new Date(match.kickoffAt).getTime() - 5 * 60 * 1000;
  if (!isRevealed) {
    return {
      profile,
      isRevealed,
      predictions: [],
      users: []
    };
  }

  let query = admin.from("match_predictions").select("*").eq("match_id", matchId);
  if (profile.role !== "admin" && profile.groupId) {
    query = query.eq("group_id", profile.groupId);
  }

  const { data: predictionRows } = await query.order("updated_at", { ascending: true });
  const predictions = predictionRows ? (predictionRows as PredictionRow[]).map(mapPrediction) : [];
  const userIds = [...new Set(predictions.map((prediction) => prediction.userId))];

  if (userIds.length === 0) {
    return {
      profile,
      isRevealed,
      predictions,
      users: []
    };
  }

  const { data: userRows } = await admin.from("profiles").select("*").in("id", userIds);

  return {
    profile,
    isRevealed,
    predictions,
    users: userRows ? (userRows as ProfileRow[]).map(mapProfile) : []
  };
}

export async function getChampionSelectionData() {
  const profile = await getCurrentProfile();
  const teams = await getTeams();
  const admin = createAdminClient();
  const { data } = await admin
    .from("champion_predictions")
    .select("user_id,team_id,created_at")
    .eq("user_id", profile.id)
    .maybeSingle<ChampionRow>();

  return {
    profile,
    teams,
    champion: data ? mapChampion(data) : null
  };
}

export async function getDashboardData({ requireChampion = true } = {}) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return getMockDashboardData();
  }

  const profile = await getCurrentProfile();
  const admin = createAdminClient();

  const [
    groupResponse,
    teamsResponse,
    matchesResponse,
    championResponse,
    predictionsResponse,
    resultsResponse,
    groupProfilesResponse,
    groupPredictionRows,
    championPredictionsResponse,
    rankingSnapshotRows,
    classificationPredictionsResponse,
    groupClassificationPredictionRows,
    badgeEventRows
  ] = await Promise.all([
    profile.groupId
      ? admin.from("groups").select("id,name,invite_code").eq("id", profile.groupId).maybeSingle<GroupRow>()
      : Promise.resolve({ data: null, error: null }),
    admin.from("teams").select("id,name,short_name,flag_url").order("name"),
    admin.from("matches").select("*").order("kickoff_at"),
    admin.from("champion_predictions").select("user_id,team_id,created_at").eq("user_id", profile.id).maybeSingle<ChampionRow>(),
    admin.from("match_predictions").select("*").eq("user_id", profile.id),
    admin.from("match_results").select("*"),
    profile.groupId
      ? admin.from("profiles").select("*").eq("group_id", profile.groupId).eq("role", "participant")
      : Promise.resolve({ data: [], error: null }),
    profile.groupId
      ? fetchAllRows<PredictionRow>(() =>
          admin.from("match_predictions").select("*").eq("group_id", profile.groupId).order("updated_at", { ascending: true })
        )
      : Promise.resolve([]),
    admin.from("champion_predictions").select("user_id,team_id,created_at"),
    profile.groupId
      ? fetchAllRows<RankingSnapshotRow>(() =>
          admin.from("ranking_snapshots").select("*").eq("group_id", profile.groupId).order("created_at", { ascending: true })
        )
      : Promise.resolve([]),
    profile.groupId
      ? admin.from("group_classification_predictions").select("*").eq("user_id", profile.id)
      : Promise.resolve({ data: [], error: null }),
    profile.groupId
      ? fetchAllRows<ClassificationPredictionRow>(() =>
          admin.from("group_classification_predictions").select("*").eq("app_group_id", profile.groupId).order("updated_at", { ascending: true })
        )
      : Promise.resolve([]),
    profile.groupId
      ? fetchAllRows<BadgeEventRow>(() => admin.from("badge_events").select("*").eq("group_id", profile.groupId).order("created_at", { ascending: false }))
      : Promise.resolve([])
  ]);

  const champion = championResponse.data ? mapChampion(championResponse.data) : null;
  if (requireChampion && profile.role === "participant" && !champion) {
    redirect("/campeon");
  }

  const teams =
    teamsResponse.data && teamsResponse.data.length > 0
      ? sortTeamsBySpanishName((teamsResponse.data as TeamRow[]).map(mapTeam))
      : sortTeamsBySpanishName(mockTeams);
  const matches =
    matchesResponse.data && matchesResponse.data.length > 0 ? (matchesResponse.data as MatchRow[]).map(mapMatch) : mockMatches;
  const userPredictions = predictionsResponse.data ? (predictionsResponse.data as PredictionRow[]).map(mapPrediction) : [];
  const results = resultsResponse.data ? (resultsResponse.data as ResultRow[]).map(mapResult) : [];
  const groupProfiles = groupProfilesResponse.data ? (groupProfilesResponse.data as ProfileRow[]).map(mapProfile) : [];
  const groupPredictions = groupPredictionRows.map(mapPrediction);
  const groupUserIds = new Set(groupProfiles.map((user) => user.id));
  const groupChampionPredictions = championPredictionsResponse.data
    ? (championPredictionsResponse.data as ChampionRow[]).map(mapChampion).filter((item) => groupUserIds.has(item.userId))
    : [];
  const groupRankingSnapshots = rankingSnapshotRows.map(mapRankingSnapshot);
  const classificationPredictions = classificationPredictionsResponse.data
    ? (classificationPredictionsResponse.data as ClassificationPredictionRow[]).map(mapClassificationPrediction)
    : [];
  const groupClassificationPredictions = groupClassificationPredictionRows.map(mapClassificationPrediction);
  const rawBadgeEvents = badgeEventRows.map(mapBadgeEvent);
  const badgeEvents = filterContradictoryMissedPredictionEvents(rawBadgeEvents, groupPredictions);
  const latestResult = [...results]
    .filter((result) => result.updatedAt)
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())[0];
  const activeBadgeEvents = latestResult ? badgeEvents.filter((event) => event.matchId === latestResult.matchId) : [];

  const rankedRows = groupProfiles
    .map((user) => ({
      user,
      points: groupPredictions
        .filter((prediction) => prediction.userId === user.id)
        .reduce((total, prediction) => total + prediction.pointsAwarded, 0) +
        groupClassificationPredictions
          .filter((prediction) => prediction.userId === user.id)
          .reduce((total, prediction) => total + prediction.pointsAwarded, 0)
    }))
    .sort((a, b) => b.points - a.points);

  const ranking: { user: Profile; points: number; rank: number }[] = [];
  rankedRows.forEach((row, index) => {
    const previous = ranking[index - 1];
    const rank = previous && previous.points === row.points ? previous.rank : index + 1;
    ranking.push({ ...row, rank });
  });

  return {
    profile,
    group: groupResponse.data ? mapGroup(groupResponse.data) : null,
    teams,
    matches,
    results,
    predictions: userPredictions,
    groupPredictions,
    groupUsers: groupProfiles,
    groupChampionPredictions,
    groupRankingSnapshots,
    classificationPredictions,
    groupClassificationPredictions,
    badgeEvents,
    activeBadgeEvents,
    champion,
    ranking
  };
}

function getMockDashboardData() {
  const profile = currentUser;
  const group = GROUPS.find((item) => item.id === profile.groupId) ?? null;
  const groupProfiles = profiles.filter((item) => item.groupId === profile.groupId);
  const champion = championPredictions.find((item) => item.userId === profile.id) ?? null;
  const userPredictions = mockPredictions.filter((item) => item.userId === profile.id);

  const rankedRows = groupProfiles
    .map((user) => ({
      user,
      points: mockPredictions
        .filter((prediction) => prediction.userId === user.id)
        .reduce((total, prediction) => total + prediction.pointsAwarded, 0)
    }))
    .sort((a, b) => b.points - a.points);

  const ranking: { user: typeof groupProfiles[number]; points: number; rank: number }[] = [];
  rankedRows.forEach((row, index) => {
    const previous = ranking[index - 1];
    const rank = previous && previous.points === row.points ? previous.rank : index + 1;
    ranking.push({ ...row, rank });
  });

  return {
    profile,
    group,
    teams: sortTeamsBySpanishName(mockTeams),
    matches: mockMatches,
    results: [],
    predictions: userPredictions,
    groupPredictions: mockPredictions.filter((item) => item.groupId === profile.groupId),
    groupUsers: groupProfiles,
    groupChampionPredictions: championPredictions.filter((item) =>
      groupProfiles.some((user) => user.id === item.userId)
    ),
    groupRankingSnapshots: [],
    classificationPredictions: [],
    groupClassificationPredictions: [],
    badgeEvents: [],
    activeBadgeEvents: [],
    champion,
    ranking
  };
}
