create table site_settings (
  id uuid primary key default gen_random_uuid(),
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  address text not null default '',
  business_hours jsonb not null default '{}',
  social_links jsonb not null default '{}',
  seo_title text not null default '',
  seo_description text not null default '',
  og_image text,
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  long_description text not null default '',
  icon text not null default '',
  image_path text,
  faq jsonb not null default '[]',
  price_from numeric,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text not null,
  website_url text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table services enable row level security;
alter table clients enable row level security;

-- Público: solo lectura de lo publicado. Escritura: nadie por ahora
-- (el panel de la Fase 2 agregará políticas de admin).
create policy "public read settings" on site_settings for select using (true);
create policy "public read published services" on services for select using (published = true);
create policy "public read published clients" on clients for select using (published = true);
