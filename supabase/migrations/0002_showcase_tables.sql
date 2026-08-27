create table stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value int not null,
  suffix text not null default '',
  icon text not null default '',
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  service_id uuid references services(id) on delete set null,
  description text not null default '',
  image_before text not null,
  image_after text not null,
  completed_at date,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  company text not null default '',
  content text not null,
  rating int not null check (rating between 1 and 5),
  avatar_path text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table stats enable row level security;
alter table projects enable row level security;
alter table testimonials enable row level security;

create policy "public read published stats" on stats for select using (published = true);
create policy "public read published projects" on projects for select using (published = true);
create policy "public read published testimonials" on testimonials for select using (published = true);
