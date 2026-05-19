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
                Debes escoger un campeón antes de entrar al dashboard. Esa selección se guarda una sola vez y no se puede
                cambiar. Si tu equipo gana el Mundial, sumas 10 puntos. Si además acertaste el ganador de la final, recibes
                un bonus adicional.
              </InfoBlock>

              <InfoBlock title="2. Haz tus predicciones por partido">
                Primero eliges quién gana: local, empate o visitante. El marcador exacto es opcional. Si no sabes mucho de
                fútbol, puedes elegir solo el ganador y listo. Si quieres arriesgar para ganar más puntos, agregas marcador.
              </InfoBlock>

              <InfoBlock title="3. ¿Qué es la diferencia de goles?">
                Es por cuántos goles gana un equipo. Por ejemplo, 2-1 y 3-2 tienen diferencia de 1 gol. Si aciertas el
                ganador y la diferencia, puedes sumar un punto extra aunque no pegues el marcador exacto.
              </InfoBlock>

              <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                <p className="font-black text-white">Puntos por partido</p>
                <ul className="mt-2 grid gap-1">
                  <li>Ganador o empate: 3 puntos.</li>
                  <li>Marcador exacto opcional: +2 puntos.</li>
                  <li>Diferencia de goles en victorias: +1 punto.</li>
                  <li>Total máximo por partido: 6 puntos.</li>
                </ul>
              </div>

              <InfoBlock title="4. ¿Qué ves en el dashboard?">
                Arriba ves tu campeón, tus puntos, tu posición y tus insignias recientes. También aparecen predicciones
                pendientes, ranking del grupo y la jornada de hoy. Cuando un partido se cierra, puedes ver qué predijo cada
                participante de tu grupo.
              </InfoBlock>

              <InfoBlock title="5. ¿Cuándo se cierran las predicciones?">
                Cada partido se bloquea 5 minutos antes de empezar. Desde ese momento ya no se puede editar y las
                predicciones del grupo quedan visibles para todos.
              </InfoBlock>
            </div>
          </section>
        </div>
      ) : null}
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
