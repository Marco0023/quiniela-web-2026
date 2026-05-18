import { GROUPS } from "@/lib/constants";
import type { ChampionPrediction, Match, MatchResult, Prediction, Profile, Team } from "@/lib/types";

export const teams: Team[] = [
  { id: "arg", name: "Argentina", shortName: "ARG", flagUrl: "https://flagcdn.com/w80/ar.png" },
  { id: "bra", name: "Brasil", shortName: "BRA", flagUrl: "https://flagcdn.com/w80/br.png" },
  { id: "col", name: "Colombia", shortName: "COL", flagUrl: "https://flagcdn.com/w80/co.png" },
  { id: "mex", name: "Mexico", shortName: "MEX", flagUrl: "https://flagcdn.com/w80/mx.png" },
  { id: "usa", name: "Estados Unidos", shortName: "USA", flagUrl: "https://flagcdn.com/w80/us.png" },
  { id: "esp", name: "Espana", shortName: "ESP", flagUrl: "https://flagcdn.com/w80/es.png" },
  { id: "fra", name: "Francia", shortName: "FRA", flagUrl: "https://flagcdn.com/w80/fr.png" },
  { id: "eng", name: "Inglaterra", shortName: "ENG", flagUrl: "https://flagcdn.com/w80/gb-eng.png" }
];

export const matches: Match[] = [
  {
    id: "m1",
    phase: "group_stage",
    matchNumber: 1,
    homeTeamId: "mex",
    awayTeamId: "col",
    kickoffAt: "2026-06-11T19:00:00.000Z",
    status: "scheduled"
  },
  {
    id: "m2",
    phase: "group_stage",
    matchNumber: 2,
    homeTeamId: "usa",
    awayTeamId: "bra",
    kickoffAt: "2026-06-12T00:00:00.000Z",
    status: "scheduled"
  },
  {
    id: "m3",
    phase: "group_stage",
    matchNumber: 3,
    homeTeamId: "arg",
    awayTeamId: "esp",
    kickoffAt: "2026-06-13T22:00:00.000Z",
    status: "scheduled"
  },
  {
    id: "m4",
    phase: "round_of_32",
    matchNumber: 73,
    homeTeamId: "fra",
    awayTeamId: "eng",
    kickoffAt: "2026-06-28T20:00:00.000Z",
    status: "scheduled"
  },
  {
    id: "m5",
    phase: "final",
    matchNumber: 104,
    homeTeamId: "arg",
    awayTeamId: "fra",
    kickoffAt: "2026-07-19T22:00:00.000Z",
    status: "scheduled"
  }
];

export const results: MatchResult[] = [
  {
    matchId: "m1",
    homeScore90: null,
    awayScore90: null,
    homeScoreFinal: null,
    awayScoreFinal: null,
    winnerTeamId: null,
    wentExtraTime: null,
    wentPenalties: null
  }
];

export const profiles: Profile[] = [
  {
    id: "u1",
    firstName: "Marco",
    lastName: "Riera",
    alias: "MarcoFM",
    email: "mriera371+fm@gmail.com",
    role: "participant",
    groupId: GROUPS[0].id,
    timezoneCountry: "Colombia",
    timezone: "America/Bogota"
  },
  {
    id: "u2",
    firstName: "Ana",
    lastName: "Marquez",
    alias: "AnaGol",
    email: "ana@example.com",
    role: "participant",
    groupId: GROUPS[0].id,
    timezoneCountry: "Venezuela",
    timezone: "America/Caracas"
  },
  {
    id: "u3",
    firstName: "Luis",
    lastName: "Marquez",
    alias: "Luis10",
    email: "luis@example.com",
    role: "participant",
    groupId: GROUPS[0].id,
    timezoneCountry: "Mexico",
    timezone: "America/Mexico_City"
  }
];

export const championPredictions: ChampionPrediction[] = [
  { userId: "u1", teamId: "arg", createdAt: "2026-05-17T12:00:00.000Z" },
  { userId: "u2", teamId: "bra", createdAt: "2026-05-17T12:00:00.000Z" },
  { userId: "u3", teamId: "fra", createdAt: "2026-05-17T12:00:00.000Z" }
];

export const predictions: Prediction[] = [
  {
    id: "p1",
    matchId: "m1",
    userId: "u1",
    groupId: GROUPS[0].id,
    predictionType: "group_stage",
    predictedOutcome: "away",
    predictedWinnerTeamId: null,
    predictedHomeScore: 1,
    predictedAwayScore: 2,
    predictsExtraTime: null,
    predictsPenalties: null,
    pointsAwarded: 0,
    updatedAt: "2026-05-17T12:00:00.000Z"
  },
  {
    id: "p2",
    matchId: "m1",
    userId: "u2",
    groupId: GROUPS[0].id,
    predictionType: "group_stage",
    predictedOutcome: "draw",
    predictedWinnerTeamId: null,
    predictedHomeScore: 1,
    predictedAwayScore: 1,
    predictsExtraTime: null,
    predictsPenalties: null,
    pointsAwarded: 0,
    updatedAt: "2026-05-17T12:15:00.000Z"
  },
  {
    id: "p3",
    matchId: "m3",
    userId: "u3",
    groupId: GROUPS[0].id,
    predictionType: "group_stage",
    predictedOutcome: "home",
    predictedWinnerTeamId: null,
    predictedHomeScore: 2,
    predictedAwayScore: 0,
    predictsExtraTime: null,
    predictsPenalties: null,
    pointsAwarded: 0,
    updatedAt: "2026-05-17T12:20:00.000Z"
  }
];

export const currentUser = profiles[0];
