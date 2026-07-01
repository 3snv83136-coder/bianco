import { NextResponse } from "next/server";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const body = (await req.json()) as {
    realise?: string;
    conseils?: string;
  };

  const { data: existing } = await db
    .from("memorandums")
    .select("id")
    .eq("seance_id", params.id)
    .maybeSingle();

  const payload = {
    realise: body.realise ?? "",
    conseils: body.conseils ?? "",
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await db
      .from("memorandums")
      .update(payload)
      .eq("seance_id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await db.from("memorandums").insert({
      seance_id: params.id,
      ...payload,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  await db
    .from("seances")
    .update({ statut: "terminee", updated_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({ ok: true });
}
