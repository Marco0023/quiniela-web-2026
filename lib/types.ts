export type Role = "participant" | "admin";

export type GroupSlug = "familia-marquez" | "familia-nunez-quinones" | "mondaquera-bochinche";

export type Phase =
  | "group_stage"
  | "round_of_32"
  | "round_of_16"
  | "quarter_finals"
  | "semi_finals"
  | "third_place"
  | "final";

export type MatchStatus = "scheduled" | "locked" | "live" | "finished" | "postponed" | "cancelled";

export type Outcome = "home" | "draw" | "away";

export type Team = {
  id: string;
  name: string;
  shortName: string;
  flagUrl: string;
};

export type Group = {
  id: string;
  slug: GroupSlug;
  name: string;
  inviteCode: string;
};

export type Profile = {
  id: string;
  firstName: string;
  lastName: string;
  alias: string;
  email: string;
  role: Role;
  groupId: string | null;
  timezoneCountry: string;
  timezone: string;
};

export type Match = {
  id: string;
  phase: Phase;
  matchNumber: number;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homePlaceholder?: string;
  awayPlaceholder?: string;
  kickoffAt: string;
  status: MatchStatus;
};

export type MatchResult = {
  matchId: string;
  homeScore90: number | null;
  awayScore90: number | null;
  homeScoreFinal: number | null;
  awayScoreFinal: number | null;
  winnerTeamId: string | null;
  wentExtraTime: boolean | null;
  wentPenalties: boolean | null;
};

export type Prediction = {
  id: string;
  matchId: string;
  userId: string;
  groupId: string;
  predictionType: "group_stage" | "knockout" | "final";
  predictedOutcome: Outcome | null;
  predictedWinnerTeamId: string | null;
  predictedHomeScore: number | null;
  predictedAwayScore: number | null;
  predictsExtraTime: boolean | null;
  predictsPenalties: boolean | null;
  pointsAwarded: number;
  updatedAt: string;
};

export type ChampionPrediction = {
  userId: string;
  teamId: string;
  createdAt: string;
};

export type GroupClassificationPrediction = {
  userId: string;
  groupId: string;
  tournamentGroup: string;
  orderedTeamIds: string[];
  updatedAt: string;
};

export type RankingSnapshot = {
  groupId: string;
  userId: string;
  matchId: string;
  rank: number;
  points: number;
  totalParticipants: number;
  createdAt: string;
};

export type ScoreBreakdown = {
  winnerPoints: number;
  exactScorePoints: number;
  goalDifferencePoints: number;
  extraTimePoints: number;
  penaltiesPoints: number;
  championPoints: number;
  championBonusPoints: number;
  totalPoints: number;
};
