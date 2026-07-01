import type { Metadata } from "next";
import Link from "next/link";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { ArrowRight, Info, Briefcase, Crown, Users } from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Giới thiệu — ${siteConfig.name}`,
  description: `Giới thiệu về Viện Nghiên Cứu Khởi Nghiệp (VINEN) — Về chúng tôi, Chức năng nhiệm vụ, Ban lãnh đạo, Ban cố vấn cao cấp.`,
  alternates: { canonical: `${getBaseUrl()}/gioi-thieu` },
};

const CARDS = [
  {
    href: "/gioi-thieu/ve-chung-toi",
    icon: Info,
    title: "Về chúng tôi",
    desc: "Câu chuyện hình thành, tầm nhìn 2030, sứ mệnh và giá trị cốt lõi của VINEN.",
    color: BRAND,
  },
  {
    href: "/gioi-thieu/chuc-nang-nhiem-vu",
    icon: Briefcase,
    title: "Chức năng & nhiệm vụ",
    desc: "6 lĩnh vực hoạt động cốt lõi và 5 bộ phận chuyên môn của Viện.",
    color: GOLD,
  },
  {
    href: "/gioi-thieu/ban-lanh-dao",
    icon: Crown,
    title: "Ban lãnh đạo Viện",
    desc: "Chủ tịch Hội đồng, Viện trưởng và các Phó Viện trưởng phụ trách chuyên môn.",
    color: "#a855f7",
  },
  {
    href: "/gioi-thieu/ban-co-van",
    icon: Users,
    title: "Ban cố vấn cao cấp",
    desc: "Mạng lưới chuyên gia, nhà đầu tư và doanh nhân đồng hành định hướng chiến lược cho Viện.",
    color: "#10b981",
  },
];

export default function GioiThieuHubPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
          Viện Nghiên Cứu Khởi Nghiệp · Founded 2023
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Giới thiệu VINEN</h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto italic" style={{ color: GOLD }}>
          &ldquo;Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân&rdquo;
        </p>
      </section>

      {/* 4 cards */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.href}
                href={c.href}
                className="card-dark p-6 group transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 inline-flex w-12 h-12 rounded-lg items-center justify-center"
                    style={{ background: `${c.color}22`, color: c.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-1.5">{c.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-3">{c.desc}</p>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold"
                      style={{ color: c.color }}
                    >
                      Tìm hiểu thêm <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
