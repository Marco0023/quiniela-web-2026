"use client";

import Image from "next/image";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui";
import type { AdminTodayPendingData } from "@/lib/admin/pending-live";

export function AdminTodayPendingPanel({
  initialData,
  onDataChange
}: {
  initialData: AdminTodayPendingData;
  onDataChange?: (data: AdminTodayPendingData) => void;
}) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(initialData.generatedAt);

  async function fetchLiveData() {
    setIsRefreshing(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/pendientes/partidos?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!response.ok) throw new Error("No se pudieron actualizar las predicciones.");
      const freshData = (await response.json()) as AdminTodayPendingData;
      setData(freshData);
      setUpdatedAt(freshData.generatedAt);
      onDataChange?.(freshData);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
      setError(fetchError instanceof Error ? fetchError.message : "No se pudieron actualizar las predicciones.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">Faltan por predecir</p>
          <p className="text-xs text-white/50">
            {isRefreshing ? "Actualizando..." : `Actualizado ${relativeUpdateLabel(updatedAt)}`}
          </p>
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gold/35 bg-gold/12 px-3 text-sm font-black text-gold transition hover:border-gold hover:bg-gold hover:text-pitch disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isRefreshing}
          type="button"
          onClick={() => fetchLiveData()}
        >
          <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Actualizando..." : "Actualizar predicciones"}
        </button>
      </div>

      {error ? <p className="rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p> : null}

      {data.matches.length > 0 ? (
        <div className="grid gap-3">
          {data.matches.map((match) => (
            <TodayPendingMatchCard key={match.id} match={match} timezone={data.timezone} />
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/58">
          No hay partidos programados para hoy en tu horario.
        </p>
      )}
    </div>
  );
}

function TodayPendingMatchCard({ match, timezone }: { match: AdminTodayPendingData["matches"][number]; timezone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-pitch/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{match.statusLabel}</Badge>
            <span className="text-xs font-bold text-white/45">{match.phaseLabel}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-base font-black text-white">
            <TeamLabel fallback={match.homePlaceholder} team={match.homeTeam} />
            <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/55">vs</span>
            <TeamLabel fallback={match.awayPlaceholder} team={match.awayTeam} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-white/55">{formatMatchTime(match.kickoffAt, timezone)}</p>
          <p className="mt-1 text-lg font-black text-gold">
            {match.submitted}/{match.totalUsers} predijeron
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {match.groups.map((group) => (
          <MissingList
            key={`${match.id}-${group.id}`}
            emptyText="Todos listos."
            items={group.missing}
            title={`${group.name} - faltan ${group.missing.length}`}
            submitted={group.submitted}
            total={group.total}
          />
        ))}
      </div>
    </div>
  );
}

function MissingList({
  emptyText,
  items,
  submitted,
  title,
  total
}: {
  emptyText: string;
  items: AdminTodayPendingData["matches"][number]["groups"][number]["missing"];
  submitted: number;
  title: string;
  total: number;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <p className="mb-1 text-sm font-black text-gold">{title}</p>
      <p className="mb-2 text-xs font-bold text-white/45">
        {submitted}/{total} predijeron
      </p>
      {items.length > 0 ? (
        <ul className="grid gap-1.5">
          {items.map((user) => (
            <li key={user.id} className="rounded bg-white/[0.04] px-2 py-1.5 text-sm text-white/72">
              <strong className="text-white">{user.alias}</strong>
              <span className="text-white/45">
                {" "}
                - {user.firstName} {user.lastName}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-emeraldGlow">{emptyText}</p>
      )}
    </div>
  );
}

function TeamLabel({
  fallback,
  team
}: {
  fallback: string;
  team: AdminTodayPendingData["matches"][number]["homeTeam"];
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {team?.flagUrl ? (
        <Image src={team.flagUrl} alt="" width={28} height={20} className="h-5 w-7 rounded-sm object-cover" />
      ) : (
        <span className="h-5 w-7 rounded-sm bg-white/10" />
      )}
      <span className="truncate">{team?.name ?? fallback}</span>
    </span>
  );
}

function formatMatchTime(kickoffAt: string, timezone: string) {
  return new Intl.DateTimeFormat("es", {
    timeZone: timezone,
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(kickoffAt));
}

function relativeUpdateLabel(date: string) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 10) return "hace unos segundos";
  if (seconds < 60) return `hace ${seconds} segundos`;
  const minutes = Math.round(seconds / 60);
  return `hace ${minutes} min`;
}
