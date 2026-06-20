import { redirect } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  Activity,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Mail,
} from "lucide-react";
import type { MetricScore, Rating, FinancialHealthInputs } from "@/lib/financial-health/score";

export const dynamic = "force-dynamic";

interface AssessmentRow {
  id: string;
  token: string;
  email: string;
  full_name: string;
  total_score: number;
  rating: Rating;
  inputs: FinancialHealthInputs;
  scores: { metrics: MetricScore[]; summary: string };
  created_at: string;
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function ratingMeta(r: Rating) {
  if (r === "good")
    return { label: "Tốt", color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)" };
  if (r === "fair")
    return { label: "Trung bình", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)" };
  return { label: "Cần chú ý", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)" };
}

export default async function FinancialHealthHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard/suc-khoe-tai-chinh");

  const admin = await createAdminClient();
  const userEmail = user.email?.toLowerCase().trim() ?? "";

  // Pull assessments linked either by user_id OR by email (covers cases
  // where the user took the test before logging in).
  const { data: assessments } = await admin
    .from("financial_assessments")
    .select("id, token, email, full_name, total_score, rating, inputs, scores, created_at")
    .or(`user_id.eq.${user.id}${userEmail ? `,email.eq.${userEmail}` : ""}`)
    .eq("assessment_type", "financial_health")
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (assessments ?? []) as AssessmentRow[];
  const latest = rows[0];
  const previous = rows[1];

  // Trend vs previous attempt
  let trend: "up" | "down" | "flat" | null = null;
  let trendDelta = 0;
  if (latest && previous) {
    trendDelta = latest.total_score - previous.total_score;
    trend = trendDelta > 0 ? "up" : trendDelta < 0 ? "down" : "flat";
  }

  return (
    <div>
      <TopBar
        title="Sức khoẻ tài chính"
        subtitle="Lịch sử các bài kiểm tra & xu hướng cải thiện"
      />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
        {/* Hero card */}
        <div
          className="card-dark p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(37,99,235,0.02))",
            border: "1px solid rgba(37,99,235,0.25)",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(37,99,235,0.15)" }}
          >
            <Activity size={22} className="text-[#2563EB]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base sm:text-lg mb-1">
              Bài kiểm tra Sức Khoẻ Tài Chính
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Đo lường 6 chỉ số quan trọng — làm lại định kỳ 3 tháng để theo dõi tiến độ.
            </p>
          </div>
          <Link
            href="/tools/suc-khoe-tai-chinh"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black whitespace-nowrap"
            style={{ background: `linear-gradient(135deg, #2563EB, #3B82F6)` }}
          >
            <Plus size={14} />
            {rows.length === 0 ? "Làm bài kiểm tra" : "Làm lại"}
          </Link>
        </div>

        {/* Empty state */}
        {rows.length === 0 && (
          <div className="card-dark p-12 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: "rgba(37,99,235,0.1)" }}
            >
              <Activity size={26} className="text-[#2563EB]" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Anh/chị chưa làm bài kiểm tra nào
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-5">
              Bài kiểm tra chỉ mất 2 phút — nhận ngay phân tích 6 chỉ số
              tài chính + lời khuyên cá nhân hoá qua email.
            </p>
            <Link
              href="/tools/suc-khoe-tai-chinh"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-black"
              style={{ background: `linear-gradient(135deg, #2563EB, #3B82F6)` }}
            >
              Bắt đầu kiểm tra ngay
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Latest result hero */}
        {latest && (
          <div className="grid sm:grid-cols-[1fr_280px] gap-4">
            <div
              className="card-dark p-5 sm:p-6"
              style={{
                background: `linear-gradient(135deg, ${ratingMeta(latest.rating).color}0d, transparent)`,
                border: `1px solid ${ratingMeta(latest.rating).border}`,
              }}
            >
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                Kết quả mới nhất
              </div>
              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="text-5xl sm:text-6xl font-extrabold leading-none"
                  style={{ color: ratingMeta(latest.rating).color }}
                >
                  {latest.total_score}
                </span>
                <span className="text-xl text-gray-500 font-bold">/ 100</span>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: ratingMeta(latest.rating).color, color: "#1a1a1a" }}
                >
                  {ratingMeta(latest.rating).label}
                </span>
              </div>
              <p className="text-sm text-gray-300 italic mb-4">
                {latest.scores?.summary ?? ""}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {formatDate(latest.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={12} />
                  {latest.email}
                </span>
              </div>
              <Link
                href={`/results/${latest.token}`}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium text-[#2563EB] hover:text-white transition-colors"
                style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.3)" }}
              >
                Xem kết quả chi tiết
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Trend card */}
            {trend && previous && (
              <div className="card-dark p-5 flex flex-col justify-center">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                  So với lần trước
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {trend === "up" ? (
                    <TrendingUp size={28} className="text-green-400" />
                  ) : trend === "down" ? (
                    <TrendingDown size={28} className="text-red-400" />
                  ) : (
                    <Activity size={28} className="text-gray-400" />
                  )}
                  <div className="leading-none">
                    <div
                      className="text-2xl font-extrabold"
                      style={{
                        color:
                          trend === "up" ? "#22c55e" : trend === "down" ? "#ef4444" : "#9ca3af",
                      }}
                    >
                      {trendDelta > 0 ? "+" : ""}
                      {trendDelta}
                    </div>
                    <div className="text-xs text-gray-500">điểm thay đổi</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 leading-relaxed">
                  Lần trước: <strong className="text-white">{previous.total_score}/100</strong>
                  <br />
                  <span className="text-gray-500 text-[11px]">
                    ngày {formatDate(previous.created_at)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History list */}
        {rows.length > 1 && (
          <div className="card-dark overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2a2a2a]">
              <h3 className="font-semibold text-white text-sm">
                Lịch sử kiểm tra ({rows.length})
              </h3>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {rows.map((r) => {
                const m = ratingMeta(r.rating);
                return (
                  <Link
                    key={r.id}
                    href={`/results/${r.token}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0"
                      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
                    >
                      {r.total_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white mb-0.5">
                        Bài kiểm tra ngày {formatDate(r.created_at)}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                          style={{ background: m.color, color: "#1a1a1a" }}
                        >
                          {m.label}
                        </span>
                        <span className="text-[11px] text-gray-500 truncate">
                          {r.scores?.summary?.slice(0, 60) ?? ""}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-600 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
