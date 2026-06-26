"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { AdminMatchMissingForm } from "@/components/admin-match-missing-form";
import { AdminTodayPendingPanel } from "@/components/admin-today-pending-panel";
import type { AdminTodayPendingData } from "@/lib/admin/pending-live";
import type { Match, Team } from "@/lib/types";

type PrivateGroupOption = {
  id: string;
  name: string;
  users: {
    id: string;
    alias: string;
    firstName: string;
    lastName: string;
  }[];
};

export function AdminPendingTodaySection({
  groups,
  initialData,
  matches,
  teams,
  timezone
}: {
  groups: PrivateGroupOption[];
  initialData: AdminTodayPendingData;
  matches: Match[];
  teams: Team[];
  timezone: string;
}) {
  const [liveData, setLiveData] = useState(initialData);

  return (
    <>
      {liveData.matches.length > 0 ? (
        <AdminTodayPendingPanel initialData={liveData} onDataChange={setLiveData} />
      ) : (
        <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/58">
          No hay partidos de hoy o ayer sin resultado guardado.
        </p>
      )}

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-4 flex items-center gap-3">
          <ClipboardList className="size-6 text-gold" />
          <div>
            <h2 className="text-xl font-black text-ink">Cargar predicción faltante</h2>
            <p className="text-sm text-white/55">
              Solo partidos de hoy o de ayer que ya cerraron y todavía no tienen resultado guardado.
            </p>
          </div>
        </div>
        <AdminMatchMissingForm
          existingPredictions={liveData.predictions}
          groups={groups}
          matches={matches}
          teams={teams}
          timezone={timezone}
        />
      </div>
    </>
  );
}
