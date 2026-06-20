import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, FileText, Wrench, Package, ShieldCheck, Truck, Sparkles, ArrowLeft } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import BuyProductButton from "@/components/shop/BuyProductButton";

export const dynamic = "force-dynamic";

const PRODUCT_TYPES = ["book", "ebook", "tool"] as const;

const TYPE_META: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  book: { label: "Sách giấy", icon: BookOpen, color: "#2563EB" },
  ebook: { label: "Ebook", icon: FileText, color: "#3b82f6" },
  tool: { label: "Công cụ phần mềm", icon: Wrench, color: "#a855f7" },
};

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = await createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("title, description, thumbnail, type")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!product || !PRODUCT_TYPES.includes(product.type as (typeof PRODUCT_TYPES)[number])) {
    return { title: "Sản phẩm không tồn tại" };
  }

  const title = `${product.title} — ${siteConfig.name}`;
  const description = product.description ?? `Sản phẩm ${product.title} tại ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: { canonical: `${getBaseUrl()}/shop/${slug}` },
    openGraph: {
      title,
      description,
      siteName: siteConfig.name,
      locale: "vi_VN",
      type: "website",
      images: product.thumbnail ? [product.thumbnail] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, slug, title, description, description_html, thumbnail, price, sale_price, type, category, status")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!product || !PRODUCT_TYPES.includes(product.type as (typeof PRODUCT_TYPES)[number])) {
    notFound();
  }

  // Count sold (paid orders)
  const { count: soldCount } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "paid")
    .eq("product_id", product.id);

  const meta = TYPE_META[product.type] ?? { label: "Sản phẩm", icon: Package, color: "#9ca3af" };
  const Icon = meta.icon;
  const hasSale = product.sale_price != null && product.sale_price < product.price;
  const displayPrice = hasSale ? product.sale_price! : product.price;
  const discount = hasSale ? Math.round(((product.price - product.sale_price!) / product.price) * 100) : 0;

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <PublicHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Back to shop */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Thumbnail */}
          <div className="card-dark overflow-hidden">
            <div
              className="relative aspect-[4/3] w-full"
              style={{ background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)" }}
            >
              {product.thumbnail ? (
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{ color: meta.color }}>
                  <Icon size={80} />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${meta.color}1f`, color: meta.color }}
              >
                <Icon size={12} />
                {meta.label}
              </div>
              {(soldCount ?? 0) > 0 && (
                <span className="text-xs text-gray-500">{soldCount} đã bán</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
              {product.title}
            </h1>

            {/* Short description */}
            {product.description && (
              <p className="text-gray-400 leading-relaxed mb-5">{product.description}</p>
            )}

            {/* Price block */}
            <div className="card-dark p-5 mb-5">
              <div className="flex items-end gap-3 flex-wrap">
                {displayPrice > 0 ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: "#ef4444" }}>
                      {formatVND(displayPrice)}
                    </span>
                    {hasSale && (
                      <>
                        <span className="text-lg text-gray-500 line-through pb-1">
                          {formatVND(product.price)}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-full pb-1"
                          style={{
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.3)",
                          }}
                        >
                          -{discount}%
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-extrabold text-[#22c55e]">Miễn phí</span>
                )}
              </div>

              {/* CTA */}
              <div className="mt-5">
                <BuyProductButton
                  product={{
                    id: product.id,
                    name: product.title,
                    price: displayPrice,
                    description: product.description ?? undefined,
                  }}
                  isAuthenticated={!!user}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-black transition-transform hover:scale-[1.01] active:scale-[0.99]"
                />
              </div>

              {/* Trust badges */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#22c55e]" />
                  Thanh toán an toàn
                </div>
                <div className="flex items-center gap-2">
                  {product.type === "book" ? (
                    <>
                      <Truck size={14} className="text-[#2563EB]" />
                      Giao hàng toàn quốc
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-[#2563EB]" />
                      Truy cập tức thì
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-[#3b82f6]" />
                  Hỗ trợ trọn đời
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Long description */}
        {product.description_html && (
          <div className="mt-12">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Mô tả chi tiết</h2>
            <div
              className="prose prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: product.description_html }}
            />
          </div>
        )}

        {/* Nút đặt hàng phụ — luôn hiển thị ở cuối để khách không phải kéo lại lên */}
        <div
          className="mt-10 card-dark p-5 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02))",
            border: "1px solid rgba(37,99,235,0.25)",
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 mb-1">Sẵn sàng sở hữu?</p>
            <p className="font-bold text-white text-base sm:text-lg leading-snug">
              {product.title}
            </p>
            <div className="mt-1 flex items-baseline gap-2 flex-wrap">
              {displayPrice > 0 ? (
                <>
                  <span className="text-2xl font-extrabold" style={{ color: "#ef4444" }}>
                    {formatVND(displayPrice)}
                  </span>
                  {hasSale && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatVND(product.price)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-2xl font-extrabold text-[#22c55e]">Miễn phí</span>
              )}
            </div>
          </div>
          <BuyProductButton
            product={{
              id: product.id,
              name: product.title,
              price: displayPrice,
              description: product.description ?? undefined,
            }}
            isAuthenticated={!!user}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.99] whitespace-nowrap shrink-0 bg-[#2563EB] hover:bg-[#3B82F6]"
            label={displayPrice === 0 ? "Nhận miễn phí" : "Đặt hàng ngay"}
          />
        </div>
      </div>
    </div>
  );
}
