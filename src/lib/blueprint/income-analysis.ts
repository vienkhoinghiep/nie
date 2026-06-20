/**
 * Income Analysis — Phân tích thực trạng thu nhập của học viên.
 *
 * Nhận `CashflowIncome` (schema mới 3 nhóm) và trả về:
 *  - Tổng + tỷ trọng 3 nhóm (Lương / Kinh doanh / Thụ động)
 *  - Chấm 5 tiêu chí × 2 điểm = 10 điểm tối đa
 *  - Tier label + màu + emoji
 *  - 3 đoạn feedback: Praise / Warning / Advice
 *  - Kết luận
 *
 * Dùng cho cả UI input (preview) lẫn báo cáo Premium chi tiết.
 */

import type { CashflowIncome } from "./types";

export interface IncomeCriterion {
  label: string;
  score: 0 | 1 | 2;
  reason: string;
}

export interface IncomeAnalysisResult {
  // Totals
  totalSalary: number;
  totalBusiness: number;
  totalPassive: number;
  otherIncome: number;
  total: number;
  // Percentages
  salaryPct: number;
  businessPct: number;
  passivePct: number;
  otherPct: number;
  // Score
  score: number; // 0-10
  criteria: IncomeCriterion[];
  // Tier
  tierLabel: string;
  tierColor: string;
  tierEmoji: string;
  // Feedback
  praise: string;
  warning: string;
  advice: string;
  conclusion: string;
}

const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";

export function computeIncomeAnalysis(
  inc: CashflowIncome | undefined
): IncomeAnalysisResult {
  const income = inc ?? {};

  // ─── TỔNG THEO NHÓM ───
  // LƯƠNG = lương cứng (hoặc legacy `personal`) + thưởng + lương vợ/chồng
  const salaryBase = income.salaryBase ?? income.personal ?? 0;
  const salary =
    salaryBase + (income.salaryBonus ?? 0) + (income.spouse ?? 0);

  // KINH DOANH = lợi nhuận ròng
  const business = income.businessProfit ?? 0;

  // THỤ ĐỘNG = rental + investment + royalty (fallback legacy `passive`)
  const newPassiveSum =
    (income.passiveRental ?? 0) +
    (income.passiveInvestment ?? 0) +
    (income.passiveRoyalty ?? 0);
  const passive =
    newPassiveSum > 0 ? newPassiveSum : income.passive ?? 0;

  const other = income.other ?? 0;
  const total = salary + business + passive + other;

  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);
  const salaryPct = pct(salary);
  const businessPct = pct(business);
  const passivePct = pct(passive);
  const otherPct = pct(other);

  // ─── CHẤM 5 TIÊU CHÍ (× 2 = 10 điểm) ───
  const criteria: IncomeCriterion[] = [];

  // 1. Thu nhập ổn định từ lương
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa có thu nhập từ lương";
    if (salary > 0) {
      if (income.salaryStability === "high") {
        s = 2;
        reason = "Lương đều, công việc rất ổn định";
      } else if (income.salaryStability === "medium") {
        s = 1;
        reason = "Lương có nhưng độ ổn định trung bình";
      } else if (income.salaryStability === "low") {
        s = 1;
        reason = "Lương biến động, cần dự phòng";
      } else {
        s = 1;
        reason = "Có lương nhưng chưa đánh giá độ ổn định";
      }
    }
    criteria.push({ label: "Thu nhập ổn định từ lương", score: s, reason });
  }

  // 2. Có thu nhập từ kinh doanh
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa có thu nhập kinh doanh";
    if (business > 0) {
      if (income.businessCashflowConsistent === "yes") {
        s = 2;
        reason = "Có lợi nhuận ròng + dòng tiền đều";
      } else {
        s = 1;
        reason = "Có lợi nhuận nhưng dòng tiền chưa đều";
      }
    }
    criteria.push({ label: "Thu nhập từ kinh doanh", score: s, reason });
  }

  // 3. Có thu nhập thụ động
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa có thu nhập thụ động";
    if (passive > 0) {
      if (income.passiveSustainability === "high") {
        s = 2;
        reason = "Thụ động bền vững, ít rủi ro";
      } else if (income.passiveSustainability === "medium") {
        s = 1;
        reason = "Thụ động vừa phải, cần theo dõi";
      } else {
        s = 1;
        reason = "Thụ động còn rủi ro hoặc chưa đánh giá";
      }
    }
    criteria.push({ label: "Thu nhập thụ động", score: s, reason });
  }

  // 4. Đa dạng nguồn thu
  {
    const sources = [
      salary > 0,
      business > 0,
      passive > 0,
      other > 0,
    ].filter(Boolean).length;
    let s: 0 | 1 | 2 = 0;
    let reason = "Phụ thuộc 1 nguồn duy nhất";
    if (sources >= 3) {
      s = 2;
      reason = `${sources} nguồn thu — đa dạng tốt`;
    } else if (sources === 2) {
      s = 1;
      reason = "2 nguồn thu — đang đa dạng hóa";
    }
    criteria.push({ label: "Đa dạng nguồn thu", score: s, reason });
  }

  // 5. Dòng tiền bền vững
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa đánh giá được tính bền vững";
    const salaryGood =
      income.salaryStability === "high" ||
      (income.salaryGrowth && income.salaryGrowth !== "none");
    const businessGood =
      income.businessCashflowConsistent === "yes" &&
      income.businessDependsOnYou !== "fully";
    const passiveGood = income.passiveSustainability === "high";

    const goodCount = [salaryGood, businessGood, passiveGood].filter(
      Boolean
    ).length;
    if (goodCount >= 2) {
      s = 2;
      reason = "Nhiều nguồn bền vững, có khả năng tăng";
    } else if (goodCount === 1) {
      s = 1;
      reason = "Có 1 nguồn bền vững, cần củng cố thêm";
    } else if (total > 0) {
      reason = "Dòng tiền chưa bền vững, dễ biến động";
    }
    criteria.push({ label: "Dòng tiền bền vững", score: s, reason });
  }

  const score = criteria.reduce((sum, c) => sum + c.score, 0);

  // ─── TIER ───
  let tierLabel: string;
  let tierColor: string;
  let tierEmoji: string;
  if (score >= 9) {
    tierLabel = "Xuất sắc · nền tảng tự do tài chính";
    tierColor = GREEN;
    tierEmoji = "🏆";
  } else if (score >= 7) {
    tierLabel = "Tốt · nhiều dòng tiền";
    tierColor = GREEN;
    tierEmoji = "💎";
  } else if (score >= 4) {
    tierLabel = "Có nền tảng · cần đa dạng hóa";
    tierColor = AMBER;
    tierEmoji = "⚡";
  } else {
    tierLabel = "Còn yếu · phụ thuộc cao";
    tierColor = RED;
    tierEmoji = "⚠️";
  }

  // ─── FEEDBACK ───
  const praise = buildPraise(salary, business, passive);
  const warning = buildWarning(
    salaryPct,
    businessPct,
    passivePct,
    income.businessDependsOnYou,
    income.businessCashflowConsistent
  );
  const advice = buildAdvice(passivePct, businessPct);
  const conclusion = buildConclusion(score, salaryPct, passivePct);

  return {
    totalSalary: salary,
    totalBusiness: business,
    totalPassive: passive,
    otherIncome: other,
    total,
    salaryPct,
    businessPct,
    passivePct,
    otherPct,
    score,
    criteria,
    tierLabel,
    tierColor,
    tierEmoji,
    praise,
    warning,
    advice,
    conclusion,
  };
}

function buildPraise(
  salary: number,
  business: number,
  passive: number
): string {
  const sources = [salary > 0, business > 0, passive > 0].filter(
    Boolean
  ).length;
  if (sources >= 3) {
    return "Bạn đã có ý thức nhìn thu nhập theo nhiều nguồn khác nhau, không chỉ dựa vào lương. Đây là tư duy tài chính rất quan trọng — người có nền tảng tài chính vững thường không chỉ có một dòng tiền duy nhất.";
  }
  if (sources === 2) {
    return "Bạn đã có 2 nguồn thu khác nhau — tư duy tài chính đang đi đúng hướng. Tiếp tục mở rộng thêm dòng tiền thứ ba (thụ động) để giảm phụ thuộc.";
  }
  return "Bạn đã có ý thức nhập đầy đủ thông tin thu nhập — bước đầu rất quan trọng để biết mình đang ở đâu. Tập trung xây thêm dòng tiền thứ hai trong 6-12 tháng.";
}

function buildWarning(
  salaryPct: number,
  businessPct: number,
  passivePct: number,
  bizDepend: string | undefined,
  bizCashflow: string | undefined
): string {
  const warnings: string[] = [];
  if (salaryPct >= 70) {
    warnings.push(
      "Phần lớn thu nhập (≥ 70%) đến từ lương — mức độ an toàn tài chính chưa cao. Mất việc, giảm lương hoặc sức khỏe ảnh hưởng → dòng tiền có thể bị đứt"
    );
  }
  if (businessPct >= 30 && bizDepend === "fully") {
    warnings.push(
      "Kinh doanh phụ thuộc hoàn toàn vào bạn — nếu nghỉ vài tuần là doanh thu giảm. Cần bắt đầu xây hệ thống và uỷ quyền"
    );
  }
  if (businessPct >= 30 && bizCashflow === "no") {
    warnings.push(
      "Kinh doanh có doanh thu nhưng dòng tiền không đều — rủi ro chi phí cố định vẫn phải trả khi tháng thấp"
    );
  }
  if (passivePct < 10 && passivePct > 0) {
    warnings.push(
      `Thu nhập thụ động chỉ ${passivePct}% — chưa có nền tảng tự do tài chính rõ ràng`
    );
  }
  if (warnings.length === 0) {
    return "Cấu trúc thu nhập của bạn ở mức ổn — không có cảnh báo lớn. Vẫn nên duy trì kỷ luật theo dõi hàng tháng để phát hiện rủi ro sớm.";
  }
  return warnings.join(". ") + ".";
}

function buildAdvice(passivePct: number, businessPct: number): string {
  const tips: string[] = [];
  tips.push(
    "Giữ vững nguồn thu chính từ lương hoặc công việc ổn định để đảm bảo dòng tiền nền tảng"
  );
  if (businessPct > 0) {
    tips.push(
      "Chuẩn hóa kinh doanh — theo dõi doanh thu · chi phí · lợi nhuận ròng · dòng tiền hằng tháng, tách bạch tiền cá nhân"
    );
  } else {
    tips.push(
      "Cân nhắc xây 1 hoạt động kinh doanh phụ tận dụng kỹ năng sẵn có"
    );
  }
  if (passivePct < 20) {
    tips.push(
      "Chuyển dần 1 phần thu nhập chủ động sang tài sản tạo thu nhập thụ động — quỹ đầu tư · cổ tức · BĐS cho thuê · sản phẩm số"
    );
  } else {
    tips.push(
      "Mở rộng + đa dạng thêm tài sản thụ động (đầu tư + cho thuê + bản quyền) — kiểm soát rủi ro tập trung"
    );
  }
  return tips.map((t, i) => `${i + 1}. ${t}`).join(". ") + ".";
}

function buildConclusion(
  score: number,
  salaryPct: number,
  passivePct: number
): string {
  if (score >= 9) {
    return "Thu nhập của bạn ở mức xuất sắc — đa dạng, bền vững, ít phụ thuộc. Bước tiếp theo: tối ưu thuế · bảo hiểm danh mục · đầu tư bài bản để nâng tốc độ tích lũy.";
  }
  if (score >= 7) {
    return "Tình hình thu nhập tốt — đã có nhiều dòng tiền và độ ổn định khá. Trong 12 tháng tới: tăng tỷ trọng thu nhập thụ động lên ≥ 30% và tối ưu chi phí kinh doanh để gia tốc.";
  }
  if (score >= 4) {
    return `Thu nhập đang ở giai đoạn cần được hệ thống hóa. Điểm mạnh: bạn đã có nguồn tiền vào. Mục tiêu không chỉ là kiếm nhiều hơn, mà là làm cho thu nhập ổn định hơn, đa dạng hơn (hiện ${salaryPct}% lương + ${passivePct}% thụ động) và ít phụ thuộc vào công sức trực tiếp hơn. Trong 6-12 tháng tới: tập trung tăng thu nhập chủ động · kiểm soát lợi nhuận kinh doanh · từng bước xây tài sản thụ động.`;
  }
  return "Thu nhập còn yếu và phụ thuộc cao. Ưu tiên tuyệt đối: tăng năng lực kiếm tiền chủ động (kỹ năng, công việc, side income) trong 6 tháng tới, song song kiểm soát chi tiêu để tích luỹ vốn nhỏ ban đầu cho đầu tư.";
}
