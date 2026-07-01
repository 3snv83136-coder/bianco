import { AppShell } from "@/components/AppShell";
import { PrestationForm } from "@/components/prestations/PrestationForm";
import { PrestationList } from "@/components/prestations/PrestationList";
import { getSupabaseOrNull } from "@/lib/supabase";
import type { Prestation } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function loadPrestations(): Promise<Prestation[]> {
  const db = getSupabaseOrNull();
  if (!db) return [];

  const { data } = await db
    .from("prestations")
    .select("*")
    .order("ordre", { ascending: true });

  return (data as Prestation[]) ?? [];
}

export default async function PrestationsPage() {
  const prestations = await loadPrestations();

  return (
    <AppShell
      title="Prestations"
      subtitle="Catalogue des soins Bianco Esthétique — drainage, visage, regard, onglerie…"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <PrestationList initial={prestations} />
        <aside>
          <div className="card sticky top-24">
            <h2 className="font-display text-xl font-semibold text-dark">
              Nouvelle prestation
            </h2>
            <p className="mt-1 text-xs text-dark/60">
              Ajoutez un soin au catalogue. Les prix sont modifiables à tout
              moment.
            </p>
            <div className="mt-4">
              <PrestationForm />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
