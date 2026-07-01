import type { Metadata } from "next";
import Link from "next/link";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import {
  Crown,
  CheckCircle2,
  Heart,
  TrendingUp,
  Star,
  Award,
  ArrowRight,
  Mail,
} from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Trở thành Mentor — ${siteConfig.name}`,
  description: `Tham gia mạng lưới Mentor VINEN — chia sẻ kinh nghiệm, đồng hành cùng founder thế hệ mới và mở rộng tầm ảnh hưởng.`,
  alternates: { canonical: `${getBaseUrl()}/mentor-khoi-nghiep/mentor` },
};

const REASONS = [
  {
    icon: Heart,
    title: "Cho đi để nhận lại",
    desc: "Chia sẻ kinh nghiệm là cách tốt nhất để hệ thống hoá tri thức và rèn luyện kỹ năng coaching.",
    color: "#ef4444",
  },
  {
    icon: TrendingUp,
    title: "Mở rộng tầm ảnh hưởng",
    desc: "Tiếp cận thế hệ founder mới, xây dựng thương hiệu cá nhân trong cộng đồng khởi nghiệp.",
    color: BRAND,
  },
  {
    icon: Star,
    title: "Nguồn deal flow chất lượng",
    desc: "Phát hiện các founder và startup tiềm năng sớm — cơ hội đầu tư hoặc hợp tác tự nhiên.",
    color: GOLD,
  },
  {
    icon: Award,
    title: "Được vinh danh",
    desc: "Mentor VINEN được giới thiệu trên website, sự kiện, báo chí — gắn thương hiệu cá nhân với VINEN.",
    color: "#a855f7",
  },
];

const CRITERIA = [
  "Tối thiểu 5+ năm kinh nghiệm trong lĩnh vực chuyên môn",
  "Đã từng làm founder/co-founder, executive, hoặc nhà đầu tư",
  "Có thành tựu hoặc câu chuyện thực tế đáng chia sẻ",
  "Cam kết tối thiểu 4 session/tháng (mỗi session 30-90 phút)",
  "Văn hoá đồng hành — sẵn sàng lắng nghe, không phán xét",
  "Đồng ý chính sách bảo mật thông tin Mentee",
];

const PROCESS = [
  { n: 1, title: "Gửi đề xuất", desc: "Email tới VINEN kèm CV/LinkedIn + lĩnh vực muốn mentor + 3 chủ đề bạn có thể chia sẻ sâu nhất." },
  { n: 2, title: "Phỏng vấn 30 phút", desc: "Đội ngũ VINEN trao đổi để hiểu phong cách + đảm bảo phù hợp văn hoá Viện." },
  { n: 3, title: "Onboard", desc: "VINEN tạo profile mentor, hướng dẫn cách quản lý lịch + nhận booking từ Mentee." },
  { n: 4, title: "Mentoring chính thức", desc: "Bắt đầu nhận session từ Mentee. VINEN hỗ trợ quản lý lịch + thu phí (nếu có)." },
];

export default function BecomeMentorPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
            style={{ color: GOLD }}
          >
            Trở thành Mentor VINEN
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Cùng VINEN <span style={{ color: GOLD }}>kiến tạo doanh nhân</span>
            <br />
            thế hệ mới
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-7 leading-relaxed">
            Tham gia mạng lưới Mentor VINEN — chia sẻ kinh nghiệm với các founder
            đang trên hành trình xây dựng doanh nghiệp.
          </p>
          <a
            href={`mailto:${siteConfig.support.email}?subject=%C4%90%C4%83ng%20k%C3%BD%20l%C3%A0m%20Mentor%20VINEN`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
            style={{ background: GOLD, color: NAVY, boxShadow: `0 10px 32px ${GOLD}55` }}
          >
            <Crown size={16} /> Đăng ký làm Mentor
          </a>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            4 lý do làm Mentor VINEN
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
            Mentoring không chỉ là cho đi — đó là cách phát triển bản thân và mở rộng
            mạng lưới chuyên nghiệp.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="card-dark p-5 text-center">
                  <div
                    className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-3"
                    style={{ background: `${r.color}22`, color: r.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{r.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Criteria */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Tiêu chí trở thành Mentor
          </h2>
          <p className="text-center text-gray-400 mb-10">
            VINEN tuyển chọn Mentor kỹ lưỡng để đảm bảo chất lượng cho Mentee.
          </p>
          <ul className="space-y-3">
            {CRITERIA.map((c, i) => (
              <li
                key={i}
                className="card-dark p-4 flex items-start gap-3"
              >
                <CheckCircle2 size={20} className="shrink-0 mt-0.5" style={{ color: GOLD }} />
                <span className="text-sm text-gray-200 leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            4 bước onboard
          </h2>
          <p className="text-center text-gray-400 mb-10">
            Từ lúc gửi đề xuất đến khi bắt đầu nhận session đầu tiên — trung bình 2 tuần.
          </p>
          <ol className="space-y-4">
            {PROCESS.map((s) => (
              <li key={s.n} className="card-dark p-5 flex gap-4 items-start">
                <div
                  className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg"
                  style={{ background: BRAND, color: "#fff" }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <div className="max-w-2xl mx-auto">
          <Crown size={48} className="mx-auto mb-4" style={{ color: GOLD }} />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Sẵn sàng đồng hành cùng VINEN?</h2>
          <p className="text-gray-400 mb-6">
            Gửi email kèm CV/LinkedIn — chúng tôi phản hồi trong 3 ngày làm việc.
          </p>
          <a
            href={`mailto:${siteConfig.support.email}?subject=%C4%90%C4%83ng%20k%C3%BD%20l%C3%A0m%20Mentor%20VINEN&body=H%E1%BB%8D%20t%C3%AAn%3A%0AL%C4%A9nh%20v%E1%BB%B1c%20chuy%C3%AAn%20m%C3%B4n%3A%0AS%E1%BB%91%20n%C4%83m%20kinh%20nghi%E1%BB%87m%3A%0ALinkedIn%3A%0A3%20ch%E1%BB%A7%20%C4%91%E1%BB%81%20c%C3%B3%20th%E1%BB%83%20chia%20s%E1%BA%BB%20s%C3%A2u%20nh%E1%BA%A5t%3A%0A1.%0A2.%0A3.`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
            style={{ background: GOLD, color: NAVY, boxShadow: `0 10px 32px ${GOLD}55` }}
          >
            <Mail size={16} /> Gửi đề xuất qua email
          </a>
        </div>
      </section>
    </div>
  );
}
