export type FunBadge = {
  emoji: string;
  title: string;
  description: string;
};

export const funBadges: FunBadge[] = [
  { emoji: "🔥", title: "Soy muy buenoo!!", description: "Acertaste 5 partidos consecutivos." },
  { emoji: "🏆", title: "El papá de los helados", description: "Acertó el ganador del Mundial." },
  { emoji: "⚽", title: "El diablo sabe más por viejo", description: "Acertó el goleador del torneo." },
  { emoji: "👑", title: "Rey de la Jornada", description: "Top 1 al cierre de la jornada." },
  { emoji: "🎯", title: "Precisión Absoluta", description: "Acertó exactamente un marcador." },
  { emoji: "👀", title: "Ojo de loca no se equivoca", description: "Acertó 3 marcadores exactos consecutivos." },
  { emoji: "⁉️", title: "¿Qué es eso?", description: "No acierta nada después de 5 partidos." },
  { emoji: "🏹", title: "No es el indio, es la flecha", description: "Sigue de primer lugar después de 2 jornadas." },
  { emoji: "💎", title: "SIUUU!", description: "Acertó todos los partidos de una jornada." },
  { emoji: "😅", title: "Sobreviviente", description: "Salió del último lugar." },
  { emoji: "💅", title: "Bendecida y afortunada", description: "Acertó un resultado que nadie en el grupo tenía." },
  { emoji: "🐟", title: "Camarón que se duerme se lo lleva la corriente", description: "Olvidaste hacer tres predicciones." },
  { emoji: "😂", title: "Más perdido que Adán el Día de las Madres", description: "Fallaste todos los partidos de una jornada." },
  { emoji: "😎", title: "¿Viste? Yo te dije", description: "Acertó 2 resultados que nadie tenía en una misma jornada." }
];

export function badgesForRankingRow(rank: number, points: number): FunBadge[] {
  if (rank === 1 && points > 0) {
    return [funBadges.find((badge) => badge.title === "Rey de la Jornada")!];
  }

  return [];
}
