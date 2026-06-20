"use client";

/**
 * CashflowAnalysis — báo cáo trực quan nhúng dưới CashflowSection.
 * Đồng bộ phong cách "vibrant" với 3 báo cáo Tâm Thức: hero card với
 * score ring, KPI pills, polished donut cards có gradient + glow,
 * JARS detail với icon per quỹ.
 */

import { useId, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  CreditCard,
  BarChart3,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  PiggyBank,
  Activity,
  Home,
  GraduationCap,
  PartyPopper,
  Rocket,
  HandHeart,
} from "lucide-react";
import { Donut, ProgressDonut } from "@/app/tools/can-doi-thu-chi/Donut";
import type { CashflowData } from "@/lib/blueprint/types";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";
const PINK = "#ec4899";
const CYAN = "#06b6d4";

interface Props {
  data: CashflowData;
}

/* ─── JARS 6 quỹ + icon ─── */
const JARS = [
  { key: "nec" as const,  label: "NEC",  fullName: "Thiết yếu",   pct: 55, color: AMBER,  icon: Home          },
  { key: "ltss" as const, label: "LTSS", fullName: "Dài hạn",     pct: 10, color: BLUE,   icon: PiggyBank     },
  { key: "edu" as const,  label: "EDU",  fullName: "Giáo dục",    pct: 10, color: PURPLE, icon: GraduationCap },
  { key: "play" as const, label: "PLAY", fullName: "Hưởng thụ",   pct: 10, color: PINK,   icon: PartyPopper   },
  { key: "ffa" as const,  label: "FFA",  fullName: "Tự do TC",    pct: 10, color: GREEN,  icon: Rocket        },
  { key: "give" as const, label: "GIVE", fullName: "Cho đi",      pct: 5,  color: CYAN,   icon: HandHeart     },
];

/**
 * Compute total income from new schema (3 nhóm) with legacy fallback.
 * Tránh double-count khi user có cả legacy `personal/passive` lẫn fields mới.
 */
function computeIncomeTotal(inc: CashflowData["income"]): number {
  if (!inc) return 0;
  const salaryBase = inc.salaryBase ?? inc.personal ?? 0;
  const salary = salaryBase + (inc.salaryBonus ?? 0) + (inc.spouse ?? 0);
  const business = inc.businessProfit ?? 0;
  const newPassiveSum =
    (inc.passiveRental ?? 0) +
    (inc.passiveInvestment ?? 0) +
    (inc.passiveRoyalty ?? 0);
  const passive = newPassiveSum > 0 ? newPassiveSum : inc.passive ?? 0;
  const other = inc.other ?? 0;
  return salary + business + passive + other;
}

export default function CashflowAnalysis({ data }: Props) {
  const summary = useMemo(() => {
    const sum = (o: object | undefined) =>
      Object.values(o ?? {}).reduce<number>(
        (s, v) => s + (typeof v === "number" ? v : 0),
        0
      );

    const income = computeIncomeTotal(data.income);
    const fixed = sum(data.fixedCosts);
    const variable = sum(data.variableCosts);
    const save = sum(data.savings);

    const totalExpense = fixed + variable + save;
    const balance = income - totalExpense;
    const savingRate = income > 0 ? Math.round((save / income) * 100) : 0;

    const debt = data.fixedCosts?.debt ?? 0;
    const emergency = data.savings?.emergencyFund ?? 0;
    const debtRate = income > 0 ? Math.round((debt / income) * 100) : 0;
    const emergencyRate =
      income > 0 ? Math.round((emergency / income) * 100) : 0;

    return {
      income, fixed, variable, save, totalExpense,
      balance, savingRate, debt, emergency, debtRate, emergencyRate,
    };
  }, [data]);

  const jarsActual = useMemo(() => {
    if (summary.income <= 0) return null;
    const fixed = data.fixedCosts ?? {};
    const variable = data.variableCosts ?? {};
    const savings = data.savings ?? {};

    const nec =
      (fixed.housing ?? 0) +
      (fixed.utilities ?? 0) +
      (variable.food ?? 0) +
      (fixed.transport ?? 0) +
      (variable.healthcare ?? 0) +
      (fixed.insurance ?? 0) +
      (fixed.debt ?? 0);
    const ltss = (savings.emergencyFund ?? 0);
    const edu = (fixed.education ?? 0) + (savings.edu ?? 0);
    const play =
      (variable.entertainment ?? 0) +
      (variable.shopping ?? 0) +
      (savings.play ?? 0);
    const ffa = savings.ffa ?? 0;
    const give = (variable.giving ?? 0) + (savings.give ?? 0);
    return { nec, ltss, edu, play, ffa, give };
  }, [data, summary.income]);

  const hasInputs = summary.income > 0 || summary.totalExpense > 0;
  if (!hasInputs) return null;

  const balancePositive = summary.balance >= 0;
  const heroColor = balancePositive ? GREEN : RED;
  // Score = saving rate capped 0-100, but also penalised if balance < 0
  const healthScore = Math.max(
    0,
    Math.min(100, balancePositive ? summary.savingRate * 3 : 0)
  );

  return (
    <div className="mt-6 space-y-4">
      {/* ─── HERO CARD ─── */}
      <div
        className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, ${heroColor}33 0%, transparent 60%),
            radial-gradient(circle at 0% 100%, ${BRAND}1f 0%, transparent 55%),
            linear-gradient(135deg, #0d0d0d 0%, #141414 100%)
          `,
          border: `1px solid ${heroColor}55`,
          boxShadow: `0 8px 32px ${heroColor}22`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: `${heroColor}22`,
              color: heroColor,
              border: `1px solid ${heroColor}55`,
            }}
          >
            <BarChart3 size={10} />
            Báo cáo cân đối thu chi
          </div>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            ✓ Tự động cập nhật
          </span>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${heroColor}44, ${heroColor}11)`,
                  border: `1px solid ${heroColor}77`,
                  boxShadow: `0 4px 16px ${heroColor}33`,
                }}
              >
                {balancePositive ? "💰" : "⚠️"}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Dòng tiền ròng hàng tháng
                </div>
                <h3
                  className="text-2xl sm:text-3xl font-extrabold leading-tight"
                  style={{ color: heroColor }}
                >
                  {balancePositive ? "+" : ""}
                  {fmtVND(summary.balance)}
                </h3>
                <div className="text-xs text-gray-500 italic mt-0.5">
                  {balancePositive
                    ? "Đang dư — có khả năng tích lũy"
                    : "Đang âm — chi vượt thu, cần cắt giảm gấp"}
                </div>
              </div>
            </div>

            {/* 4 KPI pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <KpiPill
                icon={TrendingUp}
                label="Thu /tháng"
                value={fmtCompact(summary.income)}
                color={GREEN}
              />
              <KpiPill
                icon={TrendingDown}
                label="Chi /tháng"
                value={fmtCompact(summary.totalExpense)}
                color={RED}
              />
              <KpiPill
                icon={PiggyBank}
                label="Để dành"
                value={fmtCompact(summary.save)}
                color={BRAND}
              />
              <KpiPill
                icon={Activity}
                label="Tỉ lệ TK"
                value={`${summary.savingRate}%`}
                color={
                  summary.savingRate >= 20
                    ? GREEN
                    : summary.savingRate >= 10
                      ? AMBER
                      : RED
                }
              />
            </div>
          </div>

          {/* Health score ring */}
          <div className="flex justify-center">
            <HealthScoreRing
              score={healthScore}
              color={heroColor}
              label="Sức khỏe dòng tiền"
            />
          </div>
        </div>
      </div>

      {/* ─── 2x2 DONUT GRID ─── */}
      <div className="grid sm:grid-cols-2 gap-3">
        <ReportCard
          title="Cơ cấu thu nhập"
          hint="Nguồn tiền vào"
          icon={TrendingUp}
          iconColor={GREEN}
        >
          {summary.income > 0 ? (
            <IncomeBreakdownDonut data={data} income={summary.income} />
          ) : (
            <EmptyReport msg="Chưa có thu nhập" />
          )}
        </ReportCard>

        <ReportCard
          title="Cơ cấu chi tiêu"
          hint="So với 6 quỹ JARS"
          icon={BarChart3}
          iconColor={PURPLE}
        >
          {jarsActual ? (
            <JarsDonut jars={jarsActual} income={summary.income} />
          ) : (
            <EmptyReport msg="Chưa có chi tiêu" />
          )}
        </ReportCard>

        <ReportCard
          title="Quỹ dự phòng khẩn cấp"
          hint="Tỉ lệ /tháng — KN ≥ 10%"
          icon={Shield}
          iconColor={BLUE}
        >
          <EmergencyDonut
            rate={summary.emergencyRate}
            emergency={summary.emergency}
          />
        </ReportCard>

        <ReportCard
          title="Tỉ lệ trả nợ định kỳ"
          hint="Nợ / Thu nhập — KN < 35%"
          icon={CreditCard}
          iconColor={RED}
        >
          <DebtRatioDonut
            rate={summary.debtRate}
            debt={summary.debt}
            income={summary.income}
          />
        </ReportCard>
      </div>

      {/* ─── JARS DETAIL ─── */}
      {jarsActual && summary.income > 0 && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 0% 0%, ${BRAND}1a 0%, transparent 55%),
              linear-gradient(135deg, #0d0d0d, #141414)
            `,
            border: `1px solid ${BRAND}44`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${BRAND}22`, color: BRAND }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                Chi tiết 6 quỹ JARS
              </h4>
              <div className="text-[10px] text-gray-500">
                So sánh thực tế vs khuyến nghị
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {JARS.map((j) => {
              const actual = jarsActual[j.key];
              const actualPct =
                summary.income > 0
                  ? Math.round((actual / summary.income) * 100)
                  : 0;
              return (
                <JarCard
                  key={j.key}
                  jar={j}
                  actualPct={actualPct}
                  actualVND={actual}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TIPS ─── */}
      <ActionTips summary={summary} />
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Sub-components
 * ───────────────────────────────────────────── */

function KpiPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 flex items-center gap-2.5"
      style={{
        background: `${color}0d`,
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ background: `${color}22`, color }}
      >
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold leading-tight">
          {label}
        </div>
        <div
          className="text-sm font-extrabold leading-tight"
          style={{ color }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function HealthScoreRing({
  score,
  color,
  label,
}: {
  score: number;
  color: string;
  label: string;
}) {
  const gid = useId();
  const size = 130;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`cf-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={BRAND} />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#cf-${gid})`}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold text-center leading-tight">
          {label}
        </div>
        <div
          className="text-3xl font-extrabold leading-none mt-1"
          style={{ color }}
        >
          {Math.round(score)}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">/ 100</div>
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
  icon: typeof Wallet;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${iconColor}08, transparent 70%), #0d0d0d`,
        border: `1px solid ${iconColor}33`,
      }}
    >
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${iconColor}33, ${iconColor}11)`,
            color: iconColor,
            border: `1px solid ${iconColor}44`,
          }}
        >
          <Icon size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white leading-tight">{title}</h4>
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

function IncomeBreakdownDonut({
  data,
  income,
}: {
  data: CashflowData;
  income: number;
}) {
  const inc = data.income ?? {};
  // Tổng theo 3 nhóm mới + Khác (legacy fallback)
  const salaryBase = inc.salaryBase ?? inc.personal ?? 0;
  const salary = salaryBase + (inc.salaryBonus ?? 0) + (inc.spouse ?? 0);
  const business = inc.businessProfit ?? 0;
  const newPassiveSum =
    (inc.passiveRental ?? 0) +
    (inc.passiveInvestment ?? 0) +
    (inc.passiveRoyalty ?? 0);
  const passive = newPassiveSum > 0 ? newPassiveSum : inc.passive ?? 0;
  const other = inc.other ?? 0;

  const slices = [
    { value: salary,   color: GREEN,  label: "Lương" },
    { value: business, color: BRAND,  label: "Kinh doanh" },
    { value: passive,  color: PURPLE, label: "Thụ động" },
    { value: other,    color: CYAN,   label: "Khác" },
  ];

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
    value: jars[j.key],
    color: j.color,
    label: j.fullName,
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
        centerSub={
          income > 0
            ? `${Math.round((totalExpense / income) * 100)}% thu`
            : ""
        }
      />
      <ul className="w-full mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
        {JARS.map((j) => {
          const v = jars[j.key];
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
                <span className="truncate font-bold">{j.label}</span>
              </span>
              <span
                className="font-bold whitespace-nowrap"
                style={{
                  color:
                    Math.abs(pct - j.pct) <= 3
                      ? GREEN
                      : pct > j.pct
                        ? RED
                        : AMBER,
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
  emergency: number;
}) {
  const target = 10;
  const color = rate >= target ? GREEN : rate >= target * 0.5 ? AMBER : RED;
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

function JarCard({
  jar,
  actualPct,
  actualVND,
}: {
  jar: (typeof JARS)[number];
  actualPct: number;
  actualVND: number;
}) {
  const ok = Math.abs(actualPct - jar.pct) <= 3;
  const statusColor = ok ? GREEN : actualPct > jar.pct ? RED : AMBER;
  const Icon = jar.icon;

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: `linear-gradient(135deg, ${jar.color}0d, transparent 70%), #0d0d0d`,
        border: `1px solid ${jar.color}44`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${jar.color}33, ${jar.color}11)`,
            color: jar.color,
            border: `1px solid ${jar.color}44`,
          }}
        >
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 text-[12px] font-extrabold text-white leading-tight">
            <span style={{ color: jar.color }}>{jar.label}</span>
            <span className="text-gray-500 font-normal text-[10px]">
              · {jar.fullName}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {fmtCompact(actualVND)}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-base font-extrabold leading-none"
            style={{ color: statusColor }}
          >
            {actualPct}%
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">KN {jar.pct}%</div>
        </div>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, actualPct)}%`,
            background: `linear-gradient(90deg, ${jar.color}cc, ${jar.color})`,
            boxShadow: `0 0 6px ${jar.color}55`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-px opacity-70"
          style={{
            left: `${Math.min(100, jar.pct)}%`,
            background: "#888",
          }}
        />
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
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 100% 0%, ${BRAND}1a 0%, transparent 55%),
          linear-gradient(135deg, #0d0d0d, #141414)
        `,
        border: `1px solid ${BRAND}44`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${BRAND}22`, color: BRAND }}
        >
          <Sparkles size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Lời khuyên hành động
          </h4>
          <div className="text-[10px] text-gray-500">
            Dựa trên số liệu thu chi thực tế
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {tips.map((t, i) => {
          const Icon =
            t.type === "warn"
              ? AlertCircle
              : t.type === "ok"
                ? CheckCircle2
                : Info;
          const color = t.type === "warn" ? RED : t.type === "ok" ? GREEN : BRAND;
          return (
            <div
              key={i}
              className="rounded-lg p-3 flex items-start gap-2.5"
              style={{
                background: `linear-gradient(135deg, ${color}0d, transparent)`,
                border: `1px solid ${color}33`,
              }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${color}22`, color }}
              >
                <Icon size={14} />
              </div>
              <span className="text-[11.5px] text-gray-200 leading-relaxed flex-1">
                {t.text}
              </span>
            </div>
          );
        })}
      </div>
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
  if (abs >= 1e9)
    return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}
