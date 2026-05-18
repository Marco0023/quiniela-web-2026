import Link from "next/link";
import { Activity, CircleCheck, DatabaseZap, ListChecks, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionHeader } from "@/components/ui";
import { getAdminOverviewData } from "@/lib/repository";

export default async function AdminPage() {
  const data = await getAdminOverviewData();
  const modules = [
    { href: "/admin/usuarios", label: "Usuarios", icon: UsersRound, value: data.stats.users },
    { href: "/admin/predicciones", label: "Predicciones", icon: ListChecks, value: data.stats.predictions },
    { href: "/admin/resultados", label: "Partidos", icon: DatabaseZap, value: data.stats.matches },
    { href: "/admin/logs", label: "Logs", icon: Activity, value: data.stats.logs }
  ];

  return (
    <AppShell>
      <SectionHeader eyebrow="Panel" title="Administrador" />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href}>
              <Card className="transition hover:border-gold/60">
                <Icon className="mb-4 size-6 text-gold" />
                <p className="text-sm text-white/55">{item.label}</p>
                <p className="text-3xl font-black">{item.value}</p>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Card>
          <CircleCheck className="mb-3 size-6 text-emeraldGlow" />
          <p className="text-sm text-white/55">Partidos finalizados</p>
          <p className="text-3xl font-black">{data.stats.finishedMatches}</p>
        </Card>
        <Card>
          <ListChecks className="mb-3 size-6 text-gold" />
          <p className="text-sm text-white/55">Predicciones pendientes de puntaje</p>
          <p className="text-3xl font-black">{data.stats.pendingPredictions}</p>
        </Card>
      </div>
    </AppShell>
  );
}
