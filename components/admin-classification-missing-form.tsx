"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { inputClass } from "@/components/ui";
import { saveAdminClassificationPrediction } from "@/lib/admin/pending-actions";
import type { ClassificationGroup } from "@/lib/classification/groups";

type PrivateGroupOption = {
  id: string;
  name: string;
  users: {
    id: string;
    alias: string;
    firstName: string;
    lastName: string;
  }[];
};

type ExistingClassification = {
  userId: string;
  groupId: string;
  tournamentGroup: string;
};

function completeTeamIdsFor(group?: ClassificationGroup) {
  return group?.teams.map((team) => team.id).filter((id): id is string => Boolean(id)) ?? [];
}

function missingUsersFor(
  group: PrivateGroupOption | undefined,
  tournamentGroup: string,
  existingPredictions: ExistingClassification[]
) {
  return (
    group?.users.filter(
      (user) =>
        !existingPredictions.some(
          (prediction) => prediction.userId === user.id && prediction.tournamentGroup === tournamentGroup
        )
    ) ?? []
  );
}

export function AdminClassificationMissingForm({
  groups,
  classificationGroups,
  existingPredictions
}: {
  groups: PrivateGroupOption[];
  classificationGroups: ClassificationGroup[];
  existingPredictions: ExistingClassification[];
}) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [tournamentGroup, setTournamentGroup] = useState(classificationGroups[0]?.code ?? "");
  const currentWorldGroup = classificationGroups.find((group) => group.code === tournamentGroup) ?? classificationGroups[0];
  const [orderedIds, setOrderedIds] = useState<string[]>(() => completeTeamIdsFor(currentWorldGroup));

  const selectedGroup = groups.find((group) => group.id === groupId);
  const missingUsers = useMemo(
    () => missingUsersFor(selectedGroup, tournamentGroup, existingPredictions),
    [existingPredictions, selectedGroup, tournamentGroup]
  );
  const [targetUserId, setTargetUserId] = useState(missingUsers[0]?.id ?? "");

  function orderedTeams() {
    if (!currentWorldGroup) return [];
    const byId = new Map(currentWorldGroup.teams.filter((team) => team.id).map((team) => [team.id as string, team]));
    const ordered = orderedIds.map((id) => byId.get(id)).filter((team): team is ClassificationGroup["teams"][number] => Boolean(team));
    const missing = currentWorldGroup.teams.filter((team) => !team.id || !orderedIds.includes(team.id));
    return [...ordered, ...missing];
  }

  function move(teamId: string, direction: -1 | 1) {
    const order = [...orderedIds];
    const index = order.indexOf(teamId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    setOrderedIds(order);
  }

  function handlePrivateGroupChange(nextGroupId: string) {
    const nextGroup = groups.find((group) => group.id === nextGroupId);
    const nextMissingUsers = missingUsersFor(nextGroup, tournamentGroup, existingPredictions);
    setGroupId(nextGroupId);
    setTargetUserId(nextMissingUsers[0]?.id ?? "");
  }

  function handleTournamentGroupChange(nextTournamentGroup: string) {
    const nextWorldGroup = classificationGroups.find((group) => group.code === nextTournamentGroup) ?? classificationGroups[0];
    const nextMissingUsers = missingUsersFor(selectedGroup, nextTournamentGroup, existingPredictions);
    setTournamentGroup(nextTournamentGroup);
    setOrderedIds(completeTeamIdsFor(nextWorldGroup));
    setTargetUserId(nextMissingUsers[0]?.id ?? "");
  }

  const isComplete = orderedIds.length === 4 && Boolean(targetUserId);

  return (
    <form action={saveAdminClassificationPrediction} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-white/78">
          Grupo privado
          <select className={inputClass} value={groupId} onChange={(event) => handlePrivateGroupChange(event.target.value)}>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white/78">
          Grupo del Mundial
          <select className={inputClass} value={tournamentGroup} onChange={(event) => handleTournamentGroupChange(event.target.value)}>
            {classificationGroups.map((group) => (
              <option key={group.code} value={group.code}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-white/78">
          Participante faltante
          <select className={inputClass} value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)}>
            {missingUsers.length > 0 ? (
              missingUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.alias} - {user.firstName} {user.lastName}
                </option>
              ))
            ) : (
              <option value="">Todos tienen predicción</option>
            )}
          </select>
        </label>
      </div>

      <input name="targetUserId" type="hidden" value={targetUserId} />
      <input name="tournamentGroup" type="hidden" value={tournamentGroup} />
      <input name="orderedTeamIds" type="hidden" value={orderedIds.join(",")} />

      <ol className="divide-y divide-white/10 rounded-lg border border-white/10">
        {orderedTeams().map((team, index) => (
          <li key={`${tournamentGroup}-${team.name}`} className="grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 px-3 py-3">
            <span className="text-sm font-black text-gold">{index + 1}</span>
            <div className="flex min-w-0 items-center gap-3">
              {team.flagUrl ? (
                <Image src={team.flagUrl} alt="" width={28} height={20} className="h-5 w-7 rounded-sm object-cover" />
              ) : (
                <span className="h-5 w-7 rounded-sm bg-white/10" />
              )}
              <span className="truncate font-black text-white">{team.name}</span>
            </div>
            {team.id ? (
              <div className="flex items-center gap-1">
                <button
                  aria-label={`Subir ${team.name}`}
                  className="grid size-8 place-items-center rounded border border-white/10 text-white/55 transition hover:border-gold/60 hover:text-gold"
                  onClick={() => move(team.id as string, -1)}
                  type="button"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  aria-label={`Bajar ${team.name}`}
                  className="grid size-8 place-items-center rounded border border-white/10 text-white/55 transition hover:border-gold/60 hover:text-gold"
                  onClick={() => move(team.id as string, 1)}
                  type="button"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            ) : (
              <span className="rounded bg-gold/15 px-2 py-1 text-xs font-bold text-gold">Por importar</span>
            )}
          </li>
        ))}
      </ol>

      <SubmitButton disabled={!isComplete} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gold px-4 font-black text-pitch transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled || pending}
      type="submit"
    >
      <Save className="size-4" />
      {pending ? "Guardando clasificación..." : "Guardar clasificación faltante"}
    </button>
  );
}
