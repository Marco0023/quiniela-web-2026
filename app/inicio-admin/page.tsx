import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList, DatabaseZap, UsersRound } from "lucide-react";
import { AdminPredictionsCarousel, AdminRankingCarousel } from "@/components/admin-home-panels";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { formatKickoff } from "@/lib/format";
import { getAdminHomeData } from "@/lib/repository";
import type { Match, Team } from "@/lib/types";

export default async function AdminHomePage() {
  const data = await getAdminHomeData();
  const closedWithoutResults = data.closedWithoutResults.slice(0, 5);

  return (
    <AppShell showAdmin>
      <SectionHeader eyebrow="Panel admin" title="Centro de control" />
      <div className="grid gap-5">
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gold">Hola, {data.profile.firstName}</p>
                <h1 className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl md:text-5xl">
                  Todo lo importante de la quiniela en un solo sitio.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/62">
                  Revisa pendientes, comparte rankings por grupo, mira predicciones guardadas y carga resultados sin estar saltando
                  entre pantallas.
                </p>
              </div>
              <Badge tone="gold">Admin</Badge>
            </div>
          </Card>

          <Link href="/admin/pendientes">
            <Card className="h-full border-gold/25 bg-gold/10 transition hover:border-gold/70">
              <ClipboardList className="mb-4 size-7 text-gold" />
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-gold">Pendientes</p>
              <h2 className="mt-2 text-2xl font-black text-ink">Ver predicciones faltantes</h2>
              <p className="mt-3 text-sm leading-6 text-white/62">
                {data.pendingPredictionCount} pendientes estimados para la jornada de hoy.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-gold">
                Abrir pendientes <ArrowRight className="size-4" />
              </span>
            </Card>
          </Link>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <AdminRankingCarousel groups={data.rankingsByGroup} />

          <Card className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Resultados</p>
                <h2 className="mt-1 text-xl font-black text-ink">Partidos pendientes de resultado</h2>
              </div>
              <Link
                href="/admin/resultados"
                className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch transition hover:bg-white"
              >
                <DatabaseZap className="size-4" />
                Cargar
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {closedWithoutResults.length > 0 ? (
                closedWithoutResults.map((match) => (
                  <div key={match.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <MatchTitle match={match} teams={data.teams} />
                      <p className="mt-2 text-xs text-white/45">{formatKickoff(match.kickoffAt, data.profile.timezone)}</p>
                    </div>
                    <Link
                      href="/admin/resultados"
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/10 px-3 text-sm font-black text-gold transition hover:border-gold/60"
                    >
                      Guardar resultado
                    </Link>
                  </div>
                ))
              ) : (
                <p className="px-4 py-5 text-sm text-white/55">No hay partidos cerrados pendientes de resultado.</p>
              )}
            </div>
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <UsersRound className="size-5 text-gold" />
            <SectionHeader eyebrow="Capturas por grupo" title="Predicciones guardadas" />
          </div>
          <AdminPredictionsCarousel
            groups={data.groups}
            matches={data.matches}
            predictions={data.predictions}
            results={data.results}
            teams={data.teams}
            timezone={data.profile.timezone}
            users={data.users}
          />
        </section>
      </div>
    </AppShell>
  );
}

function MatchTitle({ match, teams }: { match: Match; teams: Team[] }) {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 font-black text-white">
      <TeamLabel team={homeTeam} fallback={match.homePlaceholder ?? "Local"} />
      <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/55">vs</span>
      <TeamLabel team={awayTeam} fallback={match.awayPlaceholder ?? "Visitante"} />
    </div>
  );
}

function TeamLabel({ fallback, team }: { fallback: string; team?: Team }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {team?.flagUrl ? <Image src={team.flagUrl} alt="" width={24} height={16} className="h-4 w-6 rounded-sm object-cover" /> : null}
      <span className="truncate">{team?.name ?? fallback}</span>
    </span>
  );
}
