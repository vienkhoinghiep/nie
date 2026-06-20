import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; redirect?: string; next?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;
  // Only accept internal redirect targets (`/…`), reject protocol-relative
  // and absolute URLs to prevent open-redirect.
  const rawRedirect = params.redirect ?? params.next ?? "";
  const redirectUrl =
    rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : null;
  // Append `redirect` to login + re-register links so the destination
  // survives the round-trip through email verification (matches the
  // `redirect` param convention already used by LoginForm + middleware).
  const loginHref = redirectUrl
    ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
    : "/login";
  const reregHref = redirectUrl
    ? `/register?email=${encodeURIComponent(email ?? "")}&redirect=${encodeURIComponent(redirectUrl)}`
    : "/register";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at top, #0d1a12 0%, #0a0a0a 60%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/images/about/portrait.jpg" alt={siteConfig.name} className="w-14 h-14 rounded-2xl mb-4 object-cover inline-block" />
          <h1 className="text-2xl font-bold text-white">Kiểm tra email của bạn</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Chỉ còn một bước nữa để kích hoạt tài khoản
          </p>
        </div>

        <div className="card-dark p-6 sm:p-8 text-center">
          {/* Email icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            Chúng tôi đã gửi email xác thực đến:
          </p>

          {email && (
            <p className="text-[#2563EB] font-semibold text-base mb-4 break-all">
              {email}
            </p>
          )}

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Vui lòng mở email và nhấn vào nút <span className="text-gray-300 font-medium">&quot;Xác thực tài khoản&quot;</span> để kích hoạt.
            Kiểm tra cả thư mục <span className="text-gray-300 font-medium">Spam</span> nếu bạn không thấy email.
          </p>

          <div className="h-px mb-6" style={{ background: "#2a2a2a" }} />

          <div className="space-y-3">
            <Link
              href={loginHref}
              className="btn-green w-full justify-center py-2.5 inline-flex"
            >
              Đã xác thực? Đăng nhập
            </Link>
            <Link
              href={reregHref}
              className="block text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Chưa nhận được? Đăng ký lại
            </Link>
          </div>

          {redirectUrl && (
            <p className="mt-5 text-[11px] text-[#2563EB]/80">
              Sau khi xác thực email, bạn sẽ được dẫn thẳng tới khoá học để
              bắt đầu học ngay.
            </p>
          )}
        </div>

        {/* Tip */}
        <div className="mt-6 card-dark p-4 text-center">
          <p className="text-xs text-gray-500">
            Link xác thực có hiệu lực trong 24 giờ.
          </p>
        </div>
      </div>
    </div>
  );
}
