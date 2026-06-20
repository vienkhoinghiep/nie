import type { Metadata } from "next";
import FinancialHealthQuiz from "@/components/tools/FinancialHealthQuiz";
import { siteConfig, getBaseUrl } from "@/lib/site-config";
import { Activity, Heart, Shield, TrendingUp } from "lucide-react";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `Kiểm Tra Sức Khoẻ Tài Chính Cá Nhân | ${siteConfig.name}`,
  description:
    "Công cụ miễn phí: đo lường sức khoẻ tài chính cá nhân qua 11 chỉ số chia 5 nhóm — chi tiêu, thanh khoản, tích lũy, bảo vệ, cấu trúc tài sản theo tuổi. Nhận kết quả qua email + lời khuyên cá nhân hoá.",
  alternates: { canonical: `${BASE_URL}/tools/suc-khoe-tai-chinh` },
  openGraph: {
    title: "Kiểm Tra Sức Khoẻ Tài Chính Cá Nhân — Miễn phí",
    description:
      "Đo lường 11 chỉ số sức khoẻ tài chính theo 5 nhóm & nhận lời khuyên cá nhân hoá từ VINEN.",
    type: "website",
    locale: "vi_VN",
    siteName: siteConfig.name,
    // No `images` — opengraph-image.tsx in this folder auto-overrides root.
  },
};

export default function FinancialHealthPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; name?: string; phone?: string }>;
}) {
  return <FinancialHealthPageInner searchParams={searchParams} />;
}

async function FinancialHealthPageInner({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; name?: string; phone?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-5"
            style={{
              background: "rgba(37,99,235,0.12)",
              color: "#2563EB",
              border: "1px solid rgba(37,99,235,0.4)",
            }}
          >
            🧮 Công cụ miễn phí
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            Kiểm Tra Sức Khoẻ
            <br />
            <span style={{ color: "#2563EB" }}>Tài Chính Cá Nhân</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-xl mx-auto">
            5 bước — 11 chỉ số đo lường sức khoẻ tài chính theo 5 nhóm chuẩn.
            Em sẽ phân tích & gửi kết quả chi tiết kèm lời khuyên cá nhân hoá
            qua email.
          </p>
        </div>

        {/* Feature pills */}
        <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {[
            { icon: Activity, label: "Chi tiêu" },
            { icon: Shield, label: "Thanh khoản" },
            { icon: TrendingUp, label: "Tích luỹ" },
            { icon: Heart, label: "Bảo vệ" },
            { icon: Activity, label: "Cấu trúc TS" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-gray-300"
              style={{ background: "#141414", border: "1px solid #2a2a2a" }}
            >
              <f.icon size={13} className="text-[#2563EB] shrink-0" />
              <span className="truncate">{f.label}</span>
            </div>
          ))}
        </div>

        <FinancialHealthQuiz
          defaultEmail={sp.email ?? ""}
          defaultName={sp.name ?? ""}
          defaultPhone={sp.phone ?? ""}
        />

        <p className="text-center text-[11px] text-gray-500 mt-6 max-w-md mx-auto">
          🔒 Thông tin của anh/chị được mã hoá và bảo mật. Em chỉ dùng để
          phân tích & gửi kết quả qua email. Không spam, không chia sẻ
          bên thứ ba.
        </p>
      </section>
    </div>
  );
}
