import Image from "next/image";
import Link from "next/link";
import { Clock, LockKeyhole } from "lucide-react";
import { formatKickoff, statusLabel } from "@/lib/format";
import { isPredictionLocked } from "@/lib/scoring";
import type { Match, MatchResult, Prediction, Team } from "@/lib/types";
import { Badge, Card } from "@/components/ui";

export function MatchCard({
  match,
  teams,
  result,
  prediction,
  timezone
}: {
  match: Match;
  teams: Team[];
  result?: MatchResult;
  prediction?: Prediction;
  timezone: string;
}) {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  const locked = isPredictionLocked(match.kickoffAt);
  const showScore = match.status === "finished" && result;
  const actionLabel = locked && !prediction ? "Cerrado" : prediction ? "Ver" : "Predecir";

  return (
    <Card className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={match.status === "finished" ? "green" : locked ? "gold" : "neutral"}>
          {match.status === "finished" ? "Finalizado" : locked ? "Cerrado" : statusLabel(match.status)}
        </Badge>
        <span className="inline-flex items-center gap-1 text-xs text-white/55">
          <Clock className="size-3.5" />
          {formatKickoff(match.kickoffAt, timezone)}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <ScoreTeam team={homeTeam} fallback={match.homePlaceholder} align="right" />
        {showScore ? (
          <div className="grid place-items-center">
            <div className="flex min-w-20 items-center justify-center gap-2 rounded-md bg-pitch/60 px-2 py-2 text-xl font-black text-white sm:min-w-24 sm:px-3 sm:text-2xl">
              <span>{result.homeScore90 ?? "-"}</span>
              <span className="text-sm text-white/35">-</span>
              <span>{result.awayScore90 ?? "-"}</span>
            </div>
            <span className="mt-1 text-[11px] font-bold text-white/45">90 min</span>
          </div>
        ) : (
          <span className="rounded bg-white/10 px-2 py-1 text-xs font-black text-white/60">VS</span>
        )}
        <ScoreTeam team={awayTeam} fallback={match.awayPlaceholder} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="min-w-0 text-sm text-white/62">
          {prediction ? "Predicción guardada" : locked ? "Cerrado sin predicción" : "Pendiente por predecir"}
        </p>
        <Link
          href={`/partidos/${match.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch transition hover:bg-white"
        >
          {locked ? <LockKeyhole className="size-4" /> : null}
          {actionLabel}
        </Link>
      </div>
    </Card>
  );
}

function ScoreTeam({ team, fallback, align = "left" }: { team?: Team; fallback?: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "min-w-0 text-right" : "min-w-0"}>
      <div className={align === "right" ? "flex justify-end" : "flex justify-start"}>
        {team?.flagUrl ? (
          <Image src={team.flagUrl} alt="" width={32} height={22} className="h-5 w-8 rounded-sm object-cover" />
        ) : (
          <span className="h-5 w-8 rounded-sm bg-white/10" />
        )}
      </div>
      <p className="mt-1 truncate text-xs font-black text-white sm:text-sm">{team?.name ?? fallback ?? "Por definir"}</p>
    </div>
  );
}
