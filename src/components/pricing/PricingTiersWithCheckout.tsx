"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import CheckoutModal from "@/components/checkout/CheckoutModal";
import { createClient } from "@/lib/supabase/client";

const BRAND = "#2563EB";
const BRAND_HI = "#3B82F6";

export interface TierProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  sale_price: number | null;
}

export interface TierDisplay {
  slug: string;
  badge: string;
  badgeColor: string;
  title: string;
  short: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
  bundleNote: string; // What the tier unlocks
}

interface Props {
  /** Display config + UI copy (static). */
  tiers: TierDisplay[];
  /** Product rows fetched server-side — pricing/IDs from DB. */
  products: TierProduct[];
  /** Override where the "Compare" link points to. Default: /pricing. */
  compareHref?: string;
  /** Hide the "Compare" link if a compare table is rendered inline. */
  hideCompareLink?: boolean;
}

function vnd(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

export default function PricingTiersWithCheckout({
  tiers,
  products,
  compareHref = "/pricing",
  hideCompareLink = false,
}: Props) {
  const router = useRouter();
  const [checkoutProduct, setCheckoutProduct] = useState<TierProduct | null>(null);

  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const handleSelect = async (tier: TierDisplay) => {
    const product = productBySlug.get(tier.slug);
    if (!product) {
      // Fallback: take user to the course page if DB row missing
      router.push(`/courses/${tier.slug}`);
      return;
    }

    // Auth gate — non-logged users go to /register with redirect back here
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const next = encodeURIComponent(window.location.pathname);
      router.push(`/register?next=${next}`);
      return;
    }

    setCheckoutProduct(product);
  };

  return (
    <>
      <div className="grid lg:grid-cols-3 gap-5">
        {tiers.map((t) => {
          const product = productBySlug.get(t.slug);
          const price = product?.sale_price ?? product?.price ?? 0;

          return (
            <div
              key={t.slug}
              className="rounded-2xl p-6 sm:p-7 relative flex flex-col"
              style={{
                background: t.highlighted
                  ? `linear-gradient(180deg, ${BRAND}14, #141414)`
                  : "#141414",
                border: t.highlighted ? `1px solid ${BRAND}77` : "1px solid #232323",
                boxShadow: t.highlighted ? `0 20px 60px ${BRAND}22` : undefined,
              }}
            >
              {t.highlighted ? (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-black whitespace-nowrap"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND_HI}, ${BRAND})`,
                    boxShadow: `0 4px 16px ${BRAND}66`,
                  }}
                >
                  ⭐ {t.badge}
                </div>
              ) : (
                <div
                  className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 self-start"
                  style={{
                    background: `${t.badgeColor}1a`,
                    color: t.badgeColor,
                    border: `1px solid ${t.badgeColor}55`,
                  }}
                >
                  {t.badge}
                </div>
              )}
              <h3 className="text-xl font-extrabold text-white mb-1">{t.title}</h3>
              <p className="text-sm text-gray-400 mb-4">{t.short}</p>

              <div className="mb-5 pb-5 border-b border-[#232323]">
                <div
                  className="text-3xl font-extrabold"
                  style={{ color: t.highlighted ? BRAND : "#fff" }}
                >
                  {vnd(price)}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Thanh toán một lần · trọn đời truy cập
                </div>
              </div>

              <ul className="space-y-2.5 mb-4">
                {t.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-300"
                  >
                    <CheckCircle2
                      size={15}
                      className="shrink-0 mt-0.5"
                      style={{ color: t.highlighted ? BRAND : "#22c55e" }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div
                className="text-[11px] leading-relaxed px-3 py-2 rounded-lg mb-5"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#9ca3af",
                }}
              >
                🔓 <strong className="text-gray-300">Truy cập:</strong> {t.bundleNote}
              </div>

              <div className="flex-1" />

              <button
                type="button"
                onClick={() => handleSelect(t)}
                className="block w-full text-center py-3 rounded-xl text-sm font-extrabold transition-transform hover:scale-[1.02]"
                style={{
                  background: t.highlighted
                    ? `linear-gradient(135deg, ${BRAND_HI}, ${BRAND})`
                    : "rgba(255,255,255,0.06)",
                  color: t.highlighted ? "#000" : "#fff",
                  border: t.highlighted ? "none" : "1px solid #2a2a2a",
                  boxShadow: t.highlighted ? `0 8px 24px ${BRAND}55` : undefined,
                }}
              >
                {t.ctaLabel}
              </button>
            </div>
          );
        })}
      </div>

      {!hideCompareLink && (
        <div className="text-center mt-7">
          <Link
            href={compareHref}
            className="text-sm text-gray-400 hover:text-[#2563EB] underline transition-colors"
          >
            So sánh chi tiết từng tính năng giữa 3 gói →
          </Link>
        </div>
      )}

      {checkoutProduct && (
        <CheckoutModal
          product={{
            id: checkoutProduct.id,
            name: checkoutProduct.title,
            price: checkoutProduct.sale_price ?? checkoutProduct.price,
          }}
          onClose={() => setCheckoutProduct(null)}
          onSuccess={() => {
            setCheckoutProduct(null);
            router.push("/dashboard");
          }}
        />
      )}
    </>
  );
}
