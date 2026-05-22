export default function Loading() {
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
