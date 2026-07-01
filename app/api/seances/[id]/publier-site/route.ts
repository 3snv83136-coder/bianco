import { NextResponse } from "next/server";
import {
  buildSiteArticleFromSeance,
  publishToSite,
} from "@/lib/publish-site";
import { getSupabaseOrNull } from "@/lib/supabase";

export const maxDuration = 60;

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
    .select("*, memorandums(*), seance_prestations(nom)")
    .eq("id", params.id)
    .maybeSingle();

  if (!seance) {
    return NextResponse.json({ error: "Séance introuvable" }, { status: 404 });
  }

  const memo = Array.isArray(seance.memorandums)
    ? seance.memorandums[0]
    : seance.memorandums;

  if (!memo?.conseils?.trim()) {
    return NextResponse.json(
      { error: "Renseignez les conseils avant publication sur le site" },
      { status: 400 },
    );
  }

  const prestationNoms = (seance.seance_prestations ?? []).map(
    (sp: { nom: string }) => sp.nom,
  );

  const article = buildSiteArticleFromSeance({
    prestationNoms,
    conseils: memo.conseils,
  });

  try {
    const result = await publishToSite({
      ...article,
      photoUrl: seance.photo_url,
    });

    const now = new Date().toISOString();
    await db
      .from("seances")
      .update({
        publie_slug: result.slug,
        publie_at: now,
        publish_json: article,
        statut: "terminee",
      })
      .eq("id", params.id);

    await db.from("documents").insert({
      seance_id: params.id,
      client_id: seance.client_id,
      type: "memorandum",
      statut: "envoye",
      payload: { type: "site", slug: result.slug, url: result.url },
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Échec publication site" },
      { status: 502 },
    );
  }
}
