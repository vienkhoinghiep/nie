import type { Metadata } from "next";
import Link from "next/link";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { ArrowRight, Users, GraduationCap, Crown } from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Mentor Khởi Nghiệp — ${siteConfig.name}`,
  description: `Chương trình Mentor Khởi Nghiệp VINEN — kết nối Mentee với Mentor 1-1. Bạn cần mentor hay muốn trở thành mentor?`,
  alternates: { canonical: `${getBaseUrl()}/mentor-khoi-nghiep` },
};

const PATHS = [
  {
    href: "/mentor-khoi-nghiep/mentee",
    icon: GraduationCap,
    eyebrow: "Tôi là Mentee",
    title: "Tìm Mentor đồng hành",
    desc: "Bạn là founder, sinh viên hoặc người mới khởi nghiệp — đang tìm chuyên gia, người đi trước để học hỏi, được góp ý và rút ngắn lộ trình.",
    cta: "Khám phá Mentor",
    color: BRAND,
  },
  {
    href: "/mentor-khoi-nghiep/mentor",
    icon: Crown,
    eyebrow: "Tôi muốn làm Mentor",
    title: "Trở thành Mentor VINEN",
    desc: "Bạn là founder thành công, nhà đầu tư, chuyên gia có 5+ năm kinh nghiệm — sẵn sàng chia sẻ và đồng hành cùng thế hệ doanh nhân mới.",
    cta: "Đăng ký làm Mentor",
    color: GOLD,
  },
];

export default function MentorHubPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
          Chương trình Mentor Khởi Nghiệp
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 leading-tight">
          Mentor <span style={{ color: GOLD }}>Khởi Nghiệp</span>
        </h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto">
          Kết nối 1-1 giữa người cần học hỏi và người đã đi trước — nền tảng mentoring
          chuyên sâu cho cộng đồng khởi nghiệp Việt Nam.
        </p>
      </section>

      {/* 2 paths */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold mb-3">
            Bạn thuộc nhóm nào?
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-xl mx-auto">
            Chọn vai trò phù hợp để bắt đầu hành trình mentoring cùng VINEN.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PATHS.map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className="card-dark p-6 sm:p-8 flex flex-col group transition-transform hover:-translate-y-1"
                  style={{ borderColor: `${p.color}55` }}
                >
                  <div
                    className="inline-flex w-14 h-14 rounded-xl items-center justify-center mb-5"
                    style={{ background: `${p.color}22`, color: p.color }}
                  >
                    <Icon size={28} />
                  </div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: p.color }}
                  >
                    {p.eyebrow}
                  </p>
                  <h3 className="font-bold text-white text-xl mb-3 leading-tight">{p.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-5 flex-1">{p.desc}</p>
                  <span
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider self-start"
                    style={{ color: p.color }}
                  >
                    {p.cta} <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bridge */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-3xl mx-auto">
          <Users size={40} className="mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-2xl font-bold mb-2">VINEN đang xây dựng mạng lưới Mentor</h2>
          <p className="text-gray-400 mb-6">
            Hiện chúng tôi mời các chuyên gia, founder thành công và nhà đầu tư hàng đầu
            tham gia mạng lưới. Mọi câu hỏi liên hệ:{" "}
            <a href={`mailto:${siteConfig.support.email}`} className="underline" style={{ color: GOLD }}>
              {siteConfig.support.email}
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
