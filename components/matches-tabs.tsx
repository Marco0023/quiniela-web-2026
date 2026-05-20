"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchCard } from "@/components/match-card";
import { Card } from "@/components/ui";
import { saveGroupClassificationPrediction } from "@/lib/classification/actions";
import { PHASE_LABELS, PHASE_ORDER } from "@/lib/constants";
import type { GroupClassificationPrediction, Match, MatchResult, Prediction, Team } from "@/lib/types";
import type { WorldCupGroup } from "@/lib/world-cup-groups";

type ClassificationTeam = {
  id: string | null;
  name: string;
  flagUrl: string;
};

type ClassificationGroup = Omit<WorldCupGroup, "teams"> & {
  teams: ClassificationTeam[];
};

export function MatchesTabs({
  classificationPredictions,
  groups,
  matches,
  predictions,
  results,
  teams,
  timezone
}: {
  classificationPredictions: GroupClassificationPrediction[];
  groups: ClassificationGroup[];
  matches: Match[];
  predictions: Prediction[];
  results: MatchResult[];
  teams: Team[];
  timezone: string;
}) {
  const [activeTab, setActiveTab] = useState<"matches" | "classification">("matches");

  return (
    <div className="grid gap-5">
      <div className="inline-grid w-full grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.055] p-1 sm:w-auto">
        <button
          className={tabClass(activeTab === "matches")}
          onClick={() => setActiveTab("matches")}
          type="button"
        >
          Fase de grupos
        </button>
        <button
          className={tabClass(activeTab === "classification")}
          onClick={() => setActiveTab("classification")}
          type="button"
        >
          Clasificaciones
        </button>
      </div>

      {activeTab === "matches" ? (
        <MatchesPanel matches={matches} predictions={predictions} results={results} teams={teams} timezone={timezone} />
      ) : (
        <ClassificationPanel groups={groups} predictions={classificationPredictions} />
      )}
    </div>
  );
}

function MatchesPanel({
  matches,
  predictions,
  results,
  teams,
  timezone
}: {
  matches: Match[];
  predictions: Prediction[];
  results: MatchResult[];
  teams: Team[];
  timezone: string;
}) {
  return (
    <div className="grid gap-8">
      {PHASE_ORDER.map((phase) => {
        const phaseMatches = matches.filter((match) => match.phase === phase);
        if (phaseMatches.length === 0) return null;
        return (
          <section key={phase}>
            <h2 className="mb-4 text-2xl font-black text-gold md:text-3xl">{PHASE_LABELS[phase]}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {phaseMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  teams={teams}
                  result={results.find((result) => result.matchId === match.id)}
                  prediction={predictions.find((prediction) => prediction.matchId === match.id)}
                  timezone={timezone}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ClassificationPanel({
  groups,
  predictions
}: {
  groups: ClassificationGroup[];
  predictions: GroupClassificationPrediction[];
}) {
  const initialOrders = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const group of groups) {
      const saved = predictions.find((prediction) => prediction.tournamentGroup === group.code);
      const fallback = group.teams.map((team) => team.id).filter((id): id is string => Boolean(id));
      map.set(group.code, saved?.orderedTeamIds.length === 4 ? saved.orderedTeamIds : fallback);
    }
    return map;
  }, [groups, predictions]);
  const [orders, setOrders] = useState(initialOrders);
  const [dragged, setDragged] = useState<{ groupCode: string; teamId: string } | null>(null);

  function orderedTeams(group: ClassificationGroup) {
    const order = orders.get(group.code) ?? [];
    const byId = new Map(group.teams.filter((team) => team.id).map((team) => [team.id as string, team]));
    const ordered = order.map((id) => byId.get(id)).filter((team): team is ClassificationTeam => Boolean(team));
    const missing = group.teams.filter((team) => !team.id || !order.includes(team.id));
    return [...ordered, ...missing];
  }

  function move(groupCode: string, teamId: string, direction: -1 | 1) {
    const order = [...(orders.get(groupCode) ?? [])];
    const index = order.indexOf(teamId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
    setOrders(new Map(orders).set(groupCode, order));
  }

  function drop(groupCode: string, targetTeamId: string) {
    if (!dragged || dragged.groupCode !== groupCode || dragged.teamId === targetTeamId) return;
    const order = [...(orders.get(groupCode) ?? [])];
    const from = order.indexOf(dragged.teamId);
    const to = order.indexOf(targetTeamId);
    if (from < 0 || to < 0) return;
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    setOrders(new Map(orders).set(groupCode, order));
    setDragged(null);
  }

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-2xl font-black text-gold md:text-3xl">Clasificaciones</h2>
        <p className="mt-1 text-sm text-white/60">Arrastra los equipos para ordenar cómo crees que termina cada grupo.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const currentTeams = orderedTeams(group);
          const orderedIds = currentTeams.map((team) => team.id).filter((id): id is string => Boolean(id));
          const isComplete = orderedIds.length === 4;

          return (
            <Card key={group.code} className="overflow-hidden p-0">
              <div className="border-b border-white/10 px-4 py-4">
                <h3 className="text-xl font-black text-ink">{group.name}</h3>
              </div>
              <form action={saveGroupClassificationPrediction}>
                <input name="tournamentGroup" type="hidden" value={group.code} />
                <input name="orderedTeamIds" type="hidden" value={orderedIds.join(",")} />
                <ol className="divide-y divide-white/10">
                  {currentTeams.map((team, index) => (
                    <li
                      draggable={Boolean(team.id)}
                      key={`${group.code}-${team.name}`}
                      onDragEnd={() => setDragged(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={() => team.id && setDragged({ groupCode: group.code, teamId: team.id })}
                      onDrop={() => team.id && drop(group.code, team.id)}
                      className="grid min-h-16 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 px-4 py-3 transition hover:bg-white/[0.04]"
                    >
                      <span className="text-sm font-black text-gold">{index + 1}</span>
                      <div className="flex min-w-0 items-center gap-3">
                        {team.flagUrl ? (
                          <Image src={team.flagUrl} alt="" width={28} height={20} className="h-5 w-7 rounded-sm object-cover" />
                        ) : (
                          <span className="h-5 w-7 rounded-sm bg-white/10" />
                        )}
                        <span className="truncate text-base font-black text-white">{team.name}</span>
                      </div>
                      {team.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            aria-label={`Subir ${team.name}`}
                            className="grid size-8 place-items-center rounded border border-white/10 text-white/55 transition hover:border-gold/60 hover:text-gold"
                            onClick={() => move(group.code, team.id as string, -1)}
                            type="button"
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <button
                            aria-label={`Bajar ${team.name}`}
                            className="grid size-8 place-items-center rounded border border-white/10 text-white/55 transition hover:border-gold/60 hover:text-gold"
                            onClick={() => move(group.code, team.id as string, 1)}
                            type="button"
                          >
                            <ArrowDown className="size-4" />
                          </button>
                          <GripVertical className="hidden size-5 text-white/35 sm:block" />
                        </div>
                      ) : (
                        <span className="rounded bg-gold/15 px-2 py-1 text-xs font-bold text-gold">Por importar</span>
                      )}
                    </li>
                  ))}
                </ol>
                <div className="border-t border-white/10 px-4 py-4">
                  <button
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-gold px-4 font-black text-pitch transition hover:bg-white disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/35"
                    disabled={!isComplete}
                    type="submit"
                  >
                    <Save className="size-4" />
                    Guardar {group.name}
                  </button>
                </div>
              </form>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function tabClass(isActive: boolean) {
  return [
    "min-h-11 rounded-md px-4 text-base font-black transition md:text-lg",
    isActive ? "bg-gold text-pitch" : "text-white/65 hover:bg-white/8 hover:text-white"
  ].join(" ");
}
