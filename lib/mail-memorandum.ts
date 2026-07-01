import { getParametre } from "./parametres";

export function buildMemorandumHtml(opts: {
  prenom: string;
  realise: string;
  conseils: string;
  salonNom: string;
  dateSeance: string;
}): string {
  const { prenom, realise, conseils, salonNom, dateSeance } = opts;
  return `
    <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; color: #121212;">
      <p style="color: #C9A77C; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">${salonNom}</p>
      <h1 style="font-size: 22px; font-weight: 600;">Votre compte-rendu de séance</h1>
      <p style="color: #12121280; font-size: 14px;">Bonjour ${prenom}, voici le récapitulatif de votre séance du ${dateSeance}.</p>

      <div style="margin: 28px 0; padding: 20px; background: #FCFBFA; border-left: 4px solid #C9A77C; border-radius: 8px;">
        <h2 style="font-size: 14px; color: #C9A77C; text-transform: uppercase; letter-spacing: 0.1em;">Ce qui a été fait</h2>
        <p style="line-height: 1.7; white-space: pre-wrap;">${escapeHtml(realise)}</p>
      </div>

      <div style="margin: 28px 0; padding: 20px; background: #f9f9f9; border-left: 4px solid #12121233; border-radius: 8px;">
        <h2 style="font-size: 14px; color: #121212; text-transform: uppercase; letter-spacing: 0.1em;">Vos conseils personnalisés</h2>
        <p style="line-height: 1.7; white-space: pre-wrap;">${escapeHtml(conseils)}</p>
      </div>

      <p style="font-size: 13px; color: #12121280;">À très bientôt chez Bianco Esthétique, 3 Avenue Ernest Millet, Hyères.</p>
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendMemorandumEmail(opts: {
  to: string;
  prenom: string;
  realise: string;
  conseils: string;
  dateSeance: string;
  htmlOverride?: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY non configurée");
  }

  const salonNom = await getParametre("NOM_SALON");
  const emailFrom =
    process.env.EMAIL_FROM ??
    "Bianco Esthétique <contact@bianco-esthetique.fr>";

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const html =
    opts.htmlOverride ??
    buildMemorandumHtml({
      prenom: opts.prenom,
      realise: opts.realise,
      conseils: opts.conseils,
      salonNom,
      dateSeance: opts.dateSeance,
    });

  const { error } = await resend.emails.send({
    from: emailFrom,
    to: opts.to,
    subject: `${salonNom} — Votre compte-rendu de séance`,
    html,
  });

  if (error) throw new Error(error.message);
}
