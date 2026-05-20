"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav({
  items,
  columns
}: {
  items: { href: string; label: string; icon: LucideIcon }[];
  columns: string;
}) {
  const pathname = usePathname();

  return (
    <div className={cn("grid gap-1", columns)}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-md border px-1 py-2 text-[11px] transition",
              active
                ? "border-[#f4c95d] bg-[#f4c95d]/10 text-[#f4c95d]"
                : "border-transparent text-white/70 hover:border-white/10 hover:text-white"
            )}
          >
            <Icon className={cn("size-5", active && "text-[#f4c95d]")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
