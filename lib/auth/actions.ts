"use server";

import { redirect } from "next/navigation";
import { ADMIN_EMAIL, TIMEZONE_OPTIONS } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function required(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const email = required(formData.get("email")).toLowerCase();
  const password = required(formData.get("password"));

  if (!email || !password) {
    redirectWithError("/login", "Ingresa correo y contraseña.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirectWithError("/login", "Correo o contraseña incorrectos.");
  }

  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const firstName = required(formData.get("firstName"));
  const lastName = required(formData.get("lastName"));
  const alias = required(formData.get("alias"));
  const email = required(formData.get("email")).toLowerCase();
  const password = required(formData.get("password"));
  const inviteCode = required(formData.get("inviteCode")).toUpperCase();
  const timezoneCountry = required(formData.get("timezoneCountry"));
  const timezone = TIMEZONE_OPTIONS.find((option) => option.country === timezoneCountry)?.timezone;

  if (!firstName || !lastName || !alias || !email || !password || !inviteCode || !timezoneCountry || !timezone) {
    redirectWithError("/registro", "Completa todos los campos.");
  }

  if (password.length < 6) {
    redirectWithError("/registro", "La contraseña debe tener al menos 6 caracteres.");
  }

  const admin = createAdminClient();
  const { data: group, error: groupError } = await admin
    .from("groups")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (groupError || !group) {
    redirectWithError("/registro", "Código secreto inválido.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        alias
      }
    }
  });

  if (error || !data.user) {
    redirectWithError("/registro", error?.message ?? "No se pudo crear la cuenta.");
  }

  const role = email === ADMIN_EMAIL ? "admin" : "participant";
  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    first_name: firstName,
    last_name: lastName,
    alias,
    email,
    role,
    group_id: role === "admin" ? null : group.id,
    timezone_country: timezoneCountry,
    timezone
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    redirectWithError("/registro", profileError.code === "23505" ? "Ese alias ya existe." : "No se pudo crear el perfil.");
  }

  redirect("/campeon");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function selectChampion(formData: FormData) {
  const teamId = required(formData.get("teamId"));
  if (!teamId) {
    redirectWithError("/campeon", "Selecciona un equipo.");
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect("/login");
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("champion_predictions")
    .select("id")
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (existing) {
    redirect("/dashboard");
  }

  const { error } = await admin.from("champion_predictions").insert({
    user_id: authData.user.id,
    team_id: teamId
  });

  if (error) {
    redirectWithError("/campeon", "No se pudo guardar tu campeón.");
  }

  redirect("/dashboard");
}
