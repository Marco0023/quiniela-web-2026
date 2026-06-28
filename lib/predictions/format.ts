import type { Match, Prediction, Team } from "@/lib/types";

export function formatPredictionSelection(prediction: Prediction, match: Match, teams: Team[]) {
  if (prediction.predictionType === "group_stage") {
    if (prediction.predictedOutcome === "draw") return "Empate";
    if (prediction.predictedOutcome === "home") return teams.find((team) => team.id === match.homeTeamId)?.name ?? "Local";
    if (prediction.predictedOutcome === "away") return teams.find((team) => team.id === match.awayTeamId)?.name ?? "Visitante";
    return "Sin selección";
  }

  return teams.find((team) => team.id === prediction.predictedWinnerTeamId)?.name ?? "Por definir";
}

export function formatPredictionScore(prediction: Prediction, emptyLabel = "sin marcador") {
  if (prediction.predictedHomeScore === null || prediction.predictedAwayScore === null) return emptyLabel;
  return `${prediction.predictedHomeScore}-${prediction.predictedAwayScore}`;
}

export function formatPredictionSummary(prediction: Prediction, match: Match, teams: Team[]) {
  const score = formatPredictionScore(prediction);
  const base =
    prediction.predictionType === "group_stage"
      ? `${formatPredictionSelection(prediction, match, teams)}, ${score}`
      : `${formatPredictionSelection(prediction, match, teams)}, global ${score}`;
  if (prediction.predictionType === "group_stage") return base;

  return `${base}, prórroga ${prediction.predictsExtraTime ? "Sí" : "No"}, penales ${prediction.predictsPenalties ? "Sí" : "No"}`;
}
