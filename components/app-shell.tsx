import Link from "next/link";
import { BarChart3, CalendarDays, History, Home, Shield } from "lucide-react";
import { HowItWorksButton } from "@/components/how-it-works";
import { MobileNav, type MobileNavItem } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";

const navItems: MobileNavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "home" },
  { href: "/partidos", label: "Partidos", icon: "calendar" },
  { href: "/ranking", label: "Ranking", icon: "ranking" },
  { href: "/historial", label: "Historial", icon: "history" }
];

const adminNavItems: MobileNavItem[] = [
  { href: "/admin", label: "Admin", icon: "admin" }
];

const desktopIcons = {
  home: Home,
  calendar: CalendarDays,
  ranking: BarChart3,
  history: History,
  admin: Shield
};

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
              const Icon = desktopIcons[item.icon];
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
        <MobileNav items={visibleNavItems} columns={showAdmin ? "grid-cols-5" : "grid-cols-4"} />
      </nav>
    </div>
  );
}
