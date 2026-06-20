"use client";

import { useId } from "react";
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  LOVE_OF_MONEY_QUESTIONS,
  loveOfMoneyTier,
  scoreLoveOfMoney,
} from "@/lib/blueprint/data/love-of-money-questions";

const GREEN = "#22c55e";
const RED = "#ef4444";
const BRAND = "#2563EB";
const AMBER = "#f59e0b";

interface Props {
  answers: Record<number, "yes" | "no">;
  onChange: (answers: Record<number, "yes" | "no">) => void;
}

export default function LoveOfMoneyQuestionnaire({ answers, onChange }: Props) {
  const setAnswer = (qid: number, value: "yes" | "no") => {
    onChange({ ...answers, [qid]: value });
  };

  const answeredCount = LOVE_OF_MONEY_QUESTIONS.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const totalCount = LOVE_OF_MONEY_QUESTIONS.length;
  const isDone = answeredCount === totalCount;
  const totalScore = scoreLoveOfMoney(answers);
  const tier = loveOfMoneyTier(totalScore);
  const tierColor =
    tier.tier === 1 ? RED : tier.tier === 2 ? AMBER : GREEN;

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div
        className="rounded-md px-3 py-2.5 text-[11px] leading-snug"
        style={{
          background: `${BRAND}10`,
          color: BRAND,
          border: `1px solid ${BRAND}44`,
        }}
      >
        💡 Trả lời thành thật <strong>Có</strong> hoặc <strong>Không</strong>{" "}
        cho từng câu hỏi để hiểu mức độ thân thiết của anh/chị với tiền bạc.
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
              background: `linear-gradient(90deg, ${BRAND}, ${GREEN})`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {LOVE_OF_MONEY_QUESTIONS.map((q) => (
          <QuestionRow
            key={q.id}
            id={q.id}
            text={q.text}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>

      {/* Live result */}
      {isDone && (
        <LoveOfMoneyAnalysis
          totalScore={totalScore}
          tier={tier}
          tierColor={tierColor}
          yesCount={Object.values(answers).filter((v) => v === "yes").length}
          noCount={Object.values(answers).filter((v) => v === "no").length}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Phân tích chi tiết khi hoàn thành
 * ───────────────────────────────────────────── */

function LoveOfMoneyAnalysis({
  totalScore,
  tier,
  tierColor,
  yesCount,
  noCount,
}: {
  totalScore: number;
  tier: { tier: 1 | 2 | 3; label: string; desc: string };
  tierColor: string;
  yesCount: number;
  noCount: number;
}) {
  const pct = Math.round((totalScore / 38) * 100);
  const yesPct = Math.round((yesCount / 38) * 100);

  return (
    <div className="mt-6 space-y-4">
      {/* ─── HERO CARD ─── */}
      <div
        className="relative rounded-2xl p-5 sm:p-6 overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 100% 0%, ${tierColor}33 0%, transparent 60%),
            radial-gradient(circle at 0% 100%, ${BRAND}1f 0%, transparent 55%),
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
            <Heart size={10} />
            Mức độ yêu tiền
          </div>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
            ✓ 38/38 câu
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
                {tier.tier === 1 ? "💔" : tier.tier === 2 ? "💛" : "💚"}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Trạng thái mối quan hệ với tiền
                </div>
                <h3
                  className="text-xl sm:text-2xl font-extrabold leading-tight"
                  style={{ color: tierColor }}
                >
                  {tier.label}
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-gray-300 leading-relaxed">
              {tier.desc}
            </p>
          </div>

          <div className="flex justify-center">
            <LoveScoreRing
              score={totalScore}
              pct={pct}
              color={tierColor}
            />
          </div>
        </div>
      </div>

      {/* ─── YES/NO STATS + SCALE ─── */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4">
        {/* Yes/No */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#0d0d0d",
            border: "1px solid #1f1f1f",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: BRAND }} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Tỉ lệ trả lời
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <YesNoBox
              icon={ThumbsUp}
              label="Có"
              count={yesCount}
              color={GREEN}
            />
            <YesNoBox
              icon={ThumbsDown}
              label="Không"
              count={noCount}
              color={RED}
            />
          </div>
          <div
            className="mt-3 h-2 rounded-full overflow-hidden flex"
            style={{ background: "#1a1a1a" }}
          >
            <div
              className="h-full transition-all"
              style={{
                width: `${yesPct}%`,
                background: `linear-gradient(90deg, ${GREEN}cc, ${GREEN})`,
                boxShadow: `0 0 8px ${GREEN}55`,
              }}
            />
            <div
              className="h-full transition-all"
              style={{
                width: `${100 - yesPct}%`,
                background: `linear-gradient(90deg, ${RED}, ${RED}cc)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
            <span>{yesPct}% Có</span>
            <span>{100 - yesPct}% Không</span>
          </div>
        </div>

        {/* Tier scale */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "#0d0d0d",
            border: "1px solid #1f1f1f",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: BRAND }} />
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">
              Vị trí trên thang yêu tiền
            </h4>
          </div>

          <div className="relative h-8 rounded-lg overflow-hidden flex">
            <div
              className="h-full flex items-center justify-center text-[10px] font-bold"
              style={{
                width: "28.9%",
                background: `linear-gradient(135deg, ${RED}55, ${RED}22)`,
                color: tier.tier === 1 ? "#fff" : `${RED}aa`,
              }}
            >
              💔 Bất hòa
            </div>
            <div
              className="h-full flex items-center justify-center text-[10px] font-bold"
              style={{
                width: "52%",
                background: `linear-gradient(135deg, ${AMBER}55, ${AMBER}22)`,
                color: tier.tier === 2 ? "#fff" : `${AMBER}aa`,
              }}
            >
              💛 Đang tiến tới
            </div>
            <div
              className="h-full flex items-center justify-center text-[10px] font-bold"
              style={{
                width: "19.1%",
                background: `linear-gradient(135deg, ${GREEN}55, ${GREEN}22)`,
                color: tier.tier === 3 ? "#fff" : `${GREEN}aa`,
              }}
            >
              💚 Yêu
            </div>
            {/* Marker */}
            <div
              className="absolute top-0 bottom-0 flex items-center"
              style={{ left: `calc(${pct}% - 8px)` }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                style={{
                  background: tierColor,
                  boxShadow: `0 0 12px ${tierColor}`,
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 mt-2 text-[9px] font-bold uppercase tracking-wider">
            <div style={{ color: RED }}>0 - 10</div>
            <div className="text-center" style={{ color: AMBER }}>
              11 - 30
            </div>
            <div className="text-right" style={{ color: GREEN }}>
              31 - 38
            </div>
          </div>

          {/* Mini takeaway */}
          <div
            className="mt-4 rounded-lg p-2.5 flex items-start gap-2"
            style={{
              background: `${tierColor}0d`,
              border: `1px solid ${tierColor}44`,
            }}
          >
            <Heart
              size={12}
              className="shrink-0 mt-0.5"
              style={{ color: tierColor }}
            />
            <p className="text-[11px] text-gray-300 leading-snug">
              Điểm <strong style={{ color: tierColor }}>{totalScore}/38</strong>{" "}
              đặt anh/chị ở khoảng <strong>{pct}%</strong> trên thang yêu tiền.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[10.5px] text-gray-500 leading-relaxed text-center pt-2">
        Phân tích sâu hơn (kết hợp Tâm Thức + Niềm Tin → 6 Money Personality)
        sẽ có trong báo cáo Premium ở mục cuối.
      </p>
    </div>
  );
}

function LoveScoreRing({
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
          <linearGradient id={`love-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={BRAND} />
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
          stroke={`url(#love-${gid})`}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
          Yêu tiền
        </div>
        <div
          className="text-3xl font-extrabold leading-none mt-0.5"
          style={{ color }}
        >
          {score}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">/ 38</div>
      </div>
    </div>
  );
}

function YesNoBox({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: typeof Heart;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: `linear-gradient(135deg, ${color}1a, transparent 80%)`,
        border: `1px solid ${color}44`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}22`, color }}
        >
          <Icon size={14} />
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold" style={{ color }}>
          {count}
        </span>
        <span className="text-[10px] text-gray-500">/ 38 câu</span>
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
  value: "yes" | "no" | undefined;
  onChange: (v: "yes" | "no") => void;
}) {
  const hasAnswer = value !== undefined;
  return (
    <div
      className="rounded-lg p-3 grid grid-cols-[1fr_auto] gap-3 items-center"
      style={{
        background: hasAnswer ? `${BRAND}06` : "#0a0a0a",
        border: `1px solid ${hasAnswer ? `${BRAND}33` : "#1f1f1f"}`,
      }}
    >
      <div className="flex items-start gap-2">
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
      <div className="flex gap-1.5 shrink-0">
        {(["yes", "no"] as const).map((v) => {
          const active = value === v;
          const c = v === "yes" ? GREEN : RED;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className="px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors min-w-[52px]"
              style={{
                background: active ? `${c}22` : "#0f0f0f",
                color: active ? c : "#888",
                border: `1px solid ${active ? `${c}77` : "#2a2a2a"}`,
              }}
            >
              {v === "yes" ? "Có" : "Không"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
