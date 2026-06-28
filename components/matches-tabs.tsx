"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, GripVertical, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { MatchCard } from "@/components/match-card";
import { QuickPredictionWizard } from "@/components/quick-prediction-wizard";
import { Card } from "@/components/ui";
import { saveGroupClassificationPrediction } from "@/lib/classification/actions";
import { classificationCloseAt, isClassificationLocked } from "@/lib/classification/rules";
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

export type MatchesTab = "matches" | "classification" | "knockout" | "finals";

export function MatchesTabs({
  classificationPredictions,
  groups,
  initialTab = "matches",
  matches,
  predictions,
  results,
  savedGroup,
  teams,
  timezone
}: {
  classificationPredictions: GroupClassificationPrediction[];
  groups: ClassificationGroup[];
  initialTab?: MatchesTab;
  matches: Match[];
  predictions: Prediction[];
  results: MatchResult[];
  savedGroup?: string;
  teams: Team[];
  timezone: string;
}) {
  const [activeTab, setActiveTab] = useState<MatchesTab>(initialTab);

  return (
    <div className="grid gap-5">
      <div className="grid w-full grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.055] p-1 lg:inline-grid lg:w-auto lg:grid-cols-4">
        <button className={tabClass(activeTab === "matches")} onClick={() => setActiveTab("matches")} type="button">
          Fase de grupos
        </button>
        <button className={tabClass(activeTab === "classification")} onClick={() => setActiveTab("classification")} type="button">
          Clasificaciones
        </button>
        <button className={tabClass(activeTab === "knockout")} onClick={() => setActiveTab("knockout")} type="button">
          Eliminatorias
        </button>
        <button className={tabClass(activeTab === "finals")} onClick={() => setActiveTab("finals")} type="button">
          Fase final
        </button>
      </div>

      {activeTab === "matches" ? (
        <MatchesPanel matches={matches} predictions={predictions} results={results} teams={teams} timezone={timezone} />
      ) : null}
      {activeTab === "classification" ? (
        <ClassificationPanel groups={groups} matches={matches} predictions={classificationPredictions} savedGroup={savedGroup} />
      ) : null}
      {activeTab === "knockout" ? (
        <MatchesByPhasePanel
          description="Predice quién avanza, marcador global y puntos extra por prórroga o penales."
          matches={matches}
          phases={["round_of_32", "round_of_16"]}
          predictions={predictions}
          results={results}
          teams={teams}
          timezone={timezone}
          title="Eliminatorias"
          quickTitle="Predecir eliminatorias"
        />
      ) : null}
      {activeTab === "finals" ? (
        <MatchesByPhasePanel
          description="Predice quién avanza, marcador global y los extras de prórroga o penales."
          matches={matches}
          phases={["quarter_finals", "semi_finals", "third_place", "final"]}
          predictions={predictions}
          results={results}
          teams={teams}
          timezone={timezone}
          title="Fase final"
          quickTitle="Predecir fase final"
        />
      ) : null}
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
  const groupMatches = matches.filter((match) => match.phase === "group_stage");
  const openMatches = groupMatches.filter((match) => match.status !== "finished");
  const finishedMatches = groupMatches.filter((match) => match.status === "finished");

  return (
    <section>
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="text-2xl font-black text-gold md:text-3xl">{PHASE_LABELS.group_stage}</h2>
          <p className="mt-1 text-sm text-white/60">
            Predice el ganador o empate. El marcador es opcional, pero te puede dar puntos adicionales.
          </p>
        </div>
        <QuickPredictionWizard matches={openMatches} predictions={predictions} teams={teams} />
      </div>
      <MatchGrid matches={openMatches} predictions={predictions} results={results} teams={teams} timezone={timezone} />
      {finishedMatches.length > 0 ? (
        <div className="mt-8">
          <h3 className="mb-3 text-xl font-black text-ink">Partidos finalizados</h3>
          <MatchGrid matches={finishedMatches} predictions={predictions} results={results} teams={teams} timezone={timezone} />
        </div>
      ) : null}
    </section>
  );
}

function MatchesByPhasePanel({
  description,
  matches,
  phases,
  predictions,
  results,
  teams,
  timezone,
  title,
  quickTitle
}: {
  description: string;
  matches: Match[];
  phases: Match["phase"][];
  predictions: Prediction[];
  results: MatchResult[];
  teams: Team[];
  timezone: string;
  title: string;
  quickTitle: string;
}) {
  const panelMatches = matches.filter((match) => phases.includes(match.phase));
  const openMatches = panelMatches.filter((match) => match.status !== "finished");

  return (
    <section className="grid gap-8">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h2 className="text-2xl font-black text-gold md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-white/60">{description}</p>
        </div>
        <QuickPredictionWizard matches={openMatches} predictions={predictions} teams={teams} title={quickTitle} />
      </div>

      {phases.map((phase) => {
        const phaseMatches = panelMatches.filter((match) => match.phase === phase);
        return (
          <div key={phase} className="grid gap-3">
            <h3 className="text-xl font-black text-ink">{PHASE_LABELS[phase]}</h3>
            {phaseMatches.length === 0 ? (
              <Card className="text-sm text-white/60">Todavía no hay partidos cargados para esta ronda.</Card>
            ) : (
              <MatchGrid matches={phaseMatches} predictions={predictions} results={results} teams={teams} timezone={timezone} />
            )}
          </div>
        );
      })}
    </section>
  );
}

function MatchGrid({
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
  if (matches.length === 0) {
    return <Card className="text-sm text-white/60">No hay partidos disponibles por ahora.</Card>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {matches.map((match) => (
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
  );
}

function ClassificationPanel({
  groups,
  matches,
  predictions,
  savedGroup
}: {
  groups: ClassificationGroup[];
  matches: Match[];
  predictions: GroupClassificationPrediction[];
  savedGroup?: string;
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
        <div className="mt-3 rounded-md border border-white/10 bg-white/[0.045] p-3 text-sm text-white/68">
          Acierta los 2 equipos que avanzan: <strong className="text-gold">5 puntos</strong>. Acierta las 4 posiciones:
          <strong className="text-gold"> 12 puntos</strong>. Cada grupo cierra 1 hora antes del primer segundo partido de ese grupo.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => {
          const currentTeams = orderedTeams(group);
          const orderedIds = currentTeams.map((team) => team.id).filter((id): id is string => Boolean(id));
          const isComplete = orderedIds.length === 4;
          const saved = predictions.find((prediction) => prediction.tournamentGroup === group.code);
          const isSaved = Boolean(saved);
          const wasJustSaved = savedGroup === group.code;
          const closeAt = classificationCloseAt(group.code, matches);
          const locked = isClassificationLocked(group.code, matches);

          return (
            <Card
              key={group.code}
              className={`overflow-hidden p-0 ${
                isSaved ? "border-emeraldGlow/55 shadow-[0_0_0_1px_rgba(74,222,128,0.22),0_18px_70px_rgba(16,185,129,0.12)]" : ""
              }`}
            >
              <div className="border-b border-white/10 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-ink">{group.name}</h3>
                  {isSaved ? (
                    <span className="rounded-md border border-emeraldGlow/25 bg-emeraldGlow/12 px-2 py-1 text-xs font-black text-emeraldGlow">
                      {wasJustSaved ? "Tu predicción está guardada." : "Predicción guardada."}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs font-bold text-white/45">
                  {locked ? "Clasificación cerrada" : closeAt ? `Cierra: ${new Date(closeAt).toLocaleString("es")}` : "Cierre por definir"}
                  {saved ? ` · ${saved.pointsAwarded} pts` : ""}
                </p>
              </div>
              <form action={saveGroupClassificationPrediction}>
                <input name="tournamentGroup" type="hidden" value={group.code} />
                <input name="orderedTeamIds" type="hidden" value={orderedIds.join(",")} />
                <ol className="divide-y divide-white/10">
                  {currentTeams.map((team, index) => (
                    <li
                      draggable={Boolean(team.id) && !locked}
                      key={`${group.code}-${team.name}`}
                      onDragEnd={() => setDragged(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDragStart={() => team.id && !locked && setDragged({ groupCode: group.code, teamId: team.id })}
                      onDrop={() => team.id && !locked && drop(group.code, team.id)}
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
                            className="grid size-8 place-items-center rounded border border-white/10 text-white/55 transition hover:border-gold/60 hover:text-gold disabled:opacity-30"
                            disabled={locked}
                            onClick={() => move(group.code, team.id as string, -1)}
                            type="button"
                          >
                            <ArrowUp className="size-4" />
                          </button>
                          <button
                            aria-label={`Bajar ${team.name}`}
                            className="grid size-8 place-items-center rounded border border-white/10 text-white/55 transition hover:border-gold/60 hover:text-gold disabled:opacity-30"
                            disabled={locked}
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
                    disabled={!isComplete || locked}
                    type="submit"
                  >
                    <Save className="size-4" />
                    {locked ? "Clasificación cerrada" : `Guardar ${group.name}`}
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
