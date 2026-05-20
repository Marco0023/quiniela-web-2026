"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/repository";
import { createAdminClient } from "@/lib/supabase/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveGroupClassificationPrediction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile.groupId) redirect("/partidos?error=Grupo no encontrado");

  const tournamentGroup = text(formData, "tournamentGroup");
  const orderedTeamIds = text(formData, "orderedTeamIds")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!tournamentGroup || orderedTeamIds.length !== 4 || new Set(orderedTeamIds).size !== 4) {
    redirect("/partidos?error=Clasificación incompleta");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("group_classification_predictions").upsert(
    {
      user_id: profile.id,
      app_group_id: profile.groupId,
      tournament_group: tournamentGroup,
      ordered_team_ids: orderedTeamIds,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,tournament_group" }
  );

  if (error) redirect(`/partidos?error=${encodeURIComponent("No se pudo guardar la clasificación.")}`);

  revalidatePath("/partidos");
  redirect("/partidos?saved=clasificacion");
}
