import { NextResponse } from "next/server";
import { getSupabaseOrNull } from "@/lib/supabase";

function makeReference(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `BIA-${y}${m}${d}-${h}${min}`;
}

export async function POST(req: Request) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const body = (await req.json()) as {
    client_id?: string;
    prestation_ids?: string[];
  };

  if (!body.client_id) {
    return NextResponse.json({ error: "Cliente requise" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const { data: seance, error } = await db
    .from("seances")
    .insert({
      reference: makeReference(),
      client_id: body.client_id,
      date_seance: now.slice(0, 10),
      heure_debut: now.slice(11, 19),
      statut: "en_cours",
      etape_prestation: 1,
      started_at: now,
    })
    .select()
    .single();

  if (error || !seance) {
    return NextResponse.json(
      { error: error?.message ?? "Erreur création" },
      { status: 500 },
    );
  }

  const prestationIds = body.prestation_ids ?? [];
  if (prestationIds.length > 0) {
    const { data: prestations } = await db
      .from("prestations")
      .select("id, nom, prix_ttc, duree_min")
      .in("id", prestationIds);

    if (prestations?.length) {
      await db.from("seance_prestations").insert(
        prestations.map((p) => ({
          seance_id: seance.id,
          prestation_id: p.id,
          nom: p.nom,
          prix_ttc: p.prix_ttc,
          duree_min: p.duree_min,
        })),
      );
    }
  }

  await db.from("memorandums").insert({
    seance_id: seance.id,
    realise: "",
    conseils: "",
  });

  return NextResponse.json(seance, { status: 201 });
}
