import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PrestationWizard } from "@/components/seances/PrestationWizard";
import { getMemorandum, getSupabaseOrNull } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PrestationPage({
  params,
}: {
  params: { id: string };
}) {
  const db = getSupabaseOrNull();
  if (!db) notFound();

  const { data: seance } = await db
    .from("seances")
    .select("*, clients(*), memorandums(*)")
    .eq("id", params.id)
    .maybeSingle();

  if (!seance) notFound();

  const client = seance.clients;
  const clientName = client
    ? [client.prenom, client.nom].filter(Boolean).join(" ")
    : "Cliente";

  const memo = getMemorandum({
    ...seance,
    memorandums: seance.memorandums,
  });

  return (
    <AppShell
      title="Prestation en cours"
      subtitle={`${clientName} — wizard séance`}
    >
      <PrestationWizard
        seanceId={seance.id}
        clientName={clientName}
        initialStep={seance.etape_prestation ?? 1}
        initialRealise={memo?.realise ?? ""}
        initialConseils={memo?.conseils ?? ""}
      />
    </AppShell>
  );
}
