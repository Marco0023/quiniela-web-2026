"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/admin/auth";
import { getFootballApiProvider } from "@/lib/football-api/provider";
import { runFootballSync } from "@/lib/football-api/sync-service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncFootballData() {
  await requireAdminProfile();

  const provider = getFootballApiProvider();
  const admin = createAdminClient();
  let redirectTo = "/admin/resultados?synced=1";

  try {
    const teamsMetadata = await runFootballSync(provider, "teams");
    const matchesMetadata = await runFootballSync(provider, "matches");
    const metadata = {
      ...matchesMetadata,
      teams: teamsMetadata.teams,
      teamsUpserted: teamsMetadata.teamsUpserted + matchesMetadata.teamsUpserted
    };

    await admin.from("sync_logs").insert({
      provider: provider.name,
      sync_type: "full",
      status: "success",
      message: "Equipos y partidos sincronizados correctamente desde el panel admin.",
      metadata
    });

    revalidatePath("/admin/resultados");
    revalidatePath("/dashboard");
    revalidatePath("/partidos");
    revalidatePath("/ranking");
    revalidatePath("/historial");
    revalidatePath("/inicio-admin");
  } catch (error) {
    await admin.from("sync_logs").insert({
      provider: provider.name,
      sync_type: "full",
      status: "error",
      message: error instanceof Error ? error.message : "Error desconocido",
      metadata: {}
    });

    const message = error instanceof Error ? error.message : "No se pudo sincronizar con API-FOOTBALL.";
    redirectTo = `/admin/resultados?error=${encodeURIComponent(message)}`;
  }

  redirect(redirectTo);
}
