-- Correctif rapide : colonne "nom" manquante sur clients
-- À exécuter si erreur 42703 sur clients.nom

alter table clients add column if not exists prenom text;
alter table clients add column if not exists nom text;
alter table clients add column if not exists email text;
alter table clients add column if not exists telephone text;
alter table clients add column if not exists date_naissance date;
alter table clients add column if not exists notes_peau text;
alter table clients add column if not exists allergies text;
alter table clients add column if not exists consentements text;
alter table clients add column if not exists notes text;

-- Copier l'ancien champ nom unique vers prenom si besoin
update clients set prenom = nom where (prenom is null or prenom = '') and nom is not null;

create index if not exists clients_nom_idx on clients (nom, prenom);
create index if not exists clients_email_idx on clients (email);
create index if not exists clients_telephone_idx on clients (telephone);
