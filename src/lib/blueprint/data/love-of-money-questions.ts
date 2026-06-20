/**
 * Bài Kiểm Tra Mức Độ Yêu Tiền — 38 câu hỏi Có/Không.
 *
 * Cách chấm điểm:
 *   - Câu 1-22: "Có" = 1 điểm
 *   - Câu 23-38: "Không" = 1 điểm
 *   - Tổng 0-38 điểm
 *
 * Phân ngưỡng:
 *   0-10  → Bất hòa với tiền
 *   11-30 → Trên đường tới chuyên gia tài chính
 *   31-38 → Yêu thương tiền bạc
 */

export interface LoveOfMoneyQuestion {
  id: number; // 1-38
  text: string;
  /** Đáp án ghi điểm — câu 1-22 ghi 1đ khi "yes", 23-38 ghi 1đ khi "no" */
  scoreOn: "yes" | "no";
}

export const LOVE_OF_MONEY_QUESTIONS: LoveOfMoneyQuestion[] = [
  {
    id: 1,
    text: "Bạn có biết tháng trước mình đã tiêu bao nhiêu tiền và vào những thứ nào trong đó khoảng 1.000.000 VND hay không?",
    scoreOn: "yes",
  },
  { id: 2, text: "Bạn có biết tháng trước mình kiếm được bao nhiêu hay không?", scoreOn: "yes" },
  { id: 3, text: "Bạn có hơn 20.000.000 VND tiết kiệm hay không?", scoreOn: "yes" },
  { id: 4, text: "Bạn có ít nhất một quỹ hưu trí chứ?", scoreOn: "yes" },
  { id: 5, text: "Bạn có ít nhất một khoản đầu tư chứ?", scoreOn: "yes" },
  {
    id: 6,
    text: "Bạn có nguồn thu nhập nào khác ngoài tiền lương hay không (ví dụ như đầu tư bất động sản, cổ phiếu, trái phiếu, hay kinh doanh)?",
    scoreOn: "yes",
  },
  {
    id: 7,
    text: "Bạn có biết mình sở hữu cổ phần/cổ phiếu/trái phiếu nào trong khoản đầu tư không?",
    scoreOn: "yes",
  },
  {
    id: 8,
    text: "Bạn có nói chuyện tiền bạc với người yêu, bạn bè hay những người thân khác ít nhất một lần mỗi tuần không?",
    scoreOn: "yes",
  },
  { id: 9, text: "Tài khoản ngân hàng của bạn hiện có tiền không?", scoreOn: "yes" },
  {
    id: 10,
    text: "Bạn có biết trung bình mỗi tháng mình tiêu bao nhiêu tiền không?",
    scoreOn: "yes",
  },
  { id: 11, text: "Bạn có biết 3 nhóm chi phí mà bạn tiêu nhiều nhất là gì không?", scoreOn: "yes" },
  {
    id: 12,
    text: "Bạn có tiêu tiền một cách có ý thức cho những thứ bạn xem trọng nhất không?",
    scoreOn: "yes",
  },
  {
    id: 13,
    text: "Bạn có thích thực hiện những hành động tài chính như thanh toán hóa đơn, trao đổi với người tư vấn, và kiểm tra các hoạt động đầu tư của mình không?",
    scoreOn: "yes",
  },
  { id: 14, text: "Bạn có thích nghề nghiệp của mình không?", scoreOn: "yes" },
  {
    id: 15,
    text: "Trước khóa học này bạn có đọc quyển sách nào nói về tiền bạc chưa?",
    scoreOn: "yes",
  },
  {
    id: 16,
    text: "Bạn có bao giờ tham gia một khóa học nói về tiền bạc chưa?",
    scoreOn: "yes",
  },
  {
    id: 17,
    text: "Bạn có thấy lạc quan về tình hình tài chính trong tương lai của mình không?",
    scoreOn: "yes",
  },
  { id: 18, text: "Bạn có lập mục tiêu tài chính đầu mỗi năm không?", scoreOn: "yes" },
  { id: 19, text: "Bạn có theo dõi chi tiêu của mình không?", scoreOn: "yes" },
  {
    id: 20,
    text: "Bạn có cảm thấy công việc mình làm giúp đóng góp giá trị cho thế giới không?",
    scoreOn: "yes",
  },
  { id: 21, text: "Bạn có thích làm ra tiền không?", scoreOn: "yes" },
  { id: 22, text: "Có bao giờ bạn khởi nghiệp kinh doanh chưa?", scoreOn: "yes" },
  {
    id: 23,
    text: "Bạn có thỉnh thoảng nằm trằn trọc trên giường buổi tối hay dậy sớm vì lo lắng về tình hình tài chính của mình không?",
    scoreOn: "no",
  },
  { id: 24, text: "Bạn có tin người giàu thì không thanh cao bằng người không giàu không?", scoreOn: "no" },
  {
    id: 25,
    text: "Những cuộc đối thoại về vấn đề tài chính với bạn bè hay người mà bạn yêu có thường kết thúc bằng sự bất hòa không?",
    scoreOn: "no",
  },
  { id: 26, text: "Bạn có thấy lo khi nghĩ đến hay nói về tiền bạc không?", scoreOn: "no" },
  {
    id: 27,
    text: "Bạn có nói \"mình không đủ điều kiện\" ít nhất một lần mỗi tuần không?",
    scoreOn: "no",
  },
  { id: 28, text: "Bạn có nợ tín dụng không?", scoreOn: "no" },
  { id: 29, text: "Bạn có nợ tiền thuế không?", scoreOn: "no" },
  { id: 30, text: "Bạn có thấy tiền không bao giờ là đủ không?", scoreOn: "no" },
  {
    id: 31,
    text: "Bạn có mất tập trung, chán chường hay có dấu hiệu phản kháng khi tìm hiểu, nói chuyện tiền bạc hay tham gia vào đời sống tài chính theo những cách khác không?",
    scoreOn: "no",
  },
  {
    id: 32,
    text: "Việc chi tiêu ít hơn số tiền mình kiếm được có khiến bạn thấy bị gò bó không?",
    scoreOn: "no",
  },
  { id: 33, text: "Bạn có tin, dù hơi hơi, rằng tiền bạc là xấu xa hay dơ bẩn không?", scoreOn: "no" },
  {
    id: 34,
    text: "Bạn có tin, dù chỉ hơi hơi, rằng người giàu là xấu xa và/hay tham lam không?",
    scoreOn: "no",
  },
  { id: 35, text: "Bạn có thấy mệt mỏi khi làm công việc hiện giờ không?", scoreOn: "no" },
  { id: 36, text: "Bạn có khó tiêu tiền cho bản thân không?", scoreOn: "no" },
  { id: 37, text: "Bạn có thấy lo lắng khi chi một khoản tiền mình xem là lớn không?", scoreOn: "no" },
  {
    id: 38,
    text: "Bạn có duy trì tình trạng nợ thẻ tín dụng dù biết mình có thể dễ dàng thanh toán không?",
    scoreOn: "no",
  },
];

/** Tổng điểm yêu tiền dựa trên answers (Record<questionId, "yes" | "no">) */
export function scoreLoveOfMoney(
  answers: Record<number, "yes" | "no">
): number {
  let total = 0;
  for (const q of LOVE_OF_MONEY_QUESTIONS) {
    const a = answers[q.id];
    if (a && a === q.scoreOn) total += 1;
  }
  return total;
}

/** 3 ngưỡng phân loại */
export function loveOfMoneyTier(
  score: number
): { tier: 1 | 2 | 3; label: string; desc: string } {
  if (score <= 10)
    return {
      tier: 1,
      label: "Bất hòa với tiền",
      desc: "Tiền không phải là đối tượng bạn yêu thích. Tình hình tài chính của bạn gặp nhiều khó khăn — nhưng bạn đang ở đúng nơi để thay đổi.",
    };
  if (score <= 30)
    return {
      tier: 2,
      label: "Đang thẳng tiến tới chuyên gia tài chính",
      desc: "Bạn giỏi. Có thể vẫn còn vài niềm tin kìm hãm hoặc món nợ cần trả, nhưng bạn đang trên con đường tới đích.",
    };
  return {
    tier: 3,
    label: "Sống trong môi trường yêu thương tiền bạc",
    desc: "Bạn hiểu cách đồng tiền vận hành. Đừng tự mãn — hãy nuôi dưỡng mối quan hệ với tiền bạc mỗi ngày.",
  };
}
