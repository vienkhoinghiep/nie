"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

interface Slide {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  cta: { label: string; href: string };
  bgGradient: string;
  showLogo?: boolean;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Viện Nghiên Cứu Khởi Nghiệp · Founded 2023",
    title: (
      <>
        <span className="block">VIỆN NGHIÊN CỨU</span>
        <span className="block" style={{ color: GOLD }}>KHỞI NGHIỆP</span>
      </>
    ),
    subtitle: "Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân",
    cta: { label: "Khám phá VINEN", href: "/gioi-thieu" },
    bgGradient: `linear-gradient(135deg, ${NAVY} 0%, #0a0a0a 50%, ${NAVY} 100%)`,
    showLogo: true,
  },
  {
    eyebrow: "Chương trình đào tạo",
    title: (
      <>
        <span className="block">TINH HOA</span>
        <span className="block" style={{ color: GOLD }}>QUẢN TRỊ & KHỞI NGHIỆP</span>
      </>
    ),
    subtitle: "10 môn học cốt lõi dành cho Nhà Sáng Lập — từ chiến lược, tài chính, nhân sự đến công nghệ và pháp lý.",
    cta: { label: "Xem 10 môn học", href: "/courses" },
    bgGradient: `linear-gradient(135deg, ${BRAND} 0%, ${NAVY} 70%, #0a0a0a 100%)`,
  },
  {
    eyebrow: "Mentor 1-1",
    title: (
      <>
        <span className="block">KẾT NỐI VỚI</span>
        <span className="block" style={{ color: GOLD }}>CHUYÊN GIA HÀNG ĐẦU</span>
      </>
    ),
    subtitle: "Mạng lưới founder, nhà đầu tư, chuyên gia khởi nghiệp Việt Nam sẵn sàng đồng hành cùng bạn.",
    cta: { label: "Đặt lịch mentoring", href: "/mentors" },
    bgGradient: `linear-gradient(135deg, #0a0a0a 0%, ${NAVY} 40%, ${BRAND}66 100%)`,
  },
];

const ROTATE_MS = 6000;

export default function HeroSlideBanner() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    setActive(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-rotate (pause on hover)
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((cur) => (cur + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  // Keyboard arrows
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goTo(active - 1);
      if (e.key === "ArrowRight") goTo(active + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "min(72vh, 640px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Giới thiệu VINEN"
    >
      {/* Slides stack */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === active ? 1 : 0,
            pointerEvents: i === active ? "auto" : "none",
            background: slide.bgGradient,
          }}
          aria-hidden={i !== active}
        >
          {/* Decorative dots pattern */}
          <DotsPattern color={GOLD} />

          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 min-h-[inherit] flex items-center">
            <div className={slide.showLogo ? "grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center w-full" : "max-w-3xl"}>
              <div>
                <p
                  className="text-[11px] sm:text-xs font-bold tracking-[0.3em] uppercase mb-4"
                  style={{ color: GOLD }}
                >
                  {slide.eyebrow}
                </p>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-5 text-white drop-shadow-lg">
                  {slide.title}
                </h1>
                <p className="text-base sm:text-lg text-gray-200 max-w-2xl leading-relaxed mb-7">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-transform hover:scale-[1.03]"
                  style={{ background: GOLD, color: NAVY, boxShadow: `0 10px 32px ${GOLD}55` }}
                >
                  {slide.cta.label}
                </Link>
              </div>
              {slide.showLogo && (
                <div className="hidden lg:flex justify-center">
                  <div
                    className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${NAVY}, #0a0a0a 70%)`,
                      border: `3px solid ${GOLD}`,
                      boxShadow: `0 24px 64px ${BRAND}44`,
                    }}
                  >
                    <Image
                      src={siteConfig.owner.avatar}
                      alt="Logo VINEN"
                      width={220}
                      height={220}
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={() => goTo(active - 1)}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
        style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${GOLD}44`, color: "#fff" }}
        aria-label="Slide trước"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => goTo(active + 1)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
        style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${GOLD}44`, color: "#fff" }}
        aria-label="Slide kế"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className="h-2 rounded-full transition-all"
            style={{
              width: i === active ? 28 : 10,
              background: i === active ? GOLD : "rgba(255,255,255,0.5)",
            }}
            aria-label={`Slide ${i + 1}`}
            aria-current={i === active}
          />
        ))}
      </div>
    </section>
  );
}

// Decorative dotted pattern (server-friendly SVG)
function DotsPattern({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="vinen-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#vinen-dots)" />
    </svg>
  );
}
