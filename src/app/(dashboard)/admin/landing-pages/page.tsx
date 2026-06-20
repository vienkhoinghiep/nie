import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import { Plus, Eye, Edit2, ExternalLink, BarChart3, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  slug: string;
  title: string;
  hero_headline: string;
  status: "draft" | "published" | "archived";
  views: number;
  conversions: number;
  updated_at: string;
}

function statusBadge(status: Row["status"]) {
  if (status === "published") {
    return <span className="badge-green">Đã xuất bản</span>;
  }
  if (status === "archived") {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
      >
        Đã lưu trữ
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: "#1f1f1f", color: "#9ca3af", border: "1px solid #333" }}
    >
      Nháp
    </span>
  );
}

function rate(conversions: number, views: number): string {
  if (!views) return "0%";
  return `${Math.round((conversions / views) * 100)}%`;
}

export default async function AdminLandingPagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "manager", "marketing"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("landing_pages")
    .select("id, slug, title, hero_headline, status, views, conversions, updated_at")
    .order("updated_at", { ascending: false });

  const rows: Row[] = (data ?? []) as Row[];
  const tableMissing =
    !!error && /landing_pages/i.test(error.message ?? "");

  const totalViews = rows.reduce((s, r) => s + (r.views ?? 0), 0);
  const totalConversions = rows.reduce((s, r) => s + (r.conversions ?? 0), 0);

  return (
    <div>
      <TopBar title="Landing Page" subtitle="Quản lý trang thu hút lead / quà tặng" />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {tableMissing && (
          <div
            className="rounded-xl p-5 text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}
          >
            <div className="font-semibold text-red-300 mb-1">Cần áp dụng migration!</div>
            Bảng <code>landing_pages</code> chưa tồn tại trong database. Hãy mở
            <strong> Supabase Dashboard → SQL Editor</strong>, paste nội dung file
            <code> supabase/migrations/20260525_landing_pages.sql</code> rồi bấm Run.
            Sau đó refresh trang này.
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-bold text-white text-base">Danh sách Landing Page</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {rows.length} trang • {totalConversions.toLocaleString("vi-VN")} leads •{" "}
              {rate(totalConversions, totalViews)} tỉ lệ chuyển đổi
            </p>
          </div>
          <Link
            href="/admin/landing-pages/new"
            className="btn-green flex items-center gap-2 text-sm"
          >
            <Plus size={14} />
            Tạo Landing Page
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(37,99,235,0.1)" }}
            >
              <Sparkles size={20} className="text-[#2563EB]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{rows.length}</div>
              <div className="text-xs text-gray-500">Tổng trang</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.1)" }}
            >
              <Eye size={20} className="text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {totalViews.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-gray-500">Tổng lượt xem</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <BarChart3 size={20} className="text-[#22c55e]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {totalConversions.toLocaleString("vi-VN")}
              </div>
              <div className="text-xs text-gray-500">Tổng leads thu được</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                  {[
                    "Tiêu đề",
                    "Trạng thái",
                    "Lượt xem",
                    "Leads",
                    "Tỉ lệ CR",
                    "",
                  ].map((c) => (
                    <th
                      key={c}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center gap-3">
                        <Sparkles size={32} className="text-gray-700" />
                        <p>Chưa có landing page nào.</p>
                        <Link href="/admin/landing-pages/new" className="btn-green mt-3 text-xs">
                          <Plus size={12} />
                          Tạo trang đầu tiên
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: i < rows.length - 1 ? "1px solid #2a2a2a" : "none" }}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/admin/landing-pages/${r.id}/edit`} className="block min-w-0 group/title">
                          <div className="font-medium text-white truncate group-hover/title:text-[#2563EB] transition-colors">
                            {r.title}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate mt-0.5">
                            /lp/{r.slug}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-white font-semibold">{(r.views ?? 0).toLocaleString("vi-VN")}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[#2563EB] font-semibold">
                          {(r.conversions ?? 0).toLocaleString("vi-VN")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-white text-xs">{rate(r.conversions, r.views)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/landing-pages/${r.id}/edit`}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                            style={{
                              background: "rgba(59,130,246,0.1)",
                              color: "#3b82f6",
                              border: "1px solid rgba(59,130,246,0.25)",
                            }}
                          >
                            <Edit2 size={11} />
                            Sửa
                          </Link>
                          <Link
                            href={`/lp/${r.slug}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                            style={{
                              background: "rgba(37,99,235,0.1)",
                              color: "#2563EB",
                              border: "1px solid rgba(37,99,235,0.25)",
                            }}
                          >
                            <ExternalLink size={11} />
                            Xem
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
