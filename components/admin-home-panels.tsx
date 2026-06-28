"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BadgeChip } from "@/components/badge-chip";
import { Badge, Card } from "@/components/ui";
import { formatKickoff } from "@/lib/format";
import { getBadgeById, type BadgeId } from "@/lib/badges";
import type { Group, Match, MatchResult, Prediction, Profile, Team } from "@/lib/types";

type RankingGroup = {
  group: Group;
  ranking: {
    user: Profile;
    points: number;
    rank: number;
    badgeIds: string[];
  }[];
};

export function AdminRankingCarousel({ groups }: { groups: RankingGroup[] }) {
  const [selectedIndex, setSelectedIndex] = useCarouselIndex(groups.length);
  const selected = groups[selectedIndex];

  return (
    <Card className="p-0">
      <PanelHeader
        count={groups.length}
        index={selectedIndex}
        subtitle="Ranking privado por grupo"
        title={selected?.group.name ?? "Ranking"}
        onNext={() => setSelectedIndex((selectedIndex + 1) % groups.length)}
        onPrevious={() => setSelectedIndex((selectedIndex - 1 + groups.length) % groups.length)}
      />
      <div className="divide-y divide-white/10">
        {selected?.ranking.map((row) => {
          const badges = row.badgeIds
            .map((badgeId) => getBadgeById(badgeId as BadgeId))
            .filter((badge) => Boolean(badge))
            .slice(0, 2);

          return (
            <div key={row.user.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3">
              <span className="text-lg font-black text-gold">#{row.rank}</span>
              <div className="min-w-0">
                <p className="truncate font-black text-white">{row.user.alias}</p>
                <p className="truncate text-xs text-white/45">
                  {row.user.firstName} {row.user.lastName}
                </p>
                {badges.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {badges.map((badge) => (
                      <BadgeChip key={badge!.title} badge={badge!} />
                    ))}
                  </div>
                ) : null}
              </div>
              <span className="rounded bg-white/10 px-3 py-1 text-sm font-black text-ink">{row.points} pts</span>
            </div>
          );
        })}
        {selected && selected.ranking.length === 0 ? (
          <p className="px-4 py-5 text-sm text-white/55">Todavía no hay participantes en este grupo.</p>
        ) : null}
      </div>
    </Card>
  );
}

export function AdminPredictionsCarousel({
  groups,
  matches,
  predictions,
  results,
  teams,
  timezone,
  users
}: {
  groups: Group[];
  matches: Match[];
  predictions: Prediction[];
  results: MatchResult[];
  teams: Team[];
  timezone: string;
  users: Profile[];
}) {
  const [selectedIndex, setSelectedIndex] = useCarouselIndex(groups.length);
  const selectedGroup = groups[selectedIndex];
  const selectedUsers = users.filter((user) => user.groupId === selectedGroup?.id);
  const selectedUserIds = new Set(selectedUsers.map((user) => user.id));
  const groupPredictions = predictions.filter((prediction) => selectedUserIds.has(prediction.userId));
  const todayMatches = matches.filter((match) => isSameLocalDay(match.kickoffAt, timezone));
  const matchesWithPredictions = matches.filter((match) => groupPredictions.some((prediction) => prediction.matchId === match.id));
  const visibleMatches = (todayMatches.length > 0 ? todayMatches : matchesWithPredictions.slice(-4)).filter((match) =>
    todayMatches.length > 0 ? true : groupPredictions.some((prediction) => prediction.matchId === match.id)
  );

  return (
    <Card className="p-0">
      <PanelHeader
        count={groups.length}
        index={selectedIndex}
        subtitle="Predicciones guardadas por grupo"
        title={selectedGroup?.name ?? "Predicciones"}
        onNext={() => setSelectedIndex((selectedIndex + 1) % groups.length)}
        onPrevious={() => setSelectedIndex((selectedIndex - 1 + groups.length) % groups.length)}
      />
      <div className="grid gap-3 p-4">
        {visibleMatches.length > 0 ? (
          visibleMatches.map((match) => {
            const matchPredictions = groupPredictions.filter((prediction) => prediction.matchId === match.id);
            const result = results.find((item) => item.matchId === match.id);
            return (
              <div key={`${selectedGroup?.id}-${match.id}`} className="rounded-lg border border-white/10 bg-pitch/35">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-3">
                  <MatchTitle match={match} teams={teams} />
                  <span className="text-xs font-bold text-white/45">{formatKickoff(match.kickoffAt, timezone)}</span>
                </div>
                {matchPredictions.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-white/55">No hay predicciones guardadas para este partido.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                        <tr>
                          <th className="px-3 py-2">Usuario</th>
                          <th className="px-3 py-2">Selección</th>
                          <th className="px-3 py-2">{match.phase === "group_stage" ? "Marcador" : "Marcador global"}</th>
                          <th className="px-3 py-2 text-right">Puntos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {matchPredictions.map((prediction) => {
                          const user = selectedUsers.find((item) => item.id === prediction.userId);
                          return (
                            <tr key={prediction.id}>
                              <td className="px-3 py-3">
                                <p className="font-black text-white">{user?.alias ?? "Usuario"}</p>
                                <p className="text-xs text-white/45">{user ? `${user.firstName} ${user.lastName}` : "Participante"}</p>
                              </td>
                              <td className="px-3 py-3 text-white/72">{formatSelection(prediction, match, teams)}</td>
                              <td className="px-3 py-3 font-bold text-white/72">{formatScore(prediction)}</td>
                              <td className="px-3 py-3 text-right font-black text-gold">
                                {result ? `${prediction.pointsAwarded} pts` : "---"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="rounded-md bg-white/[0.04] px-3 py-3 text-sm text-white/55">Todavía no hay predicciones para mostrar.</p>
        )}
      </div>
    </Card>
  );
}

function PanelHeader({
  count,
  index,
  subtitle,
  title,
  onNext,
  onPrevious
}: {
  count: number;
  index: number;
  subtitle: string;
  title: string;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{subtitle}</p>
        <h2 className="mt-1 text-xl font-black text-ink">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="grid size-9 place-items-center rounded-md border border-white/10 text-white/60 transition hover:border-gold/60 hover:text-gold disabled:opacity-40"
          disabled={count <= 1}
          type="button"
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
        </button>
        <Badge tone="gold">
          {count === 0 ? 0 : index + 1}/{count}
        </Badge>
        <button
          className="grid size-9 place-items-center rounded-md border border-white/10 text-white/60 transition hover:border-gold/60 hover:text-gold disabled:opacity-40"
          disabled={count <= 1}
          type="button"
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function MatchTitle({ match, teams }: { match: Match; teams: Team[] }) {
  const homeTeam = teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = teams.find((team) => team.id === match.awayTeamId);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 font-black text-white">
      <TeamLabel team={homeTeam} fallback={match.homePlaceholder ?? "Local"} />
      <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/55">vs</span>
      <TeamLabel team={awayTeam} fallback={match.awayPlaceholder ?? "Visitante"} />
    </div>
  );
}

function TeamLabel({ fallback, team }: { fallback: string; team?: Team }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {team?.flagUrl ? <Image src={team.flagUrl} alt="" width={24} height={16} className="h-4 w-6 rounded-sm object-cover" /> : null}
      <span className="truncate">{team?.name ?? fallback}</span>
    </span>
  );
}

function formatSelection(prediction: Prediction, match: Match, teams: Team[]) {
  if (prediction.predictionType === "group_stage") {
    if (prediction.predictedOutcome === "draw") return "Empate";
    if (prediction.predictedOutcome === "home") return teams.find((team) => team.id === match.homeTeamId)?.name ?? "Local";
    if (prediction.predictedOutcome === "away") return teams.find((team) => team.id === match.awayTeamId)?.name ?? "Visitante";
    return "Sin selección";
  }

  return teams.find((team) => team.id === prediction.predictedWinnerTeamId)?.name ?? "Por definir";
}

function formatScore(prediction: Prediction) {
  if (prediction.predictedHomeScore === null || prediction.predictedAwayScore === null) return "---";
  return `${prediction.predictedHomeScore}-${prediction.predictedAwayScore}`;
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

function useCarouselIndex(count: number) {
  const [index, setIndex] = useState(0);
  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;
  return [safeIndex, setIndex] as const;
}
