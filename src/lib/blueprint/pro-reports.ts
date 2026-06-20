/**
 * 4 báo cáo Pro của Entrepreneur Financial Blueprint™:
 *   1. Entrepreneur Wealth MRI™       — 5 tầng tâm thức TC
 *   2. Entrepreneur Risk Map™         — 8 nhóm rủi ro
 *   3. Financial Freedom Roadmap™     — 6 cấp + Freedom Number
 *   4. Financial Prescription™        — đơn thuốc cá nhân hoá
 *
 * Compute từ data Blueprint (Profile + Mindset + Habits + Status).
 * AI Insight = template Vietnamese tự generate dựa trên metrics.
 */

import type { BlueprintData } from "./types";
import {
  buildBlueprintInsights,
  type BlueprintInsights,
} from "./insights";
import { scoreLoveOfMoney } from "./data/love-of-money-questions";
import { scoreBeliefs } from "./data/beliefs-questions";
import { scoreMindset, MINDSET_CATEGORIES } from "./data/mindset-questions";

/* ─────────────────────────────────────────────
 *  1. ENTREPRENEUR WEALTH MRI™ — 5 tầng + Score
 * ───────────────────────────────────────────── */

export type MoneyPersonality =
  | "Saver"
  | "Spender"
  | "Investor"
  | "Protector"
  | "Builder"
  | "Visionary";

export type WealthTier =
  | "Financial Victim"
  | "Financial Survivor"
  | "Financial Struggler"
  | "Financial Builder"
  | "Financial Wealth Creator"
  | "Financial Freedom Architect";

export interface WealthMRIReport {
  consciousness: number; // 0-100
  relationship: number; // 0-100
  belief: number; // 0-100 (cao = belief tốt)
  personality: MoneyPersonality;
  personalityLabel: string;
  wealthOS: number; // 0-100
  wealthScore: number; // 0-100 — weighted avg
  tier: WealthTier;
  aiInsight: string;
  // Detail flags for UI
  beliefsScore: number;
  beliefsMax: number;
  loveScore: number;
  habitsTrue: number;
  habitsTotal: number;
  mindsetTop: number; // index 0-6
  mindsetTopName: string; // tên nhóm chính xác
}

/**
 * Map 7 nhóm tâm thức (theo khung báo cáo chuẩn) → 6 Money Personality.
 *   1 Người Cho Đi        → Spender (hào phóng chi cho người khác)
 *   2 Người Tích Lũy      → Saver (kỷ luật, tối ưu)
 *   3 Người Tận Hưởng     → Spender (chi cho chất lượng)
 *   4 Người Kết Nối       → Visionary (mạng lưới, cộng đồng)
 *   5 Người Quản Lý       → Saver (tổ chức, ngân sách)
 *   6 Sống Cho Hiện Tại   → Protector (rào cản — cần bảo vệ)
 *   7 Người Tầm Nhìn      → Builder (kiến tạo dài hạn)
 */
const PERSONALITY_MAP: MoneyPersonality[] = [
  "Spender", // 1 Người Cho Đi
  "Saver", // 2 Người Tích Lũy
  "Spender", // 3 Người Tận Hưởng
  "Visionary", // 4 Người Kết Nối
  "Saver", // 5 Người Quản Lý
  "Protector", // 6 Sống Cho Hiện Tại
  "Builder", // 7 Người Tầm Nhìn
];

const PERSONALITY_LABEL: Record<MoneyPersonality, string> = {
  Saver: "Người giữ tiền",
  Spender: "Người tiêu tiền",
  Investor: "Người đầu tư",
  Protector: "Người bảo vệ",
  Builder: "Người xây dựng tài sản",
  Visionary: "Người kiến tạo sự giàu có",
};

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function wealthTier(score: number): WealthTier {
  if (score <= 20) return "Financial Victim";
  if (score <= 40) return "Financial Survivor";
  if (score <= 60) return "Financial Struggler";
  if (score <= 80) return "Financial Builder";
  if (score <= 90) return "Financial Wealth Creator";
  return "Financial Freedom Architect";
}

export function computeWealthMRI(data: BlueprintData): WealthMRIReport {
  const mindset = data.mindset ?? {};
  const habits = data.habits?.answers ?? {};

  // Money Relationship — từ Love of Money (0-38) → 0-100
  const loveScore = scoreLoveOfMoney(mindset.loveOfMoneyAnswers ?? {});
  const relationship = clamp((loveScore / 38) * 100);

  // Wealth Belief — Belief score càng thấp càng tốt (max 720)
  // → invert: 100 - (score / 720 × 100)
  const beliefsScore = scoreBeliefs(mindset.beliefsAnswers ?? {});
  const beliefsMax = 72 * 10;
  const belief = clamp(100 - (beliefsScore / beliefsMax) * 100);

  // Money Personality — từ 7 loại tâm thức, lấy max score
  const archetypeScores = scoreMindset(mindset.archetypeAnswers ?? {});
  let topIdx = 0;
  for (let i = 1; i < archetypeScores.length; i++) {
    if (archetypeScores[i] > archetypeScores[topIdx]) topIdx = i;
  }
  const personality = PERSONALITY_MAP[topIdx];
  const personalityLabel = PERSONALITY_LABEL[personality];

  // Money Consciousness — derive từ Habits (tỷ lệ "yes" cho yes_no questions)
  const consciousnessKeys = [
    "budget",
    "knowNetWorth",
    "hasFinancialDashboard",
    "has10YearPlan",
  ];
  let cTrue = 0;
  for (const k of consciousnessKeys) {
    if (habits[k] === true) cTrue++;
  }
  // Bonus nếu có theo dõi chi tiêu hoặc review định kỳ
  if (
    habits.trackSpending &&
    habits.trackSpending !== "no" &&
    habits.trackSpending !== ""
  )
    cTrue++;
  if (
    habits.reviewFrequency &&
    habits.reviewFrequency !== "never" &&
    habits.reviewFrequency !== ""
  )
    cTrue++;
  const consciousness = clamp((cTrue / (consciousnessKeys.length + 2)) * 100);

  // Wealth OS — habits liên quan kỷ luật + quản trị
  const wealthOSKeys = [
    "budget",
    "separateAccounts",
    "paySelf",
    "knowNetWorth",
    "hasFinancialDashboard",
    "has10YearPlan",
  ];
  const negKeys = ["personalFundBusiness", "personalDebtBusiness"]; // false = tốt
  let osScore = 0;
  for (const k of wealthOSKeys) if (habits[k] === true) osScore++;
  for (const k of negKeys) if (habits[k] === false) osScore++;
  if (habits.hasAdvisor === true) osScore++;
  if (habits.hasAIAssistant === true) osScore++;
  const wealthOS = clamp(
    (osScore / (wealthOSKeys.length + negKeys.length + 2)) * 100
  );

  // Wealth Score — weighted avg
  // Consciousness 15% + Relationship 20% + Belief 20% + WealthOS 35% + (Personality không tính điểm, chỉ phân loại)
  const wealthScore = clamp(
    consciousness * 0.15 +
      relationship * 0.2 +
      belief * 0.2 +
      wealthOS * 0.35 +
      // Personality 10% — Builder/Investor cao, Spender thấp
      (personality === "Builder" || personality === "Investor"
        ? 80
        : personality === "Saver" || personality === "Visionary"
          ? 70
          : personality === "Protector"
            ? 60
            : 40) *
        0.1
  );
  const tier = wealthTier(wealthScore);

  // AI Insight — template theo điểm yếu nhất
  const layers = [
    { name: "nhận thức tài chính", val: consciousness },
    { name: "mối quan hệ với tiền", val: relationship },
    { name: "niềm tin tài chính", val: belief },
    { name: "hệ điều hành tài chính", val: wealthOS },
  ];
  layers.sort((a, b) => a.val - b.val);
  const weakest = layers[0];
  const strongest = layers[layers.length - 1];
  const aiInsight = `Anh/chị có ${strongest.name} đạt ${strongest.val}/100 — đây là điểm tựa. Điểm nghẽn lớn nhất là ${weakest.name} (${weakest.val}/100). Money Personality của anh/chị là ${personality} (${personalityLabel}). Nếu cải thiện được ${weakest.name}, Wealth Score có thể tăng đáng kể trong 12-24 tháng tới.`;

  return {
    consciousness,
    relationship,
    belief,
    personality,
    personalityLabel,
    wealthOS,
    wealthScore,
    tier,
    aiInsight,
    beliefsScore,
    beliefsMax,
    loveScore,
    habitsTrue: osScore,
    habitsTotal: wealthOSKeys.length + negKeys.length + 2,
    mindsetTop: topIdx,
    mindsetTopName: MINDSET_CATEGORIES[topIdx].name,
  };
}

/* ─────────────────────────────────────────────
 *  2. ENTREPRENEUR RISK MAP™ — 8 nhóm rủi ro
 * ───────────────────────────────────────────── */

export type RiskLevel = "Critical" | "High Risk" | "Moderate" | "Safe" | "Strong";

export interface RiskItem {
  key: string;
  label: string;
  score: number; // 0-100, càng cao = càng RỦI RO
  note: string;
}

export interface RiskMapReport {
  items: RiskItem[];
  riskScore: number; // 0-100, càng cao = càng AN TOÀN (= 100 - avg risk)
  level: RiskLevel;
  topRisks: string[]; // 3 rủi ro cao nhất
  topOpportunities: string[]; // 3 cơ hội lớn nhất (rủi ro thấp = mạnh)
  aiAnalysis: string;
}

function riskLevel(score: number): RiskLevel {
  if (score <= 20) return "Critical";
  if (score <= 40) return "High Risk";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "Safe";
  return "Strong";
}

export function computeRiskMap(
  data: BlueprintData,
  ins: BlueprintInsights,
  wealth: WealthMRIReport
): RiskMapReport {
  const cashflow = data.status?.cashflow ?? {};
  const netWorth = data.status?.netWorth ?? {};
  const habits = data.habits?.answers ?? {};

  // 1. Cashflow Risk
  const incomeSources = Object.values(cashflow.income ?? {}).filter(
    (v): v is number => typeof v === "number" && v > 0
  );
  let cashflowRisk = 0;
  if (incomeSources.length <= 1) cashflowRisk += 40;
  if (ins.jars.savingRate <= 0) cashflowRisk += 40;
  else if (ins.jars.savingRate < 10) cashflowRisk += 25;
  if (ins.jars.necOverCap) cashflowRisk += 20;
  cashflowRisk = clamp(cashflowRisk);

  // 2. Asset Risk
  const totalAssets = ins.assets.totalAssets;
  let assetRisk = 0;
  if (totalAssets === 0) assetRisk = 90;
  else {
    // Concentration: nếu 1 nhóm > 70% → rủi ro
    const ratios = [
      ins.assets.liquidPct,
      ins.assets.investedPct,
      ins.assets.ownedPct,
    ];
    const maxConc = Math.max(...ratios);
    if (maxConc > 70) assetRisk += 50;
    else if (maxConc > 50) assetRisk += 30;
    if (ins.assets.liquidPct < 10) assetRisk += 30; // thiếu thanh khoản
  }
  assetRisk = clamp(assetRisk);

  // 3. Debt Risk
  const debtRatio =
    totalAssets > 0 ? (ins.assets.totalLiab / totalAssets) * 100 : 0;
  let debtRisk = 0;
  if (debtRatio > 70) debtRisk += 60;
  else if (debtRatio > 50) debtRisk += 40;
  else if (debtRatio > 30) debtRisk += 20;
  if (habits.personalFundBusiness === true) debtRisk += 20;
  if (habits.personalDebtBusiness === true) debtRisk += 20;
  if ((netWorth.liabilities?.creditCard ?? 0) > 0) debtRisk += 15;
  debtRisk = clamp(debtRisk);

  // 4. Emergency Risk — số tháng có thể sống
  const monthsCovered = ins.emergency.monthsCovered;
  let emergencyRisk = 0;
  if (monthsCovered < 1) emergencyRisk = 90;
  else if (monthsCovered < 3) emergencyRisk = 70;
  else if (monthsCovered < 6) emergencyRisk = 50;
  else if (monthsCovered < 12) emergencyRisk = 25;
  else emergencyRisk = 10;

  // 5. Protection Risk — Protection Gap
  const protGap = Math.max(0, ins.insurance.totalNeed - ins.insurance.totalCoverage);
  let protectionRisk = 0;
  if (ins.insurance.totalNeed > 0) {
    const gapPct = (protGap / ins.insurance.totalNeed) * 100;
    protectionRisk = clamp(gapPct);
  } else {
    protectionRisk = 50;
  }

  // 6. Retirement Risk
  const retGap = Math.max(
    0,
    ins.retirement.corpusNeeded - ins.retirement.currentCorpus
  );
  let retirementRisk = 0;
  if (ins.retirement.corpusNeeded > 0) {
    const gapPct = (retGap / ins.retirement.corpusNeeded) * 100;
    retirementRisk = clamp(gapPct);
  } else if (ins.retirement.currentAge === null) {
    retirementRisk = 50; // chưa có data
  }

  // 7. Freedom Risk — Freedom Ratio (passive / expense)
  const freedomRatio = ins.independence.pp1Ratio;
  let freedomRisk = 0;
  if (freedomRatio < 20) freedomRisk = 90;
  else if (freedomRatio < 50) freedomRisk = 65;
  else if (freedomRatio < 100) freedomRisk = 35;
  else freedomRisk = 10;

  // 8. Mindset Risk — từ Wealth Belief (thấp = risk cao)
  const mindsetRisk = clamp(100 - wealth.belief);

  const items: RiskItem[] = [
    { key: "cashflow", label: "Cashflow Risk", score: cashflowRisk, note: noteFor(cashflowRisk) },
    { key: "asset", label: "Asset Risk", score: assetRisk, note: noteFor(assetRisk) },
    { key: "debt", label: "Debt Risk", score: debtRisk, note: noteFor(debtRisk) },
    { key: "emergency", label: "Emergency Risk", score: emergencyRisk, note: noteFor(emergencyRisk) },
    { key: "protection", label: "Protection Risk", score: protectionRisk, note: noteFor(protectionRisk) },
    { key: "retirement", label: "Retirement Risk", score: retirementRisk, note: noteFor(retirementRisk) },
    { key: "freedom", label: "Freedom Risk", score: freedomRisk, note: noteFor(freedomRisk) },
    { key: "mindset", label: "Wealth Mindset Risk", score: mindsetRisk, note: noteFor(mindsetRisk) },
  ];

  // Risk Score tổng — đảo: 100 - avg(risk)
  const avgRisk = items.reduce((s, it) => s + it.score, 0) / items.length;
  const riskScore = clamp(100 - avgRisk);
  const level = riskLevel(riskScore);

  const sortedDesc = [...items].sort((a, b) => b.score - a.score);
  const sortedAsc = [...items].sort((a, b) => a.score - b.score);
  const topRisks = sortedDesc.slice(0, 3).map((r) => r.label);
  const topOpportunities = sortedAsc.slice(0, 3).map((r) => r.label);

  const aiAnalysis = `Tổng quan Risk Score ${riskScore}/100 — cấp độ ${level}. 3 rủi ro cao nhất cần xử lý ưu tiên: ${topRisks.join(", ")}. Điểm mạnh có thể tận dụng: ${topOpportunities.join(", ")}. ${level === "Critical" || level === "High Risk" ? "Cần can thiệp tức thì để giảm rủi ro mất vốn." : level === "Moderate" ? "Cần cải thiện hệ thống bảo vệ trong 6-12 tháng." : "Duy trì kỷ luật + tối ưu danh mục để nâng tầm."}`;

  return {
    items,
    riskScore,
    level,
    topRisks,
    topOpportunities,
    aiAnalysis,
  };
}

function noteFor(score: number): string {
  if (score >= 70) return "Nguy hiểm";
  if (score >= 40) return "Cần cải thiện";
  return "An toàn";
}

/* ─────────────────────────────────────────────
 *  3. FINANCIAL FREEDOM ROADMAP™
 * ───────────────────────────────────────────── */

export type FreedomLevel =
  | "Financial Survival"
  | "Financial Stability"
  | "Financial Security"
  | "Financial Independence"
  | "Financial Freedom"
  | "Financial Legacy";

export interface FreedomRoadmapReport {
  monthlyExpense: number;
  annualExpense: number;
  freedomNumber: number; // = annualExpense / 0.04
  currentInvestAssets: number;
  freedomGap: number;
  annualSavings: number; // = (income - expense) × 12
  yearsToFreedom: number | null; // null nếu savings ≤ 0
  freedomScore: number; // 0-100+
  level: FreedomLevel;
  aiInsight: string;
}

function freedomLevel(score: number): FreedomLevel {
  if (score <= 20) return "Financial Survival";
  if (score <= 40) return "Financial Stability";
  if (score <= 60) return "Financial Security";
  if (score <= 80) return "Financial Independence";
  if (score <= 100) return "Financial Freedom";
  return "Financial Legacy";
}

export function computeFreedomRoadmap(
  ins: BlueprintInsights
): FreedomRoadmapReport {
  const monthlyExpense = ins.jars.totalExpense;
  const annualExpense = monthlyExpense * 12;
  const freedomNumber = annualExpense > 0 ? annualExpense / 0.04 : 0;
  const currentInvestAssets =
    ins.assets.liquid + ins.assets.invested; // chỉ tài sản sinh lời
  const freedomGap = Math.max(0, freedomNumber - currentInvestAssets);
  const monthlySavings = ins.jars.netCashflow;
  const annualSavings = monthlySavings * 12;
  const yearsToFreedom =
    annualSavings > 0 ? Math.ceil(freedomGap / annualSavings) : null;

  // Freedom Score = blended (passiveRatio + corpusProgress)
  const corpusProgress =
    freedomNumber > 0
      ? Math.min(100, (currentInvestAssets / freedomNumber) * 100)
      : 0;
  const passiveRatio = ins.independence.pp1Ratio;
  const freedomScore = Math.round((passiveRatio + corpusProgress) / 2);
  const level = freedomLevel(freedomScore);

  const aiInsight =
    monthlyExpense === 0
      ? "Cần nhập chi tiêu /tháng để tính Freedom Number."
      : annualSavings <= 0
        ? `Hiện ở cấp độ ${level} với Freedom Score ${freedomScore}/100. Cần tăng thu nhập hoặc giảm chi tiêu để bắt đầu tích lũy hướng tới Freedom Number ${fmtBn(freedomNumber)}.`
        : `Hiện ở cấp độ ${level}, Freedom Score ${freedomScore}/100. Freedom Gap ${fmtBn(freedomGap)}. Với tốc độ tích lũy hiện tại (${fmtBn(annualSavings)}/năm) dự kiến cần ${yearsToFreedom} năm để đạt tự do tài chính. Ưu tiên: tăng tài sản tạo dòng tiền + giảm phụ thuộc vào thu nhập chủ động.`;

  return {
    monthlyExpense,
    annualExpense,
    freedomNumber,
    currentInvestAssets,
    freedomGap,
    annualSavings,
    yearsToFreedom,
    freedomScore,
    level,
    aiInsight,
  };
}

function fmtBn(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (n >= 1e6) return Math.round(n / 1e6) + "tr";
  return Math.round(n).toLocaleString("vi-VN") + "₫";
}

/* ─────────────────────────────────────────────
 *  4. FINANCIAL PRESCRIPTION™
 * ───────────────────────────────────────────── */

export interface PrescriptionItem {
  level: "Khẩn cấp" | "Quan trọng" | "Phát triển";
  problem: string;
  actions: string[];
  expectedResult: string;
}

export interface PrescriptionReport {
  aiDiagnosis: string;
  prescriptions: PrescriptionItem[];
  topPriorities: string[]; // 5 ưu tiên
  improvementTargets: Array<{
    label: string;
    current: number;
    target: number;
    suffix?: string;
  }>;
}

export function computePrescription(
  ins: BlueprintInsights,
  wealth: WealthMRIReport,
  risk: RiskMapReport,
  roadmap: FreedomRoadmapReport
): PrescriptionReport {
  // Map risk score → vấn đề + đơn thuốc
  const sortedRisks = [...risk.items].sort((a, b) => b.score - a.score);

  const presLib: Record<
    string,
    Omit<PrescriptionItem, "level">
  > = {
    cashflow: {
      problem: "Dòng tiền phụ thuộc 1 nguồn hoặc thiếu kỷ luật chi tiêu.",
      actions: [
        "Tách tài khoản cá nhân ↔ doanh nghiệp + thiết lập lương Founder",
        "Theo dõi chi tiêu hàng tuần qua Dashboard",
        "Xây nguồn thu nhập thứ 2 trong 6 tháng",
      ],
      expectedResult: "Tăng saving rate ≥ 20% + giảm rủi ro mất TN chính.",
    },
    asset: {
      problem: "Tài sản tập trung 1 nhóm hoặc thiếu đa dạng hoá.",
      actions: [
        "Đa dạng hoá 4 nhóm: Thanh khoản / Đầu tư / Sở hữu / Tài sản tạo dòng tiền",
        "Giữ ≥ 10% tài sản dạng thanh khoản (mặt + sổ + vàng)",
        "Tăng tỉ trọng tài sản sinh lời lên ≥ 50%",
      ],
      expectedResult: "Cân bằng danh mục + tăng khả năng chống chịu biến cố.",
    },
    debt: {
      problem: "Tỉ lệ nợ cao hoặc dùng nợ xấu (CN nuôi DN, thẻ TD).",
      actions: [
        "Tất toán nợ thẻ tín dụng trong 3-6 tháng",
        "Dừng việc dùng tiền/nợ cá nhân nuôi DN",
        "Refinance các khoản vay có lãi suất > 12%",
      ],
      expectedResult: "Giảm Debt Risk Score ≥ 30 điểm + tăng net worth.",
    },
    emergency: {
      problem: "Không có quỹ dự phòng đủ 6-12 tháng chi tiêu thiết yếu.",
      actions: [
        "Trích 10-20% thu nhập hàng tháng vào quỹ dự phòng",
        "Mục tiêu tối thiểu 6 tháng chi thiết yếu (Thoát Nghèo cần 12 tháng)",
        "Giữ ở tài khoản TK linh hoạt (KKH/CKH ngắn) — không đầu tư rủi ro",
      ],
      expectedResult: "Tăng Emergency Score ≥ 20 điểm trong 12 tháng.",
    },
    protection: {
      problem: "Bảo hiểm chưa đủ — Protection Gap lớn.",
      actions: [
        "Mua bổ sung BH nhân thọ đạt 10× thu nhập năm",
        "Mua BH sức khoẻ mệnh giá ≥ 1 tỷ",
        "Bổ sung BH tai nạn + bệnh hiểm nghèo",
      ],
      expectedResult: "Đóng Protection Gap → bảo vệ gia đình toàn diện.",
    },
    retirement: {
      problem: "Khoảng cách hưu trí lớn — chưa đủ corpus.",
      actions: [
        "Bắt đầu tích sản đầu tư đều đặn theo PMT yêu cầu",
        "Tận dụng compound: bắt đầu càng sớm càng tốt",
        "Review lại corpus mục tiêu hàng năm",
      ],
      expectedResult: "Giảm Retirement Gap + tăng độ tin cậy của kế hoạch hưu.",
    },
    freedom: {
      problem: "Thu nhập thụ động thấp — phụ thuộc cao vào lao động.",
      actions: [
        "Xây tài sản tạo dòng tiền: cho thuê BĐS, cổ tức, lãi vay",
        "Mục tiêu Freedom Ratio (passive/expense) ≥ 50% trong 5 năm",
        "Tái đầu tư 100% thu nhập thụ động để compound",
      ],
      expectedResult: "Tăng Freedom Score + tiến tới Độc Lập TC.",
    },
    mindset: {
      problem: "Niềm tin giới hạn về tiền cản trở tăng trưởng tài sản.",
      actions: [
        "Identify 3 niềm tin tiêu cực mạnh nhất từ bài test Niềm Tin",
        "Đọc 1 sách/tháng về tâm thức làm giàu",
        "Tham gia cộng đồng cùng level wealth để được khuếch đại",
      ],
      expectedResult: "Tăng Wealth Belief Score + giải phóng giới hạn.",
    },
  };

  // 3 đơn thuốc theo 3 rủi ro cao nhất
  const levels: PrescriptionItem["level"][] = [
    "Khẩn cấp",
    "Quan trọng",
    "Phát triển",
  ];
  const prescriptions: PrescriptionItem[] = sortedRisks
    .slice(0, 3)
    .map((r, i) => {
      const lib = presLib[r.key];
      return {
        level: levels[i],
        problem: lib?.problem ?? r.label,
        actions: lib?.actions ?? [],
        expectedResult: lib?.expectedResult ?? "Cải thiện chỉ số tương ứng.",
      };
    });

  // 5 ưu tiên cao nhất — từ 5 rủi ro cao nhất, mỗi cái lấy action đầu
  const topPriorities = sortedRisks.slice(0, 5).map((r) => {
    const lib = presLib[r.key];
    return lib?.actions?.[0] ?? `Xử lý ${r.label}`;
  });

  // Chỉ số cần cải thiện
  const improvementTargets: PrescriptionReport["improvementTargets"] = [
    {
      label: "Cashflow Risk Score",
      current: 100 - risk.items[0].score,
      target: Math.min(100, 100 - risk.items[0].score + 25),
    },
    {
      label: "Emergency Score",
      current: 100 - risk.items[3].score,
      target: Math.min(100, 100 - risk.items[3].score + 30),
    },
    {
      label: "Protection Score",
      current: 100 - risk.items[4].score,
      target: Math.min(100, 100 - risk.items[4].score + 30),
    },
    {
      label: "Freedom Score",
      current: roadmap.freedomScore,
      target: Math.min(100, roadmap.freedomScore + 20),
    },
    {
      label: "Wealth Score",
      current: wealth.wealthScore,
      target: Math.min(100, wealth.wealthScore + 15),
    },
  ];

  const aiDiagnosis = `Anh/chị đang ở trạng thái ${roadmap.level} (Freedom Score ${roadmap.freedomScore}/100) — Wealth Tier: ${wealth.tier} (${wealth.wealthScore}/100). Điểm mạnh: ${risk.topOpportunities[0]}. Vấn đề lớn nhất: ${risk.topRisks[0]}. ${ins.emergency.achieved ? "Đã có quỹ dự phòng tốt." : "Quỹ dự phòng chưa đủ — đây là rủi ro cần xử lý trước nhất."} ${ins.independence.achieved ? "Đã đạt Độc Lập TC — duy trì + tối ưu danh mục." : `Còn cách ${fmtBn(roadmap.freedomGap)} để đạt tự do tài chính.`}`;

  return {
    aiDiagnosis,
    prescriptions,
    topPriorities,
    improvementTargets,
  };
}

/* ─────────────────────────────────────────────
 *  5. KẾ HOẠCH HƯU TRÍ AN NHÀN™ (chi tiết)
 *
 *  Luật BHXH Việt Nam:
 *    Nam → nghỉ hưu năm 62 tuổi
 *    Nữ  → nghỉ hưu năm 60 tuổi
 *
 *  Giả định mặc định:
 *    Lạm phát   : 5%/năm
 *    Lãi đầu tư : 8%/năm
 *    Sống đến   : 85 tuổi
 *    Tỉ lệ rút  : 4%/năm (quy tắc 4%)
 *    Lương hưu  : 75% × lương chủ động hiện tại
 * ───────────────────────────────────────────── */

export interface RetirementPlanReport {
  currentAge: number | null;
  currentYear: number;
  gender: "male" | "female" | "other" | undefined;
  retirementAge: number;
  retirementYear: number;
  yearsToRetirement: number;
  yearsInRetirement: number;

  // Chi tiêu
  currentMonthlyExpense: number;
  inflationPct: number; // 5
  futureMonthlyExpense: number; // chi /tháng lúc hưu
  futureAnnualExpense: number;

  // Lương hưu
  currentSalary: number; // active income
  pensionPct: number; // 75
  futurePensionMonthly: number; // 75% × salary, có lạm phát
  futurePensionAnnual: number;

  // Tài sản cần
  withdrawRatePct: number; // 4
  annualShortfall: number; // = futureAnnual - pension
  requiredCorpus: number; // = annualShortfall / 0.04

  // Tài sản hiện có dùng cho hưu trí
  currentRetirementSavings: number;
  achievementPct: number;

  // Plan đóng góp
  expectedReturnPct: number; // 8
  requiredMonthlyContribution: number;
  aiInsight: string;
}

const VN_RETIREMENT_AGE_MALE = 62;
const VN_RETIREMENT_AGE_FEMALE = 60;
const RETIREMENT_LIFESPAN = 85;
const RETIREMENT_INFLATION = 0.05;
const RETIREMENT_RETURN = 0.08;
const RETIREMENT_WITHDRAW = 0.04;
const RETIREMENT_PENSION_PCT = 0.75;

const sumObj = (o: object | undefined): number =>
  Object.values(o ?? {}).reduce<number>(
    (s, v) => s + (typeof v === "number" ? v : 0),
    0
  );

export function computeRetirementPlan(
  data: BlueprintData
): RetirementPlanReport {
  const profile = data.profile ?? {};
  const cashflow = data.status?.cashflow ?? {};
  const netWorth = data.status?.netWorth ?? {};
  const currentYear = new Date().getFullYear();
  const currentAge = profile.birthYear
    ? currentYear - profile.birthYear
    : null;
  const gender = profile.gender;

  const retirementAge =
    gender === "male"
      ? VN_RETIREMENT_AGE_MALE
      : gender === "female"
        ? VN_RETIREMENT_AGE_FEMALE
        : VN_RETIREMENT_AGE_FEMALE; // default 60 nếu chưa chọn

  const yearsToRetirement =
    currentAge !== null ? Math.max(0, retirementAge - currentAge) : 0;
  const retirementYear = currentYear + yearsToRetirement;
  const yearsInRetirement = Math.max(0, RETIREMENT_LIFESPAN - retirementAge);

  // Chi tiêu hiện tại
  const currentMonthlyExpense =
    sumObj(cashflow.fixedCosts) + sumObj(cashflow.variableCosts);
  // Chi tiêu lúc hưu sau lạm phát compound
  const inflationFactor = Math.pow(
    1 + RETIREMENT_INFLATION,
    yearsToRetirement
  );
  const futureMonthlyExpense = Math.round(
    currentMonthlyExpense * inflationFactor
  );
  const futureAnnualExpense = futureMonthlyExpense * 12;

  // Lương hưu — dựa trên lương chủ động (personal + spouse, không gồm passive)
  const currentSalary =
    (cashflow.income?.personal ?? 0) + (cashflow.income?.spouse ?? 0);
  const futureSalary = Math.round(currentSalary * inflationFactor);
  const futurePensionMonthly = Math.round(
    futureSalary * RETIREMENT_PENSION_PCT
  );
  const futurePensionAnnual = futurePensionMonthly * 12;

  // Tài sản cần
  const annualShortfall = Math.max(
    0,
    futureAnnualExpense - futurePensionAnnual
  );
  const requiredCorpus =
    annualShortfall > 0 ? annualShortfall / RETIREMENT_WITHDRAW : 0;

  // TS đầu tư hiện có dùng cho hưu trí (liquid + invested)
  const a = netWorth.assets ?? {};
  const currentRetirementSavings =
    (a.cash ?? 0) +
    (a.savings ?? 0) +
    (a.gold ?? 0) +
    (a.stocks ?? 0) +
    (a.bonds ?? 0) +
    (a.funds ?? 0) +
    (a.crypto ?? 0) +
    (a.privateEquity ?? 0) +
    (a.rentalProperty ?? 0);

  const achievementPct =
    requiredCorpus > 0
      ? Math.min(999, Math.round((currentRetirementSavings / requiredCorpus) * 100))
      : 100;

  // Required PMT — tích sản đến lúc hưu
  let requiredMonthlyContribution = 0;
  if (yearsToRetirement > 0 && requiredCorpus > 0) {
    const r = RETIREMENT_RETURN / 12;
    const n = yearsToRetirement * 12;
    const g = Math.pow(1 + r, n);
    if (g - 1 > 0) {
      const pmt = ((requiredCorpus - currentRetirementSavings * g) * r) / (g - 1);
      requiredMonthlyContribution = Math.max(0, Math.round(pmt));
    }
  }

  // AI Insight
  let aiInsight: string;
  if (currentAge === null) {
    aiInsight =
      "Cần nhập năm sinh + giới tính ở Phần I để tính chính xác kế hoạch hưu trí.";
  } else if (currentSalary === 0) {
    aiInsight =
      "Cần nhập thu nhập cá nhân (lương) ở Phần IV để tính lương hưu BHXH.";
  } else if (yearsToRetirement === 0) {
    aiInsight = `Anh/chị đã ở tuổi nghỉ hưu (${currentAge}/${retirementAge}). Hãy đảm bảo TS đầu tư ≥ ${fmtBn(requiredCorpus)} để duy trì chi tiêu ${fmtBn(futureMonthlyExpense)}/tháng cùng lương hưu ${fmtBn(futurePensionMonthly)}/tháng.`;
  } else {
    const willMake = currentRetirementSavings * Math.pow(1 + RETIREMENT_RETURN, yearsToRetirement);
    aiInsight = `Còn ${yearsToRetirement} năm tới hưu (${retirementYear}). Với lạm phát 5%/năm, chi tiêu sẽ tăng từ ${fmtBn(currentMonthlyExpense)}/tháng → ${fmtBn(futureMonthlyExpense)}/tháng. Lương hưu BHXH chỉ phủ ${fmtBn(futurePensionMonthly)}/tháng — còn thiếu ${fmtBn(annualShortfall / 12)}/tháng. Cần corpus ${fmtBn(requiredCorpus)}; hiện có ${fmtBn(currentRetirementSavings)} (${achievementPct}%) — nếu không đóng thêm, sau ${yearsToRetirement} năm với lãi 8%/năm corpus sẽ là ${fmtBn(willMake)}. Cần đóng đều đặn ${fmtBn(requiredMonthlyContribution)}/tháng để đạt mục tiêu.`;
  }

  return {
    currentAge,
    currentYear,
    gender,
    retirementAge,
    retirementYear,
    yearsToRetirement,
    yearsInRetirement,
    currentMonthlyExpense,
    inflationPct: 5,
    futureMonthlyExpense,
    futureAnnualExpense,
    currentSalary,
    pensionPct: 75,
    futurePensionMonthly,
    futurePensionAnnual,
    withdrawRatePct: 4,
    annualShortfall,
    requiredCorpus,
    currentRetirementSavings,
    achievementPct,
    expectedReturnPct: 8,
    requiredMonthlyContribution,
    aiInsight,
  };
}

/* ─────────────────────────────────────────────
 *  Aggregate
 * ───────────────────────────────────────────── */

export interface BlueprintProReports {
  wealthMRI: WealthMRIReport;
  riskMap: RiskMapReport;
  freedomRoadmap: FreedomRoadmapReport;
  prescription: PrescriptionReport;
  retirementPlan: RetirementPlanReport;
}

export function buildBlueprintProReports(
  data: BlueprintData
): BlueprintProReports {
  const ins = buildBlueprintInsights(data);
  const wealthMRI = computeWealthMRI(data);
  const riskMap = computeRiskMap(data, ins, wealthMRI);
  const freedomRoadmap = computeFreedomRoadmap(ins);
  const prescription = computePrescription(ins, wealthMRI, riskMap, freedomRoadmap);
  const retirementPlan = computeRetirementPlan(data);
  return { wealthMRI, riskMap, freedomRoadmap, prescription, retirementPlan };
}
