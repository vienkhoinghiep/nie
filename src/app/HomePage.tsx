"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Sparkles,
  PlayCircle,
  Landmark,
  Users,
  TrendingUp as TrendUp,
  Target,
  Mic,
  Rocket,
  Gift,
  X,
  MessageCircle,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";

const TESTIMONIAL_STATS = [
  { value: "1,000+", label: "Nhà khởi nghiệp" },
  { value: "500+", label: "Đánh giá 5★" },
  { value: "98%", label: "Hài lòng & giới thiệu" },
  { value: "4.9/5", label: "Mức độ hài lòng" },
];

const TESTIMONIALS = [
  {
    initials: "MH",
    name: "Trần Minh Hùng",
    role: "Founder agency marketing",
    quote:
      "Sau 3 tháng theo lộ trình của VINEN, tôi tách bạch hoàn toàn tiền cá nhân và công ty, tự trả lương đều đặn. Áp lực gia đình giảm rõ rệt.",
    metric: "Quỹ dự phòng 6 tháng",
  },
  {
    initials: "LA",
    name: "Lê Hoàng Anh",
    role: "Chủ chuỗi F&B",
    quote:
      "Trước đây tôi đốt cả tiền tiết kiệm gia đình vào công ty. Học khóa 'Kiểm tra sức khỏe tài chính' xong tôi mới nhận ra mình đang đứng trên miệng vực.",
    metric: "Cắt giảm 35% chi phí cá nhân",
  },
  {
    initials: "PV",
    name: "Phạm Văn Vinh",
    role: "Co-founder SaaS",
    quote:
      "VINEN giúp tôi xây quỹ dự phòng riêng cho gia đình trước khi dồn tiền vào round gọi vốn tiếp theo. Giờ tôi pitch nhà đầu tư trong tâm thế bình an.",
    metric: "Tăng net worth cá nhân 2.4x/năm",
  },
  {
    initials: "NT",
    name: "Nguyễn Thị Thanh Trang",
    role: "Founder thương hiệu mỹ phẩm",
    quote:
      "Tôi từng xem nhẹ bảo hiểm và hưu trí, dồn 100% vào DN. Sau khóa học, tôi đã thiết kế lại danh mục tài sản — an tâm hơn rất nhiều.",
    metric: "Hoàn thành kế hoạch hưu trí 20 năm",
  },
  {
    initials: "DA",
    name: "Đoàn Đức An",
    role: "Founder ecommerce",
    quote:
      "AI Agent và phương pháp dòng tiền của Thầy Tuệ giúp tôi tự động hóa 80% việc theo dõi tài chính cá nhân. Mỗi tuần chỉ cần check 15 phút.",
    metric: "Tiết kiệm 8h/tuần",
  },
  {
    initials: "VL",
    name: "Vũ Thị Lan",
    role: "Founder studio thiết kế",
    quote:
      "Tôi đã ngừng vay thẻ tín dụng để nuôi DN. VINEN giúp tôi nhìn rõ điểm gãy và xây quỹ khẩn cấp riêng. Quyết định kinh doanh sáng suốt hơn hẳn.",
    metric: "Hết nợ tiêu dùng trong 7 tháng",
  },
];

const ROADMAP_PHASES = [
  {
    phase: "Phần 1",
    phaseTitle: "Thiết lập Nền tảng & Dòng tiền",
    color: "#06b6d4",
    steps: [
      {
        icon: "🩺",
        title: "Kiểm tra sức khỏe tài chính",
        desc: "Đánh giá toàn diện thu nhập, chi phí, nợ và mức độ an toàn hiện tại.",
      },
      {
        icon: "🧠",
        title: "Thay đổi nhận thức và tư duy tài chính",
        desc: "Nhận diện lại cách tư duy về tiền và rủi ro để ra quyết định sáng suốt.",
      },
      {
        icon: "💧",
        title: "Hoạch định dòng tiền cá nhân",
        desc: "Thiết lập kế hoạch thu chi, lương founder và các quỹ tích lũy gia đình.",
      },
    ],
  },
  {
    phase: "Phần 2",
    phaseTitle: "Bảo vệ & Tăng trưởng Bền vững",
    color: "#2563EB",
    steps: [
      {
        icon: "🛡️",
        title: "Hoạch định rủi ro tài chính",
        desc: "Chuẩn bị trước cho các biến cố như giảm doanh thu hoặc khủng hoảng kinh doanh.",
      },
      {
        icon: "🌱",
        title: "Xây dựng kế hoạch đầu tư",
        desc: "Phân bổ tiền thông minh để tài sản tăng trưởng bền vững theo thời gian.",
      },
      {
        icon: "🏝️",
        title: "Chuẩn bị nguồn lực hưu trí",
        desc: "Đảm bảo sự an toàn và tự do tài chính dài hạn sau khi rời doanh nghiệp.",
      },
    ],
  },
];

const MISTAKES = [
  {
    icon: "🔀",
    title: "Không tách biệt tiền cá nhân và tiền doanh nghiệp",
    desc: "Dùng chung tài khoản, lấy tiền cá nhân bù cho công ty hoặc rút tiền công ty chi tiêu cá nhân khiến founder không biết thật sự mình đang lãi hay lỗ.",
  },
  {
    icon: "💼",
    title: "Không tự trả lương cho chính mình",
    desc: "Nhiều founder làm việc không lương trong thời gian dài, khiến tài chính gia đình áp lực, tinh thần kiệt sức và dễ ra quyết định sai lầm.",
  },
  {
    icon: "🛟",
    title: "Không có quỹ dự phòng cá nhân",
    desc: "Khi toàn bộ tiền đều dồn vào doanh nghiệp, chỉ một biến cố về doanh thu, sức khỏe hoặc gia đình cũng có thể khiến founder rơi vào khủng hoảng.",
  },
  {
    icon: "🎰",
    title: "Tất tay toàn bộ tài sản vào doanh nghiệp",
    desc: "Đổ hết tiền tiết kiệm, vay mượn hoặc cầm cố tài sản gia đình để khởi nghiệp khiến founder mất vùng an toàn tài chính nếu dự án thất bại.",
  },
  {
    icon: "🛡️",
    title: "Xem nhẹ bảo hiểm và kế hoạch hưu trí",
    desc: "Nhiều nhà khởi nghiệp mải xây công ty nhưng quên bảo vệ bản thân, gia đình và tương lai tài chính dài hạn.",
  },
  {
    icon: "💳",
    title: "Dùng nợ cá nhân để nuôi doanh nghiệp",
    desc: "Vay tiêu dùng, quẹt thẻ tín dụng, vay thấu chi để bù dòng tiền công ty dễ khiến founder rơi vào vòng xoáy nợ lãi cao.",
  },
];

function HeroVideo({ youtubeId, startSeconds }: { youtubeId: string; startSeconds?: number }) {
  const [playing, setPlaying] = useState(false);

  if (youtubeId) {
    if (playing) {
      // Click-to-play: chỉ load iframe khi user bấm — tránh overlay "Xem trên YouTube"
      // của thumbnail mặc định YouTube và load nhẹ hơn cho trang chủ.
      const params = new URLSearchParams({
        rel: "0",
        modestbranding: "1",
        autoplay: "1",
        playsinline: "1",
      });
      if (startSeconds && startSeconds > 0) params.set("start", String(startSeconds));
      return (
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#2a2a2a] bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?${params.toString()}`}
              title="Video giới thiệu VINEN"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mt-10 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Phát video giới thiệu VINEN"
          className="group relative aspect-video w-full rounded-xl overflow-hidden border border-[#2a2a2a] bg-black cursor-pointer block"
        >
          <Image
            src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
            alt="Video giới thiệu VINEN"
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
          />
          <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: "#2563EB", boxShadow: "0 10px 40px rgba(37,99,235,0.5)" }}
            >
              <svg viewBox="0 0 24 24" fill="black" className="w-9 h-9 sm:w-11 sm:h-11 ml-1" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    );
  }
  // Placeholder when no video set yet
  return (
    <div className="mt-10 max-w-3xl mx-auto">
      <div
        className="relative aspect-video rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
          border: "1px dashed rgba(37,99,235,0.35)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "rgba(37,99,235,0.12)" }}
        >
          <PlayCircle size={36} style={{ color: "#2563EB" }} />
        </div>
        <div className="text-center px-4">
          <p className="text-white font-semibold text-base sm:text-lg">Video giới thiệu VINEN</p>
          <p className="text-gray-500 text-sm mt-1">Sắp ra mắt — đang trong quá trình sản xuất</p>
        </div>
      </div>
    </div>
  );
}

const PILLARS = [
  {
    icon: GraduationCap,
    title: "Tư duy tài chính",
    desc: "Nền tảng nhận thức và tư duy đúng về tiền, rủi ro và quyết định tài chính của founder.",
  },
  {
    icon: Wallet,
    title: "Dòng tiền cá nhân",
    desc: "Lập kế hoạch chi tiêu, quỹ dự phòng và tách bạch tài chính cá nhân — doanh nghiệp.",
  },
  {
    icon: TrendingUp,
    title: "Đầu tư & tích lũy",
    desc: "Phân bổ tài sản theo giai đoạn, kỷ luật đầu tư dài hạn, tránh bẫy đầu cơ.",
  },
  {
    icon: ShieldCheck,
    title: "Quản trị rủi ro & thuế",
    desc: "Bảo hiểm đúng, tối ưu thuế hợp pháp, bảo vệ thành quả gây dựng được.",
  },
];

export default function HomePage() {
  const brand = siteConfig.colors.brand;
  const brandHover = siteConfig.colors.brandHover;

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <PublicHeader />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              background: "rgba(37,99,235,0.10)",
              border: "1px solid rgba(37,99,235,0.25)",
              color: brandHover,
            }}
          >
            <Sparkles size={14} /> Hơn 1.000 Doanh chủ đã thay đổi tư duy tài chính cùng với {siteConfig.name}
          </div>
          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5 px-2">
            <span className="text-white">Làm Chủ</span>{" "}
            <span style={{ color: brand }}>Tài Chính Cá Nhân</span>
            <span className="hidden sm:inline"><br /></span>{" "}
            <span style={{ color: brand }}>Kiến Tạo Dòng Tiền</span>{" "}
            <span className="text-white">Bền Vững Cho</span>{" "}
            <span style={{ color: brand }}>Nhà Khởi Nghiệp</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {siteConfig.description}
          </p>
          {/* Video giới thiệu */}
          <HeroVideo youtubeId="zB3orvoBQaU" startSeconds={3} />

          <div className="flex justify-center px-2 mt-10">
            <Link
              href="/register?next=%2Foto"
              className="inline-flex items-center justify-center gap-3 px-5 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-black text-sm sm:text-lg max-w-2xl text-center leading-snug"
              style={{ background: brand }}
            >
              <span>Tôi Muốn Kiểm Tra Sức Khỏe Và Hoạch Định Tài Chính Cá Nhân</span>
              <ArrowRight size={20} className="shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Sai lầm tài chính */}
      <section className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
              6 Sai Lầm <span style={{ color: brand }}>Tài Chính Cá Nhân</span> Của Nhà Khởi Nghiệp
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Bạn có đang mắc phải <span className="text-white font-medium">những điều này</span>?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {MISTAKES.map((m) => (
              <div
                key={m.title}
                className="p-6 rounded-xl border border-[#222] hover:border-[#333] transition-colors flex flex-col"
                style={{ background: "#161616" }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl shrink-0" style={{ filter: "drop-shadow(0 0 6px rgba(37,99,235,0.25))" }}>
                    {m.icon}
                  </div>
                  <h3 className="font-semibold text-white text-base leading-snug flex-1">{m.title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Closing pitch */}
          <div
            className="max-w-3xl mx-auto p-6 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(37,99,235,0.02))",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3">
              👉 Nếu không làm chủ tài chính cá nhân, nhà khởi nghiệp rất dễ đánh mất sự bình an, sự sáng suốt và cả nền tảng gia đình{" "}
              <span className="text-white font-medium">trước khi doanh nghiệp kịp thành công</span>.
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              <span className="font-semibold" style={{ color: brand }}>{siteConfig.name}</span> giúp Nhà Khởi Nghiệp{" "}
              <span className="text-white">thiết lập lại nền móng tài chính cá nhân</span>, tách bạch dòng tiền,
              xây dựng quỹ dự phòng, kiểm soát nợ và ra quyết định kinh doanh trong trạng thái vững vàng hơn.
            </p>
          </div>
        </div>
      </section>

      {/* 6 Bước roadmap */}
      <section className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]" style={{ background: siteConfig.colors.surface }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 leading-tight">
              6 Bước Để Có Được{" "}
              <span style={{ color: brand }}>Sự Bình Yên Về Tiền</span>{" "}
              Trong Tâm Trí
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Lộ trình chiến lược giúp Nhà Khởi Nghiệp quản trị tài chính cá nhân
              và doanh nghiệp để đạt được trạng thái <span className="text-white">an tâm và tự do</span>.
            </p>
          </div>

          {ROADMAP_PHASES.map((phase) => (
            <div key={phase.phase} className="mb-10 last:mb-0">
              {/* Phase heading */}
              <div className="flex items-center gap-3 mb-5">
                <span
                  className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${phase.color}22`, color: phase.color, border: `1px solid ${phase.color}55` }}
                >
                  {phase.phase}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-white">{phase.phaseTitle}</h3>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${phase.color}55, transparent)` }} />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {phase.steps.map((s) => (
                  <div
                    key={s.title}
                    className="p-6 rounded-xl border border-[#222] hover:border-[#333] transition-colors"
                    style={{ background: "#161616" }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl shrink-0" style={{ filter: `drop-shadow(0 0 6px ${phase.color}55)` }}>
                        {s.icon}
                      </span>
                      <h4 className="font-semibold text-white text-base leading-snug">{s.title}</h4>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]" style={{ background: siteConfig.colors.surface }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
              Bốn trụ cột của <span style={{ color: brand }}>tài chính cá nhân</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Khung kiến thức {siteConfig.shortName} thiết kế riêng cho founder — gọn, áp dụng được, không lý thuyết suông.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-6 rounded-xl border border-[#222] hover:border-[#333] transition-colors"
                  style={{ background: "#161616" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: "rgba(37,99,235,0.12)", color: brand }}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Đội ngũ VINEN */}
      <section className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-center mb-12">
            Viện VINEN <span style={{ color: brand }}>Là Ai?</span>
          </h2>

          <div className="grid md:grid-cols-[minmax(0,360px)_1fr] gap-8 lg:gap-12 items-start">
            {/* Portrait */}
            <div className="mx-auto md:mx-0 w-full max-w-[340px]">
              <div
                className="relative rounded-2xl overflow-hidden p-1.5"
                style={{
                  background: `linear-gradient(135deg, ${brand}, ${brandHover}, ${brand})`,
                  boxShadow: `0 0 40px ${brand}33`,
                }}
              >
                <div className="rounded-xl overflow-hidden aspect-[3/4] relative" style={{ background: "#0a0a0a" }}>
                  {/* TODO: thay siteConfig.owner.avatar thành ảnh chân dung Đội ngũ VINEN khi có */}
                  <Image
                    src={siteConfig.owner.avatar}
                    alt="Đội ngũ VINEN"
                    fill
                    sizes="(min-width: 768px) 360px, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="font-bold text-white text-lg">Viện VINEN</p>
                <p className="text-sm" style={{ color: brand }}>Viện trưởng Viện Nghiên cứu Khởi nghiệp</p>
              </div>
            </div>

            {/* Bio + credentials */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-3">
                Chuyên gia đào tạo, tư vấn tài chính, khởi nghiệp & AI{" "}
                <span style={{ color: brand }}>cho nhà sáng lập</span>
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-sm sm:text-base">
                Tôi là <span className="text-white font-medium">Viện VINEN</span> — nhà đào tạo, cố vấn và diễn giả
                với định hướng giúp các nhà khởi nghiệp nâng tầm nhận thức, làm chủ tài chính cá nhân,
                phát triển kinh doanh và ứng dụng AI để tạo ra sự tăng trưởng bền vững.
              </p>

              {/* Credentials */}
              <ul className="space-y-3 mb-6">
                {[
                  { Icon: Landmark, text: "Viện trưởng Viện Nghiên cứu Khởi nghiệp" },
                  { Icon: Users, text: "Tổng Thư ký Hội đồng Tư vấn Khởi nghiệp Quốc gia" },
                  { Icon: TrendUp, text: "Đào tạo về tài chính cá nhân, kinh doanh, đầu tư và AI ứng dụng" },
                  { Icon: Target, text: "Đồng hành cùng nhà sáng lập xây dựng tư duy và hệ thống tăng trưởng bền vững" },
                  { Icon: Mic, text: "Diễn giả, cố vấn và huấn luyện chuyên sâu cho doanh nhân khởi nghiệp" },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <span
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: `${brand}1f`, color: brand }}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="text-sm sm:text-base text-gray-300 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>

              {/* Quote */}
              <div
                className="px-4 py-3 mb-6 italic text-sm sm:text-base"
                style={{
                  borderLeft: `3px solid ${brand}`,
                  background: `${brand}0a`,
                  color: "#e5e7eb",
                }}
              >
                &ldquo;Giúp nhà khởi nghiệp làm chủ tài chính, nâng tầm nhận thức và kiến tạo tương lai thịnh vượng.&rdquo;
              </div>

              {/* CTA */}
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-white text-sm"
                style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
              >
                <Rocket size={16} />
                Khám phá chương trình
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]" style={{ background: siteConfig.colors.surface }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-center leading-tight mb-10">
            Hơn 1.000 Nhà Khởi Nghiệp Đã{" "}
            <span style={{ color: brand }}>Làm Chủ Tài Chính Cá Nhân</span>
            <br className="hidden sm:block" />
            {" "}Cùng Với {siteConfig.name}
          </h2>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
            {TESTIMONIAL_STATS.map((s) => (
              <div
                key={s.label}
                className="p-5 rounded-xl text-center"
                style={{ background: "#161616", border: "1px solid #222" }}
              >
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: brand }}>
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-xl flex flex-col"
                style={{ background: "#161616", border: "1px solid #222" }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3" style={{ color: brand }}>
                  {[1,2,3,4,5].map((i) => <span key={i}>★</span>)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-4 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#222]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                      style={{ background: brand }}
                    >
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{t.name}</div>
                      <div className="text-[11px] text-gray-500 truncate">{t.role}</div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded shrink-0"
                    style={{ background: `${brand}1a`, color: brand }}
                  >
                    {t.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Events Gallery — social proof from real-world conferences ─── */}
      <section
        className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]"
        style={{ background: siteConfig.colors.surface }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
              style={{ background: `${brand}1f`, color: brand, border: `1px solid ${brand}55` }}
            >
              ✦ Sự kiện thực tế
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3">
              Đào Tạo Trực Tiếp Cho{" "}
              <span style={{ color: brand }}>1.000+ Doanh Nhân</span>
              <br className="hidden sm:block" />
              {" "}Trên Khắp Cả Nước
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Từ Tọa Đàm Doanh Nhân 2021 đến Diễn Đàn Khởi Nghiệp Quốc Gia
              Hà Nội 2025 — Đội ngũ chuyên gia VINEN đã trực tiếp đào tạo và đồng
              hành cùng hàng nghìn nhà khởi nghiệp trên khắp Việt Nam.
            </p>
          </div>

          {/* Gallery — 1 hero + 5 thumbnails on a 3-col grid (desktop):
                [ HERO    ] [t1]
                [ HERO    ] [t2]
                [t3] [t4]   [t5]
              On mobile everything stacks single-column. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Hero image (2x2 on desktop) — Diễn Đàn Khởi Nghiệp Quốc Gia 2025 */}
            <figure className="md:col-span-2 md:row-span-2 relative aspect-[3/2] md:aspect-auto rounded-2xl overflow-hidden group">
              <Image
                src="/images/events/event-1.jpg"
                alt="Diễn Đàn Khởi Nghiệp Quốc Gia — Hà Nội 2025, Trung Tâm Hội Nghị Quốc Gia"
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-5 sm:p-6">
                <div>
                  <div
                    className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ background: brand, color: "#1a1a1a" }}
                  >
                    Keynote · Hà Nội 2025
                  </div>
                  <h3 className="text-white text-lg sm:text-2xl font-extrabold leading-snug mb-1">
                    Diễn Đàn Khởi Nghiệp Quốc Gia
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Phát triển nguồn vốn nhân lực cho Đổi mới Sáng tạo và Khởi nghiệp Quốc gia
                  </p>
                </div>
              </div>
            </figure>

            {/* 5 smaller images — each 1 col × 1 row */}
            {[
              {
                src: "/images/events/event-2.jpg",
                alt: "Toàn cảnh hội trường Tọa Đàm Hội Nghị Doanh Nhân 2021 — TCA",
                badge: "2021",
              },
              {
                src: "/images/events/event-3.jpg",
                alt: "Workshop Khởi Nghiệp Đổi Mới Sáng Tạo Cho Thanh Niên — Ninh Bình 2026",
                badge: "2026",
              },
              {
                src: "/images/events/event-4.jpg",
                alt: "Tọa Đàm TCA 2021 — Chủ đề: Kiếm Tiền Thông Minh, Giữ Tiền An Toàn, Nhân Tiền Hiệu Quả",
                badge: "2021",
              },
              {
                src: "/images/events/event-5.jpg",
                alt: "Đội ngũ chuyên gia VINEN — Chuyên gia Khởi Nghiệp Quốc Gia, Tổng Thư Ký Hội đồng Tư vấn Khởi Nghiệp Quốc Gia (viNen)",
                badge: "Credential",
                contain: true,
                bg: "#b8000d",
              },
              {
                src: "/images/events/event-6.jpg",
                alt: "Chương trình tập huấn Khởi Nghiệp Sáng Tạo cho Thanh Niên tỉnh Ninh Bình 21/04/2026",
                badge: "2026",
              },
            ].map((img, i) => (
              <figure
                key={i}
                className="relative aspect-[3/2] rounded-xl overflow-hidden group"
                style={img.bg ? { background: img.bg } : undefined}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={`${img.contain ? "object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.04]`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                {img.badge && (
                  <div
                    className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: brand, color: "#1a1a1a" }}
                  >
                    {img.badge}
                  </div>
                )}
              </figure>
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            {[
              { num: "1.000+", label: "Doanh nhân đã đào tạo" },
              { num: "50+", label: "Tọa đàm & workshop" },
              { num: "5+", label: "Năm kinh nghiệm thực chiến" },
              { num: "98%", label: "Học viên hài lòng" },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-4 rounded-xl"
                style={{ background: "#161616", border: "1px solid #222" }}
              >
                <div className="text-xl sm:text-2xl font-extrabold mb-0.5" style={{ color: brand }}>
                  {s.num}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Gift — Lead magnet (after testimonials) */}
      <section className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5"
            style={{
              background: `linear-gradient(135deg, ${brand}22, ${brand}11)`,
              border: `1px solid ${brand}66`,
              color: brand,
            }}
          >
            <Gift size={14} />
            Tặng miễn phí từ Đội ngũ VINEN
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 leading-tight">
            &ldquo;Bí Mật{" "}
            <span style={{ color: brand }}>Sức Khỏe Tài Chính</span>{" "}
            Của Nhà Khởi Nghiệp&rdquo;
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
            Hướng dẫn sử dụng công cụ để{" "}
            <span className="text-white">đo lường sức khỏe tài chính</span> của bạn —
            ngay cả khi bạn mới bắt đầu từ con số 0.
          </p>

          {/* Banner image */}
          <Link
            href="/tools/suc-khoe-tai-chinh"
            className="block max-w-3xl mx-auto group"
          >
            <div
              className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8"
              style={{
                background: "#0a0a0a",
                border: `2px solid ${brand}55`,
                boxShadow: `0 10px 40px ${brand}22`,
              }}
            >
              <Image
                src="/images/about/logo.png"
                alt="Quà tặng miễn phí"
                fill
                sizes="(min-width: 1024px) 768px, 100vw"
                className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </Link>

          <Link
            href="/register?next=%2Foto"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-black text-sm sm:text-base text-center leading-snug max-w-2xl"
            style={{ background: `linear-gradient(135deg, ${brand}, ${brandHover})` }}
          >
            <Gift size={18} className="shrink-0" />
            <span>Tôi Muốn Kiểm Tra Sức Khỏe Và Hoạch Định Tài Chính Cá Nhân</span>
            <ArrowRight size={18} className="shrink-0" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-4 sm:px-6 pt-14 pb-8" style={{ background: "#0a0a0a" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src={siteConfig.owner.avatar}
                  alt={siteConfig.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="font-bold text-white text-sm">{siteConfig.name}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                Học viện đào tạo tư vấn tài chính cá nhân cho nhà khởi nghiệp Việt Nam.
              </p>
              <div className="flex items-center gap-3">
                {siteConfig.socials.facebook && (
                  <a href={siteConfig.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-500 hover:text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  </a>
                )}
                {siteConfig.socials.youtube && (
                  <a href={siteConfig.socials.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-gray-500 hover:text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186c-.272-1.018-1.074-1.82-2.092-2.092-1.85-.5-9.406-.5-9.406-.5s-7.556 0-9.406.5c-1.018.272-1.82 1.074-2.092 2.092C0 8.036 0 12 0 12s0 3.964.502 5.814c.272 1.018 1.074 1.82 2.092 2.092 1.85.5 9.406.5 9.406.5s7.556 0 9.406-.5c1.018-.272 1.82-1.074 2.092-2.092C24 15.964 24 12 24 12s0-3.964-.502-5.814zM9.546 15.568V8.432l6.36 3.568-6.36 3.568z"/></svg>
                  </a>
                )}
                {siteConfig.socials.zalo && (
                  <a href={siteConfig.socials.zalo} target="_blank" rel="noopener noreferrer" aria-label="Zalo" className="text-gray-500 hover:text-white">
                    <MessageCircle size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Khoá học */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Khoá học</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/courses?cat=personal" className="text-gray-400 hover:text-white">Tài Chính - Đầu Tư</Link></li>
                <li><Link href="/courses?cat=business" className="text-gray-400 hover:text-white">Khởi Nghiệp Kinh Doanh</Link></li>
                <li><Link href="/courses" className="text-gray-400 hover:text-white">Tất cả khoá học</Link></li>
                <li><Link href="/tools/suc-khoe-tai-chinh" style={{ color: brand }} className="hover:underline">🎁 Quà tặng miễn phí</Link></li>
              </ul>
            </div>

            {/* Hỗ trợ */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Hỗ trợ</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/community" className="text-gray-400 hover:text-white">Cộng đồng</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><a href={`mailto:info@${siteConfig.domain}`} className="text-gray-400 hover:text-white">Liên hệ</a></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Điều khoản</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Bảo mật</Link></li>
                <li><Link href="/refund-policy" className="text-gray-400 hover:text-white">Hoàn tiền</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Đăng ký nhận tin</h4>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Nhận bài viết tài chính cá nhân + case study founder thực chiến mỗi tuần.
              </p>
              <NewsletterFooterForm brand={brand} brandHover={brandHover} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div>{siteConfig.footer.copyright} · <a href={`https://${siteConfig.domain}`} className="hover:text-gray-300">{siteConfig.domain}</a></div>
            <div>Powered by <span style={{ color: brand }}>{siteConfig.name}</span></div>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA */}
      <StickyGiftCTA brand={brand} brandHover={brandHover} />
    </div>
  );
}

// ─── Newsletter footer form (client) ──────────────────────────

function NewsletterFooterForm({ brand, brandHover }: { brand: string; brandHover: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setStatus("err");
        setMsg(data.error || "Không đăng ký được. Thử lại sau.");
        return;
      }
      setStatus("ok");
      setMsg("Đã đăng ký! Cảm ơn bạn 🎉");
      setEmail("");
    } catch {
      setStatus("err");
      setMsg("Lỗi mạng. Thử lại.");
    }
  }

  if (status === "ok") {
    return <p className="text-xs" style={{ color: "#22c55e" }}>{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email của bạn"
        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#444]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-black disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${brand}, ${brandHover})` }}
      >
        {status === "loading" ? "Đang gửi..." : "Đăng ký"}
      </button>
      {status === "err" && <p className="text-xs text-red-400">{msg}</p>}
    </form>
  );
}

// ─── Sticky bottom gift CTA (client) ──────────────────────────

function StickyGiftCTA({ brand, brandHover }: { brand: string; brandHover: string }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Hide on small scroll, show after scrolling 800px down. Hide near bottom of page.
    const handler = () => {
      if (dismissed) return;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Show if scrolled past 600px AND not near footer (last 300px)
      setVisible(y > 600 && y < max - 300);
    };
    // Persist dismissal in session storage
    if (typeof window !== "undefined" && sessionStorage.getItem("gift-cta-dismissed") === "1") {
      setDismissed(true);
    }
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [dismissed]);

  function close(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    if (typeof window !== "undefined") sessionStorage.setItem("gift-cta-dismissed", "1");
  }

  if (!visible || dismissed) return null;

  return (
    <Link
      href="/register?next=%2Foto"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-black text-xs sm:text-base shadow-2xl whitespace-nowrap max-w-[calc(100vw-2rem)]"
      style={{
        background: `linear-gradient(135deg, ${brand}, ${brandHover})`,
        boxShadow: `0 10px 30px ${brand}55`,
      }}
    >
      <Gift size={16} className="shrink-0" />
      <span className="hidden sm:inline">Đăng ký nhận Quà Tặng Miễn Phí</span>
      <span className="sm:hidden">Nhận quà miễn phí</span>
      <ArrowRight size={14} className="shrink-0" />
      <button
        type="button"
        onClick={close}
        aria-label="Đóng"
        className="ml-1 -mr-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center hover:bg-black/15 text-black/70 shrink-0"
      >
        <X size={12} />
      </button>
    </Link>
  );
}
