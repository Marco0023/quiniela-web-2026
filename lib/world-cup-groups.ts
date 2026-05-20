export type WorldCupGroup = {
  code: string;
  name: string;
  teams: string[];
};

export const WORLD_CUP_GROUPS: WorldCupGroup[] = [
  { code: "A", name: "Grupo A", teams: ["México", "Sudáfrica", "República de Corea", "Chequia"] },
  { code: "B", name: "Grupo B", teams: ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"] },
  { code: "C", name: "Grupo C", teams: ["Brasil", "Marruecos", "Haití", "Escocia"] },
  { code: "D", name: "Grupo D", teams: ["Estados Unidos", "Paraguay", "Australia", "Turquía"] },
  { code: "E", name: "Grupo E", teams: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"] },
  { code: "F", name: "Grupo F", teams: ["Países Bajos", "Japón", "Suecia", "Túnez"] },
  { code: "G", name: "Grupo G", teams: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"] },
  { code: "H", name: "Grupo H", teams: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"] },
  { code: "I", name: "Grupo I", teams: ["Francia", "Senegal", "Irak", "Noruega"] },
  { code: "J", name: "Grupo J", teams: ["Argentina", "Argelia", "Austria", "Jordania"] },
  { code: "K", name: "Grupo K", teams: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"] },
  { code: "L", name: "Grupo L", teams: ["Inglaterra", "Croacia", "Ghana", "Panamá"] }
];

const TEAM_ALIASES: Record<string, string[]> = {
  "Arabia Saudita": ["Arabia Saudí", "Saudi Arabia"],
  "Bosnia y Herzegovina": ["Bosnia-Herzegovina", "Bosnia and Herzegovina", "Bosnia Herzegovina"],
  "Cabo Verde": ["Islas de Cabo Verde", "Cape Verde", "Cabo Verde Islands"],
  Catar: ["Qatar"],
  Chequia: ["República Checa", "Czechia", "Czech Republic"],
  "Costa de Marfil": ["Ivory Coast", "Cote d'Ivoire", "Côte d’Ivoire"],
  Curazao: ["Curaçao", "Curacao"],
  "Estados Unidos": ["EE. UU.", "United States", "USA"],
  Irán: ["RI de Irán", "Iran", "IR Iran"],
  "Países Bajos": ["Netherlands", "Holanda"],
  "RD Congo": ["DR Congo", "Congo DR", "Democratic Republic of Congo"],
  "República de Corea": ["Corea del Sur", "South Korea", "Korea Republic"],
  Sudáfrica: ["South Africa"]
};

export function namesForTeamLookup(name: string) {
  return [name, ...(TEAM_ALIASES[name] ?? [])];
}

export function normalizeLookupName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
