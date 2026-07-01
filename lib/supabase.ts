import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY non configurée");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return cached;
}

export function getSupabaseOrNull(): SupabaseClient | null {
  if (cached) return cached;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return getSupabase();
}

export type StatutSeance = "planifiee" | "en_cours" | "terminee" | "annulee";

export interface Client {
  id: string;
  prenom: string;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  date_naissance: string | null;
  notes_peau: string | null;
  allergies: string | null;
  consentements: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prestation {
  id: string;
  nom: string;
  categorie: string;
  description: string | null;
  duree_min: number | null;
  prix_ttc: number | null;
  actif: boolean;
  ordre: number;
  created_at: string;
  updated_at: string;
}

export interface Seance {
  id: string;
  reference: string | null;
  client_id: string | null;
  date_seance: string;
  heure_debut: string | null;
  duree_min: number | null;
  statut: StatutSeance;
  notes_internes: string | null;
  mail_envoye_at: string | null;
  avis_demande_at: string | null;
  avis_recu: boolean;
  avis_relance_ids: string[] | null;
  publie_slug: string | null;
  publie_at: string | null;
  gmb_post_at: string | null;
  gmb_post_url: string | null;
  photo_url: string | null;
  publish_json: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Memorandum {
  id: string;
  seance_id: string;
  realise: string;
  conseils: string;
  realise_json: Record<string, unknown> | null;
  conseils_json: Record<string, unknown> | null;
  pdf_url: string | null;
  envoye_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeancePrestation {
  id: string;
  seance_id: string;
  prestation_id: string | null;
  nom: string;
  prix_ttc: number | null;
  duree_min: number | null;
  created_at: string;
}

export interface SeanceWithRelations extends Seance {
  clients?: Client | null;
  memorandums?: Memorandum | Memorandum[] | null;
  seance_prestations?: SeancePrestation[];
}

export function getMemorandum(
  seance: SeanceWithRelations,
): Memorandum | null {
  const m = seance.memorandums;
  if (!m) return null;
  return Array.isArray(m) ? (m[0] ?? null) : m;
}
