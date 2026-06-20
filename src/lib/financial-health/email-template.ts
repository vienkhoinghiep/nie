import type { FinancialHealthResult } from "./score";
import { buildRecommendation } from "./recommend";
import { getBaseUrl, siteConfig } from "@/lib/site-config";

/** HTML email summary of a financial-health assessment. */
export function renderFinancialHealthEmailHtml(
  result: FinancialHealthResult,
  options: { name: string; token: string }
): string {
  const base = getBaseUrl();
  const link = `${base}/results/${options.token}`;
  const ratingColor =
    result.rating === "good" ? "#22c55e" : result.rating === "fair" ? "#f59e0b" : "#ef4444";
  const ratingLabel =
    result.rating === "good"
      ? "TỐT"
      : result.rating === "fair"
        ? "TRUNG BÌNH"
        : "CẦN CHÚ Ý";

  // Personalised upsell (Gói Hướng Dẫn — refundable 100%).
  const rec = buildRecommendation(result, base);

  // Render metrics grouped by 5 categories (Chi tiêu, Thanh khoản, …)
  const groupBlocks = result.groups
    .map((g) => {
      const groupColor =
        g.rating === "good" ? "#16a34a" : g.rating === "fair" ? "#d97706" : "#dc2626";
      const groupRows = g.metrics
        .map((m) => {
          const color =
            m.rating === "good" ? "#16a34a" : m.rating === "fair" ? "#d97706" : "#dc2626";
          const valueDisplay =
            m.unit === "năm" && m.value >= 99
              ? "∞"
              : `${m.value}${m.unit ? " " + escape(m.unit) : ""}`;
          return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:13px;color:#374151;font-weight:600;">${escape(m.label)}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">Mục tiêu: ${escape(m.ideal)}</div>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #e5e7eb;white-space:nowrap;">
            <div style="font-size:14px;font-weight:700;color:#111827;">${valueDisplay}</div>
            <div style="display:inline-block;margin-top:3px;padding:2px 7px;border-radius:99px;font-size:10px;font-weight:700;color:#fff;background:${color};">
              ${m.score}/10
            </div>
          </td>
        </tr>`;
        })
        .join("");
      return `
        <tr>
          <td style="padding:14px 0 6px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#111827;">
                  ${escape(g.label)}
                </td>
                <td align="right">
                  <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;color:#fff;background:${groupColor};">
                    ${g.score}/${g.max_score}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${groupRows}
            </table>
          </td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Kết quả Kiểm Tra Sức Khỏe Tài Chính</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
          <!-- Header bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563EB,#3B82F6);padding:24px 28px;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;color:#3a2e0a;">
                ${escape(siteConfig.name)}
              </div>
              <div style="font-size:20px;font-weight:800;color:#111827;margin-top:4px;">
                Kết Quả Kiểm Tra Sức Khỏe Tài Chính
              </div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:28px 28px 0 28px;">
              <p style="margin:0 0 6px 0;font-size:14px;color:#374151;">
                Xin chào <strong>${escape(options.name)}</strong>,
              </p>
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
                Cảm ơn anh/chị đã hoàn thành bài kiểm tra. Dưới đây là tổng kết
                sức khoẻ tài chính dựa trên 6 chỉ số quan trọng.
              </p>
            </td>
          </tr>

          <!-- Total score card -->
          <tr>
            <td style="padding:24px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0a0a0a;border-radius:12px;padding:0;">
                <tr>
                  <td align="center" style="padding:24px;">
                    <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;font-weight:600;">
                      Tổng điểm sức khoẻ
                    </div>
                    <div style="font-size:56px;font-weight:900;color:${ratingColor};line-height:1;margin:12px 0 6px;">
                      ${result.total_score}<span style="font-size:24px;color:#6b7280;font-weight:700;"> / 100</span>
                    </div>
                    <div style="display:inline-block;padding:5px 14px;border-radius:99px;background:${ratingColor};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                      ${ratingLabel}
                    </div>
                    <div style="font-size:13px;color:#d1d5db;margin-top:14px;font-style:italic;">
                      ${escape(result.summary)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Metrics grouped by 5 categories -->
          <tr>
            <td style="padding:0 28px 8px;">
              <div style="font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">
                Chi tiết 11 chỉ số theo 5 nhóm
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${groupBlocks}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:28px;">
              <a href="${link}" style="display:inline-block;background:#2563EB;color:#1a1a1a;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:14px;">
                📊 Xem kết quả đầy đủ &amp; lời khuyên chi tiết
              </a>
              <div style="font-size:11px;color:#9ca3af;margin-top:12px;">
                Link cá nhân — anh/chị có thể lưu lại để xem sau hoặc chia sẻ.
              </div>
            </td>
          </tr>

          <!-- Personalised recommendation: weak metrics + Gói Hướng Dẫn upsell -->
          ${renderRecommendationBlock(rec, ratingColor)}

          <!-- Footer -->
          <tr>
            <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <div style="font-size:11px;color:#6b7280;text-align:center;line-height:1.7;">
                © ${new Date().getFullYear()} ${escape(siteConfig.name)} — ${escape(siteConfig.domain)}<br />
                Email này gửi từ công cụ kiểm tra sức khoẻ tài chính của ${escape(siteConfig.name)}.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escape(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Email-safe HTML block for the personalised Gói Hướng Dẫn upsell. */
function renderRecommendationBlock(
  rec: import("./recommend").QuizRecommendation,
  ratingColor: string
): string {
  // Urgency-driven palette — tier card colour matches the user's rating.
  const isHigh = rec.urgency === "high";
  const isLow = rec.urgency === "low";
  const cardBg = isHigh
    ? "#fff1f2"
    : isLow
      ? "#f0fdf4"
      : "#fffbeb";
  const cardBorder = isHigh
    ? "#fecaca"
    : isLow
      ? "#bbf7d0"
      : "#fde68a";
  const headerColor = isHigh ? "#b91c1c" : isLow ? "#15803d" : "#92400e";
  const bodyColor = isHigh ? "#7f1d1d" : isLow ? "#14532d" : "#451a03";

  const bulletsHtml = rec.weakness_bullets
    .map(
      (b) =>
        `<li style="font-size:12px;color:${bodyColor};line-height:1.6;margin-bottom:6px;">${b}</li>`
    )
    .join("");

  return `
          <tr>
            <td style="padding:0 28px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${cardBg};border:1px solid ${cardBorder};border-radius:12px;">
                <tr>
                  <td style="padding:18px 18px 14px;">
                    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:${headerColor};margin-bottom:6px;">
                      💡 Gợi ý cá nhân hoá
                    </div>
                    <div style="font-size:15px;font-weight:800;color:${headerColor};line-height:1.4;margin-bottom:8px;">
                      ${escape(rec.headline)}
                    </div>
                    <div style="font-size:13px;color:${bodyColor};line-height:1.6;margin-bottom:10px;">
                      ${rec.body}
                    </div>
                    ${
                      rec.weakness_bullets.length > 0
                        ? `<ul style="padding-left:18px;margin:8px 0 12px;">${bulletsHtml}</ul>`
                        : ""
                    }
                    ${
                      rec.good_state_note
                        ? `<div style="font-size:11px;color:${bodyColor};font-style:italic;margin-bottom:12px;">${rec.good_state_note}</div>`
                        : ""
                    }
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:0 18px 18px;">
                    <a href="${rec.cta_url}" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#3B82F6);color:#1a1a1a;font-weight:800;padding:13px 24px;border-radius:10px;text-decoration:none;font-size:14px;">
                      ${escape(rec.cta_label)}
                    </a>
                    <div style="font-size:11px;color:${bodyColor};margin-top:10px;font-weight:600;">
                      ${escape(rec.price_hint)}
                    </div>
                    <div style="display:inline-block;margin-top:6px;padding:3px 9px;border-radius:99px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                      🛡 Cam kết hoàn lại 100%
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`.trim();
  // ratingColor reserved for future use (e.g., theming the badge);
  // referenced here just to satisfy the linter without an explicit no-op.
  void ratingColor;
}
