"use client";

/**
 * Lightweight SVG donut chart — supports both multi-slice (breakdown)
 * and single-value (progress ring) modes.
 */

interface Slice {
  value: number;
  color: string;
  label?: string;
}

interface DonutProps {
  slices: Slice[];
  size?: number;
  thickness?: number;
  centerTop?: string; // small uppercase label above center value
  centerValue?: string; // big value text
  centerSub?: string; // sub-text below center value
  centerValueColor?: string;
}

/**
 * Multi-slice donut. Slice values are normalised to total.
 */
export function Donut({
  slices,
  size = 180,
  thickness = 26,
  centerTop,
  centerValue,
  centerSub,
  centerValueColor = "#fff",
}: DonutProps) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = slices.reduce((s, v) => s + Math.max(0, v.value), 0);

  let offset = 0;
  const arcs =
    total <= 0
      ? []
      : slices
          .map((slice) => {
            const v = Math.max(0, slice.value);
            if (v <= 0) return null;
            const dash = (v / total) * circumference;
            const arc = {
              dash,
              gap: circumference - dash,
              offset,
              color: slice.color,
            };
            offset += dash;
            return arc;
          })
          .filter(Boolean) as {
          dash: number;
          gap: number;
          offset: number;
          color: string;
        }[];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={thickness}
      />
      {/* Arcs */}
      {arcs.map((a, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={a.color}
          strokeWidth={thickness}
          strokeDasharray={`${a.dash} ${a.gap}`}
          strokeDashoffset={-a.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
        />
      ))}

      {/* Center label */}
      {centerTop && (
        <text
          x={cx}
          y={cy - 22}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
          fontWeight="700"
          letterSpacing="1.5"
        >
          {centerTop.toUpperCase()}
        </text>
      )}
      {centerValue && (
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fontSize="26"
          fill={centerValueColor}
          fontWeight="900"
        >
          {centerValue}
        </text>
      )}
      {centerSub && (
        <text
          x={cx}
          y={cy + 24}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
          fontWeight="500"
        >
          {centerSub}
        </text>
      )}
    </svg>
  );
}

interface ProgressDonutProps {
  /** Current value 0..100 (already as percentage). */
  pct: number;
  /** Ideal target % shown as a hint. */
  target?: number;
  color: string;
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerValue?: string;
  centerSub?: string;
}

/**
 * Single-arc progress ring. Use for KPIs (debt ratio, emergency fund %).
 */
export function ProgressDonut({
  pct,
  color,
  size = 180,
  thickness = 26,
  centerTop,
  centerValue,
  centerSub,
}: ProgressDonutProps) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, pct)) / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth={thickness}
      />
      {/* Filled arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={`${filled} ${circumference - filled}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />

      {centerTop && (
        <text
          x={cx}
          y={cy - 22}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
          fontWeight="700"
          letterSpacing="1.5"
        >
          {centerTop.toUpperCase()}
        </text>
      )}
      {centerValue && (
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          fontSize="26"
          fill={color}
          fontWeight="900"
        >
          {centerValue}
        </text>
      )}
      {centerSub && (
        <text
          x={cx}
          y={cy + 24}
          textAnchor="middle"
          fontSize="10"
          fill="#6b7280"
          fontWeight="500"
        >
          {centerSub}
        </text>
      )}
    </svg>
  );
}
