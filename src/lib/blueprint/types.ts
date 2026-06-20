/**
 * Entrepreneur Financial Blueprint — shared types
 *
 * Toàn bộ dữ liệu lưu trong 1 jsonb column `data`. Structure 4 phần:
 *
 *   Phần I  — Profile (thông tin cơ bản)
 *   Phần II — Tâm thức về tiền (3 bộ câu hỏi)
 *   Phần III— Thói quen về tiền (13 câu)
 *   Phần IV — Hiện trạng tài chính (Cashflow + Net Worth + Toàn diện)
 */

import type { HabitsAnswers } from "./data/habits-questions";

/* ─── PHẦN I: PROFILE ─── */

export type Gender = "male" | "female" | "other";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type PrimaryIncomeSource =
  | "business"
  | "salary"
  | "investment"
  | "other";

export interface ProfileData {
  fullName?: string;
  /** Ngày sinh đầy đủ, định dạng ISO "YYYY-MM-DD". */
  birthDate?: string;
  /** Năm sinh — vẫn giữ & tự suy ra từ birthDate để tính tuổi (hưu trí, …). */
  birthYear?: number;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  children?: number;
  occupation?: string;
  entrepreneurYears?: number;
  city?: string;
  /**
   * Cho phép chọn NHIỀU nguồn thu nhập chính.
   * (Legacy: `primaryIncomeSource` dạng single string — vẫn được hỗ trợ
   * khi load để không mất data cũ; UI luôn chuyển sang array.)
   */
  primaryIncomeSources?: PrimaryIncomeSource[];
  /** @deprecated Dùng primaryIncomeSources (array) thay vào. */
  primaryIncomeSource?: PrimaryIncomeSource;
}

/* ─── PHẦN II: TÂM THỨC VỀ TIỀN ─── */

export interface MindsetData {
  /** Test Tâm Thức 35 câu — answers[questionId] = 0..3 */
  archetypeAnswers?: Record<number, number>;
  /** Mức Độ Yêu Tiền 38 câu — answers[questionId] = "yes" | "no" */
  loveOfMoneyAnswers?: Record<number, "yes" | "no">;
  /** Niềm Tin Về Tiền 72 câu — answers[questionId] = 1..10 */
  beliefsAnswers?: Record<number, number>;
}

/* ─── PHẦN III: THÓI QUEN VỀ TIỀN ─── */

export interface HabitsData {
  answers?: HabitsAnswers;
}

/* ─── PHẦN IV: HIỆN TRẠNG TÀI CHÍNH ─── */

/** Mức độ ổn định công việc */
export type JobStability = "low" | "medium" | "high";
/** Tiềm năng tăng lương 6-12 tháng */
export type SalaryGrowth = "none" | "small" | "medium" | "high";
/** Mức độ đều của dòng tiền kinh doanh */
export type CashflowConsistency = "no" | "somewhat" | "yes";
/** Mức độ phụ thuộc kinh doanh vào cá nhân */
export type BusinessDependency = "fully" | "partially" | "system";
/** Mức bền vững thu nhập thụ động */
export type PassiveSustainability = "low" | "medium" | "high";

export interface CashflowIncome {
  /* ─── A. Lương (chủ động) ─── */
  salaryBase?: number;       // Lương cứng/tháng
  salaryBonus?: number;      // Thưởng + hoa hồng + phụ cấp
  salaryStability?: JobStability;
  salaryGrowth?: SalaryGrowth;

  /* Thu nhập vợ/chồng — giữ */
  spouse?: number;

  /* ─── B. Kinh doanh (chủ động) ─── */
  businessProfit?: number;          // Lợi nhuận ròng/tháng
  businessOperatingCost?: number;   // Chi phí vận hành (tham khảo, không cộng)
  businessCashflowConsistent?: CashflowConsistency;
  businessDependsOnYou?: BusinessDependency;

  /* ─── C. Thu nhập thụ động ─── */
  passiveRental?: number;        // Cho thuê tài sản
  passiveInvestment?: number;    // Lãi đầu tư, cổ tức, trái phiếu, quỹ
  passiveRoyalty?: number;       // Bản quyền + affiliate + hệ thống tự vận hành
  passiveSustainability?: PassiveSustainability;

  /* ─── D. Khác ─── */
  other?: number;

  /* ─── LEGACY (giữ để tương thích data cũ) ─── */
  personal?: number;  // = salaryBase (cũ)
  passive?: number;   // = tổng passive (cũ)
}

export interface CashflowFixedCosts {
  housing?: number;
  utilities?: number;
  education?: number;
  insurance?: number;
  debt?: number;
  transport?: number;
}

export interface CashflowVariableCosts {
  food?: number;
  shopping?: number;
  entertainment?: number;
  healthcare?: number;
  giving?: number;
  other?: number;
}

export interface CashflowSavings {
  /** Tiết kiệm chủ động /tháng */
  saving?: number;
  /** Đầu tư chủ động /tháng */
  investment?: number;
  emergencyFund?: number;
  ffa?: number;
  edu?: number;
  play?: number;
  give?: number;
}

export interface CashflowData {
  income?: CashflowIncome;
  fixedCosts?: CashflowFixedCosts;
  variableCosts?: CashflowVariableCosts;
  savings?: CashflowSavings;
}

/* ─── Qualitative assessments cho từng nhóm tài sản ─── */
export type EmergencyFundLevel = "none" | "lt3" | "3to6" | "gt6"; // < 3 / 3-6 / > 6 tháng
export type CryptoExposure = "none" | "lt10" | "10to30" | "gt30";
export type LiquidityAccess = "easy" | "partial" | "stuck";

export type ConsumptionLoadLevel = "low" | "medium" | "high";
export type GrowthHoldingPeriod = "short" | "medium" | "long"; // < 1y / 1-5y / > 5y
export type GrowthLeverage = "no" | "low" | "high";
export type DropReaction = "panic" | "hold" | "buyMore";

export type CashflowAssetStability = "low" | "medium" | "high";

export interface NetWorthAssets {
  /* ─── A. Tài sản thanh khoản ─── */
  cash?: number;                     // Tiền mặt
  bankAccount?: number;              // Tiền trong tài khoản ngân hàng
  savings?: number;                  // Sổ tiết kiệm có kỳ hạn
  gold?: number;                     // Vàng vật chất
  goldCertificate?: number;          // Vàng tài khoản, chứng chỉ vàng
  crypto?: number;                   // Crypto
  moneyMarketFund?: number;          // Quỹ tiền tệ / trái phiếu ngắn hạn
  shortTermLoanReceivable?: number;  // Khoản cho vay ngắn hạn thu hồi được
  otherLiquid?: number;              // Tài sản thanh khoản khác

  // Qualitative — nhóm thanh khoản
  emergencyFundMonths?: EmergencyFundLevel;
  cryptoExposurePct?: CryptoExposure;
  liquidityAccess?: LiquidityAccess;

  /* ─── B. Tài sản tiêu dùng ─── */
  primaryHome?: number;              // Nhà đang ở
  familyLand?: number;               // Đất/nhà gia đình không cho thuê
  car?: number;                      // Ô tô cá nhân
  motorbike?: number;                // Xe máy
  furniture?: number;                // Nội thất, gia dụng giá trị lớn
  jewelry?: number;                  // Trang sức cá nhân
  tech?: number;                     // Đồ công nghệ giá trị cao
  otherConsumption?: number;         // Tài sản tiêu dùng khác

  // Qualitative — nhóm tiêu dùng
  consumptionMaintenanceLoad?: ConsumptionLoadLevel; // Bảo trì + lãi vay áp lực
  consumptionOnDebt?: "no" | "some" | "much";

  /* ─── C. Tài sản tăng trưởng ─── */
  rawLand?: number;                  // Đất nền
  agriLand?: number;                 // Đất nông nghiệp
  individualStocks?: number;         // Cổ phiếu riêng lẻ
  equityFunds?: number;              // Chứng chỉ quỹ cổ phiếu
  etf?: number;                      // ETF
  privateEquity?: number;            // Cổ phần DN chưa niêm yết
  startup?: number;                  // Startup / VC
  propertyForGrowth?: number;        // BĐS chờ tăng giá chưa cho thuê
  otherGrowth?: number;              // Tài sản tăng trưởng khác

  // Qualitative — nhóm tăng trưởng
  growthHoldingPeriod?: GrowthHoldingPeriod;
  growthLeverage?: GrowthLeverage;
  growthDropReaction?: DropReaction;

  /* ─── D. Tài sản dòng tiền ─── */
  rentalProperty?: number;           // BĐS cho thuê (giá trị tài sản)
  bondsForCashflow?: number;         // Trái phiếu (giá trị)
  dividendStocks?: number;           // Cổ phiếu cổ tức (giá trị)
  businessEquity?: number;           // Vốn góp kinh doanh (giá trị)
  passiveSystem?: number;            // Hệ thống thu nhập thụ động
  royaltyAsset?: number;             // Tài sản sở hữu trí tuệ
  lendingCapital?: number;           // Vốn cho vay lấy lãi
  otherCashflow?: number;            // Tài sản dòng tiền khác

  // Qualitative — nhóm dòng tiền
  cashflowStability?: CashflowAssetStability;
  cashflowOnDebt?: "no" | "some" | "much";

  /* ─── LEGACY (giữ tương thích data cũ) ─── */
  stocks?: number;    // = individualStocks (cũ)
  bonds?: number;     // = bondsForCashflow (cũ)
  funds?: number;     // = equityFunds (cũ)
  vehicles?: number;  // = car + motorbike (cũ)
  other?: number;     // = otherConsumption (cũ, fallback)
}

/* ─── Qualitative cho từng nhóm nợ ─── */
export type RateType = "fixed" | "floating" | "mixed";
export type RateIncreaseAffordability = "no" | "tight" | "yes";
export type DebtExitPlan = "none" | "partial" | "clear";
export type ReturnVsRate = "below" | "equal" | "above";

export interface NetWorthLiabilities {
  /* ─── A. Nợ tiêu dùng ngắn hạn ─── */
  creditCard?: number;          // Nợ thẻ tín dụng
  personalLoan?: number;        // Vay tiêu dùng cá nhân
  installment?: number;         // Mua hàng trả góp
  onlineLoan?: number;          // Vay app / vay online
  familyLoanConsumer?: number;  // Vay người thân cho tiêu dùng
  otherConsumerDebt?: number;   // Nợ tiêu dùng khác

  // Qualitative — nợ tiêu dùng
  consumerDebtMonthly?: number;     // Tổng trả nợ tiêu dùng /tháng
  hasHighInterestDebt?: boolean;    // Có khoản > 20%/năm
  hasPastDueDebt?: boolean;         // Có khoản quá hạn

  /* ─── B. Nợ mua nhà / mua xe (sinh hoạt) ─── */
  mortgage?: number;          // Vay mua nhà để ở
  homeRepair?: number;        // Vay sửa nhà
  carLoan?: number;           // Vay mua ô tô
  motorbikeLoan?: number;     // Vay mua xe máy
  otherFamilyDebt?: number;   // Nợ khác phục vụ sinh hoạt

  // Qualitative — nợ nhà/xe
  familyDebtMonthly?: number;             // Trả nợ nhà-xe /tháng
  familyDebtRateType?: RateType;
  familyRateIncreaseAffordable?: RateIncreaseAffordability;
  familyDebtHasInsurance?: boolean;

  /* ─── C. Nợ đầu tư ─── */
  investmentProperty?: number;   // Vay mua BĐS đầu tư
  investmentLand?: number;       // Vay mua đất nền
  investmentStock?: number;      // Vay đầu tư cổ phiếu
  marginStock?: number;          // Margin chứng khoán
  businessDebt?: number;         // Vay góp vốn kinh doanh
  cryptoLoan?: number;           // Vay đầu tư crypto
  otherInvestmentDebt?: number;  // Nợ đầu tư khác

  // Qualitative — nợ đầu tư
  investmentDebtMonthly?: number;          // Trả nợ đầu tư /tháng
  investmentReturnVsRate?: ReturnVsRate;
  investmentDropPressure?: "yes" | "tight" | "no"; // Áp lực bán khi giảm 20-30%
  investmentHasCollateral?: boolean;
  investmentDebtExitPlan?: DebtExitPlan;

  /* ─── LEGACY (giữ tương thích) ─── */
  other?: number;
}

export interface NetWorthData {
  assets?: NetWorthAssets;
  liabilities?: NetWorthLiabilities;
}

/* ─── Bảo hiểm ─── */

export interface InsuranceCoverage {
  /** Mệnh giá BH nhân thọ */
  life?: number;
  /** Mệnh giá BH sức khỏe */
  health?: number;
  /** Mệnh giá BH tai nạn */
  accident?: number;
  /** Mệnh giá BH bệnh hiểm nghèo */
  criticalIllness?: number;
  /** Mệnh giá BH giáo dục con */
  education?: number;
}

export interface InsuranceData {
  coverage?: InsuranceCoverage;
  /** Phí BH tổng /tháng (tham khảo) */
  monthlyPremium?: number;
}

export interface StatusData {
  cashflow?: CashflowData;
  netWorth?: NetWorthData;
  insurance?: InsuranceData;
}

/* ─── ROOT BLUEPRINT DATA ─── */

export interface BlueprintData {
  profile?: ProfileData;
  mindset?: MindsetData;
  habits?: HabitsData;
  status?: StatusData;
}

export type SectionKey = "profile" | "mindset" | "habits" | "status";

export interface BlueprintProgress {
  profile?: boolean;
  mindset?: boolean;
  habits?: boolean;
  status?: boolean;
}

export interface BlueprintRow {
  id: string;
  user_id: string;
  data: BlueprintData;
  progress: BlueprintProgress;
  created_at: string;
  updated_at: string;
}
