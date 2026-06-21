import { CalendarClock, ClipboardList, Trophy } from "lucide-react";
import { AdminClassificationMissingForm } from "@/components/admin-classification-missing-form";
import { AdminPendingTodaySection } from "@/components/admin-pending-today-section";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getAdminTodayPendingData } from "@/lib/admin/pending-live";
import { resolveClassificationGroups } from "@/lib/classification/groups";
import { getAdminPendingPredictionsData } from "@/lib/repository";
import { isPredictionLocked } from "@/lib/scoring";
import type { Group, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPendingPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const status = await searchParams;
  const [data, todayPendingData] = await Promise.all([getAdminPendingPredictionsData(), getAdminTodayPendingData()]);
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
          <AdminPendingTodaySection
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
            initialData={todayPendingData}
            matches={eligibleLatePredictionMatches}
            teams={data.teams}
            timezone={data.profile.timezone}
          />
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
              <span className="text-white/45">
                {" "}
                - {user.firstName} {user.lastName}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-emeraldGlow">{emptyText}</p>
      )}
    </div>
  );
}
