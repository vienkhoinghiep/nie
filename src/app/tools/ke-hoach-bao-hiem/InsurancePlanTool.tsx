"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Wallet,
  Home,
  GraduationCap,
  Heart,
  HeartHandshake,
  HandCoins,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Calendar,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_insurance_v1";

/* ─────────────────────────────────────────────
 *  Defaults & constants
 * ───────────────────────────────────────────── */

interface FormState {
  // Personal
  age: number;
  retirementAge: number;
  dependents: number;
  children: number;
  // Income & expense
  monthlyIncome: number;
  familyExpense: number;
  // Debt to protect
  mortgage: number;
  otherDebt: number;
  // Education per child
  eduPerChild: number;
  // Current insurance coverage
  lifeCoverage: number;
  healthCoverage: number;
  accidentCoverage: number;
  // Current premium paid monthly
  monthlyPremium: number;
}

const DEFAULT_STATE: FormState = {
  age: 35,
  retirementAge: 60,
  dependents: 1,
  children: 1,
  monthlyIncome: 30_000_000,
  familyExpense: 18_000_000,
  mortgage: 1_000_000_000,
  otherDebt: 100_000_000,
  eduPerChild: 500_000_000,
  lifeCoverage: 500_000_000,
  healthCoverage: 200_000_000,
  accidentCoverage: 300_000_000,
  monthlyPremium: 1_500_000,
};

/* Targets (Vietnamese context) */
const PREMIUM_TARGET_PCT = 10; // 5-15% thu nhập, ideal 10%
const HEALTH_TARGET = 1_000_000_000; // 1 tỷ
const ACCIDENT_MULTIPLIER = 5; // 5x annual income

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function InsurancePlanTool() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const j = JSON.parse(cached);
        if (j && typeof j === "object") setForm({ ...DEFAULT_STATE, ...j });
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form, touched]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setTouched(true);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Khôi phục cài đặt mặc định?")
    )
      return;
    setForm(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  /* ─── Compute via DIME formula ─── */
  const result = useMemo(() => {
    const annualIncome = form.monthlyIncome * 12;
    const annualExpense = form.familyExpense * 12;
    // 10 năm thu nhập là chuẩn đủ cho gia đình thích nghi (cap 10, sàn 5).
    // Nếu còn ít hơn 10 năm tới hưu thì dùng số năm còn lại.
    const yearsToProtect = Math.max(
      5,
      Math.min(10, form.retirementAge - form.age)
    );
    // Income replacement: dùng chi gia đình làm proxy cho mức gia đình cần,
    // không dùng full income của trụ cột.
    const incomeNeed = annualExpense * yearsToProtect;
    const eduNeed = form.eduPerChild * form.children;
    const debtNeed = form.mortgage + form.otherDebt;

    const lifeNeed = incomeNeed + eduNeed + debtNeed;
    const lifeGap = Math.max(0, lifeNeed - form.lifeCoverage);
    const lifeAchievement =
      lifeNeed > 0
        ? Math.min(999, Math.round((form.lifeCoverage / lifeNeed) * 100))
        : 0;

    const healthGap = Math.max(0, HEALTH_TARGET - form.healthCoverage);
    const healthAchievement =
      HEALTH_TARGET > 0
        ? Math.min(999, Math.round((form.healthCoverage / HEALTH_TARGET) * 100))
        : 0;

    const accidentNeed = annualIncome * ACCIDENT_MULTIPLIER;
    const accidentGap = Math.max(0, accidentNeed - form.accidentCoverage);
    const accidentAchievement =
      accidentNeed > 0
        ? Math.min(
            999,
            Math.round((form.accidentCoverage / accidentNeed) * 100)
          )
        : 0;

    const premiumPct =
      annualIncome > 0
        ? Math.round(((form.monthlyPremium * 12) / annualIncome) * 100)
        : 0;
    const idealMonthlyPremium = Math.round(
      (annualIncome * PREMIUM_TARGET_PCT) / 100 / 12
    );

    const totalCurrentCoverage =
      form.lifeCoverage + form.healthCoverage + form.accidentCoverage;
    const totalNeed = lifeNeed + HEALTH_TARGET + accidentNeed;
    const totalAchievement =
      totalNeed > 0
        ? Math.min(
            999,
            Math.round((totalCurrentCoverage / totalNeed) * 100)
          )
        : 0;

    return {
      annualIncome,
      yearsToProtect,
      incomeNeed,
      eduNeed,
      debtNeed,
      lifeNeed,
      lifeGap,
      lifeAchievement,
      healthGap,
      healthAchievement,
      accidentNeed,
      accidentGap,
      accidentAchievement,
      premiumPct,
      idealMonthlyPremium,
      totalCurrentCoverage,
      totalNeed,
      totalAchievement,
    };
  }, [form]);

  const hasInputs = form.monthlyIncome > 0 || form.familyExpense > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{
            background: `${BLUE}1a`,
            color: BLUE,
            border: `1px solid ${BLUE}55`,
          }}
        >
          <Shield size={11} />
          Công cụ miễn phí
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Hoạch Định <span style={{ color: BRAND }}>Bảo Hiểm</span> Cá Nhân
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Tính số tiền bảo hiểm nhân thọ cần thiết theo công thức{" "}
          <strong className="text-white">DIME</strong> (Debt + Income + Mortgage
          + Education) + so sánh BH sức khoẻ và tai nạn với tiêu chuẩn.
        </p>
      </div>

      {/* Big summary */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6"
        style={{
          background:
            result.totalAchievement >= 80
              ? `linear-gradient(135deg, ${GREEN}14, transparent)`
              : `linear-gradient(135deg, ${AMBER}14, transparent)`,
          border: `1px solid ${result.totalAchievement >= 80 ? GREEN : AMBER}55`,
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Tổng BH cần thiết
            </div>
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: BRAND }}
            >
              {fmtCompact(result.totalNeed)}
            </div>
            <div className="text-[10px] mt-1 text-gray-500 font-medium">
              DIME + sức khoẻ + tai nạn
            </div>
          </div>
          <MiniStat
            label="Đã có"
            value={result.totalCurrentCoverage}
            color={GREEN}
          />
          <MiniStat
            label="Còn thiếu"
            value={
              Math.max(0, result.totalNeed - result.totalCurrentCoverage)
            }
            color={
              result.totalAchievement >= 100
                ? GREEN
                : result.totalAchievement >= 50
                  ? AMBER
                  : RED
            }
          />
          <MiniStat
            label="Phí /thu nhập"
            value={result.premiumPct}
            color={
              result.premiumPct >= 5 && result.premiumPct <= 15
                ? GREEN
                : result.premiumPct > 15
                  ? RED
                  : AMBER
            }
            note="KN ≈ 10%"
            suffix="%"
            raw
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Personal */}
          <InputSection
            icon={Users}
            label="Thông tin cá nhân"
            color={BLUE}
          >
            <NumField
              label="Tuổi anh/chị"
              value={form.age}
              onChange={(v) => update("age", Math.min(80, v))}
              suffix="tuổi"
              icon={Calendar}
              raw
            />
            <NumField
              label="Tuổi nghỉ hưu"
              value={form.retirementAge}
              onChange={(v) => update("retirementAge", Math.min(80, v))}
              suffix="tuổi"
              icon={Calendar}
              raw
            />
            <NumField
              label="Số người phụ thuộc (vợ/cha mẹ)"
              value={form.dependents}
              onChange={(v) => update("dependents", Math.min(10, v))}
              suffix="người"
              icon={Users}
              raw
            />
            <NumField
              label="Số con cần lo học"
              value={form.children}
              onChange={(v) => update("children", Math.min(10, v))}
              suffix="con"
              icon={GraduationCap}
              raw
            />
          </InputSection>

          {/* Income & expense */}
          <InputSection
            icon={Wallet}
            label="Thu nhập & chi tiêu /tháng"
            color={GREEN}
          >
            <NumField
              label="Thu nhập /tháng"
              value={form.monthlyIncome}
              onChange={(v) => update("monthlyIncome", v)}
              suffix="₫"
              icon={Wallet}
            />
            <NumField
              label="Chi gia đình /tháng"
              value={form.familyExpense}
              onChange={(v) => update("familyExpense", v)}
              suffix="₫"
              icon={Home}
            />
          </InputSection>

          {/* Debt + Education */}
          <InputSection
            icon={Home}
            label="Nợ + học phí dự phòng"
            color={AMBER}
          >
            <NumField
              label="Vay mua nhà còn nợ"
              value={form.mortgage}
              onChange={(v) => update("mortgage", v)}
              suffix="₫"
              icon={Home}
            />
            <NumField
              label="Nợ khác (xe, KD…)"
              value={form.otherDebt}
              onChange={(v) => update("otherDebt", v)}
              suffix="₫"
              icon={HandCoins}
            />
            <NumField
              label="Học phí /con (dự kiến)"
              value={form.eduPerChild}
              onChange={(v) => update("eduPerChild", v)}
              suffix="₫"
              icon={GraduationCap}
            />
          </InputSection>

          {/* Current insurance */}
          <InputSection
            icon={Heart}
            label="Bảo hiểm hiện có"
            color={RED}
          >
            <NumField
              label="BH nhân thọ (số tiền)"
              value={form.lifeCoverage}
              onChange={(v) => update("lifeCoverage", v)}
              suffix="₫"
              icon={HeartHandshake}
            />
            <NumField
              label="BH sức khoẻ (mức quyền lợi)"
              value={form.healthCoverage}
              onChange={(v) => update("healthCoverage", v)}
              suffix="₫"
              icon={Stethoscope}
            />
            <NumField
              label="BH tai nạn"
              value={form.accidentCoverage}
              onChange={(v) => update("accidentCoverage", v)}
              suffix="₫"
              icon={ShieldAlert}
            />
            <NumField
              label="Phí BH đóng /tháng"
              value={form.monthlyPremium}
              onChange={(v) => update("monthlyPremium", v)}
              suffix="₫"
              icon={Wallet}
            />
          </InputSection>

          {/* Reset */}
          <div className="flex items-center justify-between gap-3 pt-1 px-1">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-red-400 transition-colors"
            >
              <RefreshCw size={11} />
              Cài đặt lại
            </button>
            <span className="text-[10px] text-gray-600 inline-flex items-center gap-1">
              <Info size={10} />
              Lưu trên máy
            </span>
          </div>
        </div>

        {/* ─── RIGHT: Reports ─── */}
        <div className="space-y-4">
          {!hasInputs && (
            <div
              className="rounded-2xl p-10 sm:p-16 text-center"
              style={{ background: "#141414", border: "1px dashed #2a2a2a" }}
            >
              <PieChart size={56} className="mx-auto text-gray-700 mb-4" />
              <div className="text-base sm:text-lg font-bold text-gray-400 mb-1">
                Báo cáo trực quan sẽ hiển thị ở đây
              </div>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Anh/chị nhập thông tin ở bảng bên trái — báo cáo DIME tự cập nhật.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              {/* 2x2 donut grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Overall coverage */}
                <ReportCard
                  title="Mức độ bảo vệ tổng"
                  hint="Tỉ lệ BH đã có so với cần thiết"
                  icon={Shield}
                  iconColor={result.totalAchievement >= 80 ? GREEN : AMBER}
                >
                  <CoverageDonut
                    achievement={result.totalAchievement}
                    target={result.totalNeed}
                  />
                </ReportCard>

                {/* Premium ratio */}
                <ReportCard
                  title="Tỉ lệ phí BH / thu nhập"
                  hint="Mục tiêu 5-15% (lý tưởng 10%)"
                  icon={Wallet}
                  iconColor={
                    result.premiumPct >= 5 && result.premiumPct <= 15
                      ? GREEN
                      : AMBER
                  }
                >
                  <PremiumDonut
                    pct={result.premiumPct}
                    current={form.monthlyPremium}
                    ideal={result.idealMonthlyPremium}
                  />
                </ReportCard>

                {/* DIME breakdown */}
                <ReportCard
                  title="Cơ cấu BH nhân thọ cần (DIME)"
                  hint="Debt · Income · Mortgage · Education"
                  icon={PieChart}
                  iconColor={BRAND}
                >
                  <DimeBreakdown result={result} form={form} />
                </ReportCard>

                {/* Current breakdown */}
                <ReportCard
                  title="Cơ cấu BH hiện có"
                  hint="Nhân thọ · Sức khoẻ · Tai nạn"
                  icon={Heart}
                  iconColor={RED}
                >
                  {result.totalCurrentCoverage > 0 ? (
                    <CurrentInsuranceDonut form={form} total={result.totalCurrentCoverage} />
                  ) : (
                    <EmptyReport msg="Chưa có bảo hiểm nào" />
                  )}
                </ReportCard>
              </div>

              {/* 3 types comparison */}
              <CoverageGapDetails result={result} form={form} />

              {/* Recommendations */}
              <RecommendationCard result={result} form={form} />

              {/* Tips */}
              <ActionTips result={result} form={form} />

              {/* Upsell */}
              <Link
                href="/tools/suc-khoe-tai-chinh"
                className="block rounded-2xl p-4 transition-colors hover:bg-[#1a1a1a]"
                style={{
                  background: `linear-gradient(135deg, ${BRAND}10, transparent)`,
                  border: `1px solid ${BRAND}55`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${BRAND}1a`, color: BRAND }}
                  >
                    <Activity size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-0.5">
                      Đo sức khoẻ tài chính tổng thể
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      11 chỉ số + radar map + lời khuyên cá nhân hoá
                    </p>
                  </div>
                  <ArrowRight size={16} style={{ color: BRAND }} />
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Sub-components
 * ───────────────────────────────────────────── */

function InputSection({
  icon: Icon,
  label,
  color,
  children,
}: {
  icon: typeof Users;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-3 sm:p-4 space-y-2.5"
      style={{
        background: `linear-gradient(135deg, ${color}0a, transparent)`,
        border: `1px solid ${color}33`,
      }}
    >
      <div className="flex items-center gap-2 pb-1.5 border-b border-[#1f1f1f]">
        <Icon size={13} style={{ color }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  suffix,
  icon: Icon,
  raw,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  icon: typeof Wallet;
  raw?: boolean;
}) {
  const display = raw
    ? value > 0
      ? String(value)
      : ""
    : value > 0
      ? value.toLocaleString("vi-VN")
      : "";
  const handle = (input: string) => {
    const cleaned = raw
      ? input.replace(/\D/g, "")
      : input.replace(/\D/g, "");
    const n = cleaned ? parseInt(cleaned, 10) : 0;
    onChange(n);
  };
  return (
    <div>
      <label className="block text-[10.5px] text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <Icon
          size={11}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => handle(e.target.value)}
          placeholder="0"
          className="w-full pl-6 pr-12 py-1.5 rounded-md text-[12px] font-bold text-white text-right outline-none"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${value > 0 ? `${BRAND}77` : "#2a2a2a"}`,
          }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
          style={{ color: value > 0 ? BRAND : "#525252" }}
        >
          {suffix}
        </span>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  note,
  suffix,
  raw,
}: {
  label: string;
  value: number;
  color: string;
  note?: string;
  suffix?: string;
  raw?: boolean;
}) {
  const display = raw
    ? `${value}${suffix ?? ""}`
    : fmtCompact(value);
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
        {label}
      </div>
      <div className="text-base sm:text-lg font-extrabold" style={{ color }}>
        {display}
      </div>
      {note && (
        <div className="text-[10px] text-gray-500 font-medium mt-0.5">{note}</div>
      )}
    </div>
  );
}

function ReportCard({
  title,
  hint,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  hint: string;
  icon: typeof Shield;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${iconColor}1a`, color: iconColor }}
        >
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-tight">{title}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyReport({ msg }: { msg: string }) {
  return (
    <div className="h-[180px] flex items-center justify-center text-xs text-gray-600">
      {msg}
    </div>
  );
}

function CoverageDonut({
  achievement,
  target,
}: {
  achievement: number;
  target: number;
}) {
  const color = achievement >= 80 ? GREEN : achievement >= 50 ? AMBER : RED;
  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={Math.min(100, achievement)}
        color={color}
        size={170}
        thickness={24}
        centerTop="Đã bảo vệ"
        centerValue={`${Math.min(999, achievement)}%`}
        centerSub={`/ ${fmtCompact(target)} cần`}
      />
      <p className="mt-3 text-[11px] font-bold text-center" style={{ color }}>
        {achievement >= 100
          ? "✓ Bảo vệ đầy đủ"
          : achievement >= 80
            ? "Gần đủ — bổ sung chút nữa"
            : achievement >= 50
              ? "Còn thiếu — ưu tiên nâng cấp"
              : "Bảo vệ quá mỏng — rủi ro cao"}
      </p>
    </div>
  );
}

function PremiumDonut({
  pct,
  current,
  ideal,
}: {
  pct: number;
  current: number;
  ideal: number;
}) {
  const ok = pct >= 5 && pct <= 15;
  const color = ok ? GREEN : pct > 15 ? RED : AMBER;
  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={Math.min(100, (pct / 15) * 100)}
        color={color}
        size={170}
        thickness={24}
        centerTop="Hiện tại"
        centerValue={`${pct}%`}
        centerSub="thu nhập"
      />
      <div className="w-full mt-3 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Đang đóng /tháng</span>
          <span className="text-white font-bold">{fmtCompact(current)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Lý tưởng (10%)</span>
          <span className="font-bold" style={{ color: BRAND }}>
            {fmtCompact(ideal)}
          </span>
        </div>
        <p className="text-[10px] mt-1 pt-1.5 border-t border-[#1f1f1f] leading-snug" style={{ color }}>
          {pct < 5
            ? "Phí quá thấp — có thể thiếu quyền lợi"
            : pct > 15
              ? "Phí quá cao — review để tối ưu"
              : "Phí cân đối"}
        </p>
      </div>
    </div>
  );
}

function DimeBreakdown({
  result,
  form,
}: {
  result: { debtNeed: number; incomeNeed: number; eduNeed: number; lifeNeed: number; yearsToProtect: number };
  form: FormState;
}) {
  const slices = [
    { value: result.debtNeed, color: RED, label: "Nợ (D)" },
    { value: result.incomeNeed, color: GREEN, label: "Thu nhập (I)" },
    { value: form.mortgage, color: AMBER, label: "BĐS (M)" },
    { value: result.eduNeed, color: PURPLE, label: "Học con (E)" },
  ];
  // Note: debtNeed already includes mortgage, so for the multi-slice
  // we override debtNeed with otherDebt only to avoid double-counting.
  slices[0].value = form.otherDebt;
  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Cần"
        centerValue={fmtCompact(total)}
        centerSub={`bảo vệ ${result.yearsToProtect}y`}
      />
      <ul className="w-full mt-3 space-y-1">
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          if (s.value <= 0) return null;
          return (
            <li
              key={s.label}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="text-white font-bold">
                {pct}% · {fmtCompact(s.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CurrentInsuranceDonut({
  form,
  total,
}: {
  form: FormState;
  total: number;
}) {
  const slices = [
    { value: form.lifeCoverage, color: BLUE, label: "Nhân thọ" },
    { value: form.healthCoverage, color: GREEN, label: "Sức khoẻ" },
    { value: form.accidentCoverage, color: AMBER, label: "Tai nạn" },
  ];
  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Đã có"
        centerValue={fmtCompact(total)}
      />
      <ul className="w-full mt-3 space-y-1">
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          if (s.value <= 0) return null;
          return (
            <li
              key={s.label}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="text-white font-bold">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CoverageGapDetails({
  result,
  form,
}: {
  result: {
    lifeNeed: number;
    lifeAchievement: number;
    healthAchievement: number;
    accidentNeed: number;
    accidentAchievement: number;
  };
  form: FormState;
}) {
  const items = [
    {
      label: "BH nhân thọ",
      icon: HeartHandshake,
      color: BLUE,
      current: form.lifeCoverage,
      need: result.lifeNeed,
      achievement: result.lifeAchievement,
      desc: "Bảo vệ thu nhập + nợ + học con",
    },
    {
      label: "BH sức khoẻ",
      icon: Stethoscope,
      color: GREEN,
      current: form.healthCoverage,
      need: HEALTH_TARGET,
      achievement: result.healthAchievement,
      desc: "KN 1 tỷ (giường VIP + phẫu thuật)",
    },
    {
      label: "BH tai nạn",
      icon: ShieldAlert,
      color: AMBER,
      current: form.accidentCoverage,
      need: result.accidentNeed,
      achievement: result.accidentAchievement,
      desc: "KN ≥ 5× thu nhập năm",
    },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={14} style={{ color: BRAND }} />
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          Chi tiết 3 loại bảo hiểm
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {items.map((it) => {
          const Icon = it.icon;
          const verdictColor =
            it.achievement >= 80 ? GREEN : it.achievement >= 50 ? AMBER : RED;
          return (
            <div
              key={it.label}
              className="rounded-xl p-3"
              style={{ background: "#0a0a0a", border: `1px solid ${it.color}33` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: `${it.color}1a`, color: it.color }}
                >
                  <Icon size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{it.label}</div>
                  <div className="text-[10px] text-gray-500">{it.desc}</div>
                </div>
              </div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-base font-extrabold text-white">
                  {fmtCompact(it.current)}
                </span>
                <span className="text-[10px] text-gray-500">
                  / {fmtCompact(it.need)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: "#1a1a1a" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, it.achievement)}%`,
                    background: verdictColor,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold" style={{ color: verdictColor }}>
                  {Math.min(999, it.achievement)}% đạt
                </span>
                {it.current < it.need && (
                  <span className="text-gray-500">
                    thiếu {fmtCompact(it.need - it.current)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecommendationCard({
  result,
  form,
}: {
  result: {
    lifeGap: number;
    healthGap: number;
    accidentGap: number;
    idealMonthlyPremium: number;
    totalAchievement: number;
  };
  form: FormState;
}) {
  if (form.monthlyIncome <= 0) return null;

  const fits = result.totalAchievement >= 80;
  const premiumGap = result.idealMonthlyPremium - form.monthlyPremium;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: fits
          ? `linear-gradient(135deg, ${GREEN}0d, transparent)`
          : `linear-gradient(135deg, ${AMBER}0d, transparent)`,
        border: `1px solid ${fits ? GREEN : AMBER}55`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: fits ? GREEN : AMBER }} />
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          Gợi ý hoạch định
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div
          className="rounded-lg p-3"
          style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Phí BH hiện tại /tháng
          </div>
          <div className="text-lg font-extrabold text-white">
            {fmtCompact(form.monthlyPremium)}
          </div>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Phí BH lý tưởng /tháng (10% thu nhập)
          </div>
          <div className="text-lg font-extrabold" style={{ color: BRAND }}>
            {fmtCompact(result.idealMonthlyPremium)}
          </div>
        </div>
      </div>

      <ul className="space-y-1.5 text-xs text-gray-300">
        {result.lifeGap > 0 && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: RED }} />
            <span>
              Bổ sung BH nhân thọ <strong className="text-white">{fmtCompact(result.lifeGap)}</strong>{" "}
              để bảo vệ thu nhập + nợ + học con.
            </span>
          </li>
        )}
        {result.healthGap > 0 && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: GREEN }} />
            <span>
              Bổ sung BH sức khoẻ <strong className="text-white">{fmtCompact(result.healthGap)}</strong>{" "}
              (mục tiêu 1 tỷ quyền lợi).
            </span>
          </li>
        )}
        {result.accidentGap > 0 && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: AMBER }} />
            <span>
              Bổ sung BH tai nạn <strong className="text-white">{fmtCompact(result.accidentGap)}</strong>{" "}
              (mục tiêu 5× thu nhập năm).
            </span>
          </li>
        )}
        {premiumGap > 0 && (
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: BRAND }} />
            <span>
              Tăng thêm <strong className="text-white">{fmtCompact(premiumGap)}/tháng</strong> phí
              BH để đạt 10% thu nhập — cân đối giữa bảo vệ và tiết kiệm.
            </span>
          </li>
        )}
        {fits && (
          <li className="flex items-start gap-2">
            <CheckCircle2 size={12} className="shrink-0 mt-0.5" style={{ color: GREEN }} />
            <span>
              <strong style={{ color: GREEN }}>Bảo vệ tài chính đang đầy đủ</strong> — duy trì và
              review định kỳ mỗi 2 năm khi thu nhập thay đổi.
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

function ActionTips({
  result,
  form,
}: {
  result: {
    totalAchievement: number;
    premiumPct: number;
    lifeAchievement: number;
    yearsToProtect: number;
  };
  form: FormState;
}) {
  if (form.monthlyIncome <= 0) return null;
  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];

  if (form.lifeCoverage === 0 && form.children > 0) {
    tips.push({
      type: "warn",
      text: `Anh/chị có ${form.children} con nhưng chưa có BH nhân thọ — đây là rủi ro nghiêm trọng nhất.`,
    });
  }
  if (result.totalAchievement < 50) {
    tips.push({
      type: "warn",
      text: `Mức bảo vệ chỉ đạt ${result.totalAchievement}% — ưu tiên bổ sung BH ngay, đặc biệt là nhân thọ + sức khoẻ.`,
    });
  } else if (result.totalAchievement >= 100) {
    tips.push({
      type: "ok",
      text: `Bảo vệ đầy đủ ${result.totalAchievement}% — xuất sắc!`,
    });
  }
  if (result.premiumPct > 15) {
    tips.push({
      type: "warn",
      text: `Phí BH chiếm ${result.premiumPct}% thu nhập — quá cao. Review các gói để tối ưu chi phí hoặc bỏ trùng lặp.`,
    });
  }
  if (form.age >= 50) {
    tips.push({
      type: "info",
      text: `Tuổi ${form.age} — phí BH sẽ tăng nhanh. Nếu muốn mua thêm, làm sớm để giữ phí thấp.`,
    });
  }
  if (result.yearsToProtect < 10) {
    tips.push({
      type: "info",
      text: `Chỉ còn ${result.yearsToProtect} năm tới hưu — tập trung vào BH sức khoẻ + bảo toàn vốn.`,
    });
  }

  if (tips.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 space-y-2.5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-white mb-1">
        💡 Lời khuyên
      </div>
      {tips.map((t, i) => {
        const Icon =
          t.type === "warn" ? AlertCircle : t.type === "ok" ? CheckCircle2 : Info;
        const color = t.type === "warn" ? RED : t.type === "ok" ? GREEN : BRAND;
        return (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <Icon size={14} className="shrink-0 mt-0.5" style={{ color }} />
            <span className="text-gray-300 leading-relaxed">{t.text}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Helpers ─── */

function fmtCompact(n: number): string {
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}
