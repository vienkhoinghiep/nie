"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Coins,
  TrendingUp,
  Building2,
  Car,
  CreditCard,
  Landmark,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  PieChart,
  BarChart3,
  Scale,
  Wallet,
  Banknote,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_balance_v1";

/* ─────────────────────────────────────────────
 *  Field config
 * ───────────────────────────────────────────── */

type FieldGroup = "liquid" | "growth" | "cashflow" | "consumption" | "short_debt" | "long_debt";

interface Field {
  key: string;
  label: string;
  group: FieldGroup;
}

const FIELDS: Field[] = [
  // Tài sản thanh khoản
  { key: "cash", label: "Tiền mặt", group: "liquid" },
  { key: "checking", label: "Tài khoản thanh toán", group: "liquid" },
  { key: "savings", label: "Tiết kiệm ngân hàng", group: "liquid" },
  { key: "gold", label: "Vàng (SJC, nhẫn)", group: "liquid" },

  // Tài sản tăng trưởng (Đầu tư)
  { key: "stocks", label: "Cổ phiếu", group: "growth" },
  { key: "funds", label: "Chứng chỉ quỹ", group: "growth" },
  { key: "bonds", label: "Trái phiếu", group: "growth" },
  { key: "crypto", label: "Crypto", group: "growth" },

  // Tài sản dòng tiền
  { key: "rental", label: "BĐS cho thuê", group: "cashflow" },
  { key: "business_own", label: "Doanh nghiệp sở hữu", group: "cashflow" },
  { key: "intellectual", label: "Tài sản trí tuệ", group: "cashflow" },

  // Tài sản tiêu sản
  { key: "residence", label: "Nhà để ở", group: "consumption" },
  { key: "vehicle", label: "Xe để đi", group: "consumption" },
  { key: "personal_items", label: "Đồ đạc cá nhân", group: "consumption" },

  // Nợ ngắn hạn
  { key: "credit_card", label: "Thẻ tín dụng", group: "short_debt" },
  { key: "consumer_loan", label: "Vay tiêu dùng", group: "short_debt" },
  { key: "installment", label: "Mua trả góp", group: "short_debt" },

  // Nợ dài hạn
  { key: "mortgage", label: "Vay mua nhà", group: "long_debt" },
  { key: "car_loan", label: "Vay mua xe", group: "long_debt" },
  { key: "business_loan", label: "Vay đầu tư KD", group: "long_debt" },
  { key: "other_loan", label: "Nợ khác", group: "long_debt" },
];

const ASSET_GROUPS = [
  {
    key: "liquid" as FieldGroup,
    label: "Thanh khoản",
    icon: Coins,
    color: BLUE,
    desc: "Tiền + sản phẩm dễ rút",
  },
  {
    key: "growth" as FieldGroup,
    label: "Tăng trưởng",
    icon: TrendingUp,
    color: GREEN,
    desc: "Cổ phiếu, quỹ, trái phiếu",
  },
  {
    key: "cashflow" as FieldGroup,
    label: "Dòng tiền",
    icon: Building2,
    color: BRAND,
    desc: "BĐS cho thuê, doanh nghiệp",
  },
  {
    key: "consumption" as FieldGroup,
    label: "Tiêu sản",
    icon: Car,
    color: PURPLE,
    desc: "Nhà ở, xe — không sinh lời",
  },
];

const DEBT_GROUPS = [
  {
    key: "short_debt" as FieldGroup,
    label: "Nợ ngắn hạn",
    icon: CreditCard,
    color: AMBER,
    desc: "Thẻ TD, trả góp (≤ 1 năm)",
  },
  {
    key: "long_debt" as FieldGroup,
    label: "Nợ dài hạn",
    icon: Landmark,
    color: RED,
    desc: "Vay mua nhà, xe, KD",
  },
];

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function BalanceSheetTool() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const j = JSON.parse(cached);
        if (j && typeof j === "object") setValues(j as Record<string, number>);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!touched) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch {
      // ignore
    }
  }, [values, touched]);

  const set = (key: string, raw: string) => {
    setTouched(true);
    const digits = raw.replace(/\D/g, "");
    const n = digits ? parseInt(digits, 10) : 0;
    setValues((v) => ({ ...v, [key]: n }));
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Xoá toàn bộ dữ liệu đã nhập?")
    )
      return;
    setValues({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  /* ─── Compute ─── */
  const summary = useMemo(() => {
    const sumOf = (g: FieldGroup) =>
      FIELDS.filter((f) => f.group === g).reduce(
        (s, f) => s + (values[f.key] || 0),
        0
      );

    const liquid = sumOf("liquid");
    const growth = sumOf("growth");
    const cashflow = sumOf("cashflow");
    const consumption = sumOf("consumption");
    const shortDebt = sumOf("short_debt");
    const longDebt = sumOf("long_debt");

    const totalAssets = liquid + growth + cashflow + consumption;
    const totalDebt = shortDebt + longDebt;
    const netWorth = totalAssets - totalDebt;

    const liquidityRate =
      totalAssets > 0 ? Math.round((liquid / totalAssets) * 100) : 0;
    const growthRate =
      totalAssets > 0 ? Math.round((growth / totalAssets) * 100) : 0;
    const cashflowRate =
      totalAssets > 0 ? Math.round((cashflow / totalAssets) * 100) : 0;
    const consumptionRate =
      totalAssets > 0 ? Math.round((consumption / totalAssets) * 100) : 0;
    const debtRatio =
      totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0;

    return {
      liquid,
      growth,
      cashflow,
      consumption,
      shortDebt,
      longDebt,
      totalAssets,
      totalDebt,
      netWorth,
      liquidityRate,
      growthRate,
      cashflowRate,
      consumptionRate,
      debtRatio,
    };
  }, [values]);

  const netWorthPositive = summary.netWorth >= 0;
  const hasInputs = summary.totalAssets > 0 || summary.totalDebt > 0;

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
          <Scale size={11} />
          Công cụ miễn phí
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Cân Đối <span style={{ color: BRAND }}>Tài Sản</span> Cá Nhân
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Tính <strong className="text-white">tài sản ròng (net worth)</strong> và
          phân tích cơ cấu tài sản theo 4 nhóm chuẩn — Thanh khoản · Tăng
          trưởng · Dòng tiền · Tiêu sản.
        </p>
      </div>

      {/* Net worth card — full width */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center"
        style={{
          background: netWorthPositive
            ? `linear-gradient(135deg, ${GREEN}14, transparent)`
            : `linear-gradient(135deg, ${RED}14, transparent)`,
          border: `1px solid ${netWorthPositive ? GREEN : RED}55`,
        }}
      >
        <div className="col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Tài sản ròng (Net Worth)
          </div>
          <div
            className="text-2xl sm:text-3xl font-extrabold leading-tight"
            style={{ color: netWorthPositive ? GREEN : RED }}
          >
            {netWorthPositive ? "" : "-"}
            {fmtVND(Math.abs(summary.netWorth))}
          </div>
        </div>
        <MiniStat label="Tài sản" value={summary.totalAssets} color={GREEN} />
        <MiniStat label="Nợ" value={summary.totalDebt} color={RED} />
        <MiniStat label="Đòn bẩy" value={summary.debtRatio} suffix="%" color={summary.debtRatio <= 50 ? GREEN : summary.debtRatio <= 70 ? AMBER : RED} />
      </div>

      {/* Two-col layout */}
      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Assets section */}
          <div
            className="rounded-xl p-3 sm:p-4"
            style={{
              background: `linear-gradient(135deg, ${GREEN}0a, transparent)`,
              border: `1px solid ${GREEN}33`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Banknote size={13} style={{ color: GREEN }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>
                Tài sản hiện có
              </span>
            </div>
            <div className="space-y-3">
              {ASSET_GROUPS.map((g) => (
                <InputGroup
                  key={g.key}
                  group={g}
                  fields={FIELDS.filter((f) => f.group === g.key)}
                  values={values}
                  onChange={set}
                />
              ))}
            </div>
          </div>

          {/* Debt section */}
          <div
            className="rounded-xl p-3 sm:p-4"
            style={{
              background: `linear-gradient(135deg, ${RED}0a, transparent)`,
              border: `1px solid ${RED}33`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CreditCard size={13} style={{ color: RED }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: RED }}>
                Nợ phải trả
              </span>
            </div>
            <div className="space-y-3">
              {DEBT_GROUPS.map((g) => (
                <InputGroup
                  key={g.key}
                  group={g}
                  fields={FIELDS.filter((f) => f.group === g.key)}
                  values={values}
                  onChange={set}
                />
              ))}
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between gap-3 pt-1 px-1">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-red-400 transition-colors"
            >
              <RefreshCw size={11} />
              Xoá tất cả
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
                Anh/chị nhập tài sản và nợ ở bảng bên trái, biểu đồ tròn sẽ tự
                cập nhật.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              {/* 2x2 donut grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* 1. Cơ cấu tài sản */}
                <ReportCard
                  title="Cơ cấu tài sản"
                  hint="4 nhóm tài sản chuẩn"
                  icon={PieChart}
                  iconColor={GREEN}
                >
                  {summary.totalAssets > 0 ? (
                    <AssetBreakdownDonut summary={summary} />
                  ) : (
                    <EmptyReport msg="Chưa có tài sản" />
                  )}
                </ReportCard>

                {/* 2. Cơ cấu nợ */}
                <ReportCard
                  title="Cơ cấu nợ"
                  hint="Ngắn hạn vs Dài hạn"
                  icon={BarChart3}
                  iconColor={RED}
                >
                  {summary.totalDebt > 0 ? (
                    <DebtBreakdownDonut summary={summary} />
                  ) : (
                    <EmptyReport msg="Không có nợ — rất tốt 🎉" />
                  )}
                </ReportCard>

                {/* 3. Tỉ lệ thanh khoản */}
                <ReportCard
                  title="Tỉ lệ thanh khoản"
                  hint="Mục tiêu ≈ 20% tổng TS"
                  icon={Wallet}
                  iconColor={BLUE}
                >
                  <LiquidityRingDonut summary={summary} />
                </ReportCard>

                {/* 4. Tỉ lệ đòn bẩy */}
                <ReportCard
                  title="Tỉ lệ đòn bẩy nợ"
                  hint="Nợ / Tổng TS — an toàn < 50%"
                  icon={Scale}
                  iconColor={AMBER}
                >
                  <LeverageRingDonut summary={summary} />
                </ReportCard>
              </div>

              {/* Allocation detail bars */}
              {summary.totalAssets > 0 && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#141414", border: "1px solid #232323" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} style={{ color: BRAND }} />
                    <div className="text-xs font-bold uppercase tracking-wider text-white">
                      Chi tiết 4 nhóm tài sản
                    </div>
                  </div>
                  <div className="space-y-3">
                    <AllocBar
                      label="Thanh khoản (mục tiêu ≈ 20%)"
                      actualPct={summary.liquidityRate}
                      target={20}
                      tolerance={10}
                      value={summary.liquid}
                      color={BLUE}
                    />
                    <AllocBar
                      label="Tăng trưởng (KN ≥ 30%)"
                      actualPct={summary.growthRate}
                      target={30}
                      tolerance={50}
                      value={summary.growth}
                      color={GREEN}
                      higherBetter
                    />
                    <AllocBar
                      label="Dòng tiền (KN ≥ 20%)"
                      actualPct={summary.cashflowRate}
                      target={20}
                      tolerance={50}
                      value={summary.cashflow}
                      color={BRAND}
                      higherBetter
                    />
                    <AllocBar
                      label="Tiêu sản (KN ≤ 30%)"
                      actualPct={summary.consumptionRate}
                      target={30}
                      tolerance={20}
                      value={summary.consumption}
                      color={PURPLE}
                      lowerBetter
                    />
                  </div>
                </div>
              )}

              {/* Tips */}
              <ActionTips summary={summary} />

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
                      Bước tiếp theo: Đo sức khoẻ tài chính
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      11 chỉ số chuẩn + radar map + lời khuyên cá nhân hoá
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

function InputGroup({
  group,
  fields,
  values,
  onChange,
}: {
  group: {
    key: FieldGroup;
    label: string;
    icon: typeof Coins;
    color: string;
    desc: string;
  };
  fields: Field[];
  values: Record<string, number>;
  onChange: (key: string, raw: string) => void;
}) {
  const Icon = group.icon;
  const total = fields.reduce((s, f) => s + (values[f.key] || 0), 0);
  return (
    <div
      className="rounded-lg p-2.5"
      style={{ background: "#0e0e0e", border: "1px solid #1f1f1f" }}
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: `${group.color}1a`, color: group.color }}
          >
            <Icon size={12} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-white leading-tight truncate">
              {group.label}
            </div>
            <div className="text-[9px] text-gray-500 truncate">{group.desc}</div>
          </div>
        </div>
        <span
          className="text-[11px] font-extrabold whitespace-nowrap"
          style={{ color: group.color }}
        >
          {fmtCompact(total)}
        </span>
      </div>
      <div className="space-y-1">
        {fields.map((f) => (
          <FieldRow
            key={f.key}
            field={f}
            value={values[f.key] || 0}
            onChange={(v) => onChange(f.key, v)}
            accent={group.color}
          />
        ))}
      </div>
    </div>
  );
}

function FieldRow({
  field,
  value,
  onChange,
  accent,
}: {
  field: Field;
  value: number;
  onChange: (raw: string) => void;
  accent: string;
}) {
  const display = value > 0 ? value.toLocaleString("vi-VN") : "";
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <label className="text-[10.5px] text-gray-400 truncate">{field.label}</label>
      <div className="relative w-[120px]">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full px-2 py-1.5 pr-5 rounded-md text-[12px] font-bold text-white text-right outline-none transition-colors"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${value > 0 ? `${accent}77` : "#2a2a2a"}`,
          }}
        />
        <span
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium pointer-events-none"
          style={{ color: value > 0 ? accent : "#525252" }}
        >
          ₫
        </span>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">
        {label}
      </div>
      <div className="text-base sm:text-lg font-extrabold" style={{ color }}>
        {suffix ? `${value}${suffix}` : fmtCompact(value)}
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
  icon: typeof Coins;
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

/* ─── Donut renderers ─── */

function AssetBreakdownDonut({
  summary,
}: {
  summary: {
    liquid: number;
    growth: number;
    cashflow: number;
    consumption: number;
    totalAssets: number;
  };
}) {
  const slices = [
    { value: summary.liquid, color: BLUE, label: "Thanh khoản" },
    { value: summary.growth, color: GREEN, label: "Tăng trưởng" },
    { value: summary.cashflow, color: BRAND, label: "Dòng tiền" },
    { value: summary.consumption, color: PURPLE, label: "Tiêu sản" },
  ];
  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng TS"
        centerValue={fmtCompact(summary.totalAssets)}
      />
      <ul className="w-full mt-3 space-y-1">
        {slices.map((s) => {
          const pct = summary.totalAssets > 0
            ? Math.round((s.value / summary.totalAssets) * 100)
            : 0;
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

function DebtBreakdownDonut({
  summary,
}: {
  summary: { shortDebt: number; longDebt: number; totalDebt: number };
}) {
  const slices = [
    { value: summary.shortDebt, color: AMBER, label: "Ngắn hạn" },
    { value: summary.longDebt, color: RED, label: "Dài hạn" },
  ];
  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng nợ"
        centerValue={fmtCompact(summary.totalDebt)}
      />
      <ul className="w-full mt-3 space-y-1">
        {slices.map((s) => {
          const pct =
            summary.totalDebt > 0
              ? Math.round((s.value / summary.totalDebt) * 100)
              : 0;
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

function LiquidityRingDonut({
  summary,
}: {
  summary: { liquidityRate: number; liquid: number };
}) {
  const target = 20;
  const rate = summary.liquidityRate;
  const ok = rate >= target - 5 && rate <= target + 10;
  const color = ok ? GREEN : rate < target - 5 ? RED : AMBER;
  const progressPct = Math.min(100, (rate / target) * 100);

  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={progressPct}
        color={color}
        size={170}
        thickness={24}
        centerTop="Hiện tại"
        centerValue={`${rate}%`}
        centerSub={`mục tiêu ${target}%`}
      />
      <div className="w-full mt-3 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Số tiền thanh khoản</span>
          <span className="text-white font-bold">{fmtCompact(summary.liquid)}</span>
        </div>
        <p className="text-[10px] mt-1 pt-1.5 border-t border-[#1f1f1f] leading-snug" style={{ color }}>
          {rate < target - 5
            ? "Thanh khoản thấp — khó xử lý khi cần tiền gấp"
            : rate > target + 10
              ? "Thanh khoản quá cao — đang bỏ lỡ cơ hội đầu tư"
              : "Thanh khoản cân đối — đủ linh hoạt"}
        </p>
      </div>
    </div>
  );
}

function LeverageRingDonut({
  summary,
}: {
  summary: { debtRatio: number; totalDebt: number; totalAssets: number };
}) {
  const safe = 50;
  const rate = summary.debtRatio;
  const color = rate <= safe ? GREEN : rate <= 70 ? AMBER : RED;
  const progressPct = Math.min(100, rate);

  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={progressPct}
        color={color}
        size={170}
        thickness={24}
        centerTop="Đòn bẩy"
        centerValue={`${rate}%`}
        centerSub={`an toàn ≤ ${safe}%`}
      />
      <div className="w-full mt-3 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Tổng nợ</span>
          <span className="text-white font-bold">{fmtCompact(summary.totalDebt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Tổng tài sản</span>
          <span className="font-bold text-gray-300">{fmtCompact(summary.totalAssets)}</span>
        </div>
        <p className="text-[10px] mt-1 pt-1.5 border-t border-[#1f1f1f] leading-snug" style={{ color }}>
          {rate === 0
            ? "Không có nợ — hiếm thấy"
            : rate <= safe
              ? "An toàn — dưới khuyến nghị"
              : rate <= 70
                ? "Đòn bẩy cao — cẩn trọng"
                : "Vùng nguy hiểm — tái cơ cấu nợ ngay"}
        </p>
      </div>
    </div>
  );
}

function AllocBar({
  label,
  actualPct,
  target,
  tolerance,
  value,
  color,
  higherBetter,
  lowerBetter,
}: {
  label: string;
  actualPct: number;
  target: number;
  tolerance: number;
  value: number;
  color: string;
  higherBetter?: boolean;
  lowerBetter?: boolean;
}) {
  let verdict: "ok" | "low" | "high";
  if (higherBetter) {
    verdict = actualPct >= target ? "ok" : "low";
  } else if (lowerBetter) {
    verdict = actualPct <= target ? "ok" : "high";
  } else {
    verdict = Math.abs(actualPct - target) <= tolerance ? "ok" : actualPct > target ? "high" : "low";
  }
  const txtColor = verdict === "ok" ? GREEN : verdict === "high" ? RED : AMBER;
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-[11px]">
        <span className="flex items-center gap-1.5 text-gray-300 min-w-0">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="truncate">{label}</span>
        </span>
        <span className="whitespace-nowrap text-gray-500 text-[10px]">
          {fmtCompact(value)}
        </span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden mb-1" style={{ background: "#0a0a0a" }}>
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{
            left: `${Math.min(100, target)}%`,
            background: "#3a3a3a",
            zIndex: 2,
          }}
        />
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, actualPct)}%`,
            background: color,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold" style={{ color: txtColor }}>
          {actualPct}%
        </span>
        <span className="text-gray-500">
          {higherBetter ? `KN ≥ ${target}%` : lowerBetter ? `KN ≤ ${target}%` : `KN ≈ ${target}%`}
        </span>
      </div>
    </div>
  );
}

function ActionTips({
  summary,
}: {
  summary: {
    totalAssets: number;
    totalDebt: number;
    netWorth: number;
    debtRatio: number;
    liquidityRate: number;
    growthRate: number;
    cashflowRate: number;
    consumptionRate: number;
  };
}) {
  if (summary.totalAssets <= 0 && summary.totalDebt <= 0) return null;

  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];

  if (summary.netWorth < 0) {
    tips.push({
      type: "warn",
      text: `Tài sản ròng đang âm ${fmtVND(Math.abs(summary.netWorth))} — nợ cao hơn tài sản. Ưu tiên trả nợ + dừng mở rộng.`,
    });
  } else if (summary.totalAssets > 0) {
    tips.push({
      type: "ok",
      text: `Tài sản ròng dương ${fmtVND(summary.netWorth)} — anh/chị đang đi đúng hướng tích lũy.`,
    });
  }

  if (summary.debtRatio > 70) {
    tips.push({
      type: "warn",
      text: `Tỉ lệ đòn bẩy ${summary.debtRatio}% — vùng nguy hiểm. Tái cơ cấu nợ hoặc bán bớt tiêu sản để giảm gánh nặng.`,
    });
  } else if (summary.debtRatio > 50) {
    tips.push({
      type: "info",
      text: `Đòn bẩy ${summary.debtRatio}% — cao hơn khuyến nghị 50%. Cân nhắc trả dứt 1-2 khoản nợ ngắn hạn trước.`,
    });
  }

  if (summary.totalAssets > 0) {
    if (summary.liquidityRate < 10) {
      tips.push({
        type: "warn",
        text: `Thanh khoản chỉ ${summary.liquidityRate}% tổng TS — quá mỏng. Cần ít nhất 15-20% để xử lý tình huống bất ngờ.`,
      });
    }
    if (summary.growthRate < 20 && summary.cashflowRate < 10) {
      tips.push({
        type: "info",
        text: `Đầu tư + dòng tiền chỉ ${summary.growthRate + summary.cashflowRate}% — tài sản đang ngủ. Cân nhắc DCA cổ phiếu hoặc đầu tư BĐS cho thuê.`,
      });
    }
    if (summary.consumptionRate > 50) {
      tips.push({
        type: "warn",
        text: `Tiêu sản (nhà ở + xe) chiếm ${summary.consumptionRate}% — quá cao. Tiền đang "ngủ" trong tài sản không sinh lời.`,
      });
    }
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
