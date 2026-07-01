import { NextResponse } from "next/server";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function GET() {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const { data, error } = await db
    .from("clients")
    .select("*")
    .order("prenom", { ascending: true });

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
    prenom?: string;
    nom?: string;
    email?: string;
    telephone?: string;
    notes_peau?: string;
    allergies?: string;
  };

  if (!body.prenom?.trim()) {
    return NextResponse.json({ error: "Prénom requis" }, { status: 400 });
  }

  const { data, error } = await db
    .from("clients")
    .insert({
      prenom: body.prenom.trim(),
      nom: body.nom?.trim() || null,
      email: body.email?.trim() || null,
      telephone: body.telephone?.trim() || null,
      notes_peau: body.notes_peau?.trim() || null,
      allergies: body.allergies?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
