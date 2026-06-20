import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { memberToolGate } from "@/components/tools/MemberToolGate";
import InvestmentGoalTool from "./InvestmentGoalTool";

export const dynamic = "force-dynamic";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Đầu Tư Theo Mục Tiêu | ${siteConfig.name}`,
  description:
    "Công cụ tính kế hoạch đầu tư theo mục tiêu — mua nhà, nghỉ hưu sớm, học con. Compound interest + biểu đồ tăng trưởng + gợi ý số tiền đầu tư hàng tháng.",
  alternates: { canonical: `${BASE_URL}/tools/dau-tu-muc-tieu` },
  robots: { index: false, follow: false }, // riêng cho học viên Blueprint
  openGraph: {
    title: "Đầu Tư Theo Mục Tiêu — VINEN",
    description:
      "Tính lộ trình đầu tư đạt mục tiêu — compound interest, what-if scenarios, gợi ý số tiền đầu tư /tháng.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default async function DauTuMucTieuPage() {
  const gate = await memberToolGate();
  if (gate) return gate;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <InvestmentGoalTool />
      </Suspense>
    </div>
  );
}
