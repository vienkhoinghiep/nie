import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import BuyProductButton from "@/components/shop/BuyProductButton";
import { BookOpen, Wrench, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Cửa hàng — ${siteConfig.name}`,
  description: "Sách và công cụ thiết yếu giúp nhà khởi nghiệp làm chủ tài chính cá nhân và phát triển doanh nghiệp bền vững.",
  alternates: { canonical: `${getBaseUrl()}/shop` },
};

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  sale_price: number | null;
  type: string;
  category: string | null;
  status: string;
};

// Categories cho cửa hàng — mỗi nhóm có thể chứa nhiều loại sản phẩm
const CATEGORIES_ORDER = ["sach", "cong-cu-phan-mem", "_other"];
const CATEGORY_META: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  sach: { label: "Sách", icon: BookOpen, color: "#2563EB" },
  "cong-cu-phan-mem": { label: "Công cụ phần mềm", icon: Wrench, color: "#a855f7" },
  _other: { label: "Sản phẩm khác", icon: Package, color: "#3b82f6" },
};

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

export default async function ShopPage() {
  const admin = await createAdminClient();

  // Auth state — để biết khi click "Mua ngay" có nên mở checkout modal hay redirect register
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const { data } = await admin
    .from("products")
    .select("id, slug, title, description, thumbnail, price, sale_price, type, category, status")
    .in("type", ["book", "ebook", "tool"])
    .eq("status", "published")
    .order("sort_order", { ascending: true });

  const products = (data || []) as Product[];

  // Count "sold" per product (paid orders)
  const productIds = products.map((p) => p.id);
  const soldCounts = new Map<string, number>();
  if (productIds.length > 0) {
    const { data: orderRows } = await admin
      .from("orders")
      .select("product_id")
      .eq("status", "paid")
      .in("product_id", productIds);
    for (const o of orderRows || []) {
      const pid = (o as { product_id: string }).product_id;
      soldCounts.set(pid, (soldCounts.get(pid) || 0) + 1);
    }
  }

  // Group by shop category (fall back to _other when not set)
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.category && CATEGORY_META[p.category] ? p.category : "_other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <PublicHeader />

      {/* Hero */}
      <section className="pt-28 pb-10 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            Sách & Công Cụ Cho{" "}
            <span style={{ color: siteConfig.colors.brand }}>Nhà Khởi Nghiệp</span>
          </h1>
          <p className="text-base text-gray-400 max-w-2xl mx-auto">
            Tài liệu chọn lọc và công cụ thiết yếu giúp anh chị làm chủ tài chính cá nhân
            và phát triển doanh nghiệp bền vững.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {products.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">
              Chưa có sản phẩm nào. Quay lại sau nhé.
            </p>
          ) : (
            CATEGORIES_ORDER.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              return (
                <div key={cat} className="mb-12 last:mb-0">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: `${meta.color}1f`, color: meta.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">{meta.label}</h2>
                    <span className="text-xs text-gray-500">{items.length} sản phẩm</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {items.map((p) => {
                      const sold = soldCounts.get(p.id) ?? 0;
                      const hasSale = p.sale_price != null && p.sale_price < p.price;
                      const displayPrice = hasSale ? p.sale_price! : p.price;
                      return (
                        <div
                          key={p.id}
                          className="card-dark overflow-hidden flex flex-col group hover:border-[#444] transition-colors"
                        >
                          {/* Image — light neutral background so product covers (often light colors) pop */}
                          <Link href={`/shop/${p.slug}`} className="block">
                            <div
                              className="relative aspect-[4/3] overflow-hidden"
                              style={{ background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)" }}
                            >
                              {p.thumbnail ? (
                                <Image
                                  src={p.thumbnail}
                                  alt={p.title}
                                  fill
                                  sizes="(min-width: 1280px) 288px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center" style={{ color: meta.color }}>
                                  <Icon size={56} />
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Body */}
                          <div className="flex-1 flex flex-col p-4">
                            <Link href={`/shop/${p.slug}`} className="block mb-3">
                              <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 min-h-[2.5rem] hover:text-[#2563EB] transition-colors text-center">
                                {p.title}
                              </h3>
                            </Link>

                            {/* Price + CTA row */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex flex-col">
                                {hasSale && (
                                  <span className="text-[11px] text-gray-500 line-through leading-none">
                                    {formatVND(p.price)}
                                  </span>
                                )}
                                {displayPrice > 0 ? (
                                  <span className="text-xl font-extrabold leading-none" style={{ color: "#ef4444" }}>
                                    {formatVND(displayPrice)}
                                  </span>
                                ) : (
                                  <span className="text-xl font-extrabold leading-none" style={{ color: "#22c55e" }}>
                                    Miễn phí
                                  </span>
                                )}
                              </div>
                              <BuyProductButton
                                product={{
                                  id: p.id,
                                  name: p.title,
                                  price: displayPrice,
                                  description: p.description ?? undefined,
                                }}
                                isAuthenticated={isAuthenticated}
                                className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-[#2a2a2a] text-white hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap"
                                label={displayPrice === 0 ? "Nhận miễn phí" : "Mua ngay"}
                              />
                            </div>

                            {/* Sold count + thin progress bar */}
                            <div className="mt-auto">
                              <p className="text-[11px] text-gray-500 mb-1.5">
                                {sold} sản phẩm đã bán
                              </p>
                              <div className="h-1 rounded-full bg-[#222] overflow-hidden">
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${Math.min(100, sold * 5)}%`,
                                    background: `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
