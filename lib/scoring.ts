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

export function getScoringScore(match: Match, result: MatchResult) {
  if (match.phase === "group_stage") {
    return {
      homeScore: result.homeScore90,
      awayScore: result.awayScore90
    };
  }

  return {
    homeScore: result.homeScoreFinal ?? result.homeScore90,
    awayScore: result.awayScoreFinal ?? result.awayScore90
  };
}

export function validateKnockoutGlobalScore(
  winnerTeamId: string | null,
  homeScore: number | null,
  awayScore: number | null,
  homeTeamId: string | null,
  awayTeamId: string | null
) {
  if (!winnerTeamId || homeScore === null || awayScore === null || !homeTeamId || !awayTeamId) return false;
  if (homeScore === awayScore) return false;
  if (winnerTeamId === homeTeamId) return homeScore > awayScore;
  if (winnerTeamId === awayTeamId) return awayScore > homeScore;
  return false;
}

function knockoutWinnerPoints(phase: Match["phase"]) {
  if (phase === "round_of_32") return 5;
  if (phase === "round_of_16") return 6;
  if (phase === "quarter_finals") return 7;
  if (phase === "semi_finals" || phase === "third_place" || phase === "final") return 8;
  return 0;
}

function applyScorePoints(match: Match, breakdown: ScoreBreakdown, result: MatchResult, prediction: Prediction, exactPoints: number, diffPoints: number) {
  const { homeScore, awayScore } = getScoringScore(match, result);
  const hasPredictedScore = prediction.predictedHomeScore !== null && prediction.predictedAwayScore !== null;
  const hasResultScore = homeScore !== null && awayScore !== null;
  if (!hasPredictedScore || !hasResultScore) return;

  const hasExactScore = prediction.predictedHomeScore === homeScore && prediction.predictedAwayScore === awayScore;
  if (hasExactScore) {
    breakdown.exactScorePoints = exactPoints;
  }

  const predictedDiff = Math.abs(prediction.predictedHomeScore! - prediction.predictedAwayScore!);
  const actualDiff = Math.abs(homeScore! - awayScore!);
  if (predictedDiff === actualDiff) {
    breakdown.goalDifferencePoints = diffPoints;
  }
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
    const { homeScore, awayScore } = getScoringScore(match, result);
    const actualOutcome = getActualOutcome(homeScore, awayScore);
    if (actualOutcome && prediction.predictedOutcome === actualOutcome) {
      breakdown.winnerPoints = 3;
    }

    const hasExactScore =
      prediction.predictedHomeScore !== null &&
      prediction.predictedAwayScore !== null &&
      prediction.predictedHomeScore === homeScore &&
      prediction.predictedAwayScore === awayScore;

    if (hasExactScore) {
      breakdown.exactScorePoints = 2;
    }

    if (
      actualOutcome !== "draw" &&
      prediction.predictedHomeScore !== null &&
      prediction.predictedAwayScore !== null &&
      homeScore !== null &&
      awayScore !== null
    ) {
      const predictedDiff = Math.abs(prediction.predictedHomeScore - prediction.predictedAwayScore);
      const actualDiff = Math.abs(homeScore - awayScore);
      if (predictedDiff === actualDiff) {
        breakdown.goalDifferencePoints = 1;
      }
    }
  }

  if (match.phase !== "group_stage" && match.phase !== "final") {
    if (prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === result.winnerTeamId) {
      breakdown.winnerPoints = knockoutWinnerPoints(match.phase);
    }
    applyScorePoints(match, breakdown, result, prediction, 3, 2);
    if (prediction.predictsExtraTime === result.wentExtraTime) {
      breakdown.extraTimePoints = 3;
    }
    if (prediction.predictsPenalties === result.wentPenalties) {
      breakdown.penaltiesPoints = 3;
    }
  }

  if (match.phase === "final") {
    if (prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === result.winnerTeamId) {
      breakdown.winnerPoints = knockoutWinnerPoints(match.phase);
    }
    applyScorePoints(match, breakdown, result, prediction, 3, 2);

    if (prediction.predictsExtraTime === result.wentExtraTime) {
      breakdown.extraTimePoints = 3;
    }
    if (prediction.predictsPenalties === result.wentPenalties) {
      breakdown.penaltiesPoints = 3;
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
