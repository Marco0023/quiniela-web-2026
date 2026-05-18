"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function requireAdminProfile() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id,role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return {
    id: authData.user.id,
    role: "admin" as const
  };
}

export async function isRequestFromAdminSession() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return false;

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", authData.user.id).single();
  return profile?.role === "admin";
}
