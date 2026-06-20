# Taitue Platform

Full-stack LMS template dùng để dựng nhanh **học viện online tài chính / khởi nghiệp**, dựa trên codebase production của [taitue.academy](https://taitue.academy).

Stack: **Next.js 16** · **Supabase** (Postgres + Auth + Storage) · **Tailwind 4** · **Resend** · **SePay/PayOS** · Vercel.

---

## Tính năng có sẵn

- Quản lý khoá học, bài học, section, drip content
- Thanh toán tự động qua **SePay** (chuyển khoản) + **PayOS** (cổng thanh toán)
- Dashboard học viên: tiến độ, streak, leaderboard, certificate
- Cửa hàng sản phẩm (sách, ebook, công cụ)
- Tài nguyên (resources) gắn với từng khoá học, có phân quyền free/member/vip
- CRM: contact, tag, segment, activity timeline
- Email marketing: campaign + automation flow qua Resend
- Blog với editor giàu định dạng + RSS
- Affiliate program
- 11 công cụ tài chính (financial blueprint, sức khoẻ tài chính, dòng tiền...)
- Admin panel quản lý toàn bộ
- Tích hợp Zalo OA, Anthropic AI Chat, Sentry, GA4, FB Pixel

---

## Bắt đầu — 6 bước deploy

> 📋 **Người mới**: nên đọc [`STUDENT_CHECKLIST.md`](STUDENT_CHECKLIST.md) trước — checklist 7 tài khoản cần đăng ký, kèm bảng giá domain VN + ước tính chi phí.

### Bước 1 — Fork repo

Click **Fork** ở góc phải trên cùng của repo này. Hoặc clone về máy:

```bash
git clone https://github.com/<your-username>/taitue-platform-public.git my-academy
cd my-academy
```

### Bước 2 — Tạo project Supabase

1. Đăng ký https://supabase.com (Free tier OK)
2. Tạo project mới (chọn region gần Việt Nam: Singapore)
3. Vào **SQL Editor** → New query → mở file `supabase/_init.sql` → copy/paste toàn bộ → **Run**
4. Vào **Settings → API** → copy 3 giá trị:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Bước 3 — Đăng ký Resend (email)

1. Đăng ký https://resend.com
2. Thêm domain của bạn → cài DNS records theo hướng dẫn → verify
3. **API Keys** → Create → copy → `RESEND_API_KEY`
4. Set `EMAIL_FROM=no-reply@yourdomain.com`

### Bước 4 — Đăng ký SePay (thanh toán)

1. Đăng ký https://sepay.vn
2. Mở **Tài khoản ảo (VA)** — bắt buộc với tài khoản cá nhân
3. Copy:
   - API key → `SEPAY_API_KEY`
   - Số tài khoản VA → `SEPAY_BANK_ACCOUNT`
   - Mã ngân hàng → `SEPAY_BANK_CODE`
4. Cấu hình **Webhook URL** trên SePay → `https://yourdomain.com/api/sepay/webhook`

### Bước 5 — Cấu hình env vars

```bash
cp .env.example .env.local
```

Mở `.env.local`, điền các giá trị ở bước 2-4. Tham khảo phần "Customize sau khi fork" bên dưới để đặt thương hiệu của bạn.

Sinh 2 secret nội bộ:

```powershell
# PowerShell (Windows):
-join ((48..57)+(97..122) | Get-Random -Count 64 | %{[char]$_})
```

```bash
# bash / macOS:
openssl rand -hex 32
```

Dán vào `CRON_SECRET` và `INTERNAL_WEBHOOK_SECRET`.

### Bước 6 — Deploy lên Vercel

1. Đăng ký https://vercel.com → Import từ GitHub repo vừa fork
2. **Environment Variables** → paste TẤT CẢ biến từ `.env.local`
3. Đổi `NEXT_PUBLIC_APP_URL` và `NEXT_PUBLIC_SITE_URL` thành domain production của bạn
4. **Deploy**
5. Vercel → Settings → Domains → thêm domain riêng

---

## Customize sau khi fork

**KHÔNG cần sửa code** cho phần thương hiệu. Chỉ cần đổi env vars:

```env
NEXT_PUBLIC_SITE_NAME=Tên Academy Của Bạn
NEXT_PUBLIC_SITE_DOMAIN=yourdomain.com
NEXT_PUBLIC_SITE_TAGLINE=Slogan của bạn
NEXT_PUBLIC_OWNER_NAME=Họ Tên Của Bạn
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
NEXT_PUBLIC_COLOR_BRAND=#D4A843
```

Toàn bộ giá trị này được đọc từ [`src/lib/site-config.ts`](src/lib/site-config.ts) — đã env-driven sẵn.

**CẦN sửa code** cho các phần sau (nội dung copy):

| File | Sửa gì |
|------|--------|
| `src/app/HomePage.tsx` | Trang chủ vẫn còn chứa nội dung gốc (6 sai lầm tài chính, 6 bước hoạch định, testimonials, free gift...). Edit lại cho phù hợp niche của bạn. |
| `src/app/refund-policy/page.tsx`<br>`src/app/privacy/page.tsx`<br>`src/app/terms/page.tsx`<br>`src/app/(dashboard)/privacy-policy/page.tsx`<br>`src/app/(dashboard)/terms-of-service/page.tsx` | Hard-code email `info@yourdomain.com` / `support@yourdomain.com` — đổi thành email thật của bạn. |
| `src/app/tools/entrepreneur-financial-blueprint/report/PremiumReport.tsx` | Báo cáo tài chính cao cấp — tên coach hardcode "Your Coach". |
| `public/images/about/logo.png` | Logo placeholder. Thay bằng logo của bạn (giữ tên file). |
| `public/images/students/channel-*.jpg` | 4 ảnh testimonial placeholder. |

---

## Cấu trúc thư mục

```
src/
  app/
    (dashboard)/       # Khu vực sau khi login (student + admin)
    api/               # API routes
    auth/              # OAuth callback
    courses/[slug]/    # Trang chi tiết khoá học
    shop/              # Cửa hàng sản phẩm
    tools/             # 11 công cụ tài chính
    HomePage.tsx       # Landing page chính
  components/          # UI components dùng chung
  lib/
    site-config.ts     # ⭐ Tất cả branding ở đây — env-driven
    supabase/          # Supabase clients
    email/             # Resend helpers
public/
  images/              # Ảnh tĩnh
supabase/
  _init.sql            # ⭐ Schema gộp — chạy 1 lần trong Supabase SQL Editor
scripts/
  run-migration.mjs    # Chạy migration qua Supabase Management API
  run-sql.mjs          # Chạy raw SQL
```

---

## Tài liệu chi tiết

- [`SETUP.md`](SETUP.md) — Hướng dẫn setup chi tiết
- [`DEPLOY.md`](DEPLOY.md) — Hướng dẫn deploy Vercel
- [`GA4_SETUP.md`](GA4_SETUP.md) — Cấu hình Google Analytics 4
- [`SENTRY_SETUP.md`](SENTRY_SETUP.md) — Cấu hình error monitoring

---

## Stack tham khảo

| Thành phần | Dịch vụ | Tier khuyến nghị |
|-----------|---------|------------------|
| Hosting | Vercel | Hobby (free) |
| Database | Supabase | Free (500MB) |
| Email | Resend | Free (3k email/tháng) |
| Thanh toán VN | SePay | Free + phí mỗi giao dịch |
| Cổng thanh toán | PayOS | Free + phí mỗi giao dịch |
| Domain | Cloudflare / Namecheap | $10-15/năm |
| Error monitoring | Sentry | Free (5k event/tháng) |

**Chi phí ước tính khi bắt đầu**: $0-15/tháng (chỉ tốn tiền domain).

---

## Yêu cầu hệ thống

- Node.js ≥ 20
- npm 10+ (hoặc pnpm/yarn)

```bash
npm install
npm run dev          # Local dev tại http://localhost:3000
npm run build        # Build production
npm run start        # Chạy production build
```

---

## License

MIT — xem [LICENSE](LICENSE).

Template này dựa trên codebase production của [taitue.academy](https://taitue.academy). Free for personal & commercial use. **Không** yêu cầu attribution nhưng nếu bạn dùng tốt thì cho mình 1 ⭐ trên GitHub nhé.

---

## Hỗ trợ

- **Issue**: mở issue ở repo này
- **Bug** đã rõ ràng: tạo PR luôn cũng được
- **Câu hỏi**: liên hệ trực tiếp tác giả tại taitue.academy

> ⚠️ **Không commit `.env.local`** — file đã có trong `.gitignore`. Nếu lỡ commit thì rotate ngay toàn bộ key (Supabase, Resend, SePay).
