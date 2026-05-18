import { Trophy, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MatchCard } from "@/components/match-card";
import { RankingTable } from "@/components/ranking-table";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/repository";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const championTeam = data.teams.find((team) => team.id === data.champion?.teamId);
  const pendingMatches = data.matches.filter(
    (match) => !data.predictions.some((prediction) => prediction.matchId === match.id)
  );

  return (
    <AppShell>
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gold">Hola, {data.profile.firstName}</p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-ink md:text-5xl">
                  Tu grupo ya esta listo para el Mundial.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
                  Ranking privado, predicciones cerradas antes de cada partido y puntos automaticos para
                  {data.group ? ` ${data.group.name}` : " tu grupo"}.
                </p>
              </div>
              <Badge tone="gold">{data.profile.alias}</Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-md bg-gold text-pitch">
                <Trophy className="size-6" />
              </div>
              <div>
                <p className="text-sm text-white/55">Campeon elegido</p>
                <h2 className="text-xl font-black">{championTeam?.name ?? "Pendiente"}</h2>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/55">Tus puntos</span>
              <span className="text-2xl font-black text-gold">
                {data.ranking.find((row) => row.user.id === data.profile.id)?.points ?? 0}
              </span>
            </div>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <SectionHeader eyebrow="Grupo" title="Ranking completo" />
            <RankingTable ranking={data.ranking} currentUserId={data.profile.id} />
          </div>
          <div className="grid gap-5">
            <div>
              <SectionHeader eyebrow="Siguiente" title="Predicciones pendientes" />
              <div className="grid gap-3">
                {pendingMatches.slice(0, 3).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teams={data.teams}
                    timezone={data.profile.timezone}
                  />
                ))}
              </div>
            </div>
            <Card>
              <div className="flex items-center gap-3">
                <UserRoundCheck className="size-5 text-emeraldGlow" />
                <div>
                  <p className="font-bold">Historial reciente</p>
                  <p className="text-sm text-white/55">{data.predictions.length} predicciones guardadas</p>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
