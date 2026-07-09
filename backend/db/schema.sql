-- ============================================================
-- SERVICE FINDER — SUPABASE SCHEMA
-- Run this in the Supabase SQL editor (or via migration tool).
-- Matches blueprint §3 SUPABASE SCHEMA + §6A hazard decay.
-- ============================================================

-- 1. PROFILES (linked to Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user','moderator','admin')),
  trust_score integer not null default 0,
  language_pref text default 'en',
  created_at timestamptz default now()
);

-- 2. SERVICES (core map data)
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('clinic','hospital','library','shelter','police','fire_station','school','community_center','social_services','mental_health','disability_services','pharmacy','other')),
  lat double precision not null,
  lng double precision not null,
  address text,
  hours_json jsonb,
  contact text,
  verified boolean not null default false,
  is_public boolean not null default true,
  source text not null default 'official' check (source in ('official','user_submitted')),
  submitted_by uuid references profiles(id),
  status text not null default 'approved' check (status in ('approved','pending','rejected')),
  created_at timestamptz default now()
);
create index services_type_idx on services (type);
create index services_status_idx on services (status);

-- 3. SERVICE SUGGESTIONS (feeds the admin approval queue)
create table service_suggestions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references profiles(id),
  name text not null,
  type text not null,
  lat double precision not null,
  lng double precision not null,
  notes text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- 4. SERVICE REPORTS (Waze-style: "closed", "queue long", etc.)
create table service_reports (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  user_id uuid references profiles(id),
  report_type text not null check (report_type in ('closed','wrong_info','hazard','queue_long')),
  description text,
  upvotes integer not null default 0,
  created_at timestamptz default now()
);

-- 5. HAZARDS (Waze-style live hazards, rendered on Google Maps)
create table hazards (
  id uuid primary key default gen_random_uuid(),
  lat double precision not null,
  lng double precision not null,
  type text not null check (type in ('flood','road_closure','protest','loadshedding')),
  reported_by uuid references profiles(id),
  confirmations integer not null default 0,
  status text not null default 'active' check (status in ('active','expired')),
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- 5b. HAZARD CONFIRMATIONS (one per user per hazard — prevents duplicate upvotes)
create table hazard_confirmations (
  id uuid primary key default gen_random_uuid(),
  hazard_id uuid references hazards(id) on delete cascade,
  user_id uuid references profiles(id),
  created_at timestamptz default now(),
  unique (hazard_id, user_id)
);

-- Keep hazards.confirmations in sync with hazard_confirmations count
create or replace function bump_hazard_confirmations()
returns trigger as $$
begin
  update hazards set confirmations = confirmations + 1 where id = new.hazard_id;
  return new;
end;
$$ language plpgsql;

create trigger hazard_confirmation_inserted
after insert on hazard_confirmations
for each row execute function bump_hazard_confirmations();

-- Auto-decay: hazard expires if it doesn't get 3+ confirmations within 2 hours
create or replace function decay_hazard_trust()
returns trigger as $$
begin
  if new.confirmations < 3 and new.created_at < now() - interval '2 hours' then
    new.status = 'expired';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger hazard_decay_check
before update on hazards
for each row execute function decay_hazard_trust();

-- 6. FORUM
create table forum_threads (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id),
  title text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  pinned boolean not null default false
);

create table forum_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references forum_threads(id) on delete cascade,
  user_id uuid references profiles(id),
  message text not null,
  created_at timestamptz default now(),
  edited_at timestamptz,
  flagged boolean not null default false
);

-- 7. AUTOMATED INGESTION TABLES (all populated by scheduled jobs, §4)
create table social_feed_items (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('x','facebook','instagram')),
  external_id text not null,
  content text,
  media_url text,
  service_type_tag text,
  fetched_at timestamptz default now(),
  unique (platform, external_id)
);

create table gov_stats_cache (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  category text,
  data_json jsonb,
  fetched_at timestamptz default now()
);

create table radio_announcements (
  id uuid primary key default gen_random_uuid(),
  station text not null,
  headline text not null,
  body text,
  audio_url text,
  published_at timestamptz,
  ingested_at timestamptz default now(),
  unique (station, headline, published_at) -- dedupe guard, see §4.2
);

-- 8. NOTIFICATIONS / AUDIT / OFFLINE SYNC
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  type text not null,
  payload_json jsonb,
  read boolean not null default false,
  created_at timestamptz default now()
);

create table admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  action_type text not null,
  target_table text not null,
  target_id uuid,
  note text,
  ip_address text,
  created_at timestamptz default now()
);

create table offline_sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action_type text not null,
  payload_json jsonb,
  synced boolean not null default false,
  conflict_resolution_strategy text default 'last_write_wins',
  client_timestamp timestamptz,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (non-negotiable — blueprint §3 + §9)
-- ============================================================
alter table profiles enable row level security;
alter table services enable row level security;
alter table service_suggestions enable row level security;
alter table service_reports enable row level security;
alter table hazards enable row level security;
alter table hazard_confirmations enable row level security;
alter table forum_threads enable row level security;
alter table forum_messages enable row level security;
alter table admin_actions enable row level security;

-- profiles: users can read/update only their own row
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- services: public read on approved rows; only admin/moderator can write directly
create policy "services_select_approved" on services for select using (status = 'approved');
create policy "services_admin_write" on services for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
);
create policy "services_admin_update" on services for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
);

-- service_suggestions: any authenticated user can submit; only admin/moderator can review
create policy "suggestions_insert_own" on service_suggestions for insert with check (auth.uid() = submitted_by);
create policy "suggestions_select_own_or_admin" on service_suggestions for select using (
  auth.uid() = submitted_by or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
);
create policy "suggestions_admin_update" on service_suggestions for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
);

-- hazards / reports: authenticated users can insert, everyone can read active ones
create policy "hazards_select_all" on hazards for select using (true);
create policy "hazards_insert_auth" on hazards for insert with check (auth.uid() = reported_by);
create policy "hazard_confirmations_insert_auth" on hazard_confirmations for insert with check (auth.uid() = user_id);
create policy "hazard_confirmations_select_all" on hazard_confirmations for select using (true);

-- forum: only authenticated users can insert; author or moderator can edit/delete
create policy "forum_threads_select_all" on forum_threads for select using (true);
create policy "forum_threads_insert_auth" on forum_threads for insert with check (auth.uid() = created_by);
create policy "forum_messages_select_all" on forum_messages for select using (true);
create policy "forum_messages_insert_auth" on forum_messages for insert with check (auth.uid() = user_id);
create policy "forum_messages_update_own_or_mod" on forum_messages for update using (
  auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role in ('admin','moderator'))
);

-- admin_actions: admin-only read/insert (audit trail)
create policy "admin_actions_admin_only" on admin_actions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
