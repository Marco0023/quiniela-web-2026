import Link from "next/link";
import { BarChart3, CalendarDays, History, Home, Shield } from "lucide-react";
import { HowItWorksButton } from "@/components/how-it-works";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/partidos", label: "Partidos", icon: CalendarDays },
  { href: "/ranking", label: "Ranking", icon: BarChart3 },
  { href: "/historial", label: "Historial", icon: History }
];

const adminNavItems = [
  { href: "/admin", label: "Admin", icon: Shield }
];

export function AppShell({
  children,
  className,
  showAdmin = false
}: {
  children: React.ReactNode;
  className?: string;
  showAdmin?: boolean;
}) {
  const visibleNavItems = showAdmin ? [...navItems, ...adminNavItems] : navItems;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-pitch/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="leading-tight">
            <span className="block text-xs uppercase tracking-[0.24em] text-gold">Privada</span>
            <span className="text-lg font-black text-ink">Quiniela Mundial 2026</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <HowItWorksButton />
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/68 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto max-w-6xl px-4 py-5 md:py-8", className)}>{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-pitch/92 px-2 py-2 backdrop-blur-xl md:hidden">
        <div className="mb-1 flex justify-center">
          <HowItWorksButton />
        </div>
        <div className={cn("grid gap-1", showAdmin ? "grid-cols-5" : "grid-cols-4")}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] text-white/70"
              >
                <Icon className="size-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
