import type { Group, Phase } from "@/lib/types";

export const GROUPS: Group[] = [
  {
    id: "grp_familia_marquez",
    slug: "familia-marquez",
    name: "Familia Marquez",
    inviteCode: "FM26"
  },
  {
    id: "grp_familia_nunez_quinones",
    slug: "familia-nunez-quinones",
    name: "Familia Nunez Quinones",
    inviteCode: "PANTALONES26"
  },
  {
    id: "grp_mondaquera_bochinche",
    slug: "mondaquera-bochinche",
    name: "Mondaquera Bochinche",
    inviteCode: "MANCOS26"
  }
];

export const ADMIN_EMAIL = "mriera371@gmail.com";

export const TIMEZONE_OPTIONS = [
  { country: "Argentina", timezone: "America/Argentina/Buenos_Aires" },
  { country: "Chile", timezone: "America/Santiago" },
  { country: "Colombia", timezone: "America/Bogota" },
  { country: "Estados Unidos", timezone: "America/New_York" },
  { country: "Mexico", timezone: "America/Mexico_City" },
  { country: "Venezuela", timezone: "America/Caracas" }
];

export const PHASE_LABELS: Record<Phase, string> = {
  group_stage: "Fase de grupos",
  round_of_32: "Dieciseisavos",
  round_of_16: "Octavos",
  quarter_finals: "Cuartos",
  semi_finals: "Semifinales",
  third_place: "Tercer puesto",
  final: "Final"
};

export const PHASE_ORDER: Phase[] = [
  "group_stage",
  "round_of_32",
  "round_of_16",
  "quarter_finals",
  "semi_finals",
  "third_place",
  "final"
];
