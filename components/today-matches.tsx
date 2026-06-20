import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { formatKickoff, statusLabel } from "@/lib/format";
import { formatPredictionScore, formatPredictionSelection, formatPredictionSummary } from "@/lib/predictions/format";
import { isPredictionLocked } from "@/lib/scoring";
import type { Match, MatchResult, Prediction, Profile, Team } from "@/lib/types";

export function TodayMatches({
  matches,
  predictions,
  users,
  teams,
  results,
  currentUserId,
  timezone
}: {
  matches: Match[];
  predictions: Prediction[];
  users: Profile[];
  teams: Team[];
  results: MatchResult[];
  currentUserId: string;
  timezone: string;
}) {
  const todayMatches = matches.filter((match) => isSameLocalDay(match.kickoffAt, timezone));

  return (
    <section>
      <div className="flex items-end justify-between gap-3">
        <SectionHeader eyebrow="Acceso rápido" title="Jornada de hoy" />
        <Link href="/historial" className="mb-3 inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-white">
          Ver historial
          <ExternalLink className="size-4" />
        </Link>
      </div>

      {todayMatches.length === 0 ? (
        <Card>
          <p className="font-bold text-white">No hay partidos programados para hoy.</p>
          <p className="mt-1 text-sm text-white/55">Cuando haya jornada, aquí verás los partidos y las predicciones del grupo.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {todayMatches.map((match) => {
            const matchPredictions = predictions.filter((prediction) => prediction.matchId === match.id);
            const result = results.find((item) => item.matchId === match.id);
            const locked = isPredictionLocked(match.kickoffAt);

            return (
              <TodayMatchCard
                key={match.id}
                match={match}
                predictions={matchPredictions}
                users={users}
                teams={teams}
                result={result}
                locked={locked}
                currentUserId={currentUserId}
                timezone={timezone}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

function TodayMatchCard({
  match,
  predictions,
  users,
  teams,
  result,
  locked,
  currentUserId,
  timezone
}: {
  match: Match;
  predictions: Prediction[];
  users: Profile[];
  teams: Team[];
  result?: MatchResult;
  locked: boolean;
  currentUserId: string;
  timezone: string;
}) {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);
  const finished = match.status === "finished";
  const userPrediction = predictions.find((prediction) => prediction.userId === currentUserId);

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <Badge tone={finished ? "green" : locked ? "gold" : "neutral"}>{finished ? "Finalizado" : locked ? "Cerrado" : statusLabel(match.status)}</Badge>
        <span className="inline-flex items-center gap-1 text-xs text-white/55">
          <Clock className="size-3.5" />
          {formatKickoff(match.kickoffAt, timezone)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5">
        <ResultTeam team={homeTeam} fallback={match.homePlaceholder} align="right" />
        {finished && result ? (
          <div className="grid min-w-28 place-items-center">
            <div className="flex items-center gap-3 text-4xl font-black text-white">
              <span>{result.homeScore90 ?? "-"}</span>
              <span className="text-lg text-white/45">-</span>
              <span>{result.awayScore90 ?? "-"}</span>
            </div>
            <p className="mt-1 text-xs font-bold text-white/55">Resultado 90 min</p>
          </div>
        ) : (
          <span className="justify-self-center rounded bg-white/10 px-2 py-1 text-xs font-black text-white/60">VS</span>
        )}
        <ResultTeam team={awayTeam} fallback={match.awayPlaceholder} />
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-black text-white">Predicciones del grupo</p>
          <span className="text-xs text-white/45">{predictions.length} guardadas</span>
        </div>

        {!locked ? (
          userPrediction ? (
            <div className="rounded-md border border-emeraldGlow/25 bg-emeraldGlow/12 px-3 py-3 text-sm">
              <p className="font-bold text-emeraldGlow">Tu predicción está guardada.</p>
              <p className="mt-1 font-semibold text-white/78">Tu predicción: {formatPredictionSummary(userPrediction, match, teams)}</p>
            </div>
          ) : (
            <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/62">
              Se revelan 5 minutos antes del inicio del partido.
            </p>
          )
        ) : predictions.length === 0 ? (
          <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/62">Nadie guardó predicción para este partido.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                <tr>
                  <th className="py-2 pr-3">Usuario</th>
                  <th className="px-3 py-2">Selección</th>
                  <th className="px-3 py-2">Marcador</th>
                  <th className="py-2 pl-3 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {predictions.map((prediction) => {
                  const user = users.find((item) => item.id === prediction.userId);
                  const isCurrentUser = prediction.userId === currentUserId;
                  return (
                    <tr
                      key={prediction.id}
                      className={isCurrentUser ? "rounded-md bg-emeraldGlow/10 shadow-[inset_3px_0_0_rgba(74,222,128,0.8)]" : ""}
                    >
                      <td className="py-3 pr-3">
                        <p className="font-bold text-white">{user?.alias ?? "Usuario"}</p>
                        <p className="text-xs text-white/45">
                          {user ? `${user.firstName} ${user.lastName}` : "Participante"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-white/72">{formatPredictionSelection(prediction, match, teams)}</td>
                      <td className="px-3 py-3 font-bold text-white/72">{formatPredictionScore(prediction, "---")}</td>
                      <td className="py-3 pl-3 text-right font-black text-gold">{prediction.pointsAwarded} pts</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}

function ResultTeam({ team, fallback, align = "left" }: { team?: Team; fallback?: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "min-w-0 text-right" : "min-w-0"}>
      {team?.flagUrl ? (
        <Image
          src={team.flagUrl}
          alt=""
          width={48}
          height={34}
          className={align === "right" ? "ml-auto h-8 w-12 rounded-sm object-cover" : "h-8 w-12 rounded-sm object-cover"}
        />
      ) : (
        <span className={align === "right" ? "ml-auto block h-8 w-12 rounded-sm bg-white/10" : "block h-8 w-12 rounded-sm bg-white/10"} />
      )}
      <p className="mt-2 truncate text-sm font-black text-white md:text-base">{team?.name ?? fallback ?? "Por definir"}</p>
    </div>
  );
}

function isSameLocalDay(date: string, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date(date)) === formatter.format(new Date());
}
