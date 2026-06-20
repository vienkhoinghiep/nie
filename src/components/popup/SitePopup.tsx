"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

/**
 * Site-wide exit-intent popup → Financial Health Check tool.
 *
 * Behaviour (v3 — CTA only, no form):
 *  - Shows ONLY on exit-intent: mouse leaves through the TOP-RIGHT
 *    quadrant of the viewport (heading toward the tab-close / URL bar).
 *  - No time-based auto-show, no auto-hide. User triggers it.
 *  - Single CTA button → /tools/suc-khoe-tai-chinh. No form fields —
 *    the quiz page itself collects info at its own end-of-flow popup.
 *  - On close/CTA click → permanent dismiss via localStorage; never
 *    shows again on this browser.
 *  - Hidden for logged-in users + admin / dashboard / login / lp routes.
 */

const STORAGE_KEY = "lp_popup_quiz_exit_v3";
const BRAND = "#2563EB";
const TARGET = "/tools/suc-khoe-tai-chinh";

/** Pages where the popup should never appear. */
const SKIP_PATH_PREFIXES = [
  "/admin",
  "/dashboard",
  "/instructor",
  "/login",
  "/signup",
  "/reset-password",
  "/complete-profile",
  "/lp/",
  "/settings",
  "/courses/",
  "/email",
  "/crm",
  "/tools/suc-khoe-tai-chinh", // already on the quiz — no need to nudge
];

export default function SitePopup() {
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [visible, setVisible] = useState(false);

  // 1. Eligibility (path + auth + storage gates).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (SKIP_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p))) {
        return;
      }
      try {
        if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) {
          return;
        }
      } catch {
        // localStorage unavailable — proceed
      }
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) return;
      } catch {
        // ignore
      }
      if (!cancelled) setEligible(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // 2. Exit-intent trigger — top-RIGHT quadrant only.
  useEffect(() => {
    if (!eligible || visible) return;

    let shown = false;
    const showOnce = () => {
      if (shown) return;
      shown = true;
      setVisible(true);
    };

    const onExitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0 && e.clientX >= window.innerWidth / 2) {
        showOnce();
      }
    };
    document.addEventListener("mouseleave", onExitIntent);
    document.documentElement.addEventListener("mouseleave", onExitIntent);

    return () => {
      document.removeEventListener("mouseleave", onExitIntent);
      document.documentElement.removeEventListener("mouseleave", onExitIntent);
    };
  }, [eligible, visible]);

  // 3. Lock body scroll while visible.
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  const dismissPermanent = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissPermanent();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden text-white text-center"
        style={{
          background:
            "linear-gradient(180deg, #1a1a1a 0%, #111111 100%)",
          border: `1px solid ${BRAND}55`,
          boxShadow: `0 20px 80px rgba(0,0,0,0.8), 0 0 0 1px ${BRAND}33`,
        }}
      >
        {/* Close */}
        <button
          type="button"
          onClick={dismissPermanent}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
          aria-label="Đóng popup"
        >
          <X size={18} />
        </button>

        <div className="p-7 sm:p-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-5"
            style={{ background: `${BRAND}22`, color: BRAND, border: `1px solid ${BRAND}55` }}
          >
            <Activity size={11} />
            Khoan đã — quà tặng cho anh/chị
          </div>

          {/* Title */}
          <h2
            id="site-popup-title"
            className="text-2xl sm:text-3xl font-extrabold leading-tight mb-3"
          >
            Đo Sức Khoẻ Tài Chính Cá Nhân —{" "}
            <span style={{ color: BRAND }}>Miễn Phí</span>
          </h2>

          {/* Subhead */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 max-w-sm mx-auto">
            Bài kiểm tra <strong className="text-white">5 phút</strong> với 11 chỉ
            số theo 5 nhóm tài chính chuẩn — kèm chẩn đoán cá nhân hoá.
          </p>

          {/* Bullets */}
          <ul className="text-left space-y-2.5 mb-7 max-w-xs mx-auto">
            {[
              "11 chỉ số · 5 nhóm sức khoẻ tài chính",
              "Báo cáo phân tích + radar map trực quan",
              "Lời khuyên cá nhân hoá theo điểm yếu",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2
                  size={16}
                  className="shrink-0 mt-0.5"
                  style={{ color: BRAND }}
                />
                <span className="text-gray-200 leading-snug">{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            href={TARGET}
            onClick={dismissPermanent}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-extrabold text-black uppercase tracking-wider transition-transform hover:scale-[1.02] active:scale-[0.99]"
            style={{
              background: `linear-gradient(135deg, ${BRAND}, #3B82F6)`,
              boxShadow: `0 8px 24px ${BRAND}55`,
            }}
          >
            Bắt đầu kiểm tra ngay
            <ArrowRight size={16} />
          </Link>

          {/* Reassurance footer */}
          <div
            className="mt-5 px-3 py-2 rounded-lg text-[11px] text-gray-400 inline-flex items-center gap-1.5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <Sparkles size={12} style={{ color: BRAND }} />
            Chỉ 5 phút · <span className="font-semibold text-white">miễn phí 100%</span> · không cần đăng ký trước
          </div>
        </div>
      </div>
    </div>
  );
}
