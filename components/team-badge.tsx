import Image from "next/image";
import type { Team } from "@/lib/types";

export function TeamBadge({ team, fallback }: { team?: Team; fallback?: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {team?.flagUrl ? (
        <Image
          src={team.flagUrl}
          alt=""
          width={28}
          height={20}
          className="h-5 w-7 rounded-sm object-cover"
        />
      ) : (
        <span className="h-5 w-7 rounded-sm bg-white/10" />
      )}
      <span className="truncate font-semibold">{team?.name ?? fallback ?? "Por definir"}</span>
    </span>
  );
}
