import { redirect } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { createClient } from "@/lib/supabase/server";
import { hasBlueprintAccess } from "@/lib/blueprint/access";
import {
  Crown,
  Plus,
  Clock,
  ArrowRight,
  Mail,
  Brain,
  User,
  ListChecks,
  TrendingUp,
  CheckCircle2,
  Circle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type {
  BlueprintData,
  BlueprintProgress,
} from "@/lib/blueprint/types";
import { buildBlueprintProReports } from "@/lib/blueprint/pro-reports";

export const dynamic = "force-dynamic";

const BRAND = "#2563EB";
const PURPLE = "#a855f7";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";

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

function tierMeta(score: number) {
  if (score >= 80)
    return { label: "Xuất sắc", color: GREEN, bg: `${GREEN}1a` };
  if (score >= 60)
    return { label: "Tốt", color: GREEN, bg: `${GREEN}14` };
  if (score >= 40)
    return { label: "Trung bình", color: AMBER, bg: `${AMBER}1a` };
  if (score >= 20)
    return { label: "Cần chú ý", color: AMBER, bg: `${AMBER}14` };
  return { label: "Cần can thiệp", color: RED, bg: `${RED}1a` };
}

export default async function BlueprintDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    redirect("/login?redirect=/dashboard/entrepreneur-financial-blueprint");

  const hasAccess = await hasBlueprintAccess(user.id);

  // Fetch blueprint row
  const { data: row } = await supabase
    .from("financial_blueprints")
    .select("data, progress, updated_at, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const data: BlueprintData = (row?.data as BlueprintData) ?? {};
  const progress: BlueprintProgress = (row?.progress as BlueprintProgress) ?? {};
  const hasData =
    !!data.profile ||
    !!data.mindset ||
    !!data.habits ||
    !!data.status;

  const pro = hasData ? buildBlueprintProReports(data) : null;

  const sections = [
    {
      key: "profile" as const,
      label: "Phần I — Thông tin cơ bản",
      icon: User,
      color: "#3b82f6",
    },
    {
      key: "mindset" as const,
      label: "Phần II — Tâm thức về tiền",
      icon: Brain,
      color: PURPLE,
    },
    {
      key: "status" as const,
      label: "Phần III — Hiện trạng tài chính",
      icon: TrendingUp,
      color: GREEN,
    },
  ];
  const completedCount = sections.filter((s) => progress[s.key]).length;
  const totalSections = sections.length;

  return (
    <div>
      <TopBar
        title="Entrepreneur Financial Blueprint™"
        subtitle="Báo cáo tổng hợp 3 phần · cập nhật liên tục"
      />

      <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
        {/* Access gate banner */}
        {!hasAccess && (
          <div
            className="card-dark p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start"
            style={{
              background: `linear-gradient(135deg, ${BRAND}10, transparent)`,
              border: `1px solid ${BRAND}55`,
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${BRAND}1a` }}
            >
              <Crown size={22} style={{ color: BRAND }} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-base mb-1">
                Blueprint dành cho học viên tiers
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-3">
                Báo cáo tổng hợp toàn diện chỉ mở cho học viên đã mua 1 trong
                3 gói. Anh/chị nhận: 5 báo cáo Pro (Wealth MRI · Risk Map ·
                Freedom Roadmap · Prescription · Hưu Trí An Nhàn) + 8 báo cáo
                phân tích chuyên sâu.
              </p>
              <Link
                href="/giai-phap-toan-dien#pricing"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold text-black"
                style={{
                  background: `linear-gradient(135deg, #3B82F6, ${BRAND})`,
                }}
              >
                <ShieldCheck size={14} />
                Xem 3 gói giải pháp
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Hero card */}
        <div
          className="card-dark p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{
            background: `linear-gradient(135deg, ${BRAND}08, transparent)`,
            border: `1px solid ${BRAND}55`,
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${BRAND}1a` }}
          >
            <Crown size={22} style={{ color: BRAND }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base sm:text-lg mb-1">
              Báo cáo Entrepreneur Financial Blueprint™
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              3 phần data + 5 báo cáo Pro · Tự lưu cloud · In/Xuất PDF.
              {row?.updated_at && (
                <>
                  {" "}Cập nhật lần cuối{" "}
                  <strong className="text-white">
                    {formatDate(row.updated_at)}
                  </strong>
                  .
                </>
              )}
            </p>
          </div>
          {hasAccess && (
            <div className="flex flex-wrap gap-2 shrink-0">
              <Link
                href="/tools/entrepreneur-financial-blueprint"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black whitespace-nowrap"
                style={{
                  background: `linear-gradient(135deg, ${BRAND}, #3B82F6)`,
                }}
              >
                <Plus size={14} />
                {hasData ? "Cập nhật" : "Bắt đầu"}
              </Link>
              {hasData && (
                <Link
                  href="/tools/entrepreneur-financial-blueprint/report"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    color: BRAND,
                    border: `1px solid ${BRAND}55`,
                  }}
                >
                  <FileText size={14} />
                  Xem báo cáo
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {hasAccess && !hasData && (
          <div className="card-dark p-12 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: `${BRAND}1a` }}
            >
              <Crown size={26} style={{ color: BRAND }} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              Anh/chị chưa bắt đầu Blueprint
            </h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto mb-5">
              Báo cáo tổng hợp 3 phần — nhập 1 lần, dùng cho mọi bài tập theo
              video khoá học. Data tự lưu cloud + xuất PDF.
            </p>
            <Link
              href="/tools/entrepreneur-financial-blueprint"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-black"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #3B82F6)` }}
            >
              Bắt đầu ngay
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Score summary cards */}
        {hasAccess && hasData && pro && (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              <ScoreCard
                label="Wealth Score™"
                value={pro.wealthMRI.wealthScore}
                tier={pro.wealthMRI.tier}
                color={PURPLE}
                icon={Brain}
              />
              <ScoreCard
                label="Risk Score™"
                value={pro.riskMap.riskScore}
                tier={pro.riskMap.level}
                color={pro.riskMap.riskScore >= 60 ? GREEN : pro.riskMap.riskScore >= 40 ? AMBER : RED}
                icon={ListChecks}
              />
              <ScoreCard
                label="Freedom Score™"
                value={pro.freedomRoadmap.freedomScore}
                tier={pro.freedomRoadmap.level}
                color={GREEN}
                icon={Crown}
              />
            </div>

            {/* Progress 4 sections */}
            <div className="card-dark p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm">
                  Tiến độ {totalSections} phần
                </h3>
                <span className="text-xs text-gray-400">
                  <strong className="text-white">
                    {completedCount}/{totalSections}
                  </strong>{" "}
                  phần hoàn thành
                </span>
              </div>
              <div className="space-y-2">
                {sections.map((s) => {
                  const Icon = s.icon;
                  const done = progress[s.key] === true;
                  return (
                    <Link
                      key={s.key}
                      href="/tools/entrepreneur-financial-blueprint"
                      className="grid grid-cols-[40px_1fr_auto] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors"
                      style={{
                        background: done
                          ? `${s.color}08`
                          : "rgba(255,255,255,0.02)",
                        border: `1px solid ${done ? `${s.color}44` : "#1f1f1f"}`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center"
                        style={{ background: `${s.color}1a`, color: s.color }}
                      >
                        <Icon size={15} />
                      </div>
                      <div className="text-[13px] font-bold text-white truncate">
                        {s.label}
                      </div>
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 size={16} style={{ color: GREEN }} />
                        ) : (
                          <Circle size={16} className="text-gray-600" />
                        )}
                        <ArrowRight size={14} className="text-gray-500" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick facts */}
            <div className="card-dark p-5">
              <h3 className="text-white font-bold text-sm mb-3">
                Tóm tắt nhanh
              </h3>
              <div className="grid sm:grid-cols-2 gap-2 text-[12.5px] text-gray-300">
                <Fact
                  label="Wealth Tier"
                  value={pro.wealthMRI.tier}
                  color={PURPLE}
                />
                <Fact
                  label="Money Personality"
                  value={`${pro.wealthMRI.personality} · ${pro.wealthMRI.personalityLabel}`}
                  color={BRAND}
                />
                <Fact
                  label="Nhóm tâm thức chủ đạo"
                  value={pro.wealthMRI.mindsetTopName}
                  color={BRAND}
                />
                <Fact
                  label="Freedom Level"
                  value={pro.freedomRoadmap.level}
                  color={GREEN}
                />
                {row?.created_at && (
                  <Fact
                    label="Lần đầu tạo"
                    value={formatDate(row.created_at)}
                    color="#888"
                    icon={Clock}
                  />
                )}
                {user.email && (
                  <Fact
                    label="Tài khoản"
                    value={user.email}
                    color="#888"
                    icon={Mail}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Helper components ─── */

function ScoreCard({
  label,
  value,
  tier,
  color,
  icon: Icon,
}: {
  label: string;
  value: number;
  tier: string;
  color: string;
  icon: typeof Crown;
}) {
  return (
    <div
      className="card-dark p-5"
      style={{
        background: `linear-gradient(135deg, ${color}10, transparent)`,
        border: `1px solid ${color}44`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: `${color}1a`, color }}
        >
          <Icon size={14} />
        </div>
        <span
          className="text-[10px] uppercase tracking-wider font-bold"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="text-4xl font-extrabold leading-none"
          style={{ color }}
        >
          {value}
        </span>
        <span className="text-sm text-gray-500">/ 100</span>
      </div>
      <div
        className="text-[11.5px] font-bold mt-1.5"
        style={{ color: tierMeta(value).color }}
      >
        {tier}
      </div>
    </div>
  );
}

function Fact({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: string;
  icon?: typeof Crown;
}) {
  return (
    <div
      className="px-3 py-2 rounded-md"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid #1f1f1f",
      }}
    >
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5 flex items-center gap-1.5">
        {Icon && <Icon size={10} />}
        {label}
      </div>
      <div
        className="text-[12.5px] font-bold truncate"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}
