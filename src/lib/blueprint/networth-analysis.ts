/**
 * NetWorth Analysis — Phân tích chi tiết cơ cấu tài sản + nợ + Net Worth
 *
 * Trả về:
 *  - 4 nhóm tài sản tổng + tỷ trọng + threshold interpretations
 *  - 3 nhóm nợ tổng + tỷ trọng
 *  - 3 chỉ số nợ chính: Nợ/Tài sản, Nợ/NetWorth, Trả nợ/Thu nhập
 *  - Đánh giá chất lượng nợ (nợ tốt vs nợ xấu)
 *  - Net Worth + tier
 */

import type {
  CashflowIncome,
  NetWorthAssets,
  NetWorthLiabilities,
} from "./types";

export interface GroupBreakdown {
  total: number;
  pct: number;
  verdict: string;
  verdictColor: string;
}

export interface DebtQualityCategory {
  label: string;
  amount: number;
  type: "bad" | "neutral" | "good";
  note: string;
}

export interface NetWorthAnalysisResult {
  // Totals
  liquidTotal: number;
  consumptionTotal: number;
  growthTotal: number;
  cashflowTotal: number;
  totalAssets: number;

  consumerDebtTotal: number;
  familyDebtTotal: number;
  investmentDebtTotal: number;
  totalDebt: number;

  netWorth: number;

  // 4 group breakdowns
  liquidBreak: GroupBreakdown;
  consumptionBreak: GroupBreakdown;
  growthBreak: GroupBreakdown;
  cashflowBreak: GroupBreakdown;

  // 3 ratio chính
  debtToAssetPct: number;
  debtToAssetVerdict: string;
  debtToAssetColor: string;
  debtToNetWorthPct: number;
  debtToNetWorthVerdict: string;
  debtToNetWorthColor: string;
  monthlyDebtPaymentPct: number; // % thu nhập
  monthlyDebtVerdict: string;
  monthlyDebtColor: string;

  totalMonthlyDebtPayment: number;
  totalMonthlyIncome: number;

  // Debt quality
  debtCategories: DebtQualityCategory[];
  badDebtTotal: number;
  goodDebtTotal: number;
  neutralDebtTotal: number;

  // Tier overall
  tierLabel: string;
  tierColor: string;
  tierEmoji: string;
  summary: string;
}

const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const RED = "#ef4444";
const NAVY = "#1A2B47";

export function computeNetWorthAnalysis(
  assets: NetWorthAssets | undefined,
  liabilities: NetWorthLiabilities | undefined,
  income: CashflowIncome | undefined
): NetWorthAnalysisResult {
  const a = assets ?? {};
  const l = liabilities ?? {};

  // ─── TỔNG THEO 4 NHÓM TÀI SẢN ───
  // A. Thanh khoản
  const liquidTotal =
    (a.cash ?? 0) +
    (a.bankAccount ?? 0) +
    (a.savings ?? 0) +
    (a.gold ?? 0) +
    (a.goldCertificate ?? 0) +
    (a.crypto ?? 0) +
    (a.moneyMarketFund ?? 0) +
    (a.shortTermLoanReceivable ?? 0) +
    (a.otherLiquid ?? 0);

  // B. Tiêu dùng (+ legacy vehicles, other)
  const consumptionTotal =
    (a.primaryHome ?? 0) +
    (a.familyLand ?? 0) +
    (a.car ?? 0) +
    (a.motorbike ?? 0) +
    (a.vehicles ?? 0) + // legacy vehicles → tiêu dùng
    (a.furniture ?? 0) +
    (a.jewelry ?? 0) +
    (a.tech ?? 0) +
    (a.otherConsumption ?? 0) +
    (a.other ?? 0); // legacy other → tiêu dùng

  // C. Tăng trưởng (+ legacy stocks, funds)
  const growthTotal =
    (a.rawLand ?? 0) +
    (a.agriLand ?? 0) +
    (a.individualStocks ?? 0) +
    (a.stocks ?? 0) + // legacy
    (a.equityFunds ?? 0) +
    (a.funds ?? 0) + // legacy
    (a.etf ?? 0) +
    (a.privateEquity ?? 0) +
    (a.startup ?? 0) +
    (a.propertyForGrowth ?? 0) +
    (a.otherGrowth ?? 0);

  // D. Dòng tiền (+ legacy bonds)
  const cashflowTotal =
    (a.rentalProperty ?? 0) +
    (a.bondsForCashflow ?? 0) +
    (a.bonds ?? 0) + // legacy
    (a.dividendStocks ?? 0) +
    (a.businessEquity ?? 0) +
    (a.passiveSystem ?? 0) +
    (a.royaltyAsset ?? 0) +
    (a.lendingCapital ?? 0) +
    (a.otherCashflow ?? 0);

  const totalAssets =
    liquidTotal + consumptionTotal + growthTotal + cashflowTotal;

  // ─── TỔNG THEO 3 NHÓM NỢ ───
  const consumerDebtTotal =
    (l.creditCard ?? 0) +
    (l.personalLoan ?? 0) +
    (l.installment ?? 0) +
    (l.onlineLoan ?? 0) +
    (l.familyLoanConsumer ?? 0) +
    (l.otherConsumerDebt ?? 0);

  const familyDebtTotal =
    (l.mortgage ?? 0) +
    (l.homeRepair ?? 0) +
    (l.carLoan ?? 0) +
    (l.motorbikeLoan ?? 0) +
    (l.otherFamilyDebt ?? 0);

  const investmentDebtTotal =
    (l.investmentProperty ?? 0) +
    (l.investmentLand ?? 0) +
    (l.investmentStock ?? 0) +
    (l.marginStock ?? 0) +
    (l.businessDebt ?? 0) +
    (l.cryptoLoan ?? 0) +
    (l.otherInvestmentDebt ?? 0) +
    (l.other ?? 0); // legacy

  const totalDebt =
    consumerDebtTotal + familyDebtTotal + investmentDebtTotal;

  const netWorth = totalAssets - totalDebt;

  // ─── 4 GROUP BREAKDOWNS với threshold ───
  const pctOf = (v: number) =>
    totalAssets > 0 ? Math.round((v / totalAssets) * 100) : 0;

  // A. Thanh khoản: < 5% rủi ro, 5-15% ổn, 15-30% an toàn, > 30% quá thận trọng
  const liquidPct = pctOf(liquidTotal);
  const liquidBreak: GroupBreakdown = {
    total: liquidTotal,
    pct: liquidPct,
    verdict:
      liquidPct < 5
        ? "Rủi ro thanh khoản cao · dễ bị động khi có biến cố"
        : liquidPct < 15
          ? "Tạm ổn nếu đã có quỹ dự phòng 3-6 tháng chi phí"
          : liquidPct <= 30
            ? "An toàn · linh hoạt · phù hợp người cần ổn định"
            : "Có thể quá thận trọng · tiền nhàn rỗi chưa tối ưu sinh lời",
    verdictColor:
      liquidPct < 5 ? RED : liquidPct <= 30 ? GREEN : AMBER,
  };

  // B. Tiêu dùng: < 30% linh hoạt, 30-50% cân bằng, 50-70% đóng băng, > 70% mất cân đối
  const consumptionPct = pctOf(consumptionTotal);
  const consumptionBreak: GroupBreakdown = {
    total: consumptionTotal,
    pct: consumptionPct,
    verdict:
      consumptionPct < 30
        ? "Cơ cấu khá linh hoạt · nhiều dư địa đầu tư"
        : consumptionPct < 50
          ? "Tương đối cân bằng nếu tài sản chính là nhà ở"
          : consumptionPct <= 70
            ? "Tài sản bị 'đóng băng' nhiều vào nhu cầu tiêu dùng"
            : "Rủi ro mất cân đối · giàu tài sản nhưng thiếu dòng tiền",
    verdictColor:
      consumptionPct < 30 ? GREEN : consumptionPct <= 50 ? GREEN : consumptionPct <= 70 ? AMBER : RED,
  };

  // C. Tăng trưởng: < 20% thấp, 20-50% tốt, 50-70% biến động, > 70% rủi ro
  const growthPct = pctOf(growthTotal);
  const growthBreak: GroupBreakdown = {
    total: growthTotal,
    pct: growthPct,
    verdict:
      growthPct < 20
        ? "Khả năng tăng trưởng dài hạn còn thấp"
        : growthPct <= 50
          ? "Tương đối tốt nếu phù hợp khẩu vị rủi ro"
          : growthPct <= 70
            ? "Tăng trưởng cao nhưng biến động lớn"
            : "Cần kiểm soát rủi ro · đặc biệt nếu dùng nợ đầu tư",
    verdictColor:
      growthPct < 20 ? AMBER : growthPct <= 50 ? GREEN : growthPct <= 70 ? AMBER : RED,
  };

  // D. Dòng tiền: < 10% phụ thuộc, 10-30% nền tảng, 30-50% tốt, > 50% rất tốt
  const cashflowPct = pctOf(cashflowTotal);
  const cashflowBreak: GroupBreakdown = {
    total: cashflowTotal,
    pct: cashflowPct,
    verdict:
      cashflowPct < 10
        ? "Phụ thuộc nhiều vào thu nhập chủ động"
        : cashflowPct <= 30
          ? "Bắt đầu có nền tảng thu nhập thụ động"
          : cashflowPct <= 50
            ? "Cơ cấu tốt cho mục tiêu tự do tài chính"
            : "Rất tốt nếu dòng tiền ổn định, bền vững và ít rủi ro",
    verdictColor:
      cashflowPct < 10 ? RED : cashflowPct <= 30 ? AMBER : GREEN,
  };

  // ─── 3 RATIO NỢ ───
  // 1. Nợ/Tổng tài sản
  const debtToAssetPct =
    totalAssets > 0 ? Math.round((totalDebt / totalAssets) * 100) : 0;
  const debtToAssetVerdict =
    debtToAssetPct <= 20
      ? "An toàn"
      : debtToAssetPct <= 40
        ? "Chấp nhận được nếu dòng tiền ổn định"
        : debtToAssetPct <= 60
          ? "Cần theo dõi kỹ · đặc biệt khi lãi suất tăng"
          : "Rủi ro cao · cần kế hoạch giảm nợ hoặc tái cấu trúc";
  const debtToAssetColor =
    debtToAssetPct <= 20
      ? GREEN
      : debtToAssetPct <= 40
        ? GREEN
        : debtToAssetPct <= 60
          ? AMBER
          : RED;

  // 2. Nợ/Net Worth
  const debtToNetWorthPct =
    netWorth > 0 ? Math.round((totalDebt / netWorth) * 100) : 999;
  const debtToNetWorthVerdict =
    netWorth <= 0
      ? "Net Worth âm hoặc 0 — không tính được tỷ lệ"
      : debtToNetWorthPct < 50
        ? "Khá an toàn"
        : debtToNetWorthPct <= 100
          ? "Cần quản trị dòng tiền cẩn thận"
          : debtToNetWorthPct <= 200
            ? "Đòn bẩy cao"
            : "Rủi ro tài chính nghiêm trọng";
  const debtToNetWorthColor =
    netWorth <= 0
      ? RED
      : debtToNetWorthPct < 50
        ? GREEN
        : debtToNetWorthPct <= 100
          ? AMBER
          : RED;

  // 3. Trả nợ/Thu nhập
  const totalMonthlyDebtPayment =
    (l.consumerDebtMonthly ?? 0) +
    (l.familyDebtMonthly ?? 0) +
    (l.investmentDebtMonthly ?? 0);

  // Compute total income from CashflowIncome
  const totalMonthlyIncome = computeMonthlyIncome(income);

  const monthlyDebtPaymentPct =
    totalMonthlyIncome > 0
      ? Math.round((totalMonthlyDebtPayment / totalMonthlyIncome) * 100)
      : 0;
  const monthlyDebtVerdict =
    totalMonthlyIncome === 0
      ? "Chưa có dữ liệu thu nhập"
      : monthlyDebtPaymentPct < 25
        ? "An toàn"
        : monthlyDebtPaymentPct <= 35
          ? "Có thể chấp nhận"
          : monthlyDebtPaymentPct <= 50
            ? "Áp lực tài chính cao"
            : "Rủi ro mất cân đối dòng tiền";
  const monthlyDebtColor =
    totalMonthlyIncome === 0
      ? AMBER
      : monthlyDebtPaymentPct < 25
        ? GREEN
        : monthlyDebtPaymentPct <= 35
          ? GREEN
          : monthlyDebtPaymentPct <= 50
            ? AMBER
            : RED;

  // ─── CHẤT LƯỢNG NỢ ───
  const debtCategories: DebtQualityCategory[] = [];

  // Bad debt
  const creditCardLike =
    (l.creditCard ?? 0) +
    (l.personalLoan ?? 0) +
    (l.installment ?? 0) +
    (l.onlineLoan ?? 0) +
    (l.familyLoanConsumer ?? 0) +
    (l.otherConsumerDebt ?? 0);
  if (creditCardLike > 0) {
    debtCategories.push({
      label: "Nợ tiêu dùng (thẻ tín dụng, vay app…)",
      amount: creditCardLike,
      type: "bad",
      note: "Lãi suất cao · ưu tiên xử lý trước",
    });
  }

  const cryptoLoan = l.cryptoLoan ?? 0;
  if (cryptoLoan > 0) {
    debtCategories.push({
      label: "Vay đầu tư crypto",
      amount: cryptoLoan,
      type: "bad",
      note: "Rủi ro rất cao · biến động lớn",
    });
  }

  const marginStock = l.marginStock ?? 0;
  if (marginStock > 0) {
    debtCategories.push({
      label: "Margin chứng khoán",
      amount: marginStock,
      type: "bad",
      note: "Rất rủi ro · có thể bị force-sell",
    });
  }

  // Neutral debt — mortgage
  const mortgageLike = (l.mortgage ?? 0) + (l.homeRepair ?? 0);
  if (mortgageLike > 0) {
    debtCategories.push({
      label: "Nợ mua nhà / sửa nhà để ở",
      amount: mortgageLike,
      type: "neutral",
      note: "Trung tính · phụ thuộc khả năng trả nợ",
    });
  }

  // Bad — vehicles for consumption
  const vehicleLoan = (l.carLoan ?? 0) + (l.motorbikeLoan ?? 0);
  if (vehicleLoan > 0) {
    debtCategories.push({
      label: "Vay mua xe cá nhân",
      amount: vehicleLoan,
      type: "bad",
      note: "Tài sản giảm giá · cần kiểm soát",
    });
  }

  // Good debt — investment with cashflow (rental property)
  const goodInvestment = l.investmentProperty ?? 0;
  if (goodInvestment > 0) {
    debtCategories.push({
      label: "Vay mua BĐS đầu tư (cho thuê)",
      amount: goodInvestment,
      type: "good",
      note: "Có thể là nợ tốt nếu tạo dòng tiền dương",
    });
  }

  // Neutral — land or stock (no cashflow)
  const noCashflowInvestment =
    (l.investmentLand ?? 0) + (l.investmentStock ?? 0);
  if (noCashflowInvestment > 0) {
    debtCategories.push({
      label: "Vay đầu tư đất nền / cổ phiếu",
      amount: noCashflowInvestment,
      type: "neutral",
      note: "Rủi ro cao nếu tài sản không tạo dòng tiền",
    });
  }

  const businessLoan = l.businessDebt ?? 0;
  if (businessLoan > 0) {
    debtCategories.push({
      label: "Vay góp vốn kinh doanh",
      amount: businessLoan,
      type: "neutral",
      note: "Phụ thuộc hiệu quả kinh doanh",
    });
  }

  const otherInvDebt = l.otherInvestmentDebt ?? 0;
  if (otherInvDebt > 0) {
    debtCategories.push({
      label: "Nợ đầu tư khác",
      amount: otherInvDebt,
      type: "neutral",
      note: "Cần đánh giá chi tiết",
    });
  }

  const badDebtTotal = debtCategories
    .filter((c) => c.type === "bad")
    .reduce((s, c) => s + c.amount, 0);
  const goodDebtTotal = debtCategories
    .filter((c) => c.type === "good")
    .reduce((s, c) => s + c.amount, 0);
  const neutralDebtTotal = debtCategories
    .filter((c) => c.type === "neutral")
    .reduce((s, c) => s + c.amount, 0);

  // ─── TIER TỔNG QUAN ───
  let tierLabel: string;
  let tierColor: string;
  let tierEmoji: string;
  let summary: string;

  const isHealthy =
    netWorth > 0 &&
    debtToAssetPct <= 40 &&
    monthlyDebtPaymentPct < 35 &&
    cashflowPct >= 10;

  if (netWorth <= 0) {
    tierLabel = "Net Worth âm · cần ưu tiên giảm nợ";
    tierColor = RED;
    tierEmoji = "🚨";
    summary =
      "Tài sản ròng đang âm — nợ cao hơn tài sản. Ưu tiên tuyệt đối: dừng vay mới, lập kế hoạch trả nợ tiêu dùng/lãi cao trước, kiểm soát chi tiêu.";
  } else if (isHealthy && netWorth > 0) {
    tierLabel = "Cơ cấu lành mạnh";
    tierColor = GREEN;
    tierEmoji = "💎";
    summary =
      "Cơ cấu tài sản + nợ lành mạnh. Tập trung: tối ưu nợ tốt (mortgage rate refinance), tăng tỷ trọng dòng tiền lên ≥ 30%, mở rộng đầu tư bài bản.";
  } else if (debtToAssetPct > 60 || monthlyDebtPaymentPct > 50) {
    tierLabel = "Rủi ro cao · cần tái cấu trúc";
    tierColor = RED;
    tierEmoji = "⚠️";
    summary =
      "Tỷ lệ nợ cao + áp lực trả nợ lớn. Cần: tái cấu trúc nợ ngay (giảm lãi, kéo dài kỳ hạn), bán bớt tài sản tiêu dùng nếu cần, dừng đầu tư rủi ro.";
  } else {
    tierLabel = "Cần tối ưu · còn dư địa";
    tierColor = AMBER;
    tierEmoji = "⚡";
    summary =
      "Cơ cấu chấp nhận được nhưng còn dư địa cải thiện. Trong 6-12 tháng: giảm nợ tiêu dùng lãi cao, tăng quỹ dự phòng lên 3-6 tháng, từng bước xây tài sản dòng tiền.";
  }

  void NAVY;

  return {
    liquidTotal,
    consumptionTotal,
    growthTotal,
    cashflowTotal,
    totalAssets,
    consumerDebtTotal,
    familyDebtTotal,
    investmentDebtTotal,
    totalDebt,
    netWorth,
    liquidBreak,
    consumptionBreak,
    growthBreak,
    cashflowBreak,
    debtToAssetPct,
    debtToAssetVerdict,
    debtToAssetColor,
    debtToNetWorthPct,
    debtToNetWorthVerdict,
    debtToNetWorthColor,
    monthlyDebtPaymentPct,
    monthlyDebtVerdict,
    monthlyDebtColor,
    totalMonthlyDebtPayment,
    totalMonthlyIncome,
    debtCategories,
    badDebtTotal,
    goodDebtTotal,
    neutralDebtTotal,
    tierLabel,
    tierColor,
    tierEmoji,
    summary,
  };
}

function computeMonthlyIncome(income: CashflowIncome | undefined): number {
  if (!income) return 0;
  const salaryBase = income.salaryBase ?? income.personal ?? 0;
  const salary =
    salaryBase + (income.salaryBonus ?? 0) + (income.spouse ?? 0);
  const business = income.businessProfit ?? 0;
  const newPassiveSum =
    (income.passiveRental ?? 0) +
    (income.passiveInvestment ?? 0) +
    (income.passiveRoyalty ?? 0);
  const passive =
    newPassiveSum > 0 ? newPassiveSum : income.passive ?? 0;
  const other = income.other ?? 0;
  return salary + business + passive + other;
}
