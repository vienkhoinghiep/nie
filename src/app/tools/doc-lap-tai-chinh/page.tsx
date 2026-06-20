import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import IndependenceTool from "./IndependenceTool";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Độc Lập Tài Chính — Miễn phí | ${siteConfig.name}`,
  description:
    "Công cụ tính cấp độ Độc Lập Tài Chính theo VINEN — thu nhập thụ động ≥ chi tối thiểu, hoặc TS sinh dòng tiền × 4% ≥ chi năm.",
  alternates: { canonical: `${BASE_URL}/tools/doc-lap-tai-chinh` },
  openGraph: {
    title: "Độc Lập Tài Chính — VINEN",
    description:
      "2 cách đo Độc Lập Tài Chính + lộ trình tích lũy corpus theo quy tắc 4%.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default function DocLapTaiChinhPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <IndependenceTool />
      </Suspense>
    </div>
  );
}
