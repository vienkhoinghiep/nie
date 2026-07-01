"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, User, ChevronDown } from "lucide-react";
import UserAvatar from "@/components/admin/UserAvatar";
import { siteConfig } from "@/lib/site-config";

interface PublicHeaderProps {
  user?: {
    email?: string;
    avatar_url?: string;
    full_name?: string;
  } | null;
}

interface MenuItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

const MENU: MenuItem[] = [
  { href: "/", label: "TRANG CHỦ" },
  {
    href: "/gioi-thieu",
    label: "GIỚI THIỆU",
    children: [
      { href: "/gioi-thieu/ve-chung-toi", label: "Về chúng tôi" },
      { href: "/gioi-thieu/chuc-nang-nhiem-vu", label: "Chức năng & nhiệm vụ" },
      { href: "/gioi-thieu/ban-lanh-dao", label: "Ban lãnh đạo Viện" },
      { href: "/gioi-thieu/ban-co-van", label: "Ban cố vấn cao cấp" },
    ],
  },
  {
    href: "/mentor-khoi-nghiep",
    label: "MENTOR KHỞI NGHIỆP",
    children: [
      { href: "/mentor-khoi-nghiep/mentee", label: "Dành cho Mentee" },
      { href: "/mentor-khoi-nghiep/mentor", label: "Trở thành Mentor" },
    ],
  },
  { href: "/courses", label: "KHÓA HỌC" },
  { href: "/shop", label: "SÁCH KHỞI NGHIỆP" },
  { href: "/blog", label: "CHIA SẺ KIẾN THỨC" },
];

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";

export default function PublicHeader({ user }: PublicHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const submenuRef = useRef<HTMLUListElement>(null);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  // Close dropdown on outside click
  useEffect(() => {
    if (!openSubmenu) return;
    const onClick = (e: MouseEvent) => {
      if (submenuRef.current && !submenuRef.current.contains(e.target as Node)) {
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [openSubmenu]);

  // Close dropdown on route change
  useEffect(() => {
    setOpenSubmenu(null);
  }, [pathname]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/blog?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

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
      className="sticky top-0 z-50"
      style={{
        background: `linear-gradient(180deg, #0a0a0a 0%, ${NAVY} 100%)`,
        borderBottom: `2px solid ${GOLD}`,
      }}
    >
      {/* ─── Top row: logo + search + user ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-white p-1.5"
          aria-label="Mở menu"
        >
          <Menu size={22} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-1 md:flex-initial md:mx-auto">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0">
            <Image
              src={siteConfig.owner.avatar}
              alt={siteConfig.name}
              fill
              sizes="56px"
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block text-center">
            <div className="text-sm font-bold tracking-wide leading-tight max-w-[260px]" style={{ color: GOLD }}>
              {siteConfig.name}
            </div>
          </div>
        </Link>

        {/* Right: search + user */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Desktop search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center w-72 lg:w-96 rounded-lg overflow-hidden"
            style={{ border: `1px solid ${GOLD}44`, background: "rgba(255,255,255,0.04)" }}
          >
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khoá tìm kiếm"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 px-3 py-2 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 text-white"
              style={{ background: GOLD, color: NAVY }}
              aria-label="Tìm kiếm"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="md:hidden p-2 text-white"
            aria-label="Tìm kiếm"
          >
            <Search size={18} />
          </button>

          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2">
              <UserAvatar
                src={user.avatar_url}
                initials={initials}
                size={32}
                gradient={`linear-gradient(135deg, #2563EB, ${GOLD})`}
              />
              <span className="hidden lg:inline text-sm font-medium text-white">Dashboard</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-300 hover:text-white"
              >
                <User size={15} /> Đăng nhập
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                style={{ background: GOLD, color: NAVY }}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar — slide down */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-lg overflow-hidden"
            style={{ border: `1px solid ${GOLD}44`, background: "rgba(255,255,255,0.04)" }}
          >
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập từ khoá tìm kiếm"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 px-3 py-2 outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2"
              style={{ background: GOLD, color: NAVY }}
              aria-label="Tìm kiếm"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ─── Bottom row: menu ─── */}
      <nav
        className="hidden md:block"
        style={{ background: "rgba(0,0,0,0.35)", borderTop: `1px solid ${GOLD}22` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ul ref={submenuRef} className="flex items-center justify-center gap-1 lg:gap-2 relative">
            {MENU.map((item) => {
              const active = isActive(item.href);
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openSubmenu === item.href;

              if (!hasChildren) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-3 lg:px-4 py-3 text-[12px] lg:text-[13px] font-bold tracking-wider transition-colors relative"
                      style={{ color: active ? GOLD : "#e5e7eb" }}
                    >
                      {item.label}
                      {active && (
                        <span
                          className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-[3px] rounded-t"
                          style={{ background: GOLD }}
                        />
                      )}
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(item.href)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button
                    type="button"
                    onClick={() => setOpenSubmenu(isOpen ? null : item.href)}
                    className="flex items-center gap-1 px-3 lg:px-4 py-3 text-[12px] lg:text-[13px] font-bold tracking-wider transition-colors relative"
                    style={{ color: active ? GOLD : "#e5e7eb" }}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                  >
                    {item.label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                    {active && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-8 h-[3px] rounded-t"
                        style={{ background: GOLD }}
                      />
                    )}
                  </button>
                  {isOpen && (
                    <ul
                      role="menu"
                      className="absolute left-1/2 -translate-x-1/2 top-full min-w-[240px] rounded-b-lg overflow-hidden shadow-2xl"
                      style={{
                        background: NAVY,
                        border: `1px solid ${GOLD}55`,
                        borderTop: "none",
                      }}
                    >
                      {item.children!.map((child, idx) => {
                        const childActive = pathname === child.href;
                        return (
                          <li
                            key={child.href}
                            style={{
                              borderTop: idx === 0 ? "none" : `1px solid ${GOLD}22`,
                            }}
                          >
                            <Link
                              href={child.href}
                              onClick={() => setOpenSubmenu(null)}
                              className="block px-5 py-3 text-[13px] font-bold uppercase tracking-wider transition-colors"
                              style={{
                                color: childActive ? GOLD : "#e5e7eb",
                                background: childActive ? `${GOLD}11` : "transparent",
                              }}
                            >
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* ─── Mobile drawer ─── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 max-w-[80vw] overflow-y-auto"
            style={{ background: NAVY, borderRight: `2px solid ${GOLD}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: `${GOLD}33` }}>
              <div className="flex items-center gap-2">
                <Image src={siteConfig.owner.avatar} alt={siteConfig.name} width={36} height={36} className="object-contain" />
                <div className="text-xs font-bold leading-tight max-w-[180px]" style={{ color: GOLD }}>{siteConfig.name}</div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white p-1" aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <ul className="py-2">
              {MENU.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors"
                      style={{
                        color: active ? GOLD : "#e5e7eb",
                        background: active ? `${GOLD}11` : "transparent",
                        borderLeft: active ? `3px solid ${GOLD}` : "3px solid transparent",
                      }}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <ul className="pl-4 pb-1">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-5 py-2 text-xs transition-colors"
                                style={{
                                  color: childActive ? GOLD : "#cbd5e1",
                                  borderLeft: `2px solid ${GOLD}33`,
                                }}
                              >
                                • {child.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
            {!user && (
              <div className="px-5 pt-4 border-t" style={{ borderColor: `${GOLD}33` }}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-gray-300"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="inline-block mt-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider"
                  style={{ background: GOLD, color: NAVY }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}
    </header>
  );
}
