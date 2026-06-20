import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import FinancialSafetyTool from "./FinancialSafetyTool";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ An Toàn Tài Chính — Miễn phí | ${siteConfig.name}`,
  description:
    "Công cụ tính cấp độ An Toàn Tài Chính theo VINEN — tài sản thanh khoản ≥ 120 tháng thu nhập + có bảo hiểm đầy đủ.",
  alternates: { canonical: `${BASE_URL}/tools/an-toan-tai-chinh` },
  openGraph: {
    title: "An Toàn Tài Chính — VINEN",
    description:
      "Tính số tiền cần để đạt cấp độ An Toàn Tài Chính (120 tháng thu nhập) + lộ trình đầy quỹ.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default function AnToanTaiChinhPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <FinancialSafetyTool />
      </Suspense>
    </div>
  );
}
