import type { ChampionPrediction, Match, MatchResult, Prediction, RankingSnapshot } from "@/lib/types";

export type BadgeId =
  | "five_correct_streak"
  | "hot_machine"
  | "future_alien"
  | "rank_jump_two"
  | "world_champion"
  | "two_exact_streak"
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
  | "failed_round_cry_valley"
  | "failed_round_no_hits_today"
  | "failed_round_faith_no_hits"
  | "failed_round_complicated_day"
  | "failed_round_missing_coffee"
  | "failed_round_world_mysteries"
  | "failed_round_feelings_no_points"
  | "failed_round_salado_sirenita"
  | "failed_round_cachapa_budare"
  | "correct_prediction_in_round"
  | "correct_round_warming_up"
  | "correct_round_step_by_step"
  | "correct_round_balanced"
  | "all_group_stage_predictions_saved"
  | "two_unique_exact_round"
  | "first_prediction_1"
  | "first_prediction_2"
  | "first_prediction_3"
  | "first_exact_1"
  | "first_exact_2"
  | "best_single_match"
  | "exact_draw"
  | "back_to_top_three"
  | "goal_difference_only"
  | "two_goal_difference_hits"
  | "underdog_pick";

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
    description: "Acertaste 2 partidos consecutivos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "hot_machine",
    emoji: "🔥",
    title: "La máquina está prendía",
    description: "Acertaste 2 partidos consecutivos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "future_alien",
    emoji: "👽",
    title: "Vengo del futuro",
    description: "Acertaste 4 partidos consecutivos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "rank_jump_two",
    emoji: "📈",
    title: "Subiendo como espuma",
    description: "Subiste al menos 2 posiciones en el ranking.",
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
    id: "two_exact_streak",
    emoji: "⚽",
    title: "El diablo sabe más por viejo",
    description: "Sacaste 6 puntos en 2 partidos consecutivos.",
    category: "visible",
    status: "active"
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
    description: "Acertaste 3 marcadores exactos consecutivos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "three_exact_streak",
    emoji: "👀",
    title: "Ojo de loca no se equivoca",
    description: "Acertaste 1 marcador exacto.",
    category: "hidden",
    status: "active"
  },
  {
    id: "cold_streak",
    emoji: "⁉️",
    title: "¿Qué es eso?",
    description: "No acertaste ninguna predicción de la jornada.",
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
    status: "active"
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
    description: "Olvidaste hacer la predicción del último partido.",
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
    id: "failed_round_cry_valley",
    emoji: "😭",
    title: "A llorar pal valle",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_no_hits_today",
    emoji: "😂",
    title: "Hoy no pegaste ni una.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_faith_no_hits",
    emoji: "🥲",
    title: "Con fe… pero sin aciertos.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_complicated_day",
    emoji: "🌧️",
    title: "Jornada complicada hasta para los expertos.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_missing_coffee",
    emoji: "☕",
    title: "Capaz faltó café antes de predecir.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_world_mysteries",
    emoji: "🌎",
    title: "El Mundial y sus misterios.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_feelings_no_points",
    emoji: "🥹",
    title: "Tus predicciones dieron sentimientos, no puntos.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_salado_sirenita",
    emoji: "🧜‍♀️",
    title: "Más salado que la sirenita",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "failed_round_cachapa_budare",
    emoji: "🫓",
    title: "Te dieron más vueltas que cachapa en budare.",
    description: "No acertaste ninguna predicción de la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "correct_prediction_in_round",
    emoji: "😎",
    title: "Ahhh pero tu si sabe",
    description: "Acertar una predicción en la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "correct_round_warming_up",
    emoji: "🔥",
    title: "Calentando motores.",
    description: "Acertar una predicción en la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "correct_round_step_by_step",
    emoji: "🐢",
    title: "Paso a paso también se llega.",
    description: "Acertar una predicción en la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "correct_round_balanced",
    emoji: "😅",
    title: "Ni tan tan… ni muy muy.",
    description: "Acertar una predicción en la jornada.",
    category: "hidden",
    status: "active"
  },
  {
    id: "all_group_stage_predictions_saved",
    emoji: "🏎️",
    title: "Francesco es demasiado rapido",
    description: "Guardar todas las predicciones de la fase de grupos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "two_unique_exact_round",
    emoji: "😎",
    title: "¿Viste? Yo te dije",
    description: "Acertaste 2 marcadores exactos consecutivos.",
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
    status: "active"
  },
  {
    id: "goal_difference_only",
    emoji: "🙏🏽",
    title: "El poder de la fe",
    description: "Acertaste solo la diferencia de goles.",
    category: "hidden",
    status: "active"
  },
  {
    id: "two_goal_difference_hits",
    emoji: "🧠",
    title: "Calculadora humana",
    description: "Acertaste la diferencia de goles en 2 partidos distintos.",
    category: "hidden",
    status: "active"
  },
  {
    id: "underdog_pick",
    emoji: "🎲",
    title: "La corazonada salió buena",
    description: "Acertaste una predicción que eligió menos del 25% del grupo.",
    category: "hidden",
    status: "active"
  }
];

export const visibleBadgePreview = funBadges.filter((badge) => badge.category === "visible");

const failedRoundBadgeIds = [
  "cold_streak",
  "failed_round",
  "failed_round_cry_valley",
  "failed_round_no_hits_today",
  "failed_round_faith_no_hits",
  "failed_round_complicated_day",
  "failed_round_missing_coffee",
  "failed_round_world_mysteries",
  "failed_round_feelings_no_points",
  "failed_round_salado_sirenita",
  "failed_round_cachapa_budare"
] satisfies BadgeId[];

export const liveBadgeIds = new Set<BadgeId>([
  "five_correct_streak",
  "hot_machine",
  "future_alien",
  "two_exact_streak",
  "round_king",
  "exact_score",
  "three_exact_streak",
  "cold_streak",
  "first_after_two_rounds",
  "missed_three_predictions",
  "two_unique_exact_round",
  ...failedRoundBadgeIds
]);

const correctRoundBadgeIds = [
  "correct_prediction_in_round",
  "correct_round_warming_up",
  "correct_round_step_by_step",
  "correct_round_balanced"
] satisfies BadgeId[];

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

  const evaluatedPredictions = evaluatedPredictionsForUser(input.userId, input.matches, input.results, input.predictions);
  const currentEvaluations = currentFinishedEvaluations(input.userId, input.matches, input.results, input.predictions);
  const currentCorrectStreak = countCurrentStreak(currentEvaluations, (item) => item.isCorrect);
  const currentExactStreak = countCurrentStreak(currentEvaluations, (item) => item.isExact);
  const currentSixPointStreak = countCurrentStreak(currentEvaluations, (item) => item.basePoints === 6);

  if (evaluatedPredictions.some((item) => item.isExact)) {
    add(pickBadgeId(["first_exact_1", "first_exact_2"], `${input.userId}-exact`));
  }
  if (evaluatedPredictions.some((item) => item.isExactDraw)) add("exact_draw");
  if (currentCorrectStreak >= 2) add(pickBadgeId(["five_correct_streak", "hot_machine"], `${input.userId}-correct-streak`));
  if (currentCorrectStreak >= 4) add("future_alien");
  if (currentSixPointStreak >= 2) add("two_exact_streak");
  if (currentExactStreak >= 3) add("exact_score");
  else if (currentExactStreak >= 2) add("two_unique_exact_round");
  else if (currentExactStreak >= 1) add("three_exact_streak");
  if (evaluatedPredictions.some((item) => item.isGoalDifferenceOnly)) add("goal_difference_only");
  if (evaluatedPredictions.filter((item) => item.isGoalDifferenceHit).length >= 2) add("two_goal_difference_hits");
  if (hasUnderdogPick(input.userId, input.matches, input.results, input.predictions)) add("underdog_pick");

  const bestGroupScore = Math.max(0, ...input.predictions.map((prediction) => prediction.pointsAwarded));
  if (bestGroupScore > 0 && userPredictions.some((prediction) => prediction.pointsAwarded === bestGroupScore)) {
    add("best_single_match");
  }

  if (hasUniqueExact(input.userId, input.matches, input.results, input.predictions)) add("unique_exact");
  if (hasPerfectRound(input.userId, input.matches, input.results, input.predictions)) add("perfect_round");
  const correctRoundKey = correctRoundForUser(input.userId, input.matches, input.results, input.predictions);
  if (correctRoundKey) add(pickBadgeId(correctRoundBadgeIds, `${input.userId}-${correctRoundKey}-correct-round`));

  const failedRoundKey = failedRoundForUser(input.userId, input.matches, input.results, input.predictions);
  if (failedRoundKey) add(pickBadgeId(failedRoundBadgeIds, `${input.userId}-${failedRoundKey}-failed-round`));

  if (hasAllGroupStagePredictions(input.userId, input.matches, input.predictions)) {
    add("all_group_stage_predictions_saved");
  }

  if (missedLatestFinishedMatch(input.userId, input.matches, input.results, input.predictions)) {
    add("missed_three_predictions");
  }

  if (userRanking?.rank === 1 && userRanking.points > 0) add("round_king");
  if (heldFirstAcrossRecentSnapshots(input.userId, input.rankingSnapshots) || (userRanking?.rank === 1 && userRanking.points > 0 && roundKeys(input.matches, input.results).length >= 2)) {
    add("first_after_two_rounds");
  }
  if (escapedLastPlace(input.userId, userRanking?.rank, input.rankingSnapshots)) add("survivor");
  if (returnedToTopThree(input.userId, userRanking?.rank, input.rankingSnapshots)) add("back_to_top_three");
  if (jumpedAtLeastTwoRanks(input.userId, input.rankingSnapshots)) add("rank_jump_two");

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

function jumpedAtLeastTwoRanks(userId: string, snapshots: RankingSnapshot[] = []) {
  const userSnapshots = snapshots
    .filter((snapshot) => snapshot.userId === userId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (userSnapshots.length < 2) return false;

  const previous = userSnapshots[userSnapshots.length - 2];
  const latest = userSnapshots[userSnapshots.length - 1];
  return previous.rank - latest.rank >= 2;
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

function hasUniqueExact(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return exactPredictionsForUser(userId, matches, results, predictions).some((prediction) =>
    isUniqueScorePrediction(prediction, predictions)
  );
}

function exactPredictionsForUser(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return predictions.filter((prediction) => {
    if (prediction.userId !== userId) return false;
    const match = matches.find((item) => item.id === prediction.matchId);
    const result = results.find((item) => item.matchId === prediction.matchId);
    return Boolean(match && result && hasCompletedResult(result) && isExactScore(match, result, prediction));
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
    const roundMatches = matches.filter((match) => roundKey(match) === key && results.some((result) => result.matchId === match.id && hasCompletedResult(result)));
    if (roundMatches.length === 0) return false;
    const userRoundPredictions = predictions.filter(
      (prediction) => prediction.userId === userId && roundMatches.some((match) => match.id === prediction.matchId)
    );
    return (
      userRoundPredictions.length === roundMatches.length &&
      userRoundPredictions.every((prediction) => {
        const match = matches.find((item) => item.id === prediction.matchId);
        const result = results.find((item) => item.matchId === prediction.matchId);
        return Boolean(match && result && hasCompletedResult(result) && isCorrectMatch(match, result, prediction));
      })
    );
  });
}

function correctRoundForUser(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return roundKeys(matches, results).find((key) => {
    const roundMatches = matches.filter((match) => roundKey(match) === key && results.some((result) => result.matchId === match.id && hasCompletedResult(result)));
    const userRoundPredictions = predictions.filter(
      (prediction) => prediction.userId === userId && roundMatches.some((match) => match.id === prediction.matchId)
    );
    return userRoundPredictions.some((prediction) => {
      const match = matches.find((item) => item.id === prediction.matchId);
      const result = results.find((item) => item.matchId === prediction.matchId);
      return Boolean(match && result && hasCompletedResult(result) && isCorrectMatch(match, result, prediction));
    });
  });
}

function failedRoundForUser(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  const latestRoundKey = roundKeys(matches, results).at(-1);
  if (!latestRoundKey) return undefined;

  const roundMatches = matches.filter((match) => roundKey(match) === latestRoundKey && results.some((result) => result.matchId === match.id && hasCompletedResult(result)));
  const userRoundPredictions = predictions.filter(
    (prediction) => prediction.userId === userId && roundMatches.some((match) => match.id === prediction.matchId)
  );

  return userRoundPredictions.length > 0 && userRoundPredictions.every((prediction) => prediction.pointsAwarded === 0)
    ? latestRoundKey
    : undefined;
}

function hasAllGroupStagePredictions(userId: string, matches: Match[], predictions: Prediction[]) {
  const groupStageMatches = matches.filter((match) => match.phase === "group_stage");
  if (groupStageMatches.length === 0) return false;

  return groupStageMatches.every((match) =>
    predictions.some((prediction) => prediction.userId === userId && prediction.matchId === match.id)
  );
}

function roundKeys(matches: Match[], results: MatchResult[]) {
  return [...new Set(matches.filter((match) => results.some((result) => result.matchId === match.id && hasCompletedResult(result))).map(roundKey))];
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

function evaluatedPredictionsForUser(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return predictions
    .filter((prediction) => prediction.userId === userId)
    .map((prediction) => {
      const match = matches.find((item) => item.id === prediction.matchId);
      const result = results.find((item) => item.matchId === prediction.matchId);
      if (!match || !result || !hasCompletedResult(result)) return null;
      const isCorrect = isCorrectMatch(match, result, prediction);
      const isExact = isExactScore(match, result, prediction);
      const isGoalDifferenceHit = hasGoalDifferenceHit(match, result, prediction);

      return {
        prediction,
        match,
        result,
        isCorrect,
        isExact,
        isExactDraw: isExactDraw(match, result, prediction),
        isGoalDifferenceHit,
        isGoalDifferenceOnly: isGoalDifferenceHit && !isCorrect && !isExact,
        basePoints: baseMatchPoints(match, result, prediction)
      };
    })
    .filter((item) => item !== null)
    .sort((a, b) => matchTime(matches, a.match.id) - matchTime(matches, b.match.id));
}

function currentFinishedEvaluations(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return matches
    .filter((match) => results.some((result) => result.matchId === match.id && hasCompletedResult(result)))
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
    .map((match) => {
      const result = results.find((item) => item.matchId === match.id && hasCompletedResult(item))!;
      const prediction = predictions.find((item) => item.userId === userId && item.matchId === match.id);
      if (!prediction) {
        return {
          match,
          result,
          prediction: null,
          isCorrect: false,
          isExact: false,
          basePoints: 0
        };
      }

      return {
        match,
        result,
        prediction,
        isCorrect: isCorrectMatch(match, result, prediction),
        isExact: isExactScore(match, result, prediction),
        basePoints: baseMatchPoints(match, result, prediction)
      };
    });
}

function countCurrentStreak<T>(items: T[], predicate: (item: T) => boolean) {
  let count = 0;
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (!predicate(items[index])) break;
    count += 1;
  }
  return count;
}

function missedLatestFinishedMatch(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  const latestMatch = matches
    .filter((match) => results.some((result) => result.matchId === match.id && hasCompletedResult(result)))
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())[0];

  return Boolean(latestMatch && !predictions.some((prediction) => prediction.userId === userId && prediction.matchId === latestMatch.id));
}

function baseMatchPoints(match: Match, result: MatchResult, prediction: Prediction) {
  let points = 0;
  if (isCorrectMatch(match, result, prediction)) points += 3;
  if (isExactScore(match, result, prediction)) points += 2;
  if (hasGoalDifferenceHit(match, result, prediction)) points += 1;
  return points;
}

function hasGoalDifferenceHit(match: Match, result: MatchResult, prediction: Prediction) {
  if (match.phase !== "group_stage" && match.phase !== "final") return false;
  if (
    prediction.predictedHomeScore === null ||
    prediction.predictedAwayScore === null ||
    result.homeScore90 === null ||
    result.awayScore90 === null
  ) {
    return false;
  }

  if (result.homeScore90 === result.awayScore90) return false;

  const predictedDiff = Math.abs(prediction.predictedHomeScore - prediction.predictedAwayScore);
  const actualDiff = Math.abs(result.homeScore90 - result.awayScore90);
  return predictedDiff === actualDiff;
}

function hasUnderdogPick(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  return predictions.some((prediction) => {
    if (prediction.userId !== userId) return false;
    const match = matches.find((item) => item.id === prediction.matchId);
    const result = results.find((item) => item.matchId === prediction.matchId);
    if (!match || !result || !hasCompletedResult(result) || !isCorrectMatch(match, result, prediction)) return false;

    const matchPredictions = predictions.filter((item) => item.matchId === prediction.matchId);
    if (matchPredictions.length === 0) return false;

    const selectedSameResult = matchPredictions.filter((item) => samePredictedResult(match, prediction, item)).length;
    return selectedSameResult / matchPredictions.length < 0.25;
  });
}

function samePredictedResult(match: Match, prediction: Prediction, other: Prediction) {
  if (match.phase === "group_stage") {
    return prediction.predictedOutcome === other.predictedOutcome;
  }

  return Boolean(prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === other.predictedWinnerTeamId);
}

function hasCompletedResult(result: MatchResult) {
  return (
    (result.homeScore90 !== null && result.awayScore90 !== null) ||
    result.winnerTeamId !== null ||
    result.homeScoreFinal !== null ||
    result.awayScoreFinal !== null
  );
}

function getActualOutcome(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}
