"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { inputClass } from "@/components/ui";
import { savePrediction } from "@/lib/predictions/actions";
import { getPredictionType, isPredictionLocked, validateScoreConsistency } from "@/lib/scoring";
import type { Match, Outcome, Prediction, Team } from "@/lib/types";

export function PredictionForm({ match, teams, prediction }: { match: Match; teams: Team[]; prediction?: Prediction }) {
  const predictionType = getPredictionType(match);
  const locked = isPredictionLocked(match.kickoffAt);
  const [outcome, setOutcome] = useState<Outcome>(prediction?.predictedOutcome ?? "home");
  const [homeScore, setHomeScore] = useState(prediction?.predictedHomeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(prediction?.predictedAwayScore?.toString() ?? "");
  const [winnerTeamId, setWinnerTeamId] = useState(prediction?.predictedWinnerTeamId ?? match.homeTeamId ?? "");
  const [extraTime, setExtraTime] = useState(prediction?.predictsExtraTime ?? false);
  const [penalties, setPenalties] = useState(prediction?.predictsPenalties ?? false);

  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  const parsedHome = homeScore === "" ? null : Number(homeScore);
  const parsedAway = awayScore === "" ? null : Number(awayScore);
  const scoreIsValid = useMemo(
    () => validateScoreConsistency(outcome, parsedHome, parsedAway),
    [outcome, parsedAway, parsedHome]
  );

  return (
    <form action={savePrediction} className="grid gap-4">
      <input name="matchId" type="hidden" value={match.id} />
      <input name="predictedOutcome" type="hidden" value={outcome} />
      <input name="predictedWinnerTeamId" type="hidden" value={winnerTeamId} />
      <input name="predictsExtraTime" type="hidden" value={String(extraTime)} />
      <input name="predictsPenalties" type="hidden" value={String(penalties)} />
      {predictionType === "group_stage" ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["home", homeTeam?.shortName ?? "Local"],
              ["draw", "Empate"],
              ["away", awayTeam?.shortName ?? "Visita"]
            ].map(([value, label]) => (
              <button
                type="button"
                disabled={locked}
                key={value}
                onClick={() => setOutcome(value as Outcome)}
                className={`min-h-12 rounded-md border px-2 text-sm font-black transition ${
                  outcome === value
                    ? "border-gold bg-gold text-pitch"
                    : "border-white/10 bg-white/5 text-white/72"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <ScoreFields
            homeScore={homeScore}
            awayScore={awayScore}
            setHomeScore={setHomeScore}
            setAwayScore={setAwayScore}
            disabled={locked}
          />
          {!scoreIsValid ? (
            <p className="rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">
              El marcador opcional debe coincidir con la seleccion principal.
            </p>
          ) : null}
        </>
      ) : null}

      {predictionType === "knockout" || predictionType === "final" ? (
        <>
          <label className="grid gap-2 text-sm font-semibold text-white/78">
            {predictionType === "final" ? "Ganador del Mundial" : "Quién avanza"}
            <select
              className={inputClass}
              disabled={locked}
              value={winnerTeamId}
              onChange={(event) => setWinnerTeamId(event.target.value)}
            >
              {[homeTeam, awayTeam].filter(Boolean).map((team) => (
                <option key={team!.id} value={team!.id}>
                  {team!.name}
                </option>
              ))}
            </select>
          </label>

          {predictionType === "final" ? (
            <ScoreFields
              homeScore={homeScore}
              awayScore={awayScore}
              setHomeScore={setHomeScore}
              setAwayScore={setAwayScore}
              disabled={locked}
            />
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Habrá prórroga" checked={extraTime} disabled={locked} onChange={setExtraTime} />
            <Toggle label="Habrá penales" checked={penalties} disabled={locked} onChange={setPenalties} />
          </div>
        </>
      ) : null}

      <button
        type="submit"
        disabled={!scoreIsValid || locked}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-4 font-black text-pitch transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Save className="size-4" />
        {locked ? "Predicción cerrada" : "Guardar predicción"}
      </button>
      <p className="text-xs text-white/45">Puedes editar hasta 5 minutos antes del inicio del partido.</p>
    </form>
  );
}

function ScoreFields({
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  disabled = false
}: {
  homeScore: string;
  awayScore: string;
  setHomeScore: (value: string) => void;
  setAwayScore: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
      <label className="grid gap-2 text-sm font-semibold text-white/78">
        Local
        <input
          className={inputClass}
          disabled={disabled}
          min={0}
          name="predictedHomeScore"
          type="number"
          value={homeScore}
          onChange={(event) => setHomeScore(event.target.value)}
        />
      </label>
      <span className="pb-3 text-white/45">-</span>
      <label className="grid gap-2 text-sm font-semibold text-white/78">
        Visitante
        <input
          className={inputClass}
          disabled={disabled}
          min={0}
          name="predictedAwayScore"
          type="number"
          value={awayScore}
          onChange={(event) => setAwayScore(event.target.value)}
        />
      </label>
    </div>
  );
}

function Toggle({
  label,
  checked,
  disabled = false,
  onChange
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`min-h-12 rounded-md border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
        checked ? "border-emeraldGlow bg-emeraldGlow/20 text-emeraldGlow" : "border-white/10 bg-white/5 text-white/70"
      }`}
    >
      {label}
    </button>
  );
}
