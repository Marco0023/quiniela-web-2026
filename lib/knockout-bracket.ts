import type { createAdminClient } from "@/lib/supabase/admin";

type Slot = "home" | "away";

type AdvancementRule = {
  sourceMatchNumber: number;
  targetMatchNumber: number;
  slot: Slot;
  team: "winner" | "loser";
};

const ADVANCEMENT_RULES: AdvancementRule[] = [
  { sourceMatchNumber: 74, targetMatchNumber: 89, slot: "home", team: "winner" },
  { sourceMatchNumber: 77, targetMatchNumber: 89, slot: "away", team: "winner" },
  { sourceMatchNumber: 73, targetMatchNumber: 90, slot: "home", team: "winner" },
  { sourceMatchNumber: 75, targetMatchNumber: 90, slot: "away", team: "winner" },
  { sourceMatchNumber: 76, targetMatchNumber: 91, slot: "home", team: "winner" },
  { sourceMatchNumber: 78, targetMatchNumber: 91, slot: "away", team: "winner" },
  { sourceMatchNumber: 79, targetMatchNumber: 92, slot: "home", team: "winner" },
  { sourceMatchNumber: 80, targetMatchNumber: 92, slot: "away", team: "winner" },
  { sourceMatchNumber: 83, targetMatchNumber: 93, slot: "home", team: "winner" },
  { sourceMatchNumber: 84, targetMatchNumber: 93, slot: "away", team: "winner" },
  { sourceMatchNumber: 81, targetMatchNumber: 94, slot: "home", team: "winner" },
  { sourceMatchNumber: 82, targetMatchNumber: 94, slot: "away", team: "winner" },
  { sourceMatchNumber: 86, targetMatchNumber: 95, slot: "home", team: "winner" },
  { sourceMatchNumber: 88, targetMatchNumber: 95, slot: "away", team: "winner" },
  { sourceMatchNumber: 85, targetMatchNumber: 96, slot: "home", team: "winner" },
  { sourceMatchNumber: 87, targetMatchNumber: 96, slot: "away", team: "winner" },
  { sourceMatchNumber: 89, targetMatchNumber: 97, slot: "home", team: "winner" },
  { sourceMatchNumber: 90, targetMatchNumber: 97, slot: "away", team: "winner" },
  { sourceMatchNumber: 93, targetMatchNumber: 98, slot: "home", team: "winner" },
  { sourceMatchNumber: 94, targetMatchNumber: 98, slot: "away", team: "winner" },
  { sourceMatchNumber: 91, targetMatchNumber: 99, slot: "home", team: "winner" },
  { sourceMatchNumber: 92, targetMatchNumber: 99, slot: "away", team: "winner" },
  { sourceMatchNumber: 95, targetMatchNumber: 100, slot: "home", team: "winner" },
  { sourceMatchNumber: 96, targetMatchNumber: 100, slot: "away", team: "winner" },
  { sourceMatchNumber: 97, targetMatchNumber: 101, slot: "home", team: "winner" },
  { sourceMatchNumber: 98, targetMatchNumber: 101, slot: "away", team: "winner" },
  { sourceMatchNumber: 99, targetMatchNumber: 102, slot: "home", team: "winner" },
  { sourceMatchNumber: 100, targetMatchNumber: 102, slot: "away", team: "winner" },
  { sourceMatchNumber: 101, targetMatchNumber: 104, slot: "home", team: "winner" },
  { sourceMatchNumber: 102, targetMatchNumber: 104, slot: "away", team: "winner" },
  { sourceMatchNumber: 101, targetMatchNumber: 103, slot: "home", team: "loser" },
  { sourceMatchNumber: 102, targetMatchNumber: 103, slot: "away", team: "loser" }
];

export async function propagateKnockoutResult({
  admin,
  awayTeamId,
  homeTeamId,
  matchNumber,
  winnerTeamId
}: {
  admin: ReturnType<typeof createAdminClient>;
  awayTeamId: string | null;
  homeTeamId: string | null;
  matchNumber: number;
  winnerTeamId: string | null;
}) {
  if (!winnerTeamId || !homeTeamId || !awayTeamId) return;

  const loserTeamId = winnerTeamId === homeTeamId ? awayTeamId : winnerTeamId === awayTeamId ? homeTeamId : null;
  const rules = ADVANCEMENT_RULES.filter((rule) => rule.sourceMatchNumber === matchNumber);
  if (!loserTeamId || rules.length === 0) return;

  for (const rule of rules) {
    const teamId = rule.team === "winner" ? winnerTeamId : loserTeamId;
    const payload =
      rule.slot === "home"
        ? { home_team_id: teamId, home_placeholder: null, updated_at: new Date().toISOString() }
        : { away_team_id: teamId, away_placeholder: null, updated_at: new Date().toISOString() };

    await admin.from("matches").update(payload).eq("match_number", rule.targetMatchNumber);
  }
}
