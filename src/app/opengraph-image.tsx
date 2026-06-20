import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

/**
 * Default OG image for the entire site — used whenever a route doesn't
 * define its own opengraph-image.tsx. Generated at request time so we
 * don't need a baked PNG asset.
 *
 */

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
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
          background: "linear-gradient(135deg, #0a0a0a 0%, #0f1c3a 60%, #1e3a8a 100%)",
          padding: "72px 88px",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(37,99,235,0.32), transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)",
            display: "flex",
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "10px 20px",
            borderRadius: 9999,
            background: "rgba(37,99,235,0.14)",
            border: "1px solid rgba(37,99,235,0.55)",
            color: "#2563EB",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 30,
          }}
        >
          ✦ {siteConfig.name}
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
            fontSize: 78,
            fontWeight: 900,
            lineHeight: 1.04,
            letterSpacing: -1,
            marginBottom: 22,
            maxWidth: 1000,
          }}
        >
          <div>{siteConfig.shortName}</div>
          <div style={{ color: "#2563EB" }}>{siteConfig.tagline}</div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            color: "#d1d5db",
            fontSize: 30,
            lineHeight: 1.4,
            maxWidth: 940,
            fontWeight: 500,
            marginBottom: 36,
          }}
        >
          {siteConfig.tagline}
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            color: "#9ca3af",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <div style={{ color: "#2563EB" }}>{siteConfig.domain}</div>
          <div style={{ color: "#4b5563" }}>•</div>
          <div>{siteConfig.owner.name}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
