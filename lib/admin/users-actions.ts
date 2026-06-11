"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function usersRedirect(params: Record<string, string>): never {
  const query = new URLSearchParams(params);
  redirect(`/admin/usuarios?${query.toString()}`);
}

export async function resetUserPassword(formData: FormData) {
  await requireAdminProfile();

  const userId = text(formData, "userId");
  const password = text(formData, "password");

  if (!userId) {
    usersRedirect({ error: "Usuario no encontrado." });
  }

  if (password.length < 6) {
    usersRedirect({ error: "La nueva contraseña debe tener al menos 6 caracteres." });
  }

  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("alias,email")
    .eq("id", userId)
    .single<{ alias: string; email: string }>();

  if (profileError || !profile) {
    usersRedirect({ error: "Ese usuario no existe en la quiniela." });
  }

  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) {
    usersRedirect({ error: "No se pudo cambiar la contraseña. Inténtalo de nuevo." });
  }

  revalidatePath("/admin/usuarios");
  usersRedirect({ passwordUpdated: profile.alias || profile.email });
}
