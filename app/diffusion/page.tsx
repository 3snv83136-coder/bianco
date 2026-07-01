import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getSupabaseOrNull } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type DocRow = {
  id: string;
  type: string;
  statut: string;
  created_at: string;
  payload: Record<string, unknown> | null;
  seances?: {
    date_seance: string;
    clients?: { prenom: string; nom: string | null } | null;
  } | null;
};

async function loadRecentDocs(): Promise<DocRow[]> {
  const db = getSupabaseOrNull();
  if (!db) return [];

  const { data } = await db
    .from("documents")
    .select("*, seances(date_seance, clients(prenom, nom))")
    .order("created_at", { ascending: false })
    .limit(30);

  return (data as DocRow[]) ?? [];
}

function labelClient(doc: DocRow): string {
  const c = doc.seances?.clients;
  if (!c) return "—";
  return [c.prenom, c.nom].filter(Boolean).join(" ");
}

export default async function DiffusionPage() {
  const docs = await loadRecentDocs();

  return (
    <AppShell
      title="Diffusion"
      subtitle="Envois par mail, publications sur bianco-esthetique.fr et Google Business"
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="card border-l-4 border-l-primary">
          <div className="text-2xl">📧</div>
          <h2 className="mt-2 font-semibold text-dark">Mail</h2>
          <p className="mt-1 text-xs text-dark/60">
            Compte-rendu de séance (réalisé + conseils) via Resend
          </p>
        </div>
        <div className="card border-l-4 border-l-dark/20">
          <div className="text-2xl">🌐</div>
          <h2 className="mt-2 font-semibold text-dark">Site web</h2>
          <p className="mt-1 text-xs text-dark/60">
            Article « Conseils Bien-être » sur{" "}
            <a
              href="https://www.bianco-esthetique.fr/blog"
              className="text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              bianco-esthetique.fr
            </a>
          </p>
        </div>
        <div className="card border-l-4 border-l-indigo-400">
          <div className="text-2xl">📍</div>
          <h2 className="mt-2 font-semibold text-dark">Google Business</h2>
          <p className="mt-1 text-xs text-dark/60">
            Post local sur la fiche Bianco Esthétique Hyères
          </p>
          <Link
            href="/parametres"
            className="mt-2 inline-block text-xs text-primary underline"
          >
            Configurer OAuth GMB →
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl font-semibold text-dark">
          Historique des envois
        </h2>
        {docs.length === 0 ? (
          <div className="card text-sm text-dark/60">
            Aucun envoi pour l&apos;instant. Lancez une diffusion depuis une{" "}
            <Link href="/seances" className="text-primary underline">
              fiche séance
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <article key={doc.id} className="card py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-medium text-dark">
                      {labelClient(doc)}
                    </span>
                    <span className="ml-2 text-dark/50">
                      {doc.seances?.date_seance
                        ? new Date(doc.seances.date_seance).toLocaleDateString(
                            "fr-FR",
                          )
                        : ""}
                    </span>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {doc.type}
                    {doc.payload?.type === "site" ? " → site" : ""}
                  </span>
                </div>
                <div className="mt-1 text-xs text-dark/50">
                  {new Date(doc.created_at).toLocaleString("fr-FR")} —{" "}
                  {doc.statut}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
