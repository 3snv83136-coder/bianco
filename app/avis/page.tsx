import { AppShell } from "@/components/AppShell";
import { getGoogleReviewUrl } from "@/lib/review";

export const dynamic = "force-dynamic";

export default async function AvisPage() {
  const reviewUrl = await getGoogleReviewUrl();

  return (
    <AppShell
      title="Avis Google"
      subtitle="Demandes d'avis et relances automatiques après chaque séance"
    >
      <div className="card max-w-xl">
        <h2 className="font-display text-lg font-semibold text-dark">
          Configuration
        </h2>
        <p className="mt-2 text-sm text-dark/70">
          Les demandes d&apos;avis sont envoyées depuis la fiche séance, avec
          relances planifiées à J+2, J+4 et J+6 (via Resend).
        </p>

        <div className="mt-4 rounded-lg bg-surface p-4 text-sm">
          <span className="font-semibold text-dark">URL avis Google :</span>
          {reviewUrl ? (
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block break-all text-primary underline"
            >
              {reviewUrl}
            </a>
          ) : (
            <p className="mt-1 text-dark/50">
              Non configurée — renseignez-la dans{" "}
              <a href="/parametres" className="text-primary underline">
                Paramètres
              </a>
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-dark/50">
          Bianco affiche actuellement une note 5/5 sur Google (24 avis) sur{" "}
          <a
            href="https://www.bianco-esthetique.fr/"
            className="text-primary underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            bianco-esthetique.fr
          </a>
        </p>
      </div>
    </AppShell>
  );
}
