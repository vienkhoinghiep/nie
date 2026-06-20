# Checklist tài khoản & deploy cho học viên

Thời gian dự kiến: **2-3 giờ** cho lần đầu (chia làm 2 buổi).
Chi phí: **0 VNĐ** mọi dịch vụ + **~290k-800k/năm** cho domain.

---

## 📋 Phần 1 — Đăng ký tài khoản BẮT BUỘC (làm theo thứ tự)

### ✅ 1. GitHub (5 phút)

Để Fork template & lưu code của bạn.

- **Đăng ký**: https://github.com/signup
- **Free** vĩnh viễn
- Verify email là dùng được ngay

> 💡 Dùng email mà bạn dùng lâu dài, đừng dùng email tạm.

---

### ✅ 2. Mua Domain (10 phút)

Để có URL riêng như `yourname.academy` thay vì link Vercel mặc định.

| Nơi mua | Giá `.com` | Giá `.vn` | Khuyến nghị cho |
|---------|-----------|-----------|-----------------|
| **PA Vietnam** ([pavietnam.vn](https://pavietnam.vn)) | 290k/năm | 750k/năm | Người mới, hỗ trợ tiếng Việt |
| **iNet** ([inet.vn](https://inet.vn)) | 250k/năm | 750k/năm | Giá rẻ, nội địa |
| **Mắt Bão** ([matbao.net](https://matbao.net)) | 290k/năm | 800k/năm | Uy tín lâu năm |
| **Cloudflare Registrar** ([cloudflare.com/products/registrar](https://www.cloudflare.com/products/registrar/)) | $9.77/năm | ❌ | Rẻ nhất, không hỗ trợ `.vn` |
| **Namecheap** ([namecheap.com](https://namecheap.com)) | $10-13/năm | ❌ | Quốc tế, nhiều khuyến mãi |

> 💡 Nếu phân vân, mua `.com` ở Cloudflare Registrar (rẻ nhất, không phụ phí ẩn).
> Nếu muốn `.vn` (uy tín ở VN), mua ở PA Vietnam.

---

### ✅ 3. Cloudflare (10 phút)

Để quản lý DNS miễn phí + chống DDoS.

- **Đăng ký**: https://dash.cloudflare.com/sign-up
- **Free** Plan đủ dùng (không cần Pro)
- Sau khi đăng ký:
  1. Click **Add a Site** → nhập domain vừa mua
  2. Chọn **Free Plan** → Continue
  3. Cloudflare đưa 2 nameservers (kiểu `xxx.ns.cloudflare.com`)
  4. Vào tài khoản nơi mua domain → đổi **Name Server** sang 2 NS này
  5. Đợi 1-24 giờ để DNS propagate (thường 5-30 phút)

> 💡 Cloudflare nhận domain xong sẽ gửi email xác nhận → từ đó mọi DNS quản lý bên Cloudflare.

---

### ✅ 4. Vercel (5 phút)

Để host website Next.js miễn phí.

- **Đăng ký**: https://vercel.com/signup
- Bấm **Continue with GitHub** → liên kết với tài khoản GitHub vừa tạo
- Chọn gói **Hobby** (Free)
- Giới hạn Free:
  - 100GB bandwidth/tháng (đủ ~50k visitor)
  - 1 cron job/ngày (đã cấu hình sẵn trong template)

---

### ✅ 5. Supabase (10 phút)

Để lưu database, user auth, file upload.

- **Đăng ký**: https://supabase.com → **Start your project** → đăng nhập bằng GitHub
- Tạo **New project**:
  - Name: tuỳ ý (vd: `myacademy`)
  - Database password: **đặt password mạnh + lưu lại an toàn** (không khôi phục được nếu mất)
  - Region: **Southeast Asia (Singapore)** — gần VN nhất
- Đợi 2-3 phút project tạo xong
- Free tier:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

---

### ✅ 6. Resend (10 phút)

Để gửi email xác thực, marketing, notification.

- **Đăng ký**: https://resend.com/signup
- Free: 100 email/ngày, 3000 email/tháng
- Vào **Domains** → **Add Domain** → nhập domain vừa mua
- Resend đưa 3 DNS records (TXT, MX, DKIM) → vào Cloudflare → DNS → Add Record → paste vào
- Đợi 10-30 phút → Resend tự verify
- Vào **API Keys** → **Create API Key** → copy chuỗi `re_...` lưu lại

---

### ✅ 7. SePay (15 phút)

Để nhận thanh toán chuyển khoản tự động từ học viên.

- **Đăng ký**: https://sepay.vn → đăng ký bằng số điện thoại
- KYC (chụp CCCD 2 mặt + selfie) — duyệt trong 1-2 ngày
- Sau khi duyệt:
  1. Vào **Tài khoản ngân hàng** → liên kết STK ngân hàng của bạn
  2. **Quan trọng**: Nếu là tài khoản cá nhân → mở **Tài khoản ảo (VA)** — bắt buộc, KHÔNG dùng STK thật
  3. Vào **API** → **Tạo API Key** → copy
  4. Vào **Webhook** → tạo webhook URL: `https://yourdomain.com/api/sepay/webhook`

> 💡 SePay tính phí 200đ/giao dịch — không có phí cố định hàng tháng.

---

## 📋 Phần 2 — Deploy website (theo `README.md`)

Sau khi có đủ 7 tài khoản trên, làm 6 bước trong [`README.md`](README.md):

1. Fork repo trên GitHub
2. Tạo project Supabase + chạy `supabase/_init.sql`
3. Cấu hình Resend (đã làm ở phần 1)
4. Cấu hình SePay (đã làm ở phần 1)
5. Copy `.env.example` thành `.env.local` + điền các giá trị
6. Import vào Vercel + paste env vars + Deploy

---

## 📋 Phần 3 — Tài khoản TUỲ CHỌN (làm khi cần)

### 🔵 Google Cloud Console (cho đăng nhập Google)

Nếu muốn học viên đăng nhập bằng nút "Continue with Google":

- **Đăng ký**: https://console.cloud.google.com → free
- Tạo project mới → **APIs & Services** → **OAuth consent screen** → External
- **Credentials** → Create → **OAuth 2.0 Client ID** → Web application
- Authorized redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
- Copy **Client ID** + **Client Secret**
- Vào Supabase → Authentication → Providers → Google → paste vào → Enable

### 🔵 PayOS (cổng thanh toán thẻ Visa/Master)

Nếu muốn nhận thanh toán bằng thẻ (không chỉ chuyển khoản):

- **Đăng ký**: https://payos.vn
- KYC tương tự SePay
- Copy 3 giá trị: `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`
- Phí: ~1.5-2% mỗi giao dịch (tuỳ loại thẻ)

### 🔵 Sentry (monitor lỗi production)

Nếu muốn biết khi website bị lỗi:

- **Đăng ký**: https://sentry.io/signup
- Free: 5,000 error event/tháng
- Tạo project Next.js → copy **DSN** → paste vào `NEXT_PUBLIC_SENTRY_DSN`

### 🔵 Google Analytics 4 (tracking traffic)

- Đăng ký https://analytics.google.com (miễn phí mãi mãi)
- Tạo property → Web → lấy **Measurement ID** (kiểu `G-XXXXXXXXXX`)
- Paste vào `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### 🔵 Anthropic API (AI Chat assistant)

Nếu muốn bật trợ lý AI cho học viên:

- **Đăng ký**: https://console.anthropic.com
- Phải nạp tiền tối thiểu $5 — không có free tier
- Copy API key → paste vào `ANTHROPIC_API_KEY`

### 🔵 Zalo OA (gửi tin nhắn Zalo)

Nếu muốn gửi thông báo qua Zalo cho học viên:

- **Đăng ký**: https://oa.zalo.me
- Phải có doanh nghiệp / hộ kinh doanh để mở OA chính thức
- Mất ~3-7 ngày duyệt

---

## 💰 Tổng chi phí ước tính (năm đầu)

| Hạng mục | Chi phí |
|----------|---------|
| Domain `.com` | 250-290k/năm |
| Domain `.vn` (tuỳ chọn) | 750-800k/năm |
| Tất cả dịch vụ khác | **0đ** (free tier đủ dùng) |
| **Tổng (tối thiểu)** | **~250k/năm** |

Phí giao dịch (khi học viên thanh toán):
- SePay: 200đ/lần
- PayOS: ~1.5-2%/giao dịch

---

## ⚠️ Lưu ý quan trọng

1. **Đừng commit `.env.local`** — file đã có trong `.gitignore`. Nếu lỡ commit thì rotate ngay tất cả API key.

2. **Không share Service Role Key của Supabase** — key này bypass mọi rule bảo mật. Chỉ để trong `.env.local` và Vercel Environment Variables.

3. **Verify domain Resend** mới gửi được email — nếu chưa verify thì email bị reject hoặc vào spam.

4. **SePay Virtual Account (VA)** mới dùng được API matching tự động — nếu dùng STK thật thì phải kiểm tra thủ công.

5. **Backup database** Supabase mỗi tuần (Settings → Database → Backups).

---

## 🆘 Gặp vấn đề?

| Vấn đề | Giải pháp |
|--------|-----------|
| Build fail trên Vercel | Vercel → Project → Settings → Environment Variables → kiểm tra đủ chưa |
| Email không gửi | Resend → Domains → kiểm tra status "Verified" |
| Đăng ký không nhận email | Resend → Logs → xem có gửi không, có bounce không |
| SePay không khớp đơn | SePay → Webhook → bấm "Resend" để test, kiểm tra URL đúng chưa |
| Domain trỏ sai | `nslookup yourdomain.com` — xem có ra IP Vercel/Cloudflare không |
| Supabase RLS lỗi | SQL Editor → chạy lại `supabase/_init.sql` lần nữa (idempotent — an toàn) |

Hỏi thêm tại GitHub Issues của repo này hoặc liên hệ tác giả tại [taitue.academy](https://taitue.academy).

---

Chúc anh chị deploy thành công! 🚀
