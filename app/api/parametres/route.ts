import { NextResponse } from "next/server";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function POST(req: Request) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const body = (await req.json()) as Record<string, string>;

  for (const [cle, valeur] of Object.entries(body)) {
    const { error } = await db.from("parametres").upsert(
      { cle, valeur, updated_at: new Date().toISOString() },
      { onConflict: "cle" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
