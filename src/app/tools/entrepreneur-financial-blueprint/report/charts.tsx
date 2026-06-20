"use client";

import { useId } from "react";

/* ─── PALETTE — Light theme (FIDT-inspired) ─── */
export const NAVY = "#1A2B47";          // dark navy text/heading
export const NAVY_DARK = "#0F1E36";
export const NAVY_LIGHT = "#384867";
export const GOLD = "#E5B547";          // FIDT gold accent
export const GOLD_LIGHT = "#F5CB70";
export const GOLD_DARK = "#B58F2A";
export const CREAM = "#FAF6EE";         // page bg
export const CREAM_LIGHT = "#FFFFFF";   // card bg
export const TEXT_DARK = "#1A2B47";
export const TEXT_BODY = "#5A6478";
export const TEXT_MUTED = "#9098A8";
export const SUCCESS = "#4CAF50";       // FIDT green pill
export const WARNING = "#E5B547";       // FIDT yellow pill (gold)
export const DANGER = "#E5715D";        // FIDT red-coral pill

/* FIDT donut/chart accent palette */
export const ORANGE = "#F5A623";
export const ORANGE_LIGHT = "#FFB84D";
export const TAN = "#C4B58E";
export const TEAL = "#4FA39F";
export const SKY = "#5DADE2";
export const PEACH = "#F5BA8B";

/* ─────────────────────────────────────────────
 *  ScoreCircle — vòng tròn điểm tổng (cover page)
 * ───────────────────────────────────────────── */

export function ScoreCircle({
  value,
  max = 100,
  size = 200,
  label = "Tổng điểm",
  sublabel,
  color = SUCCESS,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const radius = size / 2 - 14;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const uid = useId().replace(/:/g, "");
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`sc-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.95" />
            <stop offset="1" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e6dfc9"
          strokeWidth="10"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={`url(#sc-${uid})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-3"
        style={{ color: NAVY }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: NAVY_LIGHT,
            letterSpacing: 0.5,
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: size * 0.22,
            fontWeight: 900,
            color: NAVY,
            lineHeight: 1,
          }}
        >
          {value}
          <span style={{ fontSize: size * 0.1, color: TEXT_MUTED, fontWeight: 600 }}>
            /{max}
          </span>
        </div>
        {sublabel && (
          <div
            style={{
              fontSize: 10,
              color: TEXT_MUTED,
              marginTop: 4,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  RadarChart — biểu đồ 7 nhóm tâm thức
 * ───────────────────────────────────────────── */

export function RadarChart({
  scores,
  labels,
  max = 15,
  size = 380,
}: {
  scores: number[];
  labels: string[];
  max?: number;
  size?: number;
}) {
  const n = scores.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 60;
  const uid = useId().replace(/:/g, "");

  // Background grid (concentric polygons)
  const rings = 5;
  const ringPaths: string[] = [];
  for (let k = 1; k <= rings; k++) {
    const rk = (r * k) / rings;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x = cx + rk * Math.cos(angle);
      const y = cy + rk * Math.sin(angle);
      pts.push(`${x},${y}`);
    }
    ringPaths.push(pts.join(" "));
  }

  // Axis lines
  const axisLines: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    axisLines.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }

  // Data polygon
  const dataPts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const v = Math.max(0, Math.min(max, scores[i])) / max;
    dataPts.push({
      x: cx + r * v * Math.cos(angle),
      y: cy + r * v * Math.sin(angle),
    });
  }
  const dataPath = dataPts.map((p) => `${p.x},${p.y}`).join(" ");

  // Label positions (outside the chart)
  const labelPositions = labels.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      x: cx + (r + 28) * Math.cos(angle),
      y: cy + (r + 28) * Math.sin(angle),
    };
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size + 30}`}
      width="100%"
      style={{ maxWidth: size, display: "block", margin: "0 auto" }}
    >
      <defs>
        <linearGradient id={`rd-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={SUCCESS} stopOpacity="0.45" />
          <stop offset="1" stopColor={SUCCESS} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* Grid rings */}
      {ringPaths.map((p, i) => (
        <polygon
          key={i}
          points={p}
          fill="none"
          stroke={GOLD}
          strokeOpacity={i === rings - 1 ? 0.55 : 0.25}
          strokeWidth={i === rings - 1 ? 1.2 : 0.8}
        />
      ))}
      {/* Axes */}
      {axisLines.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke={GOLD}
          strokeOpacity="0.35"
          strokeWidth="0.7"
        />
      ))}
      {/* Data polygon */}
      <polygon
        points={dataPath}
        fill={`url(#rd-${uid})`}
        stroke={NAVY}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Data points */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={GOLD_LIGHT} stroke={NAVY} strokeWidth="1.5" />
      ))}
      {/* Y-axis ticks (vertical) */}
      {[3, 6, 9, 12, 15].map((tick) => (
        <text
          key={tick}
          x={cx + 4}
          y={cy - (r * tick) / max + 4}
          fontSize="9"
          fill={TEXT_MUTED}
        >
          {tick}
        </text>
      ))}
      {/* Labels */}
      {labels.map((lab, i) => {
        const p = labelPositions[i];
        const anchor =
          Math.abs(p.x - cx) < 5
            ? "middle"
            : p.x > cx
              ? "start"
              : "end";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            fontSize="11"
            fontWeight={700}
            fill={NAVY}
          >
            {lab}
          </text>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
 *  GaugeChart — đồng hồ 3 vùng (Bất hòa / Đang vun đắp / Gắn bó tốt)
 * ───────────────────────────────────────────── */

export function GaugeChart({
  value,
  max = 38,
  zones = [
    { from: 0, to: 11, label: "Bất hòa", color: DANGER },
    { from: 11, to: 30, label: "Đang vun đắp", color: WARNING },
    { from: 30, to: 38, label: "Gắn bó tốt", color: SUCCESS },
  ],
  size = 320,
}: {
  value: number;
  max?: number;
  zones?: { from: number; to: number; label: string; color: string }[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size * 0.6;
  const r = size / 2 - 30;
  const startAngle = Math.PI; // 180° (left)
  const endAngle = 2 * Math.PI; // 360° (right)

  const angleFor = (v: number) => {
    const t = Math.max(0, Math.min(1, v / max));
    return startAngle + (endAngle - startAngle) * t;
  };

  const arc = (a1: number, a2: number, radius: number) => {
    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    const large = a2 - a1 > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const needleAngle = angleFor(value);
  const nx = cx + (r - 4) * Math.cos(needleAngle);
  const ny = cy + (r - 4) * Math.sin(needleAngle);

  return (
    <svg
      viewBox={`0 0 ${size} ${size * 0.75}`}
      width="100%"
      style={{ maxWidth: size, display: "block" }}
    >
      {/* Zone arcs */}
      {zones.map((z, i) => (
        <path
          key={i}
          d={arc(angleFor(z.from), angleFor(z.to), r)}
          stroke={z.color}
          strokeWidth="22"
          fill="none"
          strokeLinecap="butt"
          opacity="0.85"
        />
      ))}
      {/* Zone labels */}
      {zones.map((z, i) => {
        const a = angleFor((z.from + z.to) / 2);
        const lx = cx + (r + 22) * Math.cos(a);
        const ly = cy + (r + 22) * Math.sin(a);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            fontSize="11"
            fontWeight={700}
            fill={z.color}
          >
            {z.label}
          </text>
        );
      })}
      {/* Tick numbers */}
      {[0, ...zones.map((z) => z.to)].map((v, i) => {
        const a = angleFor(v);
        const tx = cx + (r - 30) * Math.cos(a);
        const ty = cy + (r - 30) * Math.sin(a);
        return (
          <text
            key={i}
            x={tx}
            y={ty + 3}
            textAnchor="middle"
            fontSize="10"
            fontWeight={600}
            fill={TEXT_MUTED}
          >
            {v}
          </text>
        );
      })}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={NAVY_DARK}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="10" fill={GOLD_LIGHT} stroke={NAVY_DARK} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="4" fill={NAVY_DARK} />
      {/* Center value */}
      <text
        x={cx}
        y={cy - r + 10}
        textAnchor="middle"
        fontSize="22"
        fontWeight={900}
        fill={NAVY_DARK}
      >
        {value}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
 *  PyramidChart — 5 tầng Wealth MRI
 * ───────────────────────────────────────────── */

export interface PyramidLayer {
  label: string;
  alias?: string;
  desc?: string;
  value?: number; // 0-100
  customText?: string;
  color: string;
}

export function PyramidChart({
  layers,
  size = 380,
}: {
  layers: PyramidLayer[]; // bottom → top
  size?: number;
}) {
  const w = size;
  const h = size * 0.95;
  const n = layers.length;
  const layerH = h / n;
  const baseW = w * 0.85;
  const topW = w * 0.15;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
      {layers.map((layer, i) => {
        // i=0 bottom, i=n-1 top
        const iFromTop = n - 1 - i;
        const yTop = iFromTop * layerH;
        const yBot = (iFromTop + 1) * layerH;
        const wTop = topW + ((baseW - topW) * iFromTop) / n;
        const wBot = topW + ((baseW - topW) * (iFromTop + 1)) / n;
        const xTopL = (w - wTop) / 2;
        const xTopR = (w + wTop) / 2;
        const xBotL = (w - wBot) / 2;
        const xBotR = (w + wBot) / 2;
        const path = `M ${xTopL} ${yTop} L ${xTopR} ${yTop} L ${xBotR} ${yBot} L ${xBotL} ${yBot} Z`;
        const cx = w / 2;
        const cy = yTop + layerH / 2;
        return (
          <g key={i}>
            <path
              d={path}
              fill={layer.color}
              fillOpacity={0.85}
              stroke={NAVY_DARK}
              strokeWidth={1.2}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              fontSize={iFromTop === 0 ? 12 : 11}
              fontWeight={800}
              fill="white"
            >
              Tầng {n - iFromTop} — {layer.label}
            </text>
            {layer.customText && (
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                opacity="0.9"
              >
                {layer.customText}
              </text>
            )}
            {!layer.customText && layer.value !== undefined && (
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                fontSize="11"
                fontWeight={700}
                fill="white"
                opacity="0.95"
              >
                {layer.value}/100
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
 *  CornerOrnament — decoration 4 góc cover page
 * ───────────────────────────────────────────── */

export function CornerOrnament({
  position,
  size = 80,
  color = GOLD_LIGHT,
}: {
  position: "tl" | "tr" | "bl" | "br";
  size?: number;
  color?: string;
}) {
  const isLeft = position === "tl" || position === "bl";
  const isTop = position === "tl" || position === "tr";
  const style: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    pointerEvents: "none",
  };
  if (isTop) style.top = 0;
  else style.bottom = 0;
  if (isLeft) style.left = 0;
  else style.right = 0;

  return (
    <svg
      style={style}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <g
        transform={`scale(${isLeft ? 1 : -1},${isTop ? 1 : -1}) translate(${isLeft ? 0 : -100},${isTop ? 0 : -100})`}
      >
        {/* Two diagonal gold lines */}
        <line x1="0" y1="35" x2="65" y2="0" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="55" x2="55" y2="0" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────
 *  Pillar — 1 trong 3 trụ cột
 * ───────────────────────────────────────────── */

export function Pillar({
  title,
  alias,
  desc,
  color,
  children,
}: {
  title: string;
  alias: string;
  desc: string;
  color: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        padding: "0 12px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: NAVY,
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 11,
            color: TEXT_MUTED,
            fontStyle: "italic",
            margin: "4px 0 8px",
          }}
        >
          ({alias})
        </p>
      </div>

      {/* Pillar visual */}
      <div
        style={{
          width: 90,
          height: 240,
          background: `linear-gradient(180deg, ${color}, ${shadeColor(color, -25)})`,
          borderRadius: "4px 4px 0 0",
          position: "relative",
          boxShadow: `inset 4px 0 8px rgba(0,0,0,0.15), inset -4px 0 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.12)`,
          border: `2px solid ${shadeColor(color, -30)}`,
        }}
      >
        {/* Top cap */}
        <div
          style={{
            position: "absolute",
            top: -14,
            left: -10,
            right: -10,
            height: 14,
            background: shadeColor(color, -20),
            borderRadius: "4px 4px 0 0",
            border: `2px solid ${shadeColor(color, -35)}`,
          }}
        />
        {children}
      </div>

      {/* Base */}
      <div
        style={{
          width: 130,
          height: 16,
          background: shadeColor(color, -25),
          marginTop: -4,
          boxShadow: "0 4px 8px rgba(0,0,0,0.18)",
        }}
      />

      <p
        style={{
          fontSize: 11.5,
          color: TEXT_BODY,
          textAlign: "center",
          marginTop: 14,
          lineHeight: 1.5,
          maxWidth: 200,
        }}
      >
        {desc}
      </p>
    </div>
  );
}

/** Darken/lighten a hex color by percent (-100 to 100) */
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/* ─────────────────────────────────────────────
 *  Status color helpers theo spec TWD
 * ───────────────────────────────────────────── */

export function statusColor(score: number): string {
  if (score < 40) return DANGER;
  if (score < 60) return WARNING;
  if (score < 80) return SUCCESS;
  return NAVY;
}

export function statusLabel(score: number): string {
  if (score < 40) return "Nguy hiểm";
  if (score < 60) return "Cần cải thiện";
  if (score < 80) return "Ổn định";
  return "Thịnh vượng";
}

/* ─────────────────────────────────────────────
 *  ScoreScale — thanh ngang 0-100 với 6 persona
 * ───────────────────────────────────────────── */

export function ScoreScale({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const segments = [
    { from: 0, to: 20, label: "Financial Victim", color: DANGER },
    { from: 20, to: 40, label: "Financial Survivor", color: "#E07B3F" },
    { from: 40, to: 60, label: "Financial Struggler", color: WARNING },
    { from: 60, to: 80, label: "Financial Builder", color: SUCCESS },
    { from: 80, to: 90, label: "Wealth Creator", color: "#0A7C56" },
    { from: 90, to: 100, label: "Freedom Architect", color: NAVY },
  ];
  return (
    <div>
      <div
        style={{
          display: "flex",
          height: 28,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(12,38,66,0.12)",
          border: `1px solid ${NAVY}33`,
        }}
      >
        {segments.map((s, i) => (
          <div
            key={i}
            style={{
              flex: s.to - s.from,
              background: s.color,
            }}
          />
        ))}
      </div>
      <div style={{ position: "relative", marginTop: 4, height: 36 }}>
        <div
          style={{
            position: "absolute",
            left: `${v}%`,
            transform: "translateX(-50%)",
            top: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: `12px solid ${NAVY}`,
              marginBottom: -2,
            }}
          />
          <div
            style={{
              padding: "4px 12px",
              background: NAVY,
              color: "white",
              fontWeight: 800,
              fontSize: 12,
              borderRadius: 4,
              whiteSpace: "nowrap",
            }}
          >
            {v}/100
          </div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 6 }}>
        {segments.map((s, i) => (
          <div
            key={i}
            style={{
              flex: s.to - s.from,
              textAlign: "center",
              fontSize: 9.5,
              fontWeight: 700,
              padding: "0 2px",
              lineHeight: 1.3,
            }}
          >
            <div style={{ color: s.color }}>
              {s.from}-{s.to}
            </div>
            <div style={{ color: TEXT_BODY, fontWeight: 500, marginTop: 2 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  RiskHeatmapCell — 1 ô heatmap (cao = rủi ro)
 * ───────────────────────────────────────────── */

export function RiskHeatmapCell({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  const c = score >= 60 ? DANGER : score >= 40 ? WARNING : SUCCESS;
  const note =
    score >= 60 ? "Nguy hiểm" : score >= 40 ? "Cần cải thiện" : "An toàn";
  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        padding: 16,
        borderLeft: `6px solid ${c}`,
        boxShadow: "0 4px 12px rgba(12,38,66,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: TEXT_MUTED,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: c,
          lineHeight: 1,
        }}
      >
        {score}
        <span style={{ fontSize: 14, color: TEXT_MUTED, fontWeight: 600 }}>
          /100
        </span>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          color: c,
          fontWeight: 700,
        }}
      >
        {note}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  RoadmapStaircase — 5 cấp độ Freedom
 * ───────────────────────────────────────────── */

export function RoadmapStaircase({
  levels,
  currentLevel,
}: {
  levels: { label: string; range: string; desc: string }[];
  currentLevel: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${levels.length}, 1fr)`,
        gap: 10,
      }}
    >
      {levels.map((lv, i) => {
        const isActive = i === currentLevel;
        const isPast = i < currentLevel;
        const c = isActive ? NAVY : isPast ? SUCCESS : "#cbd5e0";
        return (
          <div
            key={i}
            style={{
              padding: 12,
              background: isActive ? "white" : CREAM_LIGHT,
              border: `2px solid ${isActive ? NAVY : "#e5e7eb"}`,
              borderTop: `5px solid ${c}`,
              borderRadius: 8,
              minHeight: 130,
              boxShadow: isActive ? "0 8px 24px rgba(12,38,66,0.15)" : "none",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: c,
                letterSpacing: 1,
              }}
            >
              {lv.range} {isActive ? "📍" : ""}
            </div>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                color: isActive ? NAVY : TEXT_DARK,
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              {lv.label}
            </div>
            <p
              style={{
                fontSize: 10,
                color: TEXT_MUTED,
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              {lv.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  ProgressBar — before/after
 * ───────────────────────────────────────────── */

export function ProgressBar({
  current,
  target,
  max = 100,
}: {
  current: number;
  target?: number;
  max?: number;
}) {
  const cPct = (current / max) * 100;
  const tPct = target !== undefined ? (target / max) * 100 : 0;
  return (
    <div>
      <div
        style={{
          height: 14,
          background: "#e5e7eb",
          borderRadius: 99,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${cPct}%`,
            background: `linear-gradient(90deg, ${WARNING}, ${SUCCESS})`,
            borderRadius: 99,
          }}
        />
        {target !== undefined && (
          <div
            style={{
              position: "absolute",
              left: `${tPct}%`,
              top: -3,
              bottom: -3,
              width: 3,
              background: NAVY,
              transform: "translateX(-1px)",
            }}
          />
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10.5,
          color: TEXT_MUTED,
          marginTop: 4,
          fontWeight: 600,
        }}
      >
        <span>
          Hiện tại:{" "}
          <strong style={{ color: SUCCESS }}>
            {current}/{max}
          </strong>
        </span>
        {target !== undefined && (
          <span>
            Mục tiêu:{" "}
            <strong style={{ color: NAVY }}>
              {target}/{max}
            </strong>
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  KPICard — KPI với consequence
 * ───────────────────────────────────────────── */

export function KPICard({
  label,
  value,
  unit,
  color = DANGER,
  consequence,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  consequence?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${color}55`,
        borderTop: `4px solid ${color}`,
        borderRadius: 10,
        padding: 18,
        boxShadow: "0 4px 12px rgba(12,38,66,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: TEXT_MUTED,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {value}
        {unit ? (
          <span style={{ fontSize: 14, color: TEXT_MUTED, fontWeight: 600 }}>
            {" "}
            {unit}
          </span>
        ) : null}
      </div>
      {consequence && (
        <p
          style={{
            fontSize: 11,
            color: TEXT_BODY,
            marginTop: 10,
            lineHeight: 1.5,
            paddingTop: 8,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {consequence}
        </p>
      )}
    </div>
  );
}
