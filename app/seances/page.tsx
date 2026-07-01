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

async function loadSeances(): Promise<SeanceWithRelations[]> {
  const db = getSupabaseOrNull();
  if (!db) return [];

  const { data } = await db
    .from("seances")
    .select("*, clients(*), memorandums(*)")
    .in("statut", ["planifiee", "en_cours"])
    .order("date_seance", { ascending: false });

  return (data as SeanceWithRelations[]) ?? [];
}

export default async function SeancesPage() {
  const seances = await loadSeances();

  return (
    <AppShell
      title="Séances"
      subtitle="Rendez-vous en cours — rédigez le mémorandum après chaque soin"
    >
      <div className="mb-4 flex justify-end">
        <Link href="/seances/nouvelle" className="btn-primary">
          + Nouvelle séance
        </Link>
      </div>

      {seances.length === 0 ? (
        <div className="card text-center text-sm text-dark/60">
          Aucune séance planifiée.{" "}
          <Link href="/seances/nouvelle" className="text-primary underline">
            Créer une séance
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {seances.map((s) => (
            <Link
              key={s.id}
              href={`/seances/${s.id}`}
              className="card block transition hover:border-primary/30 hover:shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-dark">
                    {clientLabel(s)}
                  </div>
                  <div className="text-sm text-dark/60">
                    {new Date(s.date_seance).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    {s.heure_debut ? ` — ${s.heure_debut.slice(0, 5)}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      getMemorandum(s)?.realise?.trim()
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-dark/60"
                    }`}
                  >
                    {getMemorandum(s)?.realise?.trim()
                      ? "Mémorandum rédigé"
                      : "À compléter"}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-dark/40">
                    {s.statut}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
