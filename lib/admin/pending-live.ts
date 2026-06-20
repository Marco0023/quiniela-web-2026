import { redirect } from "next/navigation";
import { PHASE_LABELS } from "@/lib/constants";
import { statusLabel } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { MatchStatus } from "@/lib/types";

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  alias: string;
  role: string;
  group_id: string | null;
  timezone_country: string;
  timezone: string;
};

type GroupRow = {
  id: string;
  name: string;
};

type TeamRow = {
  id: string;
  name: string;
  flag_url: string | null;
};

type MatchRow = {
  id: string;
  phase: keyof typeof PHASE_LABELS;
  status: MatchStatus;
  home_team_id: string | null;
  away_team_id: string | null;
  home_placeholder: string | null;
  away_placeholder: string | null;
  kickoff_at: string;
};

type PredictionRow = {
  match_id: string;
  user_id: string;
};

export type AdminTodayPendingData = {
  generatedAt: string;
  timezone: string;
  timezoneCountry: string;
  matches: {
    id: string;
    phase: string;
    phaseLabel: string;
    status: string;
    statusLabel: string;
    kickoffAt: string;
    homeTeam: { id: string; name: string; flagUrl: string } | null;
    awayTeam: { id: string; name: string; flagUrl: string } | null;
    homePlaceholder: string;
    awayPlaceholder: string;
    submitted: number;
    totalUsers: number;
    groups: {
      id: string;
      name: string;
      submitted: number;
      total: number;
      missing: {
        id: string;
        alias: string;
        firstName: string;
        lastName: string;
      }[];
    }[];
  }[];
};

export async function getAdminTodayPendingData(): Promise<AdminTodayPendingData> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id,role,timezone,timezone_country")
    .eq("id", authData.user.id)
    .single<Pick<ProfileRow, "id" | "role" | "timezone" | "timezone_country">>();

  if (profile?.role !== "admin") redirect("/dashboard");

  const [groupsResponse, usersResponse, teamsResponse, matchesResponse] = await Promise.all([
    admin.from("groups").select("id,name").order("name"),
    admin.from("profiles").select("id,first_name,last_name,alias,role,group_id,timezone_country,timezone").eq("role", "participant").order("alias"),
    admin.from("teams").select("id,name,flag_url"),
    admin.from("matches").select("id,phase,status,home_team_id,away_team_id,home_placeholder,away_placeholder,kickoff_at").order("kickoff_at")
  ]);

  const groups = (groupsResponse.data ?? []) as GroupRow[];
  const users = (usersResponse.data ?? []) as ProfileRow[];
  const teams = (teamsResponse.data ?? []) as TeamRow[];
  const matches = (matchesResponse.data ?? []) as MatchRow[];
  const timezone = profile.timezone;
  const todayKey = dateKeyInTimezone(new Date(), timezone);
  const todayMatches = matches.filter((match) => dateKeyInTimezone(new Date(match.kickoff_at), timezone) === todayKey);
  const matchIds = todayMatches.map((match) => match.id);
  const predictionsResponse =
    matchIds.length > 0
      ? await admin.from("match_predictions").select("match_id,user_id").in("match_id", matchIds)
      : { data: [] as PredictionRow[] };

  const predictions = (predictionsResponse.data ?? []) as PredictionRow[];
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const usersByGroup = groups.map((group) => ({
    ...group,
    users: users.filter((user) => user.group_id === group.id)
  }));

  return {
    generatedAt: new Date().toISOString(),
    timezone,
    timezoneCountry: profile.timezone_country,
    matches: todayMatches.map((match) => {
      const predictedUserIds = new Set(predictions.filter((prediction) => prediction.match_id === match.id).map((prediction) => prediction.user_id));
      const groupsWithMissing = usersByGroup.map((group) => {
        const missing = group.users.filter((user) => !predictedUserIds.has(user.id));
        return {
          id: group.id,
          name: group.name,
          submitted: group.users.length - missing.length,
          total: group.users.length,
          missing: missing.map((user) => ({
            id: user.id,
            alias: user.alias,
            firstName: user.first_name,
            lastName: user.last_name
          }))
        };
      });

      return {
        id: match.id,
        phase: match.phase,
        phaseLabel: PHASE_LABELS[match.phase],
        status: match.status,
        statusLabel: statusLabel(match.status),
        kickoffAt: match.kickoff_at,
        homeTeam: serializeTeam(match.home_team_id ? teamsById.get(match.home_team_id) : undefined),
        awayTeam: serializeTeam(match.away_team_id ? teamsById.get(match.away_team_id) : undefined),
        homePlaceholder: match.home_placeholder ?? "Por definir",
        awayPlaceholder: match.away_placeholder ?? "Por definir",
        submitted: groupsWithMissing.reduce((sum, group) => sum + group.submitted, 0),
        totalUsers: groupsWithMissing.reduce((sum, group) => sum + group.total, 0),
        groups: groupsWithMissing
      };
    })
  };
}

function serializeTeam(team?: TeamRow) {
  if (!team) return null;
  return {
    id: team.id,
    name: team.name,
    flagUrl: team.flag_url ?? ""
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
