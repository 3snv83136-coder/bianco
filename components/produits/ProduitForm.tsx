"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProduitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: form.get("nom"),
        marque: form.get("marque"),
        categorie: form.get("categorie"),
        description: form.get("description"),
        url_achat: form.get("url_achat"),
      }),
    });
    setLoading(false);
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-3">
      <input name="nom" required placeholder="Nom du produit" className="input-field" />
      <input name="marque" placeholder="Marque" className="input-field" />
      <input name="categorie" placeholder="Catégorie" className="input-field" />
      <textarea
        name="description"
        placeholder="Usage en cabine"
        rows={2}
        className="input-field resize-none"
      />
      <input
        name="url_achat"
        type="url"
        placeholder="URL boutique (achat en ligne)"
        className="input-field"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "…" : "Ajouter"}
      </button>
    </form>
  );
}
