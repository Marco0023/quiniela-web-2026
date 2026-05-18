import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";
import { Card, inputClass, SectionHeader } from "@/components/ui";
import { PHASE_LABELS } from "@/lib/constants";
import { statusLabel } from "@/lib/format";
import { saveMatchResult } from "@/lib/admin/results-actions";
import { getAdminResultsData } from "@/lib/repository";

export default async function AdminResultsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const status = await searchParams;
  const data = await getAdminResultsData();

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionHeader eyebrow="Admin" title="Resultados" />
        <form action="/api/sync" method="post">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-4 font-black text-pitch" type="submit">
            <RefreshCw className="size-4" />
            Actualizar ahora
          </button>
        </form>
      </div>
      {status.error ? (
        <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p>
      ) : null}
      {status.saved ? (
        <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">Resultado guardado y puntos recalculados.</p>
      ) : null}
      <div className="grid gap-3">
        {data.matches.map((match) => {
          const homeTeam = data.teams.find((team) => team.id === match.homeTeamId);
          const awayTeam = data.teams.find((team) => team.id === match.awayTeamId);
          const result = data.resultsByMatchId.get(match.id);

          return (
          <Card key={match.id} className="grid gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">Partido {match.matchNumber}</p>
                <p className="text-sm text-white/55">{PHASE_LABELS[match.phase]}</p>
              </div>
              <p className="text-sm font-bold text-gold">{statusLabel(match.status)}</p>
            </div>
            <div className="grid gap-2 text-sm text-white/75">
              <TeamBadge team={homeTeam} fallback={match.homePlaceholder} />
              <TeamBadge team={awayTeam} fallback={match.awayPlaceholder} />
            </div>
            <form action={saveMatchResult} className="grid gap-3 md:grid-cols-6">
              <input name="matchId" type="hidden" value={match.id} />
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Local 90 min
                <input className={inputClass} defaultValue={result?.homeScore90 ?? ""} min={0} name="homeScore90" type="number" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Visitante 90 min
                <input className={inputClass} defaultValue={result?.awayScore90 ?? ""} min={0} name="awayScore90" type="number" />
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60 md:col-span-2">
                Ganador / avanza
                <select className={inputClass} defaultValue={result?.winnerTeamId ?? ""} name="winnerTeamId">
                  <option value="">Calcular si aplica</option>
                  {[homeTeam, awayTeam].filter(Boolean).map((team) => (
                    <option key={team!.id} value={team!.id}>
                      {team!.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Prorroga
                <select className={inputClass} defaultValue={String(result?.wentExtraTime ?? false)} name="wentExtraTime">
                  <option value="false">No</option>
                  <option value="true">Si</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Penales
                <select className={inputClass} defaultValue={String(result?.wentPenalties ?? false)} name="wentPenalties">
                  <option value="false">No</option>
                  <option value="true">Si</option>
                </select>
              </label>
              <button className="min-h-11 rounded-md bg-gold px-4 font-black text-pitch md:col-span-6" type="submit">
                Guardar resultado
              </button>
            </form>
          </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
