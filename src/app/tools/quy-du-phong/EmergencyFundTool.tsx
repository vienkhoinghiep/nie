"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Wallet,
  PiggyBank,
  Calendar,
  Percent,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Coins,
  Building2,
  Gem,
  CreditCard,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_emergency_v1";

/* ─────────────────────────────────────────────
 *  Field config
 * ───────────────────────────────────────────── */

type FieldGroup = "expenses" | "current_fund";

interface Field {
  key: string;
  label: string;
  group: FieldGroup;
  icon: typeof Wallet;
  color: string;
}

const FIELDS: Field[] = [
  // Chi tiêu hàng tháng
  { key: "fixed", label: "Chi cố định /tháng", group: "expenses", icon: Wallet, color: AMBER },
  { key: "variable", label: "Chi biến động /tháng", group: "expenses", icon: PiggyBank, color: PURPLE },
  { key: "debt", label: "Trả nợ /tháng", group: "expenses", icon: CreditCard, color: RED },

  // Quỹ dự phòng hiện có
  { key: "cash", label: "Tiền mặt", group: "current_fund", icon: Coins, color: GREEN },
  { key: "checking", label: "TK thanh toán", group: "current_fund", icon: Building2, color: BLUE },
  { key: "savings", label: "Tiết kiệm dễ rút", group: "current_fund", icon: PiggyBank, color: BRAND },
  { key: "gold", label: "Vàng dễ bán", group: "current_fund", icon: Gem, color: AMBER },
];

const TARGET_PRESETS = [
  { months: 3, label: "3 tháng", desc: "Tối thiểu", color: AMBER },
  { months: 6, label: "6 tháng", desc: "Khuyến nghị", color: GREEN },
  { months: 9, label: "9 tháng", desc: "An toàn cao", color: BLUE },
  { months: 12, label: "12 tháng", desc: "Thoát Nghèo", color: PURPLE },
];

/* ─────────────────────────────────────────────
 *  Helpers
 * ───────────────────────────────────────────── */

/**
 * Iterative compound growth to find # months needed for current+contribution
 * to reach target. Returns Infinity if unreachable within 600 months (50y).
 */
function monthsToFill(
  current: number,
  target: number,
  monthly: number,
  annualRate: number
): number {
  if (current >= target) return 0;
  if (monthly <= 0 && annualRate <= 0) return Infinity;
  let balance = current;
  const r = annualRate / 100 / 12;
  for (let m = 1; m <= 600; m++) {
    balance = balance * (1 + r) + monthly;
    if (balance >= target) return m;
  }
  return Infinity;
}

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

interface FormState {
  values: Record<string, number>;
  targetMonths: number;
  monthlyContrib: number;
  annualRate: number;
}

const DEFAULT_STATE: FormState = {
  values: {},
  targetMonths: 6,
  monthlyContrib: 2_000_000,
  annualRate: 5,
};

export default function EmergencyFundTool() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [touched, setTouched] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      let initial: FormState = DEFAULT_STATE;
      if (cached) {
        const j = JSON.parse(cached);
        if (j && typeof j === "object") initial = { ...DEFAULT_STATE, ...j };
      }
      // URL param override — let other tools deep-link with a preset goal,
      // e.g. /tools/quy-du-phong?target=12 from the 'Thoát Nghèo' milestone.
      const targetParam = searchParams.get("target");
      if (targetParam) {
        const n = parseInt(targetParam, 10);
        if (n === 3 || n === 6 || n === 9 || n === 12) {
          initial = { ...initial, targetMonths: n };
        }
      }
      setForm(initial);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!touched) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // ignore
    }
  }, [form, touched]);

  const setValue = (key: string, raw: string) => {
    setTouched(true);
    const digits = raw.replace(/\D/g, "");
    const n = digits ? parseInt(digits, 10) : 0;
    setForm((f) => ({ ...f, values: { ...f.values, [key]: n } }));
  };

  const updateNum = (key: keyof Omit<FormState, "values">, value: number) => {
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
  const summary = useMemo(() => {
    const monthlyExpense =
      (form.values.fixed || 0) +
      (form.values.variable || 0) +
      (form.values.debt || 0);
    const currentFund =
      (form.values.cash || 0) +
      (form.values.checking || 0) +
      (form.values.savings || 0) +
      (form.values.gold || 0);

    const target = monthlyExpense * form.targetMonths;
    const monthsCovered =
      monthlyExpense > 0 ? currentFund / monthlyExpense : 0;
    const achievement = target > 0 ? Math.round((currentFund / target) * 100) : 0;
    const gap = Math.max(0, target - currentFund);
    const monthsToFillFund = monthsToFill(
      currentFund,
      target,
      form.monthlyContrib,
      form.annualRate
    );

    return {
      monthlyExpense,
      currentFund,
      target,
      monthsCovered,
      achievement,
      gap,
      monthsToFillFund,
    };
  }, [form]);

  const hasInputs = summary.monthlyExpense > 0 || summary.currentFund > 0;
  const willHit = summary.currentFund >= summary.target && summary.target > 0;

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
          Tính <span style={{ color: BRAND }}>Quỹ Dự Phòng</span> Khẩn Cấp
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Tính số tiền cần để trụ <strong className="text-white">3–12 tháng</strong>{" "}
          nếu mất thu nhập đột ngột. Biết đã có bao nhiêu, còn thiếu bao nhiêu,
          bao lâu thì đầy quỹ.
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
              Quỹ hiện có
            </div>
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: willHit ? GREEN : AMBER }}
            >
              {fmtCompact(summary.currentFund)}
            </div>
            <div
              className="text-[10px] mt-1 font-bold uppercase tracking-wider"
              style={{ color: willHit ? GREEN : AMBER }}
            >
              ≈ {summary.monthsCovered.toFixed(1)} tháng chi tiêu
            </div>
          </div>
          <MiniStat
            label="Mục tiêu"
            value={summary.target}
            color={BRAND}
            note={`${form.targetMonths} tháng`}
          />
          <MiniStat
            label="Còn thiếu"
            value={summary.gap}
            color={summary.gap === 0 ? GREEN : RED}
          />
          <MiniStat
            label="Bao lâu đầy"
            value={summary.monthsToFillFund === Infinity ? 0 : summary.monthsToFillFund}
            color={BLUE}
            note={summary.monthsToFillFund === Infinity ? "Không đạt" : "tháng"}
            suffix={summary.monthsToFillFund === Infinity ? "" : ""}
            raw
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Target preset */}
          <div
            className="rounded-xl p-3 sm:p-4"
            style={{ background: "#141414", border: "1px solid #232323" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
              Mục tiêu — bạn muốn trụ bao lâu?
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {TARGET_PRESETS.map((p) => {
                const active = form.targetMonths === p.months;
                return (
                  <button
                    key={p.months}
                    type="button"
                    onClick={() => updateNum("targetMonths", p.months)}
                    className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg transition-colors"
                    style={{
                      background: active ? `${p.color}1a` : "#0e0e0e",
                      border: `1px solid ${active ? `${p.color}77` : "#1f1f1f"}`,
                    }}
                  >
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: active ? p.color : "#fff" }}
                    >
                      {p.months}
                    </span>
                    <span className="text-[9px] text-gray-500 font-medium">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 mt-2.5 pt-2 border-t border-[#1f1f1f] leading-snug">
              💡 Khuyến nghị: 3 tháng cho người độc thân, 6 tháng cho gia đình,
              9-12 tháng cho founder / thu nhập không ổn định.
            </p>
          </div>

          {/* Monthly expenses */}
          <div
            className="rounded-xl p-3 sm:p-4"
            style={{
              background: `linear-gradient(135deg, ${RED}0a, transparent)`,
              border: `1px solid ${RED}33`,
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: RED }}>
              Chi tiêu hàng tháng
            </div>
            <div className="space-y-1.5">
              {FIELDS.filter((f) => f.group === "expenses").map((f) => (
                <FieldRow
                  key={f.key}
                  field={f}
                  value={form.values[f.key] || 0}
                  onChange={(v) => setValue(f.key, v)}
                />
              ))}
            </div>
          </div>

          {/* Current fund */}
          <div
            className="rounded-xl p-3 sm:p-4"
            style={{
              background: `linear-gradient(135deg, ${GREEN}0a, transparent)`,
              border: `1px solid ${GREEN}33`,
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest mb-2.5" style={{ color: GREEN }}>
              Quỹ dự phòng hiện có
            </div>
            <div className="space-y-1.5">
              {FIELDS.filter((f) => f.group === "current_fund").map((f) => (
                <FieldRow
                  key={f.key}
                  field={f}
                  value={form.values[f.key] || 0}
                  onChange={(v) => setValue(f.key, v)}
                />
              ))}
            </div>
          </div>

          {/* Contribution plan */}
          <div
            className="rounded-xl p-3 sm:p-4 space-y-2"
            style={{ background: "#141414", border: "1px solid #232323" }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Kế hoạch đóng góp
            </div>
            <NumberField
              label="Đóng góp /tháng"
              value={form.monthlyContrib}
              onChange={(v) => updateNum("monthlyContrib", v)}
              suffix="₫"
              icon={PiggyBank}
            />
            <NumberField
              label="Lãi suất /năm (gửi NH)"
              value={form.annualRate}
              onChange={(v) => updateNum("annualRate", Math.min(20, v))}
              suffix="%"
              icon={Percent}
              raw
            />
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
                Anh/chị nhập chi tiêu hàng tháng và quỹ hiện có ở bên trái.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              {/* 2 donut row */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Achievement */}
                <ReportCard
                  title="Mức độ đầy quỹ"
                  hint={`So với mục tiêu ${form.targetMonths} tháng chi tiêu`}
                  icon={Shield}
                  iconColor={willHit ? GREEN : AMBER}
                >
                  <AchievementDonut
                    achievement={summary.achievement}
                    willHit={willHit}
                    monthsCovered={summary.monthsCovered}
                    target={form.targetMonths}
                  />
                </ReportCard>

                {/* Composition */}
                <ReportCard
                  title="Cơ cấu quỹ hiện có"
                  hint="Phân bổ theo loại tài sản thanh khoản"
                  icon={PieChart}
                  iconColor={GREEN}
                >
                  {summary.currentFund > 0 ? (
                    <CompositionDonut
                      values={form.values}
                      total={summary.currentFund}
                    />
                  ) : (
                    <EmptyReport msg="Chưa có quỹ" />
                  )}
                </ReportCard>
              </div>

              {/* Time to fill bar */}
              <FillProjectionCard summary={summary} form={form} />

              {/* What-if scenarios */}
              <WhatIfContributions summary={summary} form={form} />

              {/* Tips */}
              <ActionTips summary={summary} form={form} />

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

function NumberField({
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
    if (raw) {
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
          className="w-full pl-6 pr-9 py-1.5 rounded-md text-[12px] font-bold text-white text-right outline-none"
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
    ? value > 0
      ? `${value}${suffix ?? ""}`
      : "—"
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

function AchievementDonut({
  achievement,
  willHit,
  monthsCovered,
  target,
}: {
  achievement: number;
  willHit: boolean;
  monthsCovered: number;
  target: number;
}) {
  const color = willHit ? GREEN : achievement >= 50 ? AMBER : RED;
  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={Math.min(100, achievement)}
        color={color}
        size={170}
        thickness={24}
        centerTop="Đầy quỹ"
        centerValue={`${Math.min(999, achievement)}%`}
        centerSub={`${monthsCovered.toFixed(1)}/${target} tháng`}
      />
      <p
        className="mt-3 text-[11px] font-bold text-center"
        style={{ color }}
      >
        {willHit
          ? "✓ Quỹ đã đủ — anh/chị an toàn"
          : achievement >= 70
            ? "Gần đầy — bổ sung thêm chút nữa"
            : achievement >= 30
              ? "Quỹ còn mỏng — cần đóng góp đều"
              : "Quỹ rất mỏng — 1 cú sốc là khủng hoảng"}
      </p>
    </div>
  );
}

const COMP_LABELS: Record<string, string> = {
  cash: "Tiền mặt",
  checking: "TK thanh toán",
  savings: "Tiết kiệm",
  gold: "Vàng",
};
const COMP_COLORS: Record<string, string> = {
  cash: GREEN,
  checking: BLUE,
  savings: BRAND,
  gold: AMBER,
};

function CompositionDonut({
  values,
  total,
}: {
  values: Record<string, number>;
  total: number;
}) {
  const slices = ["cash", "checking", "savings", "gold"].map((k) => ({
    value: values[k] || 0,
    color: COMP_COLORS[k],
    label: COMP_LABELS[k],
  }));
  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng quỹ"
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
              <span className="text-white font-bold">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FillProjectionCard({
  summary,
  form,
}: {
  summary: {
    currentFund: number;
    target: number;
    gap: number;
    monthsToFillFund: number;
  };
  form: FormState;
}) {
  if (summary.target <= 0) return null;

  const finite = summary.monthsToFillFund !== Infinity;
  const years = finite ? Math.floor(summary.monthsToFillFund / 12) : 0;
  const months = finite ? summary.monthsToFillFund % 12 : 0;
  const timeLabel = !finite
    ? "Không đạt được"
    : summary.monthsToFillFund === 0
      ? "Đã đầy"
      : years > 0
        ? `${years} năm ${months > 0 ? `${months} tháng` : ""}`
        : `${summary.monthsToFillFund} tháng`;

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} style={{ color: BLUE }} />
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          Lộ trình đầy quỹ
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <ProgressStat
          label="Còn thiếu"
          value={fmtCompact(summary.gap)}
          color={summary.gap === 0 ? GREEN : AMBER}
        />
        <ProgressStat
          label="Đóng góp /tháng"
          value={fmtCompact(form.monthlyContrib)}
          color={BRAND}
        />
        <ProgressStat
          label="Thời gian dự kiến"
          value={timeLabel}
          color={finite ? GREEN : RED}
        />
      </div>

      {/* Visual bar of fund progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>{fmtCompact(summary.currentFund)}</span>
          <span>{fmtCompact(summary.target)}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "#0a0a0a" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (summary.currentFund / Math.max(1, summary.target)) * 100)}%`,
              background:
                summary.currentFund >= summary.target
                  ? GREEN
                  : `linear-gradient(90deg, ${AMBER}, ${BRAND})`,
            }}
          />
        </div>
        <div className="text-[10px] text-gray-500 text-center">
          {Math.round((summary.currentFund / Math.max(1, summary.target)) * 100)}% đã đầy
        </div>
      </div>

      {!finite && form.monthlyContrib <= 0 && (
        <p className="text-[11px] text-red-400 mt-3 leading-relaxed">
          ⚠ Anh/chị chưa đóng góp gì /tháng — quỹ sẽ không thể đầy được nếu không
          bắt đầu tiết kiệm.
        </p>
      )}
    </div>
  );
}

function ProgressStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
    >
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
        {label}
      </div>
      <div className="text-base font-extrabold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function WhatIfContributions({
  summary,
  form,
}: {
  summary: { gap: number; currentFund: number; target: number };
  form: FormState;
}) {
  if (summary.target <= 0 || summary.gap <= 0) return null;

  const baseMonthly = Math.max(form.monthlyContrib, 500_000);
  const scenarios = [
    { label: "Đóng ít", monthly: Math.round(baseMonthly * 0.5), color: AMBER },
    { label: "Đóng đang đặt", monthly: form.monthlyContrib, color: BRAND, highlight: true },
    { label: "Đóng gấp đôi", monthly: baseMonthly * 2, color: GREEN },
  ];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: BRAND }} />
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          What-if — nếu đóng góp khác đi
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {scenarios.map((s, i) => {
          const m = monthsToFill(
            summary.currentFund,
            summary.target,
            s.monthly,
            form.annualRate
          );
          const finite = m !== Infinity;
          return (
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
              <div className="text-base font-extrabold text-white mb-1">
                {fmtCompact(s.monthly)}/tháng
              </div>
              <div className="text-[11px] text-gray-400">
                Đầy quỹ sau{" "}
                <strong className="text-white">
                  {!finite
                    ? "∞"
                    : m === 0
                      ? "0"
                      : m < 12
                        ? `${m} tháng`
                        : `${(m / 12).toFixed(1)} năm`}
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionTips({
  summary,
  form,
}: {
  summary: {
    monthsCovered: number;
    monthlyExpense: number;
    currentFund: number;
    target: number;
    monthsToFillFund: number;
  };
  form: FormState;
}) {
  if (summary.monthlyExpense <= 0) return null;
  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];

  if (summary.monthsCovered < 1) {
    tips.push({
      type: "warn",
      text: `Quỹ chỉ trụ được ${summary.monthsCovered.toFixed(1)} tháng — quá rủi ro. Ưu tiên xây quỹ trước khi đầu tư bất cứ thứ gì.`,
    });
  } else if (summary.monthsCovered >= form.targetMonths) {
    tips.push({
      type: "ok",
      text: `Quỹ đủ ${summary.monthsCovered.toFixed(1)} tháng chi tiêu — đã vượt mục tiêu. Có thể bắt đầu chuyển dư sang đầu tư dài hạn.`,
    });
  } else {
    tips.push({
      type: "info",
      text: `Quỹ hiện trụ được ${summary.monthsCovered.toFixed(1)} tháng — mục tiêu ${form.targetMonths} tháng. Tiếp tục đóng góp đều đặn.`,
    });
  }

  if (form.monthlyContrib > 0 && summary.monthsToFillFund > 36) {
    tips.push({
      type: "info",
      text: `Với mức đóng hiện tại, mất hơn 3 năm để đầy quỹ. Cân nhắc tăng đóng góp hoặc tạm hạ mục tiêu xuống 3 tháng trước.`,
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
