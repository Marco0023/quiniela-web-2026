import { AppShell } from "@/components/app-shell";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getAdminLogsData } from "@/lib/repository";

export default async function AdminLogsPage() {
  const data = await getAdminLogsData();

  return (
    <AppShell>
      <SectionHeader eyebrow="Admin" title="Logs de sincronizacion" />
      {data.logs.length === 0 ? (
        <Card>
          <p className="text-sm text-white/60">
            Todavía no hay logs. Aparecerán cuando ejecutes una sincronización o guardes resultados manuales.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-white/10">
            {data.logs.map((log) => (
              <div key={log.id} className="grid gap-2 px-4 py-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{log.message ?? "Sin mensaje"}</p>
                    <Badge tone={log.status === "success" ? "green" : log.status === "partial" ? "gold" : "neutral"}>
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/50">
                    {log.provider} / {log.sync_type}
                  </p>
                </div>
                <p className="text-sm text-white/45">
                  {new Intl.DateTimeFormat("es", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    hour12: true,
                    timeZone: "America/Bogota"
                  }).format(new Date(log.created_at))}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
