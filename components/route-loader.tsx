"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MIN_VISIBLE_MS = 450;

export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target) return;

      const href = target.getAttribute("href");
      const linkTarget = target.getAttribute("target");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || linkTarget === "_blank") {
        return;
      }

      const nextUrl = new URL(href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;
      if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsLoading(true);
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsLoading(false), MIN_VISIBLE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-[#020817]/70 backdrop-blur-sm" aria-live="polite">
      <div className="grid justify-items-center gap-3 rounded-lg border border-white/10 bg-[#081629]/90 px-8 py-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <div className="route-loader-ball text-5xl" aria-hidden="true">
          ⚽
        </div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Cargando</p>
      </div>
    </div>
  );
}
