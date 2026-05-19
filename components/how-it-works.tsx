"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

export function HowItWorksButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/68 transition hover:bg-white/10 hover:text-white"
        type="button"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="size-4" />
        ¿Cómo funciona?
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 px-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-lg border border-white/15 bg-[#07162b] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Reglas rápidas</p>
                <h2 className="mt-1 text-2xl font-black text-ink">¿Cómo funciona?</h2>
              </div>
              <button
                aria-label="Cerrar"
                className="grid size-9 place-items-center rounded-md bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
                type="button"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid gap-3 text-sm leading-6 text-white/72">
              <p>
                Entras con tu grupo privado, eliges tu campeón una sola vez y haces predicciones antes de que cierre cada partido.
              </p>
              <ul className="grid gap-2">
                <li><strong className="text-white">Ganador o empate:</strong> 3 puntos.</li>
                <li><strong className="text-white">Marcador exacto:</strong> +2 puntos.</li>
                <li><strong className="text-white">Diferencia de goles:</strong> +1 punto en victorias.</li>
                <li><strong className="text-white">Campeón acertado:</strong> 10 puntos.</li>
                <li><strong className="text-white">Campeón + final acertada:</strong> bonus de 5 puntos.</li>
              </ul>
              <p>
                Las predicciones se bloquean 5 minutos antes del inicio y ahí se revelan las del grupo.
              </p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
