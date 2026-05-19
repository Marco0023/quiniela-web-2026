import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...value] = line.split("=");
      return [key.trim(), value.join("=").trim()];
    })
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
}

const teams = [
  ["00000000-0000-0000-0000-000000000010", "mock_ger", "Alemania", "GER", "https://flagcdn.com/w80/de.png"],
  ["00000000-0000-0000-0000-000000000001", "mock_arg", "Argentina", "ARG", "https://flagcdn.com/w80/ar.png"],
  ["00000000-0000-0000-0000-000000000014", "mock_aut", "Austria", "AUT", "https://flagcdn.com/w80/at.png"],
  ["00000000-0000-0000-0000-000000000012", "mock_bel", "Bélgica", "BEL", "https://flagcdn.com/w80/be.png"],
  ["00000000-0000-0000-0000-000000000002", "mock_bra", "Brasil", "BRA", "https://flagcdn.com/w80/br.png"],
  ["00000000-0000-0000-0000-000000000003", "mock_col", "Colombia", "COL", "https://flagcdn.com/w80/co.png"],
  ["00000000-0000-0000-0000-000000000013", "mock_cro", "Croacia", "CRO", "https://flagcdn.com/w80/hr.png"],
  ["00000000-0000-0000-0000-000000000019", "mock_egy", "Egipto", "EGY", "https://flagcdn.com/w80/eg.png"],
  ["00000000-0000-0000-0000-000000000006", "mock_esp", "España", "ESP", "https://flagcdn.com/w80/es.png"],
  ["00000000-0000-0000-0000-000000000005", "mock_usa", "Estados Unidos", "USA", "https://flagcdn.com/w80/us.png"],
  ["00000000-0000-0000-0000-000000000007", "mock_fra", "Francia", "FRA", "https://flagcdn.com/w80/fr.png"],
  ["00000000-0000-0000-0000-000000000008", "mock_eng", "Inglaterra", "ENG", "https://flagcdn.com/w80/gb-eng.png"],
  ["00000000-0000-0000-0000-000000000018", "mock_jpn", "Japón", "JPN", "https://flagcdn.com/w80/jp.png"],
  ["00000000-0000-0000-0000-000000000016", "mock_mar", "Marruecos", "MAR", "https://flagcdn.com/w80/ma.png"],
  ["00000000-0000-0000-0000-000000000004", "mock_mex", "México", "MEX", "https://flagcdn.com/w80/mx.png"],
  ["00000000-0000-0000-0000-000000000020", "mock_nor", "Noruega", "NOR", "https://flagcdn.com/w80/no.png"],
  ["00000000-0000-0000-0000-000000000011", "mock_ned", "Países Bajos", "NED", "https://flagcdn.com/w80/nl.png"],
  ["00000000-0000-0000-0000-000000000009", "mock_por", "Portugal", "POR", "https://flagcdn.com/w80/pt.png"],
  ["00000000-0000-0000-0000-000000000017", "mock_sen", "Senegal", "SEN", "https://flagcdn.com/w80/sn.png"],
  ["00000000-0000-0000-0000-000000000015", "mock_tur", "Turquía", "TUR", "https://flagcdn.com/w80/tr.png"]
].map(([id, api_id, name, short_name, flag_url]) => ({ id, api_id, name, short_name, flag_url }));

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const { error } = await supabase.from("teams").upsert(teams, { onConflict: "id" });

if (error) {
  throw error;
}

console.log(`Upserted ${teams.length} champion teams.`);
