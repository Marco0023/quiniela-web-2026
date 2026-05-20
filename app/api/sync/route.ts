import { NextResponse } from "next/server";
import { isRequestFromAdminSession } from "@/lib/admin/auth";
import { getFootballApiProvider } from "@/lib/football-api/provider";
import { runFootballSync } from "@/lib/football-api/sync-service";
import { createAdminClient } from "@/lib/supabase/admin";

const syncTypes = new Set(["teams", "matches", "results", "full"]);

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
  const body = await safeJson(request);
  const syncType = syncTypes.has(body.syncType ?? "") ? (body.syncType as "teams" | "matches" | "results" | "full") : "full";

  try {
    const metadata = await runFootballSync(provider, syncType);

    await admin.from("sync_logs").insert({
      provider: provider.name,
      sync_type: syncType,
      status: "success",
      message: "Sincronización ejecutada correctamente.",
      metadata
    });

    return NextResponse.json({
      status: "success",
      provider: provider.name,
      imported: metadata
    });
  } catch (error) {
    await admin.from("sync_logs").insert({
      provider: provider.name,
      sync_type: syncType,
      status: "error",
      message: error instanceof Error ? error.message : "Error desconocido",
      metadata: {}
    });

    return NextResponse.json({ error: "No se pudo sincronizar" }, { status: 500 });
  }
}

async function safeJson(request: Request) {
  try {
    return (await request.json()) as { syncType?: string };
  } catch {
    return {};
  }
}
