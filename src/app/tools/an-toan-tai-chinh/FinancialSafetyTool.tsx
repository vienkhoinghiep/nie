"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Wallet,
  PiggyBank,
  Building2,
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
  Gem,
  TrendingUp,
  Shield,
  Home,
  Bitcoin,
} from "lucide-react";
import { Donut, ProgressDonut } from "../can-doi-thu-chi/Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

const STORAGE_KEY = "tc_safety_v2";

/* Insurance type meta — used for both inputs + verdict */
const INSURANCE_TYPES = [
  {
    key: "health" as const,
    label: "BH sức khoẻ",
    color: GREEN,
    fixedTarget: 500_000_000, // 500tr
    hint: "KN ≥ 500tr (giường VIP + phẫu thuật)",
  },
  {
    key: "accident" as const,
    label: "BH tai nạn",
    color: AMBER,
    multiplier: 5, // × thu nhập năm
    hint: "KN ≥ 5 × thu nhập năm",
  },
  {
    key: "critical" as const,
    label: "BH bệnh hiểm nghèo",
    color: RED,
    fixedTarget: 500_000_000,
    hint: "KN ≥ 500tr (ung thư, đột quỵ, suy thận…)",
  },
  {
    key: "life" as const,
    label: "BH nhân thọ",
    color: BLUE,
    multiplier: 10, // × thu nhập năm
    hint: "KN ≥ 10 × thu nhập năm",
  },
];

/* ─────────────────────────────────────────────
 *  Field config
 * ───────────────────────────────────────────── */

interface Field {
  key: string;
  label: string;
  icon: typeof Wallet;
  color: string;
}

const LIQUID_FIELDS: Field[] = [
  { key: "cash", label: "Tiền mặt", icon: Coins, color: GREEN },
  { key: "checking", label: "TK thanh toán", icon: Building2, color: BLUE },
  { key: "savings", label: "Tiết kiệm dễ rút", icon: PiggyBank, color: BRAND },
  { key: "gold", label: "Vàng dễ bán", icon: Gem, color: AMBER },
  { key: "rental_property", label: "BĐS cho thuê", icon: Home, color: PURPLE },
  { key: "crypto", label: "Crypto", icon: Bitcoin, color: "#f97316" },
];

interface InsuranceState {
  health: number;
  accident: number;
  critical: number;
  life: number;
}

interface FormState {
  monthlyIncome: number;
  liquid: Record<string, number>;
  monthlyContrib: number;
  annualRate: number;
  targetMonths: number;
  insurance: InsuranceState;
}

const DEFAULT_STATE: FormState = {
  monthlyIncome: 30_000_000,
  liquid: {},
  monthlyContrib: 5_000_000,
  annualRate: 8,
  targetMonths: 120,
  insurance: { health: 0, accident: 0, critical: 0, life: 0 },
};

/* ─────────────────────────────────────────────
 *  Helpers
 * ───────────────────────────────────────────── */

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
  for (let m = 1; m <= 1200; m++) {
    balance = balance * (1 + r) + monthly;
    if (balance >= target) return m;
  }
  return Infinity;
}

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function FinancialSafetyTool() {
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

  const setLiquid = (key: string, raw: string) => {
    setTouched(true);
    const digits = raw.replace(/\D/g, "");
    const n = digits ? parseInt(digits, 10) : 0;
    setForm((f) => ({ ...f, liquid: { ...f.liquid, [key]: n } }));
  };

  const updateNum = (key: keyof Omit<FormState, "liquid" | "insurance">, value: number) => {
    setTouched(true);
    setForm((f) => ({ ...f, [key]: value }));
  };
  const setInsurance = (key: keyof InsuranceState, raw: string) => {
    setTouched(true);
    const digits = raw.replace(/\D/g, "");
    const n = digits ? parseInt(digits, 10) : 0;
    setForm((f) => ({ ...f, insurance: { ...f.insurance, [key]: n } }));
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

  const summary = useMemo(() => {
    const currentLiquid = LIQUID_FIELDS.reduce(
      (s, f) => s + (form.liquid[f.key] || 0),
      0
    );
    const target = form.monthlyIncome * form.targetMonths;
    const monthsCovered =
      form.monthlyIncome > 0 ? currentLiquid / form.monthlyIncome : 0;
    const achievement = target > 0 ? Math.round((currentLiquid / target) * 100) : 0;
    // Số tiền còn thiếu = mục tiêu − TS thanh khoản − BH nhân thọ
    // (BH nhân thọ là lớp bảo vệ tài chính cho gia đình khi có rủi ro,
    //  cộng vào "lớp đệm an toàn" để tính phần còn thiếu thật sự cần tích lũy)
    const lifeInsurance = form.insurance.life || 0;
    const gap = Math.max(0, target - currentLiquid - lifeInsurance);
    // Bao lâu để đầy quỹ — tính từ "lớp đệm" hiện có (TS + BH NT)
    // để khớp với công thức 'gap' phía trên.
    const monthsToFillFund = monthsToFill(
      currentLiquid + lifeInsurance,
      target,
      form.monthlyContrib,
      form.annualRate
    );
    // Insurance check — derive targets per type
    const annualIncome = form.monthlyIncome * 12;
    const insuranceCheck = INSURANCE_TYPES.map((t) => {
      const target = t.fixedTarget ?? (t.multiplier ?? 0) * annualIncome;
      const current = form.insurance[t.key];
      return {
        key: t.key,
        label: t.label,
        color: t.color,
        current,
        target,
        ok: target > 0 && current >= target,
      };
    });
    const insuranceCount = insuranceCheck.filter((c) => c.ok).length;
    const hasInsuranceFull = insuranceCount === INSURANCE_TYPES.length;

    return {
      currentLiquid,
      target,
      monthsCovered,
      achievement,
      gap,
      monthsToFillFund,
      insuranceCheck,
      insuranceCount,
      hasInsuranceFull,
    };
  }, [form]);

  const hasInputs = form.monthlyIncome > 0 || summary.currentLiquid > 0;
  const willHit = summary.currentLiquid >= summary.target && summary.target > 0;
  const fullyAchieved = willHit && summary.hasInsuranceFull;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{
            background: `${GREEN}1a`,
            color: GREEN,
            border: `1px solid ${GREEN}55`,
          }}
        >
          <HeartHandshake size={11} />
          Cấp độ tài chính · An toàn
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          An Toàn <span style={{ color: BRAND }}>Tài Chính</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Theo định nghĩa của thầy VINEN: <strong className="text-white">
          tài sản thanh khoản ≥ 120 tháng thu nhập</strong> (≈ 10 năm) +{" "}
          <strong className="text-white">có bảo hiểm đầy đủ</strong>.
        </p>
      </div>

      {/* Big summary */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6"
        style={{
          background: fullyAchieved
            ? `linear-gradient(135deg, ${GREEN}14, transparent)`
            : willHit
              ? `linear-gradient(135deg, ${BRAND}14, transparent)`
              : `linear-gradient(135deg, ${AMBER}14, transparent)`,
          border: `1px solid ${fullyAchieved ? GREEN : willHit ? BRAND : AMBER}55`,
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center">
          <div className="col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              TS thanh khoản hiện có
            </div>
            <div
              className="text-2xl sm:text-3xl font-extrabold leading-tight"
              style={{ color: fullyAchieved ? GREEN : willHit ? BRAND : AMBER }}
            >
              {fmtCompact(summary.currentLiquid)}
            </div>
            <div className="text-[10px] mt-1 font-bold uppercase tracking-wider text-gray-500">
              ≈ {summary.monthsCovered.toFixed(1)} tháng thu nhập
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
            note="mục tiêu − TS − BH NT"
          />
          <MiniStat
            label="Bao lâu đầy"
            value={summary.monthsToFillFund === Infinity ? 0 : summary.monthsToFillFund}
            color={BLUE}
            note={
              summary.monthsToFillFund === Infinity
                ? "Không đạt"
                : summary.monthsToFillFund >= 12
                  ? `${(summary.monthsToFillFund / 12).toFixed(1)} năm`
                  : "tháng"
            }
            raw
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Inputs ─── */}
        <div className="space-y-3">
          {/* Income */}
          <Section icon={TrendingUp} label="Thu nhập" color={GREEN}>
            <NumField
              label="Thu nhập /tháng"
              value={form.monthlyIncome}
              onChange={(v) => updateNum("monthlyIncome", v)}
              suffix="₫"
              icon={TrendingUp}
            />
            <NumField
              label="Mục tiêu (tháng thu nhập)"
              value={form.targetMonths}
              onChange={(v) => updateNum("targetMonths", Math.min(600, v))}
              suffix="tháng"
              icon={Calendar}
              raw
            />
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 KN của thầy: 120 tháng (≈ 10 năm thu nhập). Có thể tăng nếu thu
              nhập biến động cao.
            </p>
          </Section>

          {/* Current liquid assets */}
          <Section icon={Wallet} label="TS thanh khoản hiện có" color={BLUE}>
            {LIQUID_FIELDS.map((f) => (
              <FieldRow
                key={f.key}
                field={f}
                value={form.liquid[f.key] || 0}
                onChange={(v) => setLiquid(f.key, v)}
              />
            ))}
          </Section>

          {/* Contribution plan */}
          <Section icon={PiggyBank} label="Kế hoạch đóng góp" color={BRAND}>
            <NumField
              label="Đóng góp /tháng"
              value={form.monthlyContrib}
              onChange={(v) => updateNum("monthlyContrib", v)}
              suffix="₫"
              icon={PiggyBank}
            />
            <NumField
              label="Lãi suất /năm"
              value={form.annualRate}
              onChange={(v) => updateNum("annualRate", Math.min(30, v))}
              suffix="%"
              icon={Percent}
              raw
            />
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 An Toàn TC ưu tiên thanh khoản — lãi 5-8% (NH/trái phiếu) phù hợp.
            </p>
          </Section>

          {/* Insurance check — 4 mệnh giá thực tế */}
          <Section icon={Shield} label="Mệnh giá bảo hiểm hiện có" color={RED}>
            {summary.insuranceCheck.map((c) => (
              <InsuranceRow
                key={c.key}
                label={c.label}
                color={c.color}
                current={c.current}
                target={c.target}
                ok={c.ok}
                hint={
                  INSURANCE_TYPES.find((t) => t.key === c.key)?.hint ?? ""
                }
                onChange={(v) => setInsurance(c.key, v)}
              />
            ))}
            <div
              className="mt-2 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center justify-between"
              style={{
                background: summary.hasInsuranceFull ? `${GREEN}1a` : `${AMBER}1a`,
                color: summary.hasInsuranceFull ? GREEN : AMBER,
                border: `1px solid ${summary.hasInsuranceFull ? GREEN : AMBER}55`,
              }}
            >
              <span>Đủ {summary.insuranceCount}/4 loại BH</span>
              {summary.hasInsuranceFull && <CheckCircle2 size={12} />}
            </div>
            <Link
              href="/tools/ke-hoach-bao-hiem"
              className="block text-center mt-1.5 text-[10px] text-[#2563EB] hover:underline"
            >
              → Mở công cụ Hoạch Định Bảo Hiểm
            </Link>
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
                Anh/chị nhập thu nhập và tài sản thanh khoản ở bên trái.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Achievement */}
                <ReportCard
                  title="Mức độ đầy quỹ"
                  hint={`So với mục tiêu ${form.targetMonths} tháng thu nhập`}
                  icon={HeartHandshake}
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
                  title="Cơ cấu tài sản thanh khoản"
                  hint="Phân bổ theo loại"
                  icon={PieChart}
                  iconColor={GREEN}
                >
                  {summary.currentLiquid > 0 ? (
                    <CompositionDonut
                      values={form.liquid}
                      total={summary.currentLiquid}
                    />
                  ) : (
                    <EmptyReport msg="Chưa có TS thanh khoản" />
                  )}
                </ReportCard>
              </div>

              {/* Fill projection */}
              <FillProjectionCard summary={summary} form={form} />

              {/* Final verdict */}
              <FinalVerdict
                willHit={willHit}
                insuranceCheck={summary.insuranceCheck}
                hasInsuranceFull={summary.hasInsuranceFull}
              />

              {/* What-if */}
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
  raw,
}: {
  label: string;
  value: number;
  color: string;
  note?: string;
  raw?: boolean;
}) {
  const display = raw
    ? value > 0
      ? `${value}`
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
  icon: typeof HeartHandshake;
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
        centerSub={`${monthsCovered.toFixed(0)}/${target} tháng`}
      />
      <p className="mt-3 text-[11px] font-bold text-center" style={{ color }}>
        {willHit
          ? "✓ Đủ 120 tháng thu nhập — gần đạt An Toàn TC"
          : achievement >= 50
            ? "Giữa chặng — tiếp tục đóng góp đều"
            : "Còn xa mục tiêu — cần kỷ luật đầu tư lâu dài"}
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
  summary: { currentLiquid: number; target: number; gap: number; monthsToFillFund: number };
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
          Lộ trình đầy quỹ An Toàn
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>{fmtCompact(summary.currentLiquid)}</span>
          <span>{fmtCompact(summary.target)}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "#0a0a0a" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (summary.currentLiquid / Math.max(1, summary.target)) * 100)}%`,
              background:
                summary.currentLiquid >= summary.target
                  ? GREEN
                  : `linear-gradient(90deg, ${AMBER}, ${BRAND})`,
            }}
          />
        </div>
        <div className="text-[10px] text-gray-500 text-center">
          {Math.round((summary.currentLiquid / Math.max(1, summary.target)) * 100)}% đã đầy
        </div>
      </div>
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

interface InsuranceCheckItem {
  key: keyof InsuranceState;
  label: string;
  color: string;
  current: number;
  target: number;
  ok: boolean;
}

function FinalVerdict({
  willHit,
  insuranceCheck,
  hasInsuranceFull,
}: {
  willHit: boolean;
  insuranceCheck: InsuranceCheckItem[];
  hasInsuranceFull: boolean;
}) {
  const both = willHit && hasInsuranceFull;
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: both
          ? `linear-gradient(135deg, ${GREEN}14, transparent)`
          : `linear-gradient(135deg, ${AMBER}10, transparent)`,
        border: `1px solid ${both ? GREEN : AMBER}55`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} style={{ color: both ? GREEN : AMBER }} />
        <div className="text-xs font-bold uppercase tracking-wider text-white">
          Kết luận
        </div>
      </div>

      {/* Condition 1: TS thanh khoản */}
      <div
        className="rounded-lg p-3 flex items-center gap-2.5 mb-3"
        style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
      >
        {willHit ? (
          <CheckCircle2 size={16} style={{ color: GREEN }} />
        ) : (
          <AlertCircle size={16} style={{ color: AMBER }} />
        )}
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
            Điều kiện 1
          </div>
          <div className="text-xs font-bold text-white">
            TS thanh khoản ≥ 120 tháng thu nhập —{" "}
            <span style={{ color: willHit ? GREEN : AMBER }}>
              {willHit ? "ĐẠT" : "CHƯA"}
            </span>
          </div>
        </div>
      </div>

      {/* Condition 2: BH đủ — show breakdown 4 loại */}
      <div
        className="rounded-lg p-3"
        style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          {hasInsuranceFull ? (
            <CheckCircle2 size={16} style={{ color: GREEN }} />
          ) : (
            <AlertCircle size={16} style={{ color: AMBER }} />
          )}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              Điều kiện 2
            </div>
            <div className="text-xs font-bold text-white">
              Bảo hiểm đầy đủ —{" "}
              <span style={{ color: hasInsuranceFull ? GREEN : AMBER }}>
                {hasInsuranceFull
                  ? "ĐẠT (4/4)"
                  : `CHƯA (${insuranceCheck.filter((c) => c.ok).length}/4)`}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {insuranceCheck.map((c) => (
            <div
              key={c.key}
              className="rounded p-1.5 flex items-center gap-1.5 text-[10px]"
              style={{
                background: c.ok ? `${GREEN}10` : "rgba(255,255,255,0.03)",
                border: `1px solid ${c.ok ? `${GREEN}33` : "#1f1f1f"}`,
              }}
            >
              {c.ok ? (
                <CheckCircle2 size={11} style={{ color: GREEN }} />
              ) : (
                <AlertCircle size={11} style={{ color: AMBER }} />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white truncate">{c.label}</div>
                <div className="text-gray-500 text-[9px]">
                  {fmtCompact(c.current)} / {fmtCompact(c.target)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p
        className="text-xs leading-relaxed mt-3 pt-3 border-t border-[#1f1f1f]"
        style={{ color: both ? GREEN : "#9ca3af" }}
      >
        {both
          ? "🎉 Đã đạt cấp độ AN TOÀN TÀI CHÍNH — bước tiếp: Độc Lập Tài Chính (thu nhập thụ động ≥ chi tiêu thiết yếu)."
          : "Cần đạt ĐỦ CẢ HAI điều kiện để được công nhận An Toàn TC theo framework của thầy VINEN."}
      </p>
    </div>
  );
}

/* Row input cho từng loại bảo hiểm — có status indicator */
function InsuranceRow({
  label,
  color,
  current,
  target,
  ok,
  hint,
  onChange,
}: {
  label: string;
  color: string;
  current: number;
  target: number;
  ok: boolean;
  hint: string;
  onChange: (raw: string) => void;
}) {
  const display = current > 0 ? current.toLocaleString("vi-VN") : "";
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-[10.5px]">
        <span className="flex items-center gap-1.5 text-gray-400 truncate">
          <Shield size={10} style={{ color }} />
          {label}
        </span>
        {current > 0 &&
          (ok ? (
            <CheckCircle2 size={11} style={{ color: GREEN }} />
          ) : (
            <AlertCircle size={11} style={{ color: AMBER }} />
          ))}
      </div>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full px-2 py-1.5 pr-5 rounded-md text-[12px] font-bold text-white text-right outline-none"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${
              current > 0 ? (ok ? `${GREEN}77` : `${AMBER}77`) : "#2a2a2a"
            }`,
          }}
        />
        <span
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-medium pointer-events-none"
          style={{
            color:
              current > 0 ? (ok ? GREEN : AMBER) : "#525252",
          }}
        >
          ₫
        </span>
      </div>
      <p
        className="text-[9px] mt-0.5 leading-snug"
        style={{ color: target > 0 && !ok ? AMBER : "#525252" }}
      >
        {hint}
        {target > 0 ? ` = ${fmtCompact(target)}` : ""}
      </p>
    </div>
  );
}

function WhatIfContributions({
  summary,
  form,
}: {
  summary: { gap: number; currentLiquid: number; target: number };
  form: FormState;
}) {
  if (summary.target <= 0 || summary.gap <= 0) return null;
  const baseMonthly = Math.max(form.monthlyContrib, 1_000_000);
  const lifeInsurance = form.insurance.life || 0;

  // Compute additional life insurance needed to immediately close the gap.
  const additionalLifeNeeded = summary.gap;
  const newLifeFaceValue = lifeInsurance + additionalLifeNeeded;

  const scenarios = [
    { label: "Đóng ít", monthly: Math.round(baseMonthly * 0.5), color: AMBER },
    {
      label: "Đóng đang đặt",
      monthly: form.monthlyContrib,
      color: BRAND,
      highlight: true,
    },
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
          What-if — đạt mục tiêu nhanh hơn
        </div>
      </div>

      {/* Scenario 1-3: tăng đóng góp */}
      <div className="grid sm:grid-cols-3 gap-3 mb-3">
        {scenarios.map((s, i) => {
          const m = monthsToFill(
            summary.currentLiquid + lifeInsurance,
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

      {/* Scenario 4: tăng mệnh giá BH NT đủ cover gap → đạt ngay */}
      <div
        className="rounded-xl p-4"
        style={{
          background: `linear-gradient(135deg, ${PURPLE}14, transparent)`,
          border: `1px solid ${PURPLE}77`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${PURPLE}1a`, color: PURPLE }}
          >
            <HeartHandshake size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] uppercase tracking-wider font-bold mb-0.5"
              style={{ color: PURPLE }}
            >
              💡 Cách nhanh — tăng mệnh giá BH nhân thọ
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Mua thêm{" "}
              <strong className="text-white">
                {fmtCompact(additionalLifeNeeded)}
              </strong>{" "}
              mệnh giá BH nhân thọ → mệnh giá mới{" "}
              <strong style={{ color: PURPLE }}>
                {fmtCompact(newLifeFaceValue)}
              </strong>
              {" "}→ <strong style={{ color: GREEN }}>đạt mục tiêu An Toàn TC ngay</strong>{" "}
              (gap = 0).
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div
                className="rounded-md p-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="text-gray-500 uppercase tracking-wider font-bold">
                  BH NT hiện tại
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  {fmtCompact(lifeInsurance)}
                </div>
              </div>
              <div
                className="rounded-md p-1.5"
                style={{ background: `${PURPLE}10`, border: `1px solid ${PURPLE}55` }}
              >
                <div className="font-bold uppercase tracking-wider" style={{ color: PURPLE }}>
                  Cần mua thêm
                </div>
                <div className="text-sm font-extrabold mt-0.5" style={{ color: PURPLE }}>
                  +{fmtCompact(additionalLifeNeeded)}
                </div>
              </div>
              <div
                className="rounded-md p-1.5"
                style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}55` }}
              >
                <div className="font-bold uppercase tracking-wider" style={{ color: GREEN }}>
                  Mệnh giá mới
                </div>
                <div className="text-sm font-extrabold mt-0.5" style={{ color: GREEN }}>
                  {fmtCompact(newLifeFaceValue)}
                </div>
              </div>
            </div>
            <Link
              href="/tools/ke-hoach-bao-hiem"
              className="inline-flex items-center gap-1 text-[10.5px] mt-2.5 hover:underline"
              style={{ color: BRAND }}
            >
              → Mở công cụ Hoạch Định Bảo Hiểm để xem mức phí cho mệnh giá này
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionTips({
  summary,
  form,
}: {
  summary: { monthsCovered: number; monthsToFillFund: number };
  form: FormState;
}) {
  if (form.monthlyIncome <= 0) return null;
  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];
  if (summary.monthsCovered < 12) {
    tips.push({
      type: "warn",
      text: `Mới có ${summary.monthsCovered.toFixed(1)} tháng thu nhập — ưu tiên đạt Thoát Nghèo (12 tháng chi tiêu) trước.`,
    });
  }
  if (summary.monthsCovered >= 60 && summary.monthsCovered < 120) {
    tips.push({
      type: "info",
      text: `Đã có ${summary.monthsCovered.toFixed(0)} tháng — đang ở giai đoạn nửa đường. Giữ nhịp đóng góp + duy trì lãi suất.`,
    });
  }
  if (summary.monthsCovered >= 120) {
    tips.push({
      type: "ok",
      text: `Có ${summary.monthsCovered.toFixed(0)} tháng thu nhập trong TS thanh khoản — đã đạt mục tiêu chính.`,
    });
  }
  if (form.annualRate > 12) {
    tips.push({
      type: "info",
      text: `Lãi ${form.annualRate}%/năm khá cao cho TS thanh khoản. Kênh thường: gửi NH 5-7%, trái phiếu 7-9%.`,
    });
  }
  if (form.monthlyContrib > 0 && summary.monthsToFillFund > 120) {
    tips.push({
      type: "info",
      text: `Mất hơn 10 năm để đạt mục tiêu. Cân nhắc tăng đóng góp hoặc tăng thu nhập để rút ngắn.`,
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
