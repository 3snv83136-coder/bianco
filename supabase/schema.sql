-- =====================================================================
-- BIANCO CRM — Schéma Supabase
-- Institut de beauté Bianco Esthétique — Hyères
-- À exécuter dans : Supabase Dashboard → SQL Editor → New query → Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- PARAMÈTRES SALON (téléphone, URL avis Google, etc.)
-- =====================================================================
create table if not exists parametres (
  cle text primary key,
  valeur text not null,
  updated_at timestamptz not null default now()
);

insert into parametres (cle, valeur) values
  ('NOM_SALON', 'Bianco Esthétique'),
  ('ADRESSE', '3 Avenue Ernest Millet'),
  ('CODE_POSTAL', '83400'),
  ('VILLE', 'Hyères'),
  ('TEL_PRINCIPAL', '0749967691'),
  ('EMAIL_SALON', 'contact@bianco-esthetique.fr'),
  ('GOOGLE_REVIEW_URL', ''),
  ('PLANITY_URL', 'https://www.planity.com/bianco-esthetique-83400-hyeres')
on conflict (cle) do nothing;

-- =====================================================================
-- CLIENTES
-- =====================================================================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  nom text,
  email text,
  telephone text,
  date_naissance date,
  notes_peau text,
  allergies text,
  consentements text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists clients_nom_idx on clients (nom, prenom);
create index if not exists clients_email_idx on clients (email);
create index if not exists clients_telephone_idx on clients (telephone);

-- =====================================================================
-- PRESTATIONS — catalogue des soins
-- =====================================================================
create table if not exists prestations (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  categorie text not null,
  description text,
  duree_min integer,
  prix_ttc numeric(10,2),
  actif boolean not null default true,
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prestations_categorie_idx on prestations (categorie);
create index if not exists prestations_actif_idx on prestations (actif);

-- Catalogue initial Bianco (prix indicatifs — à ajuster dans l'app)
insert into prestations (nom, categorie, description, duree_min, prix_ttc, ordre) values
  ('Drainage lymphatique — Jambes', 'Drainage', 'Méthode brésilienne', 60, 85.00, 1),
  ('Drainage lymphatique — Corps entier', 'Drainage', 'Méthode brésilienne', 90, 115.00, 2),
  ('Soin visage fondamental', 'Visage', 'Soin sur-mesure', 60, 63.00, 10),
  ('Soin visage éclat', 'Visage', 'Réveil du teint', 45, 53.00, 11),
  ('Soin visage intensif hydratant', 'Visage', 'Traitement intensif', 75, 92.00, 12),
  ('Head Spa japonais', 'Head Spa', 'Rituel cuir chevelu & nuque', 60, null, 20),
  ('Extensions cils — Cil à cil', 'Regard', 'Pose naturelle', 120, 70.00, 30),
  ('Extensions cils — Volume mixte', 'Regard', 'Volume russe / mixte', 120, 80.00, 31),
  ('Massage californien — 45 min', 'Massage', 'Détente profonde', 45, 40.00, 40),
  ('Massage californien — 1h', 'Massage', 'Détente profonde', 60, 80.00, 41),
  ('Semi-permanent mains', 'Onglerie', 'Vernis semi-permanent', 45, 28.00, 50),
  ('Soin corps signature Indonésie', 'Corps', 'Gommage & modelage', 90, 90.00, 60)
on conflict do nothing;

-- =====================================================================
-- SÉANCES — entité centrale (RDV → mémorandum → envoi)
-- =====================================================================
create table if not exists seances (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  client_id uuid references clients(id) on delete set null,
  date_seance date not null default current_date,
  heure_debut time,
  duree_min integer,
  statut text not null default 'planifiee'
    check (statut in ('planifiee', 'en_cours', 'terminee', 'annulee')),
  notes_internes text,
  mail_envoye_at timestamptz,
  avis_demande_at timestamptz,
  avis_recu boolean not null default false,
  avis_relance_ids text[],
  publie_slug text,
  publie_at timestamptz,
  gmb_post_at timestamptz,
  gmb_post_url text,
  photo_url text,
  publish_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists seances_date_idx on seances (date_seance);
create index if not exists seances_client_idx on seances (client_id);
create index if not exists seances_statut_idx on seances (statut);

-- =====================================================================
-- PRESTATIONS RÉALISÉES lors d'une séance
-- =====================================================================
create table if not exists seance_prestations (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references seances(id) on delete cascade,
  prestation_id uuid references prestations(id) on delete set null,
  nom text not null,
  prix_ttc numeric(10,2),
  duree_min integer,
  created_at timestamptz not null default now()
);
create index if not exists seance_prestations_seance_idx on seance_prestations (seance_id);

-- =====================================================================
-- MÉMORANDUM — compte-rendu séance (réalisé vs conseils)
-- =====================================================================
create table if not exists memorandums (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null unique references seances(id) on delete cascade,
  realise text not null default '',
  conseils text not null default '',
  realise_json jsonb,
  conseils_json jsonb,
  pdf_url text,
  envoye_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists memorandums_seance_idx on memorandums (seance_id);

-- =====================================================================
-- DOCUMENTS envoyés aux clientes
-- =====================================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid references seances(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  type text not null check (type in ('memorandum', 'avis')),
  statut text not null default 'brouillon'
    check (statut in ('brouillon', 'envoye', 'annule')),
  payload jsonb,
  pdf_url text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- FORFAITS (évolution future)
-- =====================================================================
create table if not exists forfaits (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  description text,
  nb_seances integer not null,
  prix_ttc numeric(10,2),
  prestation_id uuid references prestations(id) on delete set null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- PRODUITS utilisés en cabine (évolution future)
-- =====================================================================
create table if not exists produits (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  marque text,
  usage_cabine boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- TOKENS OAUTH (Google Business Profile)
-- =====================================================================
create table if not exists social_tokens (
  platform text primary key,
  account_email text,
  refresh_token text not null,
  access_token text,
  expires_at timestamptz,
  scope text,
  updated_at timestamptz not null default now()
);

insert into parametres (cle, valeur) values
  ('SITE_URL', 'https://www.bianco-esthetique.fr'),
  ('GMB_CLIENT_ID', ''),
  ('GMB_CLIENT_SECRET', ''),
  ('GMB_REDIRECT_URI', ''),
  ('GMB_LOCATION', '')
on conflict (cle) do nothing;
