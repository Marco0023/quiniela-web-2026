import type { MatchStatus } from "@/lib/types";

export function formatKickoff(kickoffAt: string, timezone = "America/Bogota") {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
    timeZone: timezone
  }).format(new Date(kickoffAt));
}

export function statusLabel(status: MatchStatus) {
  const labels: Record<MatchStatus, string> = {
    scheduled: "Proximo",
    locked: "Cerrado",
    live: "En juego",
    finished: "Finalizado",
    postponed: "Pospuesto",
    cancelled: "Cancelado"
  };
  return labels[status];
}
