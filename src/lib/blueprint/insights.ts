/**
 * Compute helpers cho 8 báo cáo phân tích chuyên sâu trong
 * Báo Cáo Tổng Hợp của Entrepreneur Financial Blueprint.
 *
 * Tất cả nhận data đã chuẩn hoá từ BlueprintData → trả metrics +
 * status để UI chỉ việc render.
 */

import type {
  BlueprintData,
  CashflowData,
  InsuranceData,
  NetWorthData,
  ProfileData,
} from "./types";

const sumObj = (o: object | undefined) =>
  Object.values(o ?? {}).reduce<number>(
    (s, v) => s + (typeof v === "number" ? v : 0),
    0
  );

/* ─────────────────────────────────────────────
 *  1. Cân Đối Thu Chi — 6 quỹ JARS
 * ───────────────────────────────────────────── */

export interface JarsReport {
  totalIncome: number;
  necActual: number;
  necTargetPct: 55;
  necRatio: number; // % thực tế
  necOverCap: boolean;
  savingRate: number;
  netCashflow: number;
  totalExpense: number;
  // 6 quỹ JARS theo phân bổ chuẩn (giả định) — % của TN
  jars: {
    key: string;
    label: string;
    targetPct: number;
    actualPct: number;
  }[];
}

export function reportJars(cashflow: CashflowData | undefined): JarsReport {
  const inc = cashflow?.income ?? {};
  const fixed = cashflow?.fixedCosts ?? {};
  const variable = cashflow?.variableCosts ?? {};
  const savings = cashflow?.savings ?? {};
  const totalIncome = sumObj(inc);
  const totalFixed = sumObj(fixed);
  const totalVar = sumObj(variable);
  const necActual = totalFixed + totalVar;
  const necRatio =
    totalIncome > 0 ? Math.round((necActual / totalIncome) * 100) : 0;
  const totalExpense = necActual;
  const netCashflow = totalIncome - totalExpense;
  const savingRate =
    totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  // JARS targets (chuẩn 6 quỹ JARS)
  const ffa = savings.ffa ?? 0;
  const edu = savings.edu ?? 0;
  const play = savings.play ?? 0;
  const give = savings.give ?? 0;
  const ltss = savings.emergencyFund ?? 0;
  const jars = [
    { key: "nec", label: "Chi thiết yếu (NEC)", targetPct: 55, actualPct: necRatio },
    {
      key: "ffa",
      label: "Tự do TC (FFA)",
      targetPct: 10,
      actualPct: totalIncome > 0 ? Math.round((ffa / totalIncome) * 100) : 0,
    },
    {
      key: "edu",
      label: "Học tập (EDU)",
      targetPct: 10,
      actualPct: totalIncome > 0 ? Math.round((edu / totalIncome) * 100) : 0,
    },
    {
      key: "ltss",
      label: "Dự phòng (LTSS)",
      targetPct: 10,
      actualPct: totalIncome > 0 ? Math.round((ltss / totalIncome) * 100) : 0,
    },
    {
      key: "play",
      label: "Hưởng thụ (PLAY)",
      targetPct: 10,
      actualPct: totalIncome > 0 ? Math.round((play / totalIncome) * 100) : 0,
    },
    {
      key: "give",
      label: "Cho đi (GIVE)",
      targetPct: 5,
      actualPct: totalIncome > 0 ? Math.round((give / totalIncome) * 100) : 0,
    },
  ];

  return {
    totalIncome,
    necActual,
    necTargetPct: 55,
    necRatio,
    necOverCap: necRatio > 55,
    savingRate,
    netCashflow,
    totalExpense,
    jars,
  };
}

/* ─────────────────────────────────────────────
 *  2. Cân Đối Tài Sản — 4 nhóm
 * ───────────────────────────────────────────── */

export interface AssetCategoryReport {
  totalAssets: number;
  totalLiab: number;
  netWorth: number;
  liquid: number; // Thanh khoản
  invested: number; // Đầu tư
  owned: number; // Sở hữu (nhà/xe)
  other: number; // Khác
  liquidPct: number;
  investedPct: number;
  ownedPct: number;
  otherPct: number;
  /** Tỷ lệ TS sinh lời = (liquid + invested) / totalAssets */
  productivePct: number;
}

export function reportAssetCategories(
  netWorth: NetWorthData | undefined
): AssetCategoryReport {
  const a = netWorth?.assets ?? {};
  const l = netWorth?.liabilities ?? {};
  const liquid = (a.cash ?? 0) + (a.savings ?? 0) + (a.gold ?? 0);
  const invested =
    (a.stocks ?? 0) +
    (a.bonds ?? 0) +
    (a.funds ?? 0) +
    (a.crypto ?? 0) +
    (a.privateEquity ?? 0) +
    (a.rentalProperty ?? 0);
  const owned = (a.primaryHome ?? 0) + (a.vehicles ?? 0);
  const other = a.other ?? 0;
  const totalAssets = liquid + invested + owned + other;
  const totalLiab = sumObj(l);
  const netWorthValue = totalAssets - totalLiab;
  const pct = (v: number) =>
    totalAssets > 0 ? Math.round((v / totalAssets) * 100) : 0;
  return {
    totalAssets,
    totalLiab,
    netWorth: netWorthValue,
    liquid,
    invested,
    owned,
    other,
    liquidPct: pct(liquid),
    investedPct: pct(invested),
    ownedPct: pct(owned),
    otherPct: pct(other),
    productivePct: pct(liquid + invested),
  };
}

/* ─────────────────────────────────────────────
 *  3. Quỹ Dự Phòng (Thoát Nghèo)
 *  Target = chi tiêu thiết yếu × 12 tháng
 * ───────────────────────────────────────────── */

export interface EmergencyFundReport {
  monthlyEssential: number;
  target: number; // = monthlyEssential × 12
  liquid: number; // Tài sản thanh khoản
  achievementPct: number;
  monthsCovered: number; // Số tháng chi tiêu thiết yếu đang được phủ
  gap: number;
  achieved: boolean;
}

export function reportEmergencyFund(
  cashflow: CashflowData | undefined,
  netWorth: NetWorthData | undefined
): EmergencyFundReport {
  const fixed = cashflow?.fixedCosts ?? {};
  const variable = cashflow?.variableCosts ?? {};
  const monthlyEssential = sumObj(fixed) + sumObj(variable);
  const target = monthlyEssential * 12;
  const a = netWorth?.assets ?? {};
  const liquid = (a.cash ?? 0) + (a.savings ?? 0) + (a.gold ?? 0);
  const achievementPct =
    target > 0 ? Math.min(999, Math.round((liquid / target) * 100)) : 0;
  const monthsCovered = monthlyEssential > 0 ? liquid / monthlyEssential : 0;
  const gap = Math.max(0, target - liquid);
  return {
    monthlyEssential,
    target,
    liquid,
    achievementPct,
    monthsCovered,
    gap,
    achieved: target > 0 && liquid >= target,
  };
}

/* ─────────────────────────────────────────────
 *  4. An Toàn Tài Chính
 *  TS thanh khoản ≥ 120 tháng thu nhập (10 năm)
 *  + có BH nhân thọ và BH sức khoẻ
 * ───────────────────────────────────────────── */

export interface FinancialSafetyReport {
  monthlyIncome: number;
  target: number; // = income × 120 (10 năm)
  liquidPlusInvest: number;
  achievementPct: number;
  hasLifeInsurance: boolean;
  hasHealthInsurance: boolean;
  achieved: boolean;
}

export function reportFinancialSafety(
  cashflow: CashflowData | undefined,
  netWorth: NetWorthData | undefined,
  insurance: InsuranceData | undefined
): FinancialSafetyReport {
  const monthlyIncome = sumObj(cashflow?.income);
  const target = monthlyIncome * 120;
  const a = netWorth?.assets ?? {};
  const liquidPlusInvest =
    (a.cash ?? 0) +
    (a.savings ?? 0) +
    (a.gold ?? 0) +
    (a.stocks ?? 0) +
    (a.bonds ?? 0) +
    (a.funds ?? 0);
  const achievementPct =
    target > 0
      ? Math.min(999, Math.round((liquidPlusInvest / target) * 100))
      : 0;
  const c = insurance?.coverage ?? {};
  const hasLifeInsurance = (c.life ?? 0) > 0;
  const hasHealthInsurance = (c.health ?? 0) > 0;
  return {
    monthlyIncome,
    target,
    liquidPlusInvest,
    achievementPct,
    hasLifeInsurance,
    hasHealthInsurance,
    achieved:
      target > 0 &&
      liquidPlusInvest >= target &&
      hasLifeInsurance &&
      hasHealthInsurance,
  };
}

/* ─────────────────────────────────────────────
 *  5. Độc Lập Tài Chính
 *  PP1: Thu nhập thụ động /tháng ≥ Chi tiêu /tháng
 *  PP2: Tài sản × 4%/năm ≥ Chi tiêu năm (quy tắc 4%)
 * ───────────────────────────────────────────── */

export interface IndependenceReport {
  monthlyExpense: number;
  monthlyPassive: number;
  pp1Ratio: number;
  pp1Achieved: boolean;
  totalLiquid: number; // tài sản đầu tư + thanh khoản
  passiveFromAssets: number; // TS × 4% / 12
  pp2Achieved: boolean;
  pp2Ratio: number;
  targetCorpus: number; // = (chi - passive) × 12 / 4%
  achieved: boolean;
}

export function reportIndependence(
  cashflow: CashflowData | undefined,
  netWorth: NetWorthData | undefined
): IndependenceReport {
  const monthlyExpense =
    sumObj(cashflow?.fixedCosts) + sumObj(cashflow?.variableCosts);
  const monthlyPassive = cashflow?.income?.passive ?? 0;
  const pp1Ratio =
    monthlyExpense > 0
      ? Math.round((monthlyPassive / monthlyExpense) * 100)
      : 0;
  const pp1Achieved = monthlyExpense > 0 && monthlyPassive >= monthlyExpense;

  const a = netWorth?.assets ?? {};
  const totalLiquid =
    (a.cash ?? 0) +
    (a.savings ?? 0) +
    (a.gold ?? 0) +
    (a.stocks ?? 0) +
    (a.bonds ?? 0) +
    (a.funds ?? 0) +
    (a.crypto ?? 0) +
    (a.privateEquity ?? 0) +
    (a.rentalProperty ?? 0);
  const passiveFromAssets = (totalLiquid * 0.04) / 12;
  const netMonthly = Math.max(0, monthlyExpense - monthlyPassive);
  const targetCorpus = (netMonthly * 12) / 0.04;
  const pp2Ratio =
    targetCorpus > 0
      ? Math.round((totalLiquid / targetCorpus) * 100)
      : 100;
  const pp2Achieved = targetCorpus > 0 && totalLiquid >= targetCorpus;
  return {
    monthlyExpense,
    monthlyPassive,
    pp1Ratio,
    pp1Achieved,
    totalLiquid,
    passiveFromAssets,
    pp2Achieved,
    pp2Ratio,
    targetCorpus,
    achieved: pp1Achieved || pp2Achieved,
  };
}

/* ─────────────────────────────────────────────
 *  6. Bảo Hiểm (DIME)
 *  Mệnh giá hiện có vs đề xuất
 * ───────────────────────────────────────────── */

export interface InsuranceReport {
  annualIncome: number;
  annualExpense: number;
  totalCoverage: number;
  monthlyPremium: number;
  premiumPct: number; // % thu nhập
  // Đề xuất (chuẩn thầy):
  lifeNeed: number; // chi × 12 × 10 + học con + nợ
  healthNeed: number; // 1 tỷ
  accidentNeed: number; // 5× thu nhập năm
  criticalNeed: number; // 500tr
  educationNeed: number; // 50tr × 4 năm × số con
  totalNeed: number;
  overallAchievementPct: number;
  achieved: boolean;
}

const INCOME_YEARS = 10;
const HEALTH_TARGET = 1_000_000_000;
const ACCIDENT_MULT = 5;
const CRITICAL_TARGET = 500_000_000;
const EDU_PER_CHILD_PER_YEAR = 50_000_000;
const EDU_YEARS = 4;

export function reportInsurance(
  profile: ProfileData | undefined,
  cashflow: CashflowData | undefined,
  insurance: InsuranceData | undefined
): InsuranceReport {
  const monthlyIncome = sumObj(cashflow?.income);
  const annualIncome = monthlyIncome * 12;
  const monthlyExpense =
    sumObj(cashflow?.fixedCosts) + sumObj(cashflow?.variableCosts);
  const annualExpense = monthlyExpense * 12;
  const children = profile?.children ?? 0;
  const educationNeed = children * EDU_PER_CHILD_PER_YEAR * EDU_YEARS;
  const lifeNeed = annualExpense * INCOME_YEARS + educationNeed;
  const healthNeed = HEALTH_TARGET;
  const accidentNeed = annualIncome * ACCIDENT_MULT;
  const criticalNeed = CRITICAL_TARGET;
  const totalNeed =
    lifeNeed + healthNeed + accidentNeed + criticalNeed + educationNeed;
  const totalCoverage = sumObj(insurance?.coverage);
  const monthlyPremium = insurance?.monthlyPremium ?? 0;
  const premiumPct =
    annualIncome > 0
      ? Math.round(((monthlyPremium * 12) / annualIncome) * 100)
      : 0;
  const overallAchievementPct =
    totalNeed > 0
      ? Math.min(999, Math.round((totalCoverage / totalNeed) * 100))
      : 0;
  return {
    annualIncome,
    annualExpense,
    totalCoverage,
    monthlyPremium,
    premiumPct,
    lifeNeed,
    healthNeed,
    accidentNeed,
    criticalNeed,
    educationNeed,
    totalNeed,
    overallAchievementPct,
    achieved: totalNeed > 0 && totalCoverage >= totalNeed,
  };
}

/* ─────────────────────────────────────────────
 *  7. Kế Hoạch Hưu Trí (ước lượng)
 *  Dùng default: hưu 60 tuổi · sống 85 tuổi · lạm phát 3% · lãi 8%
 * ───────────────────────────────────────────── */

export interface RetirementReport {
  currentAge: number | null;
  yearsToRetirement: number;
  yearsInRetirement: number;
  monthlyExpense: number; // hiện tại
  futureMonthlyExpense: number; // sau lạm phát đến lúc hưu
  corpusNeeded: number; // số vốn cần lúc hưu
  currentCorpus: number; // TS thanh khoản + đầu tư hiện có
  requiredMonthlyContribution: number; // /tháng cần đóng đến lúc hưu
  achievedCorpusRatio: number;
}

const RETIREMENT_AGE = 60;
const LIFESPAN = 85;
const INFLATION = 0.03;
const RETURN_RATE = 0.08;

export function reportRetirement(
  profile: ProfileData | undefined,
  cashflow: CashflowData | undefined,
  netWorth: NetWorthData | undefined
): RetirementReport {
  const now = new Date().getFullYear();
  const currentAge = profile?.birthYear ? now - profile.birthYear : null;
  const yearsToRetirement =
    currentAge !== null ? Math.max(0, RETIREMENT_AGE - currentAge) : 0;
  const yearsInRetirement = LIFESPAN - RETIREMENT_AGE;
  const monthlyExpense =
    sumObj(cashflow?.fixedCosts) + sumObj(cashflow?.variableCosts);
  // Lạm phát compound đến lúc hưu
  const futureMonthlyExpense =
    monthlyExpense * Math.pow(1 + INFLATION, yearsToRetirement);
  // Corpus need: chi × 12 × số năm hưu × adjustment (giả định không sinh lãi cho đơn giản)
  // Realistic: sử dụng PV annuity với return - inflation
  // Đơn giản hoá: corpus = future monthly × 12 × yearsInRetirement
  const corpusNeeded = futureMonthlyExpense * 12 * yearsInRetirement;

  // Current corpus = liquid + invest assets
  const a = netWorth?.assets ?? {};
  const currentCorpus =
    (a.cash ?? 0) +
    (a.savings ?? 0) +
    (a.gold ?? 0) +
    (a.stocks ?? 0) +
    (a.bonds ?? 0) +
    (a.funds ?? 0) +
    (a.crypto ?? 0) +
    (a.privateEquity ?? 0) +
    (a.rentalProperty ?? 0);

  // Required monthly: PMT formula
  // FV = PV × (1+r)^n + PMT × ((1+r)^n - 1)/r
  // PMT = (FV - PV × (1+r)^n) × r / ((1+r)^n - 1)
  let requiredMonthlyContribution = 0;
  if (yearsToRetirement > 0) {
    const r = RETURN_RATE / 12;
    const n = yearsToRetirement * 12;
    const g = Math.pow(1 + r, n);
    if (g - 1 > 0) {
      const pmt = ((corpusNeeded - currentCorpus * g) * r) / (g - 1);
      requiredMonthlyContribution = Math.max(0, Math.round(pmt));
    }
  }
  const achievedCorpusRatio =
    corpusNeeded > 0
      ? Math.min(999, Math.round((currentCorpus / corpusNeeded) * 100))
      : 0;
  return {
    currentAge,
    yearsToRetirement,
    yearsInRetirement,
    monthlyExpense,
    futureMonthlyExpense,
    corpusNeeded,
    currentCorpus,
    requiredMonthlyContribution,
    achievedCorpusRatio,
  };
}

/* ─────────────────────────────────────────────
 *  8. Hoạch Định Dòng Tiền (Bucket Cascade)
 * ───────────────────────────────────────────── */

export interface CashFlowMapReport {
  totalIncome: number;
  essentialCap: number; // 55% TN
  essentialActual: number;
  essentialSavings: number; // bonus → FFA
  afterEssential: number;
  emergencyTarget: number;
  emergencyCurrent: number;
  emergencyFull: boolean;
  flowStatus: "building_emergency" | "cascading" | "no_income";
  monthlyEmergencyFlow: number;
  monthlyInvestFlow: number;
}

export function reportCashFlowMap(
  cashflow: CashflowData | undefined,
  netWorth: NetWorthData | undefined
): CashFlowMapReport {
  const totalIncome = sumObj(cashflow?.income);
  const essentialCap = Math.round(totalIncome * 0.55);
  const essentialActual =
    sumObj(cashflow?.fixedCosts) + sumObj(cashflow?.variableCosts);
  const essentialSavings = Math.max(
    0,
    Math.min(essentialCap, essentialCap - essentialActual)
  );
  const afterEssential = totalIncome - essentialActual;
  const emergencyTarget = essentialActual * 12;
  const a = netWorth?.assets ?? {};
  const emergencyCurrent =
    (a.cash ?? 0) + (a.savings ?? 0) + (a.gold ?? 0);
  const emergencyFull =
    emergencyTarget > 0 && emergencyCurrent >= emergencyTarget;
  let flowStatus: CashFlowMapReport["flowStatus"] = "no_income";
  let monthlyEmergencyFlow = 0;
  let monthlyInvestFlow = 0;
  if (totalIncome > 0) {
    if (!emergencyFull) {
      flowStatus = "building_emergency";
      monthlyEmergencyFlow = Math.max(0, afterEssential - essentialSavings);
    } else {
      flowStatus = "cascading";
      monthlyInvestFlow = afterEssential;
    }
  }
  return {
    totalIncome,
    essentialCap,
    essentialActual,
    essentialSavings,
    afterEssential,
    emergencyTarget,
    emergencyCurrent,
    emergencyFull,
    flowStatus,
    monthlyEmergencyFlow,
    monthlyInvestFlow,
  };
}

/* ─────────────────────────────────────────────
 *  Aggregate
 * ───────────────────────────────────────────── */

export interface BlueprintInsights {
  jars: JarsReport;
  assets: AssetCategoryReport;
  emergency: EmergencyFundReport;
  safety: FinancialSafetyReport;
  independence: IndependenceReport;
  insurance: InsuranceReport;
  retirement: RetirementReport;
  cashFlowMap: CashFlowMapReport;
}

export function buildBlueprintInsights(data: BlueprintData): BlueprintInsights {
  const cashflow = data.status?.cashflow;
  const netWorth = data.status?.netWorth;
  const insurance = data.status?.insurance;
  const profile = data.profile;
  return {
    jars: reportJars(cashflow),
    assets: reportAssetCategories(netWorth),
    emergency: reportEmergencyFund(cashflow, netWorth),
    safety: reportFinancialSafety(cashflow, netWorth, insurance),
    independence: reportIndependence(cashflow, netWorth),
    insurance: reportInsurance(profile, cashflow, insurance),
    retirement: reportRetirement(profile, cashflow, netWorth),
    cashFlowMap: reportCashFlowMap(cashflow, netWorth),
  };
}
