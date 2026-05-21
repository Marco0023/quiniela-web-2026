"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "quiniela-dashboard-welcome-v1";

export function DashboardWelcomePopup({ groupName }: { groupName: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
    if (window.localStorage.getItem(STORAGE_KEY) !== "seen") {
      setOpen(true);
    }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    window.localStorage.setItem(STORAGE_KEY, "seen");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-sm sm:py-10">
      <section className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/15 bg-[#07162b] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-5rem)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Bienvenido/a</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Tu centro de mando mundialista</h2>
          </div>
          <button
            aria-label="Cerrar"
            className="grid size-9 place-items-center rounded-md bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
            type="button"
            onClick={close}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 text-sm leading-6 text-white/72">
          <p>
            Este dashboard resume todo lo importante de {groupName}: tus puntos, tu puesto, próximos partidos,
            predicciones pendientes y lo que está pasando hoy.
          </p>

          <GuideItem title="Ranking">
            La tabla ordena a todos por puntos. Si dos personas tienen los mismos puntos, comparten la misma posición.
          </GuideItem>

          <GuideItem title="Mis puntos">
            Suben cuando aciertas predicciones. Puedes ganar hasta 6 puntos por partido y puntos extra si tu campeón gana
            el Mundial.
          </GuideItem>

          <GuideItem title="Predicciones pendientes">
            Son los partidos que todavía no has pronosticado. Entra, elige ganador o empate y agrega marcador solo si
            quieres buscar puntos extra.
          </GuideItem>

          <GuideItem title="Jornada de hoy">
            Aquí verás los partidos del día. Cuando se cierren las predicciones, aparecerá una tabla con lo que puso cada
            participante de tu grupo.
          </GuideItem>

          <GuideItem title="Clasificaciones">
            En Partidos puedes ordenar cada grupo del Mundial del puesto 1 al 4. Es una predicción aparte de los partidos:
            si aciertas los dos clasificados ganas 5 puntos, y si clavas las 4 posiciones ganas 12 puntos.
          </GuideItem>

          <GuideItem title="Insignias">
            Son reconocimientos divertidos por momentos especiales: llegar arriba, acertar marcadores o guardar tus primeras
            predicciones.
          </GuideItem>
        </div>

        <button
          className="mt-5 w-full rounded-md bg-gold px-4 py-3 text-sm font-black text-pitch transition hover:bg-white"
          type="button"
          onClick={close}
        >
          Entendido, vamos a jugar
        </button>
      </section>
    </div>
  );
}

function GuideItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-1">{children}</p>
    </div>
  );
}
