"use client";

import { CheckCircle2 } from "lucide-react";
import {
  HABITS_QUESTIONS,
  type HabitsAnswers,
} from "@/lib/blueprint/data/habits-questions";
import type { HabitsData } from "@/lib/blueprint/types";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#3b82f6";

interface Props {
  data: HabitsData;
  onChange: (next: HabitsData) => void;
  onComplete: () => void;
}

export default function HabitsSection({ data, onChange, onComplete }: Props) {
  const answers: HabitsAnswers = data.answers ?? {};

  const set = (id: string, value: string | boolean | null) => {
    onChange({ ...data, answers: { ...answers, [id]: value } });
  };

  const answeredCount = HABITS_QUESTIONS.filter((q) => {
    const v = answers[q.id];
    if (q.type === "textarea") return typeof v === "string" && v.trim().length > 0;
    return v !== undefined && v !== null && v !== "";
  }).length;
  const totalCount = HABITS_QUESTIONS.length;
  const isDone = answeredCount === totalCount;

  return (
    <div className="space-y-3">
      {/* Instructions */}
      <div
        className="rounded-md px-3 py-2.5 text-[11px] leading-snug"
        style={{
          background: `${BLUE}10`,
          color: BLUE,
          border: `1px solid ${BLUE}44`,
        }}
      >
        💡 Trả lời chân thật về các thói quen tài chính hiện tại. Đây là cơ
        sở để xây kế hoạch nâng cấp thói quen 1-1 trong khoá học.
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
              background: `linear-gradient(90deg, ${BRAND}, ${BLUE})`,
            }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {HABITS_QUESTIONS.map((q, idx) => {
          const v = answers[q.id];
          const hasAnswer =
            q.type === "textarea"
              ? typeof v === "string" && v.trim().length > 0
              : v !== undefined && v !== null && v !== "";
          return (
            <div
              key={q.id}
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
                  {idx + 1}
                </span>
                <p className="text-[12.5px] text-gray-200 leading-snug flex-1">
                  {q.text}
                </p>
              </div>

              {q.type === "yes_no" && (
                <div className="flex gap-1.5 mt-2">
                  {(["yes", "no"] as const).map((opt) => {
                    const optBool = opt === "yes";
                    const active = v === optBool;
                    const c = optBool ? GREEN : RED;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => set(q.id, optBool)}
                        className="px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors min-w-[64px]"
                        style={{
                          background: active ? `${c}22` : "#0f0f0f",
                          color: active ? c : "#888",
                          border: `1px solid ${active ? `${c}77` : "#2a2a2a"}`,
                        }}
                      >
                        {optBool ? "Có" : "Không"}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "single_select" && q.options && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                  {q.options.map((o) => {
                    const active = v === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => set(q.id, o.value)}
                        className="px-2.5 py-1.5 rounded-md text-[11px] font-bold transition-colors"
                        style={{
                          background: active ? `${BRAND}22` : "#0f0f0f",
                          color: active ? BRAND : "#888",
                          border: `1px solid ${active ? `${BRAND}77` : "#2a2a2a"}`,
                        }}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "textarea" && (
                <textarea
                  value={typeof v === "string" ? v : ""}
                  onChange={(e) => set(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={3}
                  className="w-full mt-2 px-3 py-2 rounded-md text-[12.5px] text-white outline-none resize-none"
                  style={{
                    background: "#0f0f0f",
                    border: `1px solid ${hasAnswer ? `${BRAND}55` : "#2a2a2a"}`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Complete CTA */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1f1f1f]">
        <div className="text-[11px] text-gray-500">
          {isDone
            ? "✓ Đã trả lời đủ 13 câu thói quen."
            : `Còn ${totalCount - answeredCount} câu chưa trả lời.`}
        </div>
        <button
          type="button"
          onClick={onComplete}
          disabled={!isDone}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          style={{
            background: isDone
              ? `linear-gradient(135deg, #3B82F6, ${BRAND})`
              : "#1a1a1a",
            color: isDone ? "#0a0a0a" : "#555",
            cursor: isDone ? "pointer" : "not-allowed",
            border: isDone ? "none" : "1px solid #2a2a2a",
            boxShadow: isDone ? `0 6px 18px ${BRAND}55` : "none",
          }}
        >
          <CheckCircle2 size={14} />
          Hoàn thành · sang Phần IV →
        </button>
      </div>
    </div>
  );
}
