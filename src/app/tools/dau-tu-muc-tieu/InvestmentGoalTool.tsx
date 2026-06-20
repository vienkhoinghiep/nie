"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  Calendar,
  Wallet,
  Percent,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  Home,
  Car,
  Plane,
  Shield,
  AlertCircle,
  CheckCircle2,
  Trophy,
  PieChart,
  HeartHandshake,
  Star,
  Crown,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_invgoal_v1";

/* ─────────────────────────────────────────────
 *  Preset goals — 2 groups
 *  1. Tích lũy có mục tiêu  → mua sắm cụ thể, công thức FV
 *  2. Cấp độ tài chính       → 4 milestone theo VINEN
 * ───────────────────────────────────────────── */

interface Preset {
  key: string;
  name: string;
  target: number;
  years: number;
  rate: number;
  icon: typeof Home;
  color: string;
  /** Optional formula caption shown when this preset is active. */
  formula?: string;
}

const ACCUMULATION_PRESETS: Preset[] = [
  {
    key: "house",
    name: "Mua nhà",
    target: 3_000_000_000,
    years: 10,
    rate: 8,
    icon: Home,
    color: BRAND,
  },
  {
    key: "car",
    name: "Mua xe",
    target: 800_000_000,
    years: 3,
    rate: 7,
    icon: Car,
    color: BLUE,
  },
  {
    key: "travel",
    name: "Du lịch lớn",
    target: 200_000_000,
    years: 2,
    rate: 6,
    icon: Plane,
    color: "#06b6d4",
  },
];

const MILESTONE_PRESETS: Preset[] = [
  {
    key: "escape",
    name: "Thoát Nghèo",
    // 12 tháng × 8tr chi tối thiểu = 96tr (smart default)
    target: 96_000_000,
    years: 2,
    rate: 5,
    icon: Shield,
    color: AMBER,
    formula:
      "Tài sản thanh khoản ≥ 12 tháng chi tiêu tối thiểu. Default tính 8tr/tháng × 12 = 96tr.",
  },
  {
    key: "safety",
    name: "An Toàn TC",
    // 120 tháng × 30tr thu nhập = 3.6 tỷ
    target: 3_600_000_000,
    years: 15,
    rate: 8,
    icon: HeartHandshake,
    color: GREEN,
    formula:
      "Tài sản thanh khoản ≥ 120 tháng thu nhập + có bảo hiểm đầy đủ. Default: 30tr/tháng × 120 = 3.6 tỷ.",
  },
  {
    key: "independence",
    name: "Độc Lập TC",
    // 300 × chi thiết yếu (4% rule) = 15tr × 300 = 4.5 tỷ
    target: 4_500_000_000,
    years: 20,
    rate: 10,
    icon: Star,
    color: PURPLE,
    formula:
      "Thu nhập thụ động ≥ chi tiêu thiết yếu (tài sản × 4%/năm = chi). Default: 15tr × 300 = 4.5 tỷ.",
  },
  {
    key: "freedom",
    name: "Tự Do TC",
    target: 100_000_000_000,
    years: 25,
    rate: 12,
    icon: Crown,
    color: BRAND,
    formula: "Tổng tài sản ≥ 100 tỷ (không cần lo về tiền dù sống xa hoa).",
  },
];

const ALL_PRESETS = [...ACCUMULATION_PRESETS, ...MILESTONE_PRESETS];

/* ─────────────────────────────────────────────
 *  State + compute
 * ───────────────────────────────────────────── */

interface FormState {
  goalName: string;
  target: number;
  years: number;
  initial: number;
  monthly: number;
  rate: number; // annual %
}

const DEFAULT_STATE: FormState = {
  goalName: "Mục tiêu của tôi",
  target: 1_000_000_000,
  years: 10,
  initial: 50_000_000,
  monthly: 5_000_000,
  rate: 8,
};

/**
 * Compound growth with monthly contribution.
 *
 * FV = PV·(1+r)^n + PMT · [((1+r)^n − 1) / r]
 *
 * r = monthly rate, n = months.
 */
function computeFV(pv: number, pmt: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return pv + pmt * n;
  const growth = Math.pow(1 + r, n);
  const fvPv = pv * growth;
  const fvPmt = pmt * ((growth - 1) / r);
  return Math.round(fvPv + fvPmt);
}

/**
 * Required monthly contribution to hit target by year N, given current PV.
 *
 * PMT = (FV − PV·(1+r)^n) · r / ((1+r)^n − 1)
 */
function requiredMonthly(
  target: number,
  pv: number,
  annualRate: number,
  years: number
): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (n === 0) return Math.max(0, target - pv);
  if (r === 0) return Math.max(0, (target - pv) / n);
  const growth = Math.pow(1 + r, n);
  const numerator = target - pv * growth;
  const denominator = (growth - 1) / r;
  return Math.max(0, Math.round(numerator / denominator));
}

/**
 * Build (year, value) growth points for the line chart.
 */
function buildGrowthSeries(
  pv: number,
  pmt: number,
  annualRate: number,
  years: number
): { year: number; total: number; principal: number; interest: number }[] {
  const arr: { year: number; total: number; principal: number; interest: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const total = computeFV(pv, pmt, annualRate, y);
    const principal = pv + pmt * 12 * y;
    arr.push({
      year: y,
      total,
      principal,
      interest: Math.max(0, total - principal),
    });
  }
  return arr;
}

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function InvestmentGoalTool() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [activePreset, setActivePreset] = useState<string | null>(null);
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
    setActivePreset(null);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const applyPreset = (p: Preset) => {
    // Cấp độ 1-2 có công cụ chuyên biệt với input riêng theo framework
    // của thầy VINEN — chuyển hướng tới đúng tool thay vì preset inline.
    if (p.key === "escape") {
      router.push("/tools/quy-du-phong?target=12");
      return;
    }
    if (p.key === "safety") {
      router.push("/tools/an-toan-tai-chinh");
      return;
    }
    if (p.key === "independence") {
      router.push("/tools/doc-lap-tai-chinh");
      return;
    }
    setTouched(true);
    setActivePreset(p.key);
    setForm((f) => ({
      ...f,
      goalName: p.name,
      target: p.target,
      years: p.years,
      rate: p.rate,
    }));
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Khôi phục cài đặt mặc định?")
    )
      return;
    setForm(DEFAULT_STATE);
    setActivePreset(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  /* ─── Compute ─── */
  const result = useMemo(() => {
    const fv = computeFV(form.initial, form.monthly, form.rate, form.years);
    const principal = form.initial + form.monthly * 12 * form.years;
    const interest = Math.max(0, fv - principal);
    const achievement =
      form.target > 0 ? Math.round((fv / form.target) * 100) : 0;
    const gap = form.target - fv;
    const requiredPmt = requiredMonthly(
      form.target,
      form.initial,
      form.rate,
      form.years
    );
    const series = buildGrowthSeries(
      form.initial,
      form.monthly,
      form.rate,
      form.years
    );
    return { fv, principal, interest, achievement, gap, requiredPmt, series };
  }, [form]);

  const willHit = result.gap <= 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{
            background: `${BRAND}1a`,
            color: BRAND,
            border: `1px solid ${BRAND}55`,
          }}
        >
          <Target size={11} />
          Công cụ miễn phí
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Đầu Tư <span style={{ color: BRAND }}>Theo Mục Tiêu</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Lập kế hoạch đầu tư đạt mục tiêu cá nhân (mua nhà, nghỉ hưu, học con…) —
          dùng <strong className="text-white">compound interest</strong> +
          biểu đồ tăng trưởng + gợi ý số tiền đầu tư hàng tháng.
        </p>
      </div>

      {/* Big projection card */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6"
        style={{
          background: willHit
            ? `linear-gradient(135deg, ${GREEN}14, transparent)`
            : `linear-gradient(135deg, ${AMBER}14, transparent)`,
          border: `1px solid ${willHit ? GREEN : AMBER}55`,
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Dự kiến đạt được sau {form.years} năm
            </div>
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: willHit ? GREEN : AMBER }}
            >
              {fmtCompact(result.fv)}
            </div>
            <div
              className="text-[10px] mt-1 font-bold uppercase tracking-wider"
              style={{ color: willHit ? GREEN : AMBER }}
            >
              {willHit
                ? `✓ Vượt mục tiêu ${fmtCompact(Math.abs(result.gap))}`
                : `Thiếu ${fmtCompact(result.gap)}`}
            </div>
          </div>
          <MiniStat label="Mục tiêu" value={form.target} color={BRAND} />
          <MiniStat label="Vốn gốc" value={result.principal} color={BLUE} />
          <MiniStat label="Tiền lãi" value={result.interest} color={GREEN} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Preset selector — 2 groups */}
          <div
            className="rounded-xl p-3 sm:p-4 space-y-3"
            style={{ background: "#141414", border: "1px solid #232323" }}
          >
            {/* Group 1: Tích lũy mục tiêu */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Tích lũy mục tiêu
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ACCUMULATION_PRESETS.map((p) => {
                  const Icon = p.icon;
                  const active = activePreset === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg transition-colors"
                      style={{
                        background: active ? `${p.color}1a` : "#0e0e0e",
                        border: `1px solid ${active ? `${p.color}77` : "#1f1f1f"}`,
                      }}
                    >
                      <Icon size={14} style={{ color: p.color }} />
                      <span className="text-[10px] font-medium text-gray-300 text-center leading-tight">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Cấp độ tài chính */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                <Sparkles size={9} style={{ color: BRAND }} />
                Cấp độ tài chính
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {MILESTONE_PRESETS.map((p) => {
                  const Icon = p.icon;
                  const active = activePreset === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-left"
                      style={{
                        background: active ? `${p.color}1a` : "#0e0e0e",
                        border: `1px solid ${active ? `${p.color}77` : "#1f1f1f"}`,
                      }}
                    >
                      <Icon size={14} style={{ color: p.color }} className="shrink-0" />
                      <span className="text-[10.5px] font-bold text-gray-200 leading-tight">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formula explanation when a preset is active */}
            {activePreset && (
              <FormulaHint presetKey={activePreset} />
            )}
          </div>

          {/* Goal config */}
          <div
            className="rounded-xl p-3 sm:p-4 space-y-2.5"
            style={{ background: "#141414", border: "1px solid #232323" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Mục tiêu
            </div>
            <TextField
              label="Tên mục tiêu"
              value={form.goalName}
              onChange={(v) => update("goalName", v)}
              icon={Target}
            />
            <NumberField
              label="Số tiền cần đạt"
              value={form.target}
              onChange={(v) => update("target", v)}
              suffix="₫"
              icon={Wallet}
            />
            <NumberField
              label="Thời gian"
              value={form.years}
              onChange={(v) => update("years", Math.min(50, v))}
              suffix="năm"
              icon={Calendar}
              raw
            />
          </div>

          {/* Investment plan */}
          <div
            className="rounded-xl p-3 sm:p-4 space-y-2.5"
            style={{ background: "#141414", border: "1px solid #232323" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Kế hoạch đầu tư
            </div>
            <NumberField
              label="Vốn ban đầu"
              value={form.initial}
              onChange={(v) => update("initial", v)}
              suffix="₫"
              icon={Wallet}
            />
            <NumberField
              label="Đầu tư /tháng"
              value={form.monthly}
              onChange={(v) => update("monthly", v)}
              suffix="₫"
              icon={TrendingUp}
            />
            <NumberField
              label="Lãi suất kỳ vọng /năm"
              value={form.rate}
              onChange={(v) => update("rate", Math.min(50, v))}
              suffix="%"
              icon={Percent}
              raw
              decimal
            />
            <p className="text-[10px] text-gray-500 leading-relaxed pt-1 border-t border-[#1f1f1f]">
              💡 Gợi ý lãi suất: gửi NH 5-7%, trái phiếu 7-9%, chứng chỉ quỹ
              cân bằng 8-10%, cổ phiếu dài hạn 12-15%.
            </p>
          </div>

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
          {/* 2-col donut row */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Achievement donut */}
            <ReportCard
              title="Mức độ đạt mục tiêu"
              hint={`${form.goalName} sau ${form.years} năm`}
              icon={Target}
              iconColor={willHit ? GREEN : AMBER}
            >
              <AchievementDonut achievement={result.achievement} willHit={willHit} />
            </ReportCard>

            {/* Composition donut */}
            <ReportCard
              title="Cơ cấu tài sản tích lũy"
              hint="Vốn gốc vs Tiền lãi"
              icon={PieChart}
              iconColor={GREEN}
            >
              <CompositionDonut
                principal={result.principal}
                interest={result.interest}
                total={result.fv}
              />
            </ReportCard>
          </div>

          {/* Growth chart */}
          <ReportCard
            title="Biểu đồ tăng trưởng (lãi kép)"
            hint={`${form.years} năm — màu vàng: vốn gốc, xanh: tiền lãi`}
            icon={TrendingUp}
            iconColor={BRAND}
          >
            <GrowthChart series={result.series} target={form.target} />
          </ReportCard>

          {/* Recommendation */}
          <RecommendationCard
            target={form.target}
            years={form.years}
            requiredPmt={result.requiredPmt}
            currentPmt={form.monthly}
            willHit={willHit}
            gap={result.gap}
          />

          {/* What-if scenarios */}
          <WhatIfScenarios form={form} />

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
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Sub-components
 * ───────────────────────────────────────────── */

function TextField({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: typeof Target;
}) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-6 pr-2 py-1.5 rounded-md text-[12px] text-white outline-none"
          style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  icon: Icon,
  raw,
  decimal,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
  icon: typeof Wallet;
  raw?: boolean;
  decimal?: boolean;
}) {
  const display = raw
    ? value > 0
      ? String(value)
      : ""
    : value > 0
      ? value.toLocaleString("vi-VN")
      : "";

  const handle = (input: string) => {
    if (decimal) {
      const cleaned = input.replace(/[^\d.,]/g, "").replace(",", ".");
      const n = parseFloat(cleaned);
      onChange(Number.isFinite(n) ? n : 0);
    } else {
      const digits = input.replace(/\D/g, "");
      const n = digits ? parseInt(digits, 10) : 0;
      onChange(n);
    }
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
          inputMode="decimal"
          value={display}
          onChange={(e) => handle(e.target.value)}
          placeholder="0"
          className="w-full pl-6 pr-10 py-1.5 rounded-md text-[12px] font-bold text-white text-right outline-none"
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
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
        {label}
      </div>
      <div className="text-base sm:text-lg font-extrabold" style={{ color }}>
        {fmtCompact(value)}
      </div>
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
  icon: typeof Target;
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

function AchievementDonut({
  achievement,
  willHit,
}: {
  achievement: number;
  willHit: boolean;
}) {
  const color = willHit ? GREEN : achievement >= 70 ? AMBER : RED;
  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={Math.min(100, achievement)}
        color={color}
        size={170}
        thickness={24}
        centerTop="Đạt được"
        centerValue={`${achievement}%`}
        centerSub="của mục tiêu"
      />
      <div className="mt-3 text-center">
        <p
          className="text-[11px] font-bold"
          style={{ color }}
        >
          {willHit
            ? "✓ Sẽ đạt mục tiêu đúng hạn"
            : achievement >= 70
              ? "Gần đạt — cần tăng đầu tư thêm"
              : "Chưa đủ — cần nâng cao lãi suất hoặc tăng đầu tư"}
        </p>
      </div>
    </div>
  );
}

function CompositionDonut({
  principal,
  interest,
  total,
}: {
  principal: number;
  interest: number;
  total: number;
}) {
  const slices = [
    { value: principal, color: BLUE, label: "Vốn gốc" },
    { value: interest, color: GREEN, label: "Tiền lãi" },
  ];
  const interestPct = total > 0 ? Math.round((interest / total) * 100) : 0;
  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng"
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
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              <span className="text-white font-bold">
                {pct}% · {fmtCompact(s.value)}
              </span>
            </li>
          );
        })}
      </ul>
      {interestPct >= 50 && (
        <p className="text-[10px] text-gray-500 mt-2 italic">
          🎉 Tiền lãi đã vượt vốn gốc — hiệu ứng lãi kép hoạt động!
        </p>
      )}
    </div>
  );
}

function GrowthChart({
  series,
  target,
}: {
  series: { year: number; total: number; principal: number; interest: number }[];
  target: number;
}) {
  const width = 600;
  const height = 220;
  const padding = { top: 16, right: 12, bottom: 28, left: 52 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxYear = Math.max(...series.map((s) => s.year), 1);
  const maxValue = Math.max(...series.map((s) => s.total), target, 1);

  const xOf = (year: number) => padding.left + (year / maxYear) * innerW;
  const yOf = (val: number) =>
    padding.top + innerH - (val / maxValue) * innerH;

  const principalPath = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${xOf(s.year)} ${yOf(s.principal)}`)
    .join(" ");
  const totalPath = series
    .map((s, i) => `${i === 0 ? "M" : "L"} ${xOf(s.year)} ${yOf(s.total)}`)
    .join(" ");
  const fillPath =
    series
      .map((s, i) => `${i === 0 ? "M" : "L"} ${xOf(s.year)} ${yOf(s.principal)}`)
      .join(" ") +
    " " +
    series
      .slice()
      .reverse()
      .map((s) => `L ${xOf(s.year)} ${yOf(s.total)}`)
      .join(" ") +
    " Z";

  // Y axis ticks
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxValue / yTicks) * i)
  );

  // X axis ticks — show every few years
  const xStep = Math.max(1, Math.ceil(maxYear / 6));
  const xTickValues = Array.from(
    { length: Math.floor(maxYear / xStep) + 1 },
    (_, i) => i * xStep
  );
  if (xTickValues[xTickValues.length - 1] !== maxYear) xTickValues.push(maxYear);

  const targetY = yOf(target);

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid */}
        {yTickValues.map((v, i) => (
          <line
            key={i}
            x1={padding.left}
            y1={yOf(v)}
            x2={width - padding.right}
            y2={yOf(v)}
            stroke="#1f1f1f"
            strokeWidth="1"
            strokeDasharray={i === 0 ? "0" : "2 3"}
          />
        ))}
        {/* Target line */}
        {target > 0 && targetY > padding.top && targetY < height - padding.bottom && (
          <>
            <line
              x1={padding.left}
              y1={targetY}
              x2={width - padding.right}
              y2={targetY}
              stroke={BRAND}
              strokeWidth="1.2"
              strokeDasharray="4 3"
              opacity="0.9"
            />
            <text
              x={width - padding.right - 4}
              y={targetY - 4}
              textAnchor="end"
              fontSize="9"
              fill={BRAND}
              fontWeight="700"
            >
              MỤC TIÊU
            </text>
          </>
        )}

        {/* Interest fill (between principal and total) */}
        <path d={fillPath} fill={GREEN} fillOpacity="0.18" />

        {/* Principal line */}
        <path
          d={principalPath}
          fill="none"
          stroke={BLUE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Total line */}
        <path
          d={totalPath}
          fill="none"
          stroke={GREEN}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Y axis labels */}
        {yTickValues.map((v, i) => (
          <text
            key={i}
            x={padding.left - 6}
            y={yOf(v) + 3}
            textAnchor="end"
            fontSize="9"
            fill="#6b7280"
          >
            {fmtCompactShort(v)}
          </text>
        ))}
        {/* X axis labels */}
        {xTickValues.map((y, i) => (
          <text
            key={i}
            x={xOf(y)}
            y={height - 12}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
            fontWeight="600"
          >
            {y}y
          </text>
        ))}

        {/* End point markers */}
        <circle
          cx={xOf(series[series.length - 1].year)}
          cy={yOf(series[series.length - 1].principal)}
          r="3.5"
          fill={BLUE}
        />
        <circle
          cx={xOf(series[series.length - 1].year)}
          cy={yOf(series[series.length - 1].total)}
          r="3.5"
          fill={GREEN}
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="w-3 h-0.5" style={{ background: BLUE }} />
          Vốn gốc
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="w-3 h-0.5" style={{ background: GREEN }} />
          Tổng (lãi kép)
        </div>
        <div className="flex items-center gap-1.5 text-gray-400">
          <span
            className="w-3 h-0.5 border-t border-dashed"
            style={{ borderColor: BRAND }}
          />
          Mục tiêu
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  target,
  years,
  requiredPmt,
  currentPmt,
  willHit,
  gap,
}: {
  target: number;
  years: number;
  requiredPmt: number;
  currentPmt: number;
  willHit: boolean;
  gap: number;
}) {
  if (target <= 0 || years <= 0) return null;

  const diff = requiredPmt - currentPmt;
  const fits = currentPmt >= requiredPmt;

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
          Gợi ý đầu tư
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Đầu tư hiện tại /tháng
          </div>
          <div className="text-xl font-extrabold text-white">
            {fmtVND(currentPmt)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Số tiền cần đầu tư /tháng để đạt đúng hạn
          </div>
          <div
            className="text-xl font-extrabold"
            style={{ color: fits ? GREEN : AMBER }}
          >
            {fmtVND(requiredPmt)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        {fits ? (
          <>
            <CheckCircle2
              size={13}
              className="inline -mt-0.5 mr-1"
              style={{ color: GREEN }}
            />
            <strong style={{ color: GREEN }}>Anh/chị đang vượt yêu cầu</strong> —
            đầu tư hiện tại đủ để đạt mục tiêu trước hạn. Có thể tiết kiệm dư
            hoặc đặt mục tiêu cao hơn.
          </>
        ) : willHit ? (
          <>Đầu tư hiện tại của anh/chị đủ đạt đúng hạn.</>
        ) : (
          <>
            <AlertCircle
              size={13}
              className="inline -mt-0.5 mr-1"
              style={{ color: AMBER }}
            />
            Để đạt mục tiêu đúng {years} năm, anh/chị cần{" "}
            <strong className="text-white">
              tăng đầu tư thêm {fmtVND(Math.max(0, diff))} /tháng
            </strong>{" "}
            (hoặc kéo dài thời gian, hoặc nâng kỳ vọng lãi suất). Hiện đang
            thiếu {fmtCompact(gap)}.
          </>
        )}
      </p>
    </div>
  );
}

function WhatIfScenarios({ form }: { form: FormState }) {
  if (form.target <= 0 || form.years <= 0) return null;

  const scenarios = [
    {
      label: "Lãi suất 6%",
      desc: "Gửi NH dài hạn",
      rate: 6,
      color: BLUE,
    },
    {
      label: "Lãi suất 10%",
      desc: "Cổ phiếu cân bằng",
      rate: 10,
      color: GREEN,
    },
    {
      label: "Lãi suất 15%",
      desc: "Cổ phiếu dài hạn",
      rate: 15,
      color: BRAND,
    },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
        🔮 What-if — nếu lãi suất thay đổi
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {scenarios.map((s) => {
          const fv = computeFV(form.initial, form.monthly, s.rate, form.years);
          const achievement =
            form.target > 0 ? Math.round((fv / form.target) * 100) : 0;
          const hits = fv >= form.target;
          return (
            <div
              key={s.rate}
              className="rounded-xl p-3"
              style={{
                background: "#0a0a0a",
                border: `1px solid ${s.color}33`,
              }}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: s.color }}>
                {s.label}
              </div>
              <div className="text-[10px] text-gray-500 mb-2">{s.desc}</div>
              <div className="text-lg font-extrabold text-white">
                {fmtCompact(fv)}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span
                  className="text-[10px] font-bold"
                  style={{ color: hits ? GREEN : AMBER }}
                >
                  {achievement}% mục tiêu
                </span>
                {hits && (
                  <CheckCircle2 size={12} style={{ color: GREEN }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-500 mt-3 leading-snug">
        💡 Đây là giả định lãi suất kép — thực tế lãi suất biến động theo từng
        năm. Cổ phiếu dài hạn ở VN trung bình ~12-15%/năm, gửi NH 5-7%/năm.
      </p>
    </div>
  );
}

/* ─── Formula hint for selected preset ─── */

function FormulaHint({ presetKey }: { presetKey: string }) {
  const preset = ALL_PRESETS.find((p) => p.key === presetKey);
  if (!preset?.formula) return null;
  return (
    <div
      className="rounded-lg p-2.5 text-[10.5px] leading-relaxed"
      style={{
        background: `${preset.color}0d`,
        border: `1px solid ${preset.color}33`,
        color: "#d1d5db",
      }}
    >
      <span className="font-bold" style={{ color: preset.color }}>
        {preset.name}:
      </span>{" "}
      {preset.formula}
    </div>
  );
}

/* ─── Helpers ─── */

function fmtVND(n: number): string {
  return Math.round(n).toLocaleString("vi-VN") + "₫";
}

function fmtCompact(n: number): string {
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}

function fmtCompactShort(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return (abs / 1e9).toFixed(1).replace(/\.0$/, "") + "tỷ";
  if (abs >= 1e6) return Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return Math.round(abs / 1e3) + "k";
  return String(abs);
}
