"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LancerSeanceButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function lancer() {
    setLoading(true);
    const res = await fetch("/api/seances/demarrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId }),
    });
    setLoading(false);

    if (!res.ok) return;

    const data = (await res.json()) as { id: string };
    router.push(`/seances/${data.id}/prestation`);
  }

  return (
    <button
      type="button"
      onClick={() => void lancer()}
      disabled={loading}
      className="btn-primary shrink-0 text-sm"
      title={`Lancer une séance pour ${clientName}`}
    >
      {loading ? "…" : "▶ Lancer la séance"}
    </button>
  );
}

export function ReprendreSeanceButton({ seanceId }: { seanceId: string }) {
  return (
    <Link href={`/seances/${seanceId}/prestation`} className="btn-primary text-sm">
      ▶ Reprendre la séance
    </Link>
  );
}
