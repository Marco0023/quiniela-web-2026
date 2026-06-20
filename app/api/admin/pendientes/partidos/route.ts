import { NextResponse } from "next/server";
import { getAdminTodayPendingData } from "@/lib/admin/pending-live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getAdminTodayPendingData();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      }
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron actualizar las predicciones pendientes." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
