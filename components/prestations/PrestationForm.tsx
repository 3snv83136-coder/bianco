"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "Drainage",
  "Visage",
  "Head Spa",
  "Regard",
  "Massage",
  "Onglerie",
  "Corps",
  "Maquillage",
  "Autre",
] as const;

export function PrestationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      nom: String(form.get("nom") ?? ""),
      categorie: String(form.get("categorie") ?? "Autre"),
      description: String(form.get("description") ?? ""),
      duree_min: form.get("duree_min")
        ? Number(form.get("duree_min"))
        : null,
      prix_ttc: form.get("prix_ttc") ? Number(form.get("prix_ttc")) : null,
    };

    const res = await fetch("/api/prestations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur lors de la création");
      return;
    }

    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label-field" htmlFor="nom">
          Nom du soin
        </label>
        <input id="nom" name="nom" required className="input-field" />
      </div>
      <div>
        <label className="label-field" htmlFor="categorie">
          Catégorie
        </label>
        <select id="categorie" name="categorie" className="input-field">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field" htmlFor="duree_min">
            Durée (min)
          </label>
          <input
            id="duree_min"
            name="duree_min"
            type="number"
            min={5}
            step={5}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field" htmlFor="prix_ttc">
            Prix TTC (€)
          </label>
          <input
            id="prix_ttc"
            name="prix_ttc"
            type="number"
            min={0}
            step={0.01}
            className="input-field"
          />
        </div>
      </div>
      <div>
        <label className="label-field" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="input-field resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Création…" : "Ajouter la prestation"}
      </button>
    </form>
  );
}
