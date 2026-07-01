import { NextResponse } from "next/server";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function GET() {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const { data, error } = await db
    .from("produits")
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
    marque?: string;
    categorie?: string;
    description?: string;
    url_achat?: string;
  };

  if (!body.nom?.trim()) {
    return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  }

  const { data, error } = await db
    .from("produits")
    .insert({
      nom: body.nom.trim(),
      marque: body.marque?.trim() || null,
      categorie: body.categorie?.trim() || "Soin",
      description: body.description?.trim() || null,
      url_achat: body.url_achat?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
