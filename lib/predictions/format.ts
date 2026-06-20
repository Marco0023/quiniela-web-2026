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
  return `${formatPredictionSelection(prediction, match, teams)}, ${formatPredictionScore(prediction)}`;
}
