import type { Profile } from "@/lib/types";
import { Card } from "@/components/ui";

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
        {ranking.map((row) => (
          <div
            key={row.user.id}
            className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3"
          >
            <span className="text-lg font-black text-gold">#{row.rank}</span>
            <div className="min-w-0">
              <p className="truncate font-bold text-white">{row.user.alias}</p>
              <p className="text-xs text-white/45">
                {row.user.id === currentUserId ? "Tu posicion" : `${row.user.firstName} ${row.user.lastName}`}
              </p>
            </div>
            <span className="rounded bg-white/10 px-3 py-1 text-sm font-black text-ink">{row.points} pts</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
