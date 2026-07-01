import type { Metadata } from "next";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { Crown, User } from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Ban lãnh đạo Viện — ${siteConfig.name}`,
  description: `Ban lãnh đạo Viện Nghiên Cứu Khởi Nghiệp (VINEN): Chủ tịch Hội đồng, Viện trưởng, Phó Viện trưởng.`,
  alternates: { canonical: `${getBaseUrl()}/gioi-thieu/ban-lanh-dao` },
};

const LEADERS = [
  { role: "Chủ tịch Hội đồng Viện", color: GOLD, icon: Crown },
  { role: "Viện trưởng", color: BRAND, icon: User },
  { role: "Phó Viện trưởng phụ trách Nghiên cứu", color: "#a855f7", icon: User },
  { role: "Phó Viện trưởng phụ trách Đào tạo", color: "#10b981", icon: User },
];

export default function BanLanhDaoPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
          Giới thiệu · Ban lãnh đạo
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Ban Lãnh Đạo Viện</h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto">
          Đội ngũ lãnh đạo cấp cao của VINEN — định hướng chiến lược, dẫn dắt hoạt động
          nghiên cứu, đào tạo và phát triển mạng lưới.
        </p>
      </section>

      {/* Leadership grid */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LEADERS.map((l, i) => {
              const Icon = l.icon;
              return (
                <article key={i} className="card-dark p-6 sm:p-8 text-center">
                  <div
                    className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{ background: `${l.color}22`, border: `2px solid ${l.color}` }}
                  >
                    <Icon size={36} style={{ color: l.color }} />
                  </div>
                  <p
                    className="text-xs uppercase tracking-wider font-bold mb-2"
                    style={{ color: l.color }}
                  >
                    {l.role}
                  </p>
                  <p className="text-lg font-bold text-white mb-1">Đang cập nhật</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Thông tin chi tiết về nhân sự sẽ được công bố trong thời gian tới.
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 px-4 sm:px-6 text-center" style={{ background: `${NAVY}22` }}>
        <p className="text-sm text-gray-400 max-w-xl mx-auto">
          Liên hệ với Ban lãnh đạo Viện:{" "}
          <a href={`mailto:${siteConfig.support.email}`} style={{ color: GOLD }} className="underline">
            {siteConfig.support.email}
          </a>
        </p>
      </section>
    </div>
  );
}
