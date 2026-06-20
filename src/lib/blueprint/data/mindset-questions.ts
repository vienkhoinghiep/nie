/**
 * Bài Test Tâm Thức Tiền Bạc — 35 câu hỏi.
 * Chấm 0-3:
 *   0 = Hiếm khi · 1 = Đôi khi · 2 = Thường xuyên · 3 = Luôn luôn
 *
 * Kết quả phân thành 7 LOẠI, mỗi loại được tính tổng từ 5 câu hỏi cụ thể.
 * (Tên 7 loại sẽ được thầy thêm trong phần báo cáo riêng.)
 */

export interface MindsetQuestion {
  id: number; // 1-35
  text: string;
}

export const MINDSET_QUESTIONS: MindsetQuestion[] = [
  { id: 1, text: "Tôi thích lập ngân sách các quỹ." },
  {
    id: 2,
    text: "Tôi thường xuyên chi tiền để chúc phúc cho người khác và khiến họ cảm thấy đặc biệt.",
  },
  { id: 3, text: "Tôi tập trung vào cách tối đa hóa tiền của mình." },
  {
    id: 4,
    text: "Tôi lên kế hoạch cho thế hệ tiếp theo để giành chiến thắng về mặt tài chính.",
  },
  {
    id: 5,
    text: "Có lẽ nhiều hơn những người khác, tôi thích chi tiền cho các bữa ăn hoặc các hoạt động để làm quen với những người mới.",
  },
  {
    id: 6,
    text: "Khi tôi thấy ai đó có nhu cầu tài chính, tôi phải làm gì đó với điều đó.",
  },
  {
    id: 7,
    text: "Nếu tôi không cẩn thận, tôi chi tiêu quá tay cho việc tặng quà hoặc vinh danh người khác.",
  },
  { id: 8, text: "Tôi rất có tổ chức với tiền." },
  {
    id: 9,
    text: "Tôi sử dụng tài nguyên của mình để tạo ra những môi trường hoặc trải nghiệm đẹp.",
  },
  { id: 10, text: "Tôi cạn kiệt năng lượng để thực hiện các kế hoạch tài chính dài hạn." },
  {
    id: 11,
    text: "Tôi dành nhiều thời gian hơn để suy nghĩ về những gì có thể làm được với tài chính hơn là suy nghĩ về tình hình tài chính hiện tại của tôi.",
  },
  {
    id: 12,
    text: "Khi được mời tham dự một buổi họp mặt, tôi thích đóng góp một cách có ý nghĩa.",
  },
  { id: 13, text: "Trong khi tôi không lãng phí, tôi làm những việc hạng nhất." },
  { id: 14, text: "Tôi thích chia sẻ ước mơ và kế hoạch cho tương lai với người khác." },
  {
    id: 15,
    text: "Tôi là một nhà đàm phán khó tính, người cố gắng để có được thỏa thuận tốt nhất.",
  },
  {
    id: 16,
    text: "Khi tôi thấy một người có nhu cầu, tôi cảm thấy tồi tệ vì có quá nhiều tài sản.",
  },
  {
    id: 17,
    text: "Trong gia đình hoặc giữa những người bạn của tôi, tôi được xem là người có khả năng xử lý tiền bạc tốt.",
  },
  { id: 18, text: "Tôi có một cái nhìn rõ ràng về tương lai tài chính ưa thích của tôi." },
  { id: 19, text: "Tôi tiết kiệm về tài chính vì điều đó khiến tôi an tâm." },
  {
    id: 20,
    text: "Tôi đang tham gia với nhiều dự án, nhóm hoặc tổ chức từ thiện trong cộng đồng của mình.",
  },
  { id: 21, text: "Tôi khó chấp nhận sự hào phóng của người khác." },
  { id: 22, text: "Khi nói đến tiền, tôi giữ quan điểm lâu dài." },
  { id: 23, text: "Tôi thích thúc đẩy người khác đưa tiền cho các dự án." },
  {
    id: 24,
    text: "Tôi tập trung cao độ vào các sản phẩm hoặc trải nghiệm mà tôi mong muốn.",
  },
  {
    id: 25,
    text: "Nếu tôi có được $1.000 bất ngờ, thiên hướng mạnh nhất của tôi sẽ là sử dụng nó để trả nợ hoặc hóa đơn.",
  },
  {
    id: 26,
    text: "Tôi tràn đầy năng lượng bằng cách tưởng tượng các khả năng tài chính dài hạn cho cuộc sống cá nhân hoặc công ty của tôi.",
  },
  { id: 27, text: "Tôi luôn luôn tìm kiếm những cách mới để kiếm tiền." },
  { id: 28, text: "Tôi chỉ quản lý tiền đủ để hoạt động." },
  { id: 29, text: "Tôi kiên định và kiên định khi nói đến cách tôi xử lý tiền." },
  {
    id: 30,
    text: "Tôi thích hợp tác với những người khác trong các dự án hoặc ý tưởng kinh doanh, thậm chí ngoài trách nhiệm công việc thường xuyên của tôi.",
  },
  { id: 31, text: "Tôi không có vấn đề gì khi tiêu tiền vào bản thân." },
  {
    id: 32,
    text: "Khi nói đến tiền, tôi nghĩ rằng: \"Bạn không thể mang nó theo khi bạn chết\".",
  },
  {
    id: 33,
    text: "Khi mua hàng, tôi đánh giá cao việc nhận được những gì tôi muốn hơn là nhận được ưu đãi tốt nhất.",
  },
  {
    id: 34,
    text: "Mọi người xem tôi như một người có thể giúp họ tạo mối liên hệ quan trọng với người hoặc nhóm khác.",
  },
  { id: 35, text: "Tôi đặt mong muốn của mình cuối cùng." },
];

/**
 * 7 nhóm khuynh hướng tâm thức tiền bạc.
 * Mỗi nhóm 5 câu, tổng tối đa 15 điểm.
 * Tên + mô tả theo khung báo cáo chuẩn của thầy.
 */
export interface MindsetCategory {
  index: number; // 1-7
  name: string; // tên ngắn
  alias: string; // tên phụ
  questions: number[];
  highMeaning: string; // điểm cao
  caution: string; // cần lưu ý
}

export const MINDSET_CATEGORIES: MindsetCategory[] = [
  {
    index: 1,
    name: "Người Cho Đi",
    alias: "Hào phóng",
    questions: [2, 7, 12, 21, 35],
    highMeaning:
      "Rộng lượng, gắn kết. Dùng tiền để chúc phúc, tặng quà, đóng góp; đặt người khác lên trước.",
    caution: "Dễ chi quá tay, khó nhận lại, quên chính mình.",
  },
  {
    index: 2,
    name: "Người Tích Lũy",
    alias: "Thận trọng",
    questions: [3, 15, 19, 25, 27],
    highMeaning:
      "An toàn, kỷ luật. Tối đa hóa, tiết kiệm, đàm phán giỏi, ưu tiên trả nợ.",
    caution: "Dễ quá dè sẻn, ngại tận hưởng hay đầu tư mạo hiểm hợp lý.",
  },
  {
    index: 3,
    name: "Người Tận Hưởng",
    alias: "",
    questions: [9, 13, 24, 31, 33],
    highMeaning:
      "Biết hưởng thành quả. Coi trọng trải nghiệm/chất lượng, sẵn lòng chi cho bản thân và điều mình muốn.",
    caution: "Dễ chi vượt khả năng nếu thiếu kế hoạch.",
  },
  {
    index: 4,
    name: "Người Kết Nối",
    alias: "",
    questions: [5, 14, 20, 30, 34],
    highMeaning:
      "Mở rộng cơ hội qua mạng lưới. Dùng tiền để xây quan hệ, hợp tác, tham gia cộng đồng.",
    caution: "Ranh giới chi tiêu xã giao.",
  },
  {
    index: 5,
    name: "Người Quản Lý",
    alias: "Tổ chức",
    questions: [1, 8, 17, 22, 29],
    highMeaning:
      "Nền tảng tài chính vững. Lập ngân sách, có tổ chức, kiên định, nhìn dài hạn.",
    caution: "Có thể quá cứng nhắc, ngại linh hoạt.",
  },
  {
    index: 6,
    name: "Sống Cho Hiện Tại / Né Tránh",
    alias: "Rào cản",
    questions: [6, 10, 16, 28, 32],
    highMeaning:
      "⚠ Đây là RÀO CẢN: cạn năng lượng với kế hoạch dài hạn, không thoải mái khi có nhiều, chỉ quản lý 'đủ dùng'.",
    caution: "Điểm cao ở nhóm này là tín hiệu cần ưu tiên tháo gỡ.",
  },
  {
    index: 7,
    name: "Người Tầm Nhìn",
    alias: "Kiến tạo tương lai",
    questions: [4, 11, 18, 23, 26],
    highMeaning:
      "Động lực tăng trưởng mạnh. Tư duy dài hạn, có tầm nhìn tài chính rõ ràng, kiến tạo cho thế hệ sau, truyền cảm hứng cho dự án.",
    caution: "Cân bằng giữa mơ ước và thực thi hiện tại.",
  },
];

/** Tính tổng điểm cho mỗi nhóm từ answers (Record<questionId, score>) */
export function scoreMindset(answers: Record<number, number>): number[] {
  return MINDSET_CATEGORIES.map((cat) =>
    cat.questions.reduce<number>((sum, qid) => sum + (answers[qid] ?? 0), 0)
  );
}

/** Mức điểm cho 1 nhóm (max 15) */
export function mindsetLevel(score: number): "Thấp" | "Trung bình" | "Cao" {
  if (score <= 5) return "Thấp";
  if (score <= 10) return "Trung bình";
  return "Cao";
}

/** 4 mức điểm cho từng câu */
export const MINDSET_LEVELS = [
  { value: 0, label: "Hiếm khi" },
  { value: 1, label: "Đôi khi" },
  { value: 2, label: "Thường xuyên" },
  { value: 3, label: "Luôn luôn" },
] as const;
