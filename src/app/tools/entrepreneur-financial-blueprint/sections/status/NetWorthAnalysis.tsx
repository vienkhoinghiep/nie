"use client";

/**
 * NetWorthAnalysis — báo cáo trực quan nhúng dưới NetWorthSubSection.
 * Đồng bộ phong cách "vibrant" với 3 báo cáo Tâm Thức + CashflowAnalysis:
 * hero card có score ring, KPI pills, polished donut cards, alloc bars
 * với icon nhóm tài sản.
 *
 * Phân loại 4 nhóm tài sản:
 *  · Thanh khoản: cash, savings, gold
 *  · Tăng trưởng: stocks, bonds, funds, crypto
 *  · Dòng tiền: privateEquity, rentalProperty
 *  · Tiêu sản: primaryHome, vehicles, other
 */

import { useId, useMemo } from "react";
import {
  Coins,
  PieChart,
  BarChart3,
  Wallet,
  Scale,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  Building2,
  Car,
  Landmark,
  CreditCard,
  Trophy,
  Banknote,
} from "lucide-react";
import { Donut, ProgressDonut } from "@/app/tools/can-doi-thu-chi/Donut";
import type { NetWorthData } from "@/lib/blueprint/types";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";

interface Props {
  data: NetWorthData;
}

export default function NetWorthAnalysis({ data }: Props) {
  const summary = useMemo(() => {
    const a = data.assets ?? {};
    const l = data.liabilities ?? {};

    const liquid = (a.cash ?? 0) + (a.savings ?? 0) + (a.gold ?? 0);
    const growth =
      (a.stocks ?? 0) + (a.bonds ?? 0) + (a.funds ?? 0) + (a.crypto ?? 0);
    const cashflow = (a.privateEquity ?? 0) + (a.rentalProperty ?? 0);
    const consumption =
      (a.primaryHome ?? 0) + (a.vehicles ?? 0) + (a.other ?? 0);

    const shortDebt =
      (l.creditCard ?? 0) + (l.personalLoan ?? 0) + (l.other ?? 0);
    const longDebt =
      (l.mortgage ?? 0) + (l.carLoan ?? 0) + (l.businessDebt ?? 0);

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
    // Productive ratio = growth + cashflow
    const productiveRate = growthRate + cashflowRate;

    return {
      liquid, growth, cashflow, consumption,
      shortDebt, longDebt, totalAssets, totalDebt, netWorth,
      liquidityRate, growthRate, cashflowRate, consumptionRate,
      debtRatio, productiveRate,
    };
  }, [data]);

  const hasInputs = summary.totalAssets > 0 || summary.totalDebt > 0;
  if (!hasInputs) return null;

  const netWorthPositive = summary.netWorth >= 0;
  const heroColor = netWorthPositive ? GREEN : RED;

  // Health score: weighted by net worth status + leverage + productive ratio
  const healthScore = Math.max(
    0,
    Math.min(
      100,
      (netWorthPositive ? 50 : 0) +
        Math.max(0, 50 - summary.debtRatio) * 0.5 +
        Math.min(50, summary.productiveRate) * 0.5
    )
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
            <Scale size={10} />
            Báo cáo cân đối tài sản
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
                {netWorthPositive ? "💎" : "⚠️"}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Tài sản ròng (Net Worth)
                </div>
                <h3
                  className="text-2xl sm:text-3xl font-extrabold leading-tight"
                  style={{ color: heroColor }}
                >
                  {netWorthPositive ? "" : "-"}
                  {fmtVND(Math.abs(summary.netWorth))}
                </h3>
                <div className="text-xs text-gray-500 italic mt-0.5">
                  {netWorthPositive
                    ? "Tài sản ròng dương — đang tích lũy"
                    : "Tài sản ròng âm — nợ cao hơn tài sản, cần ưu tiên trả nợ"}
                </div>
              </div>
            </div>

            {/* 4 KPI pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <KpiPill
                icon={Banknote}
                label="Tài sản"
                value={fmtCompact(summary.totalAssets)}
                color={GREEN}
              />
              <KpiPill
                icon={CreditCard}
                label="Nợ"
                value={fmtCompact(summary.totalDebt)}
                color={RED}
              />
              <KpiPill
                icon={Scale}
                label="Đòn bẩy"
                value={`${summary.debtRatio}%`}
                color={
                  summary.debtRatio <= 50
                    ? GREEN
                    : summary.debtRatio <= 70
                      ? AMBER
                      : RED
                }
              />
              <KpiPill
                icon={TrendingUp}
                label="Sinh lời"
                value={`${summary.productiveRate}%`}
                color={
                  summary.productiveRate >= 50
                    ? GREEN
                    : summary.productiveRate >= 30
                      ? AMBER
                      : RED
                }
              />
            </div>
          </div>

          <div className="flex justify-center">
            <HealthScoreRing
              score={healthScore}
              color={heroColor}
              label="Sức khỏe tài sản"
            />
          </div>
        </div>
      </div>

      {/* ─── 2x2 DONUT GRID ─── */}
      <div className="grid sm:grid-cols-2 gap-3">
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

        <ReportCard
          title="Tỉ lệ thanh khoản"
          hint="Mục tiêu ≈ 20% tổng TS"
          icon={Wallet}
          iconColor={BLUE}
        >
          <LiquidityRingDonut summary={summary} />
        </ReportCard>

        <ReportCard
          title="Tỉ lệ đòn bẩy nợ"
          hint="Nợ / Tổng TS — an toàn < 50%"
          icon={Scale}
          iconColor={AMBER}
        >
          <LeverageRingDonut summary={summary} />
        </ReportCard>
      </div>

      {/* ─── ALLOC DETAIL (4 nhóm có icon) ─── */}
      {summary.totalAssets > 0 && (
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
                Chi tiết 4 nhóm tài sản
              </h4>
              <div className="text-[10px] text-gray-500">
                So sánh thực tế vs khuyến nghị chuẩn
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            <AllocCard
              icon={Coins}
              label="Thanh khoản"
              sub="Tiền mặt + tiết kiệm KKH + vàng"
              actualPct={summary.liquidityRate}
              target={20}
              tolerance={10}
              value={summary.liquid}
              color={BLUE}
              targetText="≈ 20%"
            />
            <AllocCard
              icon={TrendingUp}
              label="Tăng trưởng"
              sub="Cổ phiếu + quỹ + trái phiếu + crypto"
              actualPct={summary.growthRate}
              target={30}
              tolerance={50}
              value={summary.growth}
              color={GREEN}
              targetText="≥ 30%"
              higherBetter
            />
            <AllocCard
              icon={Building2}
              label="Dòng tiền"
              sub="BĐS cho thuê + cổ phần DN"
              actualPct={summary.cashflowRate}
              target={20}
              tolerance={50}
              value={summary.cashflow}
              color={BRAND}
              targetText="≥ 20%"
              higherBetter
            />
            <AllocCard
              icon={Car}
              label="Tiêu sản"
              sub="Nhà ở + xe + đồ cá nhân"
              actualPct={summary.consumptionRate}
              target={30}
              tolerance={20}
              value={summary.consumption}
              color={PURPLE}
              targetText="≤ 30%"
              lowerBetter
            />
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
  icon: typeof Coins;
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
          <linearGradient id={`nw-${gid}`} x1="0" y1="0" x2="1" y2="1">
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
          stroke={`url(#nw-${gid})`}
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
  icon: typeof Coins;
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
    { value: summary.liquid,       color: BLUE,   label: "Thanh khoản" },
    { value: summary.growth,       color: GREEN,  label: "Tăng trưởng" },
    { value: summary.cashflow,     color: BRAND,  label: "Dòng tiền" },
    { value: summary.consumption,  color: PURPLE, label: "Tiêu sản" },
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
          const pct =
            summary.totalAssets > 0
              ? Math.round((s.value / summary.totalAssets) * 100)
              : 0;
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

function DebtBreakdownDonut({
  summary,
}: {
  summary: { shortDebt: number; longDebt: number; totalDebt: number };
}) {
  const slices = [
    { value: summary.shortDebt, color: AMBER, label: "Ngắn hạn" },
    { value: summary.longDebt,  color: RED,   label: "Dài hạn" },
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
          <span className="text-gray-400">Tiền thanh khoản</span>
          <span className="text-white font-bold">
            {fmtCompact(summary.liquid)}
          </span>
        </div>
        <p
          className="text-[10px] mt-1 pt-1.5 border-t border-[#1f1f1f] leading-snug"
          style={{ color }}
        >
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
          <span className="text-white font-bold">
            {fmtCompact(summary.totalDebt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Tổng tài sản</span>
          <span className="font-bold text-gray-300">
            {fmtCompact(summary.totalAssets)}
          </span>
        </div>
        <p
          className="text-[10px] mt-1 pt-1.5 border-t border-[#1f1f1f] leading-snug"
          style={{ color }}
        >
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

function AllocCard({
  icon: Icon,
  label,
  sub,
  actualPct,
  target,
  tolerance,
  value,
  color,
  targetText,
  higherBetter,
  lowerBetter,
}: {
  icon: typeof Coins;
  label: string;
  sub: string;
  actualPct: number;
  target: number;
  tolerance: number;
  value: number;
  color: string;
  targetText: string;
  higherBetter?: boolean;
  lowerBetter?: boolean;
}) {
  let verdict: "ok" | "low" | "high";
  if (higherBetter) {
    verdict = actualPct >= target ? "ok" : "low";
  } else if (lowerBetter) {
    verdict = actualPct <= target ? "ok" : "high";
  } else {
    verdict =
      Math.abs(actualPct - target) <= tolerance
        ? "ok"
        : actualPct > target
          ? "high"
          : "low";
  }
  const statusColor = verdict === "ok" ? GREEN : verdict === "high" ? RED : AMBER;
  const verdictText =
    verdict === "ok" ? "Đạt KN" : verdict === "high" ? "Quá cao" : "Thiếu";

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: `linear-gradient(135deg, ${color}0d, transparent 70%), #0d0d0d`,
        border: `1px solid ${color}44`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}33, ${color}11)`,
            color,
            border: `1px solid ${color}44`,
          }}
        >
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-extrabold text-white leading-tight">
            {label}
          </div>
          <div className="text-[9px] text-gray-500 truncate">{sub}</div>
        </div>
        <div className="text-right">
          <div
            className="text-base font-extrabold leading-none"
            style={{ color: statusColor }}
          >
            {actualPct}%
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">KN {targetText}</div>
        </div>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden mb-2"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, actualPct)}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 6px ${color}55`,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-px opacity-70"
          style={{ left: `${Math.min(100, target)}%`, background: "#888" }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-500">{fmtCompact(value)}</span>
        <span
          className="px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider"
          style={{ background: `${statusColor}22`, color: statusColor }}
        >
          {verdictText}
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
          <Trophy size={16} />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Lời khuyên hành động
          </h4>
          <div className="text-[10px] text-gray-500">
            Dựa trên cơ cấu tài sản & nợ thực tế
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

// Suppress unused (Landmark reserved for future long-debt icon if needed)
void Landmark;
