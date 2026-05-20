import type { ChampionPrediction, Match, MatchResult, Prediction, RankingSnapshot } from "@/lib/types";

export type BadgeId =
  | "five_correct_streak"
  | "world_champion"
  | "top_scorer"
  | "round_king"
  | "exact_score"
  | "three_exact_streak"
  | "cold_streak"
  | "first_after_two_rounds"
  | "perfect_round"
  | "survivor"
  | "unique_exact"
  | "missed_three_predictions"
  | "failed_round"
  | "two_unique_exact_round"
  | "first_prediction_1"
  | "first_prediction_2"
  | "first_prediction_3"
  | "first_exact_1"
  | "first_exact_2"
  | "best_single_match"
  | "exact_draw"
  | "back_to_top_three";

export type FunBadge = {
  id: BadgeId;
  emoji: string;
  title: string;
  description: string;
  category: "visible" | "hidden";
  status: "active" | "registered";
};

export const funBadges: FunBadge[] = [
  {
    id: "five_correct_streak",
    emoji: "🔥",
    title: "Soy muy buenoo!!",
    description: "Acertaste 5 partidos consecutivos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "world_champion",
    emoji: "🏆",
    title: "El papá de los helados",
    description: "Acertó el ganador del Mundial.",
    category: "visible",
    status: "active"
  },
  {
    id: "top_scorer",
    emoji: "⚽",
    title: "El diablo sabe más por viejo",
    description: "Acertó el goleador del torneo.",
    category: "visible",
    status: "registered"
  },
  {
    id: "round_king",
    emoji: "👑",
    title: "Rey de la Jornada",
    description: "Top 1 al cierre de la jornada.",
    category: "visible",
    status: "active"
  },
  {
    id: "exact_score",
    emoji: "🎯",
    title: "Precisión Absoluta",
    description: "Acertó exactamente un marcador.",
    category: "hidden",
    status: "active"
  },
  {
    id: "three_exact_streak",
    emoji: "👀",
    title: "Ojo de loca no se equivoca",
    description: "Acertó 3 marcadores exactos consecutivos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "cold_streak",
    emoji: "⁉️",
    title: "¿Qué es eso?",
    description: "No acierta nada después de 5 partidos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "first_after_two_rounds",
    emoji: "🏹",
    title: "No es el indio, es la flecha",
    description: "Sigue de primer lugar después de 2 jornadas.",
    category: "hidden",
    status: "active"
  },
  {
    id: "perfect_round",
    emoji: "💎",
    title: "SIUUU!",
    description: "Acertó todos los partidos de una jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "survivor",
    emoji: "😅",
    title: "Sobreviviente",
    description: "Salió del último lugar.",
    category: "hidden",
    status: "registered"
  },
  {
    id: "unique_exact",
    emoji: "💅",
    title: "Bendecida y afortunada",
    description: "Acertó un resultado que nadie en el grupo tenía.",
    category: "hidden",
    status: "active"
  },
  {
    id: "missed_three_predictions",
    emoji: "🐟",
    title: "Camarón que se duerme se lo lleva la corriente",
    description: "Olvidaste hacer tres predicciones.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round",
    emoji: "😂",
    title: "Más perdido que Adán el Día de las Madres",
    description: "Fallaste todos los partidos de una jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "two_unique_exact_round",
    emoji: "😎",
    title: "¿Viste? Yo te dije",
    description: "Acertó 2 resultados que nadie tenía en una misma jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "first_prediction_1",
    emoji: "🧐",
    title: "Vamo' a esto mi gente.",
    description: "Primera predicción guardada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "first_prediction_2",
    emoji: "🤪",
    title: "Toy ready.",
    description: "Primera predicción guardada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "first_prediction_3",
    emoji: "🤓",
    title: "Mano tengo fe.",
    description: "Primera predicción guardada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "first_exact_1",
    emoji: "😎",
    title: "Suban en nivel a esto.",
    description: "Primer marcador exacto.",
    category: "hidden",
    status: "active"
  },
  {
    id: "first_exact_2",
    emoji: "🥸",
    title: "Facilito",
    description: "Primer marcador exacto.",
    category: "hidden",
    status: "active"
  },
  {
    id: "best_single_match",
    emoji: "🤑",
    title: "Me quedé con el banco.",
    description: "Más puntos en un solo partido.",
    category: "hidden",
    status: "active"
  },
  {
    id: "exact_draw",
    emoji: "🥶",
    title: "Me llamaron loco.",
    description: "Acertar un empate exacto.",
    category: "hidden",
    status: "active"
  },
  {
    id: "back_to_top_three",
    emoji: "🥵",
    title: "¿Ya se comieron los tequeños?",
    description: "Volver al top 3 después de estar fuera.",
    category: "hidden",
    status: "registered"
  }
];

export const visibleBadgePreview = funBadges.filter((badge) => badge.category === "visible");

type RankingRow = {
  user: { id: string };
  points: number;
  rank: number;
};

export type BadgeEvaluationInput = {
  userId: string;
  ranking: RankingRow[];
  matches: Match[];
  results: MatchResult[];
  predictions: Prediction[];
  championPredictions: ChampionPrediction[];
  rankingSnapshots?: RankingSnapshot[];
  worldChampionTeamId?: string | null;
};

export function getBadgeById(id: BadgeId) {
  return funBadges.find((badge) => badge.id === id);
}

export function evaluateBadgesForUser(input: BadgeEvaluationInput) {
  const userPredictions = input.predictions
    .filter((prediction) => prediction.userId === input.userId)
    .sort((a, b) => matchTime(input.matches, a.matchId) - matchTime(input.matches, b.matchId));
  const userRanking = input.ranking.find((row) => row.user.id === input.userId);
  const badges = new Map<BadgeId, FunBadge>();

  const add = (id: BadgeId) => {
    const badge = getBadgeById(id);
    if (badge?.status === "active") badges.set(id, badge);
  };

  if (userPredictions.length > 0) {
    add(pickBadgeId(["first_prediction_1", "first_prediction_2", "first_prediction_3"], input.userId));
  }

  const evaluatedPredictions = userPredictions
    .map((prediction) => {
      const match = input.matches.find((item) => item.id === prediction.matchId);
      const result = input.results.find((item) => item.matchId === prediction.matchId);
      if (!match || !result) return null;
      return {
        prediction,
        match,
        result,
        isCorrect: isCorrectMatch(match, result, prediction),
        isExact: isExactScore(match, result, prediction),
        isExactDraw: isExactDraw(match, result, prediction)
      };
    })
    .filter((item) => item !== null);

  if (evaluatedPredictions.some((item) => item.isExact)) {
    add(pickBadgeId(["first_exact_1", "first_exact_2"], `${input.userId}-exact`));
    add("exact_score");
  }
  if (evaluatedPredictions.some((item) => item.isExactDraw)) add("exact_draw");
  if (hasConsecutive(evaluatedPredictions.map((item) => item.isCorrect), 5)) add("five_correct_streak");
  if (hasConsecutive(evaluatedPredictions.map((item) => item.isExact), 3)) add("three_exact_streak");
  if (hasConsecutive(evaluatedPredictions.map((item) => !item.isCorrect), 5)) add("cold_streak");

  const bestGroupScore = Math.max(0, ...input.predictions.map((prediction) => prediction.pointsAwarded));
  if (bestGroupScore > 0 && userPredictions.some((prediction) => prediction.pointsAwarded === bestGroupScore)) {
    add("best_single_match");
  }

  if (hasUniqueExact(input.userId, input.matches, input.results, input.predictions)) add("unique_exact");
  if (hasTwoUniqueExactInRound(input.userId, input.matches, input.results, input.predictions)) add("two_unique_exact_round");
  if (hasPerfectRound(input.userId, input.matches, input.results, input.predictions)) add("perfect_round");
  if (hasFailedRound(input.userId, input.matches, input.results, input.predictions)) add("failed_round");

  const finishedMatchIds = input.results.map((result) => result.matchId);
  const missedPredictions = finishedMatchIds.filter(
    (matchId) => !userPredictions.some((prediction) => prediction.matchId === matchId)
  );
  if (missedPredictions.length >= 3) add("missed_three_predictions");

  if (userRanking?.rank === 1 && userRanking.points > 0) add("round_king");
  if (heldFirstAcrossRecentSnapshots(input.userId, input.rankingSnapshots) || (userRanking?.rank === 1 && userRanking.points > 0 && roundKeys(input.matches, input.results).length >= 2)) {
    add("first_after_two_rounds");
  }
  if (escapedLastPlace(input.userId, userRanking?.rank, input.rankingSnapshots)) add("survivor");
  if (returnedToTopThree(input.userId, userRanking?.rank, input.rankingSnapshots)) add("back_to_top_three");

  const champion = input.championPredictions.find((prediction) => prediction.userId === input.userId);
  if (champion?.teamId && input.worldChampionTeamId && champion.teamId === input.worldChampionTeamId) {
    add("world_champion");
  }

  return [...badges.values()];
}

function heldFirstAcrossRecentSnapshots(userId: string, snapshots: RankingSnapshot[] = []) {
  const userSnapshots = snapshots
    .filter((snapshot) => snapshot.userId === userId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (userSnapshots.length < 2) return false;
  return userSnapshots.slice(-2).every((snapshot) => snapshot.rank === 1);
}

function escapedLastPlace(userId: string, currentRank = 0, snapshots: RankingSnapshot[] = []) {
  if (!currentRank) return false;
  return snapshots.some(
    (snapshot) =>
      snapshot.userId === userId &&
      snapshot.totalParticipants > 1 &&
      snapshot.rank === snapshot.totalParticipants &&
      currentRank < snapshot.totalParticipants
  );
}

function returnedToTopThree(userId: string, currentRank = 0, snapshots: RankingSnapshot[] = []) {
  if (!currentRank || currentRank > 3) return false;
  return snapshots.some((snapshot) => snapshot.userId === userId && snapshot.rank > 3);
}

export function badgesForRankingRow(rank: number, points: number): FunBadge[] {
  if (rank === 1 && points > 0) {
    return [getBadgeById("round_king")!];
  }

  return [];
}

export function recentBadgesForUser(input: BadgeEvaluationInput) {
  return evaluateBadgesForUser(input).slice(0, 2);
}

function pickBadgeId<T extends BadgeId>(ids: T[], seed: string) {
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return ids[total % ids.length];
}

function matchTime(matches: Match[], matchId: string) {
  const match = matches.find((item) => item.id === matchId);
  return match ? new Date(match.kickoffAt).getTime() : 0;
}

function isCorrectMatch(match: Match, result: MatchResult, prediction: Prediction) {
  if (match.phase === "group_stage") {
    return prediction.predictedOutcome === getActualOutcome(result.homeScore90, result.awayScore90);
  }

  return Boolean(prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === result.winnerTeamId);
}

function isExactScore(match: Match, result: MatchResult, prediction: Prediction) {
  if (match.phase !== "group_stage" && match.phase !== "final") return false;

  return (
    prediction.predictedHomeScore !== null &&
    prediction.predictedAwayScore !== null &&
    prediction.predictedHomeScore === result.homeScore90 &&
    prediction.predictedAwayScore === result.awayScore90
  );
}

function isExactDraw(match: Match, result: MatchResult, prediction: Prediction) {
  return (
    match.phase === "group_stage" &&
    result.homeScore90 !== null &&
    result.awayScore90 !== null &&
    result.homeScore90 === result.awayScore90 &&
    isExactScore(match, result, prediction)
  );
}

function hasConsecutive(values: boolean[], target: number) {
  let streak = 0;
  for (const value of values) {
    streak = value ? streak + 1 : 0;
    if (streak >= target) return true;
  }
  return false;
}

function hasUniqueExact(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return exactPredictionsForUser(userId, matches, results, predictions).some((prediction) =>
    isUniqueScorePrediction(prediction, predictions)
  );
}

function hasTwoUniqueExactInRound(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  const byRound = new Map<string, number>();
  for (const prediction of exactPredictionsForUser(userId, matches, results, predictions)) {
    if (!isUniqueScorePrediction(prediction, predictions)) continue;
    const key = roundKey(matches.find((match) => match.id === prediction.matchId));
    byRound.set(key, (byRound.get(key) ?? 0) + 1);
  }
  return [...byRound.values()].some((count) => count >= 2);
}

function exactPredictionsForUser(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return predictions.filter((prediction) => {
    if (prediction.userId !== userId) return false;
    const match = matches.find((item) => item.id === prediction.matchId);
    const result = results.find((item) => item.matchId === prediction.matchId);
    return Boolean(match && result && isExactScore(match, result, prediction));
  });
}

function isUniqueScorePrediction(prediction: Prediction, predictions: Prediction[]) {
  if (prediction.predictedHomeScore === null || prediction.predictedAwayScore === null) return false;

  return (
    predictions.filter(
      (item) =>
        item.matchId === prediction.matchId &&
        item.predictedHomeScore === prediction.predictedHomeScore &&
        item.predictedAwayScore === prediction.predictedAwayScore
    ).length === 1
  );
}

function hasPerfectRound(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return roundKeys(matches, results).some((key) => {
    const roundMatches = matches.filter((match) => roundKey(match) === key && results.some((result) => result.matchId === match.id));
    if (roundMatches.length === 0) return false;
    const userRoundPredictions = predictions.filter(
      (prediction) => prediction.userId === userId && roundMatches.some((match) => match.id === prediction.matchId)
    );
    return (
      userRoundPredictions.length === roundMatches.length &&
      userRoundPredictions.every((prediction) => {
        const match = matches.find((item) => item.id === prediction.matchId);
        const result = results.find((item) => item.matchId === prediction.matchId);
        return Boolean(match && result && isCorrectMatch(match, result, prediction));
      })
    );
  });
}

function hasFailedRound(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return roundKeys(matches, results).some((key) => {
    const roundMatches = matches.filter((match) => roundKey(match) === key && results.some((result) => result.matchId === match.id));
    const userRoundPredictions = predictions.filter(
      (prediction) => prediction.userId === userId && roundMatches.some((match) => match.id === prediction.matchId)
    );
    return userRoundPredictions.length > 0 && userRoundPredictions.every((prediction) => prediction.pointsAwarded === 0);
  });
}

function roundKeys(matches: Match[], results: MatchResult[]) {
  return [...new Set(matches.filter((match) => results.some((result) => result.matchId === match.id)).map(roundKey))];
}

function roundKey(match?: Match) {
  if (!match) return "unknown";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(match.kickoffAt));
}

function getActualOutcome(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}
