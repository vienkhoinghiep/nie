import type { Metadata } from "next";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { Users, Star, Award, Lightbulb } from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Ban cố vấn cao cấp — ${siteConfig.name}`,
  description: `Mạng lưới Cố vấn cấp cao của Viện Nghiên Cứu Khởi Nghiệp (VINEN) — chuyên gia, nhà đầu tư, doanh nhân hàng đầu.`,
  alternates: { canonical: `${getBaseUrl()}/gioi-thieu/ban-co-van` },
};

const ADVISOR_GROUPS = [
  {
    title: "Cố vấn Chuyên môn",
    desc: "Giáo sư, tiến sĩ, chuyên gia đầu ngành trong các lĩnh vực: tài chính, công nghệ, marketing, pháp lý...",
    icon: Lightbulb,
    color: BRAND,
  },
  {
    title: "Cố vấn Doanh nghiệp",
    desc: "Các founder, CEO, COO của doanh nghiệp lớn — chia sẻ kinh nghiệm vận hành và scaling từ thực tiễn.",
    icon: Star,
    color: GOLD,
  },
  {
    title: "Cố vấn Đầu tư",
    desc: "Đối tác từ các quỹ đầu tư mạo hiểm, angel investor — hỗ trợ founder kết nối với nhà đầu tư phù hợp.",
    icon: Award,
    color: "#a855f7",
  },
];

export default function BanCoVanPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
          Giới thiệu · Ban cố vấn
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Ban Cố Vấn Cao Cấp</h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto">
          Mạng lưới các chuyên gia, doanh nhân và nhà đầu tư hàng đầu đồng hành định
          hướng chiến lược và đảm bảo chất lượng học thuật cho VINEN.
        </p>
      </section>

      {/* 3 advisor groups */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            3 nhóm Cố vấn
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
            VINEN xây dựng mạng lưới cố vấn đa chiều — kết hợp tri thức học thuật, kinh
            nghiệm thực tiễn và góc nhìn đầu tư.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ADVISOR_GROUPS.map((g) => {
              const Icon = g.icon;
              return (
                <article key={g.title} className="card-dark p-6">
                  <div
                    className="inline-flex w-12 h-12 rounded-lg items-center justify-center mb-4"
                    style={{ background: `${g.color}22`, color: g.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{g.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{g.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coming soon block */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-3xl mx-auto">
          <Users size={48} className="mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-2xl font-bold text-white mb-3">
            Danh sách Cố vấn đang được công bố
          </h2>
          <p className="text-gray-400 mb-6">
            VINEN sẽ giới thiệu chi tiết từng Cố vấn cao cấp cùng tiểu sử, lĩnh vực
            chuyên môn và đóng góp cho Viện trong thời gian tới.
          </p>
          <a
            href={`mailto:${siteConfig.support.email}?subject=Quan%20t%C3%A2m%20gia%20nh%E1%BA%ADp%20Ban%20C%E1%BB%91%20v%E1%BA%A5n%20VINEN`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
            style={{ background: GOLD, color: NAVY, boxShadow: `0 8px 24px ${GOLD}44` }}
          >
            Đề xuất tham gia Ban Cố vấn
          </a>
        </div>
      </section>
    </div>
  );
}
