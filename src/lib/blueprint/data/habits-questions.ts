/**
 * Bộ câu hỏi Thói Quen Về Tiền — 13 câu, mix format.
 */

export type HabitAnswerType = "yes_no" | "single_select" | "textarea";

export interface HabitQuestion {
  id: string; // semantic key thay vì số
  text: string;
  type: HabitAnswerType;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export const HABITS_QUESTIONS: HabitQuestion[] = [
  {
    id: "budget",
    text: "Hàng năm có lập ngân sách không?",
    type: "yes_no",
  },
  {
    id: "trackSpending",
    text: "Có theo dõi chi tiêu không?",
    type: "single_select",
    options: [
      { value: "daily", label: "Hàng ngày" },
      { value: "weekly", label: "Hàng tuần" },
      { value: "monthly", label: "Hàng tháng" },
      { value: "no", label: "Không theo dõi" },
    ],
  },
  {
    id: "separateAccounts",
    text: "Có tách tài khoản cá nhân và DN không?",
    type: "yes_no",
  },
  {
    id: "paySelf",
    text: "Có tự trả lương cho mình không?",
    type: "yes_no",
  },
  {
    id: "personalFundBusiness",
    text: "Có dùng tiền cá nhân nuôi DN không?",
    type: "yes_no",
  },
  {
    id: "personalDebtBusiness",
    text: "Có dùng nợ cá nhân nuôi DN không?",
    type: "yes_no",
  },
  {
    id: "knowNetWorth",
    text: "Bạn có biết Net Worth hiện tại không?",
    type: "yes_no",
  },
  {
    id: "hasFinancialDashboard",
    text: "Bạn có Financial Dashboard không?",
    type: "yes_no",
  },
  {
    id: "reviewFrequency",
    text: "Bạn review tài chính bao lâu 1 lần?",
    type: "single_select",
    options: [
      { value: "weekly", label: "Hàng tuần" },
      { value: "monthly", label: "Hàng tháng" },
      { value: "quarterly", label: "Hàng quý" },
      { value: "yearly", label: "Hàng năm" },
      { value: "never", label: "Không review" },
    ],
  },
  {
    id: "hasAdvisor",
    text: "Bạn có cố vấn tài chính không?",
    type: "yes_no",
  },
  {
    id: "hasAIAssistant",
    text: "Bạn có AI hỗ trợ quản lý tài chính không?",
    type: "yes_no",
  },
  {
    id: "has10YearPlan",
    text: "Bạn có kế hoạch tài sản 10 năm không?",
    type: "yes_no",
  },
  {
    id: "biggestWorry",
    text: "Điều khiến bạn lo nhất về tài chính hiện nay là gì?",
    type: "textarea",
    placeholder: "Chia sẻ cụ thể nỗi lo lớn nhất của anh/chị…",
  },
];

export type HabitAnswerValue = string | boolean | null;
export type HabitsAnswers = Record<string, HabitAnswerValue>;
