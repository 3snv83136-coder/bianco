import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getMemorandum, getSupabaseOrNull } from "@/lib/supabase";
import type { SeanceWithRelations } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function clientLabel(seance: SeanceWithRelations): string {
  const c = seance.clients;
  if (!c) return "Cliente";
  return [c.prenom, c.nom].filter(Boolean).join(" ");
}

async function loadHistorique(): Promise<SeanceWithRelations[]> {
  const db = getSupabaseOrNull();
  if (!db) return [];

  const { data } = await db
    .from("seances")
    .select("*, clients(*), memorandums(realise, conseils, envoye_at)")
    .eq("statut", "terminee")
    .order("date_seance", { ascending: false })
    .limit(50);

  return (data as SeanceWithRelations[]) ?? [];
}

export default async function HistoriquePage() {
  const seances = await loadHistorique();

  return (
    <AppShell
      title="Historique"
      subtitle="Séances terminées — mémorandums et envois"
    >
      {seances.length === 0 ? (
        <div className="card text-center text-sm text-dark/60">
          Aucune séance terminée pour l&apos;instant.
        </div>
      ) : (
        <div className="space-y-3">
          {seances.map((s) => (
            <Link
              key={s.id}
              href={`/seances/${s.id}`}
              className="card block transition hover:border-primary/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-dark">
                    {clientLabel(s)}
                  </div>
                  <div className="text-sm text-dark/60">
                    {new Date(s.date_seance).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div className="flex gap-2 text-xs">
                  {getMemorandum(s)?.envoye_at && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      Envoyé
                    </span>
                  )}
                  {s.avis_demande_at && (
                    <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">
                      Avis demandé
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
