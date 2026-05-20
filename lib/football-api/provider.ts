import { matches, results, teams } from "@/lib/mock-data";
import type { MatchStatus, Phase } from "@/lib/types";

export type SyncedTeam = {
  apiId: string;
  name: string;
  shortName: string;
  flagUrl: string | null;
  groupCode?: string | null;
};

export type SyncedMatch = {
  apiId: string;
  phase: Phase;
  matchNumber: number;
  homeTeam: SyncedTeam | null;
  awayTeam: SyncedTeam | null;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  kickoffAt: string;
  status: MatchStatus;
  groupCode?: string | null;
};

export type SyncedResult = {
  matchApiId: string;
  homeScore90: number | null;
  awayScore90: number | null;
  homeScoreFinal: number | null;
  awayScoreFinal: number | null;
  winnerTeamApiId: string | null;
  wentExtraTime: boolean | null;
  wentPenalties: boolean | null;
  penaltyWinnerTeamApiId: string | null;
  status: MatchStatus;
};

export type FootballApiProvider = {
  name: string;
  syncTeams: () => Promise<SyncedTeam[]>;
  syncMatches: () => Promise<SyncedMatch[]>;
  syncResults: () => Promise<SyncedResult[]>;
};

type FootballDataTeam = {
  id?: number | string | null;
  name?: string | null;
  shortName?: string | null;
  tla?: string | null;
  crest?: string | null;
};

type FootballDataMatch = {
  id?: number | string | null;
  utcDate?: string | null;
  status?: string | null;
  stage?: string | null;
  group?: string | null;
  matchday?: number | null;
  homeTeam?: FootballDataTeam | null;
  awayTeam?: FootballDataTeam | null;
  score?: {
    winner?: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    duration?: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT" | null;
    fullTime?: {
      home?: number | null;
      away?: number | null;
    };
    regularTime?: {
      home?: number | null;
      away?: number | null;
    };
    extraTime?: {
      home?: number | null;
      away?: number | null;
    };
    penalties?: {
      home?: number | null;
      away?: number | null;
    };
  };
};

type FootballDataTeamsResponse = {
  teams?: FootballDataTeam[];
};

type FootballDataMatchesResponse = {
  matches?: FootballDataMatch[];
};

const DEFAULT_FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";
const DEFAULT_FOOTBALL_DATA_COMPETITION = "WC";
const DEFAULT_FOOTBALL_DATA_SEASON = "2026";

const MOCK_TEAM_API_IDS: Record<string, string> = {
  arg: "mock_arg",
  aut: "mock_aut",
  bel: "mock_bel",
  bra: "mock_bra",
  col: "mock_col",
  cro: "mock_cro",
  egy: "mock_egy",
  eng: "mock_eng",
  esp: "mock_esp",
  fra: "mock_fra",
  ger: "mock_ger",
  jpn: "mock_jpn",
  mar: "mock_mar",
  mex: "mock_mex",
  ned: "mock_ned",
  nor: "mock_nor",
  por: "mock_por",
  sen: "mock_sen",
  tur: "mock_tur",
  usa: "mock_usa"
};

const MOCK_MATCH_API_IDS: Record<string, string> = {
  m1: "mock_m1",
  m2: "mock_m2",
  m3: "mock_m3",
  m4: "mock_m73",
  m5: "mock_m104"
};

const SPANISH_TEAM_NAMES: Record<string, string> = {
  algeria: "Argelia",
  argentina: "Argentina",
  australia: "Australia",
  austria: "Austria",
  belgium: "Bélgica",
  bolivia: "Bolivia",
  brazil: "Brasil",
  canada: "Canadá",
  chile: "Chile",
  "china pr": "China",
  colombia: "Colombia",
  "costa rica": "Costa Rica",
  "cote d'ivoire": "Costa de Marfil",
  "cote divoire": "Costa de Marfil",
  "côte d’ivoire": "Costa de Marfil",
  croatia: "Croacia",
  czechia: "República Checa",
  "czech republic": "República Checa",
  denmark: "Dinamarca",
  ecuador: "Ecuador",
  egypt: "Egipto",
  england: "Inglaterra",
  france: "Francia",
  germany: "Alemania",
  ghana: "Ghana",
  greece: "Grecia",
  honduras: "Honduras",
  iran: "Irán",
  iraq: "Irak",
  italy: "Italia",
  "ivory coast": "Costa de Marfil",
  japan: "Japón",
  jordan: "Jordania",
  "korea republic": "Corea del Sur",
  "south korea": "Corea del Sur",
  mexico: "México",
  morocco: "Marruecos",
  netherlands: "Países Bajos",
  "new zealand": "Nueva Zelanda",
  norway: "Noruega",
  panama: "Panamá",
  paraguay: "Paraguay",
  peru: "Perú",
  poland: "Polonia",
  portugal: "Portugal",
  qatar: "Catar",
  romania: "Rumania",
  "saudi arabia": "Arabia Saudita",
  scotland: "Escocia",
  senegal: "Senegal",
  serbia: "Serbia",
  slovakia: "Eslovaquia",
  slovenia: "Eslovenia",
  "south africa": "Sudáfrica",
  spain: "España",
  sweden: "Suecia",
  switzerland: "Suiza",
  tunisia: "Túnez",
  turkey: "Turquía",
  ukraine: "Ucrania",
  uruguay: "Uruguay",
  "united states": "Estados Unidos",
  usa: "Estados Unidos",
  uzbekistan: "Uzbekistán",
  venezuela: "Venezuela",
  wales: "Gales"
};

class MockFootballApiProvider implements FootballApiProvider {
  name = "mock";

  async syncTeams() {
    return teams.map((team) => ({
      apiId: MOCK_TEAM_API_IDS[team.id] ?? team.id,
      name: team.name,
      shortName: team.shortName,
      flagUrl: team.flagUrl,
      groupCode: null
    }));
  }

  async syncMatches() {
    return matches.map((match) => ({
      apiId: MOCK_MATCH_API_IDS[match.id] ?? match.id,
      phase: match.phase,
      matchNumber: match.matchNumber,
      homeTeam: teamById(match.homeTeamId),
      awayTeam: teamById(match.awayTeamId),
      homePlaceholder: match.homePlaceholder ?? null,
      awayPlaceholder: match.awayPlaceholder ?? null,
      kickoffAt: match.kickoffAt,
      status: match.status,
      groupCode: null
    }));
  }

  async syncResults() {
    return results.map((result) => ({
      matchApiId: MOCK_MATCH_API_IDS[result.matchId] ?? result.matchId,
      homeScore90: result.homeScore90,
      awayScore90: result.awayScore90,
      homeScoreFinal: result.homeScoreFinal,
      awayScoreFinal: result.awayScoreFinal,
      winnerTeamApiId: result.winnerTeamId ? MOCK_TEAM_API_IDS[result.winnerTeamId] ?? result.winnerTeamId : null,
      wentExtraTime: result.wentExtraTime,
      wentPenalties: result.wentPenalties,
      penaltyWinnerTeamApiId: result.wentPenalties && result.winnerTeamId ? MOCK_TEAM_API_IDS[result.winnerTeamId] ?? result.winnerTeamId : null,
      status: "finished" as MatchStatus
    }));
  }
}

class FootballDataProvider implements FootballApiProvider {
  name = "football-data";

  private readonly baseUrl = process.env.FOOTBALL_DATA_API_BASE_URL ?? DEFAULT_FOOTBALL_DATA_BASE_URL;
  private readonly competition = process.env.FOOTBALL_DATA_COMPETITION ?? DEFAULT_FOOTBALL_DATA_COMPETITION;
  private readonly season = process.env.FOOTBALL_DATA_SEASON ?? DEFAULT_FOOTBALL_DATA_SEASON;
  private matchesCache: FootballDataMatch[] | null = null;

  async syncTeams() {
    const payload = await this.request<FootballDataTeamsResponse>(`competitions/${this.competition}/teams`, {
      season: this.season
    });
    return uniqueTeams((payload.teams ?? []).map(normalizeTeam).filter((team): team is SyncedTeam => Boolean(team)));
  }

  async syncMatches() {
    const matches = await this.getMatches();
    const groupByTeamApiId = inferGroupsByTeam(matches);
    return matches
      .map((match, index) => normalizeMatch(match, index))
      .map((match) => (match ? applyTeamGroups(match, groupByTeamApiId) : null))
      .filter((match): match is SyncedMatch => Boolean(match));
  }

  async syncResults() {
    const matches = await this.getMatches();
    return matches
      .map(normalizeResult)
      .filter((result): result is SyncedResult => Boolean(result));
  }

  private async getMatches() {
    if (this.matchesCache) return this.matchesCache;
    const payload = await this.request<FootballDataMatchesResponse>(`competitions/${this.competition}/matches`, {
      season: this.season
    });
    this.matchesCache = payload.matches ?? [];
    return this.matchesCache;
  }

  private async request<T>(path: string, params: Record<string, string>) {
    const token = process.env.FOOTBALL_DATA_API_TOKEN;
    if (!token) {
      throw new Error("Falta FOOTBALL_DATA_API_TOKEN para conectar football-data.org.");
    }

    const url = new URL(`${this.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
      headers: {
        "X-Auth-Token": token
      },
      next: {
        revalidate: 0
      }
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const message = typeof body?.message === "string" ? body.message : `football-data.org respondió ${response.status}.`;
      throw new Error(message);
    }

    return body as T;
  }
}

export function getFootballApiProvider(): FootballApiProvider {
  const provider = process.env.FOOTBALL_API_PROVIDER?.toLowerCase();
  if (provider === "football-data" || provider === "footballdata") {
    return new FootballDataProvider();
  }

  return new MockFootballApiProvider();
}

function normalizeTeam(team?: FootballDataTeam | null): SyncedTeam | null {
  if (!team?.id || !team.name) return null;
  const name = translateTeamName(team.name);
  return {
    apiId: providerId(team.id),
    name,
    shortName: team.tla ?? team.shortName ?? name.slice(0, 3).toUpperCase(),
    flagUrl: team.crest ?? null,
    groupCode: null
  };
}

function normalizeMatch(match: FootballDataMatch, index: number): SyncedMatch | null {
  if (!match.id || !match.utcDate) return null;
  const homeTeam = normalizeTeam(match.homeTeam);
  const awayTeam = normalizeTeam(match.awayTeam);

  return {
    apiId: providerId(match.id),
    phase: phaseFromStage(match.stage),
    matchNumber: match.matchday ?? index + 1,
    homeTeam,
    awayTeam,
    homePlaceholder: homeTeam ? null : match.homeTeam?.name ?? "Por definir",
    awayPlaceholder: awayTeam ? null : match.awayTeam?.name ?? "Por definir",
    kickoffAt: match.utcDate,
    status: statusFromFootballData(match.status),
    groupCode: normalizeGroupCode(match.group)
  };
}

function normalizeResult(match: FootballDataMatch): SyncedResult | null {
  if (!match.id) return null;

  const status = statusFromFootballData(match.status);
  const score = match.score;
  const homeScore90 = numberOrNull(score?.regularTime?.home ?? score?.fullTime?.home);
  const awayScore90 = numberOrNull(score?.regularTime?.away ?? score?.fullTime?.away);
  const homeScoreFinal = numberOrNull(score?.fullTime?.home ?? homeScore90);
  const awayScoreFinal = numberOrNull(score?.fullTime?.away ?? awayScore90);
  const hasAnyScore = homeScore90 !== null || awayScore90 !== null || homeScoreFinal !== null || awayScoreFinal !== null;

  if (status !== "finished" && !hasAnyScore) return null;

  const wentExtraTime =
    score?.duration === "EXTRA_TIME" ||
    score?.duration === "PENALTY_SHOOTOUT" ||
    numberOrNull(score?.extraTime?.home) !== null ||
    numberOrNull(score?.extraTime?.away) !== null;
  const wentPenalties =
    score?.duration === "PENALTY_SHOOTOUT" ||
    numberOrNull(score?.penalties?.home) !== null ||
    numberOrNull(score?.penalties?.away) !== null;
  const winnerTeamApiId =
    score?.winner === "HOME_TEAM" && match.homeTeam?.id
      ? providerId(match.homeTeam.id)
      : score?.winner === "AWAY_TEAM" && match.awayTeam?.id
        ? providerId(match.awayTeam.id)
        : null;

  return {
    matchApiId: providerId(match.id),
    homeScore90,
    awayScore90,
    homeScoreFinal,
    awayScoreFinal,
    winnerTeamApiId,
    wentExtraTime,
    wentPenalties,
    penaltyWinnerTeamApiId: wentPenalties ? winnerTeamApiId : null,
    status
  };
}

function teamById(id: string | null): SyncedTeam | null {
  const team = teams.find((item) => item.id === id);
  if (!team) return null;
  return {
    apiId: MOCK_TEAM_API_IDS[team.id] ?? team.id,
    name: team.name,
    shortName: team.shortName,
    flagUrl: team.flagUrl,
    groupCode: null
  };
}

function inferGroupsByTeam(matches: FootballDataMatch[]) {
  const groups = new Map<string, string>();
  for (const match of matches) {
    if (match.stage !== "GROUP_STAGE") continue;
    const groupCode = normalizeGroupCode(match.group);
    if (!groupCode) continue;
    if (match.homeTeam?.id) groups.set(providerId(match.homeTeam.id), groupCode);
    if (match.awayTeam?.id) groups.set(providerId(match.awayTeam.id), groupCode);
  }
  return groups;
}

function applyTeamGroups(match: SyncedMatch, groupByTeamApiId: Map<string, string>): SyncedMatch {
  return {
    ...match,
    homeTeam: match.homeTeam ? { ...match.homeTeam, groupCode: groupByTeamApiId.get(match.homeTeam.apiId) ?? match.homeTeam.groupCode ?? null } : null,
    awayTeam: match.awayTeam ? { ...match.awayTeam, groupCode: groupByTeamApiId.get(match.awayTeam.apiId) ?? match.awayTeam.groupCode ?? null } : null
  };
}

function statusFromFootballData(status?: string | null): MatchStatus {
  if (!status) return "scheduled";
  if (["SCHEDULED", "TIMED"].includes(status)) return "scheduled";
  if (["IN_PLAY", "PAUSED", "EXTRA_TIME", "PENALTY_SHOOTOUT"].includes(status)) return "live";
  if (["FINISHED", "AWARDED"].includes(status)) return "finished";
  if (status === "POSTPONED") return "postponed";
  if (["CANCELLED", "SUSPENDED"].includes(status)) return "cancelled";
  return "scheduled";
}

function phaseFromStage(stage?: string | null): Phase {
  if (stage === "LAST_32") return "round_of_32";
  if (stage === "LAST_16") return "round_of_16";
  if (stage === "QUARTER_FINALS") return "quarter_finals";
  if (stage === "SEMI_FINALS") return "semi_finals";
  if (stage === "THIRD_PLACE") return "third_place";
  if (stage === "FINAL") return "final";
  return "group_stage";
}

function providerId(id: number | string) {
  return `football-data:${String(id)}`;
}

function normalizeGroupCode(group?: string | null) {
  if (!group) return null;
  const normalized = group.replace(/^GROUP[_\s-]*/i, "").trim().toUpperCase();
  return normalized ? `Grupo ${normalized}` : null;
}

function translateTeamName(name: string) {
  const key = normalizeText(name);
  return SPANISH_TEAM_NAMES[key] ?? name;
}

function uniqueTeams(items: SyncedTeam[]) {
  const map = new Map<string, SyncedTeam>();
  for (const item of items) {
    map.set(item.apiId, item);
  }
  return [...map.values()];
}

function numberOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
