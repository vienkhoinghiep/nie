import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { memberToolGate } from "@/components/tools/MemberToolGate";
import CashFlowMapTool from "./CashFlowMapTool";

export const dynamic = "force-dynamic";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Hoạch Định Dòng Tiền — Bản đồ xô chảy tràn | ${siteConfig.name}`,
  description:
    "Thiết kế bản đồ dòng tiền cá nhân theo mô hình xô chảy tràn: Thu nhập → Thiết yếu (55%) → Dự phòng → An toàn TC (BH) → Đầu tư (Tự do TC · Học tập · Phong cách sống · Tích phước).",
  alternates: { canonical: `${BASE_URL}/tools/hoach-dinh-dong-tien` },
  robots: { index: false, follow: false }, // riêng cho học viên Blueprint
  openGraph: {
    title: "Hoạch Định Dòng Tiền — VINEN",
    description:
      "Bản đồ xô chảy tràn — phân bổ thu nhập tự động theo 5 quỹ: Thiết yếu · Dự phòng · An toàn · Đầu tư · Cho đi.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default async function HoachDinhDongTienPage() {
  const gate = await memberToolGate();
  if (gate) return gate;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <CashFlowMapTool />
      </Suspense>
    </div>
  );
}
