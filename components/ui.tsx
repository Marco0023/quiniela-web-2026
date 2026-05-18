import { cn } from "@/lib/utils";

export function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-3">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">{eyebrow}</p> : null}
      <h1 className="text-2xl font-black text-ink md:text-3xl">{title}</h1>
    </div>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-glow backdrop-blur", className)}>
      {children}
    </section>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" | "green" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-1 text-xs font-bold",
        tone === "neutral" && "bg-white/10 text-white/72",
        tone === "gold" && "bg-gold/18 text-gold",
        tone === "green" && "bg-emeraldGlow/15 text-emeraldGlow"
      )}
    >
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/78">
      {label}
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-md border border-white/10 bg-pitch/70 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-gold/70";
