import { AppShell } from "@/components/AppShell";
import { ClientForm } from "@/components/clients/ClientForm";
import { LancerSeanceButton } from "@/components/clients/LancerSeanceButton";
import { PlanityPaste } from "@/components/clients/PlanityPaste";
import { getSupabaseOrNull } from "@/lib/supabase";
import type { Client } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadClients(): Promise<Client[]> {
  const db = getSupabaseOrNull();
  if (!db) return [];

  const { data } = await db
    .from("clients")
    .select("*")
    .order("prenom", { ascending: true });

  return (data as Client[]) ?? [];
}

export default async function ClientsPage() {
  const clients = await loadClients();

  return (
    <AppShell
      title="Clientes"
      subtitle="Collez une fiche Planity ou créez une cliente manuellement"
    >
      <div className="mb-6">
        <PlanityPaste />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {clients.length === 0 ? (
            <div className="card text-center text-sm text-dark/60">
              Aucune cliente enregistrée.
            </div>
          ) : (
            clients.map((c) => (
              <article key={c.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-dark">
                      {[c.prenom, c.nom].filter(Boolean).join(" ")}
                    </h2>
                    {c.email && (
                      <p className="text-sm text-dark/60">{c.email}</p>
                    )}
                    {c.telephone && (
                      <p className="text-sm text-dark/60">{c.telephone}</p>
                    )}
                  </div>
                  <LancerSeanceButton
                    clientId={c.id}
                    clientName={[c.prenom, c.nom].filter(Boolean).join(" ")}
                  />
                </div>
                {(c.notes_peau || c.allergies) && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {c.notes_peau && (
                      <p className="rounded-lg bg-primary/5 p-3 text-xs text-dark/80">
                        <span className="font-semibold text-primary">Peau</span>
                        <br />
                        {c.notes_peau}
                      </p>
                    )}
                    {c.allergies && (
                      <p className="rounded-lg bg-red-50 p-3 text-xs text-red-800">
                        <span className="font-semibold">Allergies</span>
                        <br />
                        {c.allergies}
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        <aside>
          <div className="card sticky top-24">
            <h2 className="font-display text-xl font-semibold text-dark">
              Saisie manuelle
            </h2>
            <div className="mt-4">
              <ClientForm />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
