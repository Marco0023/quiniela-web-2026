"use client";

import { useState } from "react";
import type { FunBadge } from "@/lib/badges";

export function BadgeChip({ badge }: { badge: FunBadge }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex">
      <button
        type="button"
        className="rounded-md border border-gold/20 bg-gold/10 px-2.5 py-1.5 text-left text-xs font-bold text-gold"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {badge.emoji} {badge.title}
      </button>
      {open ? (
        <span className="fixed inset-0 z-[100] grid place-items-center bg-black/55 px-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <span
            className="w-full max-w-sm rounded-lg border border-white/10 bg-[#07162b] p-4 text-sm leading-6 text-white/75 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <strong className="block text-lg font-black text-white">
              {badge.emoji} {badge.title}
            </strong>
            <span className="mt-2 block">{badge.description}</span>
            <button
              type="button"
              className="mt-4 w-full rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch"
              onClick={() => setOpen(false)}
            >
              Entendido
            </button>
          </span>
        </span>
      ) : null}
    </span>
  );
}
