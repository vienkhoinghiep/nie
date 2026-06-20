/**
 * Financial Health Check — 11-metric / 5-group scoring engine (v2).
 *
 * Theo spec của anh Tuệ — bộ 11 chỉ số đo lường sức khỏe tài chính chuẩn
 * dành cho gia đình Việt:
 *
 *  Bộ 1 — Chi tiêu        (2 metrics)
 *    1.1 Tỉ lệ thanh toán nợ       < 35%
 *    1.2 Tỉ lệ tiết kiệm           > 10%
 *
 *  Bộ 2 — Thanh khoản     (2 metrics)
 *    2.1 Thanh khoản / Thanh toán  > 1
 *    2.2 Thanh khoản / Đầu tư      ≈ 10%
 *
 *  Bộ 3 — Tích luỹ        (1 metric)
 *    3.1 Tài sản cần tích lũy = (tuổi × thu nhập năm) / 10
 *
 *  Bộ 4 — Bảo vệ          (2 metrics)
 *    4.1 Tỉ lệ chi bảo hiểm        ≈ 10% thu nhập
 *    4.2 Mức độ giàu có            > 1 năm
 *
 *  Bộ 5 — Cấu trúc TS theo tuổi   (4 metrics)
 *    5.1 Tài sản thanh khoản       ≈ 20%
 *    5.2 Tài sản tiêu sản          < 10% (<45t), < 20% (≥45t)
 *    5.3 Tài sản tăng trưởng       ≥ 50% (<45t), ≥ 10% (≥45t)
 *    5.4 Tài sản dòng tiền         ≥ 20% (<45t), ≥ 50% (≥45t)
 *
 * Mỗi metric tối đa 10 điểm → tổng raw 110 → scale 0-100.
 */

export interface FinancialHealthInputs {
  // 1. Nhóm thông tin cá nhân
  age_husband: number;
  age_wife: number;
  age_child1: number;
  age_child2: number;
  age_child3: number;

  // 2. Nhóm thông tin tài chính — đơn vị: VND / tháng
  monthly_income: number;
  monthly_expenses: number;
  monthly_passive_income: number; // BĐS cho thuê, cổ tức, lãi gửi… (cố định/tháng)
  monthly_debt_payment: number;   // Tổng tiền trả nợ hàng tháng

  // 3. Tài sản hiện có — đơn vị: VND
  assets_liquid: number;       // Thanh khoản: tiền mặt, TK ngân hàng, vàng dễ rút
  assets_growth: number;       // Tăng trưởng: cổ phiếu, quỹ, BĐS đầu tư, crypto
  assets_cashflow: number;     // Dòng tiền: BĐS cho thuê, doanh nghiệp tạo dòng tiền
  assets_consumption: number;  // Tiêu sản: nhà để ở, xe để đi

  // 4. Nợ hiện có (chia "xấu" vs "tốt") — đơn vị: VND (số dư nợ còn lại)
  debt_credit_card: number;    // Nợ xấu: thẻ tín dụng
  debt_installment: number;    // Nợ xấu: mua trả góp
  debt_car: number;            // Nợ xấu: vay mua xe
  debt_house: number;          // Nợ xấu: vay mua nhà
  debt_business: number;       // Nợ tốt: vay đầu tư kinh doanh

  // 5. Bảo hiểm — đơn vị: VND / tháng
  insurance_health: number;        // Bảo hiểm sức khỏe
  insurance_life_husband: number;  // BH nhân thọ cho chồng
  insurance_life_wife: number;     // BH nhân thọ cho vợ
}

export type Rating = "good" | "fair" | "critical";

export type GroupKey = "spending" | "liquidity" | "accumulation" | "protection" | "allocation";

export const GROUP_LABELS: Record<GroupKey, string> = {
  spending: "Chi tiêu",
  liquidity: "Thanh khoản",
  accumulation: "Tích luỹ tài sản",
  protection: "Bảo vệ tài chính",
  allocation: "Cấu trúc tài sản theo tuổi",
};

export type MetricKey =
  | "debt_payment_ratio"
  | "saving_rate"
  | "liquidity_coverage"
  | "liquidity_to_growth"
  | "wealth_accumulation"
  | "insurance_ratio"
  | "wealth_years"
  | "alloc_liquid"
  | "alloc_consumption"
  | "alloc_growth"
  | "alloc_cashflow";

export interface MetricScore {
  key: MetricKey;
  group: GroupKey;
  group_label: string;
  label: string;
  value: number;       // Computed actual value (% / năm / lần / …)
  unit: string;
  ideal: string;       // Human-readable target ("< 35%")
  ideal_value?: number; // Numerical target for math display (optional)
  score: number;       // 0-10 (mỗi metric)
  rating: Rating;
  hint: string;        // Lời khuyên
}

export interface GroupScore {
  key: GroupKey;
  label: string;
  metrics: MetricScore[];
  score: number;       // Sum of metrics' scores
  max_score: number;   // metrics.length * 10
  pct: number;         // 0-100 within group
  rating: Rating;
}

export interface FinancialHealthResult {
  metrics: MetricScore[];     // 11 metrics flat
  groups: GroupScore[];       // 5 groups
  total_score: number;        // 0-100
  rating: Rating;             // overall
  summary: string;
  inputs: FinancialHealthInputs;
}

/* ───────────────────────── helpers ───────────────────────── */

function safeDiv(num: number, denom: number): number {
  if (!denom || denom <= 0) return 0;
  return num / denom;
}

function classify(score: number): Rating {
  if (score >= 7) return "good";
  if (score >= 4) return "fair";
  return "critical";
}

function overallRating(total: number): Rating {
  if (total >= 70) return "good";
  if (total >= 40) return "fair";
  return "critical";
}

function refAge(i: FinancialHealthInputs): number {
  if (i.age_husband > 0) return i.age_husband;
  if (i.age_wife > 0) return i.age_wife;
  return 35;
}

// Score = 10 when actual is at or better than ideal range, 0 when much worse.
// Generic "lower is better" curve for metrics like debt ratio.
function scoreLowerIsBetter(actualPct: number, idealPct: number, hardCapPct: number): number {
  if (actualPct <= idealPct * 0.5) return 10;          // Significantly better
  if (actualPct <= idealPct) return Math.round(10 - (actualPct - idealPct * 0.5) / (idealPct * 0.5) * 3); // 10 → 7
  if (actualPct <= hardCapPct) return Math.round(7 - (actualPct - idealPct) / (hardCapPct - idealPct) * 7); // 7 → 0
  return 0;
}

// Generic "higher is better" curve for metrics like saving rate.
function scoreHigherIsBetter(actualPct: number, idealPct: number, maxPct: number): number {
  if (actualPct <= 0) return 0;
  if (actualPct >= maxPct) return 10;
  if (actualPct >= idealPct) return Math.round(7 + (actualPct - idealPct) / (maxPct - idealPct) * 3); // 7 → 10
  return Math.round((actualPct / idealPct) * 7); // 0 → 7
}

// Score for "close to target" — sweet spot at target, decreases either way.
function scoreCloseToTarget(actualPct: number, idealPct: number, tolerance: number): number {
  const dist = Math.abs(actualPct - idealPct);
  if (dist <= tolerance * 0.3) return 10;
  if (dist <= tolerance) return Math.round(10 - (dist - tolerance * 0.3) / (tolerance * 0.7) * 4); // 10 → 6
  if (dist <= tolerance * 2) return Math.round(6 - (dist - tolerance) / tolerance * 6); // 6 → 0
  return 0;
}

/* ───────────────────────── per-metric scorers ───────────────────────── */

function m_debtPaymentRatio(i: FinancialHealthInputs): MetricScore {
  const pct = safeDiv(i.monthly_debt_payment, i.monthly_income) * 100;
  const score = scoreLowerIsBetter(pct, 35, 70);
  return {
    key: "debt_payment_ratio",
    group: "spending",
    group_label: GROUP_LABELS.spending,
    label: "Tỉ lệ thanh toán nợ",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: "< 35%",
    ideal_value: 35,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Tỉ lệ trả nợ thấp, anh/chị có dư địa tài chính tốt."
        : score >= 4
          ? "Nợ vẫn trong tầm kiểm soát, cần kế hoạch giảm dần."
          : "Tỉ lệ nợ trên thu nhập quá cao — cần tái cơ cấu nợ ngay.",
  };
}

function m_savingRate(i: FinancialHealthInputs): MetricScore {
  const surplus = i.monthly_income - i.monthly_expenses - i.monthly_debt_payment;
  const pct = Math.max(0, safeDiv(surplus, i.monthly_income) * 100);
  const score = scoreHigherIsBetter(pct, 10, 30);
  return {
    key: "saving_rate",
    group: "spending",
    group_label: GROUP_LABELS.spending,
    label: "Tỉ lệ tiết kiệm",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: "> 10%",
    ideal_value: 10,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Anh/chị đang tiết kiệm tốt — tiếp tục duy trì và đa dạng kênh đầu tư."
        : score >= 4
          ? "Tiết kiệm chưa đủ — áp dụng hệ thống 6 quỹ JARS để tự động giữ ≥ 10%."
          : "Tiết kiệm quá thấp hoặc âm — cần rà soát chi tiêu hàng tuần ngay.",
  };
}

function m_liquidityCoverage(i: FinancialHealthInputs): MetricScore {
  const monthlyPaymentBurden = i.monthly_expenses + i.monthly_debt_payment;
  const ratio = safeDiv(i.assets_liquid, monthlyPaymentBurden); // số tháng chi tiêu được trang trải
  // ideal > 1 (tức ≥ 1 tháng). Em quy đổi sang điểm:
  //   < 1: 0-4 critical
  //   1-3: 5-7 fair-good
  //   3-6: 8-9
  //   ≥6: 10
  let score: number;
  if (ratio >= 6) score = 10;
  else if (ratio >= 3) score = 8 + Math.round(((ratio - 3) / 3) * 2);
  else if (ratio >= 1) score = 5 + Math.round(((ratio - 1) / 2) * 3);
  else score = Math.round(ratio * 5);
  return {
    key: "liquidity_coverage",
    group: "liquidity",
    group_label: GROUP_LABELS.liquidity,
    label: "Thanh khoản / Thanh toán",
    value: Math.round(ratio * 100) / 100,
    unit: "tháng",
    ideal: "≥ 1 tháng",
    ideal_value: 1,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Quỹ dự phòng vững — anh/chị có thể yên tâm trước biến động."
        : score >= 4
          ? "Quỹ dự phòng chưa đủ — đặt mục tiêu ≥ 6 tháng chi tiêu."
          : "Quỹ dự phòng quá mỏng — 1 cú sốc nhỏ là khủng hoảng.",
  };
}

function m_liquidityToGrowth(i: FinancialHealthInputs): MetricScore {
  const denom = i.assets_growth + i.assets_cashflow;
  const pct = safeDiv(i.assets_liquid, denom) * 100;
  // Target 10%, tolerance 8%. Quá ít → đầu tư hết, không có dự phòng.
  // Quá nhiều → lãng phí cơ hội đầu tư.
  let score: number;
  if (denom === 0) {
    // Chưa có đầu tư — không tính được tỉ lệ này
    score = i.assets_liquid > 0 ? 5 : 0;
  } else {
    score = scoreCloseToTarget(pct, 10, 8);
  }
  return {
    key: "liquidity_to_growth",
    group: "liquidity",
    group_label: GROUP_LABELS.liquidity,
    label: "Thanh khoản / Đầu tư",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: "≈ 10%",
    ideal_value: 10,
    score,
    rating: classify(score),
    hint:
      denom === 0
        ? "Anh/chị chưa có khoản đầu tư nào — đây là rủi ro lạm phát ăn mòn tài sản."
        : score >= 7
          ? "Tỉ lệ thanh khoản / đầu tư cân bằng — duy trì là tốt."
          : pct < 10
            ? "Đầu tư quá nhiều, thanh khoản ít — có thể kẹt khi cần tiền gấp."
            : "Thanh khoản quá nhiều — cân nhắc tăng đầu tư để chống lạm phát.",
  };
}

function m_wealthAccumulation(i: FinancialHealthInputs): MetricScore {
  const age = refAge(i);
  const annualIncome = i.monthly_income * 12;
  const target = (age * annualIncome) / 10;
  const actual =
    i.assets_liquid + i.assets_growth + i.assets_cashflow + i.assets_consumption;
  const pct = safeDiv(actual, target) * 100;
  // 0% → 0, 50% → 4, 100% → 7, 200%+ → 10
  let score: number;
  if (target <= 0) {
    score = actual > 0 ? 8 : 0;
  } else if (pct >= 200) score = 10;
  else if (pct >= 100) score = 7 + Math.round(((pct - 100) / 100) * 3);
  else if (pct >= 50) score = 4 + Math.round(((pct - 50) / 50) * 3);
  else score = Math.round((pct / 50) * 4);
  return {
    key: "wealth_accumulation",
    group: "accumulation",
    group_label: GROUP_LABELS.accumulation,
    label: "Tỉ lệ tích luỹ tài sản",
    value: Math.round(pct),
    unit: "%",
    ideal: "≥ 100%",
    ideal_value: 100,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Tài sản tích lũy đạt hoặc vượt mục tiêu theo tuổi + thu nhập — rất tốt."
        : score >= 4
          ? "Tích lũy chậm hơn mục tiêu — đẩy mạnh tiết kiệm + đầu tư đều."
          : `Tài sản tích lũy thấp hơn nhiều so với mục tiêu (${Math.round(target / 1e6).toLocaleString("vi-VN")} triệu) — cần kế hoạch tăng tốc.`,
  };
}

function m_insuranceRatio(i: FinancialHealthInputs): MetricScore {
  const totalInsurance =
    i.insurance_health + i.insurance_life_husband + i.insurance_life_wife;
  const pct = safeDiv(totalInsurance, i.monthly_income) * 100;
  // Target 10%, tolerance 5%.
  const score = scoreCloseToTarget(pct, 10, 5);
  return {
    key: "insurance_ratio",
    group: "protection",
    group_label: GROUP_LABELS.protection,
    label: "Tỉ lệ chi cho bảo hiểm",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: "≈ 10%",
    ideal_value: 10,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Bảo hiểm cân đối tốt — đủ bảo vệ mà không lãng phí."
        : pct < 10
          ? "Bảo hiểm chưa đủ — cân nhắc bổ sung BH nhân thọ + sức khỏe."
          : "Phí bảo hiểm quá cao so với thu nhập — review để tối ưu.",
  };
}

function m_wealthYears(i: FinancialHealthInputs): MetricScore {
  const annualExpenses = i.monthly_expenses * 12;
  const annualPassive = i.monthly_passive_income * 12;
  const netExpense = annualExpenses - annualPassive;
  let years: number;
  let score: number;
  if (netExpense <= 0) {
    // Thu nhập thụ động đã bao trùm chi phí — vô hạn năm độc lập tài chính
    years = 99;
    score = 10;
  } else {
    years = safeDiv(i.assets_liquid, netExpense);
    // < 1 năm → 0-5 (critical-fair). 1-3 năm → 6-8. ≥ 5 năm → 10.
    if (years >= 5) score = 10;
    else if (years >= 3) score = 8 + Math.round(((years - 3) / 2) * 2);
    else if (years >= 1) score = 5 + Math.round(((years - 1) / 2) * 3);
    else score = Math.round(years * 5);
  }
  return {
    key: "wealth_years",
    group: "protection",
    group_label: GROUP_LABELS.protection,
    label: "Mức độ giàu có (số năm độc lập)",
    value: years === 99 ? 99 : Math.round(years * 10) / 10,
    unit: "năm",
    ideal: "> 1 năm",
    ideal_value: 1,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? years === 99
          ? "Thu nhập thụ động đã trang trải đủ chi phí — anh/chị đã đạt tự do tài chính ở mức cơ bản."
          : "Tài sản thanh khoản đủ để duy trì lối sống nhiều năm — vị thế rất an toàn."
        : score >= 4
          ? "Có thể duy trì lối sống ≥ 1 năm nếu mất thu nhập — đang tiến gần độc lập."
          : "Nếu mất thu nhập, gia đình sẽ khó duy trì lâu — cần tăng quỹ dự phòng + đầu tư dòng tiền.",
  };
}

function m_allocLiquid(i: FinancialHealthInputs, total: number): MetricScore {
  const pct = safeDiv(i.assets_liquid, total) * 100;
  const score = scoreCloseToTarget(pct, 20, 12);
  return {
    key: "alloc_liquid",
    group: "allocation",
    group_label: GROUP_LABELS.allocation,
    label: "Tài sản thanh khoản",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: "≈ 20%",
    ideal_value: 20,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Tỉ lệ thanh khoản hợp lý — đủ linh hoạt khi cần."
        : pct < 20
          ? "Thanh khoản hơi thấp — cân nhắc giữ thêm tiền mặt + sổ tiết kiệm."
          : "Thanh khoản quá cao — đang bỏ lỡ cơ hội đầu tư.",
  };
}

function m_allocConsumption(i: FinancialHealthInputs, total: number): MetricScore {
  const age = refAge(i);
  const targetMax = age >= 45 ? 20 : 10;
  const pct = safeDiv(i.assets_consumption, total) * 100;
  // Càng thấp càng tốt. Trên target là vượt ngưỡng.
  const score = scoreLowerIsBetter(pct, targetMax, targetMax * 4);
  return {
    key: "alloc_consumption",
    group: "allocation",
    group_label: GROUP_LABELS.allocation,
    label: "Tài sản tiêu sản (nhà ở, xe)",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: age >= 45 ? "< 20%" : "< 10%",
    ideal_value: targetMax,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Tiêu sản chiếm tỉ lệ thấp — không bị 'kẹt' tiền vào đồ không sinh lời."
        : pct > targetMax
          ? `Tiêu sản chiếm hơi nhiều (mục tiêu ${age >= 45 ? "< 20%" : "< 10%"}) — cân nhắc cấu trúc lại danh mục.`
          : "Tỉ lệ tiêu sản ổn, có thể tăng tài sản tăng trưởng / dòng tiền.",
  };
}

function m_allocGrowth(i: FinancialHealthInputs, total: number): MetricScore {
  const age = refAge(i);
  const targetMin = age >= 45 ? 10 : 50;
  const pct = safeDiv(i.assets_growth, total) * 100;
  // Càng cao càng tốt (nhưng có cap)
  const score = scoreHigherIsBetter(pct, targetMin, age >= 45 ? 30 : 70);
  return {
    key: "alloc_growth",
    group: "allocation",
    group_label: GROUP_LABELS.allocation,
    label: "Tài sản tăng trưởng",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: age >= 45 ? "≥ 10%" : "≥ 50%",
    ideal_value: targetMin,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Tài sản tăng trưởng phù hợp tuổi — đang tận dụng lãi kép."
        : pct < targetMin
          ? `Tăng trưởng hơi ít (mục tiêu ${age >= 45 ? "≥ 10%" : "≥ 50%"}) — bổ sung cổ phiếu, chứng chỉ quỹ.`
          : "Cân nhắc giảm bớt tăng trưởng để tăng dòng tiền.",
  };
}

function m_allocCashflow(i: FinancialHealthInputs, total: number): MetricScore {
  const age = refAge(i);
  const targetMin = age >= 45 ? 50 : 20;
  const pct = safeDiv(i.assets_cashflow, total) * 100;
  const score = scoreHigherIsBetter(pct, targetMin, age >= 45 ? 80 : 50);
  return {
    key: "alloc_cashflow",
    group: "allocation",
    group_label: GROUP_LABELS.allocation,
    label: "Tài sản dòng tiền",
    value: Math.round(pct * 10) / 10,
    unit: "%",
    ideal: age >= 45 ? "≥ 50%" : "≥ 20%",
    ideal_value: targetMin,
    score,
    rating: classify(score),
    hint:
      score >= 7
        ? "Tài sản dòng tiền tốt — tạo thu nhập thụ động bền vững."
        : pct < targetMin
          ? `Dòng tiền chưa đủ (mục tiêu ${age >= 45 ? "≥ 50%" : "≥ 20%"}) — cân nhắc BĐS cho thuê, cổ tức.`
          : "Tỉ lệ dòng tiền tốt — duy trì.",
  };
}

/* ───────────────────────── public API ───────────────────────── */

/** Sanitize input numbers — non-negative, finite. */
function sanitize(raw: Partial<FinancialHealthInputs>): FinancialHealthInputs {
  const num = (v: unknown): number => {
    const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
    return Number.isFinite(n) && n >= 0 && n < 1e15 ? n : 0;
  };
  return {
    age_husband: num(raw.age_husband),
    age_wife: num(raw.age_wife),
    age_child1: num(raw.age_child1),
    age_child2: num(raw.age_child2),
    age_child3: num(raw.age_child3),
    monthly_income: num(raw.monthly_income),
    monthly_expenses: num(raw.monthly_expenses),
    monthly_passive_income: num(raw.monthly_passive_income),
    monthly_debt_payment: num(raw.monthly_debt_payment),
    assets_liquid: num(raw.assets_liquid),
    assets_growth: num(raw.assets_growth),
    assets_cashflow: num(raw.assets_cashflow),
    assets_consumption: num(raw.assets_consumption),
    debt_credit_card: num(raw.debt_credit_card),
    debt_installment: num(raw.debt_installment),
    debt_car: num(raw.debt_car),
    debt_house: num(raw.debt_house),
    debt_business: num(raw.debt_business),
    insurance_health: num(raw.insurance_health),
    insurance_life_husband: num(raw.insurance_life_husband),
    insurance_life_wife: num(raw.insurance_life_wife),
  };
}

export function computeFinancialHealth(
  rawInputs: Partial<FinancialHealthInputs>
): FinancialHealthResult {
  const i = sanitize(rawInputs);
  const totalAssets =
    i.assets_liquid + i.assets_growth + i.assets_cashflow + i.assets_consumption;

  const metrics: MetricScore[] = [
    m_debtPaymentRatio(i),
    m_savingRate(i),
    m_liquidityCoverage(i),
    m_liquidityToGrowth(i),
    m_wealthAccumulation(i),
    m_insuranceRatio(i),
    m_wealthYears(i),
    m_allocLiquid(i, totalAssets),
    m_allocConsumption(i, totalAssets),
    m_allocGrowth(i, totalAssets),
    m_allocCashflow(i, totalAssets),
  ];

  // Aggregate into groups
  const groupKeys: GroupKey[] = ["spending", "liquidity", "accumulation", "protection", "allocation"];
  const groups: GroupScore[] = groupKeys.map((k) => {
    const ms = metrics.filter((m) => m.group === k);
    const sum = ms.reduce((s, m) => s + m.score, 0);
    const max = ms.length * 10;
    const pct = max > 0 ? Math.round((sum / max) * 100) : 0;
    return {
      key: k,
      label: GROUP_LABELS[k],
      metrics: ms,
      score: sum,
      max_score: max,
      pct,
      rating: pct >= 70 ? "good" : pct >= 40 ? "fair" : "critical",
    };
  });

  // Total = sum of metrics out of 110 → scale to 100.
  const sumRaw = metrics.reduce((s, m) => s + m.score, 0);
  const total = Math.round((sumRaw * 100) / (metrics.length * 10));
  const rating = overallRating(total);

  const summary =
    rating === "good"
      ? "Sức khoẻ tài chính của gia đình anh/chị đang ở mức TỐT 💪"
      : rating === "fair"
        ? "Sức khoẻ tài chính TRUNG BÌNH — còn dư địa cải thiện rõ rệt 🔧"
        : "Sức khoẻ tài chính CẦN CHÚ Ý — cần kế hoạch hành động sớm ⚠️";

  return {
    metrics,
    groups,
    total_score: total,
    rating,
    summary,
    inputs: i,
  };
}

/** Format VND nicely ("1.234.000 ₫"). */
export function formatVND(n: number): string {
  if (!Number.isFinite(n)) return "0 ₫";
  return Math.round(n).toLocaleString("vi-VN") + " ₫";
}
