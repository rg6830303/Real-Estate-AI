-- ============================================================================
-- Real Estate AI Consultant — Supabase schema
-- ============================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- after creating your project. Idempotent: safe to run more than once.
--
-- Tables:
--   properties     — the live inventory the AI consultant recommends from
--   leads          — one row per prospective client conversation
--   messages       — full chat transcript per lead (for handover + audit)
--
-- The app reads `properties` via PostgREST using the service-role key on the
-- server only (never exposed to the browser). RLS is enabled everywhere with
-- deny-by-default; the service role bypasses RLS, and a read-only policy for
-- anon is provided but commented out should you ever want public reads.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- properties — replace the seed rows below with your real listings
-- ----------------------------------------------------------------------------
create table if not exists public.properties (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  city            text not null,
  locality        text not null,
  property_type   text not null check (property_type in
                    ('Apartment','Villa','Builder Floor','Plot','Penthouse','Commercial')),
  bhk             text,                          -- e.g. '3 BHK'; null for Plot/Commercial
  price_cr        numeric(10,3) not null check (price_cr > 0),  -- price in ₹ crore
  area_sqft       integer not null check (area_sqft > 0),
  possession      text not null default 'Ready to move' check (possession in
                    ('Ready to move','Under construction')),
  possession_date text,                          -- e.g. 'Dec 2026' when under construction
  intent_fit      text[] not null default '{buy}',  -- any of: buy | rent | invest
  amenities       text[] not null default '{}',
  highlights      text,                          -- one-line consultant note shown to clients
  rera_id         text,
  image_url       text,
  active          boolean not null default true, -- soft on/off switch per listing
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.properties is 'Verified inventory the AI consultant may recommend. Only active=true rows are served.';
comment on column public.properties.price_cr is 'Asking price in INR crore (e.g. 1.75 = ₹1.75 Cr, 0.85 = ₹85 L).';
comment on column public.properties.intent_fit is 'Which client intents this listing suits: buy / rent / invest.';

create index if not exists properties_active_idx   on public.properties (active) where active;
create index if not exists properties_city_idx     on public.properties (lower(city));
create index if not exists properties_price_idx    on public.properties (price_cr);

-- ----------------------------------------------------------------------------
-- leads — one row per client the AI has chatted with
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  phone         text,
  email         text,
  source        text not null default 'Website chat',
  requirements  jsonb not null default '{}'::jsonb, -- ClientRequirements snapshot
  score         integer not null default 0 check (score between 0 and 100),
  temperature   text not null default 'new' check (temperature in ('hot','warm','cold','new')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table  public.leads is 'Prospective clients captured by the AI consultant, with their extracted requirement profile.';
comment on column public.leads.requirements is 'Latest ClientRequirements JSON extracted from the conversation.';

create index if not exists leads_temperature_idx on public.leads (temperature);
create index if not exists leads_created_idx     on public.leads (created_at desc);

-- ----------------------------------------------------------------------------
-- messages — transcript per lead, for human handover and audit
-- ----------------------------------------------------------------------------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid not null references public.leads (id) on delete cascade,
  role         text not null check (role in ('user','assistant')),
  content      text not null,
  property_ids uuid[] not null default '{}',      -- listings surfaced on this turn
  created_at   timestamptz not null default now()
);

create index if not exists messages_lead_idx on public.messages (lead_id, created_at);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security — deny by default; server uses the service-role key
-- ----------------------------------------------------------------------------
alter table public.properties enable row level security;
alter table public.leads      enable row level security;
alter table public.messages   enable row level security;

-- Optional: allow public (anon key) read access to ACTIVE listings only.
-- Uncomment if you want the browser to read listings directly.
-- create policy "Public can read active listings"
--   on public.properties for select
--   to anon
--   using (active = true);

-- ----------------------------------------------------------------------------
-- Seed data — sample Delhi NCR listings so the system works immediately.
-- DELETE these and insert your real inventory when going live:
--   delete from public.properties;
-- ----------------------------------------------------------------------------
-- Makes the seed idempotent: rerunning this file won't duplicate rows.
create unique index if not exists properties_title_locality_key
  on public.properties (title, locality);

insert into public.properties
  (title, city, locality, property_type, bhk, price_cr, area_sqft, possession, possession_date, intent_fit, amenities, highlights, rera_id)
values
  ('Sector 65 Residency', 'Gurugram', 'Sector 65, Gurugram', 'Apartment', '3 BHK', 2.100, 1750, 'Ready to move', null, '{buy,invest}', '{Clubhouse,"Gated community","Power backup","Kids play area"}', 'Low-density tower with east-facing units and strong rental demand.', 'RC/REP/HARERA/GGM/2024/01'),
  ('Emerald Greens', 'Gurugram', 'Sector 65, Gurugram', 'Apartment', '3 BHK', 2.350, 1900, 'Ready to move', null, '{buy}', '{"Swimming pool",Gym,"24x7 security","Landscaped gardens"}', 'Larger carpet area than most 3 BHKs in the sector; corner units available.', 'RC/REP/HARERA/GGM/2024/02'),
  ('Palm Court Floors', 'Gurugram', 'Sector 57, Gurugram', 'Apartment', '2 BHK', 1.400, 1150, 'Under construction', 'Jun 2027', '{buy,rent}', '{"Covered parking","Park facing",Lift}', 'Attractive construction-linked payment plan; park-facing stack.', 'RC/REP/HARERA/GGM/2025/03'),
  ('Meadow Villas', 'Gurugram', 'Sector 82, Gurugram', 'Villa', '4 BHK', 3.800, 3200, 'Ready to move', null, '{buy}', '{"Private garden","Servant quarters","Gated community",Clubhouse}', 'Corner villa with a private garden — rare at this price on NH-8 side.', 'RC/REP/HARERA/GGM/2023/04'),
  ('Golf Extension Floors', 'Gurugram', 'Golf Course Extension Road, Gurugram', 'Builder Floor', '3 BHK', 1.900, 1600, 'Ready to move', null, '{buy,invest}', '{"No shared walls","Private terrace","Stilt parking"}', 'Independent floor living with strong appreciation track on GCX Road.', 'RC/REP/HARERA/GGM/2024/05'),
  ('Sports City Residency', 'Noida', 'Sector 150, Noida', 'Apartment', '2 BHK', 1.050, 1050, 'Ready to move', null, '{invest,buy,rent}', '{"Sports facilities",Clubhouse,"Jogging track","Swimming pool"}', 'Greenest sector in Noida; consistently high tenant demand.', 'UPRERAPRJ2024/06'),
  ('Expressway Greens', 'Noida', 'Sector 143, Noida', 'Apartment', '2 BHK', 0.950, 980, 'Under construction', 'Dec 2026', '{invest}', '{"Landscaped gardens","Rainwater harvesting","Metro nearby"}', 'Entry price on the Expressway with metro connectivity already live.', 'UPRERAPRJ2025/07'),
  ('Riverside Heights', 'Noida', 'Sector 137, Noida Expressway', 'Apartment', '3 BHK', 1.600, 1450, 'Ready to move', null, '{buy,invest}', '{Clubhouse,"Kids play area","Power backup"}', 'Walkable to metro; society is fully occupied with an active RWA.', 'UPRERAPRJ2023/08'),
  ('Sector 62 Floors', 'Noida', 'Sector 62, Noida', 'Builder Floor', '2 BHK', 0.850, 900, 'Ready to move', null, '{rent,invest}', '{"Metro nearby","Covered parking"}', 'IT-hub location — dependable rental yield from corporate tenants.', null),
  ('Dwarka Sector 12 Residency', 'Delhi', 'Sector 12, Dwarka', 'Apartment', '2 BHK', 1.100, 1100, 'Ready to move', null, '{buy}', '{"Metro nearby","Community hall","Market nearby"}', 'Established society two blocks from the Blue Line metro.', null),
  ('Dwarka Sector 23 Residency', 'Delhi', 'Sector 23, Dwarka', 'Apartment', '3 BHK', 1.750, 1500, 'Ready to move', null, '{buy,invest}', '{Clubhouse,"Power backup","Gated community"}', 'Spacious layout close to the upcoming Dwarka Expressway interchange.', null),
  ('Greater Noida West Residency', 'Greater Noida', 'Greater Noida West', 'Apartment', '2 BHK', 0.650, 950, 'Under construction', 'Mar 2027', '{buy,invest}', '{"Gated community","Kids play area",Clubhouse}', 'Best affordability in NCR for a first home; strong social infrastructure coming up.', 'UPRERAPRJ2025/12'),
  ('Yamuna Expressway Plots', 'Greater Noida', 'Yamuna Expressway, Greater Noida', 'Plot', null, 0.550, 1500, 'Ready to move', null, '{buy,invest}', '{"Clear title","Gated township"}', 'Land bank play near the upcoming Noida International Airport.', 'UPRERAPRJ2024/13'),
  ('Faridabad Sector 86 Residency', 'Faridabad', 'Sector 86, Faridabad', 'Apartment', '3 BHK', 1.150, 1400, 'Ready to move', null, '{buy}', '{"Gated community","Power backup","Park facing"}', 'Most 3 BHK space per rupee in NCR; peaceful, family-heavy society.', 'RC/REP/HARERA/FBD/2023/14'),
  ('Indirapuram Residency', 'Ghaziabad', 'Indirapuram, Ghaziabad', 'Apartment', '2 BHK', 0.720, 1050, 'Ready to move', null, '{buy,rent}', '{"Market nearby","Covered parking",Lift}', 'Mature neighbourhood with everything walkable — schools, markets, hospitals.', null)
on conflict (title, locality) do nothing;
