import { AppShell } from "@/components/app-shell";
import { MatchCard } from "@/components/match-card";
import { SectionHeader } from "@/components/ui";
import { PHASE_LABELS, PHASE_ORDER } from "@/lib/constants";
import { getDashboardData } from "@/lib/repository";

export default async function MatchesPage() {
  const data = await getDashboardData();

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <SectionHeader eyebrow="Mundial 2026" title="Partidos y predicciones" />
      <div className="grid gap-7">
        {PHASE_ORDER.map((phase) => {
          const phaseMatches = data.matches.filter((match) => match.phase === phase);
          if (phaseMatches.length === 0) return null;
          return (
            <section key={phase}>
              <h2 className="mb-3 text-lg font-black text-gold">{PHASE_LABELS[phase]}</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {phaseMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teams={data.teams}
                    result={data.results.find((result) => result.matchId === match.id)}
                    prediction={data.predictions.find((prediction) => prediction.matchId === match.id)}
                    timezone={data.profile.timezone}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
