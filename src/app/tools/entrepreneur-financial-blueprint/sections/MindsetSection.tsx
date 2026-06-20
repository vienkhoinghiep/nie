"use client";

import { useState } from "react";
import { Brain, Heart, MessageCircle, CheckCircle2 } from "lucide-react";
import type { MindsetData } from "@/lib/blueprint/types";
import { MINDSET_QUESTIONS } from "@/lib/blueprint/data/mindset-questions";
import { LOVE_OF_MONEY_QUESTIONS } from "@/lib/blueprint/data/love-of-money-questions";
import { BELIEF_QUESTIONS } from "@/lib/blueprint/data/beliefs-questions";
import ArchetypeQuestionnaire from "./mindset/ArchetypeQuestionnaire";
import LoveOfMoneyQuestionnaire from "./mindset/LoveOfMoneyQuestionnaire";
import BeliefsQuestionnaire from "./mindset/BeliefsQuestionnaire";

const BRAND = "#2563EB";
const GREEN = "#22c55e";

type SubKey = "archetype" | "love" | "beliefs";

interface Props {
  data: MindsetData;
  onChange: (next: MindsetData) => void;
  onComplete: () => void;
}

interface SubDef {
  key: SubKey;
  label: string;
  short: string;
  icon: typeof Brain;
  color: string;
}

const SUBS: SubDef[] = [
  {
    key: "archetype",
    label: "Test Tâm Thức Tiền Bạc",
    short: "35 câu · chấm 0-3 · 7 loại",
    icon: Brain,
    color: "#a855f7",
  },
  {
    key: "love",
    label: "Mức Độ Yêu Tiền",
    short: "38 câu · Có/Không · 3 mức",
    icon: Heart,
    color: "#ef4444",
  },
  {
    key: "beliefs",
    label: "Niềm Tin Về Tiền",
    short: "72 câu · chấm 1-10",
    icon: MessageCircle,
    color: "#3b82f6",
  },
];

export default function MindsetSection({ data, onChange, onComplete }: Props) {
  const [activeSub, setActiveSub] = useState<SubKey>("archetype");

  const archetypeAnswers = data.archetypeAnswers ?? {};
  const loveAnswers = data.loveOfMoneyAnswers ?? {};
  const beliefsAnswers = data.beliefsAnswers ?? {};

  const archetypeDone =
    Object.keys(archetypeAnswers).length === MINDSET_QUESTIONS.length;
  const loveDone =
    Object.keys(loveAnswers).length === LOVE_OF_MONEY_QUESTIONS.length;
  const beliefsDone =
    Object.keys(beliefsAnswers).length === BELIEF_QUESTIONS.length;
  const allDone = archetypeDone && loveDone && beliefsDone;

  const subProgress: Record<SubKey, boolean> = {
    archetype: archetypeDone,
    love: loveDone,
    beliefs: beliefsDone,
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab nav */}
      <div className="grid sm:grid-cols-3 gap-2">
        {SUBS.map((s) => {
          const Icon = s.icon;
          const active = s.key === activeSub;
          const done = subProgress[s.key];
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveSub(s.key)}
              className="rounded-lg p-3 text-left transition-colors"
              style={{
                background: active ? `${s.color}14` : "rgba(255,255,255,0.025)",
                border: `1px solid ${active ? `${s.color}77` : "#1f1f1f"}`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ background: `${s.color}1a`, color: s.color }}
                >
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-extrabold text-white leading-tight truncate flex items-center gap-1.5">
                    {s.label}
                    {done && (
                      <CheckCircle2
                        size={12}
                        style={{ color: GREEN }}
                        className="shrink-0"
                      />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {s.short}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active sub content */}
      {activeSub === "archetype" && (
        <ArchetypeQuestionnaire
          answers={archetypeAnswers}
          onChange={(a) => onChange({ ...data, archetypeAnswers: a })}
        />
      )}
      {activeSub === "love" && (
        <LoveOfMoneyQuestionnaire
          answers={loveAnswers}
          onChange={(a) => onChange({ ...data, loveOfMoneyAnswers: a })}
        />
      )}
      {activeSub === "beliefs" && (
        <BeliefsQuestionnaire
          answers={beliefsAnswers}
          onChange={(a) => onChange({ ...data, beliefsAnswers: a })}
        />
      )}

      {/* Complete CTA */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1f1f1f]">
        <div className="text-[11px] text-gray-500">
          {allDone
            ? "✓ Đã trả lời đủ cả 3 bộ câu hỏi tâm thức."
            : `Tiến độ: ${[archetypeDone, loveDone, beliefsDone].filter(Boolean).length}/3 bộ hoàn thành.`}
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={!allDone}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          style={{
            background: allDone
              ? `linear-gradient(135deg, #3B82F6, ${BRAND})`
              : "#1a1a1a",
            color: allDone ? "#0a0a0a" : "#555",
            cursor: allDone ? "pointer" : "not-allowed",
            border: allDone ? "none" : "1px solid #2a2a2a",
            boxShadow: allDone ? `0 6px 18px ${BRAND}55` : "none",
          }}
        >
          <CheckCircle2 size={14} />
          Hoàn thành · sang Phần III →
        </button>
      </div>
    </div>
  );
}
