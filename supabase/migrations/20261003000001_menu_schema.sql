-- Medipoint Wellness: menu schema
-- Tables: admins, categories, menu_items, site_settings
-- Public (anon) can read visible content; only admins can write.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Admins
-- Anyone who signs in with an email listed here gets edit rights.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- A signed-in user may see their own admin row; nobody writes through the API.
drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row"
  on public.admins for select
  to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(trim(name)) > 0),
  subtitle    text,
  sort_order  integer not null default 0,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists categories_sort_idx on public.categories (sort_order, name);

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch
  before update on public.categories
  for each row execute function public.touch_updated_at();

alter table public.categories enable row level security;

drop policy if exists "categories: public read visible" on public.categories;
create policy "categories: public read visible"
  on public.categories for select
  to anon, authenticated
  using (is_visible or public.is_admin());

drop policy if exists "categories: admin insert" on public.categories;
create policy "categories: admin insert"
  on public.categories for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "categories: admin update" on public.categories;
create policy "categories: admin update"
  on public.categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "categories: admin delete" on public.categories;
create policy "categories: admin delete"
  on public.categories for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Menu items
-- photo_url  : what the site renders (Supabase Storage public URL or external)
-- photo_path : object path inside the "menu-items" bucket when we own the file
-- ---------------------------------------------------------------------------
create table if not exists public.menu_items (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references public.categories (id) on delete restrict,
  name             text not null check (char_length(trim(name)) > 0),
  description      text,
  price            numeric(10, 2) not null check (price >= 0),
  calories         integer check (calories is null or calories >= 0),
  allergens        text,
  not_celiac_safe  boolean not null default false,
  photo_url        text,
  photo_path       text,
  sort_order       integer not null default 0,
  is_available     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists menu_items_category_sort_idx
  on public.menu_items (category_id, sort_order, name);

drop trigger if exists menu_items_touch on public.menu_items;
create trigger menu_items_touch
  before update on public.menu_items
  for each row execute function public.touch_updated_at();

alter table public.menu_items enable row level security;

drop policy if exists "menu_items: public read available" on public.menu_items;
create policy "menu_items: public read available"
  on public.menu_items for select
  to anon, authenticated
  using (is_available or public.is_admin());

drop policy if exists "menu_items: admin insert" on public.menu_items;
create policy "menu_items: admin insert"
  on public.menu_items for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "menu_items: admin update" on public.menu_items;
create policy "menu_items: admin update"
  on public.menu_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "menu_items: admin delete" on public.menu_items;
create policy "menu_items: admin delete"
  on public.menu_items for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                 smallint primary key default 1 check (id = 1),
  price_note         text not null default 'Fiyatlara tüm vergiler dahildir',
  prices_updated_on  date,
  reviews_url        text,
  instagram_url      text,
  address            text,
  phone              text,
  updated_at         timestamptz not null default now()
);

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "site_settings: public read" on public.site_settings;
create policy "site_settings: public read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings: admin update" on public.site_settings;
create policy "site_settings: admin update"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_settings: admin insert" on public.site_settings;
create policy "site_settings: admin insert"
  on public.site_settings for insert
  to authenticated
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants (RLS still decides which rows)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.menu_items, public.site_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.menu_items to authenticated;
grant insert, update on public.site_settings to authenticated;
grant select on public.admins to authenticated;
