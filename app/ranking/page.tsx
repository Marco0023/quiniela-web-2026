import { AppShell } from "@/components/app-shell";
import { RankingTable } from "@/components/ranking-table";
import { SectionHeader } from "@/components/ui";
import { getDashboardData } from "@/lib/repository";

export default async function RankingPage() {
  const data = await getDashboardData();

  return (
    <AppShell>
      <SectionHeader eyebrow={data.group?.name} title="Ranking del grupo" />
      <RankingTable ranking={data.ranking} currentUserId={data.profile.id} />
    </AppShell>
  );
}
