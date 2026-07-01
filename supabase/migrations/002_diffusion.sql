-- Migration 002 — diffusion (mail, site, Google Business)
alter table seances
  add column if not exists publie_slug text,
  add column if not exists publie_at timestamptz,
  add column if not exists gmb_post_at timestamptz,
  add column if not exists gmb_post_url text,
  add column if not exists photo_url text,
  add column if not exists publish_json jsonb;

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
