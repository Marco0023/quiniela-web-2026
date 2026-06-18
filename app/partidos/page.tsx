import { AppShell } from "@/components/app-shell";
import { MatchesTabs } from "@/components/matches-tabs";
import type { MatchesTab } from "@/components/matches-tabs";
import { SectionHeader } from "@/components/ui";
import { resolveClassificationGroups } from "@/lib/classification/groups";
import { getDashboardData } from "@/lib/repository";

export default async function MatchesPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; group?: string; saved?: string; tab?: string }>;
}) {
  const status = await searchParams;
  const data = await getDashboardData();
  const classificationGroups = resolveClassificationGroups(data.teams);
  const initialTab = parseTab(status.tab);

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
        initialTab={initialTab}
        matches={data.matches}
        predictions={data.predictions}
        results={data.results}
        savedGroup={status.group}
        teams={data.teams}
        timezone={data.profile.timezone}
      />
    </AppShell>
  );
}

function parseTab(tab?: string): MatchesTab {
  return tab === "classification" || tab === "knockout" || tab === "finals" ? tab : "matches";
}
