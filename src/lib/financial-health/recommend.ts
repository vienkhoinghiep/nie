/**
 * Upsell recommender for the Financial Health quiz (v2 — 11 metrics).
 *
 * Given a quiz result, picks the 1-2 weakest metrics and crafts
 * personalised copy that recommends Gói Hướng Dẫn (498.526đ — refundable
 * 100% on completion). Used by both the email template and the public
 * /results/<token> page.
 */

import type { FinancialHealthResult, MetricScore } from "./score";

// Khoá mới Founder Money Reset™ — slug riêng cho landing/payment page.
const PACKAGE_SLUG = "founder-money-reset-hoach-dinh-tai-chinh-ca-nhan-cho-founder";
const PACKAGE_NAME = "Founder Money Reset™";
const PACKAGE_PRICE_VND = 498526;

export interface QuizRecommendation {
  /** Headline shown above the recommendation block. */
  headline: string;
  /** 1-2 paragraph body explaining the diagnosis + how the course solves it. */
  body: string;
  /** Ordered list of bullets — the specific weak metrics framed as
   * problems the course addresses. */
  weakness_bullets: string[];
  /** The 2 weakest metrics, lowest first. */
  weakest_metrics: MetricScore[];
  /** Urgency level — drives copy tone + color. */
  urgency: "high" | "medium" | "low";
  /** Final CTA microcopy for the button. */
  cta_label: string;
  /** Where the CTA points to. */
  cta_url: string;
  /** Price + guarantee hint. */
  price_hint: string;
  /** Optional extra copy: only filled when the user's score is already
   * good — we still suggest the package to maintain the gains. */
  good_state_note?: string;
  /** Constant fields used by both email + results page. */
  package_name: string;
  package_price_vnd: number;
}

/** Map metric key → problem framing tailored for the sales pitch.
 *  Covers all 11 metrics in the v2 engine. */
const METRIC_PROBLEM_FRAMING: Record<
  MetricScore["key"],
  { problem: string; promise: string }
> = {
  debt_payment_ratio: {
    problem:
      "Tỉ lệ thanh toán nợ đang cao — gánh nặng lãi suất ăn mòn tài chính hàng tháng",
    promise:
      "Chiến lược 'tuyết lăn' giảm dần nợ + tái cơ cấu lãi vay — nhiều học viên giảm 30% nợ trong 6 tháng",
  },
  saving_rate: {
    problem: "Tiết kiệm chưa đủ — tiền vào bao nhiêu cũng ra hết",
    promise:
      "Hệ thống 6 quỹ JARS giúp anh/chị tự động giữ lại ≥ 10–20% mỗi tháng — không cần ý chí thép",
  },
  liquidity_coverage: {
    problem: "Quỹ dự phòng quá mỏng — 1 cú sốc nhỏ là khủng hoảng",
    promise:
      "Hướng dẫn xây quỹ dự phòng 3–6 tháng chi tiêu trong 90 ngày, không cần thắt lưng buộc bụng",
  },
  liquidity_to_growth: {
    problem:
      "Tỉ lệ thanh khoản / đầu tư chưa cân — hoặc bỏ tất trứng vào đầu tư, hoặc ôm tiền mặt quá nhiều",
    promise:
      "Khung cân đối thanh khoản 10% / đầu tư 90% giúp anh/chị vừa linh hoạt vừa tận dụng lãi kép",
  },
  wealth_accumulation: {
    problem:
      "Tài sản tích lũy thấp hơn mục tiêu theo tuổi — đang chậm so với lộ trình",
    promise:
      "Bảng cân đối tài sản cá nhân chuẩn + lộ trình tăng net worth gấp 2 trong 24 tháng",
  },
  insurance_ratio: {
    problem:
      "Bảo hiểm chưa cân đối — đang thiếu bảo vệ hoặc đang lãng phí phí bảo hiểm",
    promise:
      "Khung 'BH thông minh' giúp anh/chị chọn đúng gói, đúng mức phí 5–15% thu nhập",
  },
  wealth_years: {
    problem:
      "Mức độ giàu có thấp — nếu mất thu nhập, gia đình khó duy trì được lâu",
    promise:
      "Lộ trình xây tài sản dòng tiền + quỹ dự phòng giúp anh/chị đủ sức chống chịu ≥ 12 tháng",
  },
  alloc_liquid: {
    problem:
      "Tỉ lệ tài sản thanh khoản chưa hợp lý theo độ tuổi (mục tiêu ≈ 20%)",
    promise:
      "Khung cấu trúc tài sản theo tuổi giúp anh/chị giữ đúng tỉ trọng tiền mặt — không thừa, không thiếu",
  },
  alloc_consumption: {
    problem:
      "Tài sản tiêu sản (nhà ở, xe) chiếm tỉ lệ quá cao — tiền bị 'đóng băng' không sinh lời",
    promise:
      "Hướng dẫn tái cấu trúc danh mục: chuyển dần tiêu sản → tài sản sinh dòng tiền",
  },
  alloc_growth: {
    problem:
      "Tài sản tăng trưởng còn ít — chỉ tiết kiệm sẽ thua lạm phát 5–10%/năm",
    promise:
      "Lộ trình DCA + tháp tài sản 3 lớp giúp anh/chị bắt đầu đầu tư an toàn từ 1–2 triệu/tháng",
  },
  alloc_cashflow: {
    problem:
      "Tài sản dòng tiền thấp — chưa có nguồn thu thụ động bền vững",
    promise:
      "Khung xây dòng tiền thụ động từ BĐS, cổ tức, doanh nghiệp — mục tiêu 20–50% danh mục",
  },
};

/**
 * Pick 2 weakest metrics + craft personalised upsell.
 * Pure function — no I/O, safe for client + server + email render.
 */
export function buildRecommendation(
  result: FinancialHealthResult,
  baseUrl: string
): QuizRecommendation {
  // Sort metrics by score asc → weakest first.
  const sorted = [...result.metrics].sort((a, b) => a.score - b.score);
  const weakest = sorted.slice(0, 2);

  const urgency =
    result.rating === "critical"
      ? "high"
      : result.rating === "fair"
        ? "medium"
        : "low";

  const headline =
    urgency === "high"
      ? "⚠️ Tài chính của anh/chị đang trong vùng RỦI RO"
      : urgency === "medium"
        ? `Anh/chị đang yếu nhất ở ${weakest.length === 1 ? "trụ cột" : "2 trụ cột"} này`
        : "Anh/chị đang ổn — đây là cách để CỦNG CỐ + nâng tầm";

  const weakness_bullets = weakest.map((m) => {
    const f = METRIC_PROBLEM_FRAMING[m.key];
    return `${f.problem} → <strong>${f.promise}</strong>.`;
  });

  const body =
    urgency === "high"
      ? `Với điểm tổng <strong>${result.total_score}/100</strong>, anh/chị cần một lộ trình thực chiến để giải quyết tận gốc. <strong>${PACKAGE_NAME}</strong> — khoá 7 ngày giúp founder tách bạch tiền cá nhân & tiền kinh doanh, tính <em>Founder Survival Number</em> và lập kế hoạch tài chính 30 ngày. Anh/chị đặt cọc <strong>${PACKAGE_PRICE_VND.toLocaleString("vi-VN")}đ</strong> và <strong>được hoàn lại 100%</strong> khi hoàn thành bài tập — nghĩa là rủi ro = 0.`
      : urgency === "medium"
        ? `Điểm <strong>${result.total_score}/100</strong> cho thấy anh/chị đã có nền tảng nhưng tài chính cá nhân vẫn chưa đủ rõ để ra quyết định kinh doanh. <strong>${PACKAGE_NAME}</strong> (đặt cọc <strong>${PACKAGE_PRICE_VND.toLocaleString("vi-VN")}đ</strong> — hoàn lại 100% khi hoàn thành bài tập) tập trung đúng vào những trụ cột yếu của anh/chị: dòng tiền cá nhân, quỹ sống sót, kế hoạch 30 ngày.`
        : `Điểm <strong>${result.total_score}/100</strong> rất tốt — anh/chị thuộc top 20% về sức khoẻ tài chính. Để duy trì + tối ưu thêm cho hành trình khởi nghiệp, <strong>${PACKAGE_NAME}</strong> (${PACKAGE_PRICE_VND.toLocaleString("vi-VN")}đ — hoàn lại 100% khi hoàn thành) giúp anh/chị có khung kỷ luật tài chính bài bản hơn.`;

  const good_state_note =
    urgency === "low"
      ? "Đây không phải là 'cứu hộ' — đây là khoá <em>nâng cấp</em> để anh/chị duy trì điểm cao này 5-10 năm tới."
      : undefined;

  const cta_label =
    urgency === "high"
      ? "🛡 Bắt đầu Money Reset — Hoàn Tiền 100%"
      : urgency === "medium"
        ? "💎 Money Reset — Hoàn Tiền 100%"
        : "✨ Củng cố kỷ luật tài chính — Hoàn Tiền 100%";

  const price_hint = `Chỉ ${PACKAGE_PRICE_VND.toLocaleString(
    "vi-VN"
  )}đ • Hoàn lại 100% khi hoàn thành bài tập`;

  return {
    headline,
    body,
    weakness_bullets,
    weakest_metrics: weakest,
    urgency,
    cta_label,
    cta_url: `${baseUrl}/courses/${PACKAGE_SLUG}`,
    price_hint,
    good_state_note,
    package_name: PACKAGE_NAME,
    package_price_vnd: PACKAGE_PRICE_VND,
  };
}
