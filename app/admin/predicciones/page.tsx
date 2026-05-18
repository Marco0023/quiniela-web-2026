import { AppShell } from "@/components/app-shell";
import { Card, SectionHeader } from "@/components/ui";
import { getAdminPredictionsData } from "@/lib/repository";

export default async function AdminPredictionsPage() {
  const data = await getAdminPredictionsData();

  return (
    <AppShell>
      <SectionHeader eyebrow="Admin" title="Predicciones" />
      <Card className="overflow-hidden p-0">
        {data.predictions.length === 0 ? (
          <p className="px-4 py-5 text-sm text-white/55">Todavia no hay predicciones guardadas.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Partido</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Seleccion</th>
                <th className="px-4 py-3">Marcador</th>
                <th className="px-4 py-3">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.predictions.map((prediction) => {
                const user = data.users.find((profile) => profile.id === prediction.userId);
                const match = data.matches.find((item) => item.id === prediction.matchId);
                const winnerTeam = data.teams.find((team) => team.id === prediction.predictedWinnerTeamId);
                return (
                  <tr key={prediction.id}>
                    <td className="px-4 py-3 font-bold">{user?.alias}</td>
                    <td className="px-4 py-3 text-white/70">Partido {match?.matchNumber}</td>
                    <td className="px-4 py-3 text-white/70">{prediction.predictionType}</td>
                    <td className="px-4 py-3 text-white/70">{prediction.predictedOutcome ?? winnerTeam?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-white/70">
                      {prediction.predictedHomeScore ?? "-"} - {prediction.predictedAwayScore ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-black text-gold">{prediction.pointsAwarded}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </AppShell>
  );
}
