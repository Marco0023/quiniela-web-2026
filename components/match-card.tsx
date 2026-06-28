import Image from "next/image";
import Link from "next/link";
import { Clock, LockKeyhole } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { formatKickoff, statusLabel } from "@/lib/format";
import { formatPredictionSummary } from "@/lib/predictions/format";
import { getScoringScore, isPredictionLocked } from "@/lib/scoring";
import type { Match, MatchResult, Prediction, Team } from "@/lib/types";

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
  const hasTeams = Boolean(match.homeTeamId && match.awayTeamId);
  const showScore = match.status === "finished" && result;
  const displayScore = result ? getScoringScore(match, result) : null;
  const scoreLabel = match.phase === "group_stage" ? "90 min" : "Global";
  const actionLabel = !hasTeams ? "Esperando" : locked && !prediction ? "Cerrado" : prediction ? "Ver" : "Predecir";
  const isPredictionSaved = Boolean(prediction);

  return (
    <Card
      className={`grid gap-4 ${
        isPredictionSaved ? "border-emeraldGlow/55 shadow-[0_0_0_1px_rgba(74,222,128,0.22),0_18px_70px_rgba(16,185,129,0.12)]" : ""
      }`}
    >
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
              <span>{displayScore?.homeScore ?? "-"}</span>
              <span className="text-sm text-white/35">-</span>
              <span>{displayScore?.awayScore ?? "-"}</span>
            </div>
            <span className="mt-1 text-[11px] font-bold text-white/45">{scoreLabel}</span>
          </div>
        ) : (
          <span className="rounded bg-white/10 px-2 py-1 text-xs font-black text-white/60">VS</span>
        )}
        <ScoreTeam team={awayTeam} fallback={match.awayPlaceholder} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        {isPredictionSaved ? (
          <div className="min-w-0 rounded-md border border-emeraldGlow/25 bg-emeraldGlow/12 px-3 py-2 text-sm">
            Tu predicción ya quedó guardada.
            <span className="mt-1 block font-semibold text-white/78">
              Tu predicción: {formatPredictionSummary(prediction!, match, teams)}
            </span>
          </div>
        ) : (
          <p className="min-w-0 text-sm text-white/62">
            {!hasTeams ? "Esperando equipos" : locked ? "Cerrado sin predicción" : "Pendiente por predecir"}
          </p>
        )}
        {hasTeams ? (
          <Link
            href={`/partidos/${match.id}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch transition hover:bg-white"
          >
            {locked ? <LockKeyhole className="size-4" /> : null}
            {actionLabel}
          </Link>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm font-black text-white/45">
            {actionLabel}
          </span>
        )}
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
