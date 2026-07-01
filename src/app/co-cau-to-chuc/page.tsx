import type { Metadata } from "next";
import Image from "next/image";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { Crown, Briefcase, Lightbulb, Users, GraduationCap, Building2 } from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Cơ cấu tổ chức — ${siteConfig.name}`,
  description: "Cơ cấu tổ chức của Viện Nghiên Cứu Khởi Nghiệp (VINEN) — Hội đồng cố vấn, Ban điều hành và các bộ phận chuyên môn.",
  alternates: { canonical: `${getBaseUrl()}/co-cau-to-chuc` },
};

const DIVISIONS = [
  {
    icon: Lightbulb,
    name: "Bộ phận Nghiên cứu",
    role: "Phụ trách công bố báo cáo, white paper, dữ liệu về hệ sinh thái khởi nghiệp Việt Nam.",
    color: BRAND,
  },
  {
    icon: GraduationCap,
    name: "Bộ phận Đào tạo",
    role: "Thiết kế và vận hành 2 chương trình: Chuyên Gia Khởi Nghiệp Quốc Gia + Tinh Hoa Quản Trị & Khởi Nghiệp.",
    color: GOLD,
  },
  {
    icon: Users,
    name: "Bộ phận Mentoring",
    role: "Quản lý mạng lưới chuyên gia, ghép cặp mentor-mentee, theo dõi chất lượng session.",
    color: "#a855f7",
  },
  {
    icon: Briefcase,
    name: "Bộ phận Đối tác & Hợp tác",
    role: "Phát triển quan hệ với doanh nghiệp, quỹ đầu tư, tổ chức quốc tế.",
    color: "#10b981",
  },
  {
    icon: Building2,
    name: "Bộ phận Vận hành",
    role: "Hành chính, tài chính, truyền thông, công nghệ — đảm bảo hoạt động viện trơn tru.",
    color: "#f59e0b",
  },
];

export default function CoCauToChucPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
          style={{ color: GOLD }}
        >
          Cơ cấu VINEN
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Cơ Cấu Tổ Chức</h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto">
          Mô hình tổ chức của Viện Nghiên Cứu Khởi Nghiệp — 5 bộ phận chuyên môn dưới
          sự điều hành của Ban Lãnh đạo và Hội đồng Cố vấn.
        </p>
      </section>

      {/* Leadership */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            Ban Lãnh Đạo & Hội Đồng Cố Vấn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { role: "Chủ tịch Hội đồng Viện", color: GOLD },
              { role: "Viện trưởng", color: BRAND },
              { role: "Phó Viện trưởng", color: "#a855f7" },
            ].map((p, i) => (
              <article
                key={i}
                className="card-dark p-6 text-center"
              >
                <div
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${p.color}22`, border: `2px solid ${p.color}55` }}
                >
                  <Crown size={32} style={{ color: p.color }} />
                </div>
                <p
                  className="text-xs uppercase tracking-wider font-bold mb-1"
                  style={{ color: p.color }}
                >
                  {p.role}
                </p>
                <p className="text-base font-bold text-white mb-1">Đang cập nhật</p>
                <p className="text-xs text-gray-500">Thông tin chi tiết sẽ được công bố sau.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            5 Bộ Phận Chuyên Môn
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
            Mỗi bộ phận đảm nhận một mảng cụ thể, phối hợp tạo nên hệ sinh thái nghiên
            cứu — đào tạo — kết nối toàn diện.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {DIVISIONS.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.name} className="card-dark p-5">
                  <div
                    className="inline-flex w-11 h-11 rounded-lg items-center justify-center mb-3"
                    style={{ background: `${d.color}22`, color: d.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1.5">{d.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{d.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-12 px-4 sm:px-6 text-center">
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          Thông tin chi tiết về nhân sự sẽ được cập nhật khi Viện chính thức công bố.
          Liên hệ <a href={`mailto:${siteConfig.support.email}`} style={{ color: GOLD }} className="underline">{siteConfig.support.email}</a> để biết thêm.
        </p>
      </section>
    </div>
  );
}
