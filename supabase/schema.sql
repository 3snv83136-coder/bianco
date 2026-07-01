-- =====================================================================
-- BIANCO CRM — Schéma Supabase (idempotent)
-- Institut de beauté Bianco Esthétique — Hyères
-- Ré-exécutable sans erreur si des tables existent déjà.
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- PARAMÈTRES SALON
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
  ('PLANITY_URL', 'https://www.planity.com/bianco-esthetique-83400-hyeres'),
  ('SITE_URL', 'https://www.bianco-esthetique.fr'),
  ('GMB_CLIENT_ID', ''),
  ('GMB_CLIENT_SECRET', ''),
  ('GMB_REDIRECT_URI', ''),
  ('GMB_LOCATION', '')
on conflict (cle) do nothing;

-- =====================================================================
-- CLIENTES
-- =====================================================================
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  prenom text not null default '',
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

-- Migration : table clients déjà existante (ex. ancien schéma LTDB avec seulement "nom")
alter table clients add column if not exists prenom text;
alter table clients add column if not exists nom text;
alter table clients add column if not exists email text;
alter table clients add column if not exists telephone text;
alter table clients add column if not exists date_naissance date;
alter table clients add column if not exists notes_peau text;
alter table clients add column if not exists allergies text;
alter table clients add column if not exists consentements text;
alter table clients add column if not exists notes text;
alter table clients add column if not exists created_at timestamptz not null default now();
alter table clients add column if not exists updated_at timestamptz not null default now();

-- Si ancienne table avec "nom" obligatoire mais sans "prenom" rempli
update clients set prenom = nom where (prenom is null or prenom = '') and nom is not null;

create index if not exists clients_nom_idx on clients (nom, prenom);
create index if not exists clients_email_idx on clients (email);
create index if not exists clients_telephone_idx on clients (telephone);

-- =====================================================================
-- PRESTATIONS
-- =====================================================================
create table if not exists prestations (
  id uuid primary key default gen_random_uuid(),
  nom text not null default '',
  categorie text not null default 'Autre',
  description text,
  duree_min integer,
  prix_ttc numeric(10,2),
  actif boolean not null default true,
  ordre integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table prestations add column if not exists nom text;
alter table prestations add column if not exists categorie text default 'Autre';
alter table prestations add column if not exists description text;
alter table prestations add column if not exists duree_min integer;
alter table prestations add column if not exists prix_ttc numeric(10,2);
alter table prestations add column if not exists actif boolean default true;
alter table prestations add column if not exists ordre integer default 0;
alter table prestations add column if not exists created_at timestamptz default now();
alter table prestations add column if not exists updated_at timestamptz default now();

create index if not exists prestations_categorie_idx on prestations (categorie);
create index if not exists prestations_actif_idx on prestations (actif);

-- Catalogue initial (uniquement si vide)
insert into prestations (nom, categorie, description, duree_min, prix_ttc, ordre)
select * from (values
  ('Drainage lymphatique — Jambes', 'Drainage', 'Méthode brésilienne', 60, 85.00::numeric, 1),
  ('Drainage lymphatique — Corps entier', 'Drainage', 'Méthode brésilienne', 90, 115.00::numeric, 2),
  ('Soin visage fondamental', 'Visage', 'Soin sur-mesure', 60, 63.00::numeric, 10),
  ('Soin visage éclat', 'Visage', 'Réveil du teint', 45, 53.00::numeric, 11),
  ('Soin visage intensif hydratant', 'Visage', 'Traitement intensif', 75, 92.00::numeric, 12),
  ('Head Spa japonais', 'Head Spa', 'Rituel cuir chevelu & nuque', 60, null::numeric, 20),
  ('Extensions cils — Cil à cil', 'Regard', 'Pose naturelle', 120, 70.00::numeric, 30),
  ('Extensions cils — Volume mixte', 'Regard', 'Volume russe / mixte', 120, 80.00::numeric, 31),
  ('Massage californien — 45 min', 'Massage', 'Détente profonde', 45, 40.00::numeric, 40),
  ('Massage californien — 1h', 'Massage', 'Détente profonde', 60, 80.00::numeric, 41),
  ('Semi-permanent mains', 'Onglerie', 'Vernis semi-permanent', 45, 28.00::numeric, 50),
  ('Soin corps signature Indonésie', 'Corps', 'Gommage & modelage', 90, 90.00::numeric, 60)
) as v(nom, categorie, description, duree_min, prix_ttc, ordre)
where not exists (select 1 from prestations limit 1);

-- =====================================================================
-- SÉANCES
-- =====================================================================
create table if not exists seances (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  client_id uuid references clients(id) on delete set null,
  date_seance date not null default current_date,
  heure_debut time,
  duree_min integer,
  statut text not null default 'planifiee',
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

alter table seances add column if not exists reference text;
alter table seances add column if not exists client_id uuid;
alter table seances add column if not exists date_seance date default current_date;
alter table seances add column if not exists heure_debut time;
alter table seances add column if not exists duree_min integer;
alter table seances add column if not exists statut text default 'planifiee';
alter table seances add column if not exists notes_internes text;
alter table seances add column if not exists mail_envoye_at timestamptz;
alter table seances add column if not exists avis_demande_at timestamptz;
alter table seances add column if not exists avis_recu boolean default false;
alter table seances add column if not exists avis_relance_ids text[];
alter table seances add column if not exists publie_slug text;
alter table seances add column if not exists publie_at timestamptz;
alter table seances add column if not exists gmb_post_at timestamptz;
alter table seances add column if not exists gmb_post_url text;
alter table seances add column if not exists photo_url text;
alter table seances add column if not exists publish_json jsonb;
alter table seances add column if not exists created_at timestamptz default now();
alter table seances add column if not exists updated_at timestamptz default now();

create index if not exists seances_date_idx on seances (date_seance);
create index if not exists seances_client_idx on seances (client_id);
create index if not exists seances_statut_idx on seances (statut);

-- =====================================================================
-- PRESTATIONS RÉALISÉES
-- =====================================================================
create table if not exists seance_prestations (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references seances(id) on delete cascade,
  prestation_id uuid references prestations(id) on delete set null,
  nom text not null default '',
  prix_ttc numeric(10,2),
  duree_min integer,
  created_at timestamptz not null default now()
);

alter table seance_prestations add column if not exists nom text;
alter table seance_prestations add column if not exists prix_ttc numeric(10,2);
alter table seance_prestations add column if not exists duree_min integer;

create index if not exists seance_prestations_seance_idx on seance_prestations (seance_id);

-- =====================================================================
-- MÉMORANDUMS
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

alter table memorandums add column if not exists realise text default '';
alter table memorandums add column if not exists conseils text default '';
alter table memorandums add column if not exists realise_json jsonb;
alter table memorandums add column if not exists conseils_json jsonb;
alter table memorandums add column if not exists pdf_url text;
alter table memorandums add column if not exists envoye_at timestamptz;

create index if not exists memorandums_seance_idx on memorandums (seance_id);

-- =====================================================================
-- DOCUMENTS
-- =====================================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid references seances(id) on delete set null,
  client_id uuid references clients(id) on delete set null,
  type text not null default 'memorandum',
  statut text not null default 'brouillon',
  payload jsonb,
  pdf_url text,
  created_at timestamptz not null default now()
);

alter table documents add column if not exists seance_id uuid;
alter table documents add column if not exists client_id uuid;
alter table documents add column if not exists type text default 'memorandum';
alter table documents add column if not exists statut text default 'brouillon';
alter table documents add column if not exists payload jsonb;
alter table documents add column if not exists pdf_url text;

-- =====================================================================
-- FORFAITS & PRODUITS (évolution future)
-- =====================================================================
create table if not exists forfaits (
  id uuid primary key default gen_random_uuid(),
  nom text not null default '',
  description text,
  nb_seances integer not null default 1,
  prix_ttc numeric(10,2),
  prestation_id uuid references prestations(id) on delete set null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists produits (
  id uuid primary key default gen_random_uuid(),
  nom text not null default '',
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
