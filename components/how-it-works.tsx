"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";

export function HowItWorksButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

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

      {open && mounted
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-6 backdrop-blur-sm sm:py-10">
              <section className="max-h-[calc(100dvh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/15 bg-[#07162b] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-5rem)]">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">Guía rápida</p>
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

                <div className="grid gap-4 text-sm leading-6 text-white/72">
                  <InfoBlock title="1. Elige tu campeón">
                    Debes escoger un campeón antes de entrar al dashboard. Esa selección se guarda una sola vez. Si tu equipo
                    gana el Mundial, sumas 30 puntos. Si además acertaste el ganador de la final, recibes 5 puntos extra.
                  </InfoBlock>

                  <InfoBlock title="2. Fase de grupos">
                    Elige ganador local, empate o visitante. El marcador es opcional: puedes sumar 3 puntos por acertar el
                    ganador o empate, 2 más por marcador exacto y 1 más por diferencia de goles.
                  </InfoBlock>

                  <InfoBlock title="3. Clasificaciones">
                    Ordena cada grupo del Mundial del puesto 1 al 4. Si aciertas los dos clasificados ganas 5 puntos; si
                    aciertas las cuatro posiciones exactas, ganas 12 puntos.
                  </InfoBlock>

                  <InfoBlock title="4. Eliminatorias">
                    Aquí eliges quién avanza, contando prórroga y penales. El marcador global es obligatorio: incluye todo
                    lo que pasó en el partido, incluso los penales si los hubo. No puede quedar empate.
                  </InfoBlock>

                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <p className="font-black text-white">Puntos en eliminatorias</p>
                    <ul className="mt-2 grid gap-1">
                      <li>Dieciseisavos: avanza 5 puntos, máximo 16.</li>
                      <li>Octavos: avanza 6 puntos, máximo 17.</li>
                      <li>Cuartos: avanza 7 puntos, máximo 18.</li>
                      <li>Semifinal, tercer puesto y final: avanza/gana 8 puntos, máximo 19.</li>
                      <li>Marcador exacto global: +3. Diferencia de goles global: +2.</li>
                      <li>Prórroga correcta: +3. Penales correctos: +3.</li>
                    </ul>
                  </div>

                  <InfoBlock title="5. Cierre y privacidad">
                    Cada partido se bloquea 5 minutos antes de empezar. Desde ese momento ya no se puede editar y las
                    predicciones del grupo quedan visibles para todos.
                  </InfoBlock>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-black text-white">{title}</h3>
      <p className="mt-1">{children}</p>
    </div>
  );
}
