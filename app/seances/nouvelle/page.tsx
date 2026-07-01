"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import type { Client, Prestation } from "@/lib/supabase";

export default function NouvelleSeancePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [prestations, setPrestations] = useState<Prestation[]>([]);
  const [selectedPrestations, setSelectedPrestations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/prestations").then((r) => r.json()),
    ]).then(([c, p]) => {
      if (Array.isArray(c)) setClients(c);
      if (Array.isArray(p)) setPrestations(p);
    });
  }, []);

  function togglePrestation(id: string) {
    setSelectedPrestations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      client_id: String(form.get("client_id") ?? ""),
      date_seance: String(form.get("date_seance") ?? ""),
      heure_debut: String(form.get("heure_debut") ?? "") || null,
      prestation_ids: selectedPrestations,
    };

    const res = await fetch("/api/seances", {
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

    const data = (await res.json()) as { id: string };
    router.push(`/seances/${data.id}`);
  }

  return (
    <AppShell
      title="Nouvelle séance"
      subtitle="Planifier un rendez-vous et sélectionner les prestations"
    >
      <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5">
        <div className="card space-y-4">
          <div>
            <label className="label-field" htmlFor="client_id">
              Cliente
            </label>
            <select
              id="client_id"
              name="client_id"
              required
              className="input-field"
            >
              <option value="">Choisir une cliente…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {[c.prenom, c.nom].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field" htmlFor="date_seance">
                Date
              </label>
              <input
                id="date_seance"
                name="date_seance"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field" htmlFor="heure_debut">
                Heure
              </label>
              <input
                id="heure_debut"
                name="heure_debut"
                type="time"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-lg font-semibold text-dark">
            Prestations prévues
          </h2>
          <div className="mt-3 space-y-2">
            {prestations.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5 hover:border-primary/30"
              >
                <input
                  type="checkbox"
                  checked={selectedPrestations.includes(p.id)}
                  onChange={() => togglePrestation(p.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="flex-1 text-sm text-dark">{p.nom}</span>
                <span className="text-xs text-primary">
                  {p.prix_ttc != null ? `${p.prix_ttc} €` : ""}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Création…" : "Créer la séance"}
        </button>
      </form>
    </AppShell>
  );
}
