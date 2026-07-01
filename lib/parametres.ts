import { getSupabaseOrNull } from "./supabase";

const DEFAULTS: Record<string, string> = {
  NOM_SALON: "Bianco Esthétique",
  ADRESSE: "3 Avenue Ernest Millet",
  CODE_POSTAL: "83400",
  VILLE: "Hyères",
  TEL_PRINCIPAL: "0749967691",
  EMAIL_SALON: "contact@bianco-esthetique.fr",
  GOOGLE_REVIEW_URL: "",
  PLANITY_URL: "https://www.planity.com/bianco-esthetique-83400-hyeres",
  SITE_URL: "https://www.bianco-esthetique.fr",
  GMB_CLIENT_ID: "",
  GMB_CLIENT_SECRET: "",
  GMB_REDIRECT_URI: "",
  GMB_LOCATION: "",
};

export async function getParametre(cle: string): Promise<string> {
  const fallback = DEFAULTS[cle] ?? "";
  const db = getSupabaseOrNull();
  if (!db) return fallback;

  const { data } = await db
    .from("parametres")
    .select("valeur")
    .eq("cle", cle)
    .maybeSingle();

  return data?.valeur ?? fallback;
}

export async function getParametres(): Promise<Record<string, string>> {
  const db = getSupabaseOrNull();
  const result = { ...DEFAULTS };
  if (!db) return result;

  const { data } = await db.from("parametres").select("cle, valeur");
  for (const row of data ?? []) {
    result[row.cle] = row.valeur;
  }
  return result;
}

export function formatTel(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }
  return tel;
}
