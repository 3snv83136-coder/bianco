import { getParametre } from "./parametres";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type PublishSiteInput = {
  titre: string;
  extrait: string;
  contenu: string;
  categorie?: string;
  photoUrl?: string | null;
  slug?: string;
};

export type PublishSiteResult = {
  slug: string;
  url: string;
};

/**
 * Publie un article « Conseils Bien-être » sur bianco-esthetique.fr
 * via l'API de publication (webhook ou CMS).
 */
export async function publishToSite(
  input: PublishSiteInput,
): Promise<PublishSiteResult> {
  const apiUrl = process.env.BIANCO_PUBLISH_API_URL?.trim();
  const token = process.env.BIANCO_PUBLISH_TOKEN?.trim();
  const siteUrl = (await getParametre("SITE_URL")).replace(/\/$/, "");

  if (!apiUrl || !token) {
    throw new Error(
      "Publication site non configurée (BIANCO_PUBLISH_API_URL / BIANCO_PUBLISH_TOKEN)",
    );
  }

  const slug =
    input.slug ||
    `${slugify(input.titre)}-${new Date().toISOString().slice(0, 10)}`;

  const payload = {
    title: input.titre,
    slug,
    excerpt: input.extrait,
    content: input.contenu,
    category: input.categorie ?? "conseils-bien-etre",
    image_url: input.photoUrl ?? null,
    published: true,
    author: "Salomé — Bianco Esthétique",
    location: "Hyères",
  };

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Publication site échouée (HTTP ${res.status}) : ${text.slice(0, 300)}`,
    );
  }

  const json = (await res.json().catch(() => ({}))) as {
    slug?: string;
    url?: string;
  };

  const finalSlug = json.slug ?? slug;
  return {
    slug: finalSlug,
    url: json.url ?? `${siteUrl}/blog/${finalSlug}`,
  };
}

export function buildSiteArticleFromSeance(opts: {
  prestationNoms: string[];
  conseils: string;
  realise?: string;
}): PublishSiteInput {
  const prestation =
    opts.prestationNoms[0] ?? "Soin bien-être";
  const titre = `Conseils après votre ${prestation.toLowerCase()} — Bianco Hyères`;
  const extrait =
    opts.conseils.split("\n").find((l) => l.trim())?.slice(0, 160) ??
    "Les conseils de Salomé pour prolonger les bienfaits de votre séance à l'institut Bianco Esthétique, Hyères.";

  const contenu = [
    "## Prolonger les bienfaits de votre séance",
    "",
    opts.conseils.trim(),
    "",
    "---",
    "",
    "*Ces conseils sont donnés à titre indicatif. Pour un suivi personnalisé, prenez rendez-vous chez Bianco Esthétique, 3 Avenue Ernest Millet, Hyères.*",
    "",
    `[Réserver sur Planity](https://www.planity.com/bianco-esthetique-83400-hyeres)`,
  ].join("\n");

  return {
    titre,
    extrait,
    contenu,
    categorie: "conseils-bien-etre",
  };
}
