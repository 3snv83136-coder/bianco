import { google } from "googleapis";
import { getParametre } from "./parametres";
import { getSupabase } from "./supabase";

const SCOPES = ["https://www.googleapis.com/auth/business.manage"];
const PLATFORM = "gmb";

type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

async function buildOAuthClient(): Promise<OAuth2Client> {
  const clientId =
    (await getParametre("GMB_CLIENT_ID")) || process.env.GMB_CLIENT_ID || "";
  const clientSecret =
    (await getParametre("GMB_CLIENT_SECRET")) ||
    process.env.GMB_CLIENT_SECRET ||
    "";
  const redirectUri =
    (await getParametre("GMB_REDIRECT_URI")) ||
    process.env.GMB_REDIRECT_URI ||
    "";

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "OAuth GMB non configuré (GMB_CLIENT_ID / GMB_CLIENT_SECRET / GMB_REDIRECT_URI)",
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export async function getGmbAuthUrl(): Promise<string> {
  const oauth = await buildOAuthClient();
  return oauth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    include_granted_scopes: true,
  });
}

export async function exchangeGmbCodeAndStore(
  code: string,
): Promise<{ email?: string }> {
  const oauth = await buildOAuthClient();
  const { tokens } = await oauth.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      "Refresh token absent — révoquez l'accès sur myaccount.google.com/permissions puis reconnectez.",
    );
  }

  let email: string | undefined;
  if (tokens.id_token) {
    try {
      const payload = JSON.parse(
        Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(),
      );
      email = payload?.email;
    } catch {
      /* ignore */
    }
  }

  const sb = getSupabase();
  const { error } = await sb.from("social_tokens").upsert(
    {
      platform: PLATFORM,
      account_email: email || null,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token || null,
      expires_at: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      scope: tokens.scope || SCOPES.join(" "),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "platform" },
  );

  if (error) throw new Error(`DB social_tokens: ${error.message}`);
  return { email };
}

async function getAuthenticatedClient(): Promise<OAuth2Client> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("social_tokens")
    .select("refresh_token")
    .eq("platform", PLATFORM)
    .maybeSingle();

  if (error) throw new Error(`DB social_tokens: ${error.message}`);
  if (!data?.refresh_token) {
    throw new Error(
      "Aucun compte Google Business connecté — utilisez /api/oauth/gmb",
    );
  }

  const oauth = await buildOAuthClient();
  oauth.setCredentials({ refresh_token: data.refresh_token });
  return oauth;
}

async function getAccessToken(): Promise<string> {
  const { token } = await (await getAuthenticatedClient()).getAccessToken();
  if (!token) throw new Error("Impossible d'obtenir un access token GMB");
  return token;
}

export type GmbLocation = {
  account: string;
  accountName: string;
  location: string;
  title: string;
  address: string | null;
};

export async function listGmbLocations(): Promise<GmbLocation[]> {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  const accRes = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers },
  );
  if (!accRes.ok) {
    throw new Error(
      `API comptes GMB : HTTP ${accRes.status} — ${(await accRes.text()).slice(0, 300)}`,
    );
  }

  const accJson = (await accRes.json()) as {
    accounts?: Array<{ name: string; accountName?: string }>;
  };

  const out: GmbLocation[] = [];
  const readMask = encodeURIComponent("name,title,storefrontAddress");

  for (const acc of accJson.accounts ?? []) {
    const locRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations?readMask=${readMask}&pageSize=100`,
      { headers },
    );
    if (!locRes.ok) continue;

    const locJson = (await locRes.json()) as {
      locations?: Array<{
        name: string;
        title?: string;
        storefrontAddress?: { addressLines?: string[]; locality?: string };
      }>;
    };

    for (const loc of locJson.locations ?? []) {
      const a = loc.storefrontAddress;
      out.push({
        account: acc.name,
        accountName: acc.accountName || acc.name,
        location: loc.name,
        title: loc.title || "(sans nom)",
        address: a
          ? [...(a.addressLines ?? []), a.locality].filter(Boolean).join(", ") ||
            null
          : null,
      });
    }
  }

  return out;
}

export type GmbPostInput = {
  summary: string;
  photoUrl?: string | null;
  ctaUrl?: string | null;
};

export async function createGmbPost(
  input: GmbPostInput,
): Promise<{ name: string; searchUrl: string | null }> {
  const location = (await getParametre("GMB_LOCATION")).trim();
  if (!location) {
    throw new Error(
      "GMB_LOCATION non défini — récupérez la fiche via /api/gmb/locations",
    );
  }

  const summary = input.summary.trim().slice(0, 1490);
  if (!summary) throw new Error("Le texte du post est vide");

  const token = await getAccessToken();
  const body: Record<string, unknown> = {
    languageCode: "fr",
    summary,
    topicType: "STANDARD",
  };

  if (input.ctaUrl) {
    body.callToAction = { actionType: "LEARN_MORE", url: input.ctaUrl };
  }
  if (input.photoUrl) {
    body.media = [{ mediaFormat: "PHOTO", sourceUrl: input.photoUrl }];
  }

  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${location}/localPosts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    throw new Error(
      `Création post GMB : HTTP ${res.status} — ${(await res.text()).slice(0, 400)}`,
    );
  }

  const json = (await res.json()) as { name?: string; searchUrl?: string };
  return { name: json.name || "", searchUrl: json.searchUrl || null };
}

export function buildGmbPostFromSeance(opts: {
  prestationNoms: string[];
  conseils: string;
  siteUrl?: string;
  articleUrl?: string | null;
}): GmbPostInput {
  const prestation = opts.prestationNoms[0] ?? "Soin bien-être";
  const resume =
    opts.conseils.split("\n").find((l) => l.trim())?.slice(0, 200) ??
    "Une parenthèse de bien-être chez Bianco Esthétique à Hyères.";

  const summary = [
    `${prestation} — Bianco Esthétique, Hyères`,
    "",
    resume,
  ].join("\n");

  const ctaUrl =
    opts.articleUrl ??
    opts.siteUrl ??
    "https://www.bianco-esthetique.fr";

  return { summary, ctaUrl };
}
