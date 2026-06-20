"use client";

import { useMemo } from "react";
import {
  HeartHandshake,
  Heart,
  Shield,
  AlertCircle,
  GraduationCap,
  Wallet,
  Briefcase,
  Info,
} from "lucide-react";
import type {
  InsuranceCoverage,
  InsuranceData,
  CashflowData,
  ProfileData,
} from "@/lib/blueprint/types";

const GREEN = "#22c55e";
const RED = "#ef4444";
const BRAND = "#2563EB";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

// Chuẩn theo công thức DIME (đã chỉnh: 10 năm thu nhập thay thế)
const INCOME_REPLACE_YEARS = 10;
const HEALTH_TARGET = 1_000_000_000; // 1 tỷ chuẩn
const ACCIDENT_MULTIPLIER = 5; // 5× thu nhập năm
const CRITICAL_TARGET = 500_000_000; // 500tr chuẩn

interface Props {
  data: InsuranceData;
  onChange: (next: InsuranceData) => void;
  /** Dùng để tính đề xuất DIME */
  cashflow?: CashflowData;
  profile?: ProfileData;
}

interface FieldDef {
  key: keyof InsuranceCoverage;
  label: string;
  icon: typeof Wallet;
  color: string;
  desc?: string;
}

const FIELDS: FieldDef[] = [
  {
    key: "life",
    label: "BH Nhân Thọ",
    icon: HeartHandshake,
    color: GREEN,
    desc: "DIME · 10 năm thu nhập + nợ + học con",
  },
  {
    key: "health",
    label: "BH Sức Khỏe",
    icon: Heart,
    color: RED,
    desc: "Chuẩn ≥ 1 tỷ quyền lợi",
  },
  {
    key: "accident",
    label: "BH Tai Nạn",
    icon: AlertCircle,
    color: AMBER,
    desc: "Chuẩn ≥ 5× thu nhập năm",
  },
  {
    key: "criticalIllness",
    label: "BH Bệnh Hiểm Nghèo",
    icon: Shield,
    color: PURPLE,
    desc: "Chuẩn ≥ 500tr",
  },
  {
    key: "education",
    label: "BH Giáo Dục Con",
    icon: GraduationCap,
    color: BLUE,
    desc: "Tùy nhu cầu học phí dự phòng",
  },
];

export default function InsuranceSubSection({
  data,
  onChange,
  cashflow,
  profile,
}: Props) {
  const coverage: InsuranceCoverage = data.coverage ?? {};

  const setCoverage = (k: keyof InsuranceCoverage, v: number | undefined) => {
    onChange({
      ...data,
      coverage: { ...coverage, [k]: v },
    });
  };
  const setPremium = (v: number | undefined) => {
    onChange({ ...data, monthlyPremium: v });
  };

  // ─── Đề xuất DIME từ data cashflow + profile ───
  const dime = useMemo(() => {
    const inc = cashflow?.income ?? {};
    const monthlyIncome =
      (inc.personal ?? 0) + (inc.spouse ?? 0) + (inc.other ?? 0);
    const annualIncome = monthlyIncome * 12;

    const fixed = cashflow?.fixedCosts ?? {};
    const variable = cashflow?.variableCosts ?? {};
    const monthlyExpense =
      Object.values(fixed).reduce<number>((s, v) => s + (v ?? 0), 0) +
      Object.values(variable).reduce<number>((s, v) => s + (v ?? 0), 0);
    const annualExpense = monthlyExpense * 12;

    // Debt + mortgage từ Net Worth (chưa có nên = 0 — sẽ wire sau)
    const debt = 0;
    const mortgage = 0;

    // Education: 50tr/năm × số con × 4 năm đại học (giả định)
    const children = profile?.children ?? 0;
    const educationNeed = children * 50_000_000 * 4;

    // Income replacement: 10 năm chi tiêu (dùng expense làm proxy)
    const incomeNeed = annualExpense * INCOME_REPLACE_YEARS;

    const lifeNeed = incomeNeed + educationNeed + debt + mortgage;
    const accidentNeed = annualIncome * ACCIDENT_MULTIPLIER;

    return {
      monthlyIncome,
      annualIncome,
      annualExpense,
      lifeNeed,
      healthNeed: HEALTH_TARGET,
      accidentNeed,
      criticalNeed: CRITICAL_TARGET,
      educationNeed,
    };
  }, [cashflow, profile]);

  // Stats
  const totalCoverage = Object.values(coverage).reduce<number>(
    (s, v) => s + (v ?? 0),
    0
  );
  const totalNeeded =
    dime.lifeNeed +
    dime.healthNeed +
    dime.accidentNeed +
    dime.criticalNeed +
    dime.educationNeed;
  const overallAchievement =
    totalNeeded > 0
      ? Math.min(999, Math.round((totalCoverage / totalNeeded) * 100))
      : 0;
  const premiumPct =
    dime.annualIncome > 0 && data.monthlyPremium
      ? Math.round(((data.monthlyPremium * 12) / dime.annualIncome) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Big summary */}
      <div
        className="rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5"
        style={{
          background:
            overallAchievement >= 80
              ? `linear-gradient(135deg, ${GREEN}14, transparent)`
              : `linear-gradient(135deg, ${AMBER}14, transparent)`,
          border: `1px solid ${overallAchievement >= 80 ? GREEN : AMBER}55`,
        }}
      >
        <Stat
          label="Tổng mệnh giá BH"
          value={totalCoverage}
          color={BRAND}
          icon={HeartHandshake}
        />
        <Stat
          label="Đề xuất DIME"
          value={totalNeeded}
          color={BLUE}
          icon={Briefcase}
          sub="dựa trên thu nhập + chi tiêu"
        />
        <Stat
          label="Mức độ bảo vệ"
          value={overallAchievement}
          color={
            overallAchievement >= 80
              ? GREEN
              : overallAchievement >= 50
                ? AMBER
                : RED
          }
          icon={Shield}
          suffix="%"
        />
        <Stat
          label="Phí BH /tháng"
          value={data.monthlyPremium ?? 0}
          color={
            premiumPct >= 5 && premiumPct <= 15
              ? GREEN
              : premiumPct > 15
                ? RED
                : AMBER
          }
          icon={Wallet}
          sub={
            dime.annualIncome > 0
              ? `≈ ${premiumPct}% thu nhập (lý tưởng 5-15%)`
              : "nhập thu nhập để so sánh"
          }
        />
      </div>

      {/* 5 fields */}
      <Group label="Mệnh giá BH hiện có" color={BRAND}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FIELDS.map((f) => {
            const value = coverage[f.key] ?? 0;
            const display = value > 0 ? value.toLocaleString("vi-VN") : "";
            const need =
              f.key === "life"
                ? dime.lifeNeed
                : f.key === "health"
                  ? dime.healthNeed
                  : f.key === "accident"
                    ? dime.accidentNeed
                    : f.key === "criticalIllness"
                      ? dime.criticalNeed
                      : dime.educationNeed;
            const pct = need > 0 ? Math.min(100, Math.round((value / need) * 100)) : 0;
            const gap = Math.max(0, need - value);
            const Icon = f.icon;
            return (
              <div
                key={f.key}
                className="rounded-lg p-3"
                style={{
                  background: value > 0 ? `${f.color}08` : "#0a0a0a",
                  border: `1px solid ${value > 0 ? `${f.color}55` : "#1f1f1f"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={13} style={{ color: f.color }} />
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: f.color }}
                  >
                    {f.label}
                  </span>
                </div>
                {f.desc && (
                  <p className="text-[10px] text-gray-500 leading-snug mb-2">
                    {f.desc}
                  </p>
                )}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={display}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "");
                      setCoverage(
                        f.key,
                        cleaned ? parseInt(cleaned, 10) : undefined
                      );
                    }}
                    placeholder="0"
                    className="w-full px-2.5 py-2 pr-7 rounded-md text-[13px] font-bold text-white text-right outline-none"
                    style={{
                      background: "#0f0f0f",
                      border: `1px solid ${value > 0 ? `${f.color}77` : "#2a2a2a"}`,
                    }}
                  />
                  <span
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none"
                    style={{ color: value > 0 ? f.color : "#525252" }}
                  >
                    ₫
                  </span>
                </div>
                {need > 0 && (
                  <>
                    <div
                      className="h-1 rounded-full overflow-hidden mt-2"
                      style={{ background: "#1a1a1a" }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${f.color}, ${f.color}cc)`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9.5px] mt-1">
                      <span className="text-gray-500">
                        Đề xuất {fmtCompact(need)}
                      </span>
                      <span
                        style={{
                          color:
                            gap === 0 ? GREEN : value > 0 ? AMBER : "#666",
                        }}
                      >
                        {gap === 0
                          ? "✓ Đủ"
                          : `thiếu ${fmtCompact(gap)}`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Group>

      {/* Premium */}
      <Group label="Phí BH đang đóng /tháng" color={BLUE}>
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[10.5px] text-gray-400 mb-1">
              Tổng phí BH các loại /tháng
            </label>
            <div className="relative max-w-[280px]">
              <input
                type="text"
                inputMode="numeric"
                value={
                  data.monthlyPremium && data.monthlyPremium > 0
                    ? data.monthlyPremium.toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setPremium(cleaned ? parseInt(cleaned, 10) : undefined);
                }}
                placeholder="0"
                className="w-full px-2.5 py-2 pr-7 rounded-md text-[13px] font-bold text-white text-right outline-none"
                style={{
                  background: "#0f0f0f",
                  border: `1px solid ${data.monthlyPremium ? `${BLUE}77` : "#2a2a2a"}`,
                }}
              />
              <span
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium pointer-events-none"
                style={{ color: data.monthlyPremium ? BLUE : "#525252" }}
              >
                ₫
              </span>
            </div>
          </div>
          <div className="text-[10.5px] text-gray-500 leading-snug max-w-md">
            💡 Tổng phí BH lý tưởng từ <strong className="text-white">5-15%</strong>{" "}
            thu nhập (chuẩn quốc tế 10%). Bao gồm toàn bộ các loại BH ở trên.
          </div>
        </div>
      </Group>

      {/* Notes about DIME data */}
      {dime.annualIncome === 0 && (
        <div
          className="rounded-md px-3 py-2.5 text-[11px] leading-snug"
          style={{
            background: `${BLUE}10`,
            color: BLUE,
            border: `1px solid ${BLUE}44`,
          }}
        >
          <Info size={12} className="inline-block mr-1 -mt-0.5" />
          Đề xuất DIME đang dùng giả định 0₫ vì chưa có thu nhập + chi tiêu.
          Hoàn thành <strong>tab Cân Đối Thu Chi</strong> trước để xem mức
          đề xuất chính xác.
        </div>
      )}
    </div>
  );
}

function Group({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: `linear-gradient(135deg, ${color}08, transparent)`,
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-widest"
        style={{ color }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  icon: Icon,
  suffix,
  sub,
}: {
  label: string;
  value: number;
  color: string;
  icon: typeof Wallet;
  suffix?: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5">
        <Icon size={11} style={{ color }} />
        {label}
      </div>
      <div className="text-lg sm:text-xl font-extrabold" style={{ color }}>
        {suffix === "%" ? `${value}${suffix}` : fmtCompact(value)}
      </div>
      {sub && (
        <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{sub}</div>
      )}
    </div>
  );
}

function fmtCompact(n: number): string {
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9)
    return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}
