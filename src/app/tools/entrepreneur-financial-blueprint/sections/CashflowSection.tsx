"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  PiggyBank,
  Home,
  Zap,
  GraduationCap,
  Shield,
  Banknote,
  Car,
  Utensils,
  ShoppingBag,
  Music,
  Heart,
  Gift,
  MoreHorizontal,
  Wallet,
  Briefcase,
  CheckCircle2,
  Building2,
  Award,
  ChartBar,
  Sprout,
  Coins,
  Key,
  ScrollText,
  Sparkles,
  Users2,
} from "lucide-react";
import type {
  BusinessDependency,
  CashflowConsistency,
  CashflowData,
  CashflowFixedCosts,
  CashflowIncome,
  CashflowSavings,
  CashflowVariableCosts,
  JobStability,
  PassiveSustainability,
  SalaryGrowth,
} from "@/lib/blueprint/types";
import CashflowAnalysis from "./CashflowAnalysis";

const GREEN = "#22c55e";
const RED = "#ef4444";
const BRAND = "#2563EB";
const BLUE = "#3b82f6";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";

interface Props {
  data: CashflowData;
  onChange: (next: CashflowData) => void;
  onComplete: () => void;
  hideCompleteCta?: boolean;
}

interface FieldDef<K> {
  key: K;
  label: string;
  icon: typeof Wallet;
  color: string;
}

// Legacy fields removed — new schema uses 3 grouped subsections (Salary/Business/Passive)

const SALARY_NUM_FIELDS: FieldDef<keyof CashflowIncome>[] = [
  { key: "salaryBase",  label: "Lương cứng /tháng",                  icon: Wallet,     color: GREEN },
  { key: "salaryBonus", label: "Thưởng + hoa hồng + phụ cấp",         icon: Award,      color: GREEN },
];

const BUSINESS_NUM_FIELDS: FieldDef<keyof CashflowIncome>[] = [
  { key: "businessProfit", label: "Lợi nhuận ròng /tháng", icon: ChartBar, color: BRAND },
];

const SAVINGS_FIELDS: FieldDef<keyof CashflowSavings>[] = [
  { key: "saving",     label: "Tiết kiệm /tháng", icon: PiggyBank,  color: BLUE },
  { key: "investment", label: "Đầu tư /tháng",    icon: TrendingUp, color: GREEN },
];

const PASSIVE_NUM_FIELDS: FieldDef<keyof CashflowIncome>[] = [
  { key: "passiveRental",     label: "Cho thuê tài sản",                  icon: Key,        color: PURPLE },
  { key: "passiveInvestment", label: "Lãi đầu tư · cổ tức · trái phiếu",  icon: Coins,      color: PURPLE },
  { key: "passiveRoyalty",    label: "Bản quyền · affiliate · hệ thống",  icon: ScrollText, color: PURPLE },
];

// Select dropdown options
const JOB_STABILITY_OPTIONS: { value: JobStability; label: string }[] = [
  { value: "low",    label: "Thấp · biến động"            },
  { value: "medium", label: "Trung bình · tạm ổn"         },
  { value: "high",   label: "Cao · rất ổn định"           },
];

const SALARY_GROWTH_OPTIONS: { value: SalaryGrowth; label: string }[] = [
  { value: "none",   label: "Không kỳ vọng"             },
  { value: "small",  label: "Tăng nhẹ < 10%"            },
  { value: "medium", label: "Tăng vừa 10-30%"           },
  { value: "high",   label: "Tăng mạnh ≥ 30%"            },
];

const BIZ_CASHFLOW_OPTIONS: { value: CashflowConsistency; label: string }[] = [
  { value: "no",       label: "Không đều · biến động"  },
  { value: "somewhat", label: "Tạm ổn · có lúc khó"    },
  { value: "yes",      label: "Đều đặn · dự đoán được" },
];

const BIZ_DEPEND_OPTIONS: { value: BusinessDependency; label: string }[] = [
  { value: "fully",     label: "Hoàn toàn phụ thuộc vào tôi" },
  { value: "partially", label: "Phụ thuộc 1 phần · có hỗ trợ" },
  { value: "system",    label: "Đã có hệ thống · vận hành tự" },
];

const PASSIVE_SUSTAIN_OPTIONS: { value: PassiveSustainability; label: string }[] = [
  { value: "low",    label: "Thấp · rủi ro biến mất"   },
  { value: "medium", label: "Trung bình · cần theo dõi" },
  { value: "high",   label: "Cao · bền vững nhiều năm"   },
];

const FIXED_FIELDS: FieldDef<keyof CashflowFixedCosts>[] = [
  { key: "housing", label: "Nhà ở (thuê / vay)", icon: Home, color: AMBER },
  { key: "utilities", label: "Điện · nước · net", icon: Zap, color: AMBER },
  { key: "education", label: "Học con", icon: GraduationCap, color: BLUE },
  { key: "insurance", label: "Bảo hiểm", icon: Shield, color: GREEN },
  { key: "debt", label: "Trả nợ", icon: Banknote, color: RED },
  { key: "transport", label: "Đi lại", icon: Car, color: BLUE },
];

const VAR_FIELDS: FieldDef<keyof CashflowVariableCosts>[] = [
  { key: "food", label: "Ăn uống", icon: Utensils, color: AMBER },
  { key: "shopping", label: "Mua sắm", icon: ShoppingBag, color: PURPLE },
  { key: "entertainment", label: "Giải trí", icon: Music, color: PURPLE },
  { key: "healthcare", label: "Y tế", icon: Heart, color: RED },
  { key: "giving", label: "Cho đi · biếu", icon: Gift, color: AMBER },
  { key: "other", label: "Chi khác", icon: MoreHorizontal, color: BLUE },
];

export default function CashflowSection({
  data,
  onChange,
  onComplete,
  hideCompleteCta,
}: Props) {
  const setIncome = <K extends keyof CashflowIncome>(
    k: K,
    v: CashflowIncome[K]
  ) => {
    onChange({
      ...data,
      income: { ...(data.income ?? {}), [k]: v },
    });
  };
  const setFixed = <K extends keyof CashflowFixedCosts>(
    k: K,
    v: number | undefined
  ) => {
    onChange({
      ...data,
      fixedCosts: { ...(data.fixedCosts ?? {}), [k]: v },
    });
  };
  const setVar = <K extends keyof CashflowVariableCosts>(
    k: K,
    v: number | undefined
  ) => {
    onChange({
      ...data,
      variableCosts: { ...(data.variableCosts ?? {}), [k]: v },
    });
  };
  const setSavings = <K extends keyof CashflowSavings>(
    k: K,
    v: number | undefined
  ) => {
    onChange({
      ...data,
      savings: { ...(data.savings ?? {}), [k]: v },
    });
  };

  const stats = useMemo(() => {
    const sum = (o: object | undefined) =>
      Object.values(o ?? {}).reduce<number>(
        (s, v) => s + (typeof v === "number" ? v : 0),
        0
      );
    const totalIncome = sum(data.income);
    const totalFixed = sum(data.fixedCosts);
    const totalVar = sum(data.variableCosts);
    const totalExpense = totalFixed + totalVar;
    const netCashflow = totalIncome - totalExpense;
    const savingRate =
      totalIncome > 0
        ? Math.round((netCashflow / totalIncome) * 100)
        : 0;
    return { totalIncome, totalFixed, totalVar, totalExpense, netCashflow, savingRate };
  }, [data]);

  const hasData = stats.totalIncome > 0 || stats.totalExpense > 0;

  return (
    <div className="space-y-4">
      {/* Big summary */}
      <div
        className="rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5"
        style={{
          background:
            stats.netCashflow >= 0
              ? `linear-gradient(135deg, ${GREEN}14, transparent)`
              : `linear-gradient(135deg, ${RED}14, transparent)`,
          border: `1px solid ${stats.netCashflow >= 0 ? GREEN : RED}55`,
        }}
      >
        <Stat
          label="Tổng thu /tháng"
          value={stats.totalIncome}
          color={GREEN}
          icon={TrendingUp}
        />
        <Stat
          label="Tổng chi /tháng"
          value={stats.totalExpense}
          color={RED}
          icon={TrendingDown}
          sub={`${fmtCompact(stats.totalFixed)} cố định + ${fmtCompact(stats.totalVar)} biến`}
        />
        <Stat
          label="Dòng tiền ròng"
          value={stats.netCashflow}
          color={stats.netCashflow >= 0 ? GREEN : RED}
          icon={Activity}
        />
        <Stat
          label="Tỉ lệ tiết kiệm"
          value={stats.savingRate}
          color={
            stats.savingRate >= 20
              ? GREEN
              : stats.savingRate >= 10
                ? AMBER
                : RED
          }
          icon={PiggyBank}
          suffix="%"
        />
      </div>

      {/* Income — 3 grouped subsections */}
      <Group label="Thu nhập từ lương" icon={Briefcase} color={GREEN}>
        <FieldGrid
          fields={SALARY_NUM_FIELDS}
          values={(data.income ?? {}) as Record<string, number | undefined>}
          onChange={setIncome}
        />
        <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
          <SelectField
            label="Mức độ ổn định công việc"
            icon={Shield}
            color={GREEN}
            value={data.income?.salaryStability}
            options={JOB_STABILITY_OPTIONS}
            onChange={(v) => setIncome("salaryStability", v)}
          />
          <SelectField
            label="Khả năng tăng lương 6-12 tháng"
            icon={TrendingUp}
            color={GREEN}
            value={data.income?.salaryGrowth}
            options={SALARY_GROWTH_OPTIONS}
            onChange={(v) => setIncome("salaryGrowth", v)}
          />
        </div>
      </Group>

      <Group label="Thu nhập từ kinh doanh" icon={Building2} color={BRAND}>
        <FieldGrid
          fields={BUSINESS_NUM_FIELDS}
          values={(data.income ?? {}) as Record<string, number | undefined>}
          onChange={setIncome}
        />
        <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
          <SelectField
            label="Dòng tiền có đều không?"
            icon={Activity}
            color={BRAND}
            value={data.income?.businessCashflowConsistent}
            options={BIZ_CASHFLOW_OPTIONS}
            onChange={(v) => setIncome("businessCashflowConsistent", v)}
          />
          <SelectField
            label="Mức độ phụ thuộc vào bạn"
            icon={Users2}
            color={BRAND}
            value={data.income?.businessDependsOnYou}
            options={BIZ_DEPEND_OPTIONS}
            onChange={(v) => setIncome("businessDependsOnYou", v)}
          />
        </div>
      </Group>

      <Group label="Thu nhập thụ động" icon={Sparkles} color={PURPLE}>
        <FieldGrid
          fields={PASSIVE_NUM_FIELDS}
          values={(data.income ?? {}) as Record<string, number | undefined>}
          onChange={setIncome}
        />
        <div className="grid sm:grid-cols-2 gap-2.5 mt-2.5">
          <SelectField
            label="Mức độ bền vững & rủi ro"
            icon={Sprout}
            color={PURPLE}
            value={data.income?.passiveSustainability}
            options={PASSIVE_SUSTAIN_OPTIONS}
            onChange={(v) => setIncome("passiveSustainability", v)}
          />
          <div>
            <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
              <MoreHorizontal size={11} style={{ color: BLUE }} />
              Thu nhập khác /tháng
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={
                  data.income?.other && data.income.other > 0
                    ? data.income.other.toLocaleString("vi-VN")
                    : ""
                }
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setIncome(
                    "other",
                    cleaned ? parseInt(cleaned, 10) : undefined
                  );
                }}
                placeholder="0"
                className="w-full px-2.5 py-1.5 pr-7 rounded-md text-[12px] font-bold text-white text-right outline-none"
                style={{
                  background: "#0a0a0a",
                  border: `1px solid ${data.income?.other ? `${BLUE}77` : "#2a2a2a"}`,
                }}
              />
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
                style={{ color: data.income?.other ? BLUE : "#525252" }}
              >
                ₫
              </span>
            </div>
          </div>
        </div>
      </Group>

      {/* Phân tích chi tiết Thu nhập (tỷ trọng + chấm 10 điểm + Praise/Warning/
          Advice) sẽ hiển thị trong Báo cáo Premium ở mục cuối. */}

      {/* Fixed costs */}
      <Group label="Chi cố định" icon={Home} color={AMBER}>
        <FieldGrid
          fields={FIXED_FIELDS}
          values={(data.fixedCosts ?? {}) as Record<string, number | undefined>}
          onChange={setFixed}
        />
      </Group>

      {/* Variable costs */}
      <Group label="Chi biến động" icon={Activity} color={PURPLE}>
        <FieldGrid
          fields={VAR_FIELDS}
          values={(data.variableCosts ?? {}) as Record<string, number | undefined>}
          onChange={setVar}
        />
      </Group>

      {/* Savings & investment */}
      <Group label="Chi tiết kiệm & đầu tư" icon={PiggyBank} color={BLUE}>
        <FieldGrid
          fields={SAVINGS_FIELDS}
          values={(data.savings ?? {}) as Record<string, number | undefined>}
          onChange={setSavings}
        />
        <div className="text-[10.5px] text-gray-500 mt-1 leading-snug">
          Khoản tiền chủ động dành cho tiết kiệm &amp; đầu tư mỗi tháng — đây là
          phần tích sản, không phải chi tiêu hưởng thụ.
        </div>
      </Group>

      {/* Embedded analysis (donuts + JARS + tips) */}
      <CashflowAnalysis data={data} />

      {/* CTA */}
      {!hideCompleteCta && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-gray-500">
            {hasData
              ? "✓ Đã có dữ liệu — phần này có thể đánh dấu hoàn thành."
              : "Nhập thu nhập + chi tiêu để phân tích dòng tiền."}
          </div>
          <button
            type="button"
            onClick={onComplete}
            disabled={!hasData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
            style={{
              background: hasData ? BRAND : "#1a1a1a",
              color: hasData ? "#0a0a0a" : "#555",
              cursor: hasData ? "pointer" : "not-allowed",
              border: hasData ? "none" : "1px solid #2a2a2a",
            }}
          >
            <CheckCircle2 size={14} />
            Đánh dấu hoàn thành
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── primitives ─── */

function Group({
  label,
  icon: Icon,
  color,
  children,
}: {
  label: string;
  icon: typeof Wallet;
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
      <div className="flex items-center gap-2">
        <Icon size={13} style={{ color }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function FieldGrid<T extends string>({
  fields,
  values,
  onChange,
}: {
  fields: FieldDef<T>[];
  values: Record<string, number | undefined>;
  onChange: (k: T, v: number | undefined) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {fields.map((f) => {
        const Icon = f.icon;
        const value = values[f.key] ?? undefined;
        const display = value && value > 0 ? value.toLocaleString("vi-VN") : "";
        return (
          <div key={f.key}>
            <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
              <Icon size={11} style={{ color: f.color }} />
              {f.label}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  onChange(f.key, cleaned ? parseInt(cleaned, 10) : undefined);
                }}
                placeholder="0"
                className="w-full px-2.5 py-1.5 pr-7 rounded-md text-[12px] font-bold text-white text-right outline-none"
                style={{
                  background: "#0a0a0a",
                  border: `1px solid ${value ? `${f.color}77` : "#2a2a2a"}`,
                }}
              />
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
                style={{ color: value ? f.color : "#525252" }}
              >
                ₫
              </span>
            </div>
          </div>
        );
      })}
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
        <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>
      )}
    </div>
  );
}

function SelectField<T extends string>({
  label,
  icon: Icon,
  color,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: typeof Wallet;
  color: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (v: T | undefined) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10.5px] text-gray-400 mb-1">
        <Icon size={11} style={{ color }} />
        {label}
      </label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value as T) || undefined)}
        className="w-full px-2.5 py-1.5 rounded-md text-[12px] font-bold outline-none cursor-pointer"
        style={{
          background: "#0a0a0a",
          color: value ? "#fff" : "#525252",
          border: `1px solid ${value ? `${color}77` : "#2a2a2a"}`,
        }}
      >
        <option value="">— chọn —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#141414" }}>
            {o.label}
          </option>
        ))}
      </select>
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
