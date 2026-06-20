import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import EmergencyFundTool from "./EmergencyFundTool";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Tính Quỹ Dự Phòng — Miễn phí | ${siteConfig.name}`,
  description:
    "Công cụ tính quỹ dự phòng khẩn cấp cá nhân miễn phí — biết cần bao nhiêu để trụ 3/6/9/12 tháng, đã có bao nhiêu, còn thiếu bao nhiêu, bao lâu thì đầy.",
  alternates: { canonical: `${BASE_URL}/tools/quy-du-phong` },
  openGraph: {
    title: "Tính Quỹ Dự Phòng Khẩn Cấp — VINEN",
    description:
      "Tính số tiền cần để trụ 3-12 tháng + lộ trình bao lâu đầy quỹ + gợi ý đóng góp /tháng.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default function QuyDuPhongPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <EmergencyFundTool />
      </Suspense>
    </div>
  );
}
