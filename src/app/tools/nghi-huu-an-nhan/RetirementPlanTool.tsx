"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Wallet,
  TrendingUp,
  Percent,
  Home,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Coffee,
  Sun,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_retire_v1";

/* ─────────────────────────────────────────────
 *  Form state + defaults
 * ───────────────────────────────────────────── */

interface FormState {
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  currentExpense: number; // VND/tháng
  postRetireRatio: number; // % so với chi hiện tại (default 70)
  currentCorpus: number; // VND
  monthlyContrib: number; // VND
  expectedReturn: number; // % annual
  inflation: number; // % annual
}

const DEFAULT_STATE: FormState = {
  currentAge: 35,
  retireAge: 60,
  lifeExpectancy: 85,
  currentExpense: 20_000_000,
  postRetireRatio: 70,
  currentCorpus: 100_000_000,
  monthlyContrib: 5_000_000,
  expectedReturn: 9,
  inflation: 4,
};

/* ─────────────────────────────────────────────
 *  Math helpers
 * ───────────────────────────────────────────── */

/** Compound future value with monthly contribution. */
function compoundFV(pv: number, pmt: number, annualRate: number, years: number) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (n === 0) return pv;
  if (r === 0) return pv + pmt * n;
  const g = Math.pow(1 + r, n);
  return pv * g + pmt * ((g - 1) / r);
}

/** Required monthly contribution to reach target by years given PV. */
function requiredMonthly(
  target: number,
  pv: number,
  annualRate: number,
  years: number
) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (n === 0) return Math.max(0, target - pv);
  if (r === 0) return Math.max(0, (target - pv) / n);
  const g = Math.pow(1 + r, n);
  return Math.max(0, Math.round((target - pv * g) / ((g - 1) / r)));
}

/** Inflate today's value forward N years. */
function inflate(amountToday: number, annualInflation: number, years: number) {
  return amountToday * Math.pow(1 + annualInflation / 100, years);
}

function buildSeries(
  pv: number,
  pmt: number,
  rate: number,
  years: number
): { year: number; total: number; principal: number }[] {
  const out: { year: number; total: number; principal: number }[] = [];
  for (let y = 0; y <= years; y++) {
    out.push({
      year: y,
      total: compoundFV(pv, pmt, rate, y),
      principal: pv + pmt * 12 * y,
    });
  }
  return out;
}

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function RetirementPlanTool() {
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

  /* ─── Compute ─── */
  const result = useMemo(() => {
    const yearsToRetire = Math.max(0, form.retireAge - form.currentAge);
    const yearsInRetire = Math.max(0, form.lifeExpectancy - form.retireAge);

    // Today's monthly need post-retirement (today VND)
    const postRetireMonthlyToday =
      form.currentExpense * (form.postRetireRatio / 100);
    // Inflate forward to retirement date
    const postRetireMonthlyAtRetire = inflate(
      postRetireMonthlyToday,
      form.inflation,
      yearsToRetire
    );
    const postRetireAnnualAtRetire = postRetireMonthlyAtRetire * 12;

    // Target corpus = annual_at_retirement × years_in_retirement
    // (simple spend-down — conservative, ignores continued investment)
    const targetCorpus = postRetireAnnualAtRetire * yearsInRetire;

    // Projected FV with current plan
    const projectedCorpus = compoundFV(
      form.currentCorpus,
      form.monthlyContrib,
      form.expectedReturn,
      yearsToRetire
    );
    const totalPrincipal =
      form.currentCorpus + form.monthlyContrib * 12 * yearsToRetire;
    const interestEarned = Math.max(0, projectedCorpus - totalPrincipal);

    const achievement =
      targetCorpus > 0
        ? Math.min(999, Math.round((projectedCorpus / targetCorpus) * 100))
        : 0;
    const gap = Math.max(0, targetCorpus - projectedCorpus);
    const surplus = Math.max(0, projectedCorpus - targetCorpus);
    const requiredPmt = requiredMonthly(
      targetCorpus,
      form.currentCorpus,
      form.expectedReturn,
      yearsToRetire
    );

    // # months that projected corpus can sustain at retirement
    const monthsSustained =
      postRetireMonthlyAtRetire > 0
        ? Math.round(projectedCorpus / postRetireMonthlyAtRetire)
        : 0;

    const series = buildSeries(
      form.currentCorpus,
      form.monthlyContrib,
      form.expectedReturn,
      yearsToRetire
    );

    return {
      yearsToRetire,
      yearsInRetire,
      postRetireMonthlyToday,
      postRetireMonthlyAtRetire,
      targetCorpus,
      projectedCorpus,
      totalPrincipal,
      interestEarned,
      achievement,
      gap,
      surplus,
      requiredPmt,
      monthsSustained,
      series,
    };
  }, [form]);

  const willHit = result.surplus >= 0 && result.projectedCorpus >= result.targetCorpus;
  const hasInputs = form.currentExpense > 0 && form.currentAge > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{
            background: `${PURPLE}1a`,
            color: PURPLE,
            border: `1px solid ${PURPLE}55`,
          }}
        >
          <Sun size={11} />
          Công cụ miễn phí
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Nghỉ Hưu <span style={{ color: BRAND }}>An Nhàn</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Tính số tiền cần tích lũy đến tuổi hưu (đã tính{" "}
          <strong className="text-white">lạm phát</strong>) + lộ trình đầu tư
          /tháng cần thiết để hưu trí an nhàn.
        </p>
      </div>

      {/* Big summary card */}
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
              Số tiền cần tích lũy
            </div>
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: BRAND }}
            >
              {fmtCompact(result.targetCorpus)}
            </div>
            <div className="text-[10px] mt-1 text-gray-500 font-medium">
              Đến năm {form.currentAge + result.yearsToRetire} tuổi
            </div>
          </div>
          <MiniStat
            label="Dự kiến đạt"
            value={result.projectedCorpus}
            color={willHit ? GREEN : AMBER}
          />
          <MiniStat
            label={willHit ? "Vượt" : "Còn thiếu"}
            value={willHit ? result.surplus : result.gap}
            color={willHit ? GREEN : RED}
          />
          <MiniStat
            label="Còn"
            value={result.yearsToRetire}
            color={BLUE}
            note="năm tới hưu"
            suffix=" năm"
            raw
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Age plan */}
          <Section icon={Calendar} label="Tuổi & kế hoạch" color={BLUE}>
            <NumField
              label="Tuổi hiện tại"
              value={form.currentAge}
              onChange={(v) => update("currentAge", Math.min(80, v))}
              suffix="tuổi"
              icon={Calendar}
              raw
            />
            <NumField
              label="Tuổi muốn nghỉ hưu"
              value={form.retireAge}
              onChange={(v) => update("retireAge", Math.min(80, v))}
              suffix="tuổi"
              icon={Coffee}
              raw
            />
            <NumField
              label="Tuổi kỳ vọng sống"
              value={form.lifeExpectancy}
              onChange={(v) => update("lifeExpectancy", Math.min(120, v))}
              suffix="tuổi"
              icon={Sun}
              raw
            />
          </Section>

          {/* Expense */}
          <Section icon={Home} label="Chi tiêu" color={AMBER}>
            <NumField
              label="Chi tiêu hiện tại /tháng"
              value={form.currentExpense}
              onChange={(v) => update("currentExpense", v)}
              suffix="₫"
              icon={Wallet}
            />
            <NumField
              label="% chi sau hưu (so với hiện tại)"
              value={form.postRetireRatio}
              onChange={(v) => update("postRetireRatio", Math.min(150, v))}
              suffix="%"
              icon={Percent}
              raw
            />
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 Khuyến nghị: 70-80% chi hiện tại. Cao hơn nếu muốn du lịch
              nhiều, thấp hơn nếu sống đơn giản.
            </p>
          </Section>

          {/* Investment plan */}
          <Section icon={TrendingUp} label="Kế hoạch đầu tư hưu" color={GREEN}>
            <NumField
              label="Vốn hưu trí hiện có"
              value={form.currentCorpus}
              onChange={(v) => update("currentCorpus", v)}
              suffix="₫"
              icon={Wallet}
            />
            <NumField
              label="Đầu tư /tháng"
              value={form.monthlyContrib}
              onChange={(v) => update("monthlyContrib", v)}
              suffix="₫"
              icon={TrendingUp}
            />
            <NumField
              label="Lãi suất kỳ vọng /năm"
              value={form.expectedReturn}
              onChange={(v) => update("expectedReturn", Math.min(30, v))}
              suffix="%"
              icon={Percent}
              raw
            />
            <NumField
              label="Lạm phát kỳ vọng /năm"
              value={form.inflation}
              onChange={(v) => update("inflation", Math.min(20, v))}
              suffix="%"
              icon={Percent}
              raw
            />
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 VN trung bình: lãi 8-10%/năm (CCQ cân bằng), lạm phát 3-5%/năm.
            </p>
          </Section>

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
                Anh/chị nhập thông tin ở bảng bên trái.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              {/* 2 donut row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <ReportCard
                  title="Mức độ đạt mục tiêu hưu"
                  hint={`Dự kiến vs cần (${form.lifeExpectancy - form.retireAge}y hưu)`}
                  icon={Trophy}
                  iconColor={willHit ? GREEN : AMBER}
                >
                  <AchievementDonut
                    achievement={result.achievement}
                    willHit={willHit}
                    monthsSustained={result.monthsSustained}
                    yearsInRetire={result.yearsInRetire}
                  />
                </ReportCard>

                <ReportCard
                  title="Cơ cấu tài sản hưu"
                  hint="Vốn gốc vs Tiền lãi sau hưu"
                  icon={PieChart}
                  iconColor={GREEN}
                >
                  <CompositionDonut
                    principal={result.totalPrincipal}
                    interest={result.interestEarned}
                    total={result.projectedCorpus}
                  />
                </ReportCard>
              </div>

              {/* Growth projection chart */}
              <ReportCard
                title="Biểu đồ tăng trưởng đến tuổi hưu"
                hint={`${result.yearsToRetire} năm — vốn gốc (xanh dương) + lãi kép (xanh lá)`}
                icon={TrendingUp}
                iconColor={BRAND}
              >
                <GrowthChart
                  series={result.series}
                  target={result.targetCorpus}
                  currentAge={form.currentAge}
                />
              </ReportCard>

              {/* Recommendation */}
              <RecommendationCard result={result} form={form} />

              {/* What-if scenarios */}
              <WhatIfScenarios result={result} form={form} />

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

function Section({
  icon: Icon,
  label,
  color,
  children,
}: {
  icon: typeof Calendar;
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
    const cleaned = input.replace(/\D/g, "");
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
  const display = raw ? `${value}${suffix ?? ""}` : fmtCompact(value);
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
  icon: typeof Trophy;
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
  monthsSustained,
  yearsInRetire,
}: {
  achievement: number;
  willHit: boolean;
  monthsSustained: number;
  yearsInRetire: number;
}) {
  const color = willHit ? GREEN : achievement >= 70 ? AMBER : RED;
  const yearsCovered = (monthsSustained / 12).toFixed(1);
  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={Math.min(100, achievement)}
        color={color}
        size={170}
        thickness={24}
        centerTop="Đạt được"
        centerValue={`${Math.min(999, achievement)}%`}
        centerSub="của mục tiêu"
      />
      <div className="mt-3 text-center space-y-1">
        <p className="text-[11px] font-bold" style={{ color }}>
          {willHit
            ? `✓ Đủ sống ${yearsCovered}/${yearsInRetire} năm hưu`
            : `Đủ sống ${yearsCovered}/${yearsInRetire} năm — cần bổ sung`}
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
    { value: interest, color: GREEN, label: "Tiền lãi (lãi kép)" },
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
      {interestPct >= 50 && (
        <p className="text-[10px] text-gray-500 mt-2 italic">
          🎉 Tiền lãi đã vượt vốn gốc — hiệu ứng lãi kép phát huy mạnh
        </p>
      )}
    </div>
  );
}

function GrowthChart({
  series,
  target,
  currentAge,
}: {
  series: { year: number; total: number; principal: number }[];
  target: number;
  currentAge: number;
}) {
  if (series.length <= 1) {
    return (
      <div className="h-[220px] flex items-center justify-center text-xs text-gray-600">
        Chưa có khoảng thời gian — chỉnh tuổi hiện tại &lt; tuổi hưu
      </div>
    );
  }

  const width = 600;
  const height = 220;
  const padding = { top: 16, right: 12, bottom: 28, left: 52 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxYear = Math.max(...series.map((s) => s.year), 1);
  const maxValue = Math.max(...series.map((s) => s.total), target, 1);

  const xOf = (y: number) => padding.left + (y / maxYear) * innerW;
  const yOf = (v: number) =>
    padding.top + innerH - (v / maxValue) * innerH;

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

  const yTickValues = Array.from({ length: 5 }, (_, i) =>
    Math.round((maxValue / 4) * i)
  );
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

        <path d={fillPath} fill={GREEN} fillOpacity="0.18" />
        <path
          d={principalPath}
          fill="none"
          stroke={BLUE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={totalPath}
          fill="none"
          stroke={GREEN}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

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
            {currentAge + y}t
          </text>
        ))}

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
  result,
  form,
}: {
  result: {
    requiredPmt: number;
    yearsToRetire: number;
    projectedCorpus: number;
    targetCorpus: number;
    gap: number;
  };
  form: FormState;
}) {
  if (result.yearsToRetire <= 0 || result.targetCorpus <= 0) return null;

  const fits = form.monthlyContrib >= result.requiredPmt;
  const diff = result.requiredPmt - form.monthlyContrib;

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
          Gợi ý đầu tư hưu trí
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <div
          className="rounded-lg p-3"
          style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Đang đầu tư /tháng
          </div>
          <div className="text-lg font-extrabold text-white">
            {fmtCompact(form.monthlyContrib)}
          </div>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Cần đầu tư /tháng để đạt đúng hạn
          </div>
          <div className="text-lg font-extrabold" style={{ color: fits ? GREEN : AMBER }}>
            {fmtCompact(result.requiredPmt)}
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
            <strong style={{ color: GREEN }}>Đang vượt yêu cầu</strong> — đầu tư
            hiện tại đủ để đạt mục tiêu hưu trí trước hạn.
          </>
        ) : (
          <>
            <AlertCircle
              size={13}
              className="inline -mt-0.5 mr-1"
              style={{ color: AMBER }}
            />
            Để hưu trí an nhàn đúng tuổi {form.retireAge}, anh/chị cần{" "}
            <strong className="text-white">
              tăng đầu tư thêm {fmtCompact(Math.max(0, diff))}/tháng
            </strong>{" "}
            (hoặc lùi tuổi hưu, hoặc nâng kỳ vọng lãi suất). Hiện thiếu{" "}
            {fmtCompact(result.gap)}.
          </>
        )}
      </p>
    </div>
  );
}

function WhatIfScenarios({
  result,
  form,
}: {
  result: { yearsToRetire: number; targetCorpus: number };
  form: FormState;
}) {
  if (result.yearsToRetire <= 0) return null;

  const scenarios = [
    {
      label: "Lùi hưu 5 năm",
      desc: `Hưu tuổi ${form.retireAge + 5}`,
      compute: () =>
        compoundFV(
          form.currentCorpus,
          form.monthlyContrib,
          form.expectedReturn,
          result.yearsToRetire + 5
        ),
      color: BLUE,
    },
    {
      label: "Tăng đóng gấp đôi",
      desc: `${fmtCompact(form.monthlyContrib * 2)}/tháng`,
      compute: () =>
        compoundFV(
          form.currentCorpus,
          form.monthlyContrib * 2,
          form.expectedReturn,
          result.yearsToRetire
        ),
      color: GREEN,
    },
    {
      label: "Lãi suất 12%",
      desc: "Cổ phiếu dài hạn",
      compute: () =>
        compoundFV(
          form.currentCorpus,
          form.monthlyContrib,
          12,
          result.yearsToRetire
        ),
      color: BRAND,
    },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
        🔮 What-if — thử đổi 3 cách
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {scenarios.map((s, i) => {
          const fv = s.compute();
          const achievement =
            result.targetCorpus > 0
              ? Math.round((fv / result.targetCorpus) * 100)
              : 0;
          const hits = fv >= result.targetCorpus;
          return (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{ background: "#0a0a0a", border: `1px solid ${s.color}33` }}
            >
              <div
                className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
                style={{ color: s.color }}
              >
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
                {hits && <CheckCircle2 size={12} style={{ color: GREEN }} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionTips({
  result,
  form,
}: {
  result: {
    achievement: number;
    yearsToRetire: number;
    requiredPmt: number;
    monthsSustained: number;
    yearsInRetire: number;
  };
  form: FormState;
}) {
  if (form.currentExpense <= 0) return null;
  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];

  if (form.currentAge >= form.retireAge) {
    tips.push({
      type: "warn",
      text: "Tuổi hiện tại đã ≥ tuổi nghỉ hưu — hãy chỉnh lại tuổi muốn nghỉ hưu hoặc kiểm tra số liệu.",
    });
  }
  if (result.yearsToRetire > 0 && result.yearsToRetire <= 5) {
    tips.push({
      type: "warn",
      text: `Chỉ còn ${result.yearsToRetire} năm tới hưu — quá ngắn để tăng tài sản nhiều. Tập trung bảo toàn vốn + giảm chi.`,
    });
  }
  if (result.achievement < 50 && result.yearsToRetire > 10) {
    tips.push({
      type: "info",
      text: `Mới đạt ${result.achievement}% — còn ${result.yearsToRetire} năm, vẫn kịp nếu tăng đóng góp lên ${fmtCompact(result.requiredPmt)}/tháng + đầu tư có hệ thống.`,
    });
  }
  if (result.achievement >= 100) {
    tips.push({
      type: "ok",
      text: `Đã vượt mục tiêu — có thể nghỉ hưu sớm hoặc nâng tiêu chuẩn sống sau hưu.`,
    });
  }
  if (form.expectedReturn > 15) {
    tips.push({
      type: "info",
      text: `Lãi kỳ vọng ${form.expectedReturn}% — rất cao. VN trung bình cổ phiếu dài hạn 12-15%. Test thêm scenario lãi 10% để có biên an toàn.`,
    });
  }
  if (form.inflation < 3) {
    tips.push({
      type: "info",
      text: `Lạm phát ${form.inflation}% — thấp hơn trung bình VN (4-5%). Cân nhắc tăng để tính conservative hơn.`,
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

function fmtCompactShort(n: number): string {
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e9) return (abs / 1e9).toFixed(1).replace(/\.0$/, "") + "tỷ";
  if (abs >= 1e6) return Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return Math.round(abs / 1e3) + "k";
  return String(abs);
}
