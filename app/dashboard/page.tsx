import Image from "next/image";
import { Trophy, UserRoundCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { BadgeChip } from "@/components/badge-chip";
import { MatchCard } from "@/components/match-card";
import { RankingTable } from "@/components/ranking-table";
import { TodayMatches } from "@/components/today-matches";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getBadgeById } from "@/lib/badges";
import { getDashboardData } from "@/lib/repository";
import { isPredictionLocked } from "@/lib/scoring";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const championTeam = data.teams.find((team) => team.id === data.champion?.teamId);
  const pendingMatches = data.matches.filter(
    (match) =>
      match.homeTeamId &&
      match.awayTeamId &&
      !isPredictionLocked(match.kickoffAt) &&
      !data.predictions.some((prediction) => prediction.matchId === match.id)
  );
  const groupName = data.group?.name ?? "tu grupo";
  const currentRanking = data.ranking.find((row) => row.user.id === data.profile.id);
  const badgesByUser = data.activeBadgeEvents.reduce<Record<string, NonNullable<ReturnType<typeof getBadgeById>>[]>>(
    (items, event) => {
      const badge = getBadgeById(event.badgeId as Parameters<typeof getBadgeById>[0]);
      if (!badge) return items;
      items[event.userId] = [...(items[event.userId] ?? []), badge];
      return items;
    },
    {}
  );
  const recentBadges = badgesByUser[data.profile.id] ?? [];

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <div className="grid gap-5">
        <section className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gold">Hola, {data.profile.firstName}</p>
                <h1 className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl md:text-5xl">
                  Bienvenido/a a la competencia para demostrar tu sabiduría mundialista.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">
                  Conviértete en la persona más sabia de {groupName}. Aquí se gana con memoria,
                  intuición y una pizca de descaro futbolero.
                </p>
              </div>
              <div className="self-start">
                <Badge tone="gold">{data.profile.alias}</Badge>
              </div>
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
                    <BadgeChip key={badge.title} badge={badge} />
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
            <RankingTable ranking={data.ranking} currentUserId={data.profile.id} badgesByUser={badgesByUser} />
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
                {pendingMatches.length === 0 ? (
                  <Card>
                    <p className="text-sm text-white/55">No tienes predicciones pendientes abiertas.</p>
                  </Card>
                ) : null}
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
          currentUserId={data.profile.id}
          timezone={data.profile.timezone}
        />
      </div>
    </AppShell>
  );
}
