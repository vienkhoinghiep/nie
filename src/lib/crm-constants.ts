/**
 * Shared CRM constants — single source of truth for journey stages
 * used by both server actions and API routes.
 *
 * Journey order (theo định nghĩa anh Tuệ):
 *   Visitor → Lead → Contact → Shopper → Khách hàng → Advocate
 *
 * Stage KEYS are kept stable (so the DB CHECK constraint and existing
 * rows keep working) — only LABELS and ORDER have changed.
 *
 *  - "contacted"  → "Contact"         (sales đã contact)
 *  - "negotiation" → "Shopper"        (đã đăng ký sản phẩm miễn phí —
 *                                      khoá học / webinar)
 *
 * Lưu ý: stage "qualified" (Qualified Lead) đã được BỎ khỏi phễu hiển thị.
 * Dữ liệu cũ ở "qualified" (nếu có) được gộp vào "lead" khi đếm (xem crm/page).
 */

export const CRM_JOURNEY_STAGES = [
  "visitor",
  "lead",
  "contacted",
  "negotiation",
  "customer",
  "advocate",
] as const;

export type CrmJourneyStage = (typeof CRM_JOURNEY_STAGES)[number];

/** Display labels for each stage (Vietnamese, single source of truth). */
export const CRM_JOURNEY_STAGE_LABELS: Record<CrmJourneyStage, string> = {
  visitor: "Visitor",
  lead: "Lead",
  contacted: "Contact",
  negotiation: "Shopper",
  customer: "Khách hàng",
  advocate: "Advocate",
};

/** Brand-aligned colours for each stage. */
export const CRM_JOURNEY_STAGE_COLORS: Record<CrmJourneyStage, string> = {
  visitor: "#6b7280",
  lead: "#3b82f6",
  contacted: "#f59e0b",
  negotiation: "#06b6d4",
  customer: "#2563EB",
  advocate: "#22c55e",
};
