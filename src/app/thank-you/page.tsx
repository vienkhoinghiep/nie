import type { Metadata } from "next";
import FinancialHealthQuiz from "@/components/tools/FinancialHealthQuiz";
import { siteConfig } from "@/lib/site-config";
import { CheckCircle2, Sparkles, Mail, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: `Cảm ơn — ${siteConfig.name}`,
  description: "Cảm ơn anh/chị đã đăng ký. Làm bài kiểm tra sức khoẻ tài chính ngay để nhận lời khuyên cá nhân hoá.",
  robots: { index: false, follow: false },
};

export default function ThankYouPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; name?: string; phone?: string }>;
}) {
  return <ThankYouInner searchParams={searchParams} />;
}

async function ThankYouInner({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; name?: string; phone?: string }>;
}) {
  const sp = (await searchParams) ?? {};

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <section className="px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success header */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-5"
              style={{ background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.4)" }}
            >
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
              style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.4)" }}
            >
              <Gift size={11} />
              Đăng ký thành công
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
              Cảm ơn{sp.name ? ` ${sp.name}` : ""}!
            </h1>
            <p className="text-base text-gray-400 leading-relaxed max-w-xl mx-auto mb-6">
              Email chương trình đang được gửi tới <strong className="text-white">{sp.email || "hộp thư của anh/chị"}</strong>.
              Trong khi chờ, hãy thực hiện <strong className="text-[#2563EB]">bài kiểm tra sức khoẻ tài chính nhanh</strong> để
              nhận kết quả chi tiết + lời khuyên cá nhân hoá.
            </p>

            {/* 3 benefit pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { icon: Sparkles, label: "8 câu hỏi · 2 phút" },
                { icon: Mail, label: "Kết quả gửi qua email" },
                { icon: Gift, label: "Hoàn toàn miễn phí" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-gray-300"
                  style={{ background: "#141414", border: "1px solid #2a2a2a" }}
                >
                  <b.icon size={11} className="text-[#2563EB]" />
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Quiz embedded */}
          <FinancialHealthQuiz
            defaultEmail={sp.email ?? ""}
            defaultName={sp.name ?? ""}
            defaultPhone={sp.phone ?? ""}
          />

          <p className="text-center text-[11px] text-gray-500 mt-6 max-w-md mx-auto">
            🔒 Bảo mật: dữ liệu của anh/chị chỉ dùng để phân tích & gửi kết quả.
          </p>
        </div>
      </section>
    </div>
  );
}
