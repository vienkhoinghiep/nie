"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Briefcase,
  TrendingUp,
  Home,
  Shield,
  Sparkles,
  RefreshCw,
  Info,
  Banknote,
  PiggyBank,
  Gem,
  ArrowRight,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";
const CYAN = "#06b6d4";
const PINK = "#ec4899";

const STORAGE_KEY = "tc_cashflow_map_v1";

/* ─────────────────────────────────────────────
 *  Form state
 * ───────────────────────────────────────────── */

// Hằng số chuẩn theo VINEN
const ESSENTIAL_CAP_PCT = 55; // trần chi thiết yếu = 55% thu nhập
const EMERGENCY_MONTHS = 12; // mục tiêu thoát nghèo = 12 tháng chi tiêu thiết yếu

interface FormState {
  // 3 income sources
  salary: number;
  business: number;
  passive: number;

  // Chi tiêu thiết yếu — nhập tay (cap 55% TN)
  essentialActual: number;

  // Allocation %
  safetyPct: number; // mặc định 10% (BH — tính trên lương chủ động)
  ffaPct: number; // 10%
  eduPct: number; // 10%
  playPct: number; // 10%
  givePct: number; // 5%

  // Số dư dự phòng hiện có (3 nguồn)
  cash: number;
  savings: number;
  gold: number;
}

const DEFAULT_STATE: FormState = {
  salary: 25_000_000,
  business: 0,
  passive: 0,
  essentialActual: 0,
  safetyPct: 10,
  ffaPct: 10,
  eduPct: 10,
  playPct: 10,
  givePct: 5,
  cash: 0,
  savings: 0,
  gold: 0,
};

/* ─────────────────────────────────────────────
 *  Component
 * ───────────────────────────────────────────── */

export default function CashFlowMapTool() {
  const [form, setForm] = useState<FormState>(DEFAULT_STATE);
  const [touched, setTouched] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const j = JSON.parse(cached);
        if (j && typeof j === "object")
          setForm({ ...DEFAULT_STATE, ...j });
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

  const set = (k: keyof FormState, v: number) => {
    setTouched(true);
    setForm((f) => ({ ...f, [k]: v }));
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

  const result = useMemo(() => {
    const totalIncome = form.salary + form.business + form.passive;
    const activeIncome = form.salary + form.business;

    // Trần chi thiết yếu = 55% TN (VINEN chuẩn)
    const essentialCap = Math.round((totalIncome * ESSENTIAL_CAP_PCT) / 100);
    // Chi thực tế nhập tay — cap lại nếu vượt trần để cascade không lệch
    const essentialActual = Math.min(form.essentialActual, essentialCap);
    const essentialOverCap = form.essentialActual > essentialCap;
    // Phần dư = cap − thực tế → đẩy thẳng vào FFA (bonus tiết kiệm)
    const essentialSavings = Math.max(0, essentialCap - essentialActual);

    // Mục tiêu /tháng từng quỹ
    const safetyBudget = Math.round(
      (activeIncome * form.safetyPct) / 100
    );
    const ffaBudget = Math.round((totalIncome * form.ffaPct) / 100);
    const eduBudget = Math.round((totalIncome * form.eduPct) / 100);
    const playBudget = Math.round((totalIncome * form.playPct) / 100);
    const giveBudget = Math.round((totalIncome * form.givePct) / 100);

    // Quỹ dự phòng — target = CHI TIÊU THIẾT YẾU × 12 (ngưỡng Thoát Nghèo)
    const emergencyTarget = essentialActual * EMERGENCY_MONTHS;
    const emergencyCurrent = form.cash + form.savings + form.gold;
    const emergencyPct =
      emergencyTarget > 0
        ? Math.min(100, Math.round((emergencyCurrent / emergencyTarget) * 100))
        : 0;
    const emergencyFull = emergencyCurrent >= emergencyTarget && emergencyTarget > 0;

    // Cascade flow /tháng
    // Phần dư sau khi trừ chi thiết yếu thực tế
    const afterEssential = totalIncome - essentialActual;

    let monthlyEmergency = 0;
    let monthlySafety = 0;
    let monthlyFFA = 0;
    let monthlyEDU = 0;
    let monthlyPLAY = 0;
    let monthlyGIVE = 0;

    // Bonus FFA luôn được nhận trước (phần tiết kiệm từ chi thiết yếu)
    // Lấy từ afterEssential — nếu thầy chi ít hơn 55% thì phần đó đi thẳng FFA
    const ffaBonus = Math.min(essentialSavings, afterEssential);
    monthlyFFA += ffaBonus;
    const afterFFABonus = afterEssential - ffaBonus;

    if (!emergencyFull) {
      // Đang xây quỹ dự phòng — toàn bộ surplus còn lại dồn vào emergency
      monthlyEmergency = Math.max(
        0,
        Math.min(afterFFABonus, emergencyTarget - emergencyCurrent)
      );
    } else {
      // Quỹ dự phòng đầy — chảy tràn xuống safety + invest
      monthlySafety = Math.min(afterFFABonus, safetyBudget);
      const afterSafety = afterFFABonus - monthlySafety;
      // 4 quỹ đầu tư = ffa + edu + play + give (theo % thầy nhập)
      const investTotal = ffaBudget + eduBudget + playBudget + giveBudget;
      if (investTotal > 0 && afterSafety > 0) {
        const ratio = Math.min(1, afterSafety / investTotal);
        monthlyFFA += Math.round(ffaBudget * ratio);
        monthlyEDU = Math.round(eduBudget * ratio);
        monthlyPLAY = Math.round(playBudget * ratio);
        monthlyGIVE = Math.round(giveBudget * ratio);
      }
    }

    // Months remaining to fill emergency
    const monthsToFillEmergency =
      !emergencyFull && monthlyEmergency > 0
        ? Math.ceil((emergencyTarget - emergencyCurrent) / monthlyEmergency)
        : 0;

    // Tỉ lệ tổng phân bổ — phải = 100% (55 + safety + 4 invest)
    const totalPctAllocated =
      ESSENTIAL_CAP_PCT +
      form.safetyPct +
      form.ffaPct +
      form.eduPct +
      form.playPct +
      form.givePct;

    return {
      totalIncome,
      activeIncome,
      essentialCap,
      essentialActual,
      essentialOverCap,
      essentialSavings,
      ffaBonus,
      safetyBudget,
      ffaBudget,
      eduBudget,
      playBudget,
      giveBudget,
      emergencyTarget,
      emergencyCurrent,
      emergencyPct,
      emergencyFull,
      afterEssential,
      monthlyEmergency,
      monthlySafety,
      monthlyFFA,
      monthlyEDU,
      monthlyPLAY,
      monthlyGIVE,
      monthsToFillEmergency,
      totalPctAllocated,
    };
  }, [form]);

  const hasIncome = result.totalIncome > 0;

  return (
    <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
          style={{
            background: `${CYAN}1a`,
            color: CYAN,
            border: `1px solid ${CYAN}55`,
          }}
        >
          <Activity size={11} />
          Bản đồ dòng tiền · Bucket Cascade
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
          Hoạch Định <span style={{ color: BRAND }}>Dòng Tiền</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Thiết kế dòng chảy thu nhập theo mô hình{" "}
          <strong className="text-white">xô chảy tràn</strong>: Thiết yếu →
          Dự phòng → An toàn (BH) → Đầu tư (Tự do TC · Học tập · Sống · Tích phước).
        </p>
      </div>

      {/* Big income summary */}
      <div
        className="rounded-2xl p-4 sm:p-6 mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-5 items-center"
        style={{
          background: `linear-gradient(135deg, ${CYAN}14, transparent)`,
          border: `1px solid ${CYAN}55`,
        }}
      >
        <div className="col-span-2 sm:col-span-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            Thu Nhập Gia Đình /tháng
          </div>
          <div
            className="text-3xl sm:text-4xl font-extrabold leading-tight"
            style={{ color: BRAND }}
          >
            {fmtCompact(result.totalIncome)}
          </div>
          <div className="text-[10px] mt-1 text-gray-500 font-medium">
            Lương {fmtCompact(form.salary)} + KD {fmtCompact(form.business)} +
            TĐ {fmtCompact(form.passive)}
          </div>
        </div>
        <MiniStat
          label="Chi thiết yếu (thực)"
          value={result.essentialActual}
          color={result.essentialOverCap ? RED : AMBER}
          note={
            result.essentialOverCap
              ? `⚠ vượt cap 55%`
              : `cap ${fmtCompact(result.essentialCap)}`
          }
        />
        <MiniStat
          label="An toàn (BH)"
          value={result.safetyBudget}
          color={GREEN}
          note={`${form.safetyPct}% lương`}
        />
        <MiniStat
          label="Đầu tư /tháng"
          value={result.ffaBudget + result.eduBudget + result.playBudget + result.giveBudget}
          color={PURPLE}
          note={`${form.ffaPct + form.eduPct + form.playPct + form.givePct}%`}
        />
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4 lg:gap-5 items-start">
        {/* ─── LEFT: Form ─── */}
        <div className="space-y-3">
          {/* Income */}
          <Section icon={Wallet} label="3 nguồn thu nhập" color={CYAN}>
            <NumField
              label="Lương /tháng"
              value={form.salary}
              onChange={(v) => set("salary", v)}
              icon={Wallet}
              suffix="₫"
              accent={CYAN}
            />
            <NumField
              label="Kinh doanh /tháng"
              value={form.business}
              onChange={(v) => set("business", v)}
              icon={Briefcase}
              suffix="₫"
              accent={CYAN}
            />
            <NumField
              label="Thụ động /tháng (cho thuê, cổ tức)"
              value={form.passive}
              onChange={(v) => set("passive", v)}
              icon={TrendingUp}
              suffix="₫"
              accent={CYAN}
            />
          </Section>

          {/* Chi thiết yếu — nhập tay, cap 55% */}
          <Section icon={Home} label="Chi tiêu thiết yếu" color={RED}>
            <NumField
              label="Chi thực tế /tháng (ăn, điện nước, đi lại…)"
              value={form.essentialActual}
              onChange={(v) => set("essentialActual", v)}
              icon={Home}
              suffix="₫"
              accent={RED}
            />
            <div
              className="flex items-center justify-between text-[10.5px] pt-1 border-t border-[#1f1f1f]"
              style={{
                color: result.essentialOverCap
                  ? RED
                  : result.essentialActual > 0
                    ? GREEN
                    : "#525252",
              }}
            >
              <span className="font-bold uppercase tracking-wider">
                Trần 55% TN
              </span>
              <span className="font-extrabold">
                {fmtCompact(result.essentialCap)}{" "}
                {result.essentialOverCap
                  ? "⚠ vượt"
                  : result.essentialActual > 0
                    ? "✓ trong trần"
                    : ""}
              </span>
            </div>
            {result.essentialSavings > 0 && (
              <div
                className="text-[10px] leading-snug px-2 py-1 rounded"
                style={{
                  background: `${PURPLE}10`,
                  color: PURPLE,
                  border: `1px solid ${PURPLE}33`,
                }}
              >
                💎 Tiết kiệm được{" "}
                <strong>{fmtCompact(result.essentialSavings)}/th</strong> so
                với trần 55% → tự động dồn vào{" "}
                <strong>Quỹ FFA</strong>.
              </div>
            )}
          </Section>

          {/* Allocation % của 5 quỹ còn lại */}
          <Section icon={Activity} label="Tỉ lệ phân bổ (%)" color={BRAND}>
            <PctField
              label="An toàn TC — BH (% lương chủ động)"
              value={form.safetyPct}
              onChange={(v) => set("safetyPct", v)}
              accent={GREEN}
            />
            <PctField
              label="ĐT Tự do TC (FFA)"
              value={form.ffaPct}
              onChange={(v) => set("ffaPct", v)}
              accent={PURPLE}
            />
            <PctField
              label="ĐT Học tập (EDU)"
              value={form.eduPct}
              onChange={(v) => set("eduPct", v)}
              accent={BLUE}
            />
            <PctField
              label="ĐT Phong cách sống (PLAY)"
              value={form.playPct}
              onChange={(v) => set("playPct", v)}
              accent={PINK}
            />
            <PctField
              label="ĐT Tích phước (GIVE)"
              value={form.givePct}
              onChange={(v) => set("givePct", v)}
              accent={AMBER}
            />
            <div
              className="flex items-center justify-between text-[10.5px] pt-1.5 border-t border-[#1f1f1f]"
              style={{
                color: result.totalPctAllocated === 100 ? GREEN : AMBER,
              }}
            >
              <span className="font-bold uppercase tracking-wider">
                Tổng (55 + 5 quỹ)
              </span>
              <span className="font-extrabold">
                {result.totalPctAllocated}%{" "}
                {result.totalPctAllocated === 100 ? "✓" : "⚠"}
              </span>
            </div>
          </Section>

          {/* Emergency target & current */}
          <Section icon={Shield} label="Quỹ Dự Phòng" color={BLUE}>
            <div
              className="rounded-md px-2 py-1.5 text-[10.5px] leading-snug"
              style={{
                background: `${BLUE}10`,
                color: BLUE,
                border: `1px solid ${BLUE}33`,
              }}
            >
              🎯 <strong>Mục tiêu Thoát Nghèo</strong> = Chi thiết yếu × 12
              tháng = <strong>{fmtCompact(result.emergencyTarget)}</strong>
              <div className="text-[9.5px] text-gray-400 mt-0.5">
                (theo chi thiết yếu khách nhập — bên trên)
              </div>
            </div>
            <div className="pt-1 border-t border-[#1f1f1f] space-y-2">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Số dư hiện có (3 nguồn)
              </div>
              <NumField
                label="Tiền mặt + tiết kiệm KKH"
                value={form.cash}
                onChange={(v) => set("cash", v)}
                icon={Banknote}
                suffix="₫"
                accent={GREEN}
              />
              <NumField
                label="Sổ tiết kiệm CKH"
                value={form.savings}
                onChange={(v) => set("savings", v)}
                icon={PiggyBank}
                suffix="₫"
                accent={BLUE}
              />
              <NumField
                label="Vàng"
                value={form.gold}
                onChange={(v) => set("gold", v)}
                icon={Gem}
                suffix="₫"
                accent={AMBER}
              />
            </div>
            <p className="text-[10px] text-gray-500 leading-snug pt-1 border-t border-[#1f1f1f]">
              💡 Sau khi trừ chi thiết yếu, dòng tiền chảy thẳng vào dự phòng
              cho đầy. Khi đầy → mở khoá chảy tràn xuống các quỹ khác.
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

        {/* ─── RIGHT: Bucket Map ─── */}
        <div className="space-y-4">
          {!hasIncome && (
            <div
              className="rounded-2xl p-10 sm:p-16 text-center"
              style={{ background: "#141414", border: "1px dashed #2a2a2a" }}
            >
              <Activity size={56} className="mx-auto text-gray-700 mb-4" />
              <div className="text-base sm:text-lg font-bold text-gray-400 mb-1">
                Bản đồ dòng tiền sẽ hiển thị ở đây
              </div>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Nhập thu nhập 3 nguồn ở bên trái để xem bản đồ xô chảy tràn.
              </p>
            </div>
          )}

          {hasIncome && (
            <>
              <BucketMap form={form} result={result} />
              <StatusBanner result={result} form={form} />
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
 *  BucketMap — mô hình bậc thang dòng tiền (1 SVG canvas)
 *  Tầng 1: 3 nguồn thu nhập → đổ vào Income (Tầng 2)
 *  Tầng 2 đáy → Chi tiêu thiết yếu (Tầng 3a)
 *  Tầng 2 miệng phải → Quỹ Dự phòng (Tầng 3b)
 *  Dự phòng đầy → tràn ngang sang An Toàn TC (Tầng 4)
 *  An Toàn đầy → tràn ngang sang Đầu Tư (Tầng 5)
 *  Đầu Tư đáy → 4 quỹ con: EDU · FFA · PLAY · GIVE (Tầng 6)
 * ───────────────────────────────────────────── */

function BucketMap({
  form,
  result,
}: {
  form: FormState;
  result: {
    totalIncome: number;
    activeIncome: number;
    essentialCap: number;
    essentialActual: number;
    essentialOverCap: boolean;
    essentialSavings: number;
    ffaBonus: number;
    safetyBudget: number;
    ffaBudget: number;
    eduBudget: number;
    playBudget: number;
    giveBudget: number;
    emergencyTarget: number;
    emergencyCurrent: number;
    emergencyPct: number;
    emergencyFull: boolean;
    afterEssential: number;
    monthlyEmergency: number;
    monthlySafety: number;
    monthlyFFA: number;
    monthlyEDU: number;
    monthlyPLAY: number;
    monthlyGIVE: number;
    monthsToFillEmergency: number;
  };
}) {
  const uid = useId().replace(/:/g, "");

  // Fill percentages
  const essentialFillPct =
    result.essentialCap > 0
      ? Math.min(
          100,
          Math.round((result.essentialActual / result.essentialCap) * 100)
        )
      : 0;
  const safetyFillPct =
    result.emergencyFull && result.safetyBudget > 0
      ? Math.round((result.monthlySafety / result.safetyBudget) * 100)
      : 0;
  const investFillPct = result.emergencyFull ? 100 : 0;

  type BucketCfg = {
    id: string;
    cx: number;
    cy: number;
    w: number;
    h: number;
    color: string;
    pct: number;
    label: string;
    value: number;
    unit?: string;
    placement: "above" | "inside";
    isBig?: boolean;
    isTiny?: boolean;
  };

  const buckets: BucketCfg[] = [
    // Tầng 1: 3 income mini buckets
    {
      id: "salary",
      cx: 100,
      cy: 70,
      w: 120,
      h: 100,
      color: CYAN,
      pct: form.salary > 0 ? 100 : 0,
      label: "Lương",
      value: form.salary,
      unit: "/th",
      placement: "above",
    },
    {
      id: "business",
      cx: 260,
      cy: 70,
      w: 120,
      h: 100,
      color: CYAN,
      pct: form.business > 0 ? 100 : 0,
      label: "Kinh doanh",
      value: form.business,
      unit: "/th",
      placement: "above",
    },
    {
      id: "passive",
      cx: 420,
      cy: 70,
      w: 120,
      h: 100,
      color: CYAN,
      pct: form.passive > 0 ? 100 : 0,
      label: "TNTĐ",
      value: form.passive,
      unit: "/th",
      placement: "above",
    },
    // Tầng 2: Family income (lương — tổng 3 nguồn)
    {
      id: "income",
      cx: 260,
      cy: 300,
      w: 420,
      h: 180,
      color: BRAND,
      pct: result.totalIncome > 0 ? 100 : 0,
      label: "Thu Nhập Gia Đình",
      value: result.totalIncome,
      unit: "/tháng",
      placement: "inside",
      isBig: true,
    },
    // Tầng 3a: Chi thiết yếu (dưới income, cùng cột)
    {
      id: "essential",
      cx: 260,
      cy: 600,
      w: 300,
      h: 150,
      color: result.essentialOverCap ? RED : AMBER,
      pct: essentialFillPct,
      label: "Chi Tiêu Thiết Yếu",
      value: result.essentialActual,
      unit: `/ trần ${fmtCompact(result.essentialCap)}`,
      placement: "inside",
    },
    // Tầng 3b: Quỹ Dự Phòng (phải income, bậc thang xuống)
    {
      id: "emergency",
      cx: 740,
      cy: 510,
      w: 300,
      h: 150,
      color: BLUE,
      pct: result.emergencyPct,
      label: "Quỹ Dự Phòng",
      value: result.emergencyCurrent,
      unit: `/ ${fmtCompact(result.emergencyTarget)}`,
      placement: "inside",
    },
    // Tầng 4: An Toàn TC (phải emergency, bậc tiếp)
    {
      id: "safety",
      cx: 1100,
      cy: 690,
      w: 280,
      h: 140,
      color: GREEN,
      pct: safetyFillPct,
      label: "Quỹ An Toàn TC",
      value: result.monthlySafety,
      unit: "/tháng (BH)",
      placement: "inside",
    },
    // Tầng 5: Quỹ Đầu Tư (phải safety, bậc tiếp)
    {
      id: "invest",
      cx: 1380,
      cy: 850,
      w: 320,
      h: 150,
      color: PURPLE,
      pct: investFillPct,
      label: "Quỹ Đầu Tư",
      value:
        result.monthlyFFA +
        result.monthlyEDU +
        result.monthlyPLAY +
        result.monthlyGIVE,
      unit: "/tháng",
      placement: "inside",
    },
    // Tầng 6: 4 quỹ con dưới Đầu tư
    {
      id: "edu",
      cx: 1260,
      cy: 1030,
      w: 70,
      h: 80,
      color: BLUE,
      pct:
        result.eduBudget > 0
          ? Math.round((result.monthlyEDU / result.eduBudget) * 100)
          : 0,
      label: "EDU",
      value: result.monthlyEDU,
      placement: "above",
      isTiny: true,
    },
    {
      id: "ffa",
      cx: 1340,
      cy: 1030,
      w: 70,
      h: 80,
      color: PURPLE,
      pct:
        result.ffaBudget > 0
          ? Math.round((result.monthlyFFA / result.ffaBudget) * 100)
          : 0,
      label: "FFA",
      value: result.monthlyFFA,
      placement: "above",
      isTiny: true,
    },
    {
      id: "play",
      cx: 1420,
      cy: 1030,
      w: 70,
      h: 80,
      color: PINK,
      pct:
        result.playBudget > 0
          ? Math.round((result.monthlyPLAY / result.playBudget) * 100)
          : 0,
      label: "PLAY",
      value: result.monthlyPLAY,
      placement: "above",
      isTiny: true,
    },
    {
      id: "give",
      cx: 1500,
      cy: 1030,
      w: 70,
      h: 80,
      color: AMBER,
      pct:
        result.giveBudget > 0
          ? Math.round((result.monthlyGIVE / result.giveBudget) * 100)
          : 0,
      label: "GIVE",
      value: result.monthlyGIVE,
      placement: "above",
      isTiny: true,
    },
  ];

  type PipeCfg = { id: string; d: string; color: string; active: boolean };
  const pipes: PipeCfg[] = [
    // Tầng 1 → 2: 3 ống dọc đổ vào miệng xô income
    {
      id: "p-sal",
      d: "M 100 120 C 100 170, 200 180, 200 210",
      color: CYAN,
      active: form.salary > 0,
    },
    {
      id: "p-biz",
      d: "M 260 120 L 260 210",
      color: CYAN,
      active: form.business > 0,
    },
    {
      id: "p-pas",
      d: "M 420 120 C 420 170, 320 180, 320 210",
      color: CYAN,
      active: form.passive > 0,
    },
    // Income đáy → Essential top (thẳng xuống)
    {
      id: "p-ess",
      d: "M 260 390 L 260 525",
      color: RED,
      active: result.essentialActual > 0,
    },
    // Income miệng phải (overflow) → Emergency top (cong sang phải-xuống)
    {
      id: "p-ovf",
      d: "M 470 240 C 590 240, 640 410, 740 435",
      color: BRAND,
      active: result.afterEssential > 0,
    },
    // Emergency right → Safety top (bậc thang)
    {
      id: "p-saf",
      d: "M 890 485 C 990 485, 1030 600, 1100 620",
      color: GREEN,
      active: result.emergencyFull,
    },
    // Safety right → Invest top (bậc thang)
    {
      id: "p-inv",
      d: "M 1240 665 C 1330 665, 1350 760, 1380 775",
      color: PURPLE,
      active: result.emergencyFull,
    },
    // Invest đáy → 4 children (4 ống dọc)
    {
      id: "p-edu",
      d: "M 1260 925 L 1260 990",
      color: BLUE,
      active: result.monthlyEDU > 0,
    },
    {
      id: "p-ffa",
      d: "M 1340 925 L 1340 990",
      color: PURPLE,
      active: result.monthlyFFA > 0,
    },
    {
      id: "p-play",
      d: "M 1420 925 L 1420 990",
      color: PINK,
      active: result.monthlyPLAY > 0,
    },
    {
      id: "p-give",
      d: "M 1500 925 L 1500 990",
      color: AMBER,
      active: result.monthlyGIVE > 0,
    },
  ];

  // Trapezoid path generator
  const pathStr = (cx: number, cy: number, w: number, h: number) => {
    const left = cx - w / 2;
    const right = cx + w / 2;
    const top = cy - h / 2;
    const bot = cy + h / 2;
    const inset = Math.max(6, w * 0.08);
    return `M ${left} ${top} L ${right} ${top} L ${right - inset} ${bot - 6} Q ${right - inset} ${bot} ${right - inset - 5} ${bot} L ${left + inset + 5} ${bot} Q ${left + inset} ${bot} ${left + inset} ${bot - 6} Z`;
  };

  return (
    <div
      className="rounded-2xl p-3 sm:p-5"
      style={{ background: "#141414", border: "1px solid #232323" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} style={{ color: BRAND }} />
        <div className="text-[11px] font-bold uppercase tracking-widest text-white">
          Bản đồ bậc thang dòng tiền
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 sm:-mx-5 px-3 sm:px-5">
        <svg
          viewBox="0 0 1600 1110"
          className="block"
          style={{ width: "100%", minWidth: 760, height: "auto" }}
        >
          {/* Pipes layer (draw under buckets) */}
          {pipes.map((p) => (
            <g key={p.id}>
              <path
                d={p.d}
                stroke={p.color}
                strokeWidth={8}
                fill="none"
                opacity={p.active ? 0.85 : 0.22}
                strokeLinecap="round"
              />
              {/* Inner highlight */}
              <path
                d={p.d}
                stroke="#ffffff"
                strokeWidth={1.8}
                fill="none"
                opacity={p.active ? 0.3 : 0.08}
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Outlet markers cho Income bucket */}
          <circle
            cx={260}
            cy={395}
            r="6"
            fill={RED}
            stroke="#0a0a0a"
            strokeWidth="1.8"
          />
          <circle
            cx={470}
            cy={240}
            r="6"
            fill={BRAND}
            stroke="#0a0a0a"
            strokeWidth="1.8"
          />

          {/* Buckets layer */}
          {buckets.map((b) => {
            const path = pathStr(b.cx, b.cy, b.w, b.h);
            const top = b.cy - b.h / 2;
            const bot = b.cy + b.h / 2;
            const safePct = Math.max(0, Math.min(100, b.pct));
            const waterY = top + ((100 - safePct) / 100) * b.h;
            const clipId = `clip-${uid}-${b.id}`;
            const gradId = `grad-${uid}-${b.id}`;
            const labelFs = b.isBig ? 17 : b.isTiny ? 11 : 13;
            const valueFs = b.isBig ? 19 : b.isTiny ? 12 : 15;

            return (
              <g key={b.id}>
                <defs>
                  <clipPath id={clipId}>
                    <path d={path} />
                  </clipPath>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={b.color} stopOpacity="0.72" />
                    <stop offset="1" stopColor={b.color} stopOpacity="0.32" />
                  </linearGradient>
                </defs>
                {/* Inner shadow miệng */}
                <ellipse
                  cx={b.cx}
                  cy={top + 2}
                  rx={b.w / 2 - 4}
                  ry={3.5}
                  fill="#000"
                  opacity={0.35}
                />
                {/* Water fill */}
                {safePct > 0 && (
                  <rect
                    x={b.cx - b.w / 2 - 10}
                    y={waterY}
                    width={b.w + 20}
                    height={bot - waterY + 10}
                    fill={`url(#${gradId})`}
                    clipPath={`url(#${clipId})`}
                  />
                )}
                {/* Outline */}
                <path
                  d={path}
                  fill="none"
                  stroke={b.color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
                {/* Top rim ellipse */}
                <ellipse
                  cx={b.cx}
                  cy={top}
                  rx={b.w / 2}
                  ry={3.5}
                  fill="none"
                  stroke={b.color}
                  strokeWidth={2}
                />

                {/* Label */}
                {b.placement === "above" && (
                  <text
                    x={b.cx}
                    y={top - 10}
                    textAnchor="middle"
                    fontSize={b.isTiny ? 11 : 12}
                    fontWeight={700}
                    fill={b.color}
                  >
                    {b.label}
                  </text>
                )}
                {b.placement === "inside" && (
                  <text
                    x={b.cx}
                    y={b.cy + 5}
                    textAnchor="middle"
                    fontSize={labelFs}
                    fontWeight={800}
                    fill="white"
                    opacity={0.96}
                  >
                    {b.label}
                  </text>
                )}

                {/* Value below */}
                <text
                  x={b.cx}
                  y={bot + (b.isTiny ? 18 : 26)}
                  textAnchor="middle"
                  fontSize={valueFs}
                  fontWeight={800}
                  fill={b.color}
                >
                  {fmtCompact(b.value)}
                </text>
                {b.unit && (
                  <text
                    x={b.cx}
                    y={bot + (b.isTiny ? 32 : 42)}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#888"
                  >
                    {b.unit}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* FFA bonus banner */}
      {result.ffaBonus > 0 && (
        <div
          className="mt-3 px-3 py-1.5 rounded-md text-[11px] leading-snug"
          style={{
            background: `${PURPLE}10`,
            color: PURPLE,
            border: `1px solid ${PURPLE}44`,
          }}
        >
          💎 Phần dư <strong>{fmtCompact(result.ffaBonus)}/tháng</strong> từ
          chi thiết yếu (cap − thực tế) → dồn thẳng vào{" "}
          <strong>Quỹ FFA</strong> (không qua dự phòng).
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Status banner + tips
 * ───────────────────────────────────────────── */

function StatusBanner({
  result,
  form,
}: {
  result: {
    emergencyFull: boolean;
    emergencyPct: number;
    monthsToFillEmergency: number;
    monthlyEmergency: number;
  };
  form: FormState;
}) {
  if (result.emergencyFull) {
    return (
      <div
        className="rounded-2xl p-4 flex items-start gap-3"
        style={{
          background: `linear-gradient(135deg, ${GREEN}14, transparent)`,
          border: `1px solid ${GREEN}55`,
        }}
      >
        <CheckCircle2 size={18} className="shrink-0 mt-0.5" style={{ color: GREEN }} />
        <div className="text-sm text-gray-200 leading-relaxed">
          <strong style={{ color: GREEN }}>Quỹ dự phòng đã đầy</strong> (12 tháng chi thiết yếu · ngưỡng Thoát Nghèo).
          Dòng tiền giờ chảy xuống <strong>An Toàn TC</strong> và{" "}
          <strong>Quỹ Đầu Tư</strong>. Tiếp tục bước:{" "}
          <Link href="/tools/an-toan-tai-chinh" className="underline" style={{ color: BRAND }}>
            An Toàn TC
          </Link>{" "}
          ·{" "}
          <Link href="/tools/doc-lap-tai-chinh" className="underline" style={{ color: BRAND }}>
            Độc Lập TC
          </Link>
          .
        </div>
      </div>
    );
  }
  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{
        background: `linear-gradient(135deg, ${BLUE}14, transparent)`,
        border: `1px solid ${BLUE}55`,
      }}
    >
      <Shield size={18} className="shrink-0 mt-0.5" style={{ color: BLUE }} />
      <div className="text-sm text-gray-200 leading-relaxed">
        <strong style={{ color: BLUE }}>Đang xây quỹ dự phòng</strong> —{" "}
        {result.emergencyPct}% target. Mỗi tháng dồn{" "}
        <strong className="text-white">
          {fmtCompact(result.monthlyEmergency)}
        </strong>{" "}
        — còn{" "}
        <strong className="text-white">
          {result.monthsToFillEmergency} tháng
        </strong>{" "}
        nữa là đầy → mở khoá dòng chảy xuống An Toàn TC + Đầu Tư.
      </div>
    </div>
  );
}

function ActionTips({
  result,
  form,
}: {
  result: {
    totalIncome: number;
    essentialCap: number;
    essentialActual: number;
    essentialOverCap: boolean;
    essentialSavings: number;
    emergencyFull: boolean;
    monthlyFFA: number;
  };
  form: FormState;
}) {
  const tips: { type: "ok" | "warn" | "info"; text: string }[] = [];

  if (result.essentialOverCap) {
    tips.push({
      type: "warn",
      text: `Chi thiết yếu ${fmtCompact(form.essentialActual)}/th đang VƯỢT trần 55% (cap ${fmtCompact(result.essentialCap)}/th). Cần tối ưu nhà ở · đi lại · gói cước để tổng dòng tiền cân đối được.`,
    });
  } else if (result.essentialSavings > 0 && result.essentialActual > 0) {
    tips.push({
      type: "ok",
      text: `Đang tiết kiệm ${fmtCompact(result.essentialSavings)}/tháng so với trần 55% — dòng tiền này tự động đẩy vào Quỹ FFA, tăng tốc Độc Lập TC.`,
    });
  }
  if (form.passive === 0) {
    tips.push({
      type: "info",
      text: "Chưa có thu nhập thụ động — đây là chìa khoá Độc Lập TC. Hãy bắt đầu với cổ tức, cho thuê, lãi vay.",
    });
  }
  if (form.business === 0 && form.salary > 0) {
    tips.push({
      type: "info",
      text: "Chỉ phụ thuộc 1 nguồn lương — rủi ro cao nếu mất việc. Nên xây thêm nguồn thu phụ.",
    });
  }
  if (result.emergencyFull && result.monthlyFFA > 0) {
    tips.push({
      type: "ok",
      text: `Đang đầu tư FFA ${fmtCompact(result.monthlyFFA)}/tháng — duy trì 5-10 năm sẽ đạt Độc Lập TC.`,
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
          t.type === "warn"
            ? AlertCircle
            : t.type === "ok"
              ? CheckCircle2
              : Info;
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

/* ─────────────────────────────────────────────
 *  Form primitives
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
      className="rounded-lg p-2.5 space-y-2"
      style={{
        background: `linear-gradient(135deg, ${color}0a, transparent)`,
        border: `1px solid ${color}33`,
      }}
    >
      <div className="flex items-center gap-1.5 pb-1 border-b border-[#1f1f1f]">
        <Icon size={11} style={{ color }} />
        <span
          className="text-[9.5px] font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  icon: Icon,
  suffix,
  accent = BRAND,
  raw,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  icon: typeof Wallet;
  suffix: string;
  accent?: string;
  raw?: boolean;
}) {
  const display = raw
    ? value > 0
      ? String(value)
      : ""
    : value > 0
      ? value.toLocaleString("vi-VN")
      : "";
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
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, "");
            onChange(cleaned ? parseInt(cleaned, 10) : 0);
          }}
          placeholder="0"
          className="w-full pl-6 pr-12 py-1.5 rounded-md text-[12px] font-bold text-white text-right outline-none"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${value > 0 ? `${accent}77` : "#2a2a2a"}`,
          }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
          style={{ color: value > 0 ? accent : "#525252" }}
        >
          {suffix}
        </span>
      </div>
    </div>
  );
}

function PctField({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accent: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
      <label className="text-[10.5px] text-gray-400 truncate flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: accent }}
        />
        {label}
      </label>
      <div className="relative w-[72px]">
        <input
          type="number"
          min={0}
          max={100}
          value={value || ""}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onChange(isNaN(n) ? 0 : Math.min(100, Math.max(0, n)));
          }}
          className="w-full px-2 py-1.5 pr-6 rounded-md text-[12px] font-bold text-white text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          style={{
            background: "#0a0a0a",
            border: `1px solid ${value > 0 ? `${accent}77` : "#2a2a2a"}`,
          }}
        />
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium pointer-events-none"
          style={{ color: value > 0 ? accent : "#525252" }}
        >
          %
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
      <div
        className="text-base sm:text-lg font-extrabold"
        style={{ color }}
      >
        {fmtCompact(value)}
      </div>
      {note && (
        <div className="text-[10px] text-gray-500 font-medium mt-0.5">
          {note}
        </div>
      )}
    </div>
  );
}

/* ─── helpers ─── */

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
