-- ============================================================================
-- VINEN — Mentor matching module (idempotent)
-- ============================================================================
-- Run AFTER _init.sql. Adds 5 tables for mentor profile + 1-1 mentoring +
-- measurement (ratings, NPS, session count, completion rate).
--
-- Safe to re-run.
-- ============================================================================


-- ─── Extend profiles.role to include 'mentor' ────────────────────────────────
-- The _init.sql defines an allowed role list. We expand it idempotently.
do $$
begin
  -- Drop the existing check (name varies); recreate including 'mentor'
  alter table public.profiles drop constraint if exists profiles_role_check;
  alter table public.profiles add constraint profiles_role_check
    check (role in ('student','admin','manager','marketing','sale','support','instructor','editor','mentor'));
exception when others then
  -- Some prior migration may have used a different constraint name; if so, ignore
  null;
end $$;


-- ─── mentor_expertise — master taxonomy of mentoring topics ──────────────────
create table if not exists public.mentor_expertise (
  id          uuid default uuid_generate_v4() primary key,
  slug        text unique not null,
  label       text not null,
  description text,
  color       text default '#2563EB',
  icon        text,                       -- lucide icon name
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- Seed top mentor expertise areas for a startup research institute
insert into public.mentor_expertise (slug, label, description, icon, sort_order) values
  ('fundraising',       'Gọi vốn',                  'Pre-seed / Seed / Series A — pitch deck, term sheet, due diligence', 'TrendingUp', 1),
  ('go-to-market',      'Go-to-market',             'Định vị, kênh phân phối, growth loops, sales playbook',              'Target',     2),
  ('product',           'Sản phẩm',                 'PMF, roadmap, prioritization, user research',                        'Box',        3),
  ('engineering',       'Kỹ thuật & công nghệ',     'Kiến trúc, scaling, hire CTO, tech stack',                           'Cpu',        4),
  ('finance',           'Tài chính & vận hành',     'Mô hình tài chính, dòng tiền, runway, unit economics',               'Wallet',     5),
  ('legal',             'Pháp lý & cấu trúc',       'ESOP, cap table, IP, hợp đồng nhà đầu tư',                            'Scale',      6),
  ('hr-culture',        'Nhân sự & văn hoá',        'Tuyển dụng founder team, OKR, văn hoá công ty',                       'Users',      7),
  ('marketing-brand',   'Marketing & thương hiệu',  'Brand story, content, PR, SEO, performance marketing',                'Megaphone',  8),
  ('international',     'Mở rộng quốc tế',          'Export, internationalization, cross-border',                          'Globe',      9),
  ('sustainability',    'Bền vững & ESG',           'Green startup, social impact, ESG reporting',                         'Leaf',       10)
on conflict (slug) do nothing;


-- ─── mentors — mentor profile ────────────────────────────────────────────────
create table if not exists public.mentors (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users(id) on delete set null unique,
  slug                text unique not null,
  full_name           text not null,
  title               text,                          -- e.g. "Co-Founder, Acme Vietnam"
  bio                 text,                          -- long bio (markdown OK)
  short_bio           text,                          -- 1-2 line summary for card
  avatar              text,                          -- URL or /images/...
  cover_image         text,                          -- banner for profile page
  expertise_tags      text[] default '{}',           -- references mentor_expertise.slug
  industries          text[] default '{}',           -- e.g. ['fintech', 'edtech']
  years_experience    integer default 0,
  current_role        text,                          -- "CTO at Acme"
  past_companies      text[] default '{}',
  education           text,                          -- one-line summary
  languages           text[] default '{vi}',         -- ['vi', 'en', ...]
  timezone            text default 'Asia/Ho_Chi_Minh',

  -- contact
  linkedin            text,
  twitter             text,
  website             text,
  email_public        text,                          -- optional public email
  calendar_link       text,                          -- Calendly / Google Calendar / etc.

  -- pricing
  hourly_rate         integer default 0,             -- VND per hour; 0 = free
  free_intro_minutes  integer default 30,            -- length of free intro session

  -- visibility & control
  is_active           boolean default true,
  is_featured         boolean default false,
  accepts_bookings    boolean default true,
  sort_order          integer default 0,

  -- denormalized counters (updated by triggers below)
  total_sessions      integer default 0,
  completed_sessions  integer default 0,
  avg_rating          numeric(2,1) default 0,        -- 0..5
  avg_nps             numeric(3,1) default 0,        -- 0..10
  total_ratings       integer default 0,

  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

create index if not exists idx_mentors_slug              on public.mentors(slug);
create index if not exists idx_mentors_user_id           on public.mentors(user_id);
create index if not exists idx_mentors_active            on public.mentors(is_active) where is_active = true;
create index if not exists idx_mentors_featured          on public.mentors(is_featured) where is_featured = true;
create index if not exists idx_mentors_expertise_tags    on public.mentors using gin (expertise_tags);


-- ─── mentor_availability — recurring weekly time slots ───────────────────────
create table if not exists public.mentor_availability (
  id            uuid default uuid_generate_v4() primary key,
  mentor_id     uuid not null references public.mentors(id) on delete cascade,
  day_of_week   integer not null check (day_of_week between 0 and 6),  -- 0=Sun, 6=Sat
  start_time    time not null,
  end_time      time not null,
  timezone      text default 'Asia/Ho_Chi_Minh',
  is_active     boolean default true,
  created_at    timestamptz default now(),
  check (end_time > start_time)
);

create index if not exists idx_mentor_availability_mentor on public.mentor_availability(mentor_id);


-- ─── mentor_sessions — booked 1-1 sessions ───────────────────────────────────
create table if not exists public.mentor_sessions (
  id                    uuid default uuid_generate_v4() primary key,
  mentor_id             uuid not null references public.mentors(id) on delete restrict,
  mentee_id             uuid not null references auth.users(id) on delete restrict,

  scheduled_at          timestamptz not null,
  duration_minutes      integer default 60 check (duration_minutes > 0),
  meeting_link          text,                 -- Google Meet / Zoom URL

  topic                 text not null,
  goals                 text,                 -- mentee's specific goals
  mentee_notes          text,                 -- visible to mentor
  mentor_notes          text,                 -- private to mentor only

  status                text not null default 'pending'
                          check (status in ('pending','confirmed','completed','cancelled','no_show')),

  -- payment (if any)
  price_paid            integer default 0,    -- VND
  order_id              uuid,                 -- optional ref to public.orders

  -- lifecycle timestamps
  confirmed_at          timestamptz,
  completed_at          timestamptz,
  cancelled_at          timestamptz,
  cancellation_reason   text,
  cancelled_by          uuid references auth.users(id),

  -- reminder tracking (avoid double-sending)
  reminder_24h_sent_at  timestamptz,
  reminder_1h_sent_at   timestamptz,

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_mentor_sessions_mentor       on public.mentor_sessions(mentor_id);
create index if not exists idx_mentor_sessions_mentee       on public.mentor_sessions(mentee_id);
create index if not exists idx_mentor_sessions_status       on public.mentor_sessions(status);
create index if not exists idx_mentor_sessions_scheduled    on public.mentor_sessions(scheduled_at);
create index if not exists idx_mentor_sessions_pending      on public.mentor_sessions(scheduled_at)
  where status in ('pending','confirmed');


-- ─── mentor_ratings — feedback after completed sessions ──────────────────────
create table if not exists public.mentor_ratings (
  id                uuid default uuid_generate_v4() primary key,
  session_id        uuid unique not null references public.mentor_sessions(id) on delete cascade,
  mentor_id         uuid not null references public.mentors(id) on delete cascade,  -- denormalized
  mentee_id         uuid not null references auth.users(id) on delete restrict,

  rating            integer not null check (rating between 1 and 5),
  nps_score         integer check (nps_score between 0 and 10),
  feedback          text,                 -- public testimonial — opt-in
  private_feedback  text,                 -- visible to mentor + admin only
  would_recommend   boolean,
  topics_discussed  text[] default '{}',

  is_public         boolean default false,
  created_at        timestamptz default now()
);

create index if not exists idx_mentor_ratings_mentor      on public.mentor_ratings(mentor_id);
create index if not exists idx_mentor_ratings_mentee      on public.mentor_ratings(mentee_id);
create index if not exists idx_mentor_ratings_public      on public.mentor_ratings(mentor_id) where is_public = true;


-- ─── Triggers: maintain denormalized counters on mentors ─────────────────────
create or replace function public.refresh_mentor_stats(p_mentor uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.mentors m set
    total_sessions = coalesce((select count(*) from public.mentor_sessions s where s.mentor_id = p_mentor), 0),
    completed_sessions = coalesce((select count(*) from public.mentor_sessions s where s.mentor_id = p_mentor and s.status = 'completed'), 0),
    avg_rating = coalesce((select round(avg(rating)::numeric, 1) from public.mentor_ratings r where r.mentor_id = p_mentor), 0),
    avg_nps = coalesce((select round(avg(nps_score)::numeric, 1) from public.mentor_ratings r where r.mentor_id = p_mentor and r.nps_score is not null), 0),
    total_ratings = coalesce((select count(*) from public.mentor_ratings r where r.mentor_id = p_mentor), 0),
    updated_at = now()
  where m.id = p_mentor;
end;
$$;

create or replace function public.trg_mentor_session_change()
returns trigger language plpgsql as $$
begin
  perform public.refresh_mentor_stats(coalesce(new.mentor_id, old.mentor_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists tr_mentor_session_change on public.mentor_sessions;
create trigger tr_mentor_session_change
  after insert or update of status or delete on public.mentor_sessions
  for each row execute function public.trg_mentor_session_change();

create or replace function public.trg_mentor_rating_change()
returns trigger language plpgsql as $$
begin
  perform public.refresh_mentor_stats(coalesce(new.mentor_id, old.mentor_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists tr_mentor_rating_change on public.mentor_ratings;
create trigger tr_mentor_rating_change
  after insert or update or delete on public.mentor_ratings
  for each row execute function public.trg_mentor_rating_change();


-- ─── updated_at trigger (reuse from _init.sql if available) ──────────────────
-- _init.sql defines `public.touch_updated_at()` already; reuse it.
drop trigger if exists tr_mentors_updated_at on public.mentors;
create trigger tr_mentors_updated_at before update on public.mentors
  for each row execute function public.touch_updated_at();

drop trigger if exists tr_mentor_sessions_updated_at on public.mentor_sessions;
create trigger tr_mentor_sessions_updated_at before update on public.mentor_sessions
  for each row execute function public.touch_updated_at();


-- ─── RLS — Row Level Security ────────────────────────────────────────────────
alter table public.mentor_expertise   enable row level security;
alter table public.mentors            enable row level security;
alter table public.mentor_availability enable row level security;
alter table public.mentor_sessions    enable row level security;
alter table public.mentor_ratings     enable row level security;

-- mentor_expertise: public read; admin write
drop policy if exists "mentor_expertise read" on public.mentor_expertise;
create policy "mentor_expertise read" on public.mentor_expertise for select using (true);

drop policy if exists "mentor_expertise admin write" on public.mentor_expertise;
create policy "mentor_expertise admin write" on public.mentor_expertise for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

-- mentors: anyone reads active; mentor edits own; admin all
drop policy if exists "mentors public read active" on public.mentors;
create policy "mentors public read active" on public.mentors for select
  using (is_active = true or auth.uid() = user_id
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

drop policy if exists "mentors self update" on public.mentors;
create policy "mentors self update" on public.mentors for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "mentors admin write" on public.mentors;
create policy "mentors admin write" on public.mentors for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

-- mentor_availability: public read; mentor self write; admin all
drop policy if exists "mentor_availability read" on public.mentor_availability;
create policy "mentor_availability read" on public.mentor_availability for select using (is_active = true);

drop policy if exists "mentor_availability self write" on public.mentor_availability;
create policy "mentor_availability self write" on public.mentor_availability for all
  using (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid()));

-- mentor_sessions: mentee sees own; mentor sees own; admin sees all
drop policy if exists "mentor_sessions own read" on public.mentor_sessions;
create policy "mentor_sessions own read" on public.mentor_sessions for select
  using (mentee_id = auth.uid()
         or exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid())
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

drop policy if exists "mentor_sessions mentee insert" on public.mentor_sessions;
create policy "mentor_sessions mentee insert" on public.mentor_sessions for insert
  with check (mentee_id = auth.uid());

drop policy if exists "mentor_sessions update" on public.mentor_sessions;
create policy "mentor_sessions update" on public.mentor_sessions for update
  using (mentee_id = auth.uid()
         or exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid())
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

-- mentor_ratings: public read only if is_public=true; mentee insert own; admin all
drop policy if exists "mentor_ratings public read" on public.mentor_ratings;
create policy "mentor_ratings public read" on public.mentor_ratings for select
  using (is_public = true
         or mentee_id = auth.uid()
         or exists (select 1 from public.mentors m where m.id = mentor_id and m.user_id = auth.uid())
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','manager')));

drop policy if exists "mentor_ratings mentee insert" on public.mentor_ratings;
create policy "mentor_ratings mentee insert" on public.mentor_ratings for insert
  with check (mentee_id = auth.uid());


-- ─── Helpful view for measurement dashboard ──────────────────────────────────
create or replace view public.mentor_stats_view as
select
  m.id                  as mentor_id,
  m.slug,
  m.full_name,
  m.is_active,
  m.is_featured,
  m.total_sessions,
  m.completed_sessions,
  case when m.total_sessions > 0
       then round((m.completed_sessions::numeric / m.total_sessions) * 100, 1)
       else 0 end       as completion_rate_pct,
  m.avg_rating,
  m.avg_nps,
  m.total_ratings,
  -- hours mentored (completed sessions × duration)
  coalesce((
    select round(sum(s.duration_minutes)::numeric / 60, 1)
    from public.mentor_sessions s
    where s.mentor_id = m.id and s.status = 'completed'
  ), 0)                 as total_hours_mentored,
  -- NPS bucket (Promoters % - Detractors %)
  coalesce((
    with nps as (
      select
        (count(*) filter (where nps_score >= 9))::numeric as promoters,
        (count(*) filter (where nps_score <= 6))::numeric as detractors,
        count(*) as total
      from public.mentor_ratings
      where mentor_id = m.id and nps_score is not null
    )
    select case when total > 0
                then round((promoters - detractors) / total * 100, 0)
                else null end
    from nps
  ), null)               as nps_index
from public.mentors m;


-- ─── Done ────────────────────────────────────────────────────────────────────
notify pgrst, 'reload schema';
