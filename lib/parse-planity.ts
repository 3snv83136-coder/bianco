export type PlanityParsed = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  notes: string;
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE =
  /(?:\+33|0033|0)\s*[1-9](?:[\s.\-]?\d{2}){4}|\d{10}/g;

const SKIP_LINE_RE =
  /planity|rendez[- ]?vous|rdv|prestation|soin|durée|duree|€|euro|hyères|hyeres|bianco|avenue|note[s]?\s*:/i;

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("33") && digits.length === 11) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }
  return raw.trim();
}

function splitName(full: string): { prenom: string; nom: string } {
  const cleaned = full
    .replace(/^(mme|mr|m\.|mme\.|madame|monsieur)\s+/i, "")
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { prenom: "", nom: "" };
  if (parts.length === 1) return { prenom: parts[0], nom: "" };

  return {
    prenom: parts.slice(0, -1).join(" "),
    nom: parts[parts.length - 1],
  };
}

function extractLabeledValue(line: string, labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(`^${label}\\s*[:\\-]\\s*(.+)$`, "i");
    const m = line.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

/**
 * Parse le texte copié depuis Planity (fiche cliente ou RDV).
 */
export function parsePlanityText(raw: string): PlanityParsed {
  const text = raw.trim();
  if (!text) {
    return { prenom: "", nom: "", email: "", telephone: "", notes: "" };
  }

  let email = "";
  const emailMatch = text.match(EMAIL_RE);
  if (emailMatch) email = emailMatch[0].toLowerCase();

  let telephone = "";
  const phones = text.match(PHONE_RE);
  if (phones?.length) {
    telephone = normalizePhone(phones[0]);
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let prenom = "";
  let nom = "";
  const noteLines: string[] = [];

  for (const line of lines) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line)) continue;
    if (SKIP_LINE_RE.test(line)) {
      noteLines.push(line);
      continue;
    }

    const nameFromLabel = extractLabeledValue(line, [
      "client",
      "cliente",
      "nom",
      "name",
      "prénom",
      "prenom",
    ]);
    if (nameFromLabel && !prenom) {
      const split = splitName(nameFromLabel);
      prenom = split.prenom;
      nom = split.nom;
      continue;
    }

    const telFromLabel = extractLabeledValue(line, [
      "tél",
      "tel",
      "téléphone",
      "telephone",
      "mobile",
      "portable",
    ]);
    if (telFromLabel && !telephone) {
      telephone = normalizePhone(telFromLabel);
      continue;
    }

    const emailFromLabel = extractLabeledValue(line, ["email", "e-mail", "mail"]);
    if (emailFromLabel && !email) {
      const m = emailFromLabel.match(EMAIL_RE);
      if (m) email = m[0].toLowerCase();
      continue;
    }

    // Ligne ressemblant à un nom (2+ lettres, pas que des chiffres)
    if (!prenom && /^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ\s'\-]{1,}$/.test(line)) {
      const split = splitName(line);
      if (split.prenom) {
        prenom = split.prenom;
        nom = split.nom;
        continue;
      }
    }

    noteLines.push(line);
  }

  // Fallback : première ligne non technique
  if (!prenom) {
    const firstNameLine = lines.find(
      (l) =>
        !EMAIL_RE.test(l) &&
        !/^\+?\d[\d\s.\-]{8,}$/.test(l) &&
        !SKIP_LINE_RE.test(l),
    );
    if (firstNameLine) {
      const split = splitName(firstNameLine);
      prenom = split.prenom;
      nom = split.nom;
    }
  }

  return {
    prenom,
    nom,
    email,
    telephone,
    notes: noteLines.join("\n"),
  };
}

export function isPlanityParseValid(parsed: PlanityParsed): boolean {
  return !!(parsed.prenom || parsed.telephone || parsed.email);
}
