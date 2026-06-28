import { RefreshCw } from "lucide-react";
import { AdminResultSubmitButton } from "@/components/admin-result-submit-button";
import { AppShell } from "@/components/app-shell";
import { TeamBadge } from "@/components/team-badge";
import { Card, inputClass, SectionHeader } from "@/components/ui";
import { PHASE_LABELS } from "@/lib/constants";
import { statusLabel } from "@/lib/format";
import { saveMatchResult } from "@/lib/admin/results-actions";
import { getAdminResultsData } from "@/lib/repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminResultsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; synced?: string }> }) {
  const status = await searchParams;
  const data = await getAdminResultsData();

  return (
    <AppShell showAdmin>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <SectionHeader eyebrow="Admin" title="Resultados" />
        <button
          className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 font-black text-white/45"
          disabled
          title="Sincronización pausada hasta acercarnos al torneo."
          type="button"
        >
          <RefreshCw className="size-4" />
          Sync pausado
        </button>
      </div>
      {status.error ? (
        <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p>
      ) : null}
      {status.saved ? (
        <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">Resultado guardado y puntos recalculados.</p>
      ) : null}
      {status.synced ? (
        <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">Datos sincronizados correctamente.</p>
      ) : null}
      <div className="grid gap-3">
        {data.matches.map((match) => {
          const homeTeam = data.teams.find((team) => team.id === match.homeTeamId);
          const awayTeam = data.teams.find((team) => team.id === match.awayTeamId);
          const result = data.resultsByMatchId.get(match.id);
          const needsWinner = match.phase !== "group_stage";

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
                <input
                  className={inputClass}
                  defaultValue={result?.homeScore90 ?? ""}
                  inputMode="numeric"
                  min={0}
                  name="homeScore90"
                  pattern="[0-9]*"
                  type="number"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Visitante 90 min
                <input
                  className={inputClass}
                  defaultValue={result?.awayScore90 ?? ""}
                  inputMode="numeric"
                  min={0}
                  name="awayScore90"
                  pattern="[0-9]*"
                  type="number"
                />
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60 md:col-span-2">
                Ganador / avanza
                <select className={inputClass} defaultValue={result?.winnerTeamId ?? ""} name="winnerTeamId">
                  <option value="">{needsWinner ? "Selecciona ganador / avanza" : "Calcular si aplica"}</option>
                  {[homeTeam, awayTeam].filter(Boolean).map((team, index) => (
                    <option key={`${match.id}-${team!.id}-${index}`} value={team!.id}>
                      {team!.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Prorroga
                <select className={inputClass} defaultValue={String(result?.wentExtraTime ?? false)} name="wentExtraTime">
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs font-bold text-white/60">
                Penales
                <select className={inputClass} defaultValue={String(result?.wentPenalties ?? false)} name="wentPenalties">
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </label>
              <AdminResultSubmitButton />
            </form>
          </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
