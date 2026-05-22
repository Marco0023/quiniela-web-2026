import type { ChampionPrediction, Match, MatchResult, Prediction, ScoreBreakdown } from "@/lib/types";

const emptyBreakdown = (): ScoreBreakdown => ({
  winnerPoints: 0,
  exactScorePoints: 0,
  goalDifferencePoints: 0,
  extraTimePoints: 0,
  penaltiesPoints: 0,
  championPoints: 0,
  championBonusPoints: 0,
  totalPoints: 0
});

export function getPredictionType(match: Match): Prediction["predictionType"] {
  if (match.phase === "final") return "final";
  if (match.phase === "group_stage") return "group_stage";
  return "knockout";
}

export function isPredictionLocked(kickoffAt: string, now = new Date()) {
  const kickoff = new Date(kickoffAt).getTime();
  return now.getTime() >= kickoff - 5 * 60 * 1000;
}

export function validateScoreConsistency(
  outcome: Prediction["predictedOutcome"],
  homeScore: number | null,
  awayScore: number | null
) {
  if (homeScore === null || awayScore === null || outcome === null) return true;
  if (outcome === "home") return homeScore > awayScore;
  if (outcome === "away") return awayScore > homeScore;
  return homeScore === awayScore;
}

export function scorePrediction({
  match,
  result,
  prediction,
  championPrediction,
  worldChampionTeamId
}: {
  match: Match;
  result: MatchResult;
  prediction: Prediction;
  championPrediction?: ChampionPrediction | null;
  worldChampionTeamId?: string | null;
}) {
  const breakdown = emptyBreakdown();

  if (match.phase === "group_stage") {
    const actualOutcome = getActualOutcome(result.homeScore90, result.awayScore90);
    if (actualOutcome && prediction.predictedOutcome === actualOutcome) {
      breakdown.winnerPoints = 3;
    }

    const hasExactScore =
      prediction.predictedHomeScore !== null &&
      prediction.predictedAwayScore !== null &&
      prediction.predictedHomeScore === result.homeScore90 &&
      prediction.predictedAwayScore === result.awayScore90;

    if (hasExactScore) {
      breakdown.exactScorePoints = 2;
    }

    if (
      actualOutcome !== "draw" &&
      prediction.predictedHomeScore !== null &&
      prediction.predictedAwayScore !== null &&
      result.homeScore90 !== null &&
      result.awayScore90 !== null
    ) {
      const predictedDiff = Math.abs(prediction.predictedHomeScore - prediction.predictedAwayScore);
      const actualDiff = Math.abs(result.homeScore90 - result.awayScore90);
      if (predictedDiff === actualDiff) {
        breakdown.goalDifferencePoints = 1;
      }
    }
  }

  if (match.phase !== "group_stage" && match.phase !== "final") {
    if (prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === result.winnerTeamId) {
      breakdown.winnerPoints = 3;
    }
    if (prediction.predictsExtraTime === result.wentExtraTime) {
      breakdown.extraTimePoints = 2;
    }
    if (prediction.predictsPenalties === result.wentPenalties) {
      breakdown.penaltiesPoints = 2;
    }
  }

  if (match.phase === "final") {
    if (prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === result.winnerTeamId) {
      breakdown.winnerPoints = 3;
    }

    const hasExactScore =
      prediction.predictedHomeScore !== null &&
      prediction.predictedAwayScore !== null &&
      prediction.predictedHomeScore === result.homeScore90 &&
      prediction.predictedAwayScore === result.awayScore90;

    if (hasExactScore) {
      breakdown.exactScorePoints = 2;
    }

    const actualOutcome90 = getActualOutcome(result.homeScore90, result.awayScore90);
    if (
      actualOutcome90 !== "draw" &&
      prediction.predictedHomeScore !== null &&
      prediction.predictedAwayScore !== null &&
      result.homeScore90 !== null &&
      result.awayScore90 !== null
    ) {
      const predictedDiff = Math.abs(prediction.predictedHomeScore - prediction.predictedAwayScore);
      const actualDiff = Math.abs(result.homeScore90 - result.awayScore90);
      if (predictedDiff === actualDiff) {
        breakdown.goalDifferencePoints = 1;
      }
    }

    if (prediction.predictsExtraTime === result.wentExtraTime) {
      breakdown.extraTimePoints = 2;
    }
    if (prediction.predictsPenalties === result.wentPenalties) {
      breakdown.penaltiesPoints = 2;
    }

    if (championPrediction?.teamId && worldChampionTeamId && championPrediction.teamId === worldChampionTeamId) {
      breakdown.championPoints = 30;
      if (prediction.predictedWinnerTeamId === result.winnerTeamId) {
        breakdown.championBonusPoints = 5;
      }
    }
  }

  breakdown.totalPoints =
    breakdown.winnerPoints +
    breakdown.exactScorePoints +
    breakdown.goalDifferencePoints +
    breakdown.extraTimePoints +
    breakdown.penaltiesPoints +
    breakdown.championPoints +
    breakdown.championBonusPoints;

  return breakdown;
}

function getActualOutcome(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}
