/**
 * Bảng Câu Hỏi Về Niềm Tin — 72 nhận định.
 * Chấm 1-10:
 *   1 = 100% không đồng ý
 *   10 = 100% đồng ý
 *
 * Phần lớn nhận định là niềm tin TIÊU CỰC/hạn chế về tiền bạc.
 * Điểm càng cao → càng nhiều niềm tin giới hạn.
 */

export interface BeliefQuestion {
  id: number;
  text: string;
}

export const BELIEF_QUESTIONS: BeliefQuestion[] = [
  { id: 1, text: "Tiền bạc là nguồn gốc của mọi tội lỗi." },
  { id: 2, text: "Sống trong nghèo khổ giúp người ta được giải thoát hơn là sống trong giàu có." },
  {
    id: 3,
    text: "Chắc chắn hầu hết người giàu phải làm điều tồi tệ hay gian dối mới có thể kiếm được tiền.",
  },
  { id: 4, text: "Có nhiều tiền sẽ khiến tôi ít cao cả và ít trong sáng hơn." },
  { id: 5, text: "Muốn làm giàu phải làm việc và nỗ lực thật nhiều." },
  { id: 6, text: "Có nhiều tiền đồng nghĩa với trách nhiệm lớn." },
  { id: 7, text: "Tôi không cảm thấy thoải mái khi giàu có." },
  { id: 8, text: "Thực tế các cơ may là tôi không bao giờ trở nên giàu có." },
  { id: 9, text: "Giàu có là do may mắn hoặc số phận." },
  { id: 10, text: "Giàu có không dành cho những người như tôi." },
  {
    id: 11,
    text: "Phấn đấu làm giàu sẽ rút ngắn thời gian dành cho những điều khác trong cuộc sống.",
  },
  { id: 12, text: "Muốn giàu có bạn phải dùng người khác và lợi dụng họ." },
  { id: 13, text: "Nếu tôi giàu có, mọi người sẽ muốn điều gì đó từ tôi." },
  {
    id: 14,
    text: "Nếu tôi giàu có, sẽ có người nào đó trong cuộc sống của tôi không thích điều đó hoặc không thích tôi.",
  },
  { id: 15, text: "Tôi có nhiều tiền đồng nghĩa ai đó có ít tiền đi." },
  { id: 16, text: "Có thật nhiều tiền đồng nghĩa bạn là kẻ tham lam." },
  { id: 17, text: "Tôi không giỏi trong lĩnh vực tiền bạc và tài chính." },
  { id: 18, text: "Nếu tôi có nhiều tiền, tôi có thể mất nó." },
  {
    id: 19,
    text: "Nếu tôi thực sự phấn đấu làm giàu và không thành công, tôi sẽ cảm thấy đó là sự thất bại.",
  },
  { id: 20, text: "Tôi có tiềm năng trở nên giàu có, tất cả những gì tôi cần là cơ hội." },
  { id: 21, text: "Đây không phải là lúc thích hợp để bắt đầu làm giàu." },
  { id: 22, text: "Tôi thực sự không muốn giàu có." },
  { id: 23, text: "Tiền bạc thực sự không quan trọng." },
  {
    id: 24,
    text: "Bạn không thể phấn đấu làm giàu và có được hạnh phúc, sự viên mãn cùng một lúc.",
  },
  { id: 25, text: "Sẽ là không đúng nếu tôi kiếm tiền nhiều hơn cha mẹ tôi." },
  { id: 26, text: "Tiền bạc có thể gây ra nhiều rắc rối." },
  { id: 27, text: "Bạn không thể giàu có trong khi làm những gì bạn yêu thích." },
  { id: 28, text: "Cố gắng kiếm tiền là một điều phức tạp và là một cuộc đấu tranh." },
  { id: 29, text: "Muốn kiếm được tiền phải tốn tiền." },
  { id: 30, text: "Mọi người chỉ nên kiếm tiền vừa đủ để sống thoải mái." },
  { id: 31, text: "Nỗ lực làm giàu có thể gây ra trầm cảm và các vấn đề về sức khỏe." },
  { id: 32, text: "Làm giàu thật khó trong thời buổi này." },
  { id: 33, text: "Hầu hết các cơ hội tốt đều đã qua rồi." },
  { id: 34, text: "Căn cứ vào quá khứ của tôi, thật khó để tôi trở nên giàu có." },
  { id: 35, text: "Tôi không đủ thông minh hay nhanh nhạy để làm giàu." },
  { id: 36, text: "Tôi không được giáo dục đầy đủ để làm giàu." },
  { id: 37, text: "Tôi quá trẻ để làm giàu." },
  { id: 38, text: "Tôi quá già để làm giàu." },
  { id: 39, text: "Là một phụ nữ, làm giàu càng khó hơn." },
  { id: 40, text: "Tôi không thích bán hàng hay hoạt động tiếp thị." },
  { id: 41, text: "Tôi ước không phải giải quyết các vấn đề tiền bạc." },
  { id: 42, text: "Tôi không thích quản lý tiền bạc." },
  { id: 43, text: "Tôi không có thời gian để quản lý tiền bạc." },
  { id: 44, text: "Tôi không cần quản lý tiền bạc vì tôi không có nhiều tiền." },
  { id: 45, text: "Tiền bạc làm suy giảm tính nghệ thuật và đam mê sáng tạo." },
  {
    id: 46,
    text: "Thật không đúng khi tôi giàu có trong khi những người khác không có gì cả.",
  },
  { id: 47, text: "An toàn tài chính đến từ công việc tốt và chi trả đều đặn." },
  {
    id: 48,
    text: "Nếu bạn sinh ra không giàu có, bạn sẽ không bao giờ có được cơ hội giàu có.",
  },
  { id: 49, text: "Người giàu không hạnh phúc." },
  { id: 50, text: "Nếu thành công đến dễ dàng, nó sẽ không còn giá trị." },
  { id: 51, text: "Tôi quá bận rộn để dành thời gian và năng lượng cho việc học tập." },
  { id: 52, text: "Nếu tôi giàu có, thật tuyệt; nếu không cũng chẳng sao." },
  { id: 53, text: "Tôi không thích gánh trách nhiệm." },
  { id: 54, text: "Tôi không phải là một chỉ huy mạnh mẽ." },
  { id: 55, text: "Tôi ác cảm với những người siêu giàu." },
  { id: 56, text: "Tôi là người cho đi tốt, nhưng không phải là người biết nhận lại tốt." },
  { id: 57, text: "Quan điểm của người khác về tôi rất quan trọng." },
  {
    id: 58,
    text: "Nhận lương theo thời gian tôi bỏ ra tốt hơn là nhận lương cho kết quả tôi đã làm.",
  },
  { id: 59, text: "Tôi cảm thấy khá thoải mái. Tôi không cần thúc đẩy bản thân nữa." },
  { id: 60, text: "Nếu bạn giàu tình yêu, sức khỏe và hạnh phúc, bạn sẽ không cần tiền." },
  {
    id: 61,
    text: "Nếu tôi có thể tự xoay sở, tôi sẽ không cần sự giúp đỡ từ người khác.",
  },
  { id: 62, text: "Nếu tôi yêu cầu được giúp đỡ, người khác sẽ nghĩ tôi kém cỏi." },
  { id: 63, text: "Lý do duy nhất tôi làm việc là để kiếm tiền." },
  { id: 64, text: "Tôi không cần phải kiếm nhiều tiền vì tôi sẽ phải đóng thuế nhiều hơn." },
  { id: 65, text: "Một khi có nhiều tiền tôi mới cảm thấy an toàn." },
  { id: 66, text: "Bằng cách giàu có tôi sẽ chứng minh bản thân mình." },
  { id: 67, text: "Làm giàu không thực sự là một kỹ năng bạn có thể học." },
  { id: 68, text: "Tôi không \"đồng nghĩa\" với giàu có." },
  { id: 69, text: "Chúa sẽ quyết định tôi giàu, nghèo hay trung lưu." },
  { id: 70, text: "Lĩnh vực đầu tư thực sự phức tạp và khó hiểu." },
  { id: 71, text: "Đầu tư dành cho những người có nhiều tiền." },
  { id: 72, text: "Hầu hết cuộc đầu tư, ngoại trừ gửi tiết kiệm, là quá mạo hiểm." },
];

/** Tổng điểm niềm tin = sum(answer 1-10 of each question). Max = 720 */
export function scoreBeliefs(answers: Record<number, number>): number {
  return BELIEF_QUESTIONS.reduce<number>(
    (sum, q) => sum + (answers[q.id] ?? 0),
    0
  );
}

/* ─────────────────────────────────────────────
 *  Phân tích chi tiết theo khung báo cáo
 * ───────────────────────────────────────────── */

/** Số câu đã trả lời */
export function beliefsAnsweredCount(
  answers: Record<number, number>
): number {
  return BELIEF_QUESTIONS.filter((q) => answers[q.id] !== undefined).length;
}

/** Điểm trung bình mỗi câu (1-10 scale) — dùng cho diễn giải */
export function beliefsAverage(
  answers: Record<number, number>
): number {
  const total = scoreBeliefs(answers);
  return Math.round((total / BELIEF_QUESTIONS.length) * 100) / 100;
}

/** Số câu có điểm ≥ 7 — niềm tin giới hạn MẠNH cần ưu tiên tháo gỡ */
export function beliefsStrongCount(
  answers: Record<number, number>
): number {
  return BELIEF_QUESTIONS.filter((q) => (answers[q.id] ?? 0) >= 7).length;
}

/** Diễn giải theo điểm trung bình */
export function beliefsTier(avg: number): {
  tier: 1 | 2 | 3;
  label: string;
  desc: string;
} {
  if (avg <= 3.0)
    return {
      tier: 1,
      label: "Tư duy khá tự do",
      desc: "Ít rào cản niềm tin. Học viên cơ bản cởi mở với tiền và sự giàu có; tập trung vào kỹ năng và hành động.",
    };
  if (avg <= 6.0)
    return {
      tier: 2,
      label: "Có niềm tin giới hạn",
      desc: "Tồn tại một số niềm tin cần nhận diện và chuyển hóa. Ưu tiên xử lý các câu điểm ≥ 7.",
    };
  return {
    tier: 3,
    label: "Nhiều niềm tin giới hạn mạnh",
    desc: "Tư duy về tiền đang bị kìm hãm đáng kể. Đây là vùng cần làm việc sâu trong khóa học.",
  };
}

/** 5 nhóm chủ đề niềm tin */
export interface BeliefTheme {
  key: string;
  label: string;
  description: string;
  questions: number[];
  isLimiting: boolean; // true = niềm tin giới hạn, false = trung tính/tích cực
}

export const BELIEF_THEMES: BeliefTheme[] = [
  {
    key: "A",
    label: "A. Tiền / người giàu là xấu xa, tội lỗi",
    description:
      "Niềm tin rằng tiền và người giàu mang tính tiêu cực, đáng nghi ngờ.",
    questions: [1, 2, 3, 4, 12, 16, 24, 26, 49, 55],
    isLimiting: true,
  },
  {
    key: "B",
    label: "B. Tôi không xứng đáng / không thể giàu",
    description:
      "Niềm tin về sự kém cỏi cá nhân, thiếu may mắn, không có khả năng làm giàu.",
    questions: [7, 8, 9, 10, 17, 19, 21, 22, 23, 34, 35, 36, 37, 38, 39, 48, 67, 68, 69],
    isLimiting: true,
  },
  {
    key: "C",
    label: "C. Giàu có đòi hỏi đánh đổi, hy sinh",
    description:
      "Niềm tin rằng làm giàu cần hy sinh thời gian, sức khỏe, hạnh phúc, các mối quan hệ.",
    questions: [5, 6, 11, 13, 14, 15, 27, 28, 29, 31, 32, 33, 50, 60],
    isLimiting: true,
  },
  {
    key: "D",
    label: "D. Né tránh trách nhiệm / quản lý tiền",
    description:
      "Khuynh hướng né tránh học, quản lý, đầu tư tiền bạc — coi đó là chuyện phức tạp.",
    questions: [40, 41, 42, 43, 44, 51, 53, 54, 56, 58, 59, 61, 62, 63, 64, 70, 71, 72],
    isLimiting: true,
  },
  {
    key: "E",
    label: "E. Câu trung tính / tích cực",
    description:
      "Nhóm câu KHÔNG phải niềm tin giới hạn — đọc tách riêng, không cộng vào tải trọng chung.",
    questions: [20, 30, 45, 46, 47, 52, 57, 65, 66],
    isLimiting: false,
  },
];

/** Tổng điểm 1 nhóm chủ đề */
export function scoreBeliefTheme(
  theme: BeliefTheme,
  answers: Record<number, number>
): number {
  return theme.questions.reduce<number>(
    (sum, qid) => sum + (answers[qid] ?? 0),
    0
  );
}

/** Điểm trung bình 1 nhóm chủ đề (1-10 scale) */
export function avgBeliefTheme(
  theme: BeliefTheme,
  answers: Record<number, number>
): number {
  if (theme.questions.length === 0) return 0;
  const sum = scoreBeliefTheme(theme, answers);
  return Math.round((sum / theme.questions.length) * 100) / 100;
}

/** Top N câu có điểm cao nhất (≥7) — cần ưu tiên tháo gỡ */
export function topLimitingBeliefs(
  answers: Record<number, number>,
  topN = 5
): Array<{ id: number; text: string; score: number }> {
  return BELIEF_QUESTIONS.map((q) => ({
    id: q.id,
    text: q.text,
    score: answers[q.id] ?? 0,
  }))
    .filter((q) => q.score >= 7)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
