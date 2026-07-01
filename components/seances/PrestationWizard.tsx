"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Produit = {
  id: string;
  nom: string;
  marque: string | null;
  categorie: string | null;
  url_achat: string | null;
  description: string | null;
};

type Photo = {
  id: string;
  type: string;
  url: string;
  legende: string | null;
};

type SelectedProduit = {
  produit_id: string;
  nom: string;
  marque: string;
  url_achat: string;
  note_usage: string;
};

const STEPS = [
  { id: 1, label: "Photos avant", icon: "📷" },
  { id: 2, label: "Photos après", icon: "✨" },
  { id: 3, label: "Produits", icon: "🧴" },
  { id: 4, label: "Réalisé", icon: "📝" },
  { id: 5, label: "Ordonnance", icon: "💊" },
  { id: 6, label: "Envoi", icon: "📤" },
] as const;

export function PrestationWizard({
  seanceId,
  clientName,
  initialStep = 1,
  initialRealise = "",
  initialConseils = "",
}: {
  seanceId: string;
  clientName: string;
  initialStep?: number;
  initialRealise?: string;
  initialConseils?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [catalogue, setCatalogue] = useState<Produit[]>([]);
  const [selected, setSelected] = useState<SelectedProduit[]>([
    { produit_id: "", nom: "", marque: "", url_achat: "", note_usage: "" },
  ]);
  const [realise, setRealise] = useState(initialRealise);
  const [conseils, setConseils] = useState(initialConseils);
  const [ordonnanceHtml, setOrdonnanceHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const res = await fetch(`/api/seances/${seanceId}/photos`);
    if (res.ok) setPhotos((await res.json()) as Photo[]);
  }, [seanceId]);

  useEffect(() => {
    void loadPhotos();
    void fetch("/api/produits")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setCatalogue(d);
      });
  }, [loadPhotos]);

  async function uploadPhoto(type: "avant" | "apres", file: File) {
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    const res = await fetch(`/api/seances/${seanceId}/photos`, {
      method: "POST",
      body: fd,
    });
    setLoading(false);
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Erreur photo");
      return;
    }
    await loadPhotos();
  }

  async function saveEtape(next: number) {
    await fetch(`/api/seances/${seanceId}/prestation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ etape: next }),
    });
    setStep(next);
  }

  async function saveProduits() {
    setLoading(true);
    const produits = selected.filter((s) => s.nom.trim());
    await fetch(`/api/seances/${seanceId}/prestation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produits, etape: 4 }),
    });
    setLoading(false);
    setStep(4);
  }

  async function saveRealise() {
    setLoading(true);
    await fetch(`/api/seances/${seanceId}/prestation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ realise }),
    });
    await saveEtape(5);
    setLoading(false);
  }

  async function genererOrdonnance() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/seances/${seanceId}/generer-conseils`, {
      method: "POST",
    });
    setLoading(false);
    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Erreur génération");
      return;
    }
    const data = (await res.json()) as { conseils: string; html: string };
    setConseils(data.conseils);
    setOrdonnanceHtml(data.html);
    setStep(6);
  }

  function pickProduit(index: number, produitId: string) {
    const p = catalogue.find((c) => c.id === produitId);
    if (!p) return;
    setSelected((prev) => {
      const next = [...prev];
      next[index] = {
        produit_id: p.id,
        nom: p.nom,
        marque: p.marque ?? "",
        url_achat: p.url_achat ?? "",
        note_usage: p.description ?? "",
      };
      return next;
    });
  }

  const photosAvant = photos.filter((p) => p.type === "avant");
  const photosApres = photos.filter((p) => p.type === "apres");

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => step > s.id && setStep(s.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
              step === s.id
                ? "bg-dark text-white"
                : step > s.id
                  ? "bg-primary/10 text-primary"
                  : "bg-gray-100 text-dark/40"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </nav>

      <p className="text-sm text-dark/60">
        Séance — <strong className="text-dark">{clientName}</strong>
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {step === 1 && (
        <StepPhotos
          title="Photos AVANT"
          subtitle="Ongles, peau, regard… Capturez l'état initial"
          photos={photosAvant}
          type="avant"
          loading={loading}
          onUpload={(f) => void uploadPhoto("avant", f)}
          onSkip={() => void saveEtape(2)}
          onNext={() => void saveEtape(2)}
        />
      )}

      {step === 2 && (
        <StepPhotos
          title="Photos APRÈS"
          subtitle="Résultat du soin — ou passez si pas de photo"
          photos={photosApres}
          type="apres"
          loading={loading}
          onUpload={(f) => void uploadPhoto("apres", f)}
          onSkip={() => void saveEtape(3)}
          onNext={() => void saveEtape(3)}
        />
      )}

      {step === 3 && (
        <section className="card space-y-4">
          <h2 className="font-display text-xl font-semibold text-dark">
            Produits utilisés
          </h2>
          <p className="text-xs text-dark/60">
            Sélectionnez les produits appliqués — liens boutique si configurés
          </p>

          {selected.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr]">
              <select
                className="input-field"
                value={row.produit_id}
                onChange={(e) => pickProduit(i, e.target.value)}
              >
                <option value="">— Choisir un produit —</option>
                {catalogue.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                    {p.marque ? ` (${p.marque})` : ""}
                  </option>
                ))}
              </select>
              <input
                className="input-field"
                placeholder="Note d'usage (ex. couche fine)"
                value={row.note_usage}
                onChange={(e) => {
                  const next = [...selected];
                  next[i] = { ...next[i], note_usage: e.target.value };
                  setSelected(next);
                }}
              />
            </div>
          ))}

          <button
            type="button"
            className="text-sm text-primary underline"
            onClick={() =>
              setSelected((p) => [
                ...p,
                {
                  produit_id: "",
                  nom: "",
                  marque: "",
                  url_achat: "",
                  note_usage: "",
                },
              ])
            }
          >
            + Ajouter un produit
          </button>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => void saveProduits()}
              disabled={loading}
              className="btn-primary"
            >
              Continuer
            </button>
            <button
              type="button"
              onClick={() => void saveEtape(4)}
              className="btn-secondary"
            >
              Passer
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="card space-y-4">
          <h2 className="font-display text-xl font-semibold text-dark">
            Ce qui a été réalisé
          </h2>
          <textarea
            value={realise}
            onChange={(e) => setRealise(e.target.value)}
            rows={8}
            className="input-field resize-y"
            placeholder="Protocole, zones traitées, techniques utilisées…"
          />
          <button
            type="button"
            onClick={() => void saveRealise()}
            disabled={loading || !realise.trim()}
            className="btn-primary"
          >
            Continuer vers l&apos;ordonnance
          </button>
        </section>
      )}

      {step === 5 && (
        <section className="card space-y-4 text-center">
          <div className="text-4xl">💊</div>
          <h2 className="font-display text-xl font-semibold text-dark">
            Générer l&apos;ordonnance esthétique
          </h2>
          <p className="text-sm text-dark/60">
            Conseils personnalisés style prescription pharmacie, adaptés aux
            produits et au soin réalisé
          </p>
          <button
            type="button"
            onClick={() => void genererOrdonnance()}
            disabled={loading}
            className="btn-primary mx-auto"
          >
            {loading ? "Génération…" : "Générer les conseils"}
          </button>
        </section>
      )}

      {step === 6 && (
        <section className="space-y-4">
          {ordonnanceHtml ? (
            <div
              className="overflow-hidden rounded-xl border border-primary/20 bg-white shadow-card"
              dangerouslySetInnerHTML={{ __html: ordonnanceHtml }}
            />
          ) : (
            <div className="card">
              <pre className="whitespace-pre-wrap font-serif text-sm text-dark/80">
                {conseils}
              </pre>
            </div>
          )}

          <textarea
            value={conseils}
            onChange={(e) => setConseils(e.target.value)}
            rows={6}
            className="input-field resize-y font-serif text-sm"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                void fetch(`/api/seances/${seanceId}/prestation`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ conseils }),
                });
              }}
            >
              Enregistrer les modifications
            </button>
            <Link
              href={`/seances/${seanceId}`}
              className="btn-primary"
              onClick={() => router.refresh()}
            >
              Terminer — Envoyer à la cliente
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function StepPhotos({
  title,
  subtitle,
  photos,
  loading,
  onUpload,
  onSkip,
  onNext,
}: {
  title: string;
  subtitle: string;
  photos: Photo[];
  type: string;
  loading: boolean;
  onUpload: (file: File) => void;
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <section className="card space-y-4">
      <h2 className="font-display text-xl font-semibold text-dark">{title}</h2>
      <p className="text-xs text-dark/60">{subtitle}</p>

      <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-surface p-6 hover:border-primary/50">
        <span className="text-3xl">📷</span>
        <span className="mt-2 text-sm font-medium text-dark/70">
          Prendre ou choisir une photo
        </span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
          }}
        />
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-primary/10"
            >
              <Image
                src={p.url}
                alt={p.legende ?? "Photo séance"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="btn-primary"
        >
          {photos.length ? "Continuer" : "Suivant"}
        </button>
        <button type="button" onClick={onSkip} className="btn-secondary">
          Passer sans photo
        </button>
      </div>
    </section>
  );
}
