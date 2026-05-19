export type FunBadge = {
  emoji: string;
  title: string;
  description: string;
  category?: "visible" | "hidden";
};

export const funBadges: FunBadge[] = [
  { emoji: "🔥", title: "Soy muy buenoo!!", description: "Acertaste 5 partidos consecutivos.", category: "hidden" },
  { emoji: "🏆", title: "El papá de los helados", description: "Acertó el ganador del Mundial.", category: "visible" },
  { emoji: "⚽", title: "El diablo sabe más por viejo", description: "Acertó el goleador del torneo.", category: "visible" },
  { emoji: "👑", title: "Rey de la Jornada", description: "Top 1 al cierre de la jornada.", category: "visible" },
  { emoji: "🎯", title: "Precisión Absoluta", description: "Acertó exactamente un marcador.", category: "hidden" },
  { emoji: "👀", title: "Ojo de loca no se equivoca", description: "Acertó 3 marcadores exactos consecutivos.", category: "hidden" },
  { emoji: "⁉️", title: "¿Qué es eso?", description: "No acierta nada después de 5 partidos.", category: "hidden" },
  { emoji: "🏹", title: "No es el indio, es la flecha", description: "Sigue de primer lugar después de 2 jornadas.", category: "hidden" },
  { emoji: "💎", title: "SIUUU!", description: "Acertó todos los partidos de una jornada.", category: "hidden" },
  { emoji: "😅", title: "Sobreviviente", description: "Salió del último lugar.", category: "hidden" },
  { emoji: "💅", title: "Bendecida y afortunada", description: "Acertó un resultado que nadie en el grupo tenía.", category: "hidden" },
  {
    emoji: "🐟",
    title: "Camarón que se duerme se lo lleva la corriente",
    description: "Olvidaste hacer tres predicciones.",
    category: "hidden"
  },
  {
    emoji: "😂",
    title: "Más perdido que Adán el Día de las Madres",
    description: "Fallaste todos los partidos de una jornada.",
    category: "hidden"
  },
  {
    emoji: "😎",
    title: "¿Viste? Yo te dije",
    description: "Acertó 2 resultados que nadie tenía en una misma jornada.",
    category: "hidden"
  },
  { emoji: "🧐", title: "Vamo' a esto mi gente.", description: "Primera predicción guardada.", category: "hidden" },
  { emoji: "🤪", title: "Toy ready.", description: "Primera predicción guardada.", category: "hidden" },
  { emoji: "🤓", title: "Mano tengo fe.", description: "Primera predicción guardada.", category: "hidden" },
  { emoji: "😎", title: "Suban en nivel a esto.", description: "Primer marcador exacto.", category: "hidden" },
  { emoji: "🥸", title: "Facilito", description: "Primer marcador exacto.", category: "hidden" },
  { emoji: "🤑", title: "Me quedé con el banco.", description: "Más puntos en un solo partido.", category: "hidden" },
  { emoji: "🥶", title: "Me llamaron loco.", description: "Acertar un empate exacto.", category: "hidden" },
  {
    emoji: "🥵",
    title: "¿Ya se comieron los tequeños?",
    description: "Volver al top 3 después de estar fuera.",
    category: "hidden"
  }
];

export const visibleBadgePreview = funBadges.filter((badge) => badge.category === "visible");

const firstPredictionBadges = ["Vamo' a esto mi gente.", "Toy ready.", "Mano tengo fe."];
const firstExactScoreBadges = ["Suban en nivel a esto.", "Facilito"];

function pickBadge(titles: string[], seed: string) {
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const title = titles[total % titles.length];
  return funBadges.find((badge) => badge.title === title);
}

export function badgesForRankingRow(rank: number, points: number): FunBadge[] {
  if (rank === 1 && points > 0) {
    return [funBadges.find((badge) => badge.title === "Rey de la Jornada")!];
  }

  return [];
}

export function recentBadgesForUser({
  userId,
  rank,
  points,
  predictionCount,
  bestMatchPoints
}: {
  userId: string;
  rank: number;
  points: number;
  predictionCount: number;
  bestMatchPoints: number;
}) {
  const badges: FunBadge[] = [];

  if (rank === 1 && points > 0) {
    badges.push(funBadges.find((badge) => badge.title === "Rey de la Jornada")!);
  }

  if (bestMatchPoints >= 5) {
    const exactBadge = pickBadge(firstExactScoreBadges, `${userId}-exact`);
    if (exactBadge) badges.push(exactBadge);
  }

  if (predictionCount > 0) {
    const firstBadge = pickBadge(firstPredictionBadges, userId);
    if (firstBadge) badges.push(firstBadge);
  }

  return badges.slice(0, 2);
}
