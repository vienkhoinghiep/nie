// ──────────────────────────────────────────────
// Site Configuration — Customize via Environment Variables
// ──────────────────────────────────────────────
// Tất cả giá trị đều có thể override bằng env vars trên Vercel.
// Bạn KHÔNG cần sửa file này — chỉ cần set env vars trong .env.local (local)
// hoặc Project Settings → Environment Variables (Vercel).
// Giá trị mặc định bên dưới chỉ là placeholder.
//
// IMPORTANT: Each NEXT_PUBLIC_* var must be referenced as a STATIC literal
// (e.g. `process.env.NEXT_PUBLIC_FOO`) so the Next.js bundler can inline it
// at build time. Using dynamic keys (`process.env[key]`) breaks client-side
// inlining and produces server/client hydration mismatches.
// ──────────────────────────────────────────────

const pick = (value: string | undefined, fallback: string): string =>
  value && value.length > 0 ? value : fallback;

export const siteConfig = {
  // ─── Brand ───
  name: pick(process.env.NEXT_PUBLIC_SITE_NAME, "Viện Nghiên Cứu Khởi Nghiệp"),
  shortName: pick(process.env.NEXT_PUBLIC_SITE_SHORT_NAME, "VINEN"),
  domain: pick(process.env.NEXT_PUBLIC_SITE_DOMAIN, "vienkhoinghiep.vn"),
  tagline: pick(
    process.env.NEXT_PUBLIC_SITE_TAGLINE,
    "Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân"
  ),
  description: pick(
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    "Viện Nghiên Cứu Khởi Nghiệp (VINEN) — đào tạo, tư vấn và kết nối mentor 1-1 cho cộng đồng founder Việt Nam. Thành lập 2023."
  ),

  // ─── Owner ───
  owner: {
    name: pick(process.env.NEXT_PUBLIC_OWNER_NAME, "Viện Nghiên Cứu Khởi Nghiệp"),
    bio: pick(
      process.env.NEXT_PUBLIC_OWNER_BIO,
      "Tổ chức nghiên cứu, đào tạo và mentoring cho cộng đồng khởi nghiệp Việt Nam."
    ),
    avatar: pick(process.env.NEXT_PUBLIC_OWNER_AVATAR, "/images/about/logo.png"),
  },

  // ─── Colors (CSS values) ───
  // Brand: #2563EB (classic blue) + navy/gold accents từ logo huy hiệu
  colors: {
    brand: pick(process.env.NEXT_PUBLIC_COLOR_BRAND, "#2563EB"),
    brandHover: pick(process.env.NEXT_PUBLIC_COLOR_BRAND_HOVER, "#3B82F6"),
    background: pick(process.env.NEXT_PUBLIC_COLOR_BG, "#0a0a0a"),
    surface: pick(process.env.NEXT_PUBLIC_COLOR_SURFACE, "#111111"),
    text: pick(process.env.NEXT_PUBLIC_COLOR_TEXT, "#f5f5f5"),
  },

  // ─── Support / legal contact ───
  support: {
    email: pick(process.env.NEXT_PUBLIC_SUPPORT_EMAIL, "info@vienkhoinghiep.vn"),
    phone: pick(process.env.NEXT_PUBLIC_SUPPORT_PHONE, ""),
  },

  // ─── Social Links ───
  socials: {
    facebook: pick(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK, ""),
    youtube: pick(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE, ""),
    zalo: pick(process.env.NEXT_PUBLIC_SOCIAL_ZALO, ""),
    tiktok: pick(process.env.NEXT_PUBLIC_SOCIAL_TIKTOK, ""),
    instagram: pick(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM, ""),
  },

  // ─── Footer ───
  // Note: year is intentionally a literal so it stays stable between server
  // and client modules — otherwise a process started before midnight Dec 31
  // and hydrated after midnight would produce a mismatch.
  footer: {
    copyright: pick(
      process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT,
      "© 2026 Viện Nghiên Cứu Khởi Nghiệp (VINEN)"
    ),
  },

  // ─── Features (toggle on/off) ───
  features: {
    affiliate: process.env.NEXT_PUBLIC_FEATURE_AFFILIATE !== "false",
    community: process.env.NEXT_PUBLIC_FEATURE_COMMUNITY !== "false",
    leaderboard: process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD !== "false",
    events: process.env.NEXT_PUBLIC_FEATURE_EVENTS !== "false",
    blog: process.env.NEXT_PUBLIC_FEATURE_BLOG !== "false",
    crm: process.env.NEXT_PUBLIC_FEATURE_CRM !== "false",
    emailMarketing: process.env.NEXT_PUBLIC_FEATURE_EMAIL_MARKETING !== "false",
    // VINEN-specific: mentor matching platform
    mentoring: process.env.NEXT_PUBLIC_FEATURE_MENTORING !== "false",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Extracts the phone number from the Zalo URL (e.g. "https://zalo.me/0782276727" → "0782276727").
 * Falls back to the raw URL if parsing fails.
 */
export function getZaloPhone(): string {
  const match = siteConfig.socials.zalo.match(/zalo\.me\/(\d+)/);
  return match?.[1] ?? siteConfig.socials.zalo;
}

/**
 * Returns the canonical base URL for the site.
 * Uses NEXT_PUBLIC_APP_URL env var, falling back to the configured domain.
 * Never returns a trailing slash.
 */
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return `https://${siteConfig.domain}`;
}
