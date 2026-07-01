import { NextResponse } from "next/server";
import { sendMemorandumEmail } from "@/lib/mail-memorandum";
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
    .select("*, clients(*), memorandums(*)")
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

  try {
    await sendMemorandumEmail({
      to: seance.clients.email,
      prenom: seance.clients.prenom,
      realise: memo.realise,
      conseils: memo.conseils ?? "",
      dateSeance,
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
