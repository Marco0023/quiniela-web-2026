import { AppShell } from "@/components/app-shell";
import { MatchesTabs } from "@/components/matches-tabs";
import { SectionHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/repository";
import { namesForTeamLookup, normalizeLookupName, WORLD_CUP_GROUPS } from "@/lib/world-cup-groups";
import type { Team } from "@/lib/types";

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const status = await searchParams;
  const data = await getDashboardData();
  const classificationGroups = resolveClassificationGroups(data.teams);

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <SectionHeader eyebrow="Mundial 2026" title="Partidos y predicciones" />
      {status.error ? <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p> : null}
      {status.saved ? (
        <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">
          {status.saved === "prediccion" ? "Predicción guardada. Puedes seguir con el próximo partido." : "Clasificación guardada."}
        </p>
      ) : null}
      <MatchesTabs
        classificationPredictions={data.classificationPredictions}
        groups={classificationGroups}
        matches={data.matches}
        predictions={data.predictions}
        results={data.results}
        teams={data.teams}
        timezone={data.profile.timezone}
      />
    </AppShell>
  );
}

function resolveClassificationGroups(teams: Team[]) {
  const teamMap = new Map(teams.flatMap((team) => [[normalizeLookupName(team.name), team], [normalizeLookupName(team.shortName), team]]));

  return WORLD_CUP_GROUPS.map((group) => ({
    ...group,
    teams: group.teams.map((name) => {
      const team = namesForTeamLookup(name)
        .map((candidate) => teamMap.get(normalizeLookupName(candidate)))
        .find(Boolean);

      return {
        id: team?.id ?? null,
        name,
        flagUrl: team?.flagUrl ?? ""
      };
    })
  }));
}
