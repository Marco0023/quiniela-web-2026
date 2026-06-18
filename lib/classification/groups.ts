import { namesForTeamLookup, normalizeLookupName, WORLD_CUP_GROUPS } from "@/lib/world-cup-groups";
import type { Team } from "@/lib/types";

export type ClassificationTeam = {
  id: string | null;
  name: string;
  flagUrl: string;
};

export type ClassificationGroup = {
  code: string;
  name: string;
  teams: ClassificationTeam[];
};

export function resolveClassificationGroups(teams: Team[]): ClassificationGroup[] {
  const teamMap = new Map(teams.flatMap((team) => [[normalizeLookupName(team.name), team], [normalizeLookupName(team.shortName), team]]));

  return WORLD_CUP_GROUPS.map((group) => ({
    ...group,
    teams: group.teams.map((name) => {
      const team = namesForTeamLookup(name)
        .map((candidate) => teamMap.get(normalizeLookupName(candidate)))
        .find(Boolean);

      return {
        id: team?.id ?? null,
        name,
        flagUrl: team?.flagUrl ?? ""
      };
    })
  }));
}
