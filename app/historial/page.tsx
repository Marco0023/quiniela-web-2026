import { AppShell } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { formatKickoff } from "@/lib/format";
import { getDashboardData } from "@/lib/repository";
import { getScoringScore } from "@/lib/scoring";

export default async function HistoryPage() {
  const data = await getDashboardData();

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <SectionHeader eyebrow="Tus partidos" title="Historial de predicciones" />
      <div className="grid gap-3">
        {data.predictions.length === 0 ? (
          <Card>
            <p className="text-sm text-white/55">Todavía no tienes predicciones guardadas.</p>
          </Card>
        ) : null}
        {data.predictions.map((prediction) => {
          const match = data.matches.find((item) => item.id === prediction.matchId);
          if (!match) return null;
          const homeTeam = data.teams.find((team) => team.id === match.homeTeamId);
          const awayTeam = data.teams.find((team) => team.id === match.awayTeamId);
          const result = data.results.find((item) => item.matchId === match.id);
          const displayScore = result ? getScoringScore(match, result) : null;
          const markerLabel = match.phase === "group_stage" ? "Tu marcador" : "Tu marcador global";
          const resultLabel = match.phase === "group_stage" ? "Resultado" : "Resultado global";
          const status =
            match.status !== "finished"
              ? "pendiente"
              : prediction.pointsAwarded > 0
                ? "acerto"
                : "fallo";

          return (
            <Card key={prediction.id}>
              <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-2">
                  <p className="text-sm text-white/45">{formatKickoff(match.kickoffAt, data.profile.timezone)}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <TeamBadge team={homeTeam} fallback={match.homePlaceholder} />
                    <span className="text-white/35">vs</span>
                    <TeamBadge team={awayTeam} fallback={match.awayPlaceholder} />
                  </div>
                </div>
                <Badge tone={prediction.pointsAwarded > 0 ? "green" : "neutral"}>
                  {prediction.pointsAwarded} pts
                </Badge>
              </div>
              <div className="grid gap-2 border-t border-white/10 pt-3 text-sm text-white/62 md:grid-cols-3">
                <p>
                  <span className="font-bold text-white/80">{markerLabel}:</span>{" "}
                  {prediction.predictedHomeScore ?? "-"} - {prediction.predictedAwayScore ?? "-"}
                </p>
                <p>
                  <span className="font-bold text-white/80">{resultLabel}:</span>{" "}
                  {displayScore?.homeScore ?? "-"} - {displayScore?.awayScore ?? "-"}
                </p>
                <p>
                  <span className="font-bold text-white/80">Estado:</span> {status}
                </p>
              </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
