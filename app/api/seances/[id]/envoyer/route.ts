import { NextResponse } from "next/server";
import { buildMemorandumHtml, sendMemorandumEmail } from "@/lib/mail-memorandum";
import { buildOrdonnanceHtml } from "@/lib/ordonnance";
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

  if (!seance?.clients?.email) {
    return NextResponse.json(
      { error: "Email cliente manquant" },
      { status: 400 },
    );
  }

  const memo = Array.isArray(seance.memorandums)
    ? seance.memorandums[0]
    : seance.memorandums;

  if (!memo?.realise?.trim()) {
    return NextResponse.json(
      { error: "Remplissez le mémorandum avant l'envoi" },
      { status: 400 },
    );
  }

  const dateSeance = new Date(seance.date_seance).toLocaleDateString("fr-FR");

  const ordonnanceInput = {
    prenom: seance.clients.prenom,
    nom: seance.clients.nom,
    dateSeance,
    prestations: (seance.seance_prestations ?? []).map(
      (p: { nom: string }) => p.nom,
    ),
    realise: memo.realise,
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

  const conseilsJson = memo.conseils_json as { html?: string } | null;
  const html =
    conseilsJson?.html ?? buildOrdonnanceHtml(ordonnanceInput);

  try {
    await sendMemorandumEmail({
      to: seance.clients.email,
      prenom: seance.clients.prenom,
      realise: memo.realise,
      conseils: memo.conseils ?? "",
      dateSeance,
      htmlOverride: html,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur envoi email" },
      { status: 500 },
    );
  }

  const now = new Date().toISOString();
  await db
    .from("memorandums")
    .update({ envoye_at: now })
    .eq("seance_id", params.id);

  await db
    .from("seances")
    .update({ mail_envoye_at: now, statut: "terminee" })
    .eq("id", params.id);

  await db.from("documents").insert({
    seance_id: params.id,
    client_id: seance.client_id,
    type: "memorandum",
    statut: "envoye",
    payload: { realise: memo.realise, conseils: memo.conseils },
  });

  return NextResponse.json({ ok: true });
}
