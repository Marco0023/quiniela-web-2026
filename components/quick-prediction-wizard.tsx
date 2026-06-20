"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2, LogOut, Save, SkipForward, Zap } from "lucide-react";
import { inputClass } from "@/components/ui";
import { saveQuickGroupPrediction } from "@/lib/predictions/actions";
import { isPredictionLocked, validateScoreConsistency } from "@/lib/scoring";
import type { Match, Outcome, Prediction, Team } from "@/lib/types";

export function QuickPredictionWizard({
  matches,
  predictions,
  teams
}: {
  matches: Match[];
  predictions: Prediction[];
  teams: Team[];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [savedMatchIds, setSavedMatchIds] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const availableMatches = useMemo(
    () =>
      matches.filter(
        (match) => match.phase === "group_stage" && match.status !== "finished" && !isPredictionLocked(match.kickoffAt) && !savedMatchIds.has(match.id)
      ),
    [matches, savedMatchIds]
  );
  const safeIndex = Math.min(index, Math.max(availableMatches.length - 1, 0));
  const currentMatch = availableMatches[safeIndex] ?? availableMatches[0];
  const currentPrediction = currentMatch ? predictions.find((prediction) => prediction.matchId === currentMatch.id) : undefined;
  const hasAvailableMatches = availableMatches.length > 0;

  function closeWizard() {
    setOpen(false);
    setCompleted(false);
  }

  function finishWizard() {
    setCompleted(true);
    window.setTimeout(closeWizard, 1400);
  }

  function goNext() {
    if (safeIndex >= availableMatches.length - 1) {
      finishWizard();
      return;
    }
    setIndex(safeIndex + 1);
  }

  return (
    <>
      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-gold px-5 text-base font-black text-pitch shadow-[0_16px_50px_rgba(244,201,93,0.24)] transition hover:bg-white sm:w-auto"
        type="button"
        onClick={() => {
          setIndex(0);
          setCompleted(!hasAvailableMatches);
          setOpen(true);
          if (!hasAvailableMatches) window.setTimeout(closeWizard, 1400);
        }}
      >
        <Zap className="size-5" />
        Predecir rápido
      </button>

      {open ? (
        <div className="fixed inset-0 z-[90] grid place-items-end bg-[#020817]/78 px-3 py-3 backdrop-blur-sm sm:place-items-center sm:px-5">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-white/10 bg-[#081629] shadow-[0_25px_90px_rgba(0,0,0,0.5)]">
            {completed || !currentMatch ? (
              <div className="grid justify-items-center gap-4 px-5 py-8 text-center">
                <div className="grid size-14 place-items-center rounded-full bg-emeraldGlow/18 text-emeraldGlow">
                  <CheckCircle2 className="size-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Listo, predicciones completadas. Mucha suerte!</h2>
                  <p className="mt-2 text-sm text-white/55">Volviendo a tus partidos.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">
                      Partido {safeIndex + 1} de {availableMatches.length}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-ink">Predecir rápido</h2>
                  </div>
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm font-bold text-white/62 transition hover:border-gold/60 hover:text-gold"
                    type="button"
                    onClick={closeWizard}
                  >
                    <LogOut className="size-4" />
                    Salir
                  </button>
                </div>

                <QuickPredictionStep
                  key={currentMatch.id}
                  awayTeam={teams.find((team) => team.id === currentMatch.awayTeamId)}
                  homeTeam={teams.find((team) => team.id === currentMatch.homeTeamId)}
                  isLast={safeIndex >= availableMatches.length - 1}
                  match={currentMatch}
                  prediction={currentPrediction}
                  onSaved={(matchId, isLast) => {
                    setSavedMatchIds((current) => new Set(current).add(matchId));
                    if (isLast) finishWizard();
                  }}
                  onSkip={goNext}
                />
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function QuickPredictionStep({
  awayTeam,
  homeTeam,
  isLast,
  match,
  prediction,
  onSaved,
  onSkip
}: {
  awayTeam?: Team;
  homeTeam?: Team;
  isLast: boolean;
  match: Match;
  prediction?: Prediction;
  onSaved: (matchId: string, isLast: boolean) => void;
  onSkip: () => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<Outcome>(prediction?.predictedOutcome ?? "home");
  const [homeScore, setHomeScore] = useState(prediction?.predictedHomeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(prediction?.predictedAwayScore?.toString() ?? "");
  const parsedHome = homeScore === "" ? null : Number(homeScore);
  const parsedAway = awayScore === "" ? null : Number(awayScore);
  const scoreIsValid = validateScoreConsistency(outcome, parsedHome, parsedAway);

  async function saveCurrentPrediction() {
    if (!scoreIsValid) {
      setError("El marcador no coincide con tu selección.");
      return;
    }

    setIsSaving(true);
    setError("");
    const formData = new FormData();
    formData.set("matchId", match.id);
    formData.set("predictedOutcome", outcome);
    formData.set("predictedHomeScore", homeScore);
    formData.set("predictedAwayScore", awayScore);

    const result = await saveQuickGroupPrediction(formData);
    setIsSaving(false);

    if (!result.ok) {
      setError(result.error ?? "No se pudo guardar la predicción.");
      return;
    }

    onSaved(match.id, isLast);
  }

  return (
    <>
      <div className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <TeamBlock fallback="Local" team={homeTeam} />
          <span className="rounded bg-white/10 px-3 py-2 text-sm font-black text-white/65">vs</span>
          <TeamBlock align="right" fallback="Visitante" team={awayTeam} />
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-black text-white">¿Quién gana?</p>
        <div className="grid gap-2 sm:grid-cols-3">
          <ChoiceButton active={outcome === "home"} label={homeTeam?.name ?? "Local"} team={homeTeam} onClick={() => setOutcome("home")} />
          <button
            className={`min-h-12 rounded-md border px-3 text-sm font-black transition ${
              outcome === "draw" ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72"
            }`}
            type="button"
            onClick={() => setOutcome("draw")}
          >
            Empate
          </button>
          <ChoiceButton active={outcome === "away"} label={awayTeam?.name ?? "Visitante"} team={awayTeam} onClick={() => setOutcome("away")} />
        </div>
      </div>

      <div className="grid gap-2">
        <p className="text-sm font-black text-white">Marcador opcional</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <ScoreInput label={homeTeam?.name ?? "Local"} name="homeScore" value={homeScore} onChange={setHomeScore} />
          <span className="pb-3 text-white/45">-</span>
          <ScoreInput label={awayTeam?.name ?? "Visitante"} name="awayScore" value={awayScore} onChange={setAwayScore} />
        </div>
      </div>

      {error ? <p className="rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p> : null}

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gold px-4 font-black text-pitch transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={isSaving || !scoreIsValid}
          type="button"
          onClick={saveCurrentPrediction}
        >
          <Save className="size-4" />
          {isSaving ? "Guardando..." : "Guardar y siguiente"}
        </button>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/10 px-4 font-black text-white/68 transition hover:border-gold/60 hover:text-gold"
          type="button"
          onClick={onSkip}
        >
          <SkipForward className="size-4" />
          Saltar
        </button>
      </div>
    </>
  );
}

function TeamBlock({ align = "left", fallback, team }: { align?: "left" | "right"; fallback: string; team?: Team }) {
  return (
    <div className={`grid min-w-0 gap-2 ${align === "right" ? "justify-items-end text-right" : ""}`}>
      {team?.flagUrl ? <Image src={team.flagUrl} alt="" width={42} height={28} className="h-7 w-10 rounded-sm object-cover" /> : null}
      <p className="truncate text-base font-black text-white">{team?.name ?? fallback}</p>
    </div>
  );
}

function ChoiceButton({ active, label, team, onClick }: { active: boolean; label: string; team?: Team; onClick: () => void }) {
  return (
    <button
      className={`flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition ${
        active ? "border-gold bg-gold text-pitch" : "border-white/10 bg-white/5 text-white/72"
      }`}
      type="button"
      onClick={onClick}
    >
      {team?.flagUrl ? <Image src={team.flagUrl} alt="" width={24} height={16} className="h-4 w-6 rounded-sm object-cover" /> : null}
      <span className="truncate">{label}</span>
    </button>
  );
}

function ScoreInput({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-white/78">
      <span className="truncate">{label}</span>
      <input
        className={inputClass}
        inputMode="numeric"
        min={0}
        name={name}
        pattern="[0-9]*"
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
