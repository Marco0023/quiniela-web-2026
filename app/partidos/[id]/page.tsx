import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { GroupPredictions } from "@/components/group-predictions";
import { PredictionForm } from "@/components/prediction-form";
import { TeamBadge } from "@/components/team-badge";
import { Card, SectionHeader } from "@/components/ui";
import { PHASE_LABELS } from "@/lib/constants";
import { formatKickoff } from "@/lib/format";
import { getDashboardData, getVisibleMatchPredictions } from "@/lib/repository";

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

  return (
    <AppShell>
      <SectionHeader eyebrow={PHASE_LABELS[match.phase]} title={`Partido ${match.matchNumber}`} />
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1fr]">
        <Card>
          <p className="mb-4 text-sm text-white/55">{formatKickoff(match.kickoffAt, data.profile.timezone)}</p>
          <div className="grid gap-4 text-xl">
            <TeamBadge team={homeTeam} fallback={match.homePlaceholder} />
            <span className="text-sm font-black text-white/35">VS</span>
            <TeamBadge team={awayTeam} fallback={match.awayPlaceholder} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-black">Tu prediccion</h2>
          {status.error ? (
            <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p>
          ) : null}
          {status.saved ? (
            <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">
              Prediccion guardada.
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
