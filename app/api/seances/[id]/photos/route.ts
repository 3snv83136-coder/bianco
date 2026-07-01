import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const maxDuration = 30;

const BUCKET = "seance-photos";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const type = (form.get("type") as string) || "autre";
    const legende = (form.get("legende") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "Fichier requis" }, { status: 400 });
    }

    const db = getSupabase();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${params.id}/${type}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload : ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);
    const url = pub.publicUrl;

    const { data: photo, error } = await db
      .from("seance_photos")
      .insert({
        seance_id: params.id,
        type,
        url,
        legende,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(photo);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur upload" },
      { status: 500 },
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const db = getSupabase();
  const { data, error } = await db
    .from("seance_photos")
    .select("*")
    .eq("seance_id", params.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
