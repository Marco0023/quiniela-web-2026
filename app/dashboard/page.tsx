import Image from "next/image";
import { Trophy, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MatchCard } from "@/components/match-card";
import { RankingTable } from "@/components/ranking-table";
import { TodayMatches } from "@/components/today-matches";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { recentBadgesForUser } from "@/lib/badges";
import { getDashboardData } from "@/lib/repository";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const championTeam = data.teams.find((team) => team.id === data.champion?.teamId);
  const pendingMatches = data.matches.filter(
    (match) => !data.predictions.some((prediction) => prediction.matchId === match.id)
  );
  const groupName = data.group?.name ?? "tu grupo";
  const currentRanking = data.ranking.find((row) => row.user.id === data.profile.id);
  const recentBadges = recentBadgesForUser({
    userId: data.profile.id,
    rank: currentRanking?.rank ?? 0,
    points: currentRanking?.points ?? 0,
    predictionCount: data.predictions.length,
    bestMatchPoints: data.predictions.reduce((best, prediction) => Math.max(best, prediction.pointsAwarded), 0)
  });

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gold">Hola, {data.profile.firstName}</p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-ink md:text-5xl">
                  Bienvenido/a a la competencia para demostrar tu sabiduría mundialista.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
                  Conviértete en la persona más sabia de {groupName}. Aquí se gana con memoria,
                  intuición y una pizca de descaro futbolero.
                </p>
              </div>
              <Badge tone="gold">{data.profile.alias}</Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-md bg-gold text-pitch">
                {championTeam?.flagUrl ? (
                  <Image
                    src={championTeam.flagUrl}
                    alt=""
                    width={44}
                    height={32}
                    className="h-8 w-11 rounded-sm object-cover"
                  />
                ) : (
                  <Trophy className="size-6" />
                )}
              </div>
              <div>
                <p className="text-sm text-white/55">Campeón elegido</p>
                <h2 className="text-xl font-black">{championTeam?.name ?? "Pendiente"}</h2>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/55">Tus puntos</span>
              <span className="text-2xl font-black text-gold">{currentRanking?.points ?? 0}</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-white/55">Posición en el ranking</span>
              <span className="text-lg font-black text-ink">{currentRanking ? `#${currentRanking.rank}` : "---"}</span>
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-sm font-bold text-white/72">Últimas insignias</p>
              {recentBadges.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentBadges.map((badge) => (
                    <span
                      key={badge.title}
                      className="rounded-md border border-gold/20 bg-gold/10 px-2.5 py-1.5 text-xs font-bold text-gold"
                      title={badge.description}
                    >
                      {badge.emoji} {badge.title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-white/45">Todavía no tienes insignias.</p>
              )}
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

        <TodayMatches
          matches={data.matches}
          predictions={data.groupPredictions}
          users={data.groupUsers}
          teams={data.teams}
          results={data.results}
          timezone={data.profile.timezone}
        />
      </div>
    </AppShell>
  );
}
