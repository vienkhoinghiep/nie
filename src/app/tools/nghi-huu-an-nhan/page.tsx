import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { memberToolGate } from "@/components/tools/MemberToolGate";
import RetirementPlanTool from "./RetirementPlanTool";

export const dynamic = "force-dynamic";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Nghỉ Hưu An Nhàn | ${siteConfig.name}`,
  description:
    "Công cụ tính kế hoạch nghỉ hưu an nhàn — số tiền cần tích lũy đến tuổi hưu (tính lạm phát) + lộ trình đầu tư /tháng cần thiết.",
  alternates: { canonical: `${BASE_URL}/tools/nghi-huu-an-nhan` },
  robots: { index: false, follow: false }, // riêng cho học viên Blueprint
  openGraph: {
    title: "Nghỉ Hưu An Nhàn — VINEN",
    description:
      "Tính số tiền cần tích lũy để nghỉ hưu an nhàn + đầu tư /tháng cần thiết. Có tính lạm phát + lãi kép.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default async function NghiHuuAnNhanPage() {
  const gate = await memberToolGate();
  if (gate) return gate;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <RetirementPlanTool />
      </Suspense>
    </div>
  );
}
