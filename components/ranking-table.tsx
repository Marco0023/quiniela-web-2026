import type { Profile } from "@/lib/types";
import { BadgeChip } from "@/components/badge-chip";
import { Card } from "@/components/ui";
import { visibleBadgePreview, type FunBadge } from "@/lib/badges";

export function RankingTable({
  ranking,
  currentUserId,
  badgesByUser = {}
}: {
  ranking: { user: Profile; points: number; rank: number }[];
  currentUserId?: string;
  badgesByUser?: Record<string, FunBadge[]>;
}) {
  return (
    <Card className="p-0">
      <div className="divide-y divide-white/10">
        {ranking.map((row) => {
          const badges = badgesByUser[row.user.id] ?? [];
          const visibleBadges = badges.slice(0, 2);
          const extraBadges = Math.max(0, badges.length - visibleBadges.length);

          return (
            <div key={row.user.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-2 px-3 py-3 sm:grid-cols-[3rem_1fr_auto] sm:gap-3 sm:px-4">
              <span className="text-lg font-black text-gold">#{row.rank}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{row.user.alias}</p>
                <p className="text-xs text-white/45">
                  {row.user.id === currentUserId ? "Tu posición" : `${row.user.firstName} ${row.user.lastName}`}
                </p>
                {visibleBadges.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {visibleBadges.map((badge) => (
                      <BadgeChip key={badge.title} badge={badge} />
                    ))}
                    {extraBadges > 0 ? (
                      <span className="rounded-md border border-gold/20 bg-gold/10 px-2.5 py-1.5 text-xs font-bold text-gold">
                        +{extraBadges} más
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <span className="rounded bg-white/10 px-2 py-1 text-xs font-black text-ink sm:px-3 sm:text-sm">
                {row.points} pts
              </span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10 px-4 py-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gold">Insignias por desbloquear</p>
        <div className="flex flex-wrap gap-2">
          {visibleBadgePreview.map((badge) => (
            <BadgeChip key={badge.title} badge={badge} />
          ))}
          <span className="rounded-md border border-gold/20 bg-gold/10 px-2.5 py-1.5 text-xs font-bold text-gold">
            ✨ y muchos más...
          </span>
        </div>
      </div>
    </Card>
  );
}
