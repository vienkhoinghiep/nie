import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Share2,
  TrendingUp,
  ShieldCheck,
  PlayCircle,
  Target,
  Coins,
} from "lucide-react";
import type {
  MetricScore,
  GroupScore,
  GroupKey,
  Rating,
  FinancialHealthInputs,
} from "@/lib/financial-health/score";
import { formatVND } from "@/lib/financial-health/score";
import { buildRecommendation } from "@/lib/financial-health/recommend";
import { getBaseUrl } from "@/lib/site-config";
import FounderMoneyResetSalepage from "@/components/sales/FounderMoneyResetSalepage";

/** A → E section letters + clean labels for the metric breakdown section. */
const GROUP_DISPLAY: Record<GroupKey, { letter: string; label: string }> = {
  spending: { letter: "A", label: "Chi tiêu" },
  liquidity: { letter: "B", label: "Thanh khoản" },
  accumulation: { letter: "C", label: "Tích luỹ tài sản" },
  protection: { letter: "D", label: "Bảo vệ tài chính" },
  allocation: { letter: "E", label: "Tài sản" },
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Kết quả Sức Khoẻ Tài Chính — ${siteConfig.name}`,
  description: "Kết quả chi tiết bài kiểm tra sức khoẻ tài chính cá nhân.",
  robots: { index: false, follow: false }, // không cho Google index personal results
};

interface AssessmentRow {
  id: string;
  token: string;
  assessment_type: string;
  email: string;
  full_name: string;
  total_score: number;
  rating: Rating;
  inputs: FinancialHealthInputs;
  scores: {
    metrics: MetricScore[];
    groups?: GroupScore[]; // present for v2 rows; legacy rows fall back below
    summary: string;
  };
  created_at: string;
}

/** Reconstruct groups from metrics for legacy rows that didn't store groups. */
function deriveGroups(metrics: MetricScore[]): GroupScore[] {
  const labels: Record<string, string> = {
    spending: "Chi tiêu",
    liquidity: "Thanh khoản",
    accumulation: "Tích luỹ tài sản",
    protection: "Bảo vệ tài chính",
    allocation: "Cấu trúc tài sản theo tuổi",
  };
  const order: GroupScore["key"][] = [
    "spending",
    "liquidity",
    "accumulation",
    "protection",
    "allocation",
  ];
  return order.map((k) => {
    const ms = metrics.filter((m) => m.group === k);
    const sum = ms.reduce((s, m) => s + m.score, 0);
    const max = ms.length * 10;
    const pct = max > 0 ? Math.round((sum / max) * 100) : 0;
    return {
      key: k,
      label: labels[k] ?? k,
      metrics: ms,
      score: sum,
      max_score: max,
      pct,
      rating: pct >= 70 ? "good" : pct >= 40 ? "fair" : "critical",
    };
  });
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-z0-9]{6,32}$/i.test(token)) notFound();

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("financial_assessments")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) notFound();
  const r = data as AssessmentRow;

  const result = r.scores;
  const metrics = result.metrics ?? [];
  const groups: GroupScore[] =
    result.groups && result.groups.length > 0
      ? result.groups
      : deriveGroups(metrics);

  const ratingColor =
    r.rating === "good" ? "#22c55e" : r.rating === "fair" ? "#f59e0b" : "#ef4444";
  const ratingLabel =
    r.rating === "good"
      ? "TỐT"
      : r.rating === "fair"
        ? "TRUNG BÌNH"
        : "CẦN CHÚ Ý";

  // Build a 5-axis radar (one axis per group, value = group.pct 0-100).
  const radarSize = 320;
  const radarCenter = radarSize / 2;
  const radarRadius = radarSize / 2 - 44;
  const radarPoints = groups.map((g, i) => {
    const angle = (Math.PI * 2 * i) / groups.length - Math.PI / 2;
    const r = (g.pct / 100) * radarRadius;
    const cleanLabel = GROUP_DISPLAY[g.key]?.label ?? g.label;
    return {
      x: radarCenter + r * Math.cos(angle),
      y: radarCenter + r * Math.sin(angle),
      labelX: radarCenter + (radarRadius + 22) * Math.cos(angle),
      labelY: radarCenter + (radarRadius + 22) * Math.sin(angle),
      label: cleanLabel,
    };
  });
  const radarPath = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Build personalised upsell for Gói Hướng Dẫn based on weakest metrics.
  const rec = buildRecommendation(
    {
      metrics,
      groups,
      total_score: r.total_score,
      rating: r.rating,
      summary: result.summary,
      inputs: r.inputs,
    },
    getBaseUrl()
  );

  // Urgency-driven palette for the upsell card on this dark theme page.
  const upsellAccent =
    rec.urgency === "high" ? "#ef4444" : rec.urgency === "low" ? "#22c55e" : "#2563EB";

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
            style={{ background: `${ratingColor}1a`, color: ratingColor, border: `1px solid ${ratingColor}55` }}
          >
            <Activity size={11} />
            Kết quả Sức Khoẻ Tài Chính
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-2">
            Xin chào {r.full_name},
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Đây là tổng kết chi tiết dựa trên 11 chỉ số tài chính, chia theo 5 nhóm
            sức khoẻ tài chính chuẩn của gia đình Việt.
          </p>
        </div>

        {/* Total score card */}
        <div
          className="rounded-2xl p-6 sm:p-8 mb-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${ratingColor}0d, ${ratingColor}05)`,
            border: `1px solid ${ratingColor}55`,
          }}
        >
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-3">
            Tổng điểm Sức Khoẻ Tài Chính
          </div>
          <div className="leading-none">
            <span className="text-6xl sm:text-7xl font-extrabold" style={{ color: ratingColor }}>
              {r.total_score}
            </span>
            <span className="text-2xl text-gray-500 font-bold"> / 100</span>
          </div>
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-4"
            style={{ background: ratingColor, color: "#1a1a1a" }}
          >
            {ratingLabel}
          </div>
          <p className="text-sm sm:text-base text-gray-300 italic mt-4 sm:whitespace-nowrap">
            {result.summary}
          </p>
        </div>

        {/* Radar (5 group axes) + Group score chips */}
        <div className="grid md:grid-cols-[320px_1fr] gap-6 mb-6">
          {/* Radar */}
          <div className="card-dark p-5 flex items-center justify-center">
            <svg viewBox={`0 0 ${radarSize} ${radarSize}`} className="w-full max-w-[320px]">
              {/* Background rings (4 = 25/50/75/100%) */}
              {[1, 2, 3, 4].map((ring) => (
                <polygon
                  key={ring}
                  points={groups
                    .map((_, i) => {
                      const angle = (Math.PI * 2 * i) / groups.length - Math.PI / 2;
                      const r = (ring / 4) * radarRadius;
                      const x = radarCenter + r * Math.cos(angle);
                      const y = radarCenter + r * Math.sin(angle);
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#2a2a2a"
                  strokeWidth="1"
                />
              ))}
              {/* Axis lines */}
              {groups.map((_, i) => {
                const angle = (Math.PI * 2 * i) / groups.length - Math.PI / 2;
                return (
                  <line
                    key={i}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={radarCenter + radarRadius * Math.cos(angle)}
                    y2={radarCenter + radarRadius * Math.sin(angle)}
                    stroke="#2a2a2a"
                    strokeWidth="1"
                  />
                );
              })}
              {/* Score polygon */}
              <polygon
                points={radarPath}
                fill={ratingColor}
                fillOpacity="0.25"
                stroke={ratingColor}
                strokeWidth="2"
              />
              {/* Score points */}
              {radarPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={ratingColor} />
              ))}
              {/* Labels */}
              {radarPoints.map((p, i) => {
                const textAnchor =
                  p.labelX < radarCenter - 4 ? "end" : p.labelX > radarCenter + 4 ? "start" : "middle";
                return (
                  <text
                    key={`l-${i}`}
                    x={p.labelX}
                    y={p.labelY}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="#9ca3af"
                    fontWeight="700"
                  >
                    {p.label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* 5 group score chips */}
          <div className="card-dark p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {groups.map((g) => {
              const c =
                g.rating === "good" ? "#22c55e" : g.rating === "fair" ? "#f59e0b" : "#ef4444";
              return (
                <div
                  key={g.key}
                  className="rounded-xl p-3"
                  style={{ background: "#0a0a0a", border: `1px solid ${c}44` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="text-[11px] uppercase tracking-wide text-gray-400 font-bold">
                      {GROUP_DISPLAY[g.key]?.label ?? g.label}
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                      style={{ background: c, color: "#1a1a1a" }}
                    >
                      {g.score}/{g.max_score}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${g.pct}%`, background: c }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1.5 text-right">{g.pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Cảnh báo + chẩn đoán cá nhân hoá (Founder Money Reset™) ───
            Đặt ngay sau radar để người dùng thấy chẩn đoán trước khi xem
            video phân tích chung. */}
        <div
          className="card-dark p-5 sm:p-7 mb-10"
          style={{
            background: `linear-gradient(135deg, ${upsellAccent}10, ${upsellAccent}03)`,
            border: `1px solid ${upsellAccent}55`,
            boxShadow: `0 10px 40px ${upsellAccent}11`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: `${upsellAccent}22`,
                color: upsellAccent,
                border: `1px solid ${upsellAccent}55`,
              }}
            >
              <TrendingUp size={11} />
              Gợi ý cá nhân hoá
            </div>
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "#22c55e",
                border: "1px solid rgba(34,197,94,0.35)",
              }}
            >
              <ShieldCheck size={10} />
              Hoàn lại 100%
            </div>
          </div>

          <h3 className="text-white font-extrabold text-lg sm:text-2xl leading-snug mb-3">
            {rec.headline}
          </h3>

          {/* Diagnosis body */}
          <p
            className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: rec.body }}
          />

          {/* Weakness bullets */}
          {rec.weakness_bullets.length > 0 && (
            <ul className="space-y-2 mb-5">
              {rec.weakness_bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300 leading-relaxed">
                  <span
                    className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold mt-0.5"
                    style={{ background: `${upsellAccent}22`, color: upsellAccent }}
                  >
                    {i + 1}
                  </span>
                  <span dangerouslySetInnerHTML={{ __html: b }} />
                </li>
              ))}
            </ul>
          )}

          {rec.good_state_note && (
            <p
              className="text-xs italic text-gray-400 mb-0"
              dangerouslySetInnerHTML={{ __html: rec.good_state_note }}
            />
          )}
        </div>

        {/* ─── Video phân tích bộ chỉ số (giảng viên) ─── */}
        <VideoAnalysisSection />

        {/* ─── BỘ CHỈ SỐ ĐO LƯỜNG SỨC KHOẺ CỦA ANH/CHỊ ─── */}
        <div className="text-center mb-7">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            Bộ Chỉ Số Đo Lường Sức Khoẻ Tài Chính Của Bạn
          </h2>
          <p className="text-sm text-gray-400 mt-2 sm:whitespace-nowrap">
            Mỗi chỉ số kèm mục tiêu khuyến nghị + chẩn đoán ngắn để anh/chị biết cần cải thiện ở đâu.
          </p>
        </div>

        {/* Detailed metrics grouped — A → E */}
        <div className="space-y-7 mb-10">
          {groups.map((g) => {
            const groupColor =
              g.rating === "good" ? "#22c55e" : g.rating === "fair" ? "#f59e0b" : "#ef4444";
            const display = GROUP_DISPLAY[g.key];
            const letter = display?.letter ?? "";
            const cleanLabel = display?.label ?? g.label;

            return (
              <div key={g.key}>
                {/* Group header with A./B./C. prefix */}
                <div className="flex items-center gap-3 mb-4 pb-2.5 border-b border-[#1f1f1f]">
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base font-extrabold"
                    style={{
                      background: `linear-gradient(135deg, ${groupColor}, ${groupColor}aa)`,
                      color: "#0a0a0a",
                    }}
                  >
                    {letter}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      Bộ chỉ số
                    </div>
                    <div
                      className="text-base sm:text-lg font-extrabold leading-tight"
                      style={{ color: groupColor }}
                    >
                      {cleanLabel}
                    </div>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                    style={{ background: `${groupColor}22`, color: groupColor, border: `1px solid ${groupColor}55` }}
                  >
                    {g.score}/{g.max_score} ({g.pct}%)
                  </div>
                </div>

                {/* Group body — special render for C (accumulation): show target + actual VND */}
                {g.key === "accumulation" ? (
                  <AccumulationGroupBody
                    inputs={r.inputs}
                    metric={g.metrics[0]}
                    groupColor={groupColor}
                  />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {g.metrics.map((m) => (
                      <MetricCard key={m.key} m={m} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Full Founder Money Reset™ salepage */}
        <FounderMoneyResetSalepage />

        {/* Share + footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <div className="inline-flex items-center gap-2">
            <Share2 size={11} />
            Link kết quả của anh/chị (riêng tư):
            <code className="text-[#2563EB] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[10px] break-all">
              /results/{token}
            </code>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-gray-600">
            {r.rating === "good" ? <CheckCircle2 size={11} className="text-green-400" /> : <AlertCircle size={11} />}
            <span>Kết quả đã được gửi tới <strong className="text-gray-400">{r.email}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Sub-components
 * ───────────────────────────────────────────── */

/**
 * Standard metric card — used for all groups except C (accumulation).
 */
function MetricCard({ m }: { m: MetricScore }) {
  const color =
    m.rating === "good" ? "#22c55e" : m.rating === "fair" ? "#f59e0b" : "#ef4444";
  const valueDisplay = m.unit === "năm" && m.value >= 99 ? "∞" : `${m.value}`;
  return (
    <div
      className="rounded-xl p-3.5"
      style={{ background: "#0a0a0a", border: `1px solid ${color}33` }}
    >
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="text-sm font-bold text-white">{m.label}</div>
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
          style={{ background: color, color: "#1a1a1a" }}
        >
          {m.score}/10
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div className="text-lg font-extrabold" style={{ color }}>
          {valueDisplay}
          <span className="text-xs ml-0.5 font-medium" style={{ color }}>
            {" "}
            {m.unit}
          </span>
        </div>
        <div className="text-[10px] text-gray-500">Mục tiêu: {m.ideal}</div>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden mb-2"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(m.score / 10) * 100}%`, background: color }}
        />
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed">{m.hint}</p>
    </div>
  );
}

/**
 * Group C (Tích luỹ tài sản) — surfaces both the formula target VND
 * (tuổi × thu nhập năm / 10) and the actual VND accumulated, instead of
 * showing only the ratio metric. The score badge sits on the actual card.
 */
function AccumulationGroupBody({
  inputs,
  metric,
  groupColor,
}: {
  inputs: FinancialHealthInputs;
  metric: MetricScore | undefined;
  groupColor: string;
}) {
  const refAge =
    inputs.age_husband > 0
      ? inputs.age_husband
      : inputs.age_wife > 0
        ? inputs.age_wife
        : 35;
  const annualIncome = inputs.monthly_income * 12;
  const target = (refAge * annualIncome) / 10;
  const actual =
    inputs.assets_liquid +
    inputs.assets_growth +
    inputs.assets_cashflow +
    inputs.assets_consumption;
  const pct = target > 0 ? Math.round((actual / target) * 100) : 0;

  const score = metric?.score ?? 0;
  const hint = metric?.hint ?? "";
  const cardColor =
    score >= 7 ? "#22c55e" : score >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {/* 1. Tài sản cần tích luỹ */}
      <div
        className="rounded-xl p-3.5"
        style={{ background: "#0a0a0a", border: `1px solid ${groupColor}33` }}
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Target size={14} style={{ color: groupColor }} />
            <div className="text-sm font-bold text-white">Tài sản cần tích luỹ</div>
          </div>
          <div className="text-[10px] text-gray-500 italic">Mục tiêu</div>
        </div>
        <div className="text-lg sm:text-xl font-extrabold mb-1" style={{ color: groupColor }}>
          {formatVND(target)}
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Công thức:{" "}
          <span className="text-gray-300">
            (tuổi <strong>{refAge}</strong> × thu nhập năm{" "}
            <strong>{formatVND(annualIncome)}</strong>) ÷ 10
          </span>
        </p>
      </div>

      {/* 2. Tài sản đã tích luỹ + score */}
      <div
        className="rounded-xl p-3.5"
        style={{ background: "#0a0a0a", border: `1px solid ${cardColor}33` }}
      >
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <Coins size={14} style={{ color: cardColor }} />
            <div className="text-sm font-bold text-white">Tài sản đã tích luỹ</div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
            style={{ background: cardColor, color: "#1a1a1a" }}
          >
            {score}/10
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <div className="text-lg sm:text-xl font-extrabold" style={{ color: cardColor }}>
            {formatVND(actual)}
          </div>
          <div className="text-[10px] text-gray-500 whitespace-nowrap">
            ≈ {pct}% mục tiêu
          </div>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden mb-2"
          style={{ background: "#1a1a1a" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (score / 10) * 100)}%`,
              background: cardColor,
            }}
          />
        </div>
        {hint && (
          <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Video phân tích giảng viên — YouTube embed.
 *
 * URL configurable via env var NEXT_PUBLIC_FH_ANALYSIS_VIDEO_ID (YouTube
 * 11-char ID, e.g. "dQw4w9WgXcQ"). If unset, renders a graceful
 * "coming soon" placeholder.
 */
function VideoAnalysisSection() {
  const videoId = process.env.NEXT_PUBLIC_FH_ANALYSIS_VIDEO_ID ?? "";
  const hasVideo = /^[A-Za-z0-9_-]{6,16}$/.test(videoId);

  return (
    <section className="mb-10">
      <div className="text-center mb-5">
        <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Trước khi xem chi tiết từng chỉ số, anh/chị hãy dành ít phút nghe thầy
          giải thích cách đọc kết quả — tránh hiểu sai chỉ số.
        </p>
      </div>

      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: "16/9",
          background: "#000",
          border: "1px solid #2a2a2a",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {hasVideo ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="Phân tích bộ chỉ số sức khoẻ tài chính"
            className="absolute inset-0 w-full h-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "rgba(37,99,235,0.14)",
                border: "1px solid rgba(37,99,235,0.55)",
              }}
            >
              <PlayCircle size={32} className="text-[#2563EB]" />
            </div>
            <div className="text-base sm:text-lg font-bold text-white mb-1">
              🎬 Video phân tích đang được thầy quay
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Sẽ ra mắt sớm. Trong lúc chờ, anh/chị có thể xem chi tiết từng chỉ
              số bên dưới hoặc đăng ký nhận thông báo qua email.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
