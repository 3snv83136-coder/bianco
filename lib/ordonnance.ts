import { getParametre } from "./parametres";

export type OrdonnanceProduit = {
  nom: string;
  marque?: string | null;
  note?: string | null;
  urlAchat?: string | null;
};

export type OrdonnanceInput = {
  prenom: string;
  nom?: string | null;
  dateSeance: string;
  prestations: string[];
  realise: string;
  produits: OrdonnanceProduit[];
  allergies?: string | null;
};

export function generateConseilsText(input: OrdonnanceInput): string {
  const lines: string[] = [
    "PRESCRIPTION ESTHÉTIQUE — ENTRETIEN À DOMICILE",
    "",
    `Établie le ${input.dateSeance} pour ${input.prenom}${input.nom ? ` ${input.nom}` : ""}.`,
    "",
  ];

  if (input.prestations.length > 0) {
    lines.push("Soin(s) réalisé(s) en institut :");
    input.prestations.forEach((p) => lines.push(`  • ${p}`));
    lines.push("");
  }

  if (input.produits.length > 0) {
    lines.push("Produits appliqués en cabine :");
    input.produits.forEach((pr) => {
      const label = pr.marque ? `${pr.nom} (${pr.marque})` : pr.nom;
      lines.push(`  • ${label}${pr.note ? ` — ${pr.note}` : ""}`);
    });
    lines.push("");
  }

  lines.push("Recommandations personnalisées :");
  lines.push("");

  const conseils = buildConseilsFromContext(input);
  conseils.forEach((c, i) => lines.push(`${i + 1}. ${c}`));

  if (input.allergies?.trim()) {
    lines.push("");
    lines.push(`⚠ Allergies signalées : ${input.allergies.trim()}`);
  }

  lines.push("");
  lines.push(
    "Ces conseils complètent votre soin en institut. En cas de réaction, contactez votre esthéticienne.",
  );

  return lines.join("\n");
}

function buildConseilsFromContext(input: OrdonnanceInput): string[] {
  const tips: string[] = [];
  const cats = input.prestations.join(" ").toLowerCase();

  if (cats.includes("drainage") || cats.includes("corps")) {
    tips.push(
      "Buvez 1,5 à 2 litres d'eau dans les 24 h suivant le soin pour favoriser l'élimination.",
    );
    tips.push(
      "Évitez le sport intense et les sources de chaleur (sauna, hammam) pendant 24 à 48 h.",
    );
  }

  if (cats.includes("visage") || cats.includes("soin")) {
    tips.push(
      "Appliquez votre crème hydratante le soir en massage ascendant, sur peau propre.",
    );
    tips.push("Protégez votre peau avec un SPF 50 le lendemain si exposition solaire.");
  }

  if (cats.includes("cil") || cats.includes("regard")) {
    tips.push(
      "Ne mouillez pas vos cils pendant 24 h. Brossez-les délicatement chaque matin.",
    );
    tips.push("Évitez les huiles et démaquillants huileux sur la zone du regard.");
  }

  if (cats.includes("ongle") || cats.includes("manucure") || cats.includes("semi")) {
    tips.push(
      "Portez des gants pour les tâches ménagères les 48 premières heures.",
    );
    tips.push(
      "Hydratez vos cuticules quotidiennement avec une huile nourrissante.",
    );
  }

  if (input.produits.some((p) => p.urlAchat)) {
    tips.push(
      "Des produits utilisés aujourd'hui sont disponibles à l'achat — consultez les liens dans votre compte-rendu email.",
    );
  }

  if (tips.length < 3) {
    tips.push(
      "Accordez-vous une routine douce : nettoyage, hydratation, et sommeil réparateur.",
    );
    tips.push(
      "Prochaine séance recommandée dans 2 à 4 semaines selon votre protocole.",
    );
  }

  return tips.slice(0, 6);
}

export function buildOrdonnanceHtml(input: OrdonnanceInput): string {
  const conseils = generateConseilsText(input);
  const salon = "Bianco Esthétique";
  const adresse = "3 Avenue Ernest Millet, 83400 Hyères";

  const produitsHtml = input.produits
    .map((p) => {
      const label = p.marque ? `${p.nom} <em>(${p.marque})</em>` : p.nom;
      const link = p.urlAchat
        ? `<br><a href="${p.urlAchat}" style="color:#C9A77C;font-size:12px;">→ Acheter ce produit</a>`
        : "";
      return `<li style="margin-bottom:8px;">${label}${p.note ? ` — ${p.note}` : ""}${link}</li>`;
    })
    .join("");

  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; color: #121212; border: 1px solid #C9A77C40; padding: 32px; background: #FDFCFA;">
      <div style="text-align: center; border-bottom: 2px solid #C9A77C; padding-bottom: 16px; margin-bottom: 24px;">
        <p style="margin:0; font-size:11px; letter-spacing:0.25em; text-transform:uppercase; color:#C9A77C;">${salon}</p>
        <h1 style="margin:8px 0 0; font-size:20px; font-weight:600;">Ordonnance esthétique</h1>
        <p style="margin:4px 0 0; font-size:12px; color:#12121299;">${adresse}</p>
      </div>

      <p style="font-size:13px; color:#12121299;">
        <strong>Patient(e) :</strong> ${input.prenom}${input.nom ? ` ${input.nom}` : ""}<br>
        <strong>Date :</strong> ${input.dateSeance}
      </p>

      ${
        input.prestations.length
          ? `<p style="margin-top:16px;font-size:13px;"><strong>Soin(s) :</strong> ${input.prestations.join(", ")}</p>`
          : ""
      }

      ${
        input.produits.length
          ? `<div style="margin-top:20px; padding:16px; background:#fff; border-left:3px solid #C9A77C;">
        <p style="margin:0 0 8px; font-size:12px; text-transform:uppercase; letter-spacing:0.1em; color:#C9A77C;">Produits utilisés</p>
        <ul style="margin:0; padding-left:18px; font-size:14px; line-height:1.6;">${produitsHtml}</ul>
      </div>`
          : ""
      }

      <div style="margin-top:24px; padding:20px; background:#fff; border:1px dashed #12121230; border-radius:4px;">
        <p style="margin:0 0 12px; font-size:12px; text-transform:uppercase; letter-spacing:0.15em;">Prescription entretien</p>
        <pre style="margin:0; font-family: Georgia, serif; font-size:14px; line-height:1.7; white-space:pre-wrap;">${conseils.split("\n").slice(conseils.indexOf("Recommandations")).join("\n")}</pre>
      </div>

      <p style="margin-top:24px; font-size:11px; color:#12121266; text-align:center;">
        Document à visée conseil bien-être — ne remplace pas un avis médical.
      </p>
    </div>
  `;
}

export async function getSalonHeader(): Promise<{ nom: string; adresse: string }> {
  const nom = await getParametre("NOM_SALON");
  const adresse = `${await getParametre("ADRESSE")}, ${await getParametre("CODE_POSTAL")} ${await getParametre("VILLE")}`;
  return { nom, adresse };
}
