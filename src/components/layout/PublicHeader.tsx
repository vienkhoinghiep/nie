"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gift, ChevronDown, Crown, Target, BarChart3, Sparkles, Droplets, Umbrella, Armchair, Menu, X } from "lucide-react";
import UserAvatar from "@/components/admin/UserAvatar";
import { siteConfig } from "@/lib/site-config";

const SOLUTIONS = [
  {
    href: "/blueprint",
    label: "Entrepreneur Financial Blueprint™",
    desc: "Bản đồ tài chính toàn cảnh cho doanh chủ",
    icon: BarChart3,
    color: "#3b82f6",
  },
  {
    href: "/giai-phap-toan-dien",
    label: "Entrepreneur Financial OS™ PRO",
    desc: "Hệ thống hoạch định tài chính nâng cao",
    icon: Sparkles,
    color: "#a855f7",
  },
  {
    href: "/entrepreneur-financial-mentor",
    label: "Entrepreneur Financial Mentor™",
    desc: "Đồng hành cùng chuyên gia hoạch định 1-1",
    icon: Crown,
    color: "#2563EB",
  },
];

const TOOLS = [
  {
    href: "/tools/hoach-dinh-dong-tien",
    label: "Hoạch Định Dòng Tiền",
    desc: "Bản đồ xô chảy tràn — phân bổ thu nhập 5 quỹ · Miễn phí khi đăng ký",
    icon: Droplets,
    color: "#06b6d4",
  },
  {
    href: "/tools/ke-hoach-bao-hiem",
    label: "Kế Hoạch Bảo Hiểm",
    desc: "Tính nhu cầu bảo hiểm theo công thức DIME · Miễn phí khi đăng ký",
    icon: Umbrella,
    color: "#10b981",
  },
  {
    href: "/tools/nghi-huu-an-nhan",
    label: "Nghỉ Hưu An Nhàn",
    desc: "Số tiền cần tích lũy & lộ trình đầu tư hưu trí · Miễn phí khi đăng ký",
    icon: Armchair,
    color: "#f59e0b",
  },
  {
    href: "/tools/dau-tu-muc-tieu",
    label: "Đầu Tư Theo Mục Tiêu",
    desc: "Compound interest + biểu đồ tăng trưởng · Miễn phí khi đăng ký",
    icon: Target,
    color: "#a855f7",
  },
  {
    href: "/blueprint",
    label: "Entrepreneur Financial Blueprint™",
    desc: "Báo cáo tổng hợp 4 phần — dành cho học viên đặt cọc 498.526đ",
    icon: Crown,
    color: "#2563EB",
  },
];

interface PublicHeaderProps {
  user?: {
    email?: string;
    avatar_url?: string;
    full_name?: string;
  } | null;
}

export default function PublicHeader({ user }: PublicHeaderProps) {
  const [solOpen, setSolOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const solRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!solOpen && !toolsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (solRef.current && !solRef.current.contains(e.target as Node)) {
        setSolOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [solOpen, toolsOpen]);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : "?";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={siteConfig.owner.avatar}
            alt={siteConfig.name}
            width={32}
            height={32}
            sizes="32px"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="text-sm font-bold text-white leading-tight hidden sm:block">
            {siteConfig.name}
          </span>
        </Link>

        {/* Center Nav Links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-sm text-gray-400 hover:text-white transition-colors">
            Khoá học
          </Link>
          <Link href="/mentors" className="text-sm text-gray-400 hover:text-white transition-colors">
            Mentor 1-1
          </Link>

          {/* Giải pháp — dropdown */}
          <div className="relative" ref={solRef}>
            <button
              type="button"
              onClick={() => setSolOpen((v) => !v)}
              onMouseEnter={() => setSolOpen(true)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              aria-expanded={solOpen}
              aria-haspopup="menu"
            >
              Giải pháp
              <ChevronDown
                size={13}
                className={`transition-transform ${solOpen ? "rotate-180" : ""}`}
              />
            </button>
            {solOpen && (
              <div
                role="menu"
                onMouseLeave={() => setSolOpen(false)}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 rounded-xl overflow-hidden"
                style={{
                  background: "rgba(15,15,15,0.98)",
                  border: "1px solid #2a2a2a",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                {SOLUTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setSolOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${s.color}1a`, color: s.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white leading-tight">
                          {s.label}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {s.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Công cụ — dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              type="button"
              onClick={() => setToolsOpen((v) => !v)}
              onMouseEnter={() => setToolsOpen(true)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
              aria-expanded={toolsOpen}
              aria-haspopup="menu"
            >
              Công cụ
              <ChevronDown
                size={13}
                className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`}
              />
            </button>
            {toolsOpen && (
              <div
                role="menu"
                onMouseLeave={() => setToolsOpen(false)}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 rounded-xl overflow-hidden"
                style={{
                  background: "rgba(15,15,15,0.98)",
                  border: "1px solid #2a2a2a",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                {TOOLS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <Link
                      key={t.href}
                      href={t.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: `${t.color}1a`, color: t.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white leading-tight">
                          {t.label}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                          {t.desc}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">
            Cửa hàng
          </Link>
          <Link href="/events" className="text-sm text-gray-400 hover:text-white transition-colors">
            Hội thảo
          </Link>
          <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
            Blog
          </Link>
          <a
            href={`mailto:info@${siteConfig.domain}`}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Liên hệ
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Avatar */}
              <UserAvatar
                src={user.avatar_url}
                initials={initials}
                size={32}
                gradient="linear-gradient(135deg, #2563EB, #059669)"
              />
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm text-gray-400 hover:text-white transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-semibold py-1.5 px-4 rounded-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #FFD814, #FFA41C)",
                  color: "#131921",
                }}
              >
                <Gift size={14} />
                Nhận quà miễn phí
              </Link>
            </>
          )}

          {/* Hamburger — chỉ hiện trên mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 -mr-1 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ─── Menu mobile ─── */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-[#1a1a1a]"
          style={{
            background: "rgba(10,10,10,0.98)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <Link
              href="/courses"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[15px] text-gray-200 hover:text-white transition-colors"
            >
              Khoá học
            </Link>
            <Link
              href="/mentors"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[15px] text-gray-200 hover:text-white transition-colors"
            >
              Mentor 1-1
            </Link>

            <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold px-1 pt-3 pb-1">
              Giải pháp
            </div>
            {SOLUTIONS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${s.color}1a`, color: s.color }}
                  >
                    <Icon size={15} />
                  </div>
                  <span className="text-sm text-gray-200">{s.label}</span>
                </Link>
              );
            })}

            <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold px-1 pt-3 pb-1">
              Công cụ
            </div>
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5"
                >
                  <div
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${t.color}1a`, color: t.color }}
                  >
                    <Icon size={15} />
                  </div>
                  <span className="text-sm text-gray-200">{t.label}</span>
                </Link>
              );
            })}

            <div className="h-px my-2 bg-[#1f1f1f]" />
            <Link href="/shop" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] text-gray-200 hover:text-white transition-colors">
              Cửa hàng
            </Link>
            <Link href="/events" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] text-gray-200 hover:text-white transition-colors">
              Hội thảo
            </Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className="py-2.5 text-[15px] text-gray-200 hover:text-white transition-colors">
              Blog
            </Link>
            <a
              href={`mailto:info@${siteConfig.domain}`}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[15px] text-gray-200 hover:text-white transition-colors"
            >
              Liên hệ
            </a>

            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="py-2.5 text-[15px] text-gray-300 hover:text-white transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
