"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  seanceId: string;
  initialRealise: string;
  initialConseils: string;
};

export function MemorandumForm({
  seanceId,
  initialRealise,
  initialConseils,
}: Props) {
  const router = useRouter();
  const [realise, setRealise] = useState(initialRealise);
  const [conseils, setConseils] = useState(initialConseils);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch(`/api/seances/${seanceId}/memorandum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ realise, conseils }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur de sauvegarde");
      return;
    }

    setMessage("Mémorandum enregistré");
    router.refresh();
  }

  async function sendToClient() {
    await save();
    setSending(true);
    setError(null);

    const res = await fetch(`/api/seances/${seanceId}/envoyer`, {
      method: "POST",
    });

    setSending(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur d'envoi");
      return;
    }

    setMessage("Compte-rendu envoyé à la cliente");
    router.refresh();
  }

  return (
    <section className="space-y-4">
      <div className="card border-l-4 border-l-primary">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm">
            ✨
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-dark">
              Ce qui a été fait
            </h2>
            <p className="text-xs text-dark/50">
              Protocole, zones traitées, produits utilisés, observations
            </p>
          </div>
        </div>
        <textarea
          value={realise}
          onChange={(e) => setRealise(e.target.value)}
          rows={6}
          placeholder="Ex. : Drainage méthode brésilienne sur les jambes, travail approfondi sur la zone des chevilles. Produit apaisant post-soin appliqué…"
          className="input-field resize-y"
        />
      </div>

      <div className="card border-l-4 border-l-dark/20">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-sm">
            💡
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-dark">
              Conseils personnalisés
            </h2>
            <p className="text-xs text-dark/50">
              Entretien à la maison, fréquence, précautions
            </p>
          </div>
        </div>
        <textarea
          value={conseils}
          onChange={(e) => setConseils(e.target.value)}
          rows={6}
          placeholder="Ex. : Boire 1,5 L d'eau aujourd'hui. Éviter le sport intense 24 h. Prochaine séance recommandée dans 2 semaines…"
          className="input-field resize-y"
        />
      </div>

      {message && (
        <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => void sendToClient()}
          disabled={sending || !realise.trim()}
          className="btn-primary"
        >
          {sending ? "Envoi…" : "Envoyer à la cliente"}
        </button>
      </div>
    </section>
  );
}
