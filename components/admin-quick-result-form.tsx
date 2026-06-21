"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminResultSubmitButton } from "@/components/admin-result-submit-button";
import { Badge, inputClass } from "@/components/ui";
import { PHASE_LABELS } from "@/lib/constants";
import { formatKickoff } from "@/lib/format";
import { saveMatchResult } from "@/lib/admin/results-actions";
import type { Match, Team } from "@/lib/types";

export function AdminQuickResultForm({
  match,
  teams,
  timezone
}: {
  match: Match;
  teams: Team[];
  timezone: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  const needsWinner = match.phase !== "group_stage";

  return (
    <div className="rounded-lg border border-white/10 bg-pitch/35">
      <button
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        type="button"
        onClick={() => setIsOpen((value) => !value)}
      >
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="gold">{PHASE_LABELS[match.phase]}</Badge>
            <span className="text-xs font-bold text-white/45">{formatKickoff(match.kickoffAt, timezone)}</span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2 font-black text-white">
            <TeamLabel fallback={match.homePlaceholder ?? "Local"} team={homeTeam} />
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/55">vs</span>
            <TeamLabel fallback={match.awayPlaceholder ?? "Visitante"} team={awayTeam} />
          </div>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-md border border-white/10 text-gold">
          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {isOpen ? (
        <form action={saveMatchResult} className="grid gap-3 border-t border-white/10 px-4 py-4 md:grid-cols-6">
          <input name="matchId" type="hidden" value={match.id} />
          <input name="returnTo" type="hidden" value="/inicio-admin" />
          <label className="grid gap-1 text-xs font-bold text-white/60">
            Local 90 min
            <input className={inputClass} inputMode="numeric" min={0} name="homeScore90" pattern="[0-9]*" type="number" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-white/60">
            Visitante 90 min
            <input className={inputClass} inputMode="numeric" min={0} name="awayScore90" pattern="[0-9]*" type="number" />
          </label>
          <label className="grid gap-1 text-xs font-bold text-white/60 md:col-span-2">
            Ganador / avanza
            <select className={inputClass} defaultValue="" name="winnerTeamId">
              <option value="">{needsWinner ? "Selecciona ganador" : "Calcular si aplica"}</option>
              {[homeTeam, awayTeam].filter(Boolean).map((team) => (
                <option key={team!.id} value={team!.id}>
                  {team!.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-bold text-white/60">
            Prórroga
            <select className={inputClass} defaultValue="false" name="wentExtraTime">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-bold text-white/60">
            Penales
            <select className={inputClass} defaultValue="false" name="wentPenalties">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </label>
          <AdminResultSubmitButton />
        </form>
      ) : null}
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
