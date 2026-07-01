"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      prenom: String(form.get("prenom") ?? ""),
      nom: String(form.get("nom") ?? ""),
      email: String(form.get("email") ?? ""),
      telephone: String(form.get("telephone") ?? ""),
      notes_peau: String(form.get("notes_peau") ?? ""),
      allergies: String(form.get("allergies") ?? ""),
    };

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur");
      return;
    }

    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-field" htmlFor="prenom">
            Prénom
          </label>
          <input id="prenom" name="prenom" required className="input-field" />
        </div>
        <div>
          <label className="label-field" htmlFor="nom">
            Nom
          </label>
          <input id="nom" name="nom" className="input-field" />
        </div>
      </div>
      <div>
        <label className="label-field" htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" className="input-field" />
      </div>
      <div>
        <label className="label-field" htmlFor="telephone">
          Téléphone
        </label>
        <input id="telephone" name="telephone" className="input-field" />
      </div>
      <div>
        <label className="label-field" htmlFor="notes_peau">
          Notes peau
        </label>
        <textarea
          id="notes_peau"
          name="notes_peau"
          rows={2}
          className="input-field resize-none"
        />
      </div>
      <div>
        <label className="label-field" htmlFor="allergies">
          Allergies
        </label>
        <textarea
          id="allergies"
          name="allergies"
          rows={2}
          className="input-field resize-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Ajout…" : "Ajouter la cliente"}
      </button>
    </form>
  );
}
