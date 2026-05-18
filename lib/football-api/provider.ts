import { matches, results, teams } from "@/lib/mock-data";
import type { Match, MatchResult, Team } from "@/lib/types";

export type FootballApiProvider = {
  name: string;
  syncTeams: () => Promise<Team[]>;
  syncMatches: () => Promise<Match[]>;
  syncResults: () => Promise<MatchResult[]>;
};

class MockFootballApiProvider implements FootballApiProvider {
  name = "mock";

  async syncTeams() {
    return teams;
  }

  async syncMatches() {
    return matches;
  }

  async syncResults() {
    return results;
  }
}

export function getFootballApiProvider(): FootballApiProvider {
  return new MockFootballApiProvider();
}
