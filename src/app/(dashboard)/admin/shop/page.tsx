import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import { BookOpen, FileText, Wrench, Plus, Pencil, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  sale_price: number | null;
  type: string;
  status: string;
  sort_order: number;
  created_at: string;
};

const TYPE_META: Record<string, { label: string; icon: typeof BookOpen; color: string; bg: string }> = {
  book: { label: "Sách giấy", icon: BookOpen, color: "#2563EB", bg: "rgba(37,99,235,0.12)" },
  ebook: { label: "Ebook", icon: FileText, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  tool: { label: "Công cụ", icon: Wrench, color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
};

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Đã đăng", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  draft: { label: "Bản nháp", color: "#9ca3af", bg: "rgba(156,163,175,0.12)" },
  archived: { label: "Lưu trữ", color: "#6b7280", bg: "rgba(107,114,128,0.12)" },
};

export default async function AdminShopPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) redirect("/dashboard");

  const { data } = await admin
    .from("products")
    .select("id, slug, title, description, thumbnail, price, sale_price, type, status, sort_order, created_at")
    .in("type", ["book", "ebook", "tool"])
    .order("sort_order", { ascending: true });

  const products = (data || []) as Product[];
  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.type]) acc[p.type] = [];
    acc[p.type].push(p);
    return acc;
  }, {});

  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.status === "published").length;

  return (
    <div>
      <TopBar
        title="Quản lý Cửa hàng"
        subtitle="Sách, ebook và công cụ cho nhà khởi nghiệp"
      />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {totalCount} sản phẩm · {publishedCount} đang hiển thị
          </div>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-black"
            style={{ background: "#2563EB" }}
            title="Tạo sản phẩm mới (dùng chung form với khoá học, chọn type Sách giấy / Ebook / Công cụ)"
          >
            <Plus size={14} /> Thêm sản phẩm
          </Link>
        </div>

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="card-dark p-12 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB" }}
            >
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-5">
              Bấm &ldquo;Thêm sản phẩm&rdquo; bên trên để tạo sản phẩm đầu tiên. Trong form, chọn{" "}
              <span className="text-white">Loại sản phẩm</span> = Sách giấy / Ebook / Công cụ.
            </p>
          </div>
        )}

        {/* Grouped lists */}
        {["book", "ebook", "tool"].map((type) => {
          const items = grouped[type];
          if (!items || items.length === 0) return null;
          const meta = TYPE_META[type];
          const Icon = meta.icon;
          return (
            <section key={type} className="card-dark p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Icon size={18} />
                </div>
                <h3 className="text-base font-semibold text-white">{meta.label}</h3>
                <span className="text-xs text-gray-500">{items.length} sản phẩm</span>
              </div>

              <div className="space-y-2">
                {items.map((p) => {
                  const status = STATUS_META[p.status] || STATUS_META.draft;
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/courses/${p.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#161616] border border-[#222] hover:border-[#333] transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-12 rounded bg-[#0a0a0a] shrink-0 overflow-hidden relative">
                        {p.thumbnail ? (
                          <Image
                            src={p.thumbnail}
                            alt={p.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ color: meta.color }}>
                            <Icon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white truncate">{p.title}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                            style={{ color: status.color, background: status.bg }}
                          >
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="font-mono">/{p.slug}</span>
                          {p.price > 0 ? (
                            <span className="font-semibold" style={{ color: meta.color }}>
                              {p.sale_price && p.sale_price < p.price ? (
                                <>
                                  {formatVND(p.sale_price)}{" "}
                                  <span className="text-gray-600 line-through">{formatVND(p.price)}</span>
                                </>
                              ) : (
                                formatVND(p.price)
                              )}
                            </span>
                          ) : (
                            <span style={{ color: "#22c55e" }}>Miễn phí</span>
                          )}
                        </div>
                      </div>
                      <Pencil size={14} className="text-gray-500 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Hint */}
        {totalCount > 0 && (
          <div className="p-4 rounded-lg text-xs text-gray-500 leading-relaxed" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
            💡 Sản phẩm Cửa hàng dùng chung database với Khoá học. Form &ldquo;Thêm sản phẩm&rdquo; mở trang{" "}
            <code className="text-gray-300">/admin/courses/new</code> — anh chỉ cần chọn <strong>Loại sản phẩm</strong>{" "}
            là Sách giấy / Ebook / Công cụ thay vì Khoá học. Sản phẩm sẽ tự xuất hiện trong{" "}
            <Link href="/shop" className="text-[#2563EB] hover:underline">/shop</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
