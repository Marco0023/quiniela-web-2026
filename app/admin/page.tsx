import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/repository";

export default async function AdminPage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  redirect("/inicio-admin");
}
