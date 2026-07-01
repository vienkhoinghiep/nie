import type { Metadata } from "next";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import {
  Lightbulb,
  GraduationCap,
  Users,
  Briefcase,
  Handshake,
  Award,
  Building2,
} from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Chức năng & nhiệm vụ — ${siteConfig.name}`,
  description: `6 lĩnh vực hoạt động và 5 bộ phận chuyên môn của Viện Nghiên Cứu Khởi Nghiệp (VINEN).`,
  alternates: { canonical: `${getBaseUrl()}/gioi-thieu/chuc-nang-nhiem-vu` },
};

const FUNCTIONS = [
  { icon: Lightbulb, title: "Nghiên cứu khoa học", desc: "Công bố báo cáo chuyên sâu về xu hướng khởi nghiệp, gọi vốn, scaling tại Việt Nam và khu vực Đông Nam Á.", color: BRAND },
  { icon: GraduationCap, title: "Đào tạo bài bản", desc: "2 chương trình lớn: Chuyên Gia Khởi Nghiệp Quốc Gia + Tinh Hoa Quản Trị & Khởi Nghiệp với 10 môn cốt lõi.", color: "#3b82f6" },
  { icon: Users, title: "Mentoring 1-1", desc: "Kết nối founder với chuyên gia, founder thành công, nhà đầu tư phù hợp theo từng nhu cầu cụ thể.", color: GOLD },
  { icon: Briefcase, title: "Tư vấn chuyên môn", desc: "Tư vấn chiến lược cho startup từ giai đoạn pre-seed đến series A, B.", color: "#a855f7" },
  { icon: Handshake, title: "Networking & Kết nối", desc: "Sự kiện, demo day, founder dinner — kết nối founder với nhà đầu tư và đồng nghiệp.", color: "#10b981" },
  { icon: Award, title: "Vinh danh & Giải thưởng", desc: "Tôn vinh các founder và startup tiêu biểu, lan toả câu chuyện thành công.", color: "#f59e0b" },
];

const DIVISIONS = [
  { icon: Lightbulb, name: "Bộ phận Nghiên cứu", role: "Phụ trách công bố báo cáo, white paper, dữ liệu về hệ sinh thái khởi nghiệp Việt Nam.", color: BRAND },
  { icon: GraduationCap, name: "Bộ phận Đào tạo", role: "Thiết kế và vận hành 2 chương trình: Chuyên Gia Khởi Nghiệp Quốc Gia + Tinh Hoa Quản Trị & Khởi Nghiệp.", color: GOLD },
  { icon: Users, name: "Bộ phận Mentoring", role: "Quản lý mạng lưới chuyên gia, ghép cặp mentor-mentee, theo dõi chất lượng session.", color: "#a855f7" },
  { icon: Briefcase, name: "Bộ phận Đối tác & Hợp tác", role: "Phát triển quan hệ với doanh nghiệp, quỹ đầu tư, tổ chức quốc tế.", color: "#10b981" },
  { icon: Building2, name: "Bộ phận Vận hành", role: "Hành chính, tài chính, truyền thông, công nghệ — đảm bảo hoạt động viện trơn tru.", color: "#f59e0b" },
];

export default function ChucNangNhiemVuPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
          Giới thiệu · Chức năng & nhiệm vụ
        </p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Chức Năng & Nhiệm Vụ</h1>
        <p className="text-base text-gray-400 max-w-2xl mx-auto">
          VINEN hoạt động trên 6 lĩnh vực chính, phối hợp bởi 5 bộ phận chuyên môn để
          phục vụ toàn diện cộng đồng khởi nghiệp Việt Nam.
        </p>
      </section>

      {/* 6 functions */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            6 Lĩnh Vực Hoạt Động
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FUNCTIONS.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card-dark p-5 transition-transform hover:-translate-y-0.5"
                >
                  <div
                    className="inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3"
                    style={{ background: `${f.color}1f`, color: f.color }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1.5">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 divisions */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            5 Bộ Phận Chuyên Môn
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
            Mỗi bộ phận đảm nhận một mảng cụ thể, tạo nên hệ sinh thái vận hành toàn diện.
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
    </div>
  );
}
