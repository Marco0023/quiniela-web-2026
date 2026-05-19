"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "quiniela-champion-info-v1";

export function ChampionInfoPopup() {
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
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-lg border border-white/15 bg-[#07162b] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Primer paso</p>
            <h2 className="mt-1 text-2xl font-black text-ink">Elige tu campeón</h2>
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

        <div className="grid gap-3 text-sm leading-6 text-white/72">
          <p>
            Antes de entrar a la quiniela debes elegir quién crees que ganará el Mundial. Es una predicción global,
            separada de los partidos.
          </p>
          <p>
            Si tu campeón gana el torneo, sumas 10 puntos. Si ese equipo llega a la final y además acertaste el ganador de
            esa final, recibes un bonus adicional.
          </p>
          <p className="rounded-md border border-gold/20 bg-gold/10 p-3 font-bold text-gold">
            Importante: esta selección se guarda una sola vez y no podrás cambiarla después.
          </p>
        </div>

        <button
          className="mt-5 w-full rounded-md bg-gold px-4 py-3 text-sm font-black text-pitch transition hover:bg-white"
          type="button"
          onClick={close}
        >
          Entendido
        </button>
      </section>
    </div>
  );
}
