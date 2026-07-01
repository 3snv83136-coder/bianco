import { NextResponse } from "next/server";
import { getGmbAuthUrl } from "@/lib/gmb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = await getGmbAuthUrl();
    return NextResponse.redirect(url);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "OAuth GMB indisponible" },
      { status: 500 },
    );
  }
}
