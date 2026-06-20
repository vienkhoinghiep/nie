import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  Video,
  Briefcase,
  User,
  Download,
  FileText,
  Clock,
  Lock,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";

export const dynamic = "force-dynamic";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
};

type Resource = {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  available: boolean;
  product_id: string | null;
};

type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  sale_price: number | null;
};

function resolveIcon(name: string): LucideIcon {
  const map: Record<string, LucideIcon> = { Video, Briefcase, User, FileText };
  if (map[name]) return map[name];
  const dyn = (Icons as unknown as Record<string, LucideIcon>)[name];
  return dyn || FileText;
}

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = await createAdminClient();

  const [{ data: categoriesRaw }, { data: resourcesRaw }, { data: productsRaw }, enrollmentsRes] = await Promise.all([
    admin.from("resource_categories").select("*").order("sort_order", { ascending: true }),
    admin.from("resources").select("*").order("sort_order", { ascending: true }),
    admin.from("products").select("id, slug, title, price, sale_price").eq("type", "course"),
    user
      ? admin.from("enrollments").select("product_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { product_id: string }[] }),
  ]);

  const categories = (categoriesRaw || []) as Category[];
  const resources = (resourcesRaw || []) as Resource[];
  const products = (productsRaw || []) as Product[];
  const enrolledIds = new Set(
    (enrollmentsRes.data || []).map((e: { product_id: string }) => e.product_id).filter(Boolean)
  );
  const productMap = new Map(products.map((p) => [p.id, p]));

  function hasAccess(r: Resource): boolean {
    if (!r.product_id) return Boolean(user); // free for any logged-in user
    return enrolledIds.has(r.product_id);
  }

  return (
    <div>
      <TopBar title="Tài nguyên" subtitle="Templates, tài liệu và công cụ hỗ trợ học tập" />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
        {/* Intro */}
        <div className="card-dark p-5">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(37,99,235,0.1)" }}
            >
              <FileText size={18} className="text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thư viện tài nguyên</h2>
              <p className="text-sm text-gray-400">
                Tài liệu miễn phí dành cho mọi học viên, kèm tài liệu chuyên sâu mở khoá khi anh chị mua khóa học tương ứng.
              </p>
            </div>
          </div>
        </div>

        {categories.map((category) => {
          const Icon = resolveIcon(category.icon);
          const catResources = resources.filter((r) => r.category_id === category.id && r.available);
          if (catResources.length === 0) return null;
          return (
            <section key={category.id}>
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: category.bg }}
                >
                  <Icon size={16} style={{ color: category.color }} />
                </div>
                <h3 className="text-base font-semibold text-white">{category.name}</h3>
                <span className="text-xs text-gray-500">
                  {catResources.length} tài nguyên
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catResources.map((resource) => {
                  const product = resource.product_id ? productMap.get(resource.product_id) : null;
                  const access = hasAccess(resource);
                  return (
                    <div
                      key={resource.id}
                      className="card-dark p-5 flex flex-col justify-between hover:bg-[#1f1f1f] transition-colors"
                    >
                      <div>
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: category.bg }}
                          >
                            <Icon size={16} style={{ color: category.color }} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-white leading-snug">
                              {resource.title}
                            </h4>
                            {product && (
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Đi kèm khóa: <span className="text-[#2563EB]">{product.title}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        {resource.description && (
                          <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            {resource.description}
                          </p>
                        )}
                      </div>

                      {/* Access state */}
                      {!resource.file_url ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 px-3 py-1.5 rounded-lg w-fit bg-[#222]">
                          <Clock size={12} />
                          Sắp ra mắt
                        </span>
                      ) : !user ? (
                        <Link
                          href="/login?next=/resources"
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg w-fit bg-[#222] hover:bg-[#2a2a2a] text-gray-300"
                        >
                          <Lock size={12} />
                          Đăng nhập để tải
                        </Link>
                      ) : access ? (
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-green text-xs inline-flex items-center gap-1.5 w-fit"
                        >
                          <Download size={13} />
                          Tải xuống
                        </a>
                      ) : product ? (
                        <Link
                          href={`/courses/${product.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg w-fit"
                          style={{ background: "rgba(37,99,235,0.12)", color: "#2563EB", border: "1px solid rgba(37,99,235,0.25)" }}
                          title={`Mua khóa "${product.title}" để mở khóa tài liệu này`}
                        >
                          <ShoppingCart size={12} />
                          Mua khóa để tải
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 px-3 py-1.5 rounded-lg w-fit bg-[#222]">
                          <Lock size={12} />
                          Cần quyền truy cập
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
