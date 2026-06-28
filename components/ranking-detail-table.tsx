import Image from "next/image";
import { Card } from "@/components/ui";
import { getScoringScore } from "@/lib/scoring";
import type { ChampionPrediction, GroupClassificationPrediction, Match, MatchResult, Prediction, Profile, Team } from "@/lib/types";

type RankingRow = {
  user: Profile;
  points: number;
  rank: number;
};

export function RankingDetailTable({
  ranking,
  matches,
  results,
  predictions,
  champions,
  classificationPredictions,
  teams,
  currentUserId
}: {
  ranking: RankingRow[];
  matches: Match[];
  results: MatchResult[];
  predictions: Prediction[];
  champions: ChampionPrediction[];
  classificationPredictions: GroupClassificationPrediction[];
  teams: Team[];
  currentUserId?: string;
}) {
  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-white/45">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Alias</th>
              <th className="px-4 py-3">Equipo</th>
              <th className="px-4 py-3 text-center">Partidos acertados</th>
              <th className="px-4 py-3 text-center">Resultados acertados</th>
              <th className="px-4 py-3 text-center">Clasificación grupos</th>
              <th className="px-4 py-3 text-right">Total puntos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {ranking.map((row) => {
              const stats = getUserStats(row.user.id, matches, results, predictions);
              const champion = champions.find((item) => item.userId === row.user.id);
              const championTeam = teams.find((team) => team.id === champion?.teamId);
              const classificationPoints = classificationPredictions
                .filter((prediction) => prediction.userId === row.user.id)
                .reduce((total, prediction) => total + prediction.pointsAwarded, 0);

              return (
                <tr key={row.user.id} className={row.user.id === currentUserId ? "bg-gold/5" : undefined}>
                  <td className="px-4 py-4 text-lg font-black text-gold">#{row.rank}</td>
                  <td className="px-4 py-4">
                    <p className="font-black text-white">{row.user.alias}</p>
                    <p className="text-xs text-white/45">
                      {row.user.id === currentUserId ? "Tu posición" : `${row.user.firstName} ${row.user.lastName}`}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {championTeam ? (
                      <div className="flex items-center gap-2">
                        {championTeam.flagUrl ? (
                          <Image
                            src={championTeam.flagUrl}
                            alt=""
                            width={28}
                            height={20}
                            className="h-5 w-7 rounded-sm object-cover"
                          />
                        ) : null}
                        <span className="font-bold text-white/78">{championTeam.name}</span>
                      </div>
                    ) : (
                      <span className="text-white/40">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center font-black text-white">{stats.correctMatches}</td>
                  <td className="px-4 py-4 text-center font-black text-white">{stats.exactScores}</td>
                  <td className="px-4 py-4 text-center font-black text-gold">{classificationPoints} pts</td>
                  <td className="px-4 py-4 text-right">
                    <span className="rounded bg-white/10 px-3 py-1 text-sm font-black text-ink">{row.points} pts</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function getUserStats(userId: string, matches: Match[], results: MatchResult[], predictions: Prediction[]) {
  const userPredictions = predictions.filter((prediction) => prediction.userId === userId);

  return userPredictions.reduce(
    (stats, prediction) => {
      const match = matches.find((item) => item.id === prediction.matchId);
      const result = results.find((item) => item.matchId === prediction.matchId);
      if (!match || !result) return stats;

      if (isCorrectMatch(match, result, prediction)) {
        stats.correctMatches += 1;
      }

      if (isExactScore(match, result, prediction)) {
        stats.exactScores += 1;
      }

      return stats;
    },
    { correctMatches: 0, exactScores: 0 }
  );
}

function isCorrectMatch(match: Match, result: MatchResult, prediction: Prediction) {
  if (match.phase === "group_stage") {
    const { homeScore, awayScore } = getScoringScore(match, result);
    return prediction.predictedOutcome === getActualOutcome(homeScore, awayScore);
  }

  return Boolean(prediction.predictedWinnerTeamId && prediction.predictedWinnerTeamId === result.winnerTeamId);
}

function isExactScore(match: Match, result: MatchResult, prediction: Prediction) {
  const { homeScore, awayScore } = getScoringScore(match, result);
  return (
    prediction.predictedHomeScore !== null &&
    prediction.predictedAwayScore !== null &&
    prediction.predictedHomeScore === homeScore &&
    prediction.predictedAwayScore === awayScore
  );
}

function getActualOutcome(homeScore: number | null, awayScore: number | null) {
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}
