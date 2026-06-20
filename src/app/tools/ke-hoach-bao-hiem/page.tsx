import type { Metadata } from "next";
import { Suspense } from "react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { memberToolGate } from "@/components/tools/MemberToolGate";
import InsurancePlanTool from "./InsurancePlanTool";

export const dynamic = "force-dynamic";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Công cụ Kế Hoạch Bảo Hiểm | ${siteConfig.name}`,
  description:
    "Công cụ hoạch định bảo hiểm cá nhân — tính mức bảo hiểm nhân thọ cần thiết theo công thức DIME, kiểm tra tỉ lệ phí BH so với thu nhập.",
  alternates: { canonical: `${BASE_URL}/tools/ke-hoach-bao-hiem` },
  robots: { index: false, follow: false }, // riêng cho học viên Blueprint
  openGraph: {
    title: "Hoạch Định Bảo Hiểm — VINEN",
    description:
      "Tính số tiền bảo hiểm cần thiết theo DIME (Debt + Income + Mortgage + Education) + so sánh với BH hiện có.",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
  },
};

export default async function KeHoachBaoHiemPage() {
  const gate = await memberToolGate();
  if (gate) return gate;

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <Suspense fallback={null}>
        <InsurancePlanTool />
      </Suspense>
    </div>
  );
}
