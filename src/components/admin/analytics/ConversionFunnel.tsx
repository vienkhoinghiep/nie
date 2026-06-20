"use client";

import React from "react";

export interface FunnelStep {
  key?: string;
  label: string;
  count: number;
  color: string;
}

interface ConversionFunnelProps {
  /** Ordered list of funnel steps (top of funnel → bottom). */
  steps?: FunnelStep[];
  loading?: boolean;

  /**
   * Legacy 4-step props (still supported for backwards compatibility
   * during the migration window). If `steps` is set those win.
   */
  totalUsers?: number;
  enrolledUsers?: number;
  paidUsers?: number;
  completedUsers?: number;
}

const DEFAULT_LEGACY_STEPS: (keys: {
  totalUsers: number;
  enrolledUsers: number;
  paidUsers: number;
  completedUsers: number;
}) => FunnelStep[] = ({ totalUsers, enrolledUsers, paidUsers, completedUsers }) => [
  { label: "Đăng ký", count: totalUsers, color: "#3b82f6" },
  { label: "Ghi danh", count: enrolledUsers, color: "#06b6d4" },
  { label: "Thanh toán", count: paidUsers, color: "#10b981" },
  { label: "Hoàn thành", count: completedUsers, color: "#2563EB" },
];

export default function ConversionFunnel({
  steps: stepsProp,
  loading = false,
  totalUsers = 0,
  enrolledUsers = 0,
  paidUsers = 0,
  completedUsers = 0,
}: ConversionFunnelProps) {
  const steps: FunnelStep[] =
    stepsProp ??
    DEFAULT_LEGACY_STEPS({
      totalUsers,
      enrolledUsers,
      paidUsers,
      completedUsers,
    });

  const getConversionRate = (current: number, previous: number): string => {
    if (previous === 0) return "0%";
    return ((current / previous) * 100).toFixed(1) + "%";
  };

  const getBiggestDrop = (): string => {
    let maxDrop = 0;
    let dropStep = "";
    for (let i = 1; i < steps.length; i++) {
      const prev = steps[i - 1].count;
      const curr = steps[i].count;
      const drop = prev - curr;
      if (drop > maxDrop) {
        maxDrop = drop;
        dropStep = `${steps[i - 1].label} → ${steps[i].label}`;
      }
    }
    return dropStep || "Không có";
  };

  if (loading) {
    return (
      <div className="card-dark p-5">
        <div className="h-5 w-48 bg-white/10 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {steps.map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ─── SVG funnel layout ────────────────────────────────────────
  const maxCount = Math.max(...steps.map((s) => s.count), 1);
  const widthOf = (count: number): number => (count / maxCount) * 100;

  const MIN_WIDTH = 4;
  const SVG_W = 600;
  const STEP_H = 70;
  const GAP = 4;
  const SVG_H = steps.length * (STEP_H + GAP);

  const widths = steps.map((s) => Math.max(widthOf(s.count), MIN_WIDTH));
  const bottomWidths = widths.map((_, i) => widths[i + 1] ?? widths[i] * 0.55);

  // Stable gradient ids — `step.label` may include spaces/special chars
  // (e.g. "Bấm thanh toán") which break SVG `url(#…)` references, so we
  // slugify and prefix with the step index.
  const gradId = (i: number, label: string) =>
    `funnel-grad-${i}-${label.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="card-dark p-5">
      <h3 className="text-lg font-semibold text-white mb-6">Phễu chuyển đổi</h3>

      {/* Funnel SVG */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full max-w-[680px] mx-auto"
          style={{ height: SVG_H }}
        >
          <defs>
            {steps.map((step, i) => (
              <linearGradient
                key={gradId(i, step.label)}
                id={gradId(i, step.label)}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={step.color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={step.color} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>

          {steps.map((step, i) => {
            const y = i * (STEP_H + GAP);
            const topW = (widths[i] / 100) * SVG_W;
            const botW = (bottomWidths[i] / 100) * SVG_W;
            const cx = SVG_W / 2;
            const x1Top = cx - topW / 2;
            const x2Top = cx + topW / 2;
            const x1Bot = cx - botW / 2;
            const x2Bot = cx + botW / 2;
            const points = `${x1Top},${y} ${x2Top},${y} ${x2Bot},${y + STEP_H} ${x1Bot},${y + STEP_H}`;
            const conversionRate =
              i === 0 ? "100%" : getConversionRate(step.count, steps[i - 1].count);

            return (
              <g key={`${step.label}-${i}`}>
                <polygon
                  points={points}
                  fill={`url(#${gradId(i, step.label)})`}
                  stroke={step.color}
                  strokeWidth="1.5"
                />
                <text
                  x={cx}
                  y={y + STEP_H / 2 - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="600"
                  style={{ fontFamily: "inherit" }}
                >
                  {step.label}
                </text>
                <text
                  x={cx}
                  y={y + STEP_H / 2 + 14}
                  textAnchor="middle"
                  fill="#e5e7eb"
                  fontSize="14"
                  fontWeight="700"
                  style={{ fontFamily: "inherit" }}
                >
                  {step.count.toLocaleString("vi-VN")}
                  <tspan dx="8" fill={step.color} fontSize="11">
                    ({conversionRate})
                  </tspan>
                </text>

                {/* Step-number badge */}
                <circle cx={x1Top - 18} cy={y + STEP_H / 2} r="13" fill={step.color} />
                <text
                  x={x1Top - 18}
                  y={y + STEP_H / 2 + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="700"
                  style={{ fontFamily: "inherit" }}
                >
                  {i + 1}
                </text>

                {/* Drop annotation on the right */}
                {i > 0 && (() => {
                  const prev = steps[i - 1].count;
                  const drop = prev - step.count;
                  if (drop <= 0) return null;
                  const dropPct = ((drop / prev) * 100).toFixed(0);
                  return (
                    <text
                      x={SVG_W - 6}
                      y={y + 14}
                      textAnchor="end"
                      fill="#ef4444"
                      fontSize="10"
                      fontWeight="600"
                      style={{ fontFamily: "inherit" }}
                    >
                      ↓ rơi {drop.toLocaleString("vi-VN")} ({dropPct}%)
                    </text>
                  );
                })()}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-sm text-gray-400 mt-4 mb-6 text-center">
        Điểm rơi lớn nhất:{" "}
        <span className="text-white font-medium">{getBiggestDrop()}</span>
      </div>

      {/* Detail table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium py-2 pr-4">Bước</th>
              <th className="text-right text-gray-400 font-medium py-2 px-4">Số lượng</th>
              <th className="text-right text-gray-400 font-medium py-2 px-4">
                Tỷ lệ chuyển đổi
              </th>
              <th className="text-right text-gray-400 font-medium py-2 pl-4">
                Tỷ lệ so với bước 1
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map((step, index) => {
              const conversionFromPrev =
                index === 0
                  ? "—"
                  : getConversionRate(step.count, steps[index - 1].count);
              const conversionFromFirst =
                index === 0
                  ? "100%"
                  : getConversionRate(step.count, steps[0].count);
              return (
                <tr key={`${step.label}-${index}`} className="border-b border-white/5">
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: step.color }}
                      />
                      <span className="text-white">{step.label}</span>
                    </div>
                  </td>
                  <td className="text-right text-white py-2 px-4">
                    {step.count.toLocaleString("vi-VN")}
                  </td>
                  <td className="text-right text-gray-400 py-2 px-4">
                    {conversionFromPrev}
                  </td>
                  <td className="text-right text-gray-400 py-2 pl-4">
                    {conversionFromFirst}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
