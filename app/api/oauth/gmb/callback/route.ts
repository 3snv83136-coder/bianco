import { NextRequest, NextResponse } from "next/server";
import { exchangeGmbCodeAndStore } from "@/lib/gmb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/parametres?gmb_error=${encodeURIComponent(error)}`, req.url),
    );
  }

  if (!code) {
    return NextResponse.json({ error: "code manquant" }, { status: 400 });
  }

  try {
    const { email } = await exchangeGmbCodeAndStore(code);
    const q = email
      ? `?gmb_ok=1&email=${encodeURIComponent(email)}`
      : "?gmb_ok=1";
    return NextResponse.redirect(new URL(`/parametres${q}`, req.url));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur OAuth";
    return NextResponse.redirect(
      new URL(
        `/parametres?gmb_error=${encodeURIComponent(msg)}`,
        req.url,
      ),
    );
  }
}
