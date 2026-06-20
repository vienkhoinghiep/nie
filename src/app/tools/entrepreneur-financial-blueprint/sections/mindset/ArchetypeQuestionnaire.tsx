"use client";

import { useId } from "react";
import {
  Gift,
  PiggyBank,
  Sparkles,
  Users,
  ClipboardList,
  AlertTriangle,
  Telescope,
  Award,
  Lightbulb,
  ShieldAlert,
  Trophy,
} from "lucide-react";
import {
  MINDSET_CATEGORIES,
  MINDSET_LEVELS,
  MINDSET_QUESTIONS,
  mindsetLevel,
  scoreMindset,
} from "@/lib/blueprint/data/mindset-questions";

const BRAND = "#2563EB";
const PURPLE = "#a855f7";
const GREEN = "#22c55e";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const PINK = "#ec4899";
const CYAN = "#06b6d4";
const BLUE = "#3b82f6";

/** Icon + theme color per nhóm (index 0..6) */
const ARCHETYPE_THEME: Array<{
  icon: typeof Gift;
  color: string;
  emoji: string;
  short: string;
}> = [
  { icon: Gift,           color: PINK,   emoji: "🎁", short: "Cho đi"        }, // 1
  { icon: PiggyBank,      color: BLUE,   emoji: "🐷", short: "Tích lũy"      }, // 2
  { icon: Sparkles,       color: BRAND,  emoji: "✨", short: "Tận hưởng"     }, // 3
  { icon: Users,          color: CYAN,   emoji: "🤝", short: "Kết nối"       }, // 4
  { icon: ClipboardList,  color: GREEN,  emoji: "📋", short: "Quản lý"       }, // 5
  { icon: AlertTriangle,  color: RED,    emoji: "⚠️", short: "Né tránh"      }, // 6
  { icon: Telescope,      color: PURPLE, emoji: "🔭", short: "Tầm nhìn"      }, // 7
];

interface Props {
  answers: Record<number, number>;
  onChange: (answers: Record<number, number>) => void;
}

export default function ArchetypeQuestionnaire({ answers, onChange }: Props) {
  const setAnswer = (qid: number, value: number) => {
    onChange({ ...answers, [qid]: value });
  };

  const answeredCount = MINDSET_QUESTIONS.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const totalCount = MINDSET_QUESTIONS.length;
  const isDone = answeredCount === totalCount;
  const categoryScores = scoreMindset(answers);

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div
        className="rounded-md px-3 py-2.5 text-[11px] leading-snug"
        style={{
          background: `${PURPLE}10`,
          color: PURPLE,
          border: `1px solid ${PURPLE}44`,
        }}
      >
        💡 Đánh giá mức độ phù hợp của từng nhận định với chính anh/chị trong
        thực tế. Trả lời theo bản năng — không có câu đúng/sai.
      </div>

      {/* Progress */}
      <div
        className="rounded-md px-3 py-2 flex items-center justify-between text-[11px]"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid #1f1f1f",
        }}
      >
        <span className="text-gray-400">
          Đã trả lời{" "}
          <strong className="text-white">
            {answeredCount}/{totalCount}
          </strong>
        </span>
        <div
          className="h-1.5 w-32 rounded-full overflow-hidden"
          style={{ background: "#1a1a1a" }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${(answeredCount / totalCount) * 100}%`,
              background: `linear-gradient(90deg, ${BRAND}, ${PURPLE})`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {MINDSET_QUESTIONS.map((q) => (
          <QuestionRow
            key={q.id}
            id={q.id}
            text={q.text}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>

      {/* Live result preview when done */}
      {isDone && <ArchetypeAnalysis categoryScores={categoryScores} />}
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Phân tích chi tiết khi hoàn thành
 * ───────────────────────────────────────────── */

function ArchetypeAnalysis({ categoryScores }: { categoryScores: number[] }) {
  // Index 5 = "Sống Cho Hiện Tại / Né Tránh" — nhóm rào cản (0-based)
  const BARRIER_INDEX = 5;
  const barrierScore = categoryScores[BARRIER_INDEX] ?? 0;
  const barrierLevel = mindsetLevel(barrierScore);

  const totalScore = categoryScores.reduce((s, x) => s + x, 0);
  const totalPct = Math.round((totalScore / 105) * 100);

  // Khuynh hướng chủ đạo (cao nhất, loại trừ rào cản)
  const positiveScores = categoryScores
    .map((score, i) => ({
      score,
      cat: MINDSET_CATEGORIES[i],
      theme: ARCHETYPE_THEME[i],
      idx: i,
    }))
    .filter((g) => g.idx !== BARRIER_INDEX)
    .sort((a, b) => b.score - a.score);

  const dominant = positiveScores[0];
  const secondary = positiveScores[1];
  const topGroups = positiveScores.filter((g) => g.score >= 11).slice(0, 3);

  return (
    <div className="mt-6 space-y-4">
      {/* ─── HERO PERSONA CARD ─── */}
      <div
        className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, ${dominant.theme.color}33 0%, transparent 60%),
            radial-gradient(circle at 0% 100%, ${secondary?.theme.color ?? BRAND}22 0%, transparent 55%),
            linear-gradient(135deg, #0d0d0d 0%, #141414 100%)
          `,
          border: `1px solid ${dominant.theme.color}55`,
          boxShadow: `0 8px 32px ${dominant.theme.color}22`,
        }}
      >
        {/* Top eyebrow */}
        <div className="flex items-center gap-2 mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: `${dominant.theme.color}22`,
              color: dominant.theme.color,
              border: `1px solid ${dominant.theme.color}55`,
            }}
          >
            <Trophy size={10} />
            Khuynh hướng chủ đạo
          </div>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            ✓ 35/35 câu
          </span>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          {/* Left: persona */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${dominant.theme.color}44, ${dominant.theme.color}11)`,
                  border: `1px solid ${dominant.theme.color}77`,
                  boxShadow: `0 4px 16px ${dominant.theme.color}33`,
                }}
              >
                {dominant.theme.emoji}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Anh / Chị là
                </div>
                <h3
                  className="text-xl sm:text-2xl font-extrabold leading-tight"
                  style={{ color: dominant.theme.color }}
                >
                  {dominant.cat.name}
                </h3>
                {dominant.cat.alias && (
                  <div className="text-xs text-gray-400 italic mt-0.5">
                    “{dominant.cat.alias}”
                  </div>
                )}
              </div>
            </div>
            <p className="text-[12px] text-gray-300 leading-relaxed">
              💡 {dominant.cat.highMeaning}
            </p>
            {secondary && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px]">
                <span className="text-gray-500">Khuynh hướng phụ:</span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold"
                  style={{
                    background: `${secondary.theme.color}1a`,
                    color: secondary.theme.color,
                    border: `1px solid ${secondary.theme.color}55`,
                  }}
                >
                  <span>{secondary.theme.emoji}</span>
                  {secondary.cat.name}{" "}
                  <span className="opacity-70">· {secondary.score}/15</span>
                </span>
              </div>
            )}
          </div>

          {/* Right: total score ring */}
          <div className="flex justify-center">
            <TotalScoreRing
              score={totalScore}
              pct={totalPct}
              color={dominant.theme.color}
            />
          </div>
        </div>
      </div>

      {/* ─── RADAR + GRID 2-COL ─── */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        {/* Radar chart */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#0d0d0d",
            border: "1px solid #1f1f1f",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} style={{ color: BRAND }} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Bản đồ 7 khuynh hướng
            </h4>
          </div>
          <ArchetypeRadar scores={categoryScores} />
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#666" }}
              />
              0-5 Thấp
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: BRAND }}
              />
              6-10 TB
            </div>
            <div className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: GREEN }}
              />
              11-15 Cao
            </div>
          </div>
        </div>

        {/* Top khuynh hướng */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: `linear-gradient(135deg, ${BRAND}0d, transparent)`,
            border: `1px solid ${BRAND}44`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: BRAND }} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              {topGroups.length > 0
                ? `Top ${topGroups.length} điểm mạnh`
                : "Chưa có nhóm nào ở mức Cao"}
            </h4>
          </div>
          {topGroups.length > 0 ? (
            <div className="space-y-2.5">
              {topGroups.map((g, rank) => {
                const Icon = g.theme.icon;
                return (
                  <div
                    key={g.cat.index}
                    className="rounded-xl p-3"
                    style={{
                      background: `linear-gradient(135deg, ${g.theme.color}0d, transparent)`,
                      border: `1px solid ${g.theme.color}44`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                        style={{
                          background: `${g.theme.color}22`,
                          color: g.theme.color,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-[12px] font-extrabold text-white truncate">
                            <span className="text-gray-500 font-bold">
                              #{rank + 1}
                            </span>{" "}
                            {g.cat.name}
                          </div>
                          <span
                            className="text-sm font-extrabold whitespace-nowrap"
                            style={{ color: g.theme.color }}
                          >
                            {g.score}
                            <span className="text-[10px] text-gray-500 font-normal">
                              /15
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-snug mt-2">
                      💡 {g.cat.highMeaning}
                    </p>
                    <p className="text-[10.5px] text-gray-500 leading-snug mt-1 italic">
                      ⚠ {g.cat.caution}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Tất cả 6 nhóm tích cực đang ở mức Thấp hoặc Trung bình. Đây là
              cơ hội để xây dựng khuynh hướng chủ đạo theo định hướng riêng
              của anh/chị.
            </p>
          )}
        </div>
      </div>

      {/* ─── BARRIER ALERT ─── */}
      {barrierLevel !== "Thấp" && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 100% 0%, ${barrierLevel === "Cao" ? RED : AMBER}22 0%, transparent 50%),
              linear-gradient(135deg, #0d0d0d, #141414)
            `,
            border: `1px solid ${barrierLevel === "Cao" ? RED : AMBER}55`,
          }}
        >
          <div className="grid sm:grid-cols-[auto_1fr_auto] gap-3 items-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${barrierLevel === "Cao" ? RED : AMBER}22`,
                color: barrierLevel === "Cao" ? RED : AMBER,
              }}
            >
              <ShieldAlert size={22} />
            </div>
            <div className="min-w-0">
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{
                  color: barrierLevel === "Cao" ? RED : AMBER,
                }}
              >
                ⚠ Cảnh báo nhóm rào cản
              </div>
              <h4 className="text-sm font-extrabold text-white leading-tight">
                {MINDSET_CATEGORIES[BARRIER_INDEX].name}
                <span className="text-gray-500 font-normal">
                  {" "}(Rào cản)
                </span>
              </h4>
              <p className="text-[11px] text-gray-300 leading-snug mt-1">
                {MINDSET_CATEGORIES[BARRIER_INDEX].highMeaning}
              </p>
              <p className="text-[10.5px] text-gray-400 leading-snug mt-1">
                👉 {MINDSET_CATEGORIES[BARRIER_INDEX].caution}
              </p>
            </div>
            <div className="text-right sm:text-center sm:min-w-[64px]">
              <div
                className="text-3xl font-extrabold leading-none"
                style={{ color: barrierLevel === "Cao" ? RED : AMBER }}
              >
                {barrierScore}
              </div>
              <div className="text-[9px] text-gray-500 font-bold mt-0.5">
                /15
              </div>
              <div
                className="text-[9px] font-extrabold uppercase tracking-widest mt-1"
                style={{ color: barrierLevel === "Cao" ? RED : AMBER }}
              >
                {barrierLevel}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7-CARD GRID (icon + mini gauge) ─── */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Lightbulb size={14} style={{ color: BRAND }} />
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Chi tiết 7 nhóm khuynh hướng
          </h4>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {categoryScores.map((score, i) => (
            <ArchetypeCard
              key={i}
              score={score}
              cat={MINDSET_CATEGORIES[i]}
              theme={ARCHETYPE_THEME[i]}
              isBarrier={i === BARRIER_INDEX}
            />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10.5px] text-gray-500 leading-relaxed text-center pt-2">
        Phân tích sâu hơn (kết hợp Yêu Tiền + Niềm Tin → 6 Money Personality)
        sẽ có trong báo cáo Premium ở mục cuối.
      </p>
    </div>
  );
}

/* ─── Sub-components ─── */

function TotalScoreRing({
  score,
  pct,
  color,
}: {
  score: number;
  pct: number;
  color: string;
}) {
  const gid = useId();
  const size = 130;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={`ring-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={BRAND} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f1f1f" strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#ring-${gid})`}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
          Tổng
        </div>
        <div
          className="text-3xl font-extrabold leading-none mt-0.5"
          style={{ color }}
        >
          {score}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">/ 105</div>
      </div>
    </div>
  );
}

function ArchetypeRadar({ scores }: { scores: number[] }) {
  const gid = useId();
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 28;
  const N = 7;

  // Polar → Cartesian (start from top)
  const polar = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / N - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Rings 5/10/15
  const rings = [5, 10, 15];

  // Data polygon points
  const dataPts = scores
    .map((s, i) => {
      const p = polar(i, (Math.min(15, s) / 15) * maxR);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id={`radarFill-${gid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.55" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* Background rings */}
        {rings.map((v) => {
          const pts = Array.from({ length: N }, (_, i) =>
            polar(i, (v / 15) * maxR)
          )
            .map((p) => `${p.x},${p.y}`)
            .join(" ");
          return (
            <polygon
              key={v}
              points={pts}
              fill="none"
              stroke="#2a2a2a"
              strokeWidth={1}
              strokeDasharray={v === 15 ? "0" : "2 3"}
            />
          );
        })}

        {/* Spokes */}
        {Array.from({ length: N }, (_, i) => {
          const p = polar(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#222"
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPts}
          fill={`url(#radarFill-${gid})`}
          stroke={BRAND}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {scores.map((s, i) => {
          const p = polar(i, (Math.min(15, s) / 15) * maxR);
          const theme = ARCHETYPE_THEME[i];
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={theme.color}
              stroke="#0d0d0d"
              strokeWidth={2}
            />
          );
        })}

        {/* Axis labels */}
        {ARCHETYPE_THEME.map((theme, i) => {
          const p = polar(i, maxR + 16);
          const anchor =
            Math.abs(p.x - cx) < 8
              ? "middle"
              : p.x < cx
                ? "end"
                : "start";
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="700"
              fill={theme.color}
            >
              {theme.emoji} {theme.short}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function ArchetypeCard({
  score,
  cat,
  theme,
  isBarrier,
}: {
  score: number;
  cat: (typeof MINDSET_CATEGORIES)[number];
  theme: (typeof ARCHETYPE_THEME)[number];
  isBarrier: boolean;
}) {
  const level = mindsetLevel(score);
  // For barrier: high = bad (red); for others: high = good (green)
  const goodWhenHigh = !isBarrier;
  const c =
    level === "Cao"
      ? goodWhenHigh
        ? GREEN
        : RED
      : level === "Trung bình"
        ? goodWhenHigh
          ? BRAND
          : AMBER
        : "#555";
  const pct = (score / 15) * 100;
  const Icon = theme.icon;

  return (
    <div
      className="relative rounded-xl p-3 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.color}0d, transparent 70%), #0d0d0d`,
        border: `1px solid ${c}55`,
      }}
    >
      {/* Top row: icon + name + score */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${theme.color}33, ${theme.color}11)`,
            color: theme.color,
            border: `1px solid ${theme.color}44`,
          }}
        >
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            #{cat.index}
            {isBarrier && (
              <span
                className="px-1 py-0.5 rounded text-[8px] font-extrabold"
                style={{ background: `${RED}22`, color: RED }}
              >
                Rào cản
              </span>
            )}
          </div>
          <div className="text-[12px] font-extrabold text-white leading-tight truncate">
            {cat.name}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-xl font-extrabold leading-none"
            style={{ color: c }}
          >
            {score}
          </div>
          <div className="text-[9px] text-gray-500 font-bold">/15</div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden mb-2 relative"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${c}cc, ${c})`,
            boxShadow: `0 0 8px ${c}55`,
          }}
        />
        {/* Threshold markers at 6 & 11 */}
        <div
          className="absolute top-0 bottom-0 w-px opacity-50"
          style={{ left: `${(6 / 15) * 100}%`, background: "#444" }}
        />
        <div
          className="absolute top-0 bottom-0 w-px opacity-50"
          style={{ left: `${(11 / 15) * 100}%`, background: "#444" }}
        />
      </div>

      {/* Level badge */}
      <div className="flex items-center justify-between text-[10px]">
        <span
          className="font-extrabold uppercase tracking-wider"
          style={{ color: c }}
        >
          {level}
          {cat.alias && (
            <span className="text-gray-500 font-normal normal-case">
              {" · "}
              {cat.alias}
            </span>
          )}
        </span>
        {level === "Cao" && !isBarrier && (
          <span style={{ color: c }} className="font-bold">
            ★ Điểm mạnh
          </span>
        )}
      </div>
    </div>
  );
}

function QuestionRow({
  id,
  text,
  value,
  onChange,
}: {
  id: number;
  text: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  const hasAnswer = value !== undefined;
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: hasAnswer ? `${BRAND}06` : "#0a0a0a",
        border: `1px solid ${hasAnswer ? `${BRAND}33` : "#1f1f1f"}`,
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <span
          className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-extrabold"
          style={{
            background: hasAnswer ? `${BRAND}22` : "#1a1a1a",
            color: hasAnswer ? BRAND : "#888",
          }}
        >
          {id}
        </span>
        <p className="text-[12.5px] text-gray-200 leading-snug flex-1">
          {text}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {MINDSET_LEVELS.map((lvl) => {
          const active = value === lvl.value;
          return (
            <button
              key={lvl.value}
              type="button"
              onClick={() => onChange(lvl.value)}
              className="px-2 py-1.5 rounded-md text-[10.5px] font-bold transition-colors"
              style={{
                background: active ? `${BRAND}22` : "#0f0f0f",
                color: active ? BRAND : "#888",
                border: `1px solid ${active ? `${BRAND}77` : "#2a2a2a"}`,
              }}
            >
              <span className="block text-[10px]">{lvl.value}</span>
              <span className="block text-[9px] mt-0.5 leading-tight">
                {lvl.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
