import { NextResponse } from "next/server";
import { isRequestFromAdminSession } from "@/lib/admin/auth";
import { getFootballApiProvider } from "@/lib/football-api/provider";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  const isValidCron = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`);
  const isAdmin = await isRequestFromAdminSession();

  if (!isValidCron && !isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const provider = getFootballApiProvider();
  const admin = createAdminClient();

  try {
    const [teams, matches, results] = await Promise.all([
      provider.syncTeams(),
      provider.syncMatches(),
      provider.syncResults()
    ]);

    await admin.from("sync_logs").insert({
      provider: provider.name,
      sync_type: "full",
      status: "success",
      message: "Sincronización ejecutada correctamente.",
      metadata: {
        teams: teams.length,
        matches: matches.length,
        results: results.length
      }
    });

    return NextResponse.json({
      status: "success",
      provider: provider.name,
      imported: {
        teams: teams.length,
        matches: matches.length,
        results: results.length
      }
    });
  } catch (error) {
    await admin.from("sync_logs").insert({
      provider: provider.name,
      sync_type: "full",
      status: "error",
      message: error instanceof Error ? error.message : "Error desconocido",
      metadata: {}
    });

    return NextResponse.json({ error: "No se pudo sincronizar" }, { status: 500 });
  }
}
