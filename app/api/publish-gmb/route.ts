import { NextRequest, NextResponse } from "next/server";
import { buildGmbPostFromSeance, createGmbPost } from "@/lib/gmb";
import { getParametre } from "@/lib/parametres";
import { getSupabaseOrNull } from "@/lib/supabase";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  let body: { seanceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const seanceId = (body.seanceId ?? "").trim();
  if (!seanceId) {
    return NextResponse.json({ error: "seanceId requis" }, { status: 400 });
  }

  const db = getSupabaseOrNull();
  if (!db) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 });
  }

  const { data: seance } = await db
    .from("seances")
    .select("*, memorandums(*), seance_prestations(nom)")
    .eq("id", seanceId)
    .maybeSingle();

  if (!seance) {
    return NextResponse.json({ error: "Séance introuvable" }, { status: 404 });
  }

  const memo = Array.isArray(seance.memorandums)
    ? seance.memorandums[0]
    : seance.memorandums;

  const prestationNoms = (seance.seance_prestations ?? []).map(
    (sp: { nom: string }) => sp.nom,
  );

  const siteUrl = await getParametre("SITE_URL");
  const articleUrl = seance.publie_slug
    ? `${siteUrl.replace(/\/$/, "")}/blog/${seance.publie_slug}`
    : null;

  const postInput = buildGmbPostFromSeance({
    prestationNoms,
    conseils: memo?.conseils ?? "",
    siteUrl,
    articleUrl,
  });

  if (seance.photo_url) {
    postInput.photoUrl = seance.photo_url;
  }

  try {
    const result = await createGmbPost(postInput);

    await db
      .from("seances")
      .update({
        gmb_post_at: new Date().toISOString(),
        gmb_post_url: result.searchUrl,
      })
      .eq("id", seanceId);

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Échec publication GMB" },
      { status: 502 },
    );
  }
}
