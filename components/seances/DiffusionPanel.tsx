"use client";

import { useState } from "react";

type Props = {
  seanceId: string;
  clientEmail: string | null;
  clientPrenom: string;
  mailEnvoye: boolean;
  publieAt: string | null;
  publieSlug: string | null;
  gmbPostAt: string | null;
  avisDemande: boolean;
  hasConseils: boolean;
  hasRealise: boolean;
  siteUrl: string;
};

type Busy = "mail" | "site" | "gmb" | "avis" | null;

export function DiffusionPanel({
  seanceId,
  clientEmail,
  clientPrenom,
  mailEnvoye,
  publieAt,
  publieSlug,
  gmbPostAt,
  avisDemande,
  hasConseils,
  hasRealise,
  siteUrl,
}: Props) {
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(
    action: Busy,
    url: string,
    method = "POST",
    body?: Record<string, string>,
  ) {
    setBusy(action);
    setError(null);
    setMessage(null);

    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    setBusy(null);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur");
      return null;
    }

    return res.json() as Promise<Record<string, unknown>>;
  }

  async function sendMail() {
    if (!clientEmail) {
      setError("Email cliente manquant");
      return;
    }
    await run("mail", `/api/seances/${seanceId}/envoyer`);
    setMessage(`Compte-rendu envoyé à ${clientPrenom}`);
  }

  async function publishSite() {
    const data = await run("site", `/api/seances/${seanceId}/publier-site`);
    if (data?.url) setMessage(`Article publié : ${String(data.url)}`);
  }

  async function publishGmb() {
    const data = await run("gmb", "/api/publish-gmb", "POST", { seanceId });
    if (data?.ok) setMessage("Post Google Business publié");
  }

  async function sendAvis() {
    if (!clientEmail) {
      setError("Email cliente manquant");
      return;
    }
    await run("avis", `/api/seances/${seanceId}/avis`);
    setMessage(`Demande d'avis envoyée à ${clientPrenom}`);
  }

  const articleUrl = publieSlug
    ? `${siteUrl.replace(/\/$/, "")}/blog/${publieSlug}`
    : null;

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="font-display text-lg font-semibold text-dark">
          Diffusion
        </h3>
        <p className="mt-1 text-xs text-dark/60">
          Envoi mail, publication site & Google Business
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {mailEnvoye && (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
            Mail envoyé
          </span>
        )}
        {publieAt && (
          <span className="rounded-full bg-green-50 px-2 py-1 text-green-700">
            Site publié
          </span>
        )}
        {gmbPostAt && (
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">
            GMB publié
          </span>
        )}
        {avisDemande && (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-800">
            Avis demandé
          </span>
        )}
      </div>

      {articleUrl && (
        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-primary underline"
        >
          Voir l&apos;article sur le site
        </a>
      )}

      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => void sendMail()}
          disabled={busy !== null || mailEnvoye || !hasRealise || !clientEmail}
          className="btn-primary w-full"
        >
          {busy === "mail" ? "Envoi…" : mailEnvoye ? "✓ Mail envoyé" : "📧 Envoyer par mail"}
        </button>

        <button
          type="button"
          onClick={() => void publishSite()}
          disabled={busy !== null || !!publieAt || !hasConseils}
          className="btn-secondary w-full"
        >
          {busy === "site"
            ? "Publication…"
            : publieAt
              ? "✓ Publié sur le site"
              : "🌐 Publier sur le site"}
        </button>

        <button
          type="button"
          onClick={() => void publishGmb()}
          disabled={busy !== null || !!gmbPostAt}
          className="btn-secondary w-full"
        >
          {busy === "gmb"
            ? "Publication…"
            : gmbPostAt
              ? "✓ Post Google Business"
              : "📍 Publier sur Google Business"}
        </button>

        <button
          type="button"
          onClick={() => void sendAvis()}
          disabled={busy !== null || avisDemande || !clientEmail}
          className="btn-secondary w-full"
        >
          {busy === "avis"
            ? "Envoi…"
            : avisDemande
              ? "✓ Avis déjà demandé"
              : "⭐ Demander un avis Google"}
        </button>
      </div>
    </div>
  );
}
