import { AppShell } from "@/components/app-shell";
import { RankingDetailTable } from "@/components/ranking-detail-table";
import { SectionHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/repository";

export default async function RankingPage() {
  const data = await getDashboardData();

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <SectionHeader eyebrow={data.group?.name} title="Ranking del grupo" />
      <RankingDetailTable
        ranking={data.ranking}
        matches={data.matches}
        results={data.results}
        predictions={data.groupPredictions}
        champions={data.groupChampionPredictions}
        classificationPredictions={data.groupClassificationPredictions}
        teams={data.teams}
        currentUserId={data.profile.id}
      />
    </AppShell>
  );
}
