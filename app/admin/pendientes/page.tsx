import Image from "next/image";
import { CalendarClock, ClipboardList, Trophy } from "lucide-react";
import { AdminClassificationMissingForm } from "@/components/admin-classification-missing-form";
import { AdminMatchMissingForm } from "@/components/admin-match-missing-form";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { resolveClassificationGroups } from "@/lib/classification/groups";
import { PHASE_LABELS } from "@/lib/constants";
import { statusLabel } from "@/lib/format";
import { getAdminPendingPredictionsData } from "@/lib/repository";
import { isPredictionLocked } from "@/lib/scoring";
import type { Group, Match, Prediction, Profile, Team } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPendingPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const status = await searchParams;
  const data = await getAdminPendingPredictionsData();
  const privateGroups = data.groups.map((group) => ({
    ...group,
    users: data.users.filter((user) => user.groupId === group.id)
  }));
  const classificationGroups = resolveClassificationGroups(data.teams);
  const eligibleLatePredictionMatches = data.todayMatches.filter(
    (match) => isPredictionLocked(match.kickoffAt) && !data.results.some((result) => result.matchId === match.id)
  );
  const savedMessage =
    status.saved === "partido"
      ? "Predicción faltante guardada."
      : status.saved === "clasificacion"
        ? "Clasificación faltante guardada."
        : null;

  return (
    <AppShell showAdmin>
      <SectionHeader eyebrow="Admin" title="Pendientes" />
      {status.error ? (
        <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p>
      ) : null}
      {savedMessage ? <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">{savedMessage}</p> : null}

      <div className="grid gap-5">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <CalendarClock className="size-6 text-gold" />
            <div>
              <h2 className="text-xl font-black text-ink">Partidos de hoy</h2>
              <p className="text-sm text-white/55">Jornada calculada con tu zona horaria: {data.profile.timezoneCountry}</p>
            </div>
          </div>
          {data.todayMatches.length > 0 ? (
            <div className="grid gap-3">
              {data.todayMatches.map((match) => (
                <TodayMatchMissingCard
                  key={match.id}
                  groups={privateGroups}
                  match={match}
                  predictions={data.predictions}
                  teams={data.teams}
                  timezone={data.profile.timezone}
                />
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/58">
              No hay partidos programados para hoy en tu horario.
            </p>
          )}

          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="mb-4 flex items-center gap-3">
              <ClipboardList className="size-6 text-gold" />
              <div>
                <h2 className="text-xl font-black text-ink">Cargar predicción faltante</h2>
                <p className="text-sm text-white/55">
                  Solo partidos de hoy que ya cerraron y todavía no tienen resultado guardado.
                </p>
              </div>
            </div>
            <AdminMatchMissingForm
              existingPredictions={data.predictions.map((prediction) => ({
                matchId: prediction.matchId,
                userId: prediction.userId
              }))}
              groups={privateGroups.map((group) => ({
                id: group.id,
                name: group.name,
                users: group.users.map((user) => ({
                  id: user.id,
                  alias: user.alias,
                  firstName: user.firstName,
                  lastName: user.lastName
                }))
              }))}
              matches={eligibleLatePredictionMatches}
              teams={data.teams}
              timezone={data.profile.timezone}
            />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Trophy className="size-6 text-gold" />
            <div>
              <h2 className="text-xl font-black text-ink">Clasificados pendientes</h2>
              <p className="text-sm text-white/55">Quién falta por ordenar cada grupo del Mundial.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {classificationGroups.map((group) => (
              <ClassificationMissingCard
                key={group.code}
                groups={privateGroups}
                predictions={data.classificationPredictions}
                tournamentGroup={group}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <ClipboardList className="size-6 text-gold" />
            <div>
              <h2 className="text-xl font-black text-ink">Cargar clasificación faltante</h2>
              <p className="text-sm text-white/55">Solo permite guardar participantes que aún no tienen predicción para ese grupo.</p>
            </div>
          </div>
          <AdminClassificationMissingForm
            classificationGroups={classificationGroups}
            existingPredictions={data.classificationPredictions.map((prediction) => ({
              userId: prediction.userId,
              groupId: prediction.groupId,
              tournamentGroup: prediction.tournamentGroup
            }))}
            groups={privateGroups.map((group) => ({
              id: group.id,
              name: group.name,
              users: group.users.map((user) => ({
                id: user.id,
                alias: user.alias,
                firstName: user.firstName,
                lastName: user.lastName
              }))
            }))}
          />
        </Card>
      </div>
    </AppShell>
  );
}

function TodayMatchMissingCard({
  groups,
  match,
  predictions,
  teams,
  timezone
}: {
  groups: (Group & { users: Profile[] })[];
  match: Match;
  predictions: Prediction[];
  teams: Team[];
  timezone: string;
}) {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  const matchPredictions = predictions.filter((prediction) => prediction.matchId === match.id);
  const predictedUserIds = new Set(matchPredictions.map((prediction) => prediction.userId));
  const totalUsers = groups.reduce((sum, group) => sum + group.users.length, 0);
  const submitted = groups.reduce((sum, group) => sum + group.users.filter((user) => predictedUserIds.has(user.id)).length, 0);

  return (
    <div className="rounded-lg border border-white/10 bg-pitch/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{statusLabel(match.status)}</Badge>
            <span className="text-xs font-bold text-white/45">{PHASE_LABELS[match.phase]}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-base font-black text-white">
            <TeamLabel team={homeTeam} fallback={match.homePlaceholder ?? "Por definir"} />
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/55">vs</span>
            <TeamLabel team={awayTeam} fallback={match.awayPlaceholder ?? "Por definir"} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white/55">{formatMatchTime(match.kickoffAt, timezone)}</p>
          <p className="mt-1 text-lg font-black text-gold">
            {submitted}/{totalUsers} predijeron
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {groups.map((group) => {
          const missing = group.users.filter((user) => !predictedUserIds.has(user.id));
          return (
            <MissingList
              key={`${match.id}-${group.id}`}
              emptyText="Todos listos."
              items={missing}
              title={`${group.name} (${group.users.length - missing.length}/${group.users.length})`}
            />
          );
        })}
      </div>
    </div>
  );
}

function ClassificationMissingCard({
  groups,
  predictions,
  tournamentGroup
}: {
  groups: (Group & { users: Profile[] })[];
  predictions: { userId: string; tournamentGroup: string }[];
  tournamentGroup: { code: string; name: string };
}) {
  const totalUsers = groups.reduce((sum, group) => sum + group.users.length, 0);
  const submitted = groups.reduce(
    (sum, group) =>
      sum +
      group.users.filter((user) =>
        predictions.some((prediction) => prediction.userId === user.id && prediction.tournamentGroup === tournamentGroup.code)
      ).length,
    0
  );

  return (
    <div className="rounded-lg border border-white/10 bg-pitch/35 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-black text-white">{tournamentGroup.name}</h3>
        <Badge tone={submitted === totalUsers ? "green" : "gold"}>
          {submitted}/{totalUsers} guardadas
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {groups.map((group) => {
          const missing = group.users.filter(
            (user) => !predictions.some((prediction) => prediction.userId === user.id && prediction.tournamentGroup === tournamentGroup.code)
          );
          return (
            <MissingList
              key={`${tournamentGroup.code}-${group.id}`}
              emptyText="Todos tienen clasificación."
              items={missing}
              title={`${group.name} (${group.users.length - missing.length}/${group.users.length})`}
            />
          );
        })}
      </div>
    </div>
  );
}

function MissingList({
  emptyText,
  items,
  title
}: {
  emptyText: string;
  items: Profile[];
  title: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <p className="mb-2 text-sm font-black text-gold">{title}</p>
      {items.length > 0 ? (
        <ul className="grid gap-1.5">
          {items.map((user) => (
            <li key={user.id} className="rounded bg-white/[0.04] px-2 py-1.5 text-sm text-white/72">
              <strong className="text-white">{user.alias}</strong>
              <span className="text-white/45"> - {user.firstName} {user.lastName}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-emeraldGlow">{emptyText}</p>
      )}
    </div>
  );
}

function TeamLabel({ fallback, team }: { fallback: string; team?: Team }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {team?.flagUrl ? (
        <Image src={team.flagUrl} alt="" width={28} height={20} className="h-5 w-7 rounded-sm object-cover" />
      ) : (
        <span className="h-5 w-7 rounded-sm bg-white/10" />
      )}
      <span className="truncate">{team?.name ?? fallback}</span>
    </span>
  );
}

function formatMatchTime(kickoffAt: string, timezone: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone: timezone,
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(kickoffAt));
}
