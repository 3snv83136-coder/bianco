import { NextResponse } from "next/server";
import { listGmbLocations } from "@/lib/gmb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const locations = await listGmbLocations();
    return NextResponse.json({ locations });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur GMB" },
      { status: 502 },
    );
  }
}
