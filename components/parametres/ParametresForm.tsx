"use client";

import { useState } from "react";

export function ParametresForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [values, setValues] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fields = [
    { key: "NOM_SALON", label: "Nom du salon" },
    { key: "ADRESSE", label: "Adresse" },
    { key: "CODE_POSTAL", label: "Code postal" },
    { key: "VILLE", label: "Ville" },
    { key: "TEL_PRINCIPAL", label: "Téléphone principal" },
    { key: "EMAIL_SALON", label: "Email salon" },
    { key: "SITE_URL", label: "URL du site" },
    {
      key: "GOOGLE_REVIEW_URL",
      label: "URL avis Google",
      hint: "Lien direct vers la page d'avis Google Business",
    },
    { key: "PLANITY_URL", label: "URL Planity" },
    { key: "GMB_CLIENT_ID", label: "GMB Client ID" },
    { key: "GMB_CLIENT_SECRET", label: "GMB Client Secret" },
    { key: "GMB_REDIRECT_URI", label: "GMB Redirect URI" },
    {
      key: "GMB_LOCATION",
      label: "GMB Location",
      hint: "Format accounts/…/locations/… — via /api/gmb/locations",
    },
  ] as const;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/parametres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setLoading(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Erreur");
      return;
    }

    setMessage("Paramètres enregistrés");
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="card space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="label-field" htmlFor={f.key}>
            {f.label}
          </label>
          <input
            id={f.key}
            value={values[f.key] ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [f.key]: e.target.value }))
            }
            className="input-field"
          />
          {"hint" in f && f.hint && (
            <p className="mt-1 text-xs text-dark/50">{f.hint}</p>
          )}
        </div>
      ))}

      {message && <p className="text-sm text-primary">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <a href="/api/oauth/gmb" className="btn-secondary w-full text-center">
        Connecter Google Business
      </a>

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
