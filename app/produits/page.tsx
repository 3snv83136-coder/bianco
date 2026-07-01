import { AppShell } from "@/components/AppShell";
import { ProduitForm } from "@/components/produits/ProduitForm";
import { getSupabaseOrNull } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Produit = {
  id: string;
  nom: string;
  marque: string | null;
  categorie: string | null;
  url_achat: string | null;
  description: string | null;
};

async function loadProduits(): Promise<Produit[]> {
  const db = getSupabaseOrNull();
  if (!db) return [];
  const { data } = await db
    .from("produits")
    .select("*")
    .eq("actif", true)
    .order("ordre");
  return (data as Produit[]) ?? [];
}

export default async function ProduitsPage() {
  const produits = await loadProduits();

  return (
    <AppShell
      title="Catalogue produits"
      subtitle="Produits utilisés en cabine — liens boutique optionnels"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-2">
          {produits.length === 0 ? (
            <div className="card text-sm text-dark/60">Aucun produit.</div>
          ) : (
            produits.map((p) => (
              <article key={p.id} className="card flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-dark">{p.nom}</h2>
                  {p.marque && (
                    <p className="text-sm text-primary">{p.marque}</p>
                  )}
                  {p.description && (
                    <p className="mt-1 text-xs text-dark/60">{p.description}</p>
                  )}
                </div>
                {p.url_achat && (
                  <a
                    href={p.url_achat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    Lien boutique
                  </a>
                )}
              </article>
            ))
          )}
        </div>
        <aside>
          <div className="card sticky top-24">
            <h2 className="font-display text-lg font-semibold">Nouveau produit</h2>
            <div className="mt-4">
              <ProduitForm />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
