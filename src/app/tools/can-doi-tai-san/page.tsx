import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import BalanceSheetTool from "./BalanceSheetTool";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Cân Đối Tài Sản — Miễn phí | ${siteConfig.name}`,
  description:
    "Công cụ cân đối tài sản cá nhân miễn phí — tính tài sản ròng (net worth), phân tích cơ cấu tài sản theo 4 nhóm + báo cáo trực quan. Không cần đăng ký.",
  alternates: { canonical: `${BASE_URL}/tools/can-doi-tai-san` },
  openGraph: {
    title: "Cân Đối Tài Sản — VINEN",
    description:
      "Tính tài sản ròng + phân tích cơ cấu tài sản theo 4 nhóm chuẩn (Thanh khoản · Tăng trưởng · Dòng tiền · Tiêu sản).",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default function CanDoiTaiSanPage() {
  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <BalanceSheetTool />
      </Suspense>
    </div>
  );
}
