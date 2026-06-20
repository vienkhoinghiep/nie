import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, ShieldCheck, ArrowRight } from "lucide-react";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/server";
import { hasBlueprintAccess } from "@/lib/blueprint/access";
import BlueprintTool from "./BlueprintTool";

export const dynamic = "force-dynamic";

const BASE_URL = getBaseUrl();
const BRAND = "#2563EB";

export const metadata: Metadata = {
  title: `Entrepreneur Financial Blueprint | ${siteConfig.name}`,
  description:
    "Công cụ tích hợp toàn diện cho học viên — Profile · Dòng tiền · Tài sản · Bảo hiểm · Đầu tư. Nhập 1 lần, dùng cho mọi bài tập.",
  alternates: {
    canonical: `${BASE_URL}/tools/entrepreneur-financial-blueprint`,
  },
  robots: { index: false, follow: false }, // riêng cho học viên
};

export default async function BlueprintPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → redirect to login with return path
  if (!user) {
    redirect(
      "/login?next=" +
        encodeURIComponent("/tools/entrepreneur-financial-blueprint")
    );
  }

  // Logged in but no purchase → show upgrade prompt
  const hasAccess = await hasBlueprintAccess(user.id);
  if (!hasAccess) {
    return (
      <div
        className="min-h-screen text-white flex items-center justify-center px-4"
        style={{ background: siteConfig.colors.background }}
      >
        <div
          className="max-w-xl w-full rounded-2xl p-8 sm:p-10 text-center"
          style={{
            background: `linear-gradient(135deg, ${BRAND}10, transparent)`,
            border: `1px solid ${BRAND}55`,
          }}
        >
          <div
            className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-4"
            style={{ background: `${BRAND}1a`, color: BRAND }}
          >
            <Crown size={26} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Công cụ dành cho học viên
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Entrepreneur Financial Blueprint là bộ công cụ tích hợp toàn diện
            dành riêng cho học viên đã đăng ký 1 trong 3 gói{" "}
            <strong className="text-white">Hoạch Định TC Cá Nhân</strong>.
            Anh/chị nhập thông tin tài chính 1 lần và dùng cho tất cả bài tập
            tương ứng các video trong khoá học.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/giai-phap-toan-dien#pricing"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-extrabold transition-transform hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, #3B82F6, ${BRAND})`,
                color: "#0a0a0a",
                boxShadow: `0 12px 36px ${BRAND}55`,
              }}
            >
              <ShieldCheck size={16} />
              Xem 3 gói giải pháp
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/tools/suc-khoe-tai-chinh"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              Thử bài test miễn phí
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white"
      style={{ background: siteConfig.colors.background }}
    >
      <BlueprintTool userEmail={user.email ?? ""} />
    </div>
  );
}
