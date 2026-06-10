"use client";

import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { inputClass } from "@/components/ui";
import { savePrediction } from "@/lib/predictions/actions";
import { getPredictionType, isPredictionLocked, validateScoreConsistency } from "@/lib/scoring";
import type { Match, Outcome, Prediction, Team } from "@/lib/types";

export function PredictionForm({ match, teams, prediction }: { match: Match; teams: Team[]; prediction?: Prediction }) {
  const router = useRouter();
  const predictionType = getPredictionType(match);
  const locked = isPredictionLocked(match.kickoffAt);
  const [saveState, formAction, isPending] = useActionState(savePrediction, null);
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
  const isSavedRedirecting = saveState?.status === "saved";

  useEffect(() => {
    if (!saveState?.redirectTo) return;

    const timeout = window.setTimeout(() => {
      router.push(saveState.redirectTo);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [router, saveState]);

  return (
    <form action={formAction} className="grid gap-4">
      {isSavedRedirecting ? (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-[#020817]/72 px-4 backdrop-blur-sm" aria-live="polite">
          <div className="grid max-w-sm justify-items-center gap-3 rounded-lg border border-emeraldGlow/30 bg-[#081629]/95 px-6 py-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="grid size-12 place-items-center rounded-full bg-emeraldGlow/18 text-2xl">✓</div>
            <p className="text-lg font-black text-white">Predicción guardada</p>
            <p className="text-sm leading-6 text-emeraldGlow">Volviendo a todos los partidos.</p>
          </div>
        </div>
      ) : null}
      <input name="matchId" type="hidden" value={match.id} />
      <input name="predictedOutcome" type="hidden" value={outcome} />
      <input name="predictedWinnerTeamId" type="hidden" value={winnerTeamId} />
      <input name="predictsExtraTime" type="hidden" value={String(extraTime)} />
      <input name="predictsPenalties" type="hidden" value={String(penalties)} />

      {predictionType === "group_stage" ? (
        <>
          <div>
            <h3 className="font-black text-white">¿Quién crees que gana?</h3>
            <p className="mt-1 text-sm leading-6 text-white/58">
              Si aciertas el ganador o el empate, sumas 3 puntos. Elige con el corazón, con la mente o con el presentimiento familiar.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <OutcomeButton
              active={outcome === "home"}
              disabled={locked}
              label={homeTeam?.name ?? "Local"}
              team={homeTeam}
              onClick={() => setOutcome("home")}
            />
            <button
              type="button"
              disabled={locked}
              onClick={() => setOutcome("draw")}
              className={`min-h-14 rounded-md border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
                outcome === "draw" ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72"
              }`}
            >
              Empate
            </button>
            <OutcomeButton
              active={outcome === "away"}
              disabled={locked}
              label={awayTeam?.name ?? "Visitante"}
              team={awayTeam}
              onClick={() => setOutcome("away")}
            />
          </div>
          <ScoreFields
            homeLabel={homeTeam?.name ?? "Local"}
            awayLabel={awayTeam?.name ?? "Visitante"}
            homeScore={homeScore}
            awayScore={awayScore}
            setHomeScore={setHomeScore}
            setAwayScore={setAwayScore}
            disabled={locked}
          />
          <p className="rounded-md border border-gold/20 bg-gold/10 px-3 py-2 text-sm leading-6 text-gold">
            El marcador no es obligatorio. Pero si quieres medir tu poder mundialista, puedes sumar puntos extra por acertar
            el resultado exacto o la diferencia de goles.
          </p>
          {!scoreIsValid ? (
            <p className="rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">
              El marcador opcional debe coincidir con la selección principal.
            </p>
          ) : null}
        </>
      ) : null}

      {predictionType === "knockout" || predictionType === "final" ? (
        <>
          <div>
            <h3 className="font-black text-white">
              {predictionType === "final" ? "¿Quién gana la final?" : "¿Quién avanza?"}
            </h3>
            <p className="mt-1 text-sm leading-6 text-white/58">
              En eliminación cuenta quién sigue con vida, incluyendo prórroga y penales.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[homeTeam, awayTeam].filter(Boolean).map((team) => (
              <WinnerButton
                key={team!.id}
                active={winnerTeamId === team!.id}
                disabled={locked}
                team={team!}
                onClick={() => setWinnerTeamId(team!.id)}
              />
            ))}
          </div>

          {predictionType === "final" ? (
            <>
              <ScoreFields
                homeLabel={homeTeam?.name ?? "Local"}
                awayLabel={awayTeam?.name ?? "Visitante"}
                homeScore={homeScore}
                awayScore={awayScore}
                setHomeScore={setHomeScore}
                setAwayScore={setAwayScore}
                disabled={locked}
              />
              <p className="rounded-md border border-gold/20 bg-gold/10 px-3 py-2 text-sm leading-6 text-gold">
                El marcador es opcional y corresponde a los 90 minutos. Si te sale la visión, puedes sumar puntos extra.
              </p>
            </>
          ) : null}

          <div className="grid grid-cols-2 gap-2">
            <Toggle label="Habrá prórroga" checked={extraTime} disabled={locked} onChange={setExtraTime} />
            <Toggle label="Habrá penales" checked={penalties} disabled={locked} onChange={setPenalties} />
          </div>
        </>
      ) : null}

      <button
        type="submit"
        disabled={!scoreIsValid || locked || isPending || isSavedRedirecting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-4 font-black text-pitch transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        <Save className="size-4" />
        {locked ? "Predicción cerrada" : isPending || isSavedRedirecting ? "Guardando..." : "Guardar predicción"}
      </button>
      <p className="text-sm leading-6 text-white/50">
        Guarda tu predicción con tranquilidad. Si después te arrepientes, puedes modificarla hasta 5 minutos antes de que
        empiece el partido.
      </p>
    </form>
  );
}

function OutcomeButton({
  active,
  disabled,
  label,
  team,
  onClick
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  team?: Team;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
        active ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72"
      }`}
    >
      {team?.flagUrl ? <Image src={team.flagUrl} alt="" width={26} height={18} className="h-4 w-6 rounded-sm object-cover" /> : null}
      <span className="truncate">{label}</span>
    </button>
  );
}

function WinnerButton({
  active,
  disabled,
  team,
  onClick
}: {
  active: boolean;
  disabled: boolean;
  team: Team;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-14 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
        active ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72"
      }`}
    >
      {team.flagUrl ? <Image src={team.flagUrl} alt="" width={26} height={18} className="h-4 w-6 rounded-sm object-cover" /> : null}
      <span className="truncate">{team.name}</span>
    </button>
  );
}

function ScoreFields({
  homeLabel,
  awayLabel,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  disabled = false
}: {
  homeLabel: string;
  awayLabel: string;
  homeScore: string;
  awayScore: string;
  setHomeScore: (value: string) => void;
  setAwayScore: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
      <label className="grid min-w-0 gap-2 text-sm font-semibold text-white/78">
        <span className="truncate">{homeLabel}</span>
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
      <label className="grid min-w-0 gap-2 text-sm font-semibold text-white/78">
        <span className="truncate">{awayLabel}</span>
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
