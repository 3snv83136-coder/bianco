import { NextResponse } from "next/server";
import { buildOrdonnanceHtml, generateConseilsText } from "@/lib/ordonnance";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const { data: seance } = await db
    .from("seances")
    .select(
      "*, clients(*), memorandums(*), seance_prestations(nom), seance_produits(nom, marque, url_achat, note_usage)",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!seance?.clients) {
    return NextResponse.json({ error: "Séance introuvable" }, { status: 404 });
  }

  const memo = Array.isArray(seance.memorandums)
    ? seance.memorandums[0]
    : seance.memorandums;

  const input = {
    prenom: seance.clients.prenom,
    nom: seance.clients.nom,
    dateSeance: new Date(seance.date_seance).toLocaleDateString("fr-FR"),
    prestations: (seance.seance_prestations ?? []).map(
      (p: { nom: string }) => p.nom,
    ),
    realise: memo?.realise ?? "",
    produits: (seance.seance_produits ?? []).map(
      (p: {
        nom: string;
        marque: string | null;
        url_achat: string | null;
        note_usage: string | null;
      }) => ({
        nom: p.nom,
        marque: p.marque,
        urlAchat: p.url_achat,
        note: p.note_usage,
      }),
    ),
    allergies: seance.clients.allergies,
  };

  const conseils = generateConseilsText(input);
  const html = buildOrdonnanceHtml(input);

  const realiseBlock = input.realise.trim()
    ? `CE QUI A ÉTÉ RÉALISÉ\n${input.realise.trim()}\n\n`
    : "";

  const fullConseils = `${realiseBlock}${conseils}`;

  await db
    .from("memorandums")
    .upsert(
      {
        seance_id: params.id,
        realise: input.realise,
        conseils: fullConseils,
        conseils_json: { html, produits: input.produits },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "seance_id" },
    );

  await db
    .from("seances")
    .update({ etape_prestation: 5, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  return NextResponse.json({ conseils: fullConseils, html });
}
