import { getParametre } from "./parametres";

export async function getGoogleReviewUrl(): Promise<string> {
  const fromDb = await getParametre("GOOGLE_REVIEW_URL");
  if (fromDb) return fromDb;
  return process.env.GOOGLE_REVIEW_URL ?? "";
}

export function buildReviewEmailHtml(opts: {
  prenom: string;
  reviewUrl: string;
  salonNom: string;
}): string {
  const { prenom, reviewUrl, salonNom } = opts;
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #121212;">
      <p style="color: #C9A77C; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">${salonNom}</p>
      <h1 style="font-size: 24px; font-weight: 600;">Merci ${prenom} ✨</h1>
      <p style="line-height: 1.6; color: #121212b3;">
        Nous espérons que votre séance vous a apporté détente et éclat.
        Votre avis compte énormément pour nous aider d'autres clientes à nous découvrir.
      </p>
      <p style="margin: 32px 0;">
        <a href="${reviewUrl}" style="background: #C9A77C; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Laisser un avis Google
        </a>
      </p>
      <p style="font-size: 13px; color: #12121280;">À très bientôt chez Bianco Esthétique, Hyères.</p>
    </div>
  `;
}
