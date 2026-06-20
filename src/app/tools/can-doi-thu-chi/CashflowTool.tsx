"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Info,
  Activity,
  Shield,
  CreditCard,
  PieChart,
  BarChart3,
} from "lucide-react";
import { Donut, ProgressDonut } from "./Donut";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

const STORAGE_KEY = "tc_cashflow_v1";

/* ─────────────────────────────────────────────
 *  Field config
 * ───────────────────────────────────────────── */

type FieldGroup = "income" | "fixed" | "variable" | "save";

interface Field {
  key: string;
  label: string;
  group: FieldGroup;
}

const FIELDS: Field[] = [
  // Thu nhập
  { key: "salary", label: "Lương · thưởng", group: "income" },
  { key: "business", label: "Kinh doanh", group: "income" },
  { key: "investment", label: "Thu thụ động", group: "income" },
  { key: "other_income", label: "Thu khác", group: "income" },

  // Chi cố định
  { key: "housing", label: "Nhà ở", group: "fixed" },
  { key: "utilities", label: "Điện · nước · net", group: "fixed" },
  { key: "education", label: "Học con", group: "fixed" },
  { key: "insurance", label: "Bảo hiểm", group: "fixed" },
  { key: "debt", label: "Trả nợ", group: "fixed" },
  { key: "transport", label: "Đi lại", group: "fixed" },

  // Chi biến động
  { key: "food", label: "Ăn uống", group: "variable" },
  { key: "shopping", label: "Mua sắm", group: "variable" },
  { key: "entertainment", label: "Giải trí", group: "variable" },
  { key: "health", label: "Y tế", group: "variable" },
  { key: "give", label: "Cho đi · biếu", group: "variable" },
  { key: "other_expense", label: "Chi khác", group: "variable" },

  // Tiết kiệm + Đầu tư
  { key: "saving", label: "Tiết kiệm", group: "save" },
  { key: "investing", label: "Đầu tư", group: "save" },
  { key: "emergency", label: "Quỹ dự phòng", group: "save" },
];

const GROUPS = [
  {
    key: "income" as FieldGroup,
    label: "Thu nhập",
    icon: TrendingUp,
    color: GREEN,
  },
  {
    key: "fixed" as FieldGroup,
    label: "Chi cố định",
    icon: TrendingDown,
    color: AMBER,
  },
  {
    key: "variable" as FieldGroup,
    label: "Chi biến động",
    icon: Wallet,
    color: "#a855f7",
  },
  {
    key: "save" as FieldGroup,
    label: "Tiết kiệm & Đầu tư",
    icon: PiggyBank,
    color: BRAND,
  },
];

/* ─────────────────────────────────────────────
 *  JARS 6 quỹ
 * ───────────────────────────────────────────── */

const JARS = [
  { key: "nec", label: "NEC — Thiết yếu", pct: 55, color: "#f59e0b" },
  { key: "ltss", label: "LTSS — Dài hạn", pct: 10, color: "#3b82f6" },
  { key: "edu", label: "EDU — Giáo dục", pct: 10, color: "#a855f7" },
  { key: "play", label: "PLAY — Hưởng thụ", pct: 10, color: "#ec4899" },
  { key: "ffa", label: "FFA — Tự do TC", pct: 10, color: "#22c55e" },
  { key: "give", label: "GIVE — Cho đi", pct: 5, color: "#06b6d4" },
];

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function CashflowTool() {
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

    const income = sumOf("income");
    const fixed = sumOf("fixed");
    const variable = sumOf("variable");
    const save = sumOf("save");

    const totalExpense = fixed + variable + save;
    const balance = income - totalExpense;
    const savingRate = income > 0 ? Math.round((save / income) * 100) : 0;
    const debtRate = income > 0 ? Math.round(((values.debt || 0) / income) * 100) : 0;
    const emergencyRate = income > 0
      ? Math.round(((values.emergency || 0) / income) * 100)
      : 0;

    return {
      income,
      fixed,
      variable,
      save,
      totalExpense,
      balance,
      savingRate,
      debtRate,
      emergencyRate,
    };
  }, [values]);

  /* ─── JARS actual ─── */
  const jarsActual = useMemo(() => {
    if (summary.income <= 0) return null;
    const nec =
      (values.housing || 0) +
      (values.utilities || 0) +
      (values.food || 0) +
      (values.transport || 0) +
      (values.health || 0) +
      (values.insurance || 0) +
      (values.debt || 0);
    const ltss = (values.saving || 0) + (values.emergency || 0);
    const edu = values.education || 0;
    const play = (values.entertainment || 0) + (values.shopping || 0);
    const ffa = values.investing || 0;
    const give = values.give || 0;
    return { nec, ltss, edu, play, ffa, give };
  }, [values, summary.income]);

  const balancePositive = summary.balance >= 0;
  const hasInputs = summary.income > 0 || summary.totalExpense > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{
            background: "rgba(34,197,94,0.16)",
            color: GREEN,
            border: "1px solid rgba(34,197,94,0.55)",
          }}
        >
          <Wallet size={11} />
          Công cụ miễn phí
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Cân Đối <span style={{ color: BRAND }}>Thu Chi</span> Cá Nhân
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Nhập thu — chi hàng tháng vào bảng bên trái. Báo cáo trực quan sẽ
          hiện ngay phía bên phải, kèm so sánh với 6 quỹ JARS.
        </p>
      </div>

      {/* Big balance card — full width */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 items-center"
        style={{
          background: balancePositive
            ? `linear-gradient(135deg, ${GREEN}14, transparent)`
            : `linear-gradient(135deg, ${RED}14, transparent)`,
          border: `1px solid ${balancePositive ? GREEN : RED}55`,
        }}
      >
        <div className="col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Số dư hàng tháng
          </div>
          <div
            className="text-2xl sm:text-3xl font-extrabold leading-tight"
            style={{ color: balancePositive ? GREEN : RED }}
          >
            {balancePositive ? "+" : ""}
            {fmtVND(summary.balance)}
          </div>
        </div>
        <MiniStat label="Thu" value={summary.income} color={GREEN} />
        <MiniStat label="Chi" value={summary.totalExpense} color={RED} />
        <MiniStat label="Để dành" value={summary.save} color={BRAND} />
      </div>

      {/* Two column layout — inputs (compact left) + reports (bigger right) */}
      <div className="grid lg:grid-cols-[340px_1fr] gap-5 lg:gap-6 items-start">
        {/* ─── LEFT: Compact inputs ─── */}
        <div className="space-y-3">
          {GROUPS.map((g) => {
            const fields = FIELDS.filter((f) => f.group === g.key);
            const groupTotal = fields.reduce(
              (s, f) => s + (values[f.key] || 0),
              0
            );
            const Icon = g.icon;

            return (
              <div
                key={g.key}
                className="rounded-xl p-3 sm:p-4"
                style={{ background: "#141414", border: "1px solid #232323" }}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#1f1f1f]">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ background: `${g.color}1a`, color: g.color }}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white truncate">
                      {g.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-extrabold whitespace-nowrap"
                    style={{ color: g.color }}
                  >
                    {fmtCompact(groupTotal)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {fields.map((f) => (
                    <FieldRow
                      key={f.key}
                      field={f}
                      value={values[f.key] || 0}
                      onChange={(v) => set(f.key, v)}
                      accent={g.color}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Reset + footer */}
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

        {/* ─── RIGHT: Donut reports ─── */}
        <div className="space-y-4">
          {!hasInputs && (
            <div
              className="rounded-2xl p-10 sm:p-16 text-center"
              style={{
                background: "#141414",
                border: "1px dashed #2a2a2a",
              }}
            >
              <PieChart size={56} className="mx-auto text-gray-700 mb-4" />
              <div className="text-base sm:text-lg font-bold text-gray-400 mb-1">
                Báo cáo trực quan sẽ hiển thị ở đây
              </div>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Anh/chị nhập các khoản thu — chi ở bảng bên trái, biểu đồ tròn sẽ
                tự cập nhật.
              </p>
            </div>
          )}

          {hasInputs && (
            <>
              {/* 2x2 donut grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* 1. Cơ cấu thu nhập */}
                <ReportCard
                  title="Cơ cấu thu nhập"
                  hint="Nguồn tiền vào"
                  icon={TrendingUp}
                  iconColor={GREEN}
                >
                  {summary.income > 0 ? (
                    <IncomeBreakdownDonut values={values} income={summary.income} />
                  ) : (
                    <EmptyReport msg="Chưa có thu nhập" />
                  )}
                </ReportCard>

                {/* 2. Cơ cấu chi tiêu (JARS) */}
                <ReportCard
                  title="Cơ cấu chi tiêu"
                  hint="So với 6 quỹ JARS"
                  icon={BarChart3}
                  iconColor="#a855f7"
                >
                  {jarsActual ? (
                    <JarsDonut jars={jarsActual} income={summary.income} />
                  ) : (
                    <EmptyReport msg="Chưa có chi tiêu" />
                  )}
                </ReportCard>

                {/* 3. Quỹ dự phòng khẩn cấp */}
                <ReportCard
                  title="Quỹ dự phòng khẩn cấp"
                  hint="Tỉ lệ đóng góp hàng tháng — KN ≥ 10%"
                  icon={Shield}
                  iconColor="#3b82f6"
                >
                  <EmergencyDonut
                    rate={summary.emergencyRate}
                    income={summary.income}
                    emergency={values.emergency || 0}
                  />
                </ReportCard>

                {/* 4. Tỉ lệ trả nợ định kỳ */}
                <ReportCard
                  title="Tỉ lệ trả nợ định kỳ"
                  hint="Nợ / Thu nhập — KN < 35%"
                  icon={CreditCard}
                  iconColor="#ef4444"
                >
                  <DebtRatioDonut
                    rate={summary.debtRate}
                    debt={values.debt || 0}
                    income={summary.income}
                  />
                </ReportCard>
              </div>

              {/* JARS detailed comparison */}
              {jarsActual && (
                <div
                  className="rounded-2xl p-5"
                  style={{ background: "#141414", border: "1px solid #232323" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={14} style={{ color: BRAND }} />
                    <div className="text-xs font-bold uppercase tracking-wider text-white">
                      Chi tiết 6 quỹ JARS
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {JARS.map((j) => {
                      const actual = jarsActual[j.key as keyof typeof jarsActual];
                      const actualPct =
                        summary.income > 0
                          ? Math.round((actual / summary.income) * 100)
                          : 0;
                      return (
                        <JarBar
                          key={j.key}
                          label={j.label}
                          target={j.pct}
                          actualPct={actualPct}
                          actualVND={actual}
                          color={j.color}
                        />
                      );
                    })}
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
 *  Donut sub-components
 * ───────────────────────────────────────────── */

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

const INCOME_COLORS: Record<string, string> = {
  salary: "#22c55e",
  business: "#3b82f6",
  investment: "#a855f7",
  other_income: "#06b6d4",
};
const INCOME_LABELS: Record<string, string> = {
  salary: "Lương · thưởng",
  business: "Kinh doanh",
  investment: "Thu thụ động",
  other_income: "Thu khác",
};

function IncomeBreakdownDonut({
  values,
  income,
}: {
  values: Record<string, number>;
  income: number;
}) {
  const slices = ["salary", "business", "investment", "other_income"].map((k) => ({
    value: values[k] || 0,
    color: INCOME_COLORS[k],
    label: INCOME_LABELS[k],
  }));

  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng thu"
        centerValue={fmtCompact(income)}
      />
      <ul className="w-full mt-3 space-y-1">
        {slices.map((s) => {
          const pct = income > 0 ? Math.round((s.value / income) * 100) : 0;
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

function JarsDonut({
  jars,
  income,
}: {
  jars: { nec: number; ltss: number; edu: number; play: number; ffa: number; give: number };
  income: number;
}) {
  const slices = JARS.map((j) => ({
    value: jars[j.key as keyof typeof jars],
    color: j.color,
    label: j.label,
  }));
  const totalExpense = slices.reduce((s, x) => s + x.value, 0);

  return (
    <div className="flex flex-col items-center">
      <Donut
        slices={slices}
        size={170}
        thickness={24}
        centerTop="Tổng chi"
        centerValue={fmtCompact(totalExpense)}
        centerSub={income > 0 ? `${Math.round((totalExpense / income) * 100)}% thu` : ""}
      />
      <ul className="w-full mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
        {JARS.map((j) => {
          const v = jars[j.key as keyof typeof jars];
          const pct = income > 0 ? Math.round((v / income) * 100) : 0;
          return (
            <li
              key={j.key}
              className="flex items-center justify-between text-[10px]"
            >
              <span className="flex items-center gap-1 text-gray-400 truncate">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: j.color }}
                />
                <span className="truncate">{j.label.split(" — ")[0]}</span>
              </span>
              <span
                className="font-bold whitespace-nowrap"
                style={{
                  color: Math.abs(pct - j.pct) <= 3 ? GREEN : pct > j.pct ? RED : AMBER,
                }}
              >
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmergencyDonut({
  rate,
  emergency,
}: {
  rate: number;
  income: number;
  emergency: number;
}) {
  // Target 10% of income
  const target = 10;
  const color =
    rate >= target ? GREEN : rate >= target * 0.5 ? AMBER : RED;
  // Show progress as % of target (capped 100)
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
          <span className="text-gray-400">Đóng góp /tháng</span>
          <span className="text-white font-bold">{fmtVND(emergency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Sau 12 tháng</span>
          <span className="font-bold" style={{ color: BRAND }}>
            {fmtCompact(emergency * 12)}
          </span>
        </div>
      </div>
    </div>
  );
}

function DebtRatioDonut({
  rate,
  debt,
  income,
}: {
  rate: number;
  debt: number;
  income: number;
}) {
  const safe = 35;
  const color = rate <= safe ? GREEN : rate <= 50 ? AMBER : RED;
  const progressPct = Math.min(100, rate);
  const verdict =
    rate === 0
      ? "Không có nợ định kỳ — rất tốt"
      : rate <= safe
        ? "An toàn — dưới khuyến nghị"
        : rate <= 50
          ? "Cao — cần cắt giảm"
          : "Vùng nguy hiểm — tái cơ cấu ngay";

  return (
    <div className="flex flex-col items-center">
      <ProgressDonut
        pct={progressPct}
        color={color}
        size={170}
        thickness={24}
        centerTop="Tỉ lệ"
        centerValue={`${rate}%`}
        centerSub={`an toàn ≤ ${safe}%`}
      />
      <div className="w-full mt-3 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Trả nợ /tháng</span>
          <span className="text-white font-bold">{fmtVND(debt)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Thu nhập /tháng</span>
          <span className="font-bold text-gray-300">{fmtVND(income)}</span>
        </div>
        <p
          className="text-[10px] mt-2 pt-2 border-t border-[#1f1f1f] leading-snug"
          style={{ color }}
        >
          {verdict}
        </p>
      </div>
    </div>
  );
}

function JarBar({
  label,
  target,
  actualPct,
  actualVND,
  color,
}: {
  label: string;
  target: number;
  actualPct: number;
  actualVND: number;
  color: string;
}) {
  const diff = actualPct - target;
  const ok = Math.abs(diff) <= 3;
  return (
    <div>
      <div className="flex items-center justify-between mb-1 text-[11px]">
        <span className="flex items-center gap-1.5 text-gray-300 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: color }}
          />
          <span className="truncate">{label}</span>
        </span>
        <span className="whitespace-nowrap text-gray-500 text-[10px]">
          {fmtCompact(actualVND)}
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
          title={`Mục tiêu ${target}%`}
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
        <span className="font-bold" style={{ color: ok ? GREEN : actualPct > target ? RED : AMBER }}>
          {actualPct}%
        </span>
        <span className="text-gray-500">KN {target}%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Inputs
 * ───────────────────────────────────────────── */

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
      <label className="text-[11px] text-gray-400 truncate">{field.label}</label>
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

function ActionTips({
  summary,
}: {
  summary: {
    income: number;
    balance: number;
    savingRate: number;
    debtRate: number;
    emergencyRate: number;
  };
}) {
  if (summary.income <= 0) return null;

  const tips: { type: "warn" | "ok" | "info"; text: string }[] = [];

  if (summary.balance < 0) {
    tips.push({
      type: "warn",
      text: `Đang chi vượt thu ${fmtVND(Math.abs(summary.balance))} /tháng — cắt giảm nhóm 'Chi biến động' trước.`,
    });
  }
  if (summary.savingRate < 10) {
    tips.push({
      type: "warn",
      text: `Tỉ lệ tiết kiệm chỉ ${summary.savingRate}% — mục tiêu tối thiểu 10%, lý tưởng 20%.`,
    });
  } else if (summary.savingRate >= 20) {
    tips.push({
      type: "ok",
      text: `Tỉ lệ tiết kiệm ${summary.savingRate}% — xuất sắc! Đang đi đúng hướng tự do tài chính.`,
    });
  }
  if (summary.debtRate > 35) {
    tips.push({
      type: "warn",
      text: `Trả nợ ${summary.debtRate}% thu nhập — vượt ngưỡng 35%. Cân nhắc tái cơ cấu hoặc trả dứt 1 khoản.`,
    });
  }
  if (summary.emergencyRate < 5 && summary.income > 0) {
    tips.push({
      type: "info",
      text: `Quỹ dự phòng chỉ ${summary.emergencyRate}% thu nhập — nên tăng lên 10% để xây quỹ 6 tháng chi tiêu trong 18 tháng.`,
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
