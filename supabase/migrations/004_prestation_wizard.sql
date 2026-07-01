-- Migration 004 — wizard prestation, photos, produits
alter table seances
  add column if not exists etape_prestation integer not null default 0,
  add column if not exists started_at timestamptz;

alter table produits add column if not exists categorie text default 'Soin';
alter table produits add column if not exists description text;
alter table produits add column if not exists url_achat text;
alter table produits add column if not exists actif boolean default true;
alter table produits add column if not exists ordre integer default 0;

create table if not exists seance_photos (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references seances(id) on delete cascade,
  type text not null check (type in ('avant', 'apres', 'autre')),
  url text not null,
  legende text,
  created_at timestamptz not null default now()
);
create index if not exists seance_photos_seance_idx on seance_photos (seance_id);

create table if not exists seance_produits (
  id uuid primary key default gen_random_uuid(),
  seance_id uuid not null references seances(id) on delete cascade,
  produit_id uuid references produits(id) on delete set null,
  nom text not null,
  marque text,
  url_achat text,
  note_usage text,
  created_at timestamptz not null default now()
);
create index if not exists seance_produits_seance_idx on seance_produits (seance_id);

-- Catalogue produits exemple
insert into produits (nom, marque, categorie, description, url_achat, ordre)
select * from (values
  ('Huile démaquillante', 'Biologique Recherche', 'Visage', 'Nettoyage en cabine', null::text, 1),
  ('Crème hydratante HA', 'Filorga', 'Visage', 'Hydratation post-soin', null::text, 2),
  ('Huile corps drainante', 'Lipoceutical', 'Corps', 'Massage drainage', null::text, 3),
  ('Vernis semi-permanent', 'Manucurist', 'Onglerie', 'Pose ongles', 'https://www.manucurist.com', 4),
  ('Sérum cils', 'Revitalash', 'Regard', 'Entretien extensions', null::text, 5)
) as v(nom, marque, categorie, description, url_achat, ordre)
where not exists (select 1 from produits limit 1);

-- Bucket storage photos (à créer aussi dans Dashboard → Storage → New bucket → seance-photos, public)
