import type { Metadata } from "next";
import Link from "next/link";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import {
  CheckCircle2,
  Users,
  Calendar,
  TrendingUp,
  ArrowRight,
  MessageCircle,
  Target,
  Lightbulb,
} from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Dành cho Mentee — ${siteConfig.name}`,
  description: `Tìm Mentor 1-1 phù hợp với hành trình khởi nghiệp của bạn — chuyên gia, founder, nhà đầu tư hàng đầu Việt Nam.`,
  alternates: { canonical: `${getBaseUrl()}/mentor-khoi-nghiep/mentee` },
};

const BENEFITS = [
  {
    icon: Target,
    title: "Tránh sai lầm tốn kém",
    desc: "Học từ kinh nghiệm thực tế của Mentor — không phải tự trải nghiệm và trả giá.",
    color: BRAND,
  },
  {
    icon: TrendingUp,
    title: "Rút ngắn lộ trình 6-12 tháng",
    desc: "1 giờ với Mentor đúng người có thể tiết kiệm hàng tháng tự mò mẫm.",
    color: GOLD,
  },
  {
    icon: Users,
    title: "Mở rộng mạng lưới",
    desc: "Mentor giới thiệu bạn tới đồng nghiệp, nhà đầu tư, đối tác phù hợp.",
    color: "#a855f7",
  },
  {
    icon: Lightbulb,
    title: "Có người để chia sẻ",
    desc: "Founder thường cô đơn. Mentor là người hiểu áp lực và đồng hành.",
    color: "#10b981",
  },
];

const STEPS = [
  { n: 1, title: "Đăng ký tài khoản", desc: "Tạo tài khoản miễn phí trên VINEN — chỉ mất 1 phút." },
  { n: 2, title: "Khám phá Mentor", desc: "Lọc theo lĩnh vực, kinh nghiệm, ngôn ngữ. Đọc bio + đánh giá từ Mentee trước." },
  { n: 3, title: "Đặt lịch session", desc: "Chọn ngày giờ + nêu chủ đề + mục tiêu. Mentor xác nhận trong 24h." },
  { n: 4, title: "Tham gia session", desc: "Gặp Mentor qua Google Meet/Zoom. Note + ghi âm để xem lại." },
  { n: 5, title: "Đánh giá + tiếp tục", desc: "Sau session bạn rate Mentor. Đặt lịch session tiếp theo nếu muốn." },
];

export default function MenteePage() {
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
            Dành cho Mentee
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Tìm <span style={{ color: GOLD }}>Mentor đồng hành</span>
            <br />
            cho hành trình khởi nghiệp
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-7 leading-relaxed">
            Kết nối 1-1 với các chuyên gia, founder, nhà đầu tư hàng đầu Việt Nam.
            Học hỏi từ kinh nghiệm thực tế và rút ngắn lộ trình thành công của bạn.
          </p>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
            style={{ background: GOLD, color: NAVY, boxShadow: `0 10px 32px ${GOLD}55` }}
          >
            <Users size={16} /> Khám phá danh sách Mentor
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            4 lý do bạn cần Mentor
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
            90% founder thành công đều có ít nhất 1 Mentor đồng hành trong giai đoạn early.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="card-dark p-5 text-center">
                  <div
                    className="inline-flex w-12 h-12 rounded-xl items-center justify-center mb-3"
                    style={{ background: `${b.color}22`, color: b.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{b.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5 steps */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            5 bước để bắt đầu
          </h2>
          <p className="text-center text-gray-400 mb-10">
            Đơn giản, nhanh — bạn có thể đặt lịch session đầu tiên trong 5 phút.
          </p>
          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="card-dark p-5 flex gap-4 items-start"
              >
                <div
                  className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-lg"
                  style={{ background: GOLD, color: NAVY }}
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

      {/* What Mentor can help with */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Mentor có thể giúp bạn về gì?
          </h2>
          <p className="text-center text-gray-400 mb-10">
            10 lĩnh vực chuyên môn — chọn mentor phù hợp với nhu cầu cụ thể của bạn.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              "Gọi vốn",
              "Go-to-market",
              "Sản phẩm",
              "Kỹ thuật & công nghệ",
              "Tài chính & vận hành",
              "Pháp lý & cấu trúc",
              "Nhân sự & văn hoá",
              "Marketing & thương hiệu",
              "Mở rộng quốc tế",
              "Bền vững & ESG",
            ].map((x, i) => (
              <div
                key={x}
                className="rounded-lg p-3 text-center text-sm font-semibold"
                style={{
                  background: `${BRAND}0d`,
                  border: `1px solid ${BRAND}33`,
                  color: "#e5e7eb",
                }}
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Sẵn sàng bắt đầu?</h2>
          <p className="text-gray-400 mb-6">
            Tham gia VINEN, khám phá Mentor phù hợp và đặt session đầu tiên hôm nay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/mentors"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider"
              style={{ background: GOLD, color: NAVY }}
            >
              <Users size={16} /> Khám phá Mentor
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider border-2"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <ArrowRight size={16} /> Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
