import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import { Plus, Pencil, Star, Users, TrendingUp, Clock } from "lucide-react";
import type { Mentor } from "@/types/mentor";

export const dynamic = "force-dynamic";

export default async function AdminMentorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) redirect("/dashboard");

  const { data: mentorsData } = await admin
    .from("mentors")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("sort_order", { ascending: true });

  const mentors = (mentorsData ?? []) as Mentor[];

  // KPI summary
  const totalSessions = mentors.reduce((sum, m) => sum + m.completed_sessions, 0);
  const totalHours = mentors.length > 0 ? Math.round(totalSessions * 1.0) : 0; // estimate, refined by view
  const activeMentors = mentors.filter((m) => m.is_active).length;
  const avgRating =
    mentors.length > 0
      ? (mentors.reduce((sum, m) => sum + m.avg_rating, 0) / mentors.filter((m) => m.total_ratings > 0).length).toFixed(1)
      : "—";

  return (
    <div>
      <TopBar title="Quản lý Mentor" subtitle="Mạng lưới chuyên gia 1-1 của VINEN" />

      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI icon={<Users size={16} />} label="Tổng mentor" value={mentors.length.toString()} sub={`${activeMentors} đang hoạt động`} />
          <KPI icon={<Clock size={16} />} label="Sessions hoàn thành" value={totalSessions.toString()} sub={`~${totalHours} giờ`} />
          <KPI icon={<Star size={16} />} label="Đánh giá TB" value={avgRating.toString()} sub="trên 5" />
          <KPI icon={<TrendingUp size={16} />} label="Featured" value={mentors.filter((m) => m.is_featured).length.toString()} sub="nổi bật" />
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {mentors.length} mentor · {mentors.filter((m) => m.accepts_bookings).length} đang nhận lịch
          </div>
          <Link
            href="/admin/mentors/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#2563EB" }}
          >
            <Plus size={15} /> Thêm mentor
          </Link>
        </div>

        {/* Mentor table */}
        {mentors.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-semibold text-white mb-1">Chưa có mentor nào</p>
            <p className="text-sm text-gray-500 mb-5">Thêm mentor đầu tiên để học viên có thể đặt lịch 1-1.</p>
            <Link
              href="/admin/mentors/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "#2563EB" }}
            >
              <Plus size={15} /> Thêm mentor đầu tiên
            </Link>
          </div>
        ) : (
          <div className="card-dark overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0a0a0a] border-b border-[#1f1f1f]">
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                    <th className="px-4 py-3 font-medium">Mentor</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Chuyên môn</th>
                    <th className="px-4 py-3 font-medium text-center">Session</th>
                    <th className="px-4 py-3 font-medium text-center hidden sm:table-cell">Rating</th>
                    <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f1f]">
                  {mentors.map((m) => (
                    <tr key={m.id} className="hover:bg-[#0f0f0f]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                            {m.avatar ? (
                              <Image src={m.avatar} alt={m.full_name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-blue-400">
                                {m.full_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              {m.full_name}
                              {m.is_featured && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded text-yellow-900 font-bold" style={{ background: "#D4A843" }}>
                                  ★
                                </span>
                              )}
                            </div>
                            {m.title && <div className="text-xs text-gray-500 line-clamp-1">{m.title}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {m.expertise_tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              {t}
                            </span>
                          ))}
                          {m.expertise_tags.length > 2 && (
                            <span className="text-[10px] text-gray-500">+{m.expertise_tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="text-white font-semibold">{m.completed_sessions}</div>
                        <div className="text-[10px] text-gray-500">/ {m.total_sessions} total</div>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {m.total_ratings > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star size={11} fill="#D4A843" stroke="#D4A843" />
                            <span className="text-white font-semibold">{m.avg_rating.toFixed(1)}</span>
                            <span className="text-[10px] text-gray-500">({m.total_ratings})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {m.is_active ? (
                          m.accepts_bookings ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Nhận lịch
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                              Tạm dừng
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-500/15 text-gray-400 border border-gray-500/30">
                            Ẩn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/mentors/${m.id}`}
                          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                        >
                          <Pencil size={12} /> Sửa
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer note */}
        <div className="text-center text-xs text-gray-500">
          <Link href="/admin/mentors/sessions" className="text-blue-400 hover:underline">
            → Xem tất cả phiên mentoring đã đặt
          </Link>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="card-dark p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-extrabold text-white leading-none">{value}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}
