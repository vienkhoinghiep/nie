import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { sanitizeHtml } from "@/lib/sanitize";
import LeadForm from "@/components/landing/LeadForm";
import {
  Gift,
  CheckCircle2,
  Sparkles,
  Star,
  ShieldCheck,
  Clock,
} from "lucide-react";
import type { LandingPage, BonusItem, Testimonial } from "@/lib/landing-page-types";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const BASE_URL = getBaseUrl();
const DEFAULT_BRAND = "#2563EB";

async function fetchLanding(slug: string): Promise<LandingPage | null> {
  try {
    const admin = await createAdminClient();
    const { data } = await admin
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data as LandingPage | null) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Metadata (SEO)
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchLanding(slug);
  if (!page) {
    return { title: `Trang không tồn tại — ${siteConfig.name}` };
  }
  const url = `${BASE_URL}/lp/${page.slug}`;
  const description = page.meta_description || page.hero_subheadline || page.hero_headline;
  return {
    title: `${page.title} — ${siteConfig.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: description ?? undefined,
      url,
      siteName: siteConfig.name,
      locale: "vi_VN",
      type: "website",
      images: page.hero_image_url
        ? [{ url: page.hero_image_url, width: 1200, height: 630, alt: page.title }]
        : undefined,
    },
    robots: { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function LandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await fetchLanding(slug);
  if (!page) notFound();

  const brand = page.brand_color || DEFAULT_BRAND;
  const fields = page.form_fields ?? ["name", "email", "phone"];

  // Fire-and-forget views++ (best-effort).
  try {
    const admin = await createAdminClient();
    await admin
      .from("landing_pages")
      .update({ views: (page.views ?? 0) + 1 })
      .eq("id", page.id);
  } catch {
    // ignore
  }

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="max-w-6xl mx-auto">
          {page.hero_badge && (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5"
              style={{
                background: `linear-gradient(135deg, ${brand}22, ${brand}11)`,
                border: `1px solid ${brand}66`,
                color: brand,
              }}
            >
              <Gift size={13} />
              {page.hero_badge}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: headline + benefits */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-5">
                {page.hero_headline}
              </h1>
              {page.hero_subheadline && (
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-7">
                  {page.hero_subheadline}
                </p>
              )}

              {/* Benefits */}
              {page.benefits.length > 0 && (
                <div className="space-y-2.5 mb-8">
                  {page.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={20}
                        className="shrink-0 mt-0.5"
                        style={{ color: brand }}
                      />
                      <span className="text-[15px] text-gray-200 leading-relaxed">{b}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mobile-visible image */}
              {page.hero_image_url && (
                <div className="lg:hidden mb-8">
                  <div
                    className="relative aspect-[4/3] rounded-xl overflow-hidden"
                    style={{
                      background: "#0a0a0a",
                      border: `2px solid ${brand}55`,
                      boxShadow: `0 10px 40px ${brand}22`,
                    }}
                  >
                    <Image
                      src={page.hero_image_url}
                      alt={page.hero_headline}
                      fill
                      sizes="(min-width: 1024px) 0vw, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right: form + desktop image stacked */}
            <div className="space-y-6">
              {page.hero_image_url && (
                <div className="hidden lg:block">
                  <div
                    className="relative aspect-[4/3] rounded-xl overflow-hidden"
                    style={{
                      background: "#0a0a0a",
                      border: `2px solid ${brand}55`,
                      boxShadow: `0 10px 40px ${brand}22`,
                    }}
                  >
                    <Image
                      src={page.hero_image_url}
                      alt={page.hero_headline}
                      fill
                      sizes="(min-width: 1024px) 600px, 100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
              <LeadForm
                landingPageSlug={page.slug}
                fields={fields}
                ctaLabel={page.cta_label}
                successMessage={page.success_message}
                successRedirectUrl={page.success_redirect_url}
                brandColor={brand}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bonus Items ─────────────────────────────────────── */}
      {page.bonus_items && page.bonus_items.length > 0 && (
        <section className="px-4 sm:px-6 py-12 border-t border-[#1a1a1a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3"
                style={{ background: `${brand}1a`, color: brand }}
              >
                <Sparkles size={13} />
                Quà tặng kèm theo
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Bạn nhận được trọn bộ gồm
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {(page.bonus_items as BonusItem[]).map((item, i) => (
                <div
                  key={i}
                  className="card-dark p-5 flex items-start gap-4"
                  style={{ border: `1px solid ${brand}22` }}
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-lg"
                    style={{ background: `${brand}1a`, color: brand }}
                  >
                    {item.icon ?? "🎁"}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm mb-1 leading-snug">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      Trị giá: <span className="font-semibold" style={{ color: brand }}>{item.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Body HTML (long-form content) ──────────────────────── */}
      {page.body_html && (
        <section className="px-4 sm:px-6 py-12 border-t border-[#1a1a1a]">
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.body_html) }}
            />
          </div>
        </section>
      )}

      {/* ── Testimonials ───────────────────────────────────────── */}
      {page.testimonials && page.testimonials.length > 0 && (
        <section className="px-4 sm:px-6 py-12 border-t border-[#1a1a1a]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Cộng đồng đã nhận được gì?
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {(page.testimonials as Testimonial[]).map((t, i) => (
                <div key={i} className="card-dark p-5">
                  <div className="flex items-center gap-0.5 mb-2.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="fill-current" style={{ color: brand }} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-4 italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        width={36}
                        height={36}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ background: `${brand}22`, color: brand }}
                      >
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                      <div className="text-xs text-gray-500 truncate">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trust badges ───────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-10 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-green-400" />
            Bảo mật thông tin tuyệt đối
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock size={16} style={{ color: brand }} />
            Nhận quà ngay sau khi đăng ký
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-blue-400" />
            Hỗ trợ trọn đời từ {siteConfig.name}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] px-4 sm:px-6 py-8 text-center text-xs text-gray-500">
        © 2026 {siteConfig.name} — taitue.academy
      </footer>
    </div>
  );
}
