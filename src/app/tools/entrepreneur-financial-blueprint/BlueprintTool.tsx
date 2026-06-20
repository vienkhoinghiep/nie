"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  User,
  Brain,
  TrendingUp,
  CheckCircle2,
  Circle,
  Loader2,
  Save,
  Lock,
  FileText,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type {
  BlueprintData,
  BlueprintProgress,
  SectionKey,
} from "@/lib/blueprint/types";
import ProfileSection from "./sections/ProfileSection";
import MindsetSection from "./sections/MindsetSection";
import StatusSection from "./sections/StatusSection";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const STORAGE_KEY = "tc_blueprint_v1";
const DEBOUNCE_MS = 1200;

interface SectionDef {
  key: SectionKey;
  label: string;
  short: string;
  icon: typeof User;
  color: string;
  enabled: boolean;
}

const SECTIONS: SectionDef[] = [
  {
    key: "profile",
    label: "Phần I — Thông tin cơ bản",
    short: "Profile cá nhân",
    icon: User,
    color: "#3b82f6",
    enabled: true,
  },
  {
    key: "mindset",
    label: "Phần II — Tâm thức về tiền",
    short: "Tâm thức · Yêu tiền · Niềm tin",
    icon: Brain,
    color: "#a855f7",
    enabled: true,
  },
  {
    key: "status",
    label: "Phần III — Hiện trạng tài chính",
    short: "Thu chi · Tài sản · Tổng quan",
    icon: TrendingUp,
    color: "#22c55e",
    enabled: true,
  },
];

type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  userEmail: string;
}

export default function BlueprintTool({ userEmail }: Props) {
  const [activeKey, setActiveKey] = useState<SectionKey>("profile");
  const [data, setData] = useState<BlueprintData>({});
  const [progress, setProgress] = useState<BlueprintProgress>({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Load on mount: localStorage first (fast), then DB to sync.
  // QUAN TRỌNG: Không setLoaded(true) cho đến khi DB trả về — nếu không
  // user có thể type trước khi DB load xong, rồi save effect wipe data.
  // Đồng thời chỉ overwrite từ DB nếu DB richer than current (tránh DB rỗng wipe localStorage).
  useEffect(() => {
    let cancelled = false;
    // Step 1: hydrate from localStorage immediately
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const j = JSON.parse(cached);
        if (j && typeof j === "object") {
          if (j.data && Object.keys(j.data).length > 0) setData(j.data);
          if (j.progress && Object.keys(j.progress).length > 0)
            setProgress(j.progress);
        }
      }
    } catch {
      // ignore
    }

    // Step 2: fetch from DB (canonical source). Chỉ overwrite nếu DB có content.
    fetch("/api/tools/blueprint", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        // Merge DB với local (local wins per-section nếu local đã có data,
        // tránh trường hợp user vừa type xong thì DB-load wipe)
        if (j.data && typeof j.data === "object") {
          setData((prev) => {
            const merged: BlueprintData = { ...j.data };
            // Per-section: nếu local có section này (object có keys), giữ local
            for (const key of Object.keys(prev) as (keyof BlueprintData)[]) {
              const localVal = prev[key];
              if (
                localVal &&
                typeof localVal === "object" &&
                Object.keys(localVal).length > 0
              ) {
                (merged as Record<string, unknown>)[key] = localVal;
              }
            }
            return merged;
          });
        }
        if (j.progress && typeof j.progress === "object") {
          setProgress((prev) => ({ ...j.progress, ...prev }));
        }
      })
      .catch(() => {
        // network error — keep localStorage values
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const router = useRouter();

  // Refs để luôn có data + progress LATEST (tránh stale closure)
  const dataRef = useRef(data);
  const progressRef = useRef(progress);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Save trực tiếp lên DB. Trả về lỗi text nếu fail.
  const saveToDB = useCallback(
    async (
      nextData: BlueprintData,
      nextProgress: BlueprintProgress
    ): Promise<string | null> => {
      try {
        const res = await fetch("/api/tools/blueprint", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: nextData, progress: nextProgress }),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          return `HTTP ${res.status}: ${txt.substring(0, 200)}`;
        }
        return null;
      } catch (e) {
        return (e as Error)?.message ?? "network error";
      }
    },
    []
  );

  // Auto-save: localStorage instant + debounce 1.2s DB save khi data/progress đổi.
  // Có retry 1 lần nếu fail (network glitch).
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!loaded) return;
    // localStorage immediately
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, progress }));
    } catch {
      // ignore
    }
    // Debounce DB save
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      let err = await saveToDB(data, progress);
      if (err) {
        console.warn("[Blueprint] Auto-save failed, retrying once…", err);
        await new Promise((r) => setTimeout(r, 800));
        err = await saveToDB(data, progress);
      }
      if (err) {
        console.error("[Blueprint] Auto-save failed after retry:", err);
        setSaveState("error");
      } else {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      }
    }, DEBOUNCE_MS);
    return () => {
      // cleanup khi unmount / re-run
    };
  }, [data, progress, loaded, saveToDB]);

  // Flush save NGAY rồi navigate. Luôn dùng REFS để có data mới nhất.
  // Retry 2 lần nếu fail trước khi cho navigate.
  const flushAndNavigate = useCallback(
    async (path: string) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      setSaveState("saving");
      let err = await saveToDB(dataRef.current, progressRef.current);
      // Retry 1 lần nếu fail
      if (err) {
        console.warn("[Blueprint] Save failed, retrying once…", err);
        err = await saveToDB(dataRef.current, progressRef.current);
      }
      if (err) {
        console.error("[Blueprint] Flush save failed after retry:", err);
        setSaveState("error");
        if (typeof window !== "undefined") {
          const proceed = window.confirm(
            `Không lưu được dữ liệu lên cloud:\n${err}\n\nDữ liệu vẫn được lưu local. Báo cáo có thể không hiển thị đầy đủ.\n\nVẫn mở trang báo cáo?`
          );
          if (!proceed) return;
        }
      } else {
        setSaveState("saved");
      }
      router.push(path);
    },
    [router, saveToDB]
  );

  // Safety net: khi user đóng tab / navigate ngoài app, flush save bằng
  // sendBeacon (không bị huỷ khi unload).
  useEffect(() => {
    if (!loaded) return;
    const handler = () => {
      try {
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        const payload = JSON.stringify({
          data: dataRef.current,
          progress: progressRef.current,
        });
        // sendBeacon survives page unload, fetch doesn't
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/tools/blueprint", blob);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener("beforeunload", handler);
    window.addEventListener("pagehide", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("pagehide", handler);
    };
  }, [loaded]);

  const updateData = useCallback((patch: Partial<BlueprintData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const markComplete = useCallback((key: SectionKey) => {
    setProgress((prev) => ({ ...prev, [key]: true }));
  }, []);

  // Mark complete + chuyển sang section TIẾP THEO (nếu có)
  const markCompleteAndNext = useCallback((key: SectionKey) => {
    setProgress((prev) => ({ ...prev, [key]: true }));
    const idx = SECTIONS.findIndex((s) => s.key === key);
    const nextSec = SECTIONS[idx + 1];
    if (nextSec) {
      setActiveKey(nextSec.key);
      // scroll lên top để thấy section mới
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, []);

  const activeSection = SECTIONS.find((s) => s.key === activeKey);

  return (
    <div className="max-w-[1480px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-7">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
          style={{
            background: `${BRAND}1a`,
            color: BRAND,
            border: `1px solid ${BRAND}55`,
          }}
        >
          <Crown size={11} />
          Học viên · Blueprint
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-2">
          Entrepreneur{" "}
          <span style={{ color: BRAND }}>Financial Blueprint</span>
        </h1>
        <p className="text-gray-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          Bộ công cụ tích hợp — nhập thông tin tài chính 1 lần, dùng cho mọi
          bài tập trong khoá học. Dữ liệu tự lưu trên cloud
          {userEmail && (
            <>
              {" "}
              cho tài khoản{" "}
              <strong className="text-white">{userEmail}</strong>
            </>
          )}
          .
        </p>
      </div>

      {/* ─── HERO: Progress overview + CTA "Xem báo cáo" ─── */}
      <ProgressHeroBanner
        progress={progress}
        sections={SECTIONS}
        saveState={saveState}
        onViewReport={() =>
          flushAndNavigate("/tools/entrepreneur-financial-blueprint/report")
        }
      />

      <div className="grid lg:grid-cols-[260px_1fr] gap-5 items-start">
        {/* ─── LEFT: Section nav ─── */}
        <aside className="space-y-2 lg:sticky lg:top-20">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-1 mb-1">
            Các phần bài tập
          </div>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = s.key === activeKey;
            const isDone = progress[s.key] === true;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => s.enabled && setActiveKey(s.key)}
                disabled={!s.enabled}
                className="w-full text-left rounded-lg p-2.5 transition-colors flex items-start gap-2.5"
                style={{
                  background: isActive
                    ? `${s.color}14`
                    : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isActive ? `${s.color}77` : "#1f1f1f"}`,
                  opacity: s.enabled ? 1 : 0.4,
                  cursor: s.enabled ? "pointer" : "not-allowed",
                }}
              >
                <div
                  className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ background: `${s.color}1a`, color: s.color }}
                >
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-extrabold text-white leading-tight truncate">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {s.short}
                  </div>
                </div>
                <div className="shrink-0 mt-1">
                  {isDone ? (
                    <CheckCircle2 size={14} style={{ color: GREEN }} />
                  ) : s.enabled ? (
                    <Circle size={14} className="text-gray-600" />
                  ) : (
                    <Lock size={12} className="text-gray-600" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Save indicator */}
          <div
            className="rounded-md px-2 py-1.5 text-[10px] flex items-center justify-between mt-3"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid #1f1f1f",
            }}
          >
            <span className="text-gray-500 inline-flex items-center gap-1.5">
              {saveState === "saving" ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  Đang lưu…
                </>
              ) : saveState === "saved" ? (
                <>
                  <CheckCircle2 size={11} style={{ color: GREEN }} />
                  <span style={{ color: GREEN }}>Đã lưu cloud</span>
                </>
              ) : saveState === "error" ? (
                <span className="text-red-400">Lỗi lưu — thử lại</span>
              ) : (
                <>
                  <Save size={11} />
                  Tự động lưu
                </>
              )}
            </span>
          </div>

          {/* Xuất báo cáo */}
          <button
            type="button"
            onClick={() =>
              flushAndNavigate("/tools/entrepreneur-financial-blueprint/report")
            }
            disabled={saveState === "saving"}
            className="block w-full text-left rounded-lg p-3 mt-3 transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-wait"
            style={{
              background: `linear-gradient(135deg, #3B82F6, ${BRAND})`,
              color: "#0a0a0a",
              boxShadow: `0 8px 24px ${BRAND}55`,
            }}
          >
            <div className="flex items-center gap-2.5">
              {saveState === "saving" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-extrabold leading-tight">
                  {saveState === "saving" ? "Đang lưu…" : "Xuất Báo Cáo"}
                </div>
                <div className="text-[10px] font-medium opacity-75 mt-0.5">
                  Tổng hợp toàn bộ 3 phần · In/Lưu PDF
                </div>
              </div>
              <ArrowRight size={14} />
            </div>
          </button>

          {/* Roadmap teaser */}
          <div
            className="rounded-md px-2.5 py-2 text-[10px] leading-snug mt-2"
            style={{
              background: `${BRAND}08`,
              color: "#888",
              border: `1px dashed ${BRAND}33`,
            }}
          >
            🛤️ <strong className="text-gray-400">Sắp có:</strong> Đầu tư · Nghỉ
            hưu — theo các video trong khoá học.
          </div>
        </aside>

        {/* ─── RIGHT: Active section ─── */}
        <div>
          {activeSection && (
            <div
              className="rounded-2xl p-4 sm:p-6 mb-4"
              style={{ background: "#141414", border: "1px solid #232323" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: activeSection.color }}
                >
                  {activeSection.label}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {activeSection.short}
              </h2>
            </div>
          )}

          {activeKey === "profile" && (
            <ProfileSection
              data={data.profile ?? {}}
              onChange={(v) => updateData({ profile: v })}
              onComplete={() => markCompleteAndNext("profile")}
            />
          )}

          {activeKey === "mindset" && (
            <MindsetSection
              data={data.mindset ?? {}}
              onChange={(v) => updateData({ mindset: v })}
              onComplete={() => markCompleteAndNext("mindset")}
            />
          )}

          {activeKey === "status" && (
            <StatusSection
              data={data.status ?? {}}
              onChange={(v) => updateData({ status: v })}
              onComplete={() => {
                setProgress((prev) => ({ ...prev, status: true }));
                // Section cuối → flush + navigate sang trang Báo Cáo
                flushAndNavigate("/tools/entrepreneur-financial-blueprint/report");
              }}
              profile={data.profile}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Progress Hero Banner — top of page
 * ───────────────────────────────────────────── */

function ProgressHeroBanner({
  progress,
  sections,
  saveState,
  onViewReport,
}: {
  progress: BlueprintProgress;
  sections: SectionDef[];
  saveState: SaveState;
  onViewReport: () => void;
}) {
  const totalCount = sections.length;
  const doneCount = sections.filter((s) => progress[s.key] === true).length;
  const allDone = doneCount === totalCount;
  const pct = Math.round((doneCount / totalCount) * 100);

  if (allDone) {
    // ALL 4 DONE — Big celebration banner with prominent CTA
    return (
      <div
        className="relative rounded-2xl p-5 sm:p-6 mb-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, ${BRAND}40 0%, transparent 60%),
            radial-gradient(circle at 0% 100%, ${GREEN}30 0%, transparent 55%),
            linear-gradient(135deg, #0d0d0d 0%, #141414 100%)
          `,
          border: `2px solid ${BRAND}77`,
          boxShadow: `0 12px 40px ${BRAND}44`,
        }}
      >
        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 text-3xl sm:text-4xl"
              style={{
                background: `linear-gradient(135deg, ${BRAND}66, ${BRAND}22)`,
                border: `2px solid ${BRAND}`,
                boxShadow: `0 6px 24px ${BRAND}55`,
              }}
            >
              🎉
            </div>
            <div className="min-w-0">
              <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{
                  background: `${GREEN}22`,
                  color: GREEN,
                  border: `1px solid ${GREEN}55`,
                }}
              >
                <CheckCircle2 size={11} />
                Đã hoàn thành {totalCount}/{totalCount} phần
              </div>
              <h2
                className="text-xl sm:text-2xl font-extrabold leading-tight mb-1"
                style={{ color: BRAND }}
              >
                Báo cáo Premium đã sẵn sàng
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Bấm xem <strong className="text-white">5 phần</strong> báo cáo
                tổng hợp — Entrepreneur Wealth MRI™ · Risk Map™ · Freedom
                Roadmap™ · Financial Prescription™ · Giải pháp toàn diện.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewReport}
            disabled={saveState === "saving"}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm sm:text-base font-extrabold transition-transform hover:scale-[1.03] disabled:opacity-70 disabled:cursor-wait shrink-0"
            style={{
              background: `linear-gradient(135deg, #3B82F6, ${BRAND})`,
              color: "#0a0a0a",
              boxShadow: `0 10px 28px ${BRAND}66`,
              minWidth: 200,
            }}
          >
            {saveState === "saving" ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu…
              </>
            ) : (
              <>
                <FileText size={16} />
                Xem Báo Cáo Tổng Hợp
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // NOT YET DONE — Progress banner with subtle CTA
  return (
    <div
      className="rounded-xl p-4 mb-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.05), transparent)",
        border: `1px solid ${BRAND}33`,
      }}
    >
      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${BRAND}22`, color: BRAND }}
          >
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500"
              >
                Tiến độ
              </span>
              <span
                className="text-sm font-extrabold"
                style={{ color: BRAND }}
              >
                {doneCount}/{totalCount} phần
              </span>
              <span className="text-[10px] text-gray-500">· {pct}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "#1a1a1a" }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${BRAND}cc, ${BRAND})`,
                  boxShadow: `0 0 8px ${BRAND}77`,
                }}
              />
            </div>
            <div className="text-[10.5px] text-gray-500 mt-1.5">
              Hoàn thành cả {totalCount} phần để mở khoá báo cáo Premium tổng hợp.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewReport}
          disabled={saveState === "saving"}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-wait shrink-0"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${BRAND}55`,
            color: BRAND,
          }}
          title="Xem báo cáo (có thể chưa đầy đủ)"
        >
          <FileText size={12} />
          Xem báo cáo
        </button>
      </div>
    </div>
  );
}
