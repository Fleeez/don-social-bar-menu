-- ============================================================
-- Criollo · Paladar Argento — Esquema de base de datos
-- Ejecutar en el SQL Editor de Supabase (o vía Management API).
-- Idempotente: se puede correr varias veces.
-- ============================================================

create extension if not exists "pgcrypto";

-- ── Enum de tipo de precio ──
do $$ begin
  create type price_kind as enum ('single', 'p2p4', 'copa_botella');
exception when duplicate_object then null; end $$;

-- ── Categorías ──
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name_es     text not null,
  name_en     text not null,
  name_pt     text not null,
  sort_order  int not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Platos ──
create table if not exists public.dishes (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories(id) on delete cascade,
  slug          text unique not null,
  name_es       text not null,
  name_en       text not null,
  name_pt       text not null,
  desc_es       text,
  desc_en       text,
  desc_pt       text,
  price         numeric(10,2),
  price2        numeric(10,2),
  price_kind    price_kind not null default 'single',
  price_tbd     boolean not null default false,
  tags          text[] not null default '{}',
  photo_url     text,
  is_available  boolean not null default true,
  is_visible    boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists dishes_category_idx on public.dishes(category_id);
create index if not exists dishes_sort_idx on public.dishes(sort_order);

-- ── Trigger updated_at ──
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists dishes_set_updated_at on public.dishes;
create trigger dishes_set_updated_at
  before update on public.dishes
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.categories enable row level security;
alter table public.dishes enable row level security;

-- Lectura pública: sólo filas visibles
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_visible = true);

drop policy if exists "dishes_public_read" on public.dishes;
create policy "dishes_public_read" on public.dishes
  for select using (is_visible = true);

-- Acceso total para usuarios autenticados (los dueños)
drop policy if exists "categories_auth_all" on public.categories;
create policy "categories_auth_all" on public.categories
  for all to authenticated using (true) with check (true);

drop policy if exists "dishes_auth_all" on public.dishes;
create policy "dishes_auth_all" on public.dishes
  for all to authenticated using (true) with check (true);

-- ============================================================
-- Storage: buckets públicos para fotos
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('dish-photos', 'dish-photos', true),
  ('ambient', 'ambient', true)
on conflict (id) do nothing;

-- Lectura pública de los objetos (además del acceso por URL pública)
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id in ('dish-photos', 'ambient'));

-- Subida / borrado para usuarios autenticados
drop policy if exists "media_auth_write" on storage.objects;
create policy "media_auth_write" on storage.objects
  for all to authenticated
  using (bucket_id in ('dish-photos', 'ambient'))
  with check (bucket_id in ('dish-photos', 'ambient'));
