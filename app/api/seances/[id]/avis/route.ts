import { NextResponse } from "next/server";
import { getParametre } from "@/lib/parametres";
import { buildReviewEmailHtml, getGoogleReviewUrl } from "@/lib/review";
import { getSupabaseOrNull } from "@/lib/supabase";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const reviewUrl = await getGoogleReviewUrl();
  if (!reviewUrl) {
    return NextResponse.json(
      { error: "URL avis Google non configurée (Paramètres)" },
      { status: 400 },
    );
  }

  const { data: seance } = await db
    .from("seances")
    .select("*, clients(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!seance?.clients?.email) {
    return NextResponse.json(
      { error: "Email cliente manquant" },
      { status: 400 },
    );
  }

  const salonNom = await getParametre("NOM_SALON");
  const emailFrom =
    process.env.EMAIL_FROM ?? "Bianco Esthétique <contact@bianco-esthetique.fr>";

  const html = buildReviewEmailHtml({
    prenom: seance.clients.prenom,
    reviewUrl,
    salonNom,
  });

  const relanceIds: string[] = [];

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data: sent, error } = await resend.emails.send({
      from: emailFrom,
      to: seance.clients.email,
      subject: `${salonNom} — Votre avis compte beaucoup ✨`,
      html,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (sent?.id) relanceIds.push(sent.id);

    const delays = [2, 4, 6];
    for (const days of delays) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + days);

      const { data: relance } = await resend.emails.send({
        from: emailFrom,
        to: seance.clients.email,
        subject: `${salonNom} — Un petit mot pour vous`,
        html,
        scheduledAt: scheduledAt.toISOString(),
      });

      if (relance?.id) relanceIds.push(relance.id);
    }
  }

  await db
    .from("seances")
    .update({
      avis_demande_at: new Date().toISOString(),
      avis_relance_ids: relanceIds,
    })
    .eq("id", params.id);

  return NextResponse.json({ ok: true, relanceIds });
}
