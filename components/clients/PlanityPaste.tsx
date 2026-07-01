"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  isPlanityParseValid,
  parsePlanityText,
  type PlanityParsed,
} from "@/lib/parse-planity";

export function PlanityPaste() {
  const router = useRouter();
  const zoneRef = useRef<HTMLDivElement>(null);
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<PlanityParsed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const applyText = useCallback((text: string) => {
    const trimmed = text.trim();
    setRaw(trimmed);
    setError(null);
    setSuccess(null);
    if (!trimmed) {
      setParsed(null);
      return;
    }
    const result = parsePlanityText(trimmed);
    setParsed(isPlanityParseValid(result) ? result : null);
    if (!isPlanityParseValid(result)) {
      setError("Impossible de lire la fiche — vérifiez nom, tél. ou email");
    }
  }, []);

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text/plain");
    if (text.trim()) {
      e.preventDefault();
      applyText(text);
    }
  }

  async function handleCreate() {
    const prenom = parsed?.prenom || (parsed?.telephone ? "Cliente" : "");

    if (!prenom) {
      setError("Collez une fiche avec au moins un nom ou un téléphone");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom,
        nom: parsed?.nom ?? "",
        email: parsed?.email ?? "",
        telephone: parsed?.telephone ?? "",
        notes: parsed?.notes
          ? `Import Planity :\n${parsed.notes}`
          : raw
            ? `Import Planity :\n${raw}`
            : "Import Planity",
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur création");
      return;
    }

    const created = (await res.json()) as { prenom: string; nom: string | null };
    setSuccess(
      `Fiche créée : ${[created.prenom, created.nom].filter(Boolean).join(" ")}`,
    );
    setRaw("");
    setParsed(null);
    router.refresh();
  }

  function reset() {
    setRaw("");
    setParsed(null);
    setError(null);
    setSuccess(null);
  }

  const isEmpty = !raw && !parsed;

  return (
    <section className="card border-2 border-dashed border-primary/25 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-dark">
            Importer depuis Planity
          </h2>
          <p className="mt-1 text-xs text-dark/60">
            Copiez la fiche cliente sur Planity, puis collez-la ici (Ctrl+V /
            Cmd+V)
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
          Planity
        </span>
      </div>

      <div
        ref={zoneRef}
        tabIndex={0}
        role="textbox"
        aria-label="Zone de collage Planity"
        onPaste={handlePaste}
        onClick={() => zoneRef.current?.focus()}
        className={`mt-4 min-h-[140px] rounded-xl border-2 border-dashed transition-colors ${
          isEmpty
            ? "border-primary/20 bg-surface hover:border-primary/40"
            : "border-primary/30 bg-primary/5"
        } flex cursor-text flex-col items-center justify-center p-6 text-center focus:outline-none focus:ring-2 focus:ring-primary/30`}
      >
        {isEmpty ? (
          <>
            <span className="text-3xl opacity-40">📋</span>
            <p className="mt-3 text-sm font-medium text-dark/70">
              Container vide — cliquez et collez
            </p>
            <p className="mt-1 text-xs text-dark/45">
              Nom, téléphone, email détectés automatiquement
            </p>
          </>
        ) : (
          <textarea
            value={raw}
            onChange={(e) => applyText(e.target.value)}
            onPaste={handlePaste}
            rows={5}
            className="w-full resize-none bg-transparent text-left text-sm text-dark/80 focus:outline-none"
            placeholder="Texte collé depuis Planity…"
          />
        )}
      </div>

      {parsed && (
        <div className="mt-4 rounded-xl border border-primary/15 bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Aperçu détecté
          </p>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-dark/50">Prénom</dt>
              <dd className="font-medium text-dark">
                {parsed.prenom || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-dark/50">Nom</dt>
              <dd className="font-medium text-dark">{parsed.nom || "—"}</dd>
            </div>
            <div>
              <dt className="text-dark/50">Téléphone</dt>
              <dd className="font-medium text-dark">
                {parsed.telephone || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-dark/50">Email</dt>
              <dd className="font-medium text-dark break-all">
                {parsed.email || "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
          {success}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={loading || !parsed || !isPlanityParseValid(parsed)}
          className="btn-primary"
        >
          {loading ? "Création…" : "Créer la fiche cliente"}
        </button>
        {(raw || parsed) && (
          <button type="button" onClick={reset} className="btn-secondary">
            Vider
          </button>
        )}
      </div>
    </section>
  );
}
