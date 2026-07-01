"use client";

import type { Prestation } from "@/lib/supabase";

function formatPrix(prix: number | null): string {
  if (prix == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(prix);
}

export function PrestationList({ initial }: { initial: Prestation[] }) {
  if (initial.length === 0) {
    return (
      <div className="card text-center text-sm text-dark/60">
        <p>Aucune prestation pour l&apos;instant.</p>
        <p className="mt-2">
          Configurez Supabase puis exécutez{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs">
            supabase/schema.sql
          </code>{" "}
          pour charger le catalogue Bianco.
        </p>
      </div>
    );
  }

  const byCategory = initial.reduce<Record<string, Prestation[]>>((acc, p) => {
    const cat = p.categorie || "Autre";
    acc[cat] = acc[cat] ?? [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(byCategory).map(([categorie, items]) => (
        <section key={categorie}>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-dark">
            <span className="h-px flex-1 bg-primary/20" />
            <span>{categorie}</span>
            <span className="h-px flex-1 bg-primary/20" />
          </h2>
          <div className="space-y-2">
            {items.map((p) => (
              <article
                key={p.id}
                className="card flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <h3 className="font-semibold text-dark">{p.nom}</h3>
                  {p.description && (
                    <p className="mt-0.5 text-sm text-dark/60">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {p.duree_min != null && (
                    <span className="text-dark/50">{p.duree_min} min</span>
                  )}
                  <span className="font-semibold text-primary">
                    {formatPrix(p.prix_ttc)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
