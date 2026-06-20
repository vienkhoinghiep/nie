"use client";

import { useId } from "react";
import {
  Brain,
  Ban,
  User,
  HeartCrack,
  EyeOff,
  CheckCircle2,
  AlertOctagon,
  Lightbulb,
} from "lucide-react";
import {
  BELIEF_QUESTIONS,
  BELIEF_THEMES,
  avgBeliefTheme,
  beliefsAverage,
  beliefsStrongCount,
  beliefsTier,
  scoreBeliefs,
  topLimitingBeliefs,
} from "@/lib/blueprint/data/beliefs-questions";

const BRAND = "#2563EB";
const RED = "#ef4444";
const PURPLE = "#a855f7";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const BLUE = "#3b82f6";

/** Icon + color per nhóm chủ đề niềm tin A-E */
const THEME_META: Record<
  string,
  { icon: typeof Ban; color: string; emoji: string }
> = {
  A: { icon: Ban,        color: "#ef4444", emoji: "🚫" },  // Tiền là xấu
  B: { icon: User,       color: "#f97316", emoji: "🙅" },  // Không xứng đáng
  C: { icon: HeartCrack, color: "#a855f7", emoji: "💔" },  // Phải đánh đổi
  D: { icon: EyeOff,     color: "#3b82f6", emoji: "🙈" },  // Né tránh
  E: { icon: CheckCircle2, color: "#22c55e", emoji: "✅" }, // Trung tính
};

interface Props {
  answers: Record<number, number>;
  onChange: (answers: Record<number, number>) => void;
}

export default function BeliefsQuestionnaire({ answers, onChange }: Props) {
  const setAnswer = (qid: number, value: number) => {
    onChange({ ...answers, [qid]: value });
  };

  const answeredCount = BELIEF_QUESTIONS.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const totalCount = BELIEF_QUESTIONS.length;
  const isDone = answeredCount === totalCount;
  const totalScore = scoreBeliefs(answers);
  const maxScore = totalCount * 10;

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
        💡 Cho điểm <strong>1-10</strong> mức độ đồng ý với mỗi nhận định.{" "}
        <strong>1</strong> = 100% không đồng ý · <strong>10</strong> = 100%
        đồng ý. Đa số nhận định mang tính giới hạn — điểm càng thấp càng tốt.
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
        {BELIEF_QUESTIONS.map((q) => (
          <QuestionRow
            key={q.id}
            id={q.id}
            text={q.text}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>

      {/* Live result when done */}
      {isDone && (
        <BeliefsAnalysis
          answers={answers}
          totalScore={totalScore}
          maxScore={maxScore}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Phân tích chi tiết khi hoàn thành
 * ───────────────────────────────────────────── */

function BeliefsAnalysis({
  answers,
  totalScore,
  maxScore,
}: {
  answers: Record<number, number>;
  totalScore: number;
  maxScore: number;
}) {
  const avg = beliefsAverage(answers);
  const tier = beliefsTier(avg);
  const strongCount = beliefsStrongCount(answers);
  const tierColor =
    tier.tier === 1 ? GREEN : tier.tier === 2 ? AMBER : RED;
  const top = topLimitingBeliefs(answers, 5);
  const pct = Math.round((totalScore / maxScore) * 100);

  // Limiting themes A-D (for analysis)
  const limitingThemes = BELIEF_THEMES.filter((t) => t.isLimiting);
  const neutralTheme = BELIEF_THEMES.find((t) => !t.isLimiting);

  // Heaviest theme = highest avg among limiting
  const heaviest = limitingThemes
    .map((t) => ({ theme: t, avg: avgBeliefTheme(t, answers) }))
    .sort((a, b) => b.avg - a.avg)[0];

  return (
    <div className="mt-6 space-y-4">
      {/* ─── HERO CARD ─── */}
      <div
        className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, ${tierColor}33 0%, transparent 60%),
            radial-gradient(circle at 0% 100%, ${PURPLE}1f 0%, transparent 55%),
            linear-gradient(135deg, #0d0d0d 0%, #141414 100%)
          `,
          border: `1px solid ${tierColor}55`,
          boxShadow: `0 8px 32px ${tierColor}22`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
            style={{
              background: `${tierColor}22`,
              color: tierColor,
              border: `1px solid ${tierColor}55`,
            }}
          >
            <Brain size={10} />
            Niềm tin về tiền
          </div>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            ✓ 72/72 câu
          </span>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${tierColor}44, ${tierColor}11)`,
                  border: `1px solid ${tierColor}77`,
                  boxShadow: `0 4px 16px ${tierColor}33`,
                }}
              >
                {tier.tier === 1 ? "🧠" : tier.tier === 2 ? "🤔" : "⛓️"}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Mức tải trọng niềm tin
                </div>
                <h3
                  className="text-xl sm:text-2xl font-extrabold leading-tight"
                  style={{ color: tierColor }}
                >
                  {tier.label}
                </h3>
                <div className="text-xs text-gray-500 italic mt-0.5">
                  Trung bình {avg.toFixed(1)}/10 mỗi nhận định
                </div>
              </div>
            </div>
            <p className="text-[12px] text-gray-300 leading-relaxed">
              {tier.desc}
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <StatPill
                icon={Brain}
                label="Tổng điểm"
                value={`${totalScore}/${maxScore}`}
                color={tierColor}
              />
              <StatPill
                icon={AlertOctagon}
                label="Câu giới hạn mạnh"
                value={`${strongCount} câu`}
                color={strongCount > 10 ? RED : strongCount > 0 ? AMBER : GREEN}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <BeliefScoreRing
              score={totalScore}
              max={maxScore}
              pct={pct}
              color={tierColor}
            />
          </div>
        </div>
      </div>

      {/* ─── HEAVIEST THEME ALERT ─── */}
      {heaviest && heaviest.avg >= 4 && (
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 100% 0%, ${THEME_META[heaviest.theme.key].color}22 0%, transparent 50%),
              linear-gradient(135deg, #0d0d0d, #141414)
            `,
            border: `1px solid ${THEME_META[heaviest.theme.key].color}55`,
          }}
        >
          <div className="grid sm:grid-cols-[auto_1fr_auto] gap-3 items-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{
                background: `${THEME_META[heaviest.theme.key].color}22`,
                border: `1px solid ${THEME_META[heaviest.theme.key].color}55`,
              }}
            >
              {THEME_META[heaviest.theme.key].emoji}
            </div>
            <div className="min-w-0">
              <div
                className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
                style={{ color: THEME_META[heaviest.theme.key].color }}
              >
                Nhóm niềm tin chiếm ưu thế
              </div>
              <h4 className="text-sm font-extrabold text-white leading-tight">
                {heaviest.theme.label}
              </h4>
              <p className="text-[11px] text-gray-300 leading-snug mt-1">
                {heaviest.theme.description}
              </p>
            </div>
            <div className="text-right">
              <div
                className="text-3xl font-extrabold leading-none"
                style={{ color: THEME_META[heaviest.theme.key].color }}
              >
                {heaviest.avg.toFixed(1)}
              </div>
              <div className="text-[9px] text-gray-500 font-bold mt-0.5">
                /10 TB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5 THEMES GRID ─── */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Lightbulb size={14} style={{ color: BRAND }} />
          <h4 className="text-xs font-bold uppercase tracking-widest text-white">
            Phân tích 5 nhóm chủ đề
          </h4>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {limitingThemes.map((theme) => (
            <BeliefThemeCard
              key={theme.key}
              theme={theme}
              avg={avgBeliefTheme(theme, answers)}
            />
          ))}
        </div>
        {/* Neutral theme — full width */}
        {neutralTheme && (
          <div className="mt-2.5">
            <BeliefThemeCard
              theme={neutralTheme}
              avg={avgBeliefTheme(neutralTheme, answers)}
            />
          </div>
        )}
      </div>

      {/* ─── TOP LIMITING BELIEFS ─── */}
      {top.length > 0 && (
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: `
              radial-gradient(circle at 100% 0%, ${RED}1f 0%, transparent 55%),
              linear-gradient(135deg, #0d0d0d, #141414)
            `,
            border: `1px solid ${RED}55`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${RED}22`, color: RED }}
            >
              <AlertOctagon size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white">
                Top {top.length} niềm tin giới hạn mạnh nhất
              </h4>
              <div className="text-[10px] text-gray-500">
                Cần ưu tiên tháo gỡ — điểm ≥ 7
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {top.map((b, rank) => (
              <div
                key={b.id}
                className="rounded-lg p-3"
                style={{
                  background: `linear-gradient(135deg, ${RED}10, transparent)`,
                  border: `1px solid ${RED}33`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-extrabold"
                    style={{ background: `${RED}22`, color: RED }}
                  >
                    {rank + 1}
                  </div>
                  <p className="flex-1 text-[11.5px] text-gray-200 leading-snug">
                    {b.text}
                    <span className="text-gray-500 ml-1">[#{b.id}]</span>
                  </p>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-extrabold"
                    style={{ background: `${RED}22`, color: RED }}
                  >
                    {b.score}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10.5px] text-gray-500 leading-relaxed text-center pt-2">
        Phân tích sâu hơn (gắn vào 5 trụ niềm tin + đơn thuốc tâm thức) sẽ có
        trong báo cáo Premium ở mục cuối.
      </p>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatPill({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Brain;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2 flex items-center gap-2.5"
      style={{
        background: `${color}0d`,
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ background: `${color}22`, color }}
      >
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold leading-tight">
          {label}
        </div>
        <div
          className="text-sm font-extrabold leading-tight"
          style={{ color }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function BeliefScoreRing({
  score,
  max,
  pct,
  color,
}: {
  score: number;
  max: number;
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
          <linearGradient id={`bel-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={PURPLE} />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={`url(#bel-${gid})`}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
          Niềm tin
        </div>
        <div
          className="text-3xl font-extrabold leading-none mt-0.5"
          style={{ color }}
        >
          {score}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">/ {max}</div>
      </div>
    </div>
  );
}

function BeliefThemeCard({
  theme,
  avg,
}: {
  theme: (typeof BELIEF_THEMES)[number];
  avg: number;
}) {
  const meta = THEME_META[theme.key];
  const Icon = meta.icon;
  // For limiting: low avg = good (green). For neutral: just use blue.
  const c = !theme.isLimiting
    ? BLUE
    : avg <= 3
      ? GREEN
      : avg <= 6
        ? AMBER
        : RED;
  const pct = (avg / 10) * 100;
  const verdict = !theme.isLimiting
    ? "Trung tính"
    : avg <= 3
      ? "Cởi mở"
      : avg <= 6
        ? "Có giới hạn"
        : "Giới hạn mạnh";

  return (
    <div
      className="relative rounded-xl p-3 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${meta.color}0d, transparent 70%), #0d0d0d`,
        border: `1px solid ${c}55`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base"
          style={{
            background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
            border: `1px solid ${meta.color}44`,
          }}
        >
          <Icon size={15} style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Nhóm {theme.key}
          </div>
          <div className="text-[12px] font-extrabold text-white leading-tight">
            {theme.label.replace(`${theme.key}. `, "")}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-xl font-extrabold leading-none"
            style={{ color: c }}
          >
            {avg.toFixed(1)}
          </div>
          <div className="text-[9px] text-gray-500 font-bold">/10</div>
        </div>
      </div>

      <div
        className="h-2 rounded-full overflow-hidden mb-2"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${c}cc, ${c})`,
            boxShadow: `0 0 6px ${c}55`,
          }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-gray-400 leading-snug flex-1">
          {theme.description}
        </p>
        <span
          className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider"
          style={{ background: `${c}22`, color: c }}
        >
          {verdict}
        </span>
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
      {/* 1-10 scale buttons */}
      <div className="grid grid-cols-10 gap-1 mt-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => {
          const active = value === v;
          // Color: 1-3 = green (best), 4-6 = amber, 7-10 = red
          const c = v <= 3 ? "#22c55e" : v <= 6 ? "#f59e0b" : "#ef4444";
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className="py-1.5 rounded-md text-[11px] font-bold transition-colors"
              style={{
                background: active ? `${c}22` : "#0f0f0f",
                color: active ? c : "#666",
                border: `1px solid ${active ? `${c}77` : "#222"}`,
              }}
            >
              {v}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-gray-600 mt-1 px-1">
        <span>không đồng ý</span>
        <span>đồng ý</span>
      </div>
    </div>
  );
}
