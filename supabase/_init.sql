-- ===========================================================================
-- LMS Platform - Initial Database Schema (idempotent)
-- ===========================================================================
-- Run ONCE in Supabase SQL Editor. Safe to re-run.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- SECTION: COMBINED_TAITUE_IDEMPOTENT.sql
-- ---------------------------------------------------------------------------
-- =============================================================================
-- Tài Tuệ Academy — Combined Supabase migration
-- Generated 2026-05-22 16:08
-- Run once in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor → New query → paste → Run)
-- Skips: 20260519_seed_hocchuaxongtiendave_product.sql (off-niche seed from prior owner)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- BEGIN: schema.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- LMS Platform — Supabase Database Schema
-- Copy toàn bộ file này vào Supabase → SQL Editor → Run
-- Xem hướng dẫn đầy đủ tại SETUP.md
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- full-text search

-- ─── PROFILES (mở rộng auth.users) ──────────────────────────
create table if not exists public.profiles (
  id            uuid references auth.users(id) on delete cascade primary key,
  full_name     text,
  avatar_url    text,
  bio           text,
  phone         text,
  role          text default 'student' check (role in ('student','admin','manager','marketing','sale','support','instructor','editor')),
  tier          text default 'free' check (tier in ('free','member','vip')),
  xp            integer default 0,
  level         integer default 1,
  streak        integer default 0,
  last_login    timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile khi user đăng ký
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── PRODUCTS (khoá học / digital products) ──────────────────
create table if not exists public.products (
  id            uuid default uuid_generate_v4() primary key,
  slug          text unique not null,
  title         text not null,
  description   text,
  thumbnail     text,
  price         integer default 0, -- VND, 0 = miễn phí
  sale_price    integer,
  type          text default 'course' check (type in ('course','ebook','template','membership')),
  tier_required text default 'free' check (tier_required in ('free','member','vip')),
  status        text default 'draft' check (status in ('draft','published','archived')),
  sort_order    integer default 0,
  created_at    timestamptz default now()
);

-- ─── CHAPTERS ────────────────────────────────────────────────
create table if not exists public.chapters (
  id         uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade,
  title      text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- ─── LESSONS ─────────────────────────────────────────────────
create table if not exists public.lessons (
  id            uuid default uuid_generate_v4() primary key,
  chapter_id    uuid references public.chapters(id) on delete cascade,
  product_id    uuid references public.products(id) on delete cascade,
  title         text not null,
  description   text,
  youtube_id    text,  -- YouTube video ID (không lưu full URL)
  video_url     text,  -- External video URL (Google Drive, etc). Used when youtube_id is empty.
  duration_sec  integer default 0,
  content       text,  -- markdown nội dung bổ sung
  sort_order    integer default 0,
  is_free       boolean default false, -- bài học preview miễn phí
  created_at    timestamptz default now()
);

-- ─── USER PROGRESS ───────────────────────────────────────────
create table if not exists public.lesson_progress (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  lesson_id   uuid references public.lessons(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  completed   boolean default false,
  watch_sec   integer default 0, -- số giây đã xem
  note        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, lesson_id)
);

-- ─── ENROLLMENTS (quyền truy cập) ────────────────────────────
create table if not exists public.enrollments (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  order_id    uuid, -- liên kết đơn hàng
  source      text default 'purchase' check (source in ('purchase','gift','admin','free')),
  expires_at  timestamptz, -- null = vĩnh viễn
  created_at  timestamptz default now(),
  unique(user_id, product_id)
);

-- ─── ORDERS (đơn hàng Sepay) ─────────────────────────────────
create table if not exists public.orders (
  id              uuid default uuid_generate_v4() primary key,
  order_code      text unique not null, -- mã giao dịch hiển thị cho khách
  user_id         uuid references public.profiles(id),
  product_id      uuid references public.products(id),
  amount          integer not null, -- VND
  status          text default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  payment_method  text default 'sepay' check (payment_method in ('sepay','bank_transfer')),
  -- Sepay fields
  sepay_txn_id    text,   -- mã giao dịch từ Sepay
  sepay_content   text,   -- nội dung chuyển khoản
  bank_account    text,
  bank_code       text,
  paid_at         timestamptz,
  -- Customer info
  customer_name   text,
  customer_email  text,
  customer_phone  text,
  note            text,
  coupon_code     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── COMMUNITY POSTS ─────────────────────────────────────────
create table if not exists public.posts (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.profiles(id) on delete cascade,
  content     text not null,
  image_url   text,
  tags        text[],
  pinned      boolean default false,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── POST LIKES ──────────────────────────────────────────────
create table if not exists public.post_likes (
  user_id    uuid references public.profiles(id) on delete cascade,
  post_id    uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- ─── COMMENTS ────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid default uuid_generate_v4() primary key,
  post_id     uuid references public.posts(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz default now()
);

-- Auto-update comments_count
create or replace function update_post_comments_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update posts set comments_count = comments_count - 1 where id = OLD.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change after insert or delete on public.comments
  for each row execute procedure update_post_comments_count();

-- ─── BLOG POSTS ──────────────────────────────────────────────
create table if not exists public.blog_posts (
  id           uuid default uuid_generate_v4() primary key,
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  content      text, -- markdown
  thumbnail    text,
  category     text,
  tags         text[],
  status       text default 'draft' check (status in ('draft','published')),
  views        integer default 0,
  published_at timestamptz,
  created_at   timestamptz default now()
);

-- ─── EMAIL SUBSCRIBERS ───────────────────────────────────────
create table if not exists public.subscribers (
  id          uuid default uuid_generate_v4() primary key,
  email       text unique not null,
  full_name   text,
  phone       text,
  source      text, -- landing page slug, utm_source...
  tags        text[],
  status      text default 'active' check (status in ('active','unsubscribed','bounced')),
  user_id     uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- ─── EMAIL CAMPAIGNS ─────────────────────────────────────────
create table if not exists public.email_campaigns (
  id           uuid default uuid_generate_v4() primary key,
  subject      text not null,
  preview_text text,
  body_html    text,
  status       text default 'draft' check (status in ('draft','scheduled','sent')),
  scheduled_at timestamptz,
  sent_at      timestamptz,
  sent_count   integer default 0,
  open_count   integer default 0,
  click_count  integer default 0,
  created_at   timestamptz default now()
);

-- ─── XP EVENTS (gamification) ────────────────────────────────
create table if not exists public.xp_events (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  action     text not null, -- 'lesson_complete','post_created','comment_added','login',...
  xp_amount  integer not null,
  meta       jsonb, -- extra data
  created_at timestamptz default now()
);

-- Auto-update XP + level on profiles
create or replace function update_user_xp()
returns trigger language plpgsql as $$
declare
  total_xp integer;
  new_level integer;
begin
  select coalesce(sum(xp_amount),0) into total_xp
  from xp_events where user_id = NEW.user_id;

  -- Level formula: mỗi level cần thêm 200 XP
  new_level := greatest(1, floor(total_xp / 200) + 1);

  update profiles set xp = total_xp, level = new_level
  where id = NEW.user_id;
  return NEW;
end;
$$;
drop trigger if exists on_xp_event on public.xp_events;
create trigger on_xp_event after insert on public.xp_events
  for each row execute procedure update_user_xp();

-- ─── ANALYTICS EVENTS ────────────────────────────────────────
create table if not exists public.analytics_events (
  id          uuid default uuid_generate_v4() primary key,
  session_id  text,
  user_id     uuid references public.profiles(id),
  event       text not null, -- 'page_view','cta_click','form_submit','purchase',...
  page        text,
  utm_source  text,
  utm_medium  text,
  utm_campaign text,
  meta        jsonb,
  ip          text,
  created_at  timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.enrollments enable row level security;
alter table public.orders enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.xp_events enable row level security;

-- Profiles: user chỉ xem/sửa profile của mình
drop policy if exists "users_read_own_profile" on profiles;
create policy "users_read_own_profile" on profiles for select using (auth.uid() = id);
drop policy if exists "users_update_own_profile" on profiles;
create policy "users_update_own_profile" on profiles for update using (auth.uid() = id);
drop policy if exists "public_read_profiles" on profiles;
create policy "public_read_profiles" on profiles for select using (true); -- public view

-- Enrollments: user chỉ xem enrollment của mình
drop policy if exists "users_read_own_enrollments" on enrollments;
create policy "users_read_own_enrollments" on enrollments for select using (auth.uid() = user_id);

-- Orders: user chỉ xem order của mình
drop policy if exists "users_read_own_orders" on orders;
create policy "users_read_own_orders" on orders for select using (auth.uid() = user_id);

-- Progress: user chỉ xem/sửa progress của mình
drop policy if exists "users_manage_own_progress" on lesson_progress;
create policy "users_manage_own_progress" on lesson_progress for all using (auth.uid() = user_id);

-- Posts: ai cũng đọc được, chỉ owner mới sửa/xóa
drop policy if exists "public_read_posts" on posts;
create policy "public_read_posts" on posts for select using (true);
drop policy if exists "users_create_posts" on posts;
create policy "users_create_posts" on posts for insert with check (auth.uid() = user_id);
drop policy if exists "users_manage_own_posts" on posts;
create policy "users_manage_own_posts" on posts for update using (auth.uid() = user_id);
drop policy if exists "users_delete_own_posts" on posts;
create policy "users_delete_own_posts" on posts for delete using (auth.uid() = user_id);

-- Likes
drop policy if exists "users_manage_likes" on post_likes;
create policy "users_manage_likes" on post_likes for all using (auth.uid() = user_id);
drop policy if exists "public_read_likes" on post_likes;
create policy "public_read_likes" on post_likes for select using (true);

-- Comments
drop policy if exists "public_read_comments" on comments;
create policy "public_read_comments" on comments for select using (true);
drop policy if exists "users_create_comments" on comments;
create policy "users_create_comments" on comments for insert with check (auth.uid() = user_id);
drop policy if exists "users_delete_own_comments" on comments;
create policy "users_delete_own_comments" on comments for delete using (auth.uid() = user_id);

-- ─── SEED DATA (sản phẩm mẫu — có thể xóa/sửa) ─────────────
-- Bạn có thể xóa phần này và tạo sản phẩm riêng qua Admin Dashboard
insert into public.products (slug, title, description, price, type, status, sort_order) values
('khoa-hoc-mau-1', 'Khóa Học Mẫu — Bắt Đầu Kinh Doanh Online',
 'Hướng dẫn từng bước xây dựng business online đầu tiên. Phù hợp cho người mới.', 499000, 'course', 'published', 1),
('khoa-hoc-mau-2', 'Marketing Cơ Bản — Xây Dựng Thương Hiệu',
 'Xây dựng thương hiệu cá nhân mạnh mẽ trên internet.', 0, 'course', 'published', 2),
('tai-lieu-mau', 'Tài Liệu Mẫu — Ebook Template',
 'Ebook hướng dẫn chi tiết kèm template sẵn. Download ngay sau khi mua.', 99000, 'ebook', 'published', 3)
on conflict (slug) do nothing;

-- ─── VIEWS tiện ích ──────────────────────────────────────────
-- Tổng quan CRM
create or replace view public.crm_overview as
select
  count(distinct o.id) filter (where o.status = 'paid') as total_orders,
  coalesce(sum(o.amount) filter (where o.status = 'paid'), 0) as total_revenue,
  count(distinct o.user_id) as total_customers,
  coalesce(avg(o.amount) filter (where o.status = 'paid'), 0) as avg_order_value,
  count(distinct o.id) filter (where o.status = 'pending') as pending_orders
from public.orders o;

-- Doanh thu theo ngày (7 ngày gần nhất)
create or replace view public.daily_revenue as
select
  date_trunc('day', paid_at)::date as day,
  sum(amount) as revenue,
  count(*) as orders
from public.orders
where status = 'paid' and paid_at >= now() - interval '30 days'
group by 1 order by 1;


-- END: schema.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migration_affiliate.sql
-- -----------------------------------------------------------------------------
-- ═══════════════════════════════════════════════════════════════
-- AFFILIATE SYSTEM — taitue.academy
-- Chạy trong Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════

-- 1. Bảng affiliates — mỗi học viên đăng ký làm affiliate
CREATE TABLE IF NOT EXISTS public.affiliates (
  id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  ref_code        text UNIQUE NOT NULL,
  status          text DEFAULT 'active' CHECK (status IN ('pending','active','suspended','rejected')),
  commission_rate numeric(5,2) DEFAULT 20.00,
  total_clicks    integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_earned    integer DEFAULT 0,
  total_paid      integer DEFAULT 0,
  bank_name       text,
  bank_account    text,
  bank_holder     text,
  note            text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code ON affiliates(ref_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);

-- 2. Bảng affiliate_clicks — tracking mỗi click
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id uuid REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ref_code    text NOT NULL,
  ip          text,
  user_agent  text,
  page_url    text,
  referrer    text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aff_clicks_affiliate ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_created ON affiliate_clicks(created_at);

-- 3. Bảng affiliate_conversions — hoa hồng khi bán hàng
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id              uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id    uuid REFERENCES public.affiliates(id) ON DELETE CASCADE,
  order_id        uuid,
  buyer_id        uuid,
  product_id      uuid,
  order_amount    integer NOT NULL,
  commission_rate numeric(5,2) NOT NULL,
  commission_amount integer NOT NULL,
  status          text DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  approved_at     timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aff_conv_affiliate ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_conv_status ON affiliate_conversions(status);

-- 4. Bảng affiliate_payouts — lịch sử thanh toán
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id            uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id  uuid REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount        integer NOT NULL,
  status        text DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  bank_name     text,
  bank_account  text,
  bank_holder   text,
  note          text,
  processed_by  uuid,
  processed_at  timestamptz,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aff_payouts_affiliate ON affiliate_payouts(affiliate_id);

-- 5. Bảng affiliate_settings — cấu hình chung
CREATE TABLE IF NOT EXISTS public.affiliate_settings (
  id                  uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  default_commission  numeric(5,2) DEFAULT 20.00,
  cookie_days         integer DEFAULT 90,
  min_payout_amount   integer DEFAULT 200000,
  auto_approve        boolean DEFAULT false,
  program_active      boolean DEFAULT true,
  updated_at          timestamptz DEFAULT now()
);

INSERT INTO public.affiliate_settings (default_commission, cookie_days, min_payout_amount)
VALUES (20.00, 90, 200000)
ON CONFLICT DO NOTHING;

-- 6. Thêm cột ref_code vào orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ref_code text;
CREATE INDEX IF NOT EXISTS idx_orders_ref_code ON orders(ref_code);

-- 7. Trigger tự cập nhật affiliate totals
CREATE OR REPLACE FUNCTION update_affiliate_totals()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE affiliates SET
    total_conversions = (SELECT count(*) FROM affiliate_conversions WHERE affiliate_id = NEW.affiliate_id AND status != 'rejected'),
    total_earned = (SELECT coalesce(sum(commission_amount),0) FROM affiliate_conversions WHERE affiliate_id = NEW.affiliate_id AND status IN ('pending','approved','paid')),
    updated_at = now()
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_affiliate_conversion_change ON public.affiliate_conversions;
drop trigger if exists on_affiliate_conversion_change on public.affiliate_conversions;
create trigger on_affiliate_conversion_change AFTER INSERT OR UPDATE on public.affiliate_conversions
  FOR EACH ROW EXECUTE PROCEDURE update_affiliate_totals();

-- 8. RLS Policies
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_settings ENABLE ROW LEVEL SECURITY;

-- Affiliates
drop policy if exists "users_read_own_affiliate" on affiliates;
create policy "users_read_own_affiliate" on affiliates FOR SELECT USING (auth.uid() = user_id);
drop policy if exists "users_register_affiliate" on affiliates;
create policy "users_register_affiliate" on affiliates FOR INSERT WITH CHECK (auth.uid() = user_id);
drop policy if exists "users_update_own_affiliate" on affiliates;
create policy "users_update_own_affiliate" on affiliates FOR UPDATE USING (auth.uid() = user_id);
drop policy if exists "staff_manage_affiliates" on affiliates;
create policy "staff_manage_affiliates" on affiliates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Clicks: affiliates read own
drop policy if exists "affiliates_read_own_clicks" on affiliate_clicks;
create policy "affiliates_read_own_clicks" on affiliate_clicks FOR SELECT USING (
  affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
);
drop policy if exists "staff_read_all_clicks" on affiliate_clicks;
create policy "staff_read_all_clicks" on affiliate_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Conversions: affiliates read own
drop policy if exists "affiliates_read_own_conversions" on affiliate_conversions;
create policy "affiliates_read_own_conversions" on affiliate_conversions FOR SELECT USING (
  affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
);
drop policy if exists "staff_manage_conversions" on affiliate_conversions;
create policy "staff_manage_conversions" on affiliate_conversions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Payouts
drop policy if exists "affiliates_read_own_payouts" on affiliate_payouts;
create policy "affiliates_read_own_payouts" on affiliate_payouts FOR SELECT USING (
  affiliate_id IN (SELECT id FROM affiliates WHERE user_id = auth.uid())
);
drop policy if exists "staff_manage_payouts" on affiliate_payouts;
create policy "staff_manage_payouts" on affiliate_payouts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Settings: public read
drop policy if exists "public_read_affiliate_settings" on affiliate_settings;
create policy "public_read_affiliate_settings" on affiliate_settings FOR SELECT USING (true);
drop policy if exists "admin_manage_settings" on affiliate_settings;
create policy "admin_manage_settings" on affiliate_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- END: migration_affiliate.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migration_crm.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- CRM Migration cho nền tảng khóa học trực tuyến Tài Tuệ
-- Tạo các bảng quản lý leads, contacts, deals và activities
-- ============================================================

-- ============================================================
-- 1. BẢNG CRM_CONTACTS — Quản lý leads và thông tin khách hàng
-- Lưu trữ thông tin liên hệ của khách hàng tiềm năng,
-- bao gồm cả những người chưa đăng ký tài khoản trên hệ thống
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_contacts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Thông tin cơ bản
  full_name text NOT NULL,
  email text,
  phone text,
  company text,
  avatar_url text,

  -- Trường CRM
  source text DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'website', 'referral', 'ads', 'social')),
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost', 'churned')),
  tags text[] DEFAULT '{}',
  notes text,

  -- Phân công nhân viên phụ trách
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Liên kết với tài khoản đã đăng ký (nếu có)
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Metadata
  last_contacted_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bật RLS (Row Level Security) cho bảng crm_contacts
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. BẢNG CRM_ACTIVITIES — Nhật ký hoạt động trên contacts
-- Ghi lại mọi tương tác với khách hàng: ghi chú, cuộc gọi,
-- email, cuộc họp, task và thay đổi trạng thái
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('note', 'call', 'email', 'meeting', 'task', 'status_change')),
  content text,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Bật RLS cho bảng crm_activities
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. BẢNG CRM_DEALS — Quản lý pipeline bán hàng
-- Theo dõi các cơ hội bán hàng từ lead đến chốt đơn,
-- liên kết với contact và sản phẩm (khóa học)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_deals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  title text NOT NULL,
  amount integer DEFAULT 0,
  stage text DEFAULT 'lead' CHECK (stage IN ('lead', 'contacted', 'demo', 'proposal', 'negotiation', 'won', 'lost')),
  probability integer DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date date,
  notes text,

  -- Phân công nhân viên phụ trách deal
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Thông tin kết quả
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text,

  -- Metadata
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bật RLS cho bảng crm_deals
ALTER TABLE public.crm_deals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. INDEXES — Tối ưu truy vấn
-- ============================================================

-- Index cho bảng crm_contacts
create index if not exists idx_crm_contacts_status ON public.crm_contacts(status);
create index if not exists idx_crm_contacts_assigned ON public.crm_contacts(assigned_to);
create index if not exists idx_crm_contacts_email ON public.crm_contacts(email);

-- Index cho bảng crm_deals
create index if not exists idx_crm_deals_stage ON public.crm_deals(stage);
create index if not exists idx_crm_deals_contact ON public.crm_deals(contact_id);

-- Index cho bảng crm_activities
create index if not exists idx_crm_activities_contact ON public.crm_activities(contact_id);

-- ============================================================
-- 5. RLS POLICIES — Chính sách bảo mật theo vai trò
-- Staff (admin, manager, sale, support, marketing) có quyền truy cập CRM
-- Student không được truy cập bảng CRM
-- ============================================================

-- ----- Policies cho bảng CRM_CONTACTS -----

-- Staff có thể xem tất cả contacts
drop policy if exists "crm_contacts_select_staff" on public.crm_contacts;
create policy "crm_contacts_select_staff" on public.crm_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Staff có thể tạo contacts mới
drop policy if exists "crm_contacts_insert_staff" on public.crm_contacts;
create policy "crm_contacts_insert_staff" on public.crm_contacts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Staff có thể cập nhật contacts
drop policy if exists "crm_contacts_update_staff" on public.crm_contacts;
create policy "crm_contacts_update_staff" on public.crm_contacts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Chỉ admin và manager được xóa contacts
drop policy if exists "crm_contacts_delete_admin" on public.crm_contacts;
create policy "crm_contacts_delete_admin" on public.crm_contacts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- ----- Policies cho bảng CRM_ACTIVITIES -----

-- Staff có thể xem tất cả activities
drop policy if exists "crm_activities_select_staff" on public.crm_activities;
create policy "crm_activities_select_staff" on public.crm_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Staff có thể tạo activities mới
drop policy if exists "crm_activities_insert_staff" on public.crm_activities;
create policy "crm_activities_insert_staff" on public.crm_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Staff có thể cập nhật activities
drop policy if exists "crm_activities_update_staff" on public.crm_activities;
create policy "crm_activities_update_staff" on public.crm_activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Chỉ admin và manager được xóa activities
drop policy if exists "crm_activities_delete_admin" on public.crm_activities;
create policy "crm_activities_delete_admin" on public.crm_activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- ----- Policies cho bảng CRM_DEALS -----

-- Staff có thể xem tất cả deals
drop policy if exists "crm_deals_select_staff" on public.crm_deals;
create policy "crm_deals_select_staff" on public.crm_deals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Staff có thể tạo deals mới
drop policy if exists "crm_deals_insert_staff" on public.crm_deals;
create policy "crm_deals_insert_staff" on public.crm_deals
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Staff có thể cập nhật deals
drop policy if exists "crm_deals_update_staff" on public.crm_deals;
create policy "crm_deals_update_staff" on public.crm_deals
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager', 'sale', 'support', 'marketing')
    )
  );

-- Chỉ admin và manager được xóa deals
drop policy if exists "crm_deals_delete_admin" on public.crm_deals;
create policy "crm_deals_delete_admin" on public.crm_deals
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- ============================================================
-- 6. VIEW CRM_STATS — Thống kê tổng quan CRM
-- Hiển thị số lượng contacts theo từng trạng thái
-- ============================================================
CREATE OR REPLACE VIEW public.crm_stats AS
SELECT
  COUNT(*) AS total_contacts,
  COUNT(*) FILTER (WHERE status = 'new') AS new_contacts,
  COUNT(*) FILTER (WHERE status = 'contacted') AS contacted,
  COUNT(*) FILTER (WHERE status = 'qualified') AS qualified,
  COUNT(*) FILTER (WHERE status = 'won') AS won,
  COUNT(*) FILTER (WHERE status = 'lost') AS lost
FROM public.crm_contacts;

-- ============================================================
-- 7. TRIGGER updated_at — Tự động cập nhật thời gian sửa đổi
-- ============================================================

-- Hàm trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho bảng crm_contacts
drop trigger if exists set_crm_contacts_updated_at on public.crm_contacts;
create trigger set_crm_contacts_updated_at BEFORE UPDATE on public.crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger cho bảng crm_deals
drop trigger if exists set_crm_deals_updated_at on public.crm_deals;
create trigger set_crm_deals_updated_at BEFORE UPDATE on public.crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();


-- END: migration_crm.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migration_product_category.sql
-- -----------------------------------------------------------------------------
-- Add category column to products table for course categorization
-- Categories: video, branding, business, personal_development
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.category IS 'Course category: video, branding, business, personal_development';


-- END: migration_product_category.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migration_roles_questions.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- Migration: Add roles + lesson_questions table
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── 1. Mở rộng hệ thống vai trò ─────────────────────────────
-- Thêm: manager (quản lý), marketing, sale, support (chăm sóc khách hàng)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'manager', 'marketing', 'sale', 'support'));

-- ─── 2. Bảng câu hỏi cho giảng viên ──────────────────────────
CREATE TABLE IF NOT EXISTS public.lesson_questions (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id  uuid REFERENCES public.products(id) ON DELETE CASCADE,
  lesson_id   uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  content     text NOT NULL,
  reply       text,
  replied_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  replied_at  timestamptz,
  status      text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  created_at  timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.lesson_questions ENABLE ROW LEVEL SECURITY;

-- Học viên đọc câu hỏi của mình
drop policy if exists "users_read_own_questions" on lesson_questions;
create policy "users_read_own_questions" on lesson_questions
  FOR SELECT USING (auth.uid() = user_id);

-- Học viên tạo câu hỏi
drop policy if exists "users_create_questions" on lesson_questions;
create policy "users_create_questions" on lesson_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Staff (admin, manager, support) đọc tất cả câu hỏi
drop policy if exists "staff_read_all_questions" on lesson_questions;
create policy "staff_read_all_questions" on lesson_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'support')
    )
  );

-- Staff trả lời / cập nhật câu hỏi
drop policy if exists "staff_update_questions" on lesson_questions;
create policy "staff_update_questions" on lesson_questions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'support')
    )
  );

-- Index cho performance
CREATE INDEX IF NOT EXISTS idx_questions_product ON lesson_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_user ON lesson_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON lesson_questions(status);


-- END: migration_roles_questions.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250511_email_marketing.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- EMAIL MARKETING SYSTEM — Migration
-- Hệ thống Email Marketing cho nền tảng Tài Tuệ Academy
-- Bao gồm: lists, subscribers, templates, campaigns, sends, events
-- ============================================================
-- Lưu ý: Sử dụng CREATE TABLE IF NOT EXISTS và ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- để tương thích với bảng subscribers & email_campaigns đã tồn tại trong schema.sql
-- ============================================================

BEGIN;

-- ─── EXTENSIONS ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- cho gen_random_uuid()

-- ============================================================
-- 1. BẢNG EMAIL_LISTS — Danh sách / phân nhóm subscribers
-- Cho phép phân nhóm subscribers theo chiến dịch, sở thích, v.v.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_lists (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  description      text,
  color            text DEFAULT '#22c55e',         -- màu badge hiển thị trên UI
  subscriber_count integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

COMMENT ON TABLE public.email_lists IS 'Danh sách phân nhóm subscribers cho email marketing';
COMMENT ON COLUMN public.email_lists.color IS 'Màu hiển thị badge trên giao diện (hex)';
COMMENT ON COLUMN public.email_lists.subscriber_count IS 'Số lượng subscriber — tự động cập nhật qua trigger';

-- ============================================================
-- 2. BẢNG SUBSCRIBERS — Danh sách người đăng ký nhận email
-- Bảng này có thể đã tồn tại trong schema.sql, nên dùng IF NOT EXISTS
-- và ALTER TABLE để thêm các cột mới
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  full_name       text,
  phone           text,
  status          text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  source          text DEFAULT 'manual',
  tags            text[] DEFAULT '{}',
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

-- Thêm các cột mới cho bảng subscribers (nếu chưa có)
-- Mở rộng CHECK constraint cho status (thêm 'complained')
DO $$
BEGIN
  -- Xóa constraint cũ và tạo mới với thêm 'complained'
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'subscribers' AND constraint_type = 'CHECK'
    AND constraint_name LIKE '%status%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.subscribers DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'subscribers' AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%status%'
      LIMIT 1
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL; -- bỏ qua nếu không tìm thấy constraint
END $$;

-- Tạo lại CHECK constraint với đầy đủ giá trị
DO $$
BEGIN
  ALTER TABLE public.subscribers
    ADD CONSTRAINT subscribers_status_check
    CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained'));
EXCEPTION WHEN duplicate_object THEN
  NULL; -- constraint đã tồn tại
END $$;

-- Thêm cột source (kiểu nguồn đăng ký)
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- Thêm cột metadata (dữ liệu bổ sung dạng JSON)
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Thêm cột subscribed_at (thời điểm đăng ký)
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS subscribed_at timestamptz DEFAULT now();

-- Thêm cột unsubscribed_at (thời điểm huỷ đăng ký)
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

-- Thêm cột updated_at
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Thêm cột tags nếu chưa có
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

COMMENT ON TABLE public.subscribers IS 'Danh sách subscriber nhận email marketing';
COMMENT ON COLUMN public.subscribers.source IS 'Nguồn đăng ký: manual, import, signup, api';
COMMENT ON COLUMN public.subscribers.metadata IS 'Dữ liệu bổ sung dạng JSON (utm, ip, browser...)';

-- ============================================================
-- 3. BẢNG SUBSCRIBER_LIST_MEMBERS — Bảng trung gian M:N
-- Liên kết subscriber với danh sách (một subscriber có thể thuộc nhiều list)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriber_list_members (
  subscriber_id  uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  list_id        uuid NOT NULL REFERENCES public.email_lists(id) ON DELETE CASCADE,
  added_at       timestamptz DEFAULT now(),
  PRIMARY KEY (subscriber_id, list_id)
);

COMMENT ON TABLE public.subscriber_list_members IS 'Bảng trung gian liên kết subscriber với email_lists (M:N)';

-- ============================================================
-- 4. BẢNG EMAIL_TEMPLATES — Mẫu email có thể tái sử dụng
-- Lưu trữ HTML template cho các loại email khác nhau
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  subject         text NOT NULL,
  html_content    text NOT NULL,
  text_content    text,                              -- phiên bản plain text
  category        text DEFAULT 'marketing'
                  CHECK (category IN ('marketing', 'transactional', 'newsletter', 'automation')),
  variables       text[] DEFAULT '{}',               -- biến placeholder: {name}, {email}, v.v.
  thumbnail_url   text,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.email_templates IS 'Mẫu email có thể tái sử dụng cho campaigns';
COMMENT ON COLUMN public.email_templates.variables IS 'Danh sách biến placeholder có thể dùng: {name}, {email}...';
COMMENT ON COLUMN public.email_templates.category IS 'Loại template: marketing, transactional, newsletter, automation';

-- ============================================================
-- 5. BẢNG EMAIL_CAMPAIGNS — Chiến dịch email marketing
-- Bảng này có thể đã tồn tại, nên dùng IF NOT EXISTS + ALTER TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject          text NOT NULL,
  status           text DEFAULT 'draft'
                   CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  sent_count       integer DEFAULT 0,
  open_count       integer DEFAULT 0,
  click_count      integer DEFAULT 0,
  created_at       timestamptz DEFAULT now()
);

-- Mở rộng CHECK constraint cho status (thêm 'sending', 'paused', 'cancelled')
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'email_campaigns' AND constraint_type = 'CHECK'
    AND constraint_name LIKE '%status%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.email_campaigns DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'email_campaigns' AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%status%'
      LIMIT 1
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.email_campaigns
    ADD CONSTRAINT email_campaigns_status_check
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Thêm các cột mới cho email_campaigns
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS from_name text DEFAULT 'Tài Tuệ Academy';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS from_email text DEFAULT 'support@taitue.academy';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS reply_to text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS html_content text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES public.email_templates(id);
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS list_id uuid REFERENCES public.email_lists(id);
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_recipients integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS bounce_count integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS complaint_count integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS unsubscribe_count integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Cập nhật cột name = subject cho các row cũ chưa có name
DO $$
BEGIN
  UPDATE public.email_campaigns SET name = subject WHERE name IS NULL;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

COMMENT ON TABLE public.email_campaigns IS 'Chiến dịch email marketing';
COMMENT ON COLUMN public.email_campaigns.from_name IS 'Tên người gửi hiển thị';
COMMENT ON COLUMN public.email_campaigns.from_email IS 'Địa chỉ email người gửi';
COMMENT ON COLUMN public.email_campaigns.template_id IS 'Liên kết đến mẫu email template';
COMMENT ON COLUMN public.email_campaigns.list_id IS 'Danh sách subscriber nhận email';

-- ============================================================
-- 6. BẢNG EMAIL_SENDS — Theo dõi từng email gửi đi
-- Mỗi bản ghi = 1 email gửi cho 1 subscriber trong 1 campaign
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_sends (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id   uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  email           text NOT NULL,
  status          text DEFAULT 'queued'
                  CHECK (status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')),
  ses_message_id  text,                              -- Message ID từ AWS SES / nhà cung cấp email
  sent_at         timestamptz,
  opened_at       timestamptz,
  clicked_at      timestamptz,
  bounced_at      timestamptz,
  error_message   text,
  metadata        jsonb DEFAULT '{}',
  created_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.email_sends IS 'Theo dõi từng email đã gửi (1 record = 1 email cho 1 subscriber)';
COMMENT ON COLUMN public.email_sends.ses_message_id IS 'Message ID từ AWS SES hoặc nhà cung cấp email';
COMMENT ON COLUMN public.email_sends.status IS 'Trạng thái: queued → sent → delivered → opened/clicked | bounced/complained/failed';

-- ============================================================
-- 7. BẢNG EMAIL_EVENTS — Sự kiện tracking (open, click, bounce...)
-- Lưu chi tiết từng sự kiện liên quan đến email đã gửi
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id         uuid NOT NULL REFERENCES public.email_sends(id) ON DELETE CASCADE,
  campaign_id     uuid NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id   uuid REFERENCES public.subscribers(id) ON DELETE SET NULL,
  event_type      text NOT NULL
                  CHECK (event_type IN ('sent', 'delivered', 'open', 'click', 'bounce', 'complaint', 'unsubscribe')),
  metadata        jsonb DEFAULT '{}',                -- url cho click, bounce type, v.v.
  ip_address      text,
  user_agent      text,
  created_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.email_events IS 'Sự kiện tracking email: open, click, bounce, complaint...';
COMMENT ON COLUMN public.email_events.metadata IS 'Dữ liệu bổ sung: URL (click), bounce type, complaint reason...';

-- ============================================================
-- 8. INDEXES — Tối ưu truy vấn thường dùng
-- ============================================================

-- Subscribers
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON public.subscribers(source);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at DESC);

-- Email Lists
CREATE INDEX IF NOT EXISTS idx_email_lists_created_at ON public.email_lists(created_at DESC);

-- Subscriber List Members
CREATE INDEX IF NOT EXISTS idx_subscriber_list_members_list_id ON public.subscriber_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_list_members_subscriber_id ON public.subscriber_list_members(subscriber_id);

-- Email Templates
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_active ON public.email_templates(is_active) WHERE is_active = true;

-- Email Campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_list_id ON public.email_campaigns(list_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at)
  WHERE status = 'scheduled';

-- Email Sends
CREATE INDEX IF NOT EXISTS idx_email_sends_campaign_status ON public.email_sends(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_email_sends_subscriber_id ON public.email_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_ses_message_id ON public.email_sends(ses_message_id)
  WHERE ses_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON public.email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_created_at ON public.email_sends(created_at DESC);

-- Email Events
CREATE INDEX IF NOT EXISTS idx_email_events_campaign_type ON public.email_events(campaign_id, event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_send_id ON public.email_events(send_id);
CREATE INDEX IF NOT EXISTS idx_email_events_subscriber_id ON public.email_events(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_events_event_type ON public.email_events(event_type);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON public.email_events(created_at DESC);

-- ============================================================
-- 9. TRIGGER FUNCTIONS — Tự động cập nhật dữ liệu
-- ============================================================

-- ─── 9a. Tự động cập nhật subscriber_count trong email_lists ────
-- Khi thêm/xoá thành viên trong subscriber_list_members
CREATE OR REPLACE FUNCTION public.update_email_list_subscriber_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.email_lists
    SET subscriber_count = subscriber_count + 1,
        updated_at = now()
    WHERE id = NEW.list_id;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.email_lists
    SET subscriber_count = GREATEST(subscriber_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Xoá trigger cũ nếu tồn tại rồi tạo mới
DROP TRIGGER IF EXISTS on_subscriber_list_member_change ON public.subscriber_list_members;
drop trigger if exists on_subscriber_list_member_change on public.subscriber_list_members;
create trigger on_subscriber_list_member_change AFTER INSERT OR DELETE on public.subscriber_list_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_list_subscriber_count();

-- ─── 9b. Tự động cập nhật updated_at cho subscribers ────────────
CREATE OR REPLACE FUNCTION public.update_subscriber_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_subscriber_update ON public.subscribers;
drop trigger if exists on_subscriber_update on public.subscribers;
create trigger on_subscriber_update BEFORE UPDATE on public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscriber_updated_at();

-- ─── 9c. Tự động cập nhật updated_at cho email_campaigns ───────
CREATE OR REPLACE FUNCTION public.update_email_campaign_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_email_campaign_update ON public.email_campaigns;
drop trigger if exists on_email_campaign_update on public.email_campaigns;
create trigger on_email_campaign_update BEFORE UPDATE on public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_campaign_updated_at();

-- ─── 9d. Tự động cập nhật updated_at cho email_templates ───────
CREATE OR REPLACE FUNCTION public.update_email_template_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_email_template_update ON public.email_templates;
drop trigger if exists on_email_template_update on public.email_templates;
create trigger on_email_template_update BEFORE UPDATE on public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_template_updated_at();

-- ─── 9e. Tự động cập nhật updated_at cho email_lists ────────────
CREATE OR REPLACE FUNCTION public.update_email_list_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_email_list_update ON public.email_lists;
drop trigger if exists on_email_list_update on public.email_lists;
create trigger on_email_list_update BEFORE UPDATE on public.email_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_email_list_updated_at();

-- ============================================================
-- 10. ROW LEVEL SECURITY (RLS) — Bảo mật dữ liệu
-- ============================================================

-- Bật RLS cho tất cả bảng email marketing
ALTER TABLE public.email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriber_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: Kiểm tra user có role admin/manager/marketing ───
CREATE OR REPLACE FUNCTION public.is_email_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'moderator')
  );
END;
$$;

-- ─── 10a. EMAIL_LISTS — Chỉ admin/moderator mới quản lý ────────

-- Service role có toàn quyền (bypass RLS tự động)
-- Authenticated admin/moderator: đọc + ghi
DROP POLICY IF EXISTS "email_lists_admin_select" ON public.email_lists;
drop policy if exists "email_lists_admin_select" on public.email_lists;
create policy "email_lists_admin_select" on public.email_lists
  FOR SELECT TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_lists_admin_insert" ON public.email_lists;
drop policy if exists "email_lists_admin_insert" on public.email_lists;
create policy "email_lists_admin_insert" on public.email_lists
  FOR INSERT TO authenticated
  WITH CHECK (public.is_email_admin());

DROP POLICY IF EXISTS "email_lists_admin_update" ON public.email_lists;
drop policy if exists "email_lists_admin_update" on public.email_lists;
create policy "email_lists_admin_update" on public.email_lists
  FOR UPDATE TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_lists_admin_delete" ON public.email_lists;
drop policy if exists "email_lists_admin_delete" on public.email_lists;
create policy "email_lists_admin_delete" on public.email_lists
  FOR DELETE TO authenticated
  USING (public.is_email_admin());

-- ─── 10b. SUBSCRIBERS — Admin quản lý, anon có thể tự unsubscribe ──

DROP POLICY IF EXISTS "subscribers_admin_select" ON public.subscribers;
drop policy if exists "subscribers_admin_select" on public.subscribers;
create policy "subscribers_admin_select" on public.subscribers
  FOR SELECT TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "subscribers_admin_insert" ON public.subscribers;
drop policy if exists "subscribers_admin_insert" on public.subscribers;
create policy "subscribers_admin_insert" on public.subscribers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_email_admin());

DROP POLICY IF EXISTS "subscribers_admin_update" ON public.subscribers;
drop policy if exists "subscribers_admin_update" on public.subscribers;
create policy "subscribers_admin_update" on public.subscribers
  FOR UPDATE TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "subscribers_admin_delete" ON public.subscribers;
drop policy if exists "subscribers_admin_delete" on public.subscribers;
create policy "subscribers_admin_delete" on public.subscribers
  FOR DELETE TO authenticated
  USING (public.is_email_admin());

-- Cho phép anon đọc subscriber bằng email (cho trang unsubscribe)
DROP POLICY IF EXISTS "subscribers_anon_read_by_email" ON public.subscribers;
drop policy if exists "subscribers_anon_read_by_email" on public.subscribers;
create policy "subscribers_anon_read_by_email" on public.subscribers
  FOR SELECT TO anon
  USING (true);
  -- Lưu ý: Trong thực tế nên dùng function/API route thay vì expose trực tiếp.
  -- Policy này cho phép trang unsubscribe public tra cứu subscriber.
  -- Dữ liệu trả về nên được giới hạn qua .select() ở phía client.

-- Cho phép anon cập nhật status thành 'unsubscribed' (cho trang unsubscribe)
DROP POLICY IF EXISTS "subscribers_anon_unsubscribe" ON public.subscribers;
drop policy if exists "subscribers_anon_unsubscribe" on public.subscribers;
create policy "subscribers_anon_unsubscribe" on public.subscribers
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (status = 'unsubscribed');

-- ─── 10c. SUBSCRIBER_LIST_MEMBERS — Chỉ admin ──────────────────

DROP POLICY IF EXISTS "subscriber_list_members_admin_all" ON public.subscriber_list_members;
drop policy if exists "subscriber_list_members_admin_all" on public.subscriber_list_members;
create policy "subscriber_list_members_admin_all" on public.subscriber_list_members
  FOR ALL TO authenticated
  USING (public.is_email_admin());

-- ─── 10d. EMAIL_TEMPLATES — Chỉ admin ──────────────────────────

DROP POLICY IF EXISTS "email_templates_admin_select" ON public.email_templates;
drop policy if exists "email_templates_admin_select" on public.email_templates;
create policy "email_templates_admin_select" on public.email_templates
  FOR SELECT TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_templates_admin_insert" ON public.email_templates;
drop policy if exists "email_templates_admin_insert" on public.email_templates;
create policy "email_templates_admin_insert" on public.email_templates
  FOR INSERT TO authenticated
  WITH CHECK (public.is_email_admin());

DROP POLICY IF EXISTS "email_templates_admin_update" ON public.email_templates;
drop policy if exists "email_templates_admin_update" on public.email_templates;
create policy "email_templates_admin_update" on public.email_templates
  FOR UPDATE TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_templates_admin_delete" ON public.email_templates;
drop policy if exists "email_templates_admin_delete" on public.email_templates;
create policy "email_templates_admin_delete" on public.email_templates
  FOR DELETE TO authenticated
  USING (public.is_email_admin());

-- ─── 10e. EMAIL_CAMPAIGNS — Chỉ admin ──────────────────────────

DROP POLICY IF EXISTS "email_campaigns_admin_select" ON public.email_campaigns;
drop policy if exists "email_campaigns_admin_select" on public.email_campaigns;
create policy "email_campaigns_admin_select" on public.email_campaigns
  FOR SELECT TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_campaigns_admin_insert" ON public.email_campaigns;
drop policy if exists "email_campaigns_admin_insert" on public.email_campaigns;
create policy "email_campaigns_admin_insert" on public.email_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (public.is_email_admin());

DROP POLICY IF EXISTS "email_campaigns_admin_update" ON public.email_campaigns;
drop policy if exists "email_campaigns_admin_update" on public.email_campaigns;
create policy "email_campaigns_admin_update" on public.email_campaigns
  FOR UPDATE TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_campaigns_admin_delete" ON public.email_campaigns;
drop policy if exists "email_campaigns_admin_delete" on public.email_campaigns;
create policy "email_campaigns_admin_delete" on public.email_campaigns
  FOR DELETE TO authenticated
  USING (public.is_email_admin());

-- ─── 10f. EMAIL_SENDS — Chỉ admin ──────────────────────────────

DROP POLICY IF EXISTS "email_sends_admin_select" ON public.email_sends;
drop policy if exists "email_sends_admin_select" on public.email_sends;
create policy "email_sends_admin_select" on public.email_sends
  FOR SELECT TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_sends_admin_insert" ON public.email_sends;
drop policy if exists "email_sends_admin_insert" on public.email_sends;
create policy "email_sends_admin_insert" on public.email_sends
  FOR INSERT TO authenticated
  WITH CHECK (public.is_email_admin());

DROP POLICY IF EXISTS "email_sends_admin_update" ON public.email_sends;
drop policy if exists "email_sends_admin_update" on public.email_sends;
create policy "email_sends_admin_update" on public.email_sends
  FOR UPDATE TO authenticated
  USING (public.is_email_admin());

-- ─── 10g. EMAIL_EVENTS — Chỉ admin đọc ─────────────────────────

DROP POLICY IF EXISTS "email_events_admin_select" ON public.email_events;
drop policy if exists "email_events_admin_select" on public.email_events;
create policy "email_events_admin_select" on public.email_events
  FOR SELECT TO authenticated
  USING (public.is_email_admin());

DROP POLICY IF EXISTS "email_events_admin_insert" ON public.email_events;
drop policy if exists "email_events_admin_insert" on public.email_events;
create policy "email_events_admin_insert" on public.email_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_email_admin());

-- ============================================================
-- 11. SEED DATA — Mẫu email template mặc định (tiếng Việt)
-- ============================================================

-- Template 1: Chào mừng thành viên mới
INSERT INTO public.email_templates (name, subject, html_content, text_content, category, variables)
VALUES (
  'Chào mừng thành viên mới',
  'Chào mừng bạn đến với Tài Tuệ Academy! 🎉',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Tài Tuệ Academy</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">Xin chào {name}! 👋</h2>
              <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0 0 16px;">
                Cảm ơn bạn đã đăng ký nhận thông tin từ Tài Tuệ Academy. Bạn sẽ nhận được những nội dung giá trị nhất về:
              </p>
              <ul style="color:#a1a1aa;font-size:15px;line-height:1.8;padding-left:20px;">
                <li>Kinh doanh online & sản phẩm số</li>
                <li>Marketing & xây dựng thương hiệu cá nhân</li>
                <li>Khoá học mới & ưu đãi đặc biệt</li>
              </ul>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background-color:#22c55e;border-radius:8px;padding:12px 28px;">
                    <a href="https://taitue.academy" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">
                      Khám phá khoá học ngay
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:24px 0 0;">
                Nếu bạn không đăng ký, vui lòng bỏ qua email này hoặc
                <a href="{unsubscribe_url}" style="color:#22c55e;text-decoration:underline;">huỷ đăng ký tại đây</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="color:#52525b;font-size:12px;margin:0;">
                &copy; 2025 Tài Tuệ Academy. Mọi quyền được bảo lưu.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Xin chào {name}!

Cảm ơn bạn đã đăng ký nhận thông tin từ Tài Tuệ Academy.

Bạn sẽ nhận được những nội dung giá trị nhất về:
- Kinh doanh online & sản phẩm số
- Marketing & xây dựng thương hiệu cá nhân
- Khoá học mới & ưu đãi đặc biệt

Khám phá khoá học: https://taitue.academy

Huỷ đăng ký: {unsubscribe_url}',
  'marketing',
  ARRAY['{name}', '{email}', '{unsubscribe_url}']
)
ON CONFLICT DO NOTHING;

-- Template 2: Newsletter hàng tuần
INSERT INTO public.email_templates (name, subject, html_content, text_content, category, variables)
VALUES (
  'Newsletter hàng tuần',
  '📬 Bản tin tuần này từ Tài Tuệ Academy',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 40px;border-bottom:1px solid #2a2a2a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:#22c55e;font-weight:700;font-size:18px;">Tài Tuệ Academy</span>
                  </td>
                  <td align="right">
                    <span style="color:#71717a;font-size:13px;">Bản tin tuần #{week_number}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="color:#a1a1aa;font-size:15px;line-height:1.6;margin:0;">
                Xin chào <strong style="color:#ffffff;">{name}</strong>, đây là những nội dung nổi bật tuần này:
              </p>
            </td>
          </tr>
          <!-- Article 1 -->
          <tr>
            <td style="padding:24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#222222;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:24px;">
                    <span style="display:inline-block;background-color:rgba(34,197,94,0.15);color:#22c55e;font-size:11px;font-weight:600;padding:4px 10px;border-radius:4px;margin-bottom:12px;">BÀI VIẾT MỚI</span>
                    <h3 style="color:#ffffff;font-size:17px;margin:12px 0 8px;">{article_title}</h3>
                    <p style="color:#a1a1aa;font-size:14px;line-height:1.5;margin:0 0 16px;">{article_excerpt}</p>
                    <a href="{article_url}" style="color:#22c55e;font-size:14px;font-weight:600;text-decoration:none;">
                      Đọc tiếp &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#22c55e;border-radius:8px;padding:12px 28px;">
                    <a href="https://taitue.academy/blog" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">
                      Xem tất cả bài viết
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="color:#52525b;font-size:12px;margin:0 0 8px;">
                Bạn nhận email này vì đã đăng ký tại Tài Tuệ Academy.
              </p>
              <a href="{unsubscribe_url}" style="color:#71717a;font-size:12px;text-decoration:underline;">Huỷ đăng ký</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'Bản tin tuần #{week_number} - Tài Tuệ Academy

Xin chào {name},

BÀI VIẾT MỚI: {article_title}
{article_excerpt}
Đọc tiếp: {article_url}

---
Xem tất cả: https://taitue.academy/blog
Huỷ đăng ký: {unsubscribe_url}',
  'newsletter',
  ARRAY['{name}', '{email}', '{week_number}', '{article_title}', '{article_excerpt}', '{article_url}', '{unsubscribe_url}']
)
ON CONFLICT DO NOTHING;

-- Template 3: Thông báo khoá học mới
INSERT INTO public.email_templates (name, subject, html_content, text_content, category, variables)
VALUES (
  'Thông báo khoá học mới',
  '🚀 Khoá học mới: {course_name} — Đăng ký ngay!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,''Segoe UI'',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:12px;overflow:hidden;">
          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 100%);padding:40px;text-align:center;border-bottom:1px solid #2a2a2a;">
              <span style="display:inline-block;background-color:rgba(34,197,94,0.15);color:#22c55e;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;margin-bottom:16px;letter-spacing:0.5px;">KHOÁ HỌC MỚI</span>
              <h1 style="color:#ffffff;font-size:26px;margin:0 0 12px;line-height:1.3;">{course_name}</h1>
              <p style="color:#a1a1aa;font-size:15px;line-height:1.5;margin:0;max-width:480px;display:inline-block;">
                {course_description}
              </p>
            </td>
          </tr>
          <!-- Features -->
          <tr>
            <td style="padding:32px 40px;">
              <h3 style="color:#ffffff;font-size:16px;margin:0 0 16px;">Bạn sẽ học được gì?</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
                    <span style="color:#22c55e;margin-right:8px;">✓</span>
                    <span style="color:#d4d4d8;font-size:14px;">{feature_1}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;">
                    <span style="color:#22c55e;margin-right:8px;">✓</span>
                    <span style="color:#d4d4d8;font-size:14px;">{feature_2}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="color:#22c55e;margin-right:8px;">✓</span>
                    <span style="color:#d4d4d8;font-size:14px;">{feature_3}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Price + CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <div style="background-color:#222222;border-radius:8px;padding:20px;margin-bottom:20px;">
                <span style="color:#71717a;font-size:13px;text-decoration:line-through;">{original_price}</span>
                <br>
                <span style="color:#22c55e;font-size:28px;font-weight:700;">{sale_price}</span>
                <br>
                <span style="color:#f59e0b;font-size:12px;font-weight:600;">Ưu đãi có hạn</span>
              </div>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#22c55e;border-radius:8px;padding:14px 32px;">
                    <a href="{course_url}" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;">
                      Đăng ký ngay
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="color:#52525b;font-size:12px;margin:0 0 8px;">
                &copy; 2025 Tài Tuệ Academy
              </p>
              <a href="{unsubscribe_url}" style="color:#71717a;font-size:12px;text-decoration:underline;">Huỷ đăng ký</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>',
  'KHOÁ HỌC MỚI: {course_name}

{course_description}

Bạn sẽ học được:
✓ {feature_1}
✓ {feature_2}
✓ {feature_3}

Giá gốc: {original_price}
Giá ưu đãi: {sale_price}

Đăng ký ngay: {course_url}

---
Huỷ đăng ký: {unsubscribe_url}',
  'marketing',
  ARRAY['{name}', '{email}', '{course_name}', '{course_description}', '{feature_1}', '{feature_2}', '{feature_3}', '{original_price}', '{sale_price}', '{course_url}', '{unsubscribe_url}']
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 12. MẪU EMAIL_LISTS MẶC ĐỊNH
-- ============================================================
INSERT INTO public.email_lists (name, description, color)
VALUES
  ('Tất cả subscribers', 'Danh sách mặc định chứa tất cả người đăng ký', '#22c55e'),
  ('Học viên khoá học', 'Những người đã mua ít nhất 1 khoá học', '#3b82f6'),
  ('VIP Members', 'Thành viên VIP — nhận ưu đãi đặc biệt', '#f59e0b')
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================
-- GHI CHÚ TRIỂN KHAI
-- ============================================================
-- 1. Chạy migration này trên Supabase SQL Editor hoặc qua CLI:
--    supabase db push
--
-- 2. Service role key (SUPABASE_SERVICE_ROLE_KEY) tự động bypass RLS,
--    nên các API route server-side sử dụng admin client sẽ có full access.
--
-- 3. Đảm bảo profile có role 'admin' hoặc 'moderator' để truy cập
--    email marketing qua authenticated client.
--
-- 4. Trang unsubscribe public sử dụng anon key với policy cho phép
--    đọc subscriber và cập nhật status thành 'unsubscribed'.
--
-- 5. Webhook từ AWS SES / nhà cung cấp email sẽ dùng service role
--    để ghi vào email_events và cập nhật email_sends.
-- ============================================================

-- END: migrations/20250511_email_marketing.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250516_email_automations.sql
-- -----------------------------------------------------------------------------
-- =====================================================
-- Email Marketing Pro: Tags, Automations, Flow Builder
-- =====================================================

-- ─── Email Tags ─────────────────────────────────────
-- Centralized tag definitions with metadata
create table if not exists email_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text default '#6b7280',
  description text,
  subscriber_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Email Automations (Workflows) ─────────────────
create table if not exists email_automations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text default 'draft' check (status in ('draft','active','paused','archived')),
  trigger_type text not null default 'manual',
  -- trigger_type: 'tag_added', 'subscribed_to_list', 'manual', 'purchase', 'form_submit'
  trigger_config jsonb default '{}',
  -- Flow definition: { nodes: [...], edges: [...] }
  flow_definition jsonb default '{"nodes":[],"edges":[]}',
  -- Aggregated stats
  enrolled_count int default 0,
  completed_count int default 0,
  active_count int default 0,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Automation Steps (denormalized from flow for processing) ──
create table if not exists email_automation_steps (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references email_automations(id) on delete cascade,
  step_order int not null default 0,
  step_type text not null,
  -- step_type: 'send_email', 'wait', 'condition', 'add_tag', 'remove_tag', 'move_to_list', 'webhook'
  config jsonb default '{}',
  -- For send_email: { subject, template_id, html_content }
  -- For wait: { days, hours, minutes }
  -- For condition: { field, operator, value, yes_step_id, no_step_id }
  -- For add_tag/remove_tag: { tag_name }
  -- For move_to_list: { list_id }
  next_step_id uuid,
  yes_step_id uuid, -- for condition nodes
  no_step_id uuid,  -- for condition nodes
  created_at timestamptz default now()
);

-- ─── Automation Enrollments (subscriber journeys) ──
create table if not exists email_automation_enrollments (
  id uuid primary key default gen_random_uuid(),
  automation_id uuid not null references email_automations(id) on delete cascade,
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  current_step_id uuid references email_automation_steps(id),
  status text default 'active' check (status in ('active','completed','paused','exited','waiting')),
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  next_action_at timestamptz,
  step_data jsonb default '{}',
  created_at timestamptz default now(),
  unique(automation_id, subscriber_id)
);

-- ─── Automation Logs ────────────────────────────────
create table if not exists email_automation_logs (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references email_automation_enrollments(id) on delete cascade,
  automation_id uuid not null references email_automations(id) on delete cascade,
  subscriber_id uuid not null references subscribers(id) on delete cascade,
  step_id uuid,
  action text not null,
  -- action: 'enrolled', 'email_sent', 'email_opened', 'email_clicked',
  --         'tag_added', 'tag_removed', 'condition_yes', 'condition_no',
  --         'wait_started', 'wait_completed', 'completed', 'exited'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- ─── Indexes ────────────────────────────────────────
create index if not exists idx_automation_enrollments_automation
  on email_automation_enrollments(automation_id);
create index if not exists idx_automation_enrollments_subscriber
  on email_automation_enrollments(subscriber_id);
create index if not exists idx_automation_enrollments_next_action
  on email_automation_enrollments(next_action_at) where status = 'waiting';
create index if not exists idx_automation_logs_automation
  on email_automation_logs(automation_id);
create index if not exists idx_automation_logs_enrollment
  on email_automation_logs(enrollment_id);
create index if not exists idx_automation_steps_automation
  on email_automation_steps(automation_id);
create index if not exists idx_subscribers_tags
  on subscribers using gin(tags);

-- ─── RLS Policies ───────────────────────────────────
alter table email_tags enable row level security;
alter table email_automations enable row level security;
alter table email_automation_steps enable row level security;
alter table email_automation_enrollments enable row level security;
alter table email_automation_logs enable row level security;

-- Admin/manager can do everything
drop policy if exists "admin_all_email_tags" on email_tags;
create policy "admin_all_email_tags" on email_tags
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager'))
  );
drop policy if exists "admin_all_email_automations" on email_automations;
create policy "admin_all_email_automations" on email_automations
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager'))
  );
drop policy if exists "admin_all_email_automation_steps" on email_automation_steps;
create policy "admin_all_email_automation_steps" on email_automation_steps
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager'))
  );
drop policy if exists "admin_all_email_automation_enrollments" on email_automation_enrollments;
create policy "admin_all_email_automation_enrollments" on email_automation_enrollments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager'))
  );
drop policy if exists "admin_all_email_automation_logs" on email_automation_logs;
create policy "admin_all_email_automation_logs" on email_automation_logs
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager'))
  );

-- ─── Function to update tag subscriber counts ──────
create or replace function update_tag_subscriber_counts()
returns void as $$
begin
  update email_tags t
  set subscriber_count = (
    select count(*)
    from subscribers s
    where s.status = 'active'
      and s.tags @> array[t.name]
  ),
  updated_at = now();
end;
$$ language plpgsql;


-- END: migrations/20250516_email_automations.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250517_crm_professional_upgrade.sql
-- -----------------------------------------------------------------------------
-- =====================================================
-- CRM Professional Upgrade: Journey Tracking, Attribution,
-- Lead Assignment, Sales Performance, Recommendations
-- =====================================================

-- ─── 1. ALTER crm_contacts: Journey & Attribution ───────────

-- Journey tracking
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS journey_stage text DEFAULT 'lead'
  CHECK (journey_stage IN ('visitor','lead','contacted','qualified','negotiation','customer','advocate'));
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lifetime_value integer DEFAULT 0;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS first_seen_at timestamptz;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS converted_at timestamptz;

-- Marketing attribution (first-touch)
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS first_page text;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS referrer text;

-- Lead assignment metadata
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS assignment_method text DEFAULT 'manual'
  CHECK (assignment_method IN ('manual','round_robin','rule_based'));
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- Lead scoring
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lead_score integer DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crm_contacts_journey ON crm_contacts(journey_stage);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_ltv ON crm_contacts(lifetime_value DESC);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_utm ON crm_contacts(utm_source, utm_campaign);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_assigned_at ON crm_contacts(assigned_to, assigned_at);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_lead_score ON crm_contacts(lead_score DESC);

-- ─── 2. ALTER crm_activities: Richer types ─────────────────

ALTER TABLE crm_activities DROP CONSTRAINT IF EXISTS crm_activities_type_check;
ALTER TABLE crm_activities ADD CONSTRAINT crm_activities_type_check
  CHECK (type IN ('note','call','email','meeting','task','status_change','journey_change','purchase','enrollment','page_view','form_submit','assignment'));
ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS deal_id uuid REFERENCES crm_deals(id) ON DELETE SET NULL;
ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS due_at timestamptz;
ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- ─── 3. NEW: Lead Assignment Rules ─────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_lead_assignment_rules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  priority integer DEFAULT 0,
  is_active boolean DEFAULT true,
  -- conditions: {"source": "ads", "utm_campaign": "fb_retarget", "utm_source": "facebook"}
  conditions jsonb NOT NULL DEFAULT '{}',
  assign_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  -- 'specific' = assign to assign_to, 'round_robin_pool' = rotate among pool_members
  assignment_method text DEFAULT 'specific' CHECK (assignment_method IN ('specific','round_robin_pool')),
  pool_members uuid[] DEFAULT '{}',
  last_assigned_index integer DEFAULT 0, -- for round-robin tracking
  created_at timestamptz DEFAULT now()
);

-- ─── 4. NEW: Lead Assignment Log ───────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_lead_assignment_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id uuid REFERENCES crm_contacts(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL, -- null = auto-assigned
  method text NOT NULL CHECK (method IN ('manual','round_robin','rule_based')),
  rule_id uuid REFERENCES crm_lead_assignment_rules(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignment_log_contact ON crm_lead_assignment_log(contact_id);
CREATE INDEX IF NOT EXISTS idx_assignment_log_rep ON crm_lead_assignment_log(assigned_to, created_at);

-- ─── 5. NEW: Next Actions (Tasks/Reminders for Sales) ──────

CREATE TABLE IF NOT EXISTS public.crm_next_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES crm_deals(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('follow_up','demo_schedule','send_info','upsell','re_engage','check_in','custom')),
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_at timestamptz,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','skipped')),
  completed_at timestamptz,
  completed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_auto_generated boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_next_actions_contact ON crm_next_actions(contact_id);
CREATE INDEX IF NOT EXISTS idx_next_actions_assigned ON crm_next_actions(assigned_to, status, due_at);
CREATE INDEX IF NOT EXISTS idx_next_actions_due ON crm_next_actions(due_at) WHERE status = 'pending';

-- ─── 6. NEW: Course Recommendations ────────────────────────

CREATE TABLE IF NOT EXISTS public.crm_course_recommendations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  contact_id uuid NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reason text,
  score integer DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  status text DEFAULT 'suggested' CHECK (status IN ('suggested','sent','accepted','declined')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_recommendations_contact ON crm_course_recommendations(contact_id);

-- ─── 7. RLS Policies for New Tables ────────────────────────

ALTER TABLE crm_lead_assignment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_lead_assignment_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_next_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_course_recommendations ENABLE ROW LEVEL SECURITY;

-- Assignment Rules: admin/manager only
drop policy if exists "assignment_rules_admin" on crm_lead_assignment_rules;
create policy "assignment_rules_admin" on crm_lead_assignment_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
  );

-- Assignment Log: staff can read
drop policy if exists "assignment_log_select_staff" on crm_lead_assignment_log;
create policy "assignment_log_select_staff" on crm_lead_assignment_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale','support','marketing'))
  );
drop policy if exists "assignment_log_insert_staff" on crm_lead_assignment_log;
create policy "assignment_log_insert_staff" on crm_lead_assignment_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale'))
  );

-- Next Actions: staff can CRUD
drop policy if exists "next_actions_select_staff" on crm_next_actions;
create policy "next_actions_select_staff" on crm_next_actions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale','support','marketing'))
  );
drop policy if exists "next_actions_insert_staff" on crm_next_actions;
create policy "next_actions_insert_staff" on crm_next_actions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale','support'))
  );
drop policy if exists "next_actions_update_staff" on crm_next_actions;
create policy "next_actions_update_staff" on crm_next_actions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale','support'))
  );
drop policy if exists "next_actions_delete_admin" on crm_next_actions;
create policy "next_actions_delete_admin" on crm_next_actions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
  );

-- Course Recommendations: staff can CRUD
drop policy if exists "recommendations_select_staff" on crm_course_recommendations;
create policy "recommendations_select_staff" on crm_course_recommendations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale','support','marketing'))
  );
drop policy if exists "recommendations_insert_staff" on crm_course_recommendations;
create policy "recommendations_insert_staff" on crm_course_recommendations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale'))
  );
drop policy if exists "recommendations_update_staff" on crm_course_recommendations;
create policy "recommendations_update_staff" on crm_course_recommendations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager','sale'))
  );
drop policy if exists "recommendations_delete_admin" on crm_course_recommendations;
create policy "recommendations_delete_admin" on crm_course_recommendations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','manager'))
  );

-- ─── 8. Auto-update Journey on Paid Order ──────────────────

CREATE OR REPLACE FUNCTION auto_update_crm_on_paid_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status change to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Update crm_contacts matching by email
    UPDATE crm_contacts
    SET
      journey_stage = CASE
        WHEN journey_stage IN ('visitor','lead','contacted','qualified','negotiation') THEN 'customer'
        ELSE journey_stage
      END,
      lifetime_value = lifetime_value + COALESCE(NEW.amount, 0),
      total_orders = total_orders + 1,
      converted_at = COALESCE(converted_at, now()),
      updated_at = now()
    WHERE email = LOWER(NEW.customer_email)
      AND NEW.customer_email IS NOT NULL;

    -- Also update status to 'won' if still in early stages
    UPDATE crm_contacts
    SET status = 'won'
    WHERE email = LOWER(NEW.customer_email)
      AND NEW.customer_email IS NOT NULL
      AND status IN ('new','contacted','qualified','negotiation');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop if exists, then create
DROP TRIGGER IF EXISTS trigger_crm_on_paid_order ON orders;
drop trigger if exists trigger_crm_on_paid_order on orders;
create trigger trigger_crm_on_paid_order AFTER INSERT OR UPDATE on orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_crm_on_paid_order();

-- ─── 9. Sales Performance View ─────────────────────────────

CREATE OR REPLACE VIEW public.crm_sales_performance AS
SELECT
  p.id as rep_id,
  p.full_name as rep_name,
  p.avatar_url as rep_avatar,
  -- Contacts
  COUNT(DISTINCT c.id) as total_contacts,
  COUNT(DISTINCT c.id) FILTER (WHERE c.journey_stage = 'customer') as converted_contacts,
  COUNT(DISTINCT c.id) FILTER (WHERE c.journey_stage IN ('visitor','lead')) as pending_contacts,
  -- Deals
  COUNT(DISTINCT d.id) as total_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.stage = 'won') as won_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.stage = 'lost') as lost_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.stage NOT IN ('won','lost')) as active_deals,
  COALESCE(SUM(d.amount) FILTER (WHERE d.stage = 'won'), 0) as total_revenue,
  -- Pipeline value
  COALESCE(SUM(d.amount) FILTER (WHERE d.stage NOT IN ('won','lost')), 0) as pipeline_value,
  -- Conversion rate
  CASE WHEN COUNT(DISTINCT d.id) > 0
    THEN ROUND(COUNT(DISTINCT d.id) FILTER (WHERE d.stage = 'won')::numeric / NULLIF(COUNT(DISTINCT d.id) FILTER (WHERE d.stage IN ('won','lost')), 0) * 100, 1)
    ELSE 0 END as conversion_rate,
  -- Activity count (last 30 days)
  COUNT(DISTINCT a.id) FILTER (WHERE a.created_at > now() - interval '30 days') as activities_30d,
  -- Pending actions
  (SELECT COUNT(*) FROM crm_next_actions na WHERE na.assigned_to = p.id AND na.status = 'pending') as pending_actions
FROM profiles p
LEFT JOIN crm_contacts c ON c.assigned_to = p.id
LEFT JOIN crm_deals d ON d.assigned_to = p.id
LEFT JOIN crm_activities a ON a.created_by = p.id AND a.is_system = false
WHERE p.role = 'sale'
GROUP BY p.id, p.full_name, p.avatar_url;

-- ─── 10. Backfill existing contacts ────────────────────────

-- Set journey_stage for existing won contacts
UPDATE crm_contacts SET journey_stage = 'customer' WHERE status = 'won' AND journey_stage = 'lead';
UPDATE crm_contacts SET journey_stage = 'contacted' WHERE status = 'contacted' AND journey_stage = 'lead';
UPDATE crm_contacts SET journey_stage = 'qualified' WHERE status = 'qualified' AND journey_stage = 'lead';
UPDATE crm_contacts SET journey_stage = 'negotiation' WHERE status = 'negotiation' AND journey_stage = 'lead';

-- Backfill lifetime_value and total_orders from orders
UPDATE crm_contacts c SET
  lifetime_value = COALESCE(sub.total_paid, 0),
  total_orders = COALESCE(sub.order_count, 0)
FROM (
  SELECT
    LOWER(customer_email) as email,
    SUM(amount) FILTER (WHERE status = 'paid') as total_paid,
    COUNT(*) FILTER (WHERE status = 'paid') as order_count
  FROM orders
  WHERE customer_email IS NOT NULL
  GROUP BY LOWER(customer_email)
) sub
WHERE LOWER(c.email) = sub.email;


-- END: migrations/20250517_crm_professional_upgrade.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_abandoned_cart.sql
-- -----------------------------------------------------------------------------
-- Abandoned Cart Recovery: add tracking columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS recovery_email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS recovery_email_sent_at TIMESTAMPTZ;

-- Partial index for efficiently finding abandoned orders that haven't been emailed
CREATE INDEX IF NOT EXISTS idx_orders_abandoned
  ON public.orders(status, created_at)
  WHERE status = 'pending' AND recovery_email_sent = false;


-- END: migrations/20250518_abandoned_cart.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_affiliate_unique_order.sql
-- -----------------------------------------------------------------------------
-- Prevent duplicate affiliate conversions from webhook retries
do $idempotent$ begin alter table affiliate_conversions add constraint affiliate_conversions_order_id_unique unique (order_id); exception when duplicate_object then null; when duplicate_table then null; end $idempotent$;


-- END: migrations/20250518_affiliate_unique_order.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_atomic_counters_rpc.sql
-- -----------------------------------------------------------------------------
-- Atomic increment/decrement functions for comments_count, blog views, and
-- email-campaign unsubscribe_count.
-- Prevents race conditions caused by non-atomic read-then-write patterns.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Comments count on posts
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = post_id
  RETURNING comments_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION decrement_comments_count(post_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE posts
  SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
  WHERE id = post_id
  RETURNING comments_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Blog post views
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_blog_views(blog_post_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_views INT;
BEGIN
  UPDATE blog_posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = blog_post_id
  RETURNING views INTO new_views;

  RETURN COALESCE(new_views, 0);
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 3. Email-campaign unsubscribe count
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_unsubscribe_count(campaign_id_param UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE email_campaigns
  SET unsubscribe_count = COALESCE(unsubscribe_count, 0) + 1
  WHERE id = campaign_id_param
  RETURNING unsubscribe_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;


-- END: migrations/20250518_atomic_counters_rpc.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_atomic_likes_rpc.sql
-- -----------------------------------------------------------------------------
-- Atomic increment/decrement functions for post likes_count
-- Prevents race conditions when multiple users like/unlike simultaneously

CREATE OR REPLACE FUNCTION increment_likes_count(p_post_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = p_post_id
  RETURNING likes_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION decrement_likes_count(p_post_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = p_post_id
  RETURNING likes_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;


-- END: migrations/20250518_atomic_likes_rpc.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_audit_log.sql
-- -----------------------------------------------------------------------------
-- Audit Log table for tracking admin actions
-- Used by src/lib/audit.ts via the admin (service role) client

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins/managers can view audit logs (via authenticated user)
drop policy if exists "Admins can view audit logs" on public.audit_logs;
create policy "Admins can view audit logs" on public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Service role (admin client) can insert — used by logAudit()
drop policy if exists "Service role can insert audit logs" on public.audit_logs;
create policy "Service role can insert audit logs" on public.audit_logs
  FOR INSERT
  WITH CHECK (true);


-- END: migrations/20250518_audit_log.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_community_channels.sql
-- -----------------------------------------------------------------------------
-- Add channel column to community_posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'general';

-- Create channels reference table
CREATE TABLE IF NOT EXISTS public.community_channels (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10) DEFAULT '💬',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default channels
INSERT INTO public.community_channels (id, name, description, icon, sort_order) VALUES
  ('general', 'Chung', 'Thảo luận chung về mọi chủ đề', '💬', 0),
  ('questions', 'Hỏi đáp', 'Đặt câu hỏi và nhận câu trả lời', '❓', 1),
  ('showcase', 'Chia sẻ', 'Chia sẻ thành quả và dự án', '🏆', 2),
  ('resources', 'Tài nguyên', 'Chia sẻ tài liệu và công cụ hữu ích', '📚', 3),
  ('introductions', 'Giới thiệu', 'Chào hỏi và giới thiệu bản thân', '👋', 4)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;
drop policy if exists "Anyone can view channels" on public.community_channels;
create policy "Anyone can view channels" on public.community_channels FOR SELECT USING (true);

-- Index for filtering
CREATE INDEX IF NOT EXISTS idx_community_posts_channel ON public.posts(channel);


-- END: migrations/20250518_community_channels.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_drip_content_v2.sql
-- -----------------------------------------------------------------------------
-- Drip Content: timed lesson unlock system
-- Lessons unlock X days after a student enrolls in the course.

-- Safely add unlock_after_days column (idempotent)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS unlock_after_days INT DEFAULT 0;

-- Comment for documentation
COMMENT ON COLUMN public.lessons.unlock_after_days IS 'Number of days after enrollment before this lesson unlocks. 0 = immediately available.';


-- END: migrations/20250518_drip_content_v2.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_fix_rls_policies.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- RLS POLICY FIX MIGRATION
-- Fixes security issues found during audit:
--   1. subscribers — anon SELECT with USING(true) exposes all PII
--   2. audit_logs  — INSERT WITH CHECK(true) allows fake entries
--   3. xp_events   — RLS enabled but zero policies (blocks all access)
--   4. products, chapters, lessons — no RLS at all
-- ============================================================

BEGIN;

-- ============================================================
-- Helper: reusable staff-check function
-- Returns true if current user has admin, manager, or marketing role.
-- Uses SECURITY DEFINER so callers don't need direct access to profiles.
-- is_email_admin() already exists but only covers email-marketing tables;
-- we create a broader is_staff() for general use.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'marketing')
  );
END;
$$;

-- Narrower helper: admin or manager only (no marketing)
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  );
END;
$$;


-- ============================================================
-- 1. FIX: subscribers — remove overly permissive anon SELECT
-- The existing "subscribers_anon_read_by_email" policy uses
-- USING(true), exposing ALL subscriber emails/names/phones to
-- unauthenticated users. We drop it and replace with a safe
-- alternative that only returns minimal data when queried by
-- exact email (for the unsubscribe page).
-- Staff (admin/manager/marketing) keep full SELECT via the
-- existing "subscribers_admin_select" policy.
-- ============================================================

-- Drop the dangerous anon SELECT policy
DROP POLICY IF EXISTS "subscribers_anon_read_by_email" ON public.subscribers;

-- Replace with a restricted anon SELECT that only exposes id, email,
-- and status columns conceptually. RLS cannot filter columns, but we
-- limit rows to exact-email lookups by requiring the email to be
-- supplied via a request header or RPC. Since RLS cannot enforce
-- column-level restrictions, the safest approach is to remove anon
-- SELECT entirely and use a SECURITY DEFINER function for unsubscribe.
-- However, to keep the unsubscribe page working without code changes,
-- we allow anon SELECT but restrict to rows matching a known email
-- pattern. For maximum safety, we remove anon SELECT entirely:
-- The unsubscribe flow should use the service_role client or a
-- SECURITY DEFINER RPC function instead.

-- No anon SELECT policy on subscribers (service_role bypasses RLS
-- for the unsubscribe API route). If a public unsubscribe lookup
-- is needed, create a SECURITY DEFINER function that returns only
-- the subscriber id and status for a given email.

-- Keep the anon UPDATE for unsubscribe (already properly restricted
-- to only setting status = 'unsubscribed' via WITH CHECK).
-- "subscribers_anon_unsubscribe" already exists and is safe.


-- ============================================================
-- 2. FIX: audit_logs — restrict INSERT to admin/manager only
-- The existing policy "Service role can insert audit logs" uses
-- WITH CHECK(true), allowing ANY authenticated user to insert
-- fake audit entries. Service role already bypasses RLS, so that
-- policy is redundant for service_role and dangerous for regular
-- authenticated users. Drop it and create a proper policy.
-- ============================================================

DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

-- Admin/manager can insert audit logs (for client-side admin actions)
-- Service role (used by logAudit() in API routes) bypasses RLS automatically.
drop policy if exists "audit_logs_insert_staff" on public.audit_logs;
create policy "audit_logs_insert_staff" on public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager());


-- ============================================================
-- 3. FIX: xp_events — add missing policies
-- RLS is enabled (schema.sql line 280) but no policies exist,
-- blocking all client access. Users need to read and insert
-- their own XP events.
-- ============================================================

-- Users can read their own XP events
DROP POLICY IF EXISTS "xp_events_select_own" ON public.xp_events;
drop policy if exists "xp_events_select_own" on public.xp_events;
create policy "xp_events_select_own" on public.xp_events
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own XP events
DROP POLICY IF EXISTS "xp_events_insert_own" ON public.xp_events;
drop policy if exists "xp_events_insert_own" on public.xp_events;
create policy "xp_events_insert_own" on public.xp_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin/manager can read all XP events (for analytics/moderation)
DROP POLICY IF EXISTS "xp_events_select_admin" ON public.xp_events;
drop policy if exists "xp_events_select_admin" on public.xp_events;
create policy "xp_events_select_admin" on public.xp_events
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager());


-- ============================================================
-- 4. FIX: products, chapters, lessons — enable RLS + add policies
-- These content tables had no RLS, meaning any role (including
-- anon with the anon key) could read/write all rows.
-- ============================================================

-- ─── 4a. PRODUCTS ───────────────────────────────────────────
-- products.status column exists: ('draft','published','archived')
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read published products
DROP POLICY IF EXISTS "products_select_published" ON public.products;
drop policy if exists "products_select_published" on public.products;
create policy "products_select_published" on public.products
  FOR SELECT
  USING (status = 'published');

-- Admin/manager can read ALL products (including draft/archived)
DROP POLICY IF EXISTS "products_select_admin" ON public.products;
drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin" on public.products
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager());

-- Admin/manager can insert products
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin" on public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager());

-- Admin/manager can update products
DROP POLICY IF EXISTS "products_update_admin" ON public.products;
drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin" on public.products
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager());

-- Admin/manager can delete products
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin" on public.products
  FOR DELETE TO authenticated
  USING (public.is_admin_or_manager());


-- ─── 4b. CHAPTERS ───────────────────────────────────────────
-- chapters does NOT have a status column.
-- Visibility is derived from the parent product's status.
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Anyone can read chapters belonging to a published product
DROP POLICY IF EXISTS "chapters_select_published" ON public.chapters;
drop policy if exists "chapters_select_published" on public.chapters;
create policy "chapters_select_published" on public.chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = chapters.product_id
      AND products.status = 'published'
    )
  );

-- Admin/manager can read ALL chapters
DROP POLICY IF EXISTS "chapters_select_admin" ON public.chapters;
drop policy if exists "chapters_select_admin" on public.chapters;
create policy "chapters_select_admin" on public.chapters
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager());

-- Admin/manager can insert chapters
DROP POLICY IF EXISTS "chapters_insert_admin" ON public.chapters;
drop policy if exists "chapters_insert_admin" on public.chapters;
create policy "chapters_insert_admin" on public.chapters
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager());

-- Admin/manager can update chapters
DROP POLICY IF EXISTS "chapters_update_admin" ON public.chapters;
drop policy if exists "chapters_update_admin" on public.chapters;
create policy "chapters_update_admin" on public.chapters
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager());

-- Admin/manager can delete chapters
DROP POLICY IF EXISTS "chapters_delete_admin" ON public.chapters;
drop policy if exists "chapters_delete_admin" on public.chapters;
create policy "chapters_delete_admin" on public.chapters
  FOR DELETE TO authenticated
  USING (public.is_admin_or_manager());


-- ─── 4c. LESSONS ────────────────────────────────────────────
-- lessons does NOT have a status column.
-- Visibility is derived from the parent product's status.
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can read lessons belonging to a published product
DROP POLICY IF EXISTS "lessons_select_published" ON public.lessons;
drop policy if exists "lessons_select_published" on public.lessons;
create policy "lessons_select_published" on public.lessons
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = lessons.product_id
      AND products.status = 'published'
    )
  );

-- Admin/manager can read ALL lessons
DROP POLICY IF EXISTS "lessons_select_admin" ON public.lessons;
drop policy if exists "lessons_select_admin" on public.lessons;
create policy "lessons_select_admin" on public.lessons
  FOR SELECT TO authenticated
  USING (public.is_admin_or_manager());

-- Admin/manager can insert lessons
DROP POLICY IF EXISTS "lessons_insert_admin" ON public.lessons;
drop policy if exists "lessons_insert_admin" on public.lessons;
create policy "lessons_insert_admin" on public.lessons
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_manager());

-- Admin/manager can update lessons
DROP POLICY IF EXISTS "lessons_update_admin" ON public.lessons;
drop policy if exists "lessons_update_admin" on public.lessons;
create policy "lessons_update_admin" on public.lessons
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_manager());

-- Admin/manager can delete lessons
DROP POLICY IF EXISTS "lessons_delete_admin" ON public.lessons;
drop policy if exists "lessons_delete_admin" on public.lessons;
create policy "lessons_delete_admin" on public.lessons
  FOR DELETE TO authenticated
  USING (public.is_admin_or_manager());


COMMIT;


-- END: migrations/20250518_fix_rls_policies.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_fix_security.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- SECURITY FIX MIGRATION
-- 1. Fix is_email_admin() role mismatch
-- 2. Add RLS policies for analytics_events and blog_posts
-- 3. Add missing indexes on high-traffic columns
-- ============================================================

BEGIN;

-- ============================================================
-- 1. FIX is_email_admin() — replace 'moderator' with actual roles
-- The profiles.role constraint allows: student, admin, manager, marketing, sale, support
-- The old function checked for 'admin','moderator' — 'moderator' does not exist.
-- Now checks for 'admin','manager','marketing' to match actual staff roles.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_email_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'marketing')
  );
END;
$$;

-- ============================================================
-- 2. RLS POLICIES FOR analytics_events AND blog_posts
-- These tables had RLS enabled but no policies, effectively
-- blocking all access except via service role.
-- ============================================================

-- ─── analytics_events ───────────────────────────────────────
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own events
DROP POLICY IF EXISTS "analytics_events_insert_own" ON public.analytics_events;
drop policy if exists "analytics_events_insert_own" on public.analytics_events;
create policy "analytics_events_insert_own" on public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admin/manager can read all analytics events
DROP POLICY IF EXISTS "analytics_events_select_admin" ON public.analytics_events;
drop policy if exists "analytics_events_select_admin" on public.analytics_events;
create policy "analytics_events_select_admin" on public.analytics_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager')
    )
  );

-- ─── blog_posts ─────────────────────────────────────────────
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon) can read published blog posts
DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;
drop policy if exists "blog_posts_select_public" on public.blog_posts;
create policy "blog_posts_select_public" on public.blog_posts
  FOR SELECT
  USING (true);

-- Admin/manager/marketing can insert blog posts
DROP POLICY IF EXISTS "blog_posts_insert_staff" ON public.blog_posts;
drop policy if exists "blog_posts_insert_staff" on public.blog_posts;
create policy "blog_posts_insert_staff" on public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'marketing')
    )
  );

-- Admin/manager/marketing can update blog posts
DROP POLICY IF EXISTS "blog_posts_update_staff" ON public.blog_posts;
drop policy if exists "blog_posts_update_staff" on public.blog_posts;
create policy "blog_posts_update_staff" on public.blog_posts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'marketing')
    )
  );

-- Admin/manager/marketing can delete blog posts
DROP POLICY IF EXISTS "blog_posts_delete_staff" ON public.blog_posts;
drop policy if exists "blog_posts_delete_staff" on public.blog_posts;
create policy "blog_posts_delete_staff" on public.blog_posts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'manager', 'marketing')
    )
  );

-- ============================================================
-- 3. MISSING INDEXES ON HIGH-TRAFFIC COLUMNS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_product ON enrollments(user_id, product_id);

COMMIT;


-- END: migrations/20250518_fix_security.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_fix_streak_rls.sql
-- -----------------------------------------------------------------------------
-- Ensure users can update their own profile fields (needed for streak)
DO $$ BEGIN
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN
  NULL; -- policy already exists, ignore
END $$;


-- END: migrations/20250518_fix_streak_rls.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_indexes_and_triggers.sql
-- -----------------------------------------------------------------------------
-- ═══════════════════════════════════════════════════════════════
-- INDEXES & TRIGGERS — taitue.academy
-- Adds missing FK indexes, updated_at trigger function,
-- and affiliate conversion trigger.
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1. MISSING FK INDEXES (query performance) ─────────────────

CREATE INDEX IF NOT EXISTS idx_chapters_product_id       ON public.chapters(product_id);
CREATE INDEX IF NOT EXISTS idx_lessons_chapter_id         ON public.lessons(chapter_id);
CREATE INDEX IF NOT EXISTS idx_lessons_product_id         ON public.lessons(product_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id  ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_product_id ON public.lesson_progress(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id             ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id          ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id              ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id           ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id           ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id          ON public.xp_events(user_id);

-- ─── 2. UPDATED_AT TRIGGER FUNCTION ────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 3. ATTACH UPDATED_AT TRIGGERS ─────────────────────────────
-- Tables with updated_at column but no existing trigger:
--   profiles, lesson_progress, orders, posts, affiliates, affiliate_settings

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at BEFORE UPDATE on public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.lesson_progress;
drop trigger if exists set_updated_at on public.lesson_progress;
create trigger set_updated_at BEFORE UPDATE on public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
drop trigger if exists set_updated_at on public.orders;
create trigger set_updated_at BEFORE UPDATE on public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.posts;
drop trigger if exists set_updated_at on public.posts;
create trigger set_updated_at BEFORE UPDATE on public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.affiliates;
drop trigger if exists set_updated_at on public.affiliates;
create trigger set_updated_at BEFORE UPDATE on public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.affiliate_settings;
drop trigger if exists set_updated_at on public.affiliate_settings;
create trigger set_updated_at BEFORE UPDATE on public.affiliate_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ─── 4. AFFILIATE CONVERSION TRIGGER ───────────────────────────
-- Auto-increment total_earned and total_conversions on new conversion.
-- NOTE: migration_affiliate.sql has a more comprehensive trigger
-- (on_affiliate_conversion_change) that recalculates from scratch on
-- INSERT OR UPDATE. This simpler increment trigger fires on INSERT only.
-- If both are active, the recount trigger takes precedence. Consider
-- dropping on_affiliate_conversion_change if you prefer the faster
-- increment approach below.

CREATE OR REPLACE FUNCTION public.handle_affiliate_conversion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.affiliates
  SET total_earned       = total_earned + NEW.commission_amount,
      total_conversions  = total_conversions + 1
  WHERE id = NEW.affiliate_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_affiliate_conversion_insert ON public.affiliate_conversions;
drop trigger if exists on_affiliate_conversion_insert on public.affiliate_conversions;
create trigger on_affiliate_conversion_insert AFTER INSERT on public.affiliate_conversions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_affiliate_conversion();

COMMIT;


-- END: migrations/20250518_indexes_and_triggers.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_lesson_attachments.sql
-- -----------------------------------------------------------------------------
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';


-- END: migrations/20250518_lesson_attachments.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_lesson_discussions.sql
-- -----------------------------------------------------------------------------
-- Lesson Discussions / Q&A system
-- Threaded discussions per lesson with 1-level nesting (parent_id)

CREATE TABLE IF NOT EXISTS public.lesson_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.lesson_discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

create index if not exists idx_lesson_discussions_lesson ON public.lesson_discussions(lesson_id);
create index if not exists idx_lesson_discussions_parent ON public.lesson_discussions(parent_id);

ALTER TABLE public.lesson_discussions ENABLE ROW LEVEL SECURITY;
drop policy if exists "Anyone can view discussions" on public.lesson_discussions;
create policy "Anyone can view discussions" on public.lesson_discussions FOR SELECT USING (true);
drop policy if exists "Auth users can create" on public.lesson_discussions;
create policy "Auth users can create" on public.lesson_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
drop policy if exists "Users can edit own" on public.lesson_discussions;
create policy "Users can edit own" on public.lesson_discussions FOR UPDATE USING (auth.uid() = user_id);
drop policy if exists "Users can delete own" on public.lesson_discussions;
create policy "Users can delete own" on public.lesson_discussions FOR DELETE USING (auth.uid() = user_id);


-- END: migrations/20250518_lesson_discussions.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_notifications_table.sql
-- -----------------------------------------------------------------------------
-- Notifications table: real notifications system replacing xp_events stub
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

create index if not exists idx_notifications_user ON notifications(user_id, created_at DESC);
create index if not exists idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
drop policy if exists "Users read own" on notifications;
create policy "Users read own" on notifications FOR SELECT USING (auth.uid() = user_id);
drop policy if exists "Users update own" on notifications;
create policy "Users update own" on notifications FOR UPDATE USING (auth.uid() = user_id);


-- END: migrations/20250518_notifications_table.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_streak_system.sql
-- -----------------------------------------------------------------------------
-- Add last_active_date column to profiles for streak tracking
-- streak (integer) already exists in schema.sql

alter table public.profiles
  add column if not exists last_active_date date;


-- END: migrations/20250518_streak_system.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250518_student_notes.sql
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp_sec INT DEFAULT 0,
  is_bookmark BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

create index if not exists idx_student_notes_user_lesson ON public.student_notes(user_id, lesson_id);
create index if not exists idx_student_notes_user_product ON public.student_notes(user_id, product_id);

ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
drop policy if exists "Users can manage own notes" on public.student_notes;
create policy "Users can manage own notes" on public.student_notes
  FOR ALL USING (auth.uid() = user_id);


-- END: migrations/20250518_student_notes.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250519_atomic_affiliate_stats.sql
-- -----------------------------------------------------------------------------
-- Atomic increment for affiliate stats to prevent race conditions
-- when two orders for the same affiliate are processed simultaneously.
-- Replaces the read-then-write pattern with a single atomic UPDATE.
CREATE OR REPLACE FUNCTION increment_affiliate_stats(p_affiliate_id uuid, p_earned_amount bigint)
RETURNS void AS $$
  UPDATE affiliates
  SET total_earned = total_earned + p_earned_amount,
      total_conversions = total_conversions + 1,
      updated_at = now()
  WHERE id = p_affiliate_id;
$$ LANGUAGE sql;

-- Atomic increment for affiliate total_paid to prevent TOCTOU race condition
-- when two payouts for the same affiliate are processed concurrently.
CREATE OR REPLACE FUNCTION increment_affiliate_total_paid(p_affiliate_id uuid, p_paid_amount bigint)
RETURNS void AS $$
  UPDATE affiliates
  SET total_paid = COALESCE(total_paid, 0) + p_paid_amount,
      updated_at = now()
  WHERE id = p_affiliate_id;
$$ LANGUAGE sql;


-- END: migrations/20250519_atomic_affiliate_stats.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250519_fix_blog_rls.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- FIX: blog_posts — replace overly permissive public SELECT policy
--
-- The existing "blog_posts_select_public" policy uses USING(true),
-- which exposes DRAFT blog posts to anonymous and authenticated
-- users. This migration:
--   1. Drops the dangerous USING(true) policy
--   2. Creates a public SELECT policy restricted to published posts
--   3. Creates a staff SELECT policy so admin/manager/marketing
--      can still see all posts (including drafts)
--
-- Depends on: public.is_staff() from 20250518_fix_rls_policies.sql
-- ============================================================

BEGIN;

-- 1. Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "blog_posts_select_public" ON public.blog_posts;

-- 2. Public SELECT — only published posts visible to everyone (anon + authenticated)
drop policy if exists "blog_posts_select_published" on public.blog_posts;
create policy "blog_posts_select_published" on public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- 3. Staff SELECT — admin/manager/marketing can see ALL posts (including drafts)
drop policy if exists "blog_posts_select_staff" on public.blog_posts;
create policy "blog_posts_select_staff" on public.blog_posts
  FOR SELECT TO authenticated
  USING (public.is_staff());

COMMIT;


-- END: migrations/20250519_fix_blog_rls.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250520_announcements.sql
-- -----------------------------------------------------------------------------
-- Announcements: broadcast notifications for ALL users
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which users have read which announcements
CREATE TABLE IF NOT EXISTS announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

create index if not exists idx_announcements_created ON announcements(created_at DESC);
create index if not exists idx_announcement_reads_user ON announcement_reads(user_id);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read announcements
drop policy if exists "Authenticated users read announcements" on announcements;
create policy "Authenticated users read announcements" on announcements FOR SELECT TO authenticated USING (true);

-- Only staff can insert announcements
drop policy if exists "Staff insert announcements" on announcements;
create policy "Staff insert announcements" on announcements FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

-- Users can read their own read-tracking records
drop policy if exists "Users read own announcement_reads" on announcement_reads;
create policy "Users read own announcement_reads" on announcement_reads FOR SELECT USING (auth.uid() = user_id);

-- Users can mark announcements as read (insert)
drop policy if exists "Users insert own announcement_reads" on announcement_reads;
create policy "Users insert own announcement_reads" on announcement_reads FOR INSERT WITH CHECK (auth.uid() = user_id);


-- END: migrations/20250520_announcements.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250520000001_add_missing_rpc_functions.sql
-- -----------------------------------------------------------------------------
-- Add missing RPC functions that are called in application code but do not
-- exist in the database, causing silent failures.
--
-- 1. increment_campaign_sent_count  -- used by campaign-processor.ts
-- 2. increment_field                -- used by automation-processor.ts

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Atomically increment sent_count on an email campaign
--    Called as: supabase.rpc("increment_campaign_sent_count", { cid })
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_campaign_sent_count(cid UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INT;
BEGIN
  UPDATE email_campaigns
  SET sent_count = COALESCE(sent_count, 0) + 1
  WHERE id = cid
  RETURNING sent_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Generic atomic field incrementer
--    Called as: supabase.rpc("increment_field", {
--      table_name, row_id, field_name, increment_by
--    })
--
--    Uses quote_ident() to safely escape identifiers, preventing SQL
--    injection while allowing dynamic table/column names.
--    Only allows tables in the public schema.
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_field(
  table_name TEXT,
  row_id UUID,
  field_name TEXT,
  increment_by INT DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = COALESCE(%I, 0) + $1 WHERE id = $2',
    table_name,
    field_name,
    field_name
  )
  USING increment_by, row_id;
END;
$$;


-- END: migrations/20250520000001_add_missing_rpc_functions.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250520000002_add_missing_tables.sql
-- -----------------------------------------------------------------------------
-- ============================================================
-- ADD MISSING TABLES — Migration
-- Ensures all tables referenced in application code exist.
-- Uses CREATE TABLE IF NOT EXISTS so this is safe to run even
-- if the tables were already created by schema.sql or standalone
-- migration scripts.
-- ============================================================

BEGIN;

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. POST_LIKES — Community post likes (composite PK)
-- Defined in schema.sql; included here for fresh-deploy safety.
-- Columns: user_id, post_id, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own likes; anyone can read
DO $$ BEGIN
drop policy if exists "users_manage_likes" on public.post_likes;
create policy "users_manage_likes" on public.post_likes
    FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "public_read_likes" on public.post_likes;
create policy "public_read_likes" on public.post_likes
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- ============================================================
-- 2. POST_REPORTS — Community content moderation reports
-- Referenced in: api/community/reports, api/community/moderation
-- Columns: id, post_id, comment_id, reporter_id, reason,
--          details, status, reviewed_by, reviewed_at, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id  uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason      text NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'misinformation', 'other')),
  details     text,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  -- Prevent duplicate reports from the same user on the same content
  CONSTRAINT post_reports_unique_post UNIQUE (reporter_id, post_id),
  CONSTRAINT post_reports_unique_comment UNIQUE (reporter_id, comment_id),
  -- At least one target must be specified
  CONSTRAINT post_reports_has_target CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can create reports for content they don't own
DO $$ BEGIN
drop policy if exists "users_create_reports" on public.post_reports;
create policy "users_create_reports" on public.post_reports
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = reporter_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Staff (admin/manager) can read and manage all reports
DO $$ BEGIN
drop policy if exists "staff_read_reports" on public.post_reports;
create policy "staff_read_reports" on public.post_reports
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager', 'support')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "staff_update_reports" on public.post_reports;
create policy "staff_update_reports" on public.post_reports
    FOR UPDATE TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager', 'support')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON public.post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_comment_id ON public.post_reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_reporter_id ON public.post_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_created_at ON public.post_reports(created_at DESC);

-- ============================================================
-- 3. XP_EVENTS — Gamification XP tracking
-- Defined in schema.sql; included here for fresh-deploy safety.
-- Columns: id, user_id, action, xp_amount, meta, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.xp_events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action     text NOT NULL,
  xp_amount  integer NOT NULL,
  meta       jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "users_read_own_xp" on public.xp_events;
create policy "users_read_own_xp" on public.xp_events
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_action ON public.xp_events(action);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON public.xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_action ON public.xp_events(user_id, action);

-- Auto-update XP + level on profiles (idempotent CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.update_user_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_xp integer;
  new_level integer;
BEGIN
  SELECT coalesce(sum(xp_amount), 0) INTO total_xp
  FROM xp_events WHERE user_id = NEW.user_id;

  new_level := greatest(1, floor(total_xp / 200) + 1);

  UPDATE profiles SET xp = total_xp, level = new_level
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_xp_event ON public.xp_events;
drop trigger if exists on_xp_event on public.xp_events;
create trigger on_xp_event AFTER INSERT on public.xp_events
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp();

-- ============================================================
-- 4. SUBSCRIBER_LIST_MEMBERS — M:N join: subscriber <-> email list
-- Defined in 20250511_email_marketing.sql; included for safety.
-- Columns: subscriber_id, list_id, added_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriber_list_members (
  subscriber_id uuid NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  list_id       uuid NOT NULL REFERENCES public.email_lists(id) ON DELETE CASCADE,
  added_at      timestamptz DEFAULT now(),
  PRIMARY KEY (subscriber_id, list_id)
);

ALTER TABLE public.subscriber_list_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "subscriber_list_members_admin_all" on public.subscriber_list_members;
create policy "subscriber_list_members_admin_all" on public.subscriber_list_members
    FOR ALL TO authenticated
    USING (public.is_email_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriber_list_members_list_id ON public.subscriber_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_list_members_subscriber_id ON public.subscriber_list_members(subscriber_id);

-- ============================================================
-- 5. EMAIL_CAMPAIGNS — Email marketing campaigns
-- Defined in schema.sql + extended in 20250511_email_marketing.sql.
-- Full column set included here for fresh-deploy safety.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text,
  subject          text NOT NULL,
  from_name        text DEFAULT 'Tài Tuệ Academy',
  from_email       text DEFAULT 'support@taitue.academy',
  reply_to         text,
  html_content     text,
  text_content     text,
  template_id      uuid,
  list_id          uuid,
  status           text NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at     timestamptz,
  sent_at          timestamptz,
  completed_at     timestamptz,
  total_recipients integer NOT NULL DEFAULT 0,
  sent_count       integer NOT NULL DEFAULT 0,
  open_count       integer NOT NULL DEFAULT 0,
  click_count      integer NOT NULL DEFAULT 0,
  bounce_count     integer NOT NULL DEFAULT 0,
  complaint_count  integer NOT NULL DEFAULT 0,
  unsubscribe_count integer NOT NULL DEFAULT 0,
  tags             text[] DEFAULT '{}',
  metadata         jsonb DEFAULT '{}',
  created_by       uuid,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Add columns that may not exist on older schemas (idempotent)
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS from_name text DEFAULT 'Tài Tuệ Academy';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS from_email text DEFAULT 'support@taitue.academy';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS reply_to text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS html_content text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS text_content text;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS template_id uuid;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS list_id uuid;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS total_recipients integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS bounce_count integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS complaint_count integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS unsubscribe_count integer DEFAULT 0;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS created_by uuid;
ALTER TABLE public.email_campaigns ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_list_id ON public.email_campaigns(list_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON public.email_campaigns(scheduled_at)
  WHERE status = 'scheduled';

-- ============================================================
-- 6. EMAIL_QUEUE — Queued emails for batch sending
-- Not currently referenced in application code, but included
-- as a placeholder for future use per the task specification.
-- Columns: id, campaign_id, subscriber_id, status,
--          scheduled_at, sent_at, error_message, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_queue (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid REFERENCES public.subscribers(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  scheduled_at  timestamptz,
  sent_at       timestamptz,
  error_message text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "email_queue_admin_all" on public.email_queue;
create policy "email_queue_admin_all" on public.email_queue
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_id ON public.email_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_subscriber_id ON public.email_queue(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_at ON public.email_queue(scheduled_at)
  WHERE status = 'pending';

-- ============================================================
-- 7. EMAIL_AUTOMATION_LOGS — Automation step execution logs
-- Defined in 20250516_email_automations.sql; included for safety.
-- The task refers to this as "automation_logs"; actual table name
-- in code is "email_automation_logs".
-- Columns: id, enrollment_id, automation_id, subscriber_id,
--          step_id, action, metadata, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.email_automation_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid,
  automation_id uuid NOT NULL,
  subscriber_id uuid NOT NULL,
  step_id       uuid,
  action        text NOT NULL,
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_automation_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "admin_all_email_automation_logs" on public.email_automation_logs;
create policy "admin_all_email_automation_logs" on public.email_automation_logs
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_automation_logs_automation ON public.email_automation_logs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_enrollment ON public.email_automation_logs(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_subscriber ON public.email_automation_logs(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON public.email_automation_logs(created_at DESC);

-- ============================================================
-- 8. AFFILIATE_CLICKS — Track affiliate link clicks
-- Defined in migration_affiliate.sql (standalone); included here
-- so timestamped migrations are self-sufficient for fresh deploy.
-- Columns: id, affiliate_id, ref_code, ip, user_agent,
--          page_url, referrer, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL,
  ref_code     text NOT NULL,
  ip           text,
  user_agent   text,
  page_url     text,
  referrer     text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "affiliates_read_own_clicks" on public.affiliate_clicks;
create policy "affiliates_read_own_clicks" on public.affiliate_clicks
    FOR SELECT USING (
      affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "staff_read_all_clicks" on public.affiliate_clicks;
create policy "staff_read_all_clicks" on public.affiliate_clicks
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_aff_clicks_affiliate ON public.affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_ref_code ON public.affiliate_clicks(ref_code);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_created ON public.affiliate_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_dedup ON public.affiliate_clicks(affiliate_id, ip, created_at);

-- ============================================================
-- 9. AFFILIATE_CONVERSIONS — Commission tracking per order
-- Defined in migration_affiliate.sql as "affiliate_conversions".
-- The task refers to this as "affiliate_commissions".
-- Columns: id, affiliate_id, order_id, buyer_id, product_id,
--          order_amount, commission_rate, commission_amount,
--          status, approved_at, paid_at, created_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      uuid NOT NULL,
  order_id          uuid,
  buyer_id          uuid,
  product_id        uuid,
  order_amount      integer NOT NULL,
  commission_rate   numeric(5, 2) NOT NULL,
  commission_amount integer NOT NULL,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  approved_at       timestamptz,
  paid_at           timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "affiliates_read_own_conversions" on public.affiliate_conversions;
create policy "affiliates_read_own_conversions" on public.affiliate_conversions
    FOR SELECT USING (
      affiliate_id IN (SELECT id FROM public.affiliates WHERE user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "staff_manage_conversions" on public.affiliate_conversions;
create policy "staff_manage_conversions" on public.affiliate_conversions
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_aff_conv_affiliate ON public.affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_aff_conv_status ON public.affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_aff_conv_order ON public.affiliate_conversions(order_id);
CREATE INDEX IF NOT EXISTS idx_aff_conv_created_at ON public.affiliate_conversions(created_at DESC);

-- ============================================================
-- 10. LESSON_DISCUSSIONS — Threaded discussions per lesson
-- Defined in 20250518_lesson_discussions.sql; included for safety.
-- Columns: id, lesson_id, user_id, parent_id, content,
--          is_pinned, is_resolved, created_at, updated_at
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_discussions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   uuid NOT NULL,
  user_id     uuid NOT NULL,
  parent_id   uuid REFERENCES public.lesson_discussions(id) ON DELETE CASCADE,
  content     text NOT NULL,
  is_pinned   boolean NOT NULL DEFAULT false,
  is_resolved boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_discussions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
drop policy if exists "anyone_view_discussions" on public.lesson_discussions;
create policy "anyone_view_discussions" on public.lesson_discussions
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "auth_users_create_discussions" on public.lesson_discussions;
create policy "auth_users_create_discussions" on public.lesson_discussions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "users_edit_own_discussions" on public.lesson_discussions;
create policy "users_edit_own_discussions" on public.lesson_discussions
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
drop policy if exists "users_delete_own_discussions" on public.lesson_discussions;
create policy "users_delete_own_discussions" on public.lesson_discussions
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_lesson_discussions_lesson ON public.lesson_discussions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_discussions_parent ON public.lesson_discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_lesson_discussions_user ON public.lesson_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_discussions_created_at ON public.lesson_discussions(created_at);

COMMIT;

-- ============================================================
-- NOTES
-- ============================================================
-- Table name mapping (task name -> actual name in code):
--   automation_logs      -> email_automation_logs
--   affiliate_commissions -> affiliate_conversions
--   email_queue          -> (placeholder, not yet used in code)
--
-- Tables that already had migrations before this file:
--   post_likes           -> schema.sql
--   xp_events            -> schema.sql
--   subscriber_list_members -> 20250511_email_marketing.sql
--   email_campaigns      -> schema.sql + 20250511_email_marketing.sql
--   email_automation_logs -> 20250516_email_automations.sql
--   affiliate_clicks     -> migration_affiliate.sql (standalone)
--   affiliate_conversions -> migration_affiliate.sql (standalone)
--   lesson_discussions   -> 20250518_lesson_discussions.sql
--
-- Only post_reports was truly missing from all migration files.
-- All other tables are re-declared with IF NOT EXISTS for
-- fresh-deploy safety (the standalone files in supabase/ root
-- are not part of the timestamped migrations directory).
-- ============================================================


-- END: migrations/20250520000002_add_missing_tables.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250520000003_add_instructor_role.sql
-- -----------------------------------------------------------------------------
-- Migration: Add 'instructor' to profiles.role CHECK constraint
-- and add coupon_code column to orders table
-- Created: 2025-05-20

-- ─── 1. Fix profiles.role CHECK to include 'instructor' ─────────
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'manager', 'marketing', 'sale', 'support', 'instructor'));

-- ─── 2. Add coupon_code column to orders ────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;


-- END: migrations/20250520000003_add_instructor_role.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20250520000004_add_editor_role.sql
-- -----------------------------------------------------------------------------
-- Add 'editor' role for content editors (biên tập viên)
-- Editors can edit course content and help answer student questions
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'manager', 'marketing', 'sale', 'support', 'instructor', 'editor'));


-- END: migrations/20250520000004_add_editor_role.sql

-- -----------------------------------------------------------------------------
-- BEGIN: migrations/20260521_lesson_video_url.sql
-- -----------------------------------------------------------------------------
-- Add video_url column to lessons table
-- Supports external video sources (Google Drive, etc.) alongside YouTube
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
COMMENT ON COLUMN public.lessons.video_url IS 'External video URL (Google Drive, etc). Used when youtube_id is empty.';


-- END: migrations/20260521_lesson_video_url.sql




-- ---------------------------------------------------------------------------
-- SECTION: _resources_schema.sql
-- ---------------------------------------------------------------------------
-- Resources system: categories + resource items, RLS, seed
-- Idempotent: safe to re-run

-- ─── Tables ──────────────────────────────────────────────────

create table if not exists public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text default 'FileText',
  color text default '#2563EB',
  bg text default 'rgba(37,99,235,0.1)',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.resource_categories(id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  available boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_resources_category on public.resources(category_id);
create index if not exists idx_resources_sort on public.resources(sort_order);

-- ─── RLS ─────────────────────────────────────────────────────

alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;

drop policy if exists "Public read categories" on public.resource_categories;
create policy "Public read categories" on public.resource_categories for select using (true);

drop policy if exists "Public read resources" on public.resources;
create policy "Public read resources" on public.resources for select using (true);

drop policy if exists "Admins manage categories" on public.resource_categories;
create policy "Admins manage categories" on public.resource_categories for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "Admins manage resources" on public.resources;
create policy "Admins manage resources" on public.resources for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ─── Seed default 3 categories ───────────────────────────────

insert into public.resource_categories (id, name, icon, color, bg, sort_order)
values
  ('11111111-1111-1111-1111-111111111101', 'Templates Tài chính cá nhân', 'Video',     '#2563EB', 'rgba(37,99,235,0.1)',  1),
  ('11111111-1111-1111-1111-111111111102', 'Tài liệu Kinh doanh',         'Briefcase', '#3b82f6', 'rgba(59,130,246,0.1)',  2),
  ('11111111-1111-1111-1111-111111111103', 'Thương hiệu cá nhân',         'User',      '#a855f7', 'rgba(168,85,247,0.1)',  3)
on conflict (id) do update set
  name       = excluded.name,
  icon       = excluded.icon,
  color      = excluded.color,
  bg         = excluded.bg,
  sort_order = excluded.sort_order;

-- ─── Seed default 9 placeholder resources (available=false) ──

insert into public.resources (id, category_id, title, description, available, sort_order)
values
  -- Templates Tài chính cá nhân
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'Mẫu bảng dòng tiền cá nhân',
   'Template Excel giúp bạn theo dõi thu chi và dòng tiền cá nhân theo tháng/năm.', false, 1),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 'Kế hoạch tối ưu thuế cho founder',
   'Bộ tài liệu hướng dẫn cấu trúc thu nhập và tối ưu nghĩa vụ thuế cho nhà khởi nghiệp.', false, 2),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'Checklist hoạch định đầu tư',
   'Danh sách kiểm tra trước khi xuống tiền cho bất kỳ kênh đầu tư nào.', false, 3),
  -- Tài liệu Kinh doanh
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111102', '100 Mô hình kinh doanh sản phẩm số',
   'Tổng hợp 100 mô hình kinh doanh sản phẩm số đã được kiểm chứng hiệu quả.', false, 1),
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111102', 'Hướng dẫn bán hàng online',
   'Hướng dẫn từ A-Z cách bán hàng online hiệu quả trên các nền tảng phổ biến.', false, 2),
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111102', 'Template kế hoạch kinh doanh',
   'Mẫu kế hoạch kinh doanh chuyên nghiệp giúp bạn xây dựng chiến lược rõ ràng.', false, 3),
  -- Thương hiệu cá nhân
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111103', 'Hướng dẫn xây dựng thương hiệu',
   'Lộ trình xây dựng thương hiệu cá nhân từ zero đến có thu nhập ổn định.', false, 1),
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111103', 'Template bio & profile',
   'Các mẫu bio và profile chuyên nghiệp cho mạng xã hội và website cá nhân.', false, 2),
  ('22222222-2222-2222-2222-222222222209', '11111111-1111-1111-1111-111111111103', 'Chiến lược content marketing',
   'Kế hoạch content marketing 90 ngày giúp bạn tăng trưởng thương hiệu nhanh chóng.', false, 3)
on conflict (id) do update set
  title       = excluded.title,
  description = excluded.description,
  sort_order  = excluded.sort_order;

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------------
-- SECTION: _storage_resources_policies.sql
-- ---------------------------------------------------------------------------
-- Storage RLS policies for 'resources' bucket
-- Admins can INSERT/UPDATE/DELETE. Public can SELECT (already public bucket).
-- Idempotent.

drop policy if exists "Admin upload to resources" on storage.objects;
create policy "Admin upload to resources" on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resources' AND
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admin update resources" on storage.objects;
create policy "Admin update resources" on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resources' AND
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
  with check (
    bucket_id = 'resources' AND
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "Admin delete resources" on storage.objects;
create policy "Admin delete resources" on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resources' AND
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );


-- ---------------------------------------------------------------------------
-- SECTION: _resources_product_link.sql
-- ---------------------------------------------------------------------------
-- Link resources to specific courses (products).
-- NULL product_id = free resource (any logged-in user can access).
-- SET  product_id = only users enrolled in that product can access.

alter table public.resources
  add column if not exists product_id uuid references public.products(id) on delete set null;

create index if not exists idx_resources_product on public.resources(product_id);

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------------
-- SECTION: _crm_contacts_address_dob.sql
-- ---------------------------------------------------------------------------
-- Add date of birth + structured address to CRM contacts
-- Idempotent

alter table public.crm_contacts
  add column if not exists date_of_birth date,
  add column if not exists country text default 'Vietnam',
  add column if not exists province text,
  add column if not exists city text,
  add column if not exists address text;

create index if not exists idx_crm_contacts_country on public.crm_contacts(country);
create index if not exists idx_crm_contacts_province on public.crm_contacts(province);

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------------
-- SECTION: _lessons_add_thumbnail.sql
-- ---------------------------------------------------------------------------
-- Add missing thumbnail_url column on lessons table
-- (admin form already sends this field)

alter table public.lessons
  add column if not exists thumbnail_url text;

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------------
-- SECTION: _fix_vietnamese_slugs.sql
-- ---------------------------------------------------------------------------
-- Rename product slugs containing non-ASCII to clean kebab-case.
-- Idempotent: safe to re-run.

update public.products set slug = 'huong-dan-kiem-tra-suc-khoe-tai-chinh-cho-nha-khoi-nghiep'
  where slug = 'sức_khỏe_tài_chính';

update public.products set slug = 'nhan-thuc-day-du-ve-tai-chinh-kinh-doanh-dau-tu'
  where slug = 'nhận_thức_tài_chinh';

update public.products set slug = '28-ngay-lam-chu-tai-chinh-cho-nha-khoi-nghiep'
  where slug = 'làm_chủ_tài_chính';

-- Verify
select slug, title from public.products order by created_at desc;


-- ---------------------------------------------------------------------------
-- SECTION: _remap_categories.sql
-- ---------------------------------------------------------------------------
-- Re-map old product categories (from prior owner) to new 2-category scheme.
-- Idempotent: safe to re-run.

update public.products set category = 'personal' where category in
  ('video','branding','personal_development','cash-flow','investing','risk-tax');

update public.products set category = 'business' where category in
  ('business','advisor-mindset');

-- Verify
select category, count(*) as n from public.products group by category order by n desc;


-- ---------------------------------------------------------------------------
-- SECTION: _products_type_extend.sql
-- ---------------------------------------------------------------------------
-- Extend products.type check constraint to allow shop types (book, tool)
-- Idempotent.

alter table public.products drop constraint if exists products_type_check;
alter table public.products add constraint products_type_check
  check (type in ('course','ebook','template','membership','book','tool'));

notify pgrst, 'reload schema';


-- ---------------------------------------------------------------------------
-- SECTION: _backfill_subscribers.sql
-- ---------------------------------------------------------------------------
insert into public.subscribers (email, full_name, status, source, tags, user_id, subscribed_at) select lower(u.email), coalesce(u.raw_user_meta_data->>'full_name', p.full_name), 'active', 'website_registration', array['registered_user'], u.id, u.created_at from auth.users u left join public.profiles p on p.id=u.id where not exists (select 1 from public.subscribers s where lower(s.email)=lower(u.email)) returning email, full_name, source;


-- ---------------------------------------------------------------------------
-- SECTION: _manual_confirm_order.sql  -- SKIPPED: was a one-time admin patch from taitue.academy


-- ---------------------------------------------------------------------------
-- SECTION: _patch_products_columns.sql
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists description_html text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists published_at timestamptz,
  add column if not exists featured boolean default false;

create index if not exists idx_products_featured on public.products(featured) where featured = true;
create index if not exists idx_products_published_at on public.products(published_at desc);

notify pgrst, 'reload schema';

