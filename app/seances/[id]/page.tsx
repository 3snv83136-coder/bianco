import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DiffusionPanel } from "@/components/seances/DiffusionPanel";
import { MemorandumForm } from "@/components/seances/MemorandumForm";
import { getParametre } from "@/lib/parametres";
import { getMemorandum, getSupabaseOrNull } from "@/lib/supabase";
import type { SeanceWithRelations } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadSeance(id: string): Promise<SeanceWithRelations | null> {
  const db = getSupabaseOrNull();
  if (!db) return null;

  const { data } = await db
    .from("seances")
    .select(
      "*, clients(*), memorandums(*), seance_prestations(*, prestations(nom))",
    )
    .eq("id", id)
    .maybeSingle();

  return data as SeanceWithRelations | null;
}

export default async function SeanceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const seance = await loadSeance(params.id);
  if (!seance) notFound();

  const client = seance.clients;
  const clientName = client
    ? [client.prenom, client.nom].filter(Boolean).join(" ")
    : "Cliente";
  const memo = getMemorandum(seance);
  const siteUrl = await getParametre("SITE_URL");

  return (
    <AppShell
      title={clientName}
      subtitle={`Séance du ${new Date(seance.date_seance).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {seance.seance_prestations && seance.seance_prestations.length > 0 && (
            <section className="card">
              <h2 className="font-display text-lg font-semibold text-dark">
                Prestations réalisées
              </h2>
              <ul className="mt-3 space-y-2">
                {seance.seance_prestations.map((sp) => (
                  <li
                    key={sp.id}
                    className="flex justify-between text-sm text-dark/80"
                  >
                    <span>{sp.nom}</span>
                    {sp.prix_ttc != null && (
                      <span className="text-primary">{sp.prix_ttc} €</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <MemorandumForm
            seanceId={seance.id}
            initialRealise={memo?.realise ?? ""}
            initialConseils={memo?.conseils ?? ""}
          />
        </div>

        <aside className="space-y-4">
          <DiffusionPanel
            seanceId={seance.id}
            clientEmail={client?.email ?? null}
            clientPrenom={client?.prenom ?? "Cliente"}
            mailEnvoye={!!memo?.envoye_at || !!seance.mail_envoye_at}
            publieAt={seance.publie_at}
            publieSlug={seance.publie_slug}
            gmbPostAt={seance.gmb_post_at}
            avisDemande={!!seance.avis_demande_at}
            hasConseils={!!memo?.conseils?.trim()}
            hasRealise={!!memo?.realise?.trim()}
            siteUrl={siteUrl}
          />

          {client && (
            <div className="card text-sm">
              <h3 className="font-semibold text-dark">Fiche cliente</h3>
              {client.telephone && (
                <p className="mt-2 text-dark/70">{client.telephone}</p>
              )}
              {client.email && (
                <p className="text-dark/70">{client.email}</p>
              )}
              {client.notes_peau && (
                <p className="mt-3 rounded-lg bg-primary/5 p-3 text-dark/80">
                  <span className="text-xs font-semibold uppercase text-primary">
                    Peau
                  </span>
                  <br />
                  {client.notes_peau}
                </p>
              )}
              {client.allergies && (
                <p className="mt-2 rounded-lg bg-red-50 p-3 text-red-800">
                  <span className="text-xs font-semibold uppercase">
                    Allergies
                  </span>
                  <br />
                  {client.allergies}
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
