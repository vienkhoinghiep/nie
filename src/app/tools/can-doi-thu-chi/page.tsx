import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import CashflowTool from "./CashflowTool";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Cân Đối Thu Chi — Miễn phí | ${siteConfig.name}`,
  description:
    "Công cụ cân đối thu chi cá nhân miễn phí — quản lý dòng tiền, theo dõi tỉ lệ tiết kiệm và so sánh với phương pháp 6 quỹ JARS. Không cần đăng ký.",
  alternates: { canonical: `${BASE_URL}/tools/can-doi-thu-chi` },
  openGraph: {
    title: "Cân Đối Thu Chi — VINEN",
    description:
      "Quản lý dòng tiền cá nhân miễn phí — phân tích thu chi, so sánh với 6 quỹ JARS, gợi ý hành động.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default function CanDoiThuChiPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <CashflowTool />
      </Suspense>
    </div>
  );
}
