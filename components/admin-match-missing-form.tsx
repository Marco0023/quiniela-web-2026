"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { inputClass } from "@/components/ui";
import { saveAdminMatchPrediction } from "@/lib/admin/pending-actions";
import { getPredictionType, validateScoreConsistency } from "@/lib/scoring";
import type { Match, Outcome, Prediction, Team } from "@/lib/types";

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

type ExistingPrediction = {
  matchId: string;
  userId: string;
};

function missingUsersFor(group: PrivateGroupOption | undefined, matchId: string, existingPredictions: ExistingPrediction[]) {
  return (
    group?.users.filter(
      (user) => !existingPredictions.some((prediction) => prediction.matchId === matchId && prediction.userId === user.id)
    ) ?? []
  );
}

export function AdminMatchMissingForm({
  groups,
  matches,
  existingPredictions,
  teams,
  timezone
}: {
  groups: PrivateGroupOption[];
  matches: Match[];
  existingPredictions: ExistingPrediction[];
  teams: Team[];
  timezone: string;
}) {
  const [matchId, setMatchId] = useState(matches[0]?.id ?? "");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const selectedMatch = matches.find((match) => match.id === matchId) ?? matches[0];
  const selectedGroup = groups.find((group) => group.id === groupId);
  const missingUsers = useMemo(
    () => missingUsersFor(selectedGroup, matchId, existingPredictions),
    [existingPredictions, matchId, selectedGroup]
  );
  const [targetUserId, setTargetUserId] = useState(missingUsers[0]?.id ?? "");
  const [outcome, setOutcome] = useState<Outcome>("home");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [winnerTeamId, setWinnerTeamId] = useState(selectedMatch?.homeTeamId ?? "");
  const [extraTime, setExtraTime] = useState(false);
  const [penalties, setPenalties] = useState(false);

  const homeTeam = teams.find((team) => team.id === selectedMatch?.homeTeamId);
  const awayTeam = teams.find((team) => team.id === selectedMatch?.awayTeamId);
  const predictionType = selectedMatch ? getPredictionType(selectedMatch) : "group_stage";
  const parsedHome = homeScore === "" ? null : Number(homeScore);
  const parsedAway = awayScore === "" ? null : Number(awayScore);
  const scoreIsValid = validateScoreConsistency(outcome, parsedHome, parsedAway);
  const isComplete =
    Boolean(selectedMatch && targetUserId) &&
    (predictionType === "group_stage" ? Boolean(outcome) && scoreIsValid : Boolean(winnerTeamId));

  function handleMatchChange(nextMatchId: string) {
    const nextMatch = matches.find((match) => match.id === nextMatchId) ?? matches[0];
    const nextMissingUsers = missingUsersFor(selectedGroup, nextMatchId, existingPredictions);
    setMatchId(nextMatchId);
    setTargetUserId(nextMissingUsers[0]?.id ?? "");
    setOutcome("home");
    setHomeScore("");
    setAwayScore("");
    setWinnerTeamId(nextMatch?.homeTeamId ?? "");
    setExtraTime(false);
    setPenalties(false);
  }

  function handlePrivateGroupChange(nextGroupId: string) {
    const nextGroup = groups.find((group) => group.id === nextGroupId);
    const nextMissingUsers = missingUsersFor(nextGroup, matchId, existingPredictions);
    setGroupId(nextGroupId);
    setTargetUserId(nextMissingUsers[0]?.id ?? "");
  }

  if (matches.length === 0) {
    return (
      <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/58">
        No hay partidos cerrados de hoy sin resultado para cargar predicciones faltantes.
      </p>
    );
  }

  return (
    <form action={saveAdminMatchPrediction} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold text-white/78">
          Partido cerrado
          <select className={inputClass} value={matchId} onChange={(event) => handleMatchChange(event.target.value)}>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {matchLabel(match, teams, timezone)}
              </option>
            ))}
          </select>
        </label>
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
          Participante faltante
          <select className={inputClass} value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)}>
            {missingUsers.length > 0 ? (
              missingUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.alias} - {user.firstName} {user.lastName}
                </option>
              ))
            ) : (
              <option value="">Todos tienen prediccion</option>
            )}
          </select>
        </label>
      </div>

      <input name="matchId" type="hidden" value={matchId} />
      <input name="targetUserId" type="hidden" value={targetUserId} />
      <input name="predictedOutcome" type="hidden" value={outcome} />
      <input name="predictedWinnerTeamId" type="hidden" value={winnerTeamId} />
      <input name="predictsExtraTime" type="hidden" value={String(extraTime)} />
      <input name="predictsPenalties" type="hidden" value={String(penalties)} />

      {selectedMatch ? (
        <div className="rounded-lg border border-white/10 bg-pitch/35 p-4">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-center font-black text-white">
            <TeamPill team={homeTeam} fallback={selectedMatch.homePlaceholder ?? "Local"} />
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/55">vs</span>
            <TeamPill team={awayTeam} fallback={selectedMatch.awayPlaceholder ?? "Visitante"} />
          </div>

          {predictionType === "group_stage" ? (
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <ChoiceButton active={outcome === "home"} label={homeTeam?.name ?? "Local"} onClick={() => setOutcome("home")} />
                <ChoiceButton active={outcome === "draw"} label="Empate" onClick={() => setOutcome("draw")} />
                <ChoiceButton active={outcome === "away"} label={awayTeam?.name ?? "Visitante"} onClick={() => setOutcome("away")} />
              </div>
              <ScoreFields
                awayLabel={awayTeam?.name ?? "Visitante"}
                awayScore={awayScore}
                homeLabel={homeTeam?.name ?? "Local"}
                homeScore={homeScore}
                setAwayScore={setAwayScore}
                setHomeScore={setHomeScore}
              />
              {!scoreIsValid ? (
                <p className="rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">
                  El marcador opcional debe coincidir con la seleccion principal.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {[homeTeam, awayTeam].filter(Boolean).map((team) => (
                  <WinnerButton
                    key={team!.id}
                    active={winnerTeamId === team!.id}
                    team={team!}
                    onClick={() => setWinnerTeamId(team!.id)}
                  />
                ))}
              </div>
              {predictionType === "final" ? (
                <ScoreFields
                  awayLabel={awayTeam?.name ?? "Visitante"}
                  awayScore={awayScore}
                  homeLabel={homeTeam?.name ?? "Local"}
                  homeScore={homeScore}
                  setAwayScore={setAwayScore}
                  setHomeScore={setHomeScore}
                />
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Habra prorroga" checked={extraTime} onChange={setExtraTime} />
                <Toggle label="Habra penales" checked={penalties} onChange={setPenalties} />
              </div>
            </div>
          )}
        </div>
      ) : null}

      <SubmitButton disabled={!isComplete} />
    </form>
  );
}

function matchLabel(match: Match, teams: Team[], timezone: string) {
  const home = teams.find((team) => team.id === match.homeTeamId)?.name ?? match.homePlaceholder ?? "Local";
  const away = teams.find((team) => team.id === match.awayTeamId)?.name ?? match.awayPlaceholder ?? "Visitante";
  const time = new Intl.DateTimeFormat("es", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(match.kickoffAt));
  return `${time} - ${home} vs ${away}`;
}

function TeamPill({ fallback, team }: { fallback: string; team?: Team }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {team?.flagUrl ? <Image src={team.flagUrl} alt="" width={28} height={20} className="h-5 w-7 rounded-sm object-cover" /> : null}
      <span className="truncate">{team?.name ?? fallback}</span>
    </span>
  );
}

function ChoiceButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`min-h-12 rounded-md border px-3 text-sm font-black transition ${
        active ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72 hover:border-gold/60"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function WinnerButton({ active, team, onClick }: { active: boolean; team: Team; onClick: () => void }) {
  return (
    <button
      className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition ${
        active ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72 hover:border-gold/60"
      }`}
      onClick={onClick}
      type="button"
    >
      {team.flagUrl ? <Image src={team.flagUrl} alt="" width={26} height={18} className="h-4 w-6 rounded-sm object-cover" /> : null}
      <span className="truncate">{team.name}</span>
    </button>
  );
}

function ScoreFields({
  awayLabel,
  awayScore,
  homeLabel,
  homeScore,
  setAwayScore,
  setHomeScore
}: {
  awayLabel: string;
  awayScore: string;
  homeLabel: string;
  homeScore: string;
  setAwayScore: (value: string) => void;
  setHomeScore: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
      <label className="grid min-w-0 gap-2 text-sm font-semibold text-white/78">
        <span className="truncate">{homeLabel}</span>
        <input
          className={inputClass}
          inputMode="numeric"
          min={0}
          name="predictedHomeScore"
          pattern="[0-9]*"
          type="number"
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value)}
        />
      </label>
      <span className="pb-3 text-white/45">-</span>
      <label className="grid min-w-0 gap-2 text-sm font-semibold text-white/78">
        <span className="truncate">{awayLabel}</span>
        <input
          className={inputClass}
          inputMode="numeric"
          min={0}
          name="predictedAwayScore"
          pattern="[0-9]*"
          type="number"
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value)}
        />
      </label>
    </div>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <button
      className={`min-h-12 rounded-md border px-3 text-sm font-black transition ${
        checked ? "border-emeraldGlow bg-emeraldGlow/20 text-emeraldGlow" : "border-white/10 bg-white/5 text-white/70"
      }`}
      onClick={() => onChange(!checked)}
      type="button"
    >
      {label}
    </button>
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
      {pending ? "Guardando prediccion..." : "Guardar prediccion faltante"}
    </button>
  );
}
