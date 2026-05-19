import Image from "next/image";
import { Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GroupPredictions } from "@/components/group-predictions";
import { PredictionForm } from "@/components/prediction-form";
import { Card, SectionHeader } from "@/components/ui";
import { PHASE_LABELS } from "@/lib/constants";
import { formatKickoff } from "@/lib/format";
import { getDashboardData, getVisibleMatchPredictions } from "@/lib/repository";
import type { Team } from "@/lib/types";

export default async function MatchDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const status = await searchParams;
  const [data, visiblePredictions] = await Promise.all([
    getDashboardData(),
    getVisibleMatchPredictions(id)
  ]);
  const match = data.matches.find((item) => item.id === id);
  if (!match) notFound();

  const homeTeam = data.teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = data.teams.find((team) => team.id === match.awayTeamId);
  const result = data.results.find((item) => item.matchId === match.id);
  const showFinalScore = match.status === "finished" && result;

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <SectionHeader eyebrow={PHASE_LABELS[match.phase]} title={`Partido ${match.matchNumber}`} />
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
        <Card>
          <p className="mb-5 inline-flex items-center gap-2 text-base font-black text-gold md:text-lg">
            <Clock className="size-5" />
            {formatKickoff(match.kickoffAt, data.profile.timezone)}
          </p>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <ScoreTeam team={homeTeam} fallback={match.homePlaceholder} align="right" />
            {showFinalScore ? (
              <div className="grid place-items-center">
                <div className="flex min-w-28 items-center justify-center gap-3 rounded-md bg-pitch/65 px-3 py-2 text-3xl font-black text-white">
                  <span>{result.homeScore90 ?? "-"}</span>
                  <span className="text-base text-white/35">-</span>
                  <span>{result.awayScore90 ?? "-"}</span>
                </div>
                <span className="mt-1 text-xs font-bold text-white/45">Final 90 min</span>
              </div>
            ) : (
              <span className="rounded bg-white/10 px-3 py-2 text-sm font-black text-white/60">VS</span>
            )}
            <ScoreTeam team={awayTeam} fallback={match.awayPlaceholder} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-2 text-xl font-black">Tu predicción</h2>
          <p className="mb-4 text-sm leading-6 text-white/58">
            Completa tu jugada antes de que cierre el partido. El ganador suma, y el marcador opcional puede darte gloria extra.
          </p>
          {status.error ? (
            <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p>
          ) : null}
          {status.saved ? (
            <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">
              Predicción guardada.
            </p>
          ) : null}
          <PredictionForm
            match={match}
            teams={data.teams}
            prediction={data.predictions.find((prediction) => prediction.matchId === match.id)}
          />
        </Card>
      </div>
      <div className="mt-5">
        <GroupPredictions
          isRevealed={visiblePredictions.isRevealed}
          match={match}
          predictions={visiblePredictions.predictions}
          users={visiblePredictions.users}
          teams={data.teams}
        />
      </div>
    </AppShell>
  );
}

function ScoreTeam({ team, fallback, align = "left" }: { team?: Team; fallback?: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "min-w-0 text-right" : "min-w-0"}>
      <div className={align === "right" ? "flex justify-end" : "flex justify-start"}>
        {team?.flagUrl ? (
          <Image src={team.flagUrl} alt="" width={42} height={30} className="h-7 w-10 rounded-sm object-cover" />
        ) : (
          <span className="h-7 w-10 rounded-sm bg-white/10" />
        )}
      </div>
      <p className="mt-2 truncate text-lg font-black text-white">{team?.name ?? fallback ?? "Por definir"}</p>
    </div>
  );
}
