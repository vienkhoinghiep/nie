"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star,
  Wallet,
  Home,
  TrendingUp,
  Coins,
  Building2,
  Percent,
  Calendar,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Banknote,
  Bitcoin,
  HandCoins,
  Gem,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_independence_v2";

/* ─────────────────────────────────────────────
 *  Liquid asset fields — đúng 7 nguồn theo thầy
 * ───────────────────────────────────────────── */

interface Field {
  key: string;
  label: string;
  icon: typeof Wallet;
  color: string;
}

const ASSET_FIELDS: Field[] = [
  { key: "cash", label: "Tiền mặt + tiết kiệm NH", icon: Banknote, color: GREEN },
  { key: "gold", label: "Vàng", icon: Gem, color: AMBER },
  { key: "stocks", label: "Cổ phiếu", icon: TrendingUp, color: BLUE },
  { key: "bonds", label: "Trái phiếu", icon: Coins, color: "#06b6d4" },
  { key: "crypto", label: "Coin (crypto)", icon: Bitcoin, color: "#f97316" },
  { key: "private_equity", label: "Cổ phần (vốn góp DN)", icon: HandCoins, color: PURPLE },
  { key: "rental_property", label: "BĐS cho thuê (giá trị)", icon: Building2, color: BRAND },
];

interface FormState {
  monthlyExpense: number;
  monthlyPassiveIncome: number;
  assets: Record<string, number>;
  yearsToGoal: number;
  expectedReturn: number;
  withdrawRate: number;
}

const DEFAULT_STATE: FormState = {
  monthlyExpense: 20_000_000,
  monthlyPassiveIncome: 0,
  assets: {},
  yearsToGoal: 15,
  expectedReturn: 10,
  withdrawRate: 4,
};

/* ─────────────────────────────────────────────
 *  Math helpers
 * ───────────────────────────────────────────── */

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
): number {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (n === 0) return Math.max(0, target - pv);
  if (r === 0) return Math.max(0, (target - pv) / n);
  const g = Math.pow(1 + r, n);
  const pmt = (target - pv * g) / ((g - 1) / r);
  return Math.max(0, Math.round(pmt));
}

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function IndependenceTool() {
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

  const setAsset = (key: string, raw: string) => {
    setTouched(true);
    const digits = raw.replace(/\D/g, "");
    const n = digits ? parseInt(digits, 10) : 0;
    setForm((f) => ({ ...f, assets: { ...f.assets, [key]: n } }));
  };
  const updateNum = (
    key: keyof Omit<FormState, "assets">,
    value: number
  ) => {
    setTouched(true);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const reset = () => {
    if (typeof window !== "undefined" && !window.confirm("Khôi phục cài đặt mặc định?")) return;
    setForm(DEFAULT_STATE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const result = useMemo(() => {
    const totalAssets = ASSET_FIELDS.reduce(
      (s, f) => s + (form.assets[f.key] || 0),
      0
    );
    const annualExpense = form.monthlyExpense * 12;
    const annualPassive = form.monthlyPassiveIncome * 12;
    // Chi ròng = chi năm − TN thụ động năm (phần TS cần phủ)
    const netAnnualExpense = Math.max(0, annualExpense - annualPassive);
    // Target = chi ròng / withdraw rate (e.g. 4%)
    // Nếu TN thụ động ≥ chi → target = 0 (TS không cần đóng vai trò gì)
    const target =
      form.withdrawRate > 0 ? netAnnualExpense / (form.withdrawRate / 100) : 0;
    const achievement =
      target > 0
        ? Math.min(999, Math.round((totalAssets / target) * 100))
        : 100;
    // PP1 — Dòng tiền: TN thụ động /tháng ≥ chi /tháng
    const passiveOK =
      form.monthlyExpense > 0 &&
      form.monthlyPassiveIncome >= form.monthlyExpense;
    const passiveRatio =
      form.monthlyExpense > 0
        ? Math.round((form.monthlyPassiveIncome / form.monthlyExpense) * 100)
        : 0;
    const passiveGap = Math.max(
      0,
      form.monthlyExpense - form.monthlyPassiveIncome
    );
    // PP2 — Quy tắc 4%: TS × withdrawRate%/12 ≥ chi /tháng
    const corpusOK = totalAssets >= target && target > 0;
    // ĐẠT khi BẤT KỲ 1/2 thoả mãn
    const reached = passiveOK || corpusOK;
    const gap = Math.max(0, target - totalAssets);

    // Required monthly contribution
    const requiredPmt = requiredMonthly(
      target,
      totalAssets,
      form.expectedReturn,
      form.yearsToGoal
    );

    // Passive income tạm tính từ TS × withdrawRate (PP2 — quy tắc 4%)
    const passiveFromAssets = (totalAssets * form.withdrawRate) / 100 / 12;
    const passiveFromAssetsRatio =
      form.monthlyExpense > 0
        ? Math.round((passiveFromAssets / form.monthlyExpense) * 100)
        : 0;

    // Projected FV if user contributes ZERO (current TS only growth)
    const fvNoContrib = compoundFV(
      totalAssets,
      0,
      form.expectedReturn,
      form.yearsToGoal
    );

    return {
      totalAssets,
      annualExpense,
      annualPassive,
      netAnnualExpense,
      target,
      achievement,
      reached,
      gap,
      requiredPmt,
      passiveFromAssets,
      passiveFromAssetsRatio,
      passiveOK,
      passiveRatio,
      passiveGap,
      corpusOK,
      fvNoContrib,
    };
  }, [form]);

  const hasInputs = form.monthlyExpense > 0 || result.totalAssets > 0;

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
          <Star size={11} />
          Cấp độ tài chính · Độc lập
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Độc Lập <span style={{ color: BRAND }}>Tài Chính</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Mục tiêu ={" "}
          <strong className="text-white">
            (Chi − TN thụ động) × 12 ÷ {form.withdrawRate}%
          </strong>{" "}
          (quy tắc 4%). TS thanh khoản chỉ cần phủ phần chi tiêu mà TN thụ động
          chưa lo được.
        </p>
      </div>

      {/* Big summary */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6"
        style={{
          background: result.reached
            ? `linear-gradient(135deg, ${GREEN}14, transparent)`
            : `linear-gradient(135deg, ${PURPLE}14, transparent)`,
          border: `1px solid ${result.reached ? GREEN : PURPLE}55`,
        }}
      >
        {/* Status row: 2 phương pháp */}
        <div className="grid sm:grid-cols-2 gap-2.5 mb-4 pb-4 border-b border-[#1f1f1f]">
          <MethodBadge
            label="PP1 — Dòng tiền"
            sublabel={`TN thụ động ${fmtCompact(form.monthlyPassiveIncome)}/th vs chi ${fmtCompact(form.monthlyExpense)}/th`}
            ok={result.passiveOK}
            ratio={result.passiveRatio}
          />
          <MethodBadge
            label="PP2 — Quy tắc 4%"
            sublabel={`TS ${fmtCompact(result.totalAssets)} vs target ${fmtCompact(result.target)} (chi ròng ${fmtCompact(result.netAnnualExpense)}/năm)`}
            ok={result.corpusOK}
            ratio={result.achievement}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Mục tiêu Độc Lập TC
            </div>
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: BRAND }}
            >
              {fmtCompact(result.target)}
            </div>
            <div className="text-[10px] mt-1 text-gray-500 font-medium">
              ({fmtCompact(form.monthlyExpense)} − {fmtCompact(form.monthlyPassiveIncome)}) × 12 ÷ {form.withdrawRate}%
            </div>
          </div>
          <MiniStat
            label="TS hiện có"
            value={result.totalAssets}
            color={result.corpusOK ? GREEN : AMBER}
            note={`${result.achievement}% target`}
          />
          <MiniStat
            label="Còn thiếu (PP2)"
            value={result.gap}
            color={result.gap === 0 ? GREEN : AMBER}
          />
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
              Cần đầu tư /tháng
            </div>
            <div
              className="text-base sm:text-lg font-extrabold"
              style={{ color: result.passiveOK || result.corpusOK ? GREEN : BRAND }}
            >
              {result.passiveOK || result.corpusOK
                ? "0₫"
                : fmtCompact(result.requiredPmt)}
            </div>
            <div className="text-[10px] text-gray-500 font-medium mt-0.5">
              {result.passiveOK
                ? "đã đạt qua PP1"
                : result.corpusOK
                  ? "đã đạt qua PP2"
                  : `trong ${form.yearsToGoal} năm`}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Chi tiêu + TN thụ động — 2 mặt cùng nhóm */}
          <Section icon={Home} label="Chi tiêu & thu nhập thụ động" color={AMBER}>
            <NumField
              label="Chi tiêu /tháng (thực tế)"
              value={form.monthlyExpense}
              onChange={(v) => updateNum("monthlyExpense", v)}
              suffix="₫"
              icon={Wallet}
            />
            <NumField
              label="Thu nhập thụ động /tháng"
              value={form.monthlyPassiveIncome}
              onChange={(v) => updateNum("monthlyPassiveIncome", v)}
              suffix="₫"
              icon={HandCoins}
            />
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 PP1 — Dòng tiền: <strong>TN thụ động ≥ chi tiêu</strong> = ĐẠT ngay.
              <br />
              💡 PP2 — Quy tắc 4%: <strong>TS × {form.withdrawRate}%/năm ≥ (chi − TN thụ động) × 12</strong> — TS chỉ cần phủ phần thiếu.
            </p>
          </Section>

          {/* Assets — 7 sources */}
          <Section
            icon={PieChart}
            label="Tài sản thanh khoản hiện có"
            color={BLUE}
          >
            {ASSET_FIELDS.map((f) => (
              <FieldRow
                key={f.key}
                field={f}
                value={form.assets[f.key] || 0}
                onChange={(v) => setAsset(f.key, v)}
              />
            ))}
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 Chỉ tính TS sinh dòng tiền hoặc bán nhanh được — không tính
              nhà ở, xe đi.
            </p>
          </Section>

          {/* Goal config */}
          <Section icon={Star} label="Mục tiêu & kỳ vọng" color={BRAND}>
            <NumField
              label="Thời gian muốn đạt"
              value={form.yearsToGoal}
              onChange={(v) => updateNum("yearsToGoal", Math.min(60, v))}
              suffix="năm"
              icon={Calendar}
              raw
            />
            <NumField
              label="Lãi suất kỳ vọng /năm"
              value={form.expectedReturn}
              onChange={(v) => updateNum("expectedReturn", Math.min(30, v))}
              suffix="%"
              icon={TrendingUp}
              raw
            />
            <NumField
              label="Tỉ lệ rút an toàn /năm"
              value={form.withdrawRate}
              onChange={(v) => updateNum("withdrawRate", Math.min(10, v))}
              suffix="%"
              icon={Percent}
              raw
            />
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 Lãi 8-10% (danh mục cân bằng), 12-15% (cổ phiếu dài hạn). Rút
              4% là chuẩn quốc tế.
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
                Anh/chị nhập chi tiêu và tài sản thanh khoản hiện có ở bên trái.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              {/* Recommendation card — featured */}
              <RecommendationCard result={result} form={form} />

              {/* 2 donut row */}
              <div className="grid sm:grid-cols-2 gap-4">
                <ReportCard
                  title="Mức độ đạt mục tiêu"
                  hint="TS hiện có vs Mục tiêu"
                  icon={Star}
                  iconColor={result.reached ? GREEN : PURPLE}
                >
                  <AchievementDonut
                    achievement={result.achievement}
                    reached={result.reached}
                  />
                </ReportCard>

                <ReportCard
                  title="Cơ cấu tài sản"
                  hint="Phân bổ theo 7 nhóm"
                  icon={PieChart}
                  iconColor={BLUE}
                >
                  {result.totalAssets > 0 ? (
                    <AssetCompositionDonut
                      values={form.assets}
                      total={result.totalAssets}
                    />
                  ) : (
                    <EmptyReport msg="Chưa có tài sản" />
                  )}
                </ReportCard>
              </div>

              {/* Passive income estimate */}
              <PassiveIncomeCard result={result} form={form} />

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
  icon: typeof Wallet;
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
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: number;
  onChange: (raw: string) => void;
}) {
  const display = value > 0 ? value.toLocaleString("vi-VN") : "";
  const Icon = field.icon;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 truncate">
        <Icon size={11} style={{ color: field.color }} />
        {field.label}
      </label>
      <div className="relative w-[120px]">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full px-2 py-1.5 pr-5 rounded-md text-[12px] font-bold text-white text-right outline-none"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${value > 0 ? `${field.color}77` : "#2a2a2a"}`,
          }}
        />
        <span
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium pointer-events-none"
          style={{ color: value > 0 ? field.color : "#525252" }}
        >
          ₫
        </span>
      </div>
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
        <Icon size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
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
}: {
  label: string;
  value: number;
  color: string;
  note?: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
        {label}
      </div>
      <div className="text-base sm:text-lg font-extrabold" style={{ color }}>
        {fmtCompact(value)}
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
  icon: typeof Wallet;
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

function RecommendationCard({
  result,
  form,
}: {
  result: {
    requiredPmt: number;
    reached: boolean;
    target: number;
    totalAssets: number;
    fvNoContrib: number;
    passiveOK: boolean;
    corpusOK: boolean;
    passiveGap: number;
    passiveFromAssets: number;
  };
  form: FormState;
}) {
  if (result.target <= 0 && !result.passiveOK) return null;

  // Will current assets alone reach target? (no contribution scenario)
  const reachByGrowthAlone = result.fvNoContrib >= result.target;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: result.reached
          ? `linear-gradient(135deg, ${GREEN}14, transparent)`
          : `linear-gradient(135deg, ${BRAND}14, ${PURPLE}08)`,
        border: `1px solid ${result.reached ? GREEN : BRAND}77`,
        boxShadow: `0 12px 36px ${result.reached ? GREEN : BRAND}22`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} style={{ color: result.reached ? GREEN : BRAND }} />
        <div className="text-[11px] font-bold uppercase tracking-widest text-white">
          Khuyến nghị
        </div>
      </div>

      {result.passiveOK ? (
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2" style={{ color: GREEN }}>
            🎉 Đã đạt qua PP1 — Dòng tiền
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Thu nhập thụ động{" "}
            <strong className="text-white">{fmtCompact(form.monthlyPassiveIncome)}/tháng</strong>{" "}
            đã vượt chi tiêu{" "}
            <strong className="text-white">{fmtCompact(form.monthlyExpense)}/tháng</strong>{" "}
            — anh/chị đã <strong style={{ color: GREEN }}>ĐỘC LẬP TÀI CHÍNH</strong>. Có thể
            nghỉ làm full-time, sống bằng dòng tiền hiện có.
          </p>
        </div>
      ) : result.corpusOK ? (
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2" style={{ color: GREEN }}>
            🎉 Đã đạt qua PP2 — Quy tắc 4%
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            TS hiện có{" "}
            <strong className="text-white">{fmtCompact(result.totalAssets)}</strong>{" "}
            đã vượt target{" "}
            <strong className="text-white">{fmtCompact(result.target)}</strong>. TS
            sinh lãi {form.withdrawRate}%/năm cho ≈{" "}
            <strong style={{ color: BRAND }}>
              {fmtCompact(result.passiveFromAssets)}/tháng
            </strong>
            {form.monthlyPassiveIncome > 0 && (
              <>
                {" "}+ TN thụ động hiện có{" "}
                <strong style={{ color: GREEN }}>
                  {fmtCompact(form.monthlyPassiveIncome)}/tháng
                </strong>
              </>
            )}
            {" "}— đủ phủ chi {fmtCompact(form.monthlyExpense)}/tháng. Anh/chị đã{" "}
            <strong style={{ color: GREEN }}>ĐỘC LẬP TÀI CHÍNH</strong>.
          </p>
        </div>
      ) : reachByGrowthAlone ? (
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2" style={{ color: GREEN }}>
            0₫ /tháng — đủ rồi
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Chỉ cần để TS hiện có ({fmtCompact(result.fvNoContrib)} sau {form.yearsToGoal}{" "}
            năm với lãi {form.expectedReturn}%/năm), anh/chị đã vượt mục tiêu mà
            không cần đầu tư thêm.
          </p>
        </div>
      ) : (
        <>
          <div className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2" style={{ color: BRAND }}>
            {fmtCompact(result.requiredPmt)} /tháng
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            Để đạt mục tiêu Độc Lập TC trong{" "}
            <strong className="text-white">{form.yearsToGoal} năm</strong> với lãi
            kỳ vọng <strong className="text-white">{form.expectedReturn}%/năm</strong>,
            anh/chị cần đầu tư đều đặn số tiền này hàng tháng.
          </p>
          <div
            className="mt-4 grid sm:grid-cols-3 gap-2.5 text-[11px]"
          >
            <Stat label="Mục tiêu" value={fmtCompact(result.target)} color={BRAND} />
            <Stat
              label="TS hiện có sau lãi"
              value={fmtCompact(result.fvNoContrib)}
              color={BLUE}
              note={`(không đóng thêm)`}
            />
            <Stat
              label="Tổng đầu tư /năm"
              value={fmtCompact(result.requiredPmt * 12)}
              color={GREEN}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  note,
}: {
  label: string;
  value: string;
  color: string;
  note?: string;
}) {
  return (
    <div
      className="rounded-lg p-2.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="text-[9.5px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
        {label}
      </div>
      <div className="text-sm font-extrabold" style={{ color }}>
        {value}
      </div>
      {note && <div className="text-[9.5px] text-gray-500 mt-0.5 italic">{note}</div>}
    </div>
  );
}

function AchievementDonut({
  achievement,
  reached,
}: {
  achievement: number;
  reached: boolean;
}) {
  const color = reached ? GREEN : achievement >= 50 ? AMBER : PURPLE;
  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={Math.min(100, achievement)}
        color={color}
        size={170}
        thickness={24}
        centerTop="Đã đạt"
        centerValue={`${Math.min(999, achievement)}%`}
        centerSub="của target"
      />
      <p className="mt-3 text-[11px] font-bold text-center" style={{ color }}>
        {reached
          ? "✓ Đã đạt Độc Lập TC"
          : achievement >= 75
            ? "Gần đạt — cố thêm chút nữa"
            : achievement >= 50
              ? "Nửa đường — giữ kỷ luật đầu tư"
              : "Còn xa — kế hoạch dài hạn"}
      </p>
    </div>
  );
}

function AssetCompositionDonut({
  values,
  total,
}: {
  values: Record<string, number>;
  total: number;
}) {
  const slices = ASSET_FIELDS.map((f) => ({
    value: values[f.key] || 0,
    color: f.color,
    label: f.label,
  }));
  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng TS"
        centerValue={fmtCompact(total)}
      />
      <ul className="w-full mt-3 space-y-1">
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          if (s.value <= 0) return null;
          return (
            <li key={s.label} className="flex items-center justify-between text-[10.5px]">
              <span className="flex items-center gap-1.5 text-gray-400 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="text-white font-bold whitespace-nowrap">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MethodBadge({
  label,
  sublabel,
  ok,
  ratio,
}: {
  label: string;
  sublabel: string;
  ok: boolean;
  ratio: number;
}) {
  const color = ok ? GREEN : ratio >= 50 ? AMBER : PURPLE;
  const Icon = ok ? CheckCircle2 : AlertCircle;
  return (
    <div
      className="rounded-lg px-3 py-2 flex items-start gap-2.5"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}55`,
      }}
    >
      <Icon size={14} className="shrink-0 mt-0.5" style={{ color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white">
            {label}
          </span>
          <span className="text-[11px] font-extrabold" style={{ color }}>
            {Math.min(999, ratio)}%
          </span>
        </div>
        <p className="text-[10px] text-gray-400 leading-snug mt-0.5 truncate">
          {sublabel}
        </p>
      </div>
    </div>
  );
}

function PassiveIncomeCard({
  result,
  form,
}: {
  result: {
    passiveFromAssets: number;
    passiveFromAssetsRatio: number;
    passiveRatio: number;
    passiveOK: boolean;
    corpusOK: boolean;
    totalAssets: number;
  };
  form: FormState;
}) {
  if (result.totalAssets <= 0 && form.monthlyPassiveIncome <= 0) return null;
  if (form.monthlyExpense <= 0) return null;
  const totalPassive = form.monthlyPassiveIncome + result.passiveFromAssets;
  const totalRatio = Math.round((totalPassive / form.monthlyExpense) * 100);
  const ok = result.passiveOK || result.corpusOK;
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <HandCoins size={14} style={{ color: BRAND }} />
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          Thu nhập thụ động — đối chiếu chi tiêu
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          className="rounded-lg p-3"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${form.monthlyPassiveIncome > 0 ? `${GREEN}55` : "#1f1f1f"}`,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            TN thụ động thực tế (PP1)
          </div>
          <div className="text-base font-extrabold" style={{ color: GREEN }}>
            {fmtCompact(form.monthlyPassiveIncome)} /th
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {result.passiveRatio}% chi
          </div>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            TS × {form.withdrawRate}% (PP2)
          </div>
          <div className="text-base font-extrabold" style={{ color: BRAND }}>
            {fmtCompact(result.passiveFromAssets)} /th
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {result.passiveFromAssetsRatio}% chi
          </div>
        </div>
        <div
          className="rounded-lg p-3"
          style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Chi tiêu /tháng
          </div>
          <div className="text-base font-extrabold text-white">
            {fmtCompact(form.monthlyExpense)} /th
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            mức tối thiểu cần phủ
          </div>
        </div>
        <div
          className="rounded-lg p-3"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${ok ? `${GREEN}77` : `${AMBER}55`}`,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            Tổng phủ chi (PP1+PP2)
          </div>
          <div
            className="text-base font-extrabold"
            style={{ color: ok ? GREEN : AMBER }}
          >
            {Math.min(999, totalRatio)}%
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            ≈ {fmtCompact(totalPassive)} /th
          </div>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed mt-3 pt-3 border-t border-[#1f1f1f]">
        {result.passiveOK ? (
          <>
            ✓ <strong style={{ color: GREEN }}>ĐẠT Độc Lập TC qua PP1</strong> — TN
            thụ động {fmtCompact(form.monthlyPassiveIncome)}/th đã ≥ chi tiêu{" "}
            {fmtCompact(form.monthlyExpense)}/th.
          </>
        ) : result.corpusOK ? (
          <>
            ✓ <strong style={{ color: GREEN }}>ĐẠT Độc Lập TC qua PP2</strong> — TS
            sinh lãi {form.withdrawRate}%/năm cho ≈{" "}
            {fmtCompact(result.passiveFromAssets)}/th, đủ phủ chi.
          </>
        ) : (
          <>
            Chưa đạt — TN thụ động hiện chỉ phủ{" "}
            <strong className="text-white">{result.passiveRatio}%</strong> chi (PP1),
            TS × {form.withdrawRate}% phủ{" "}
            <strong className="text-white">{result.passiveFromAssetsRatio}%</strong>{" "}
            (PP2). Chỉ cần <strong>1 trong 2 đạt 100%</strong> là Độc Lập TC.
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
  result: { target: number; totalAssets: number; requiredPmt: number };
  form: FormState;
}) {
  if (result.target <= 0 || result.totalAssets >= result.target) return null;

  const scenarios = [
    {
      label: `Trong ${Math.max(5, form.yearsToGoal - 5)} năm`,
      desc: "Đạt sớm hơn",
      pmt: requiredMonthly(
        result.target,
        result.totalAssets,
        form.expectedReturn,
        Math.max(5, form.yearsToGoal - 5)
      ),
      color: PURPLE,
    },
    {
      label: `Trong ${form.yearsToGoal} năm`,
      desc: "Kế hoạch hiện tại",
      pmt: result.requiredPmt,
      color: BRAND,
      highlight: true,
    },
    {
      label: `Trong ${form.yearsToGoal + 5} năm`,
      desc: "Lùi mục tiêu",
      pmt: requiredMonthly(
        result.target,
        result.totalAssets,
        form.expectedReturn,
        form.yearsToGoal + 5
      ),
      color: GREEN,
    },
    {
      label: `Lãi 15%/năm`,
      desc: "Cổ phiếu dài hạn",
      pmt: requiredMonthly(
        result.target,
        result.totalAssets,
        15,
        form.yearsToGoal
      ),
      color: BLUE,
    },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-white mb-3">
        🔮 What-if — thử các kế hoạch
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {scenarios.map((s, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{
              background: "#0a0a0a",
              border: `1px solid ${s.color}${s.highlight ? "77" : "33"}`,
            }}
          >
            <div
              className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
              style={{ color: s.color }}
            >
              {s.label}
            </div>
            <div className="text-[10px] text-gray-500 mb-1.5">{s.desc}</div>
            <div className="text-sm font-extrabold text-white">
              {fmtCompact(s.pmt)}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">/tháng</div>
          </div>
        ))}
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
    requiredPmt: number;
    reached: boolean;
    passiveOK: boolean;
    corpusOK: boolean;
    passiveRatio: number;
    passiveGap: number;
  };
  form: FormState;
}) {
  if (form.monthlyExpense <= 0) return null;
  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];

  if (result.passiveOK) {
    tips.push({
      type: "ok",
      text: `Đã ĐỘC LẬP TÀI CHÍNH qua PP1 — TN thụ động ${fmtCompact(form.monthlyPassiveIncome)}/th đã ≥ chi. Có thể nghỉ làm full-time. Bước tiếp: Tự Do Tài Chính (TS ≥ 100 tỷ).`,
    });
  } else if (result.corpusOK) {
    tips.push({
      type: "ok",
      text: "Đã ĐỘC LẬP TÀI CHÍNH qua PP2 — TS đủ sinh dòng tiền phủ chi. Bước tiếp: Tự Do Tài Chính (TS ≥ 100 tỷ).",
    });
  } else if (result.passiveRatio >= 70) {
    tips.push({
      type: "info",
      text: `TN thụ động đã phủ ${result.passiveRatio}% chi — chỉ còn thiếu ${fmtCompact(result.passiveGap)}/th để ĐẠT qua PP1. Tăng nguồn cho thuê / cổ tức / lãi vay sẽ nhanh hơn tích corpus.`,
    });
  } else if (result.achievement >= 50) {
    tips.push({
      type: "info",
      text: `Đang ở nửa đường PP2 (${result.achievement}%). Duy trì đầu tư ${fmtCompact(result.requiredPmt)}/tháng đều đặn.`,
    });
  } else {
    tips.push({
      type: "warn",
      text: `Mới đạt ${result.achievement}% (PP2) và TN thụ động chỉ phủ ${result.passiveRatio}% chi (PP1) — còn xa. Cần kế hoạch dài hạn + tăng thu nhập để tăng tốc.`,
    });
  }
  if (form.withdrawRate > 5) {
    tips.push({
      type: "info",
      text: `Tỉ lệ rút ${form.withdrawRate}%/năm khá cao — rủi ro cạn corpus sớm. Quốc tế khuyến nghị 4%.`,
    });
  }
  if (form.expectedReturn > 12) {
    tips.push({
      type: "info",
      text: `Lãi kỳ vọng ${form.expectedReturn}%/năm cao — chỉ đạt được khi tập trung cổ phiếu dài hạn (rủi ro biến động).`,
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
        const Icon = t.type === "warn" ? AlertCircle : t.type === "ok" ? CheckCircle2 : Info;
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
