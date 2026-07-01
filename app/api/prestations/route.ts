import { NextResponse } from "next/server";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function GET() {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const { data, error } = await db
    .from("prestations")
    .select("*")
    .eq("actif", true)
    .order("ordre", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const body = (await req.json()) as {
    nom?: string;
    categorie?: string;
    description?: string;
    duree_min?: number | null;
    prix_ttc?: number | null;
  };

  if (!body.nom?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const { data, error } = await db
    .from("prestations")
    .insert({
      nom: body.nom.trim(),
      categorie: body.categorie?.trim() || "Autre",
      description: body.description?.trim() || null,
      duree_min: body.duree_min ?? null,
      prix_ttc: body.prix_ttc ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
