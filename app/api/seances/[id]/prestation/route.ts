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
    produits?: Array<{
      produit_id?: string;
      nom: string;
      marque?: string;
      url_achat?: string;
      note_usage?: string;
    }>;
    etape?: number;
  };

  if (body.produits) {
    await db.from("seance_produits").delete().eq("seance_id", params.id);

    if (body.produits.length > 0) {
      await db.from("seance_produits").insert(
        body.produits.map((p) => ({
          seance_id: params.id,
          produit_id: p.produit_id || null,
          nom: p.nom,
          marque: p.marque || null,
          url_achat: p.url_achat || null,
          note_usage: p.note_usage || null,
        })),
      );
    }
  }

  if (body.etape != null) {
    await db
      .from("seances")
      .update({ etape_prestation: body.etape })
      .eq("id", params.id);
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const body = (await req.json()) as { realise?: string; conseils?: string };

  if (body.realise != null || body.conseils != null) {
    await db.from("memorandums").upsert(
      {
        seance_id: params.id,
        realise: body.realise ?? "",
        conseils: body.conseils ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "seance_id" },
    );
  }

  return NextResponse.json({ ok: true });
}
