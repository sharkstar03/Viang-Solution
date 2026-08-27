create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  service text not null,
  message text not null,
  source text not null default 'form',
  status text not null default 'nuevo'
    check (status in ('nuevo','contactado','cotizado','ganado','perdido')),
  notes text,
  utm_source text, utm_medium text, utm_campaign text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  payload jsonb not null default '{}',
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;
alter table events enable row level security;

create policy "public insert leads" on leads for insert with check (true);
-- Sin política de SELECT para anónimo: los leads son invisibles al público.
-- events: sin ninguna política — solo service_role.

create or replace function emit_lead_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into events (type, payload)
  values ('lead.created', jsonb_build_object(
    'lead_id', new.id, 'name', new.name, 'service', new.service
  ));
  return new;
end $$;

create trigger lead_created after insert on leads
  for each row execute function emit_lead_event();
