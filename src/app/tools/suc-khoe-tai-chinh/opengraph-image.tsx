import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

/**
 * OG image for the Financial Health Check tool page.
 * Overrides the root opengraph-image when this page is shared on
 * Zalo / Facebook / Twitter / LinkedIn.
 *
 * Kept intentionally simple — Satori is strict about CSS support and
 * complex layouts (multiple .map(), nested flex, absolute children)
 * tend to fail silently with a 0-byte response.
 */

export const runtime = "edge";
export const alt = "Kiểm Tra Sức Khoẻ Tài Chính Cá Nhân — Miễn phí";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 55%, #2a1505 100%)",
          padding: "72px 90px",
        }}
      >
        {/* Free pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 22px",
            borderRadius: 9999,
            background: "rgba(34,197,94,0.16)",
            border: "1px solid rgba(34,197,94,0.55)",
            color: "#22c55e",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 2,
            marginBottom: 30,
          }}
        >
          CÔNG CỤ MIỄN PHÍ
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1.05,
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex" }}>Kiểm Tra Sức Khoẻ</div>
          <div style={{ display: "flex", color: "#2563EB" }}>Tài Chính Cá Nhân</div>
        </div>

        {/* Sub-headline */}
        <div
          style={{
            display: "flex",
            color: "#d1d5db",
            fontSize: 30,
            lineHeight: 1.4,
            marginBottom: 38,
            maxWidth: 980,
          }}
        >
          11 chỉ số · 5 nhóm · Phân tích chuyên sâu + lời khuyên cá nhân hoá
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#9ca3af",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", color: "#2563EB" }}>
            {siteConfig.domain}/tools/suc-khoe-tai-chinh
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
