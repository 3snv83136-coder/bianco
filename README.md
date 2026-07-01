# Bianco CRM

CRM pour **Bianco Esthétique** (Hyères) — prestations, mémorandums de séance, diffusion mail / site / Google Business.

## Stack

- Next.js 14 · TypeScript · Tailwind CSS
- Supabase (PostgreSQL)
- Resend (emails)
- Google Business Profile API

## Démarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase

Exécuter dans le SQL Editor :

1. `supabase/schema.sql`
2. `supabase/migrations/002_diffusion.sql` (si base déjà créée)

## Modules

| Module | Description |
|--------|-------------|
| Prestations | Catalogue des soins |
| Clientes | Fiches clientes |
| Séances | Mémorandum (réalisé / conseils) |
| Diffusion | Mail, publication site, post GMB, avis Google |

## Diffusion

Depuis chaque **fiche séance** :

- **Mail** — compte-rendu personnalisé à la cliente (Resend)
- **Site** — article « Conseils Bien-être » sur [bianco-esthetique.fr](https://www.bianco-esthetique.fr)
- **Google Business** — post local sur la fiche institut
- **Avis Google** — demande + relances J+2, J+4, J+6

### Configuration site

```
BIANCO_PUBLISH_API_URL=https://…
BIANCO_PUBLISH_TOKEN=…
```

### Configuration GMB

1. Créer un projet Google Cloud + activer Business Profile API
2. Paramètres → connecter via « Connecter Google Business »
3. Renseigner `GMB_LOCATION` (format `accounts/…/locations/…`)

## Charte

Palette extraite de [bianco-esthetique.fr](https://www.bianco-esthetique.fr) :

- Primary `#C9A77C`
- Dark `#121212`
- Surface `#FCFBFA`

Logo : placer `public/logo.png` et activer dans `components/Logo.tsx`.
