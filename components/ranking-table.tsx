import type { Profile } from "@/lib/types";
import { Card } from "@/components/ui";
import { badgesForRankingRow, funBadges } from "@/lib/badges";

export function RankingTable({
  ranking,
  currentUserId
}: {
  ranking: { user: Profile; points: number; rank: number }[];
  currentUserId?: string;
}) {
  return (
    <Card className="p-0">
      <div className="divide-y divide-white/10">
        {ranking.map((row) => {
          const badges = badgesForRankingRow(row.rank, row.points);

          return (
            <div key={row.user.id} className="grid grid-cols-[3rem_1fr_auto] items-start gap-3 px-4 py-3">
              <span className="text-lg font-black text-gold">#{row.rank}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{row.user.alias}</p>
                <p className="text-xs text-white/45">
                  {row.user.id === currentUserId ? "Tu posición" : `${row.user.firstName} ${row.user.lastName}`}
                </p>
                {badges.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {badges.map((badge) => (
                      <span
                        key={badge.title}
                        className="rounded bg-gold/15 px-2 py-1 text-[11px] font-bold text-gold"
                        title={badge.description}
                      >
                        {badge.emoji} {badge.title}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <span className="rounded bg-white/10 px-3 py-1 text-sm font-black text-ink">{row.points} pts</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-white/10 px-4 py-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gold">Insignias por desbloquear</p>
        <div className="flex flex-wrap gap-2">
          {funBadges.map((badge) => (
            <span
              key={badge.title}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white/72"
              title={badge.description}
            >
              {badge.emoji} {badge.title}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
