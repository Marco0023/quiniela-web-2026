import type { Match, MatchResult } from "@/lib/types";

type StandingRow = {
  teamId: string;
  points: number;
  goalDifference: number;
  goalsFor: number;
};

export function tournamentGroupLabel(groupCode: string) {
  return `Grupo ${groupCode}`;
}

export function groupCodeFromLabel(value?: string | null) {
  return (value ?? "").replace(/^Grupo\s+/i, "").trim().toUpperCase();
}

export function classificationCloseAt(groupCode: string, matches: Match[]) {
  const groupMatches = matches
    .filter((match) => match.phase === "group_stage" && groupCodeFromLabel(match.tournamentGroup) === groupCode)
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
  const appearances = new Map<string, number>();

  for (const match of groupMatches) {
    for (const teamId of [match.homeTeamId, match.awayTeamId]) {
      if (!teamId) continue;
      const count = (appearances.get(teamId) ?? 0) + 1;
      appearances.set(teamId, count);
      if (count === 2) {
        return new Date(new Date(match.kickoffAt).getTime() - 60 * 60 * 1000).toISOString();
      }
    }
  }

  return null;
}

export function isClassificationLocked(groupCode: string, matches: Match[], now = new Date()) {
  const closeAt = classificationCloseAt(groupCode, matches);
  return Boolean(closeAt && now.getTime() >= new Date(closeAt).getTime());
}

export function scoreClassificationPrediction({
  groupCode,
  matches,
  orderedTeamIds,
  results
}: {
  groupCode: string;
  matches: Match[];
  orderedTeamIds: string[];
  results: MatchResult[];
}) {
  const finalOrder = calculateFinalGroupOrder(groupCode, matches, results);
  if (!finalOrder || orderedTeamIds.length < 4) return null;

  const predictedTopTwo = new Set(orderedTeamIds.slice(0, 2));
  const actualTopTwo = new Set(finalOrder.slice(0, 2));
  const exactAll = finalOrder.every((teamId, index) => orderedTeamIds[index] === teamId);
  const topTwoCorrect = [...actualTopTwo].every((teamId) => predictedTopTwo.has(teamId));

  if (exactAll) return 12;
  if (topTwoCorrect) return 5;
  return 0;
}

export function calculateFinalGroupOrder(groupCode: string, matches: Match[], results: MatchResult[]) {
  const groupMatches = matches.filter((match) => match.phase === "group_stage" && groupCodeFromLabel(match.tournamentGroup) === groupCode);
  if (groupMatches.length === 0) return null;

  const resultsByMatch = new Map(results.map((result) => [result.matchId, result]));
  const standings = new Map<string, StandingRow>();

  for (const match of groupMatches) {
    if (!match.homeTeamId || !match.awayTeamId) return null;
    const result = resultsByMatch.get(match.id);
    if (!result || result.homeScore90 === null || result.awayScore90 === null) return null;

    const home = ensureStanding(standings, match.homeTeamId);
    const away = ensureStanding(standings, match.awayTeamId);

    home.goalsFor += result.homeScore90;
    away.goalsFor += result.awayScore90;
    home.goalDifference += result.homeScore90 - result.awayScore90;
    away.goalDifference += result.awayScore90 - result.homeScore90;

    if (result.homeScore90 > result.awayScore90) home.points += 3;
    else if (result.awayScore90 > result.homeScore90) away.points += 3;
    else {
      home.points += 1;
      away.points += 1;
    }
  }

  if (standings.size !== 4) return null;

  return [...standings.values()]
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.teamId.localeCompare(b.teamId))
    .map((row) => row.teamId);
}

function ensureStanding(standings: Map<string, StandingRow>, teamId: string) {
  const existing = standings.get(teamId);
  if (existing) return existing;
  const row = { teamId, points: 0, goalDifference: 0, goalsFor: 0 };
  standings.set(teamId, row);
  return row;
}
