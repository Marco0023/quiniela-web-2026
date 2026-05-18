import Link from "next/link";
import { Clock, LockKeyhole } from "lucide-react";
import { formatKickoff, statusLabel } from "@/lib/format";
import { isPredictionLocked } from "@/lib/scoring";
import type { Match, Prediction, Team } from "@/lib/types";
import { Badge, Card } from "@/components/ui";
import { TeamBadge } from "@/components/team-badge";

export function MatchCard({
  match,
  teams,
  prediction,
  timezone
}: {
  match: Match;
  teams: Team[];
  prediction?: Prediction;
  timezone: string;
}) {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  const locked = isPredictionLocked(match.kickoffAt);

  return (
    <Card className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Badge tone={match.status === "finished" ? "green" : locked ? "gold" : "neutral"}>
          {locked ? "Cerrado" : statusLabel(match.status)}
        </Badge>
        <span className="inline-flex items-center gap-1 text-xs text-white/55">
          <Clock className="size-3.5" />
          {formatKickoff(match.kickoffAt, timezone)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="min-w-0 text-right">
          <TeamBadge team={homeTeam} fallback={match.homePlaceholder} />
        </div>
        <span className="rounded bg-white/10 px-2 py-1 text-xs font-black text-white/60">VS</span>
        <div className="min-w-0">
          <TeamBadge team={awayTeam} fallback={match.awayPlaceholder} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <p className="text-sm text-white/62">
          {prediction ? "Predicción guardada" : "Pendiente por predecir"}
        </p>
        <Link
          href={`/partidos/${match.id}`}
          className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch transition hover:bg-white"
        >
          {locked ? <LockKeyhole className="size-4" /> : null}
          {prediction ? "Ver" : "Predecir"}
        </Link>
      </div>
    </Card>
  );
}
