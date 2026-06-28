import { EyeOff } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { Match, Prediction, Profile, Team } from "@/lib/types";

export function GroupPredictions({
  isRevealed,
  match,
  predictions,
  users,
  teams
}: {
  isRevealed: boolean;
  match: Match;
  predictions: Prediction[];
  users: Profile[];
  teams: Team[];
}) {
  if (!isRevealed) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-white/10 text-white/60">
            <EyeOff className="size-5" />
          </div>
          <div>
            <h2 className="font-black">Predicciones del grupo</h2>
            <p className="text-sm text-white/55">Se revelan 5 minutos antes del inicio del partido.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-black">Predicciones del grupo</h2>
        <p className="text-sm text-white/55">{predictions.length} predicciones realizadas</p>
      </div>
      {predictions.length === 0 ? (
        <p className="px-4 py-5 text-sm text-white/55">Todavía no hay predicciones guardadas para mostrar.</p>
      ) : (
        <div className="divide-y divide-white/10">
          {predictions.map((prediction) => {
            const user = users.find((item) => item.id === prediction.userId);
            return (
              <div key={prediction.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-bold">{user?.alias ?? "Usuario"}</p>
                  <p className="text-sm text-white/55">{formatPrediction(prediction, match, teams)}</p>
                </div>
                <Badge tone={prediction.pointsAwarded > 0 ? "green" : "neutral"}>{prediction.pointsAwarded} pts</Badge>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function formatPrediction(prediction: Prediction, match: Match, teams: Team[]) {
  if (prediction.predictionType === "group_stage") {
    const outcomeLabels = {
      home: "Gana local",
      draw: "Empate",
      away: "Gana visitante"
    };
    const score =
      prediction.predictedHomeScore !== null && prediction.predictedAwayScore !== null
        ? `, marcador ${prediction.predictedHomeScore}-${prediction.predictedAwayScore}`
        : "";
    return `${prediction.predictedOutcome ? outcomeLabels[prediction.predictedOutcome] : "Sin selección"}${score}`;
  }

  const winner = teams.find((team) => team.id === prediction.predictedWinnerTeamId);
  const score =
    prediction.predictedHomeScore !== null && prediction.predictedAwayScore !== null
      ? `, global ${prediction.predictedHomeScore}-${prediction.predictedAwayScore}`
      : "";
  const extra = `, prórroga ${prediction.predictsExtraTime ? "Sí" : "No"}`;
  const penalties = `, penales ${prediction.predictsPenalties ? "Sí" : "No"}`;
  return `${match.phase === "final" ? "Campeón" : "Avanza"} ${winner?.name ?? "por definir"}${score}${extra}${penalties}`;
}
