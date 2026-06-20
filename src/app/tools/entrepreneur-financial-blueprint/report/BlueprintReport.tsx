"use client";

import Link from "next/link";
import {
  Crown,
  Printer,
  ArrowLeft,
  User,
  Brain,
  ListChecks,
  TrendingUp,
  CheckCircle2,
  Circle,
  Calendar,
  Mail,
  BarChart3,
  XCircle,
} from "lucide-react";
import type {
  BlueprintData,
  BlueprintProgress,
} from "@/lib/blueprint/types";
import {
  buildBlueprintInsights,
  type BlueprintInsights,
} from "@/lib/blueprint/insights";
import {
  buildBlueprintProReports,
  type FreedomRoadmapReport,
} from "@/lib/blueprint/pro-reports";
import {
  MINDSET_QUESTIONS,
  MINDSET_LEVELS,
  MINDSET_CATEGORIES,
  mindsetLevel,
  scoreMindset,
} from "@/lib/blueprint/data/mindset-questions";
import {
  LOVE_OF_MONEY_QUESTIONS,
  loveOfMoneyTier,
  scoreLoveOfMoney,
} from "@/lib/blueprint/data/love-of-money-questions";
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
import { HABITS_QUESTIONS } from "@/lib/blueprint/data/habits-questions";

const BRAND = "#2563EB";
const GREEN = "#22c55e";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const PURPLE = "#a855f7";
const AMBER = "#f59e0b";

interface Props {
  data: BlueprintData;
  progress: BlueprintProgress;
  userEmail: string;
  updatedAt: string | null;
}

export default function BlueprintReport({
  data,
  progress,
  userEmail,
  updatedAt,
}: Props) {
  const profile = data.profile ?? {};
  const mindset = data.mindset ?? {};
  const habits = data.habits?.answers ?? {};
  const status = data.status ?? {};

  // ─── Mindset scores ───
  const archetypeAnswers = mindset.archetypeAnswers ?? {};
  const loveAnswers = mindset.loveOfMoneyAnswers ?? {};
  const beliefsAnswers = mindset.beliefsAnswers ?? {};

  const archetypeDone =
    Object.keys(archetypeAnswers).length === MINDSET_QUESTIONS.length;
  const loveDone =
    Object.keys(loveAnswers).length === LOVE_OF_MONEY_QUESTIONS.length;
  const beliefsDone =
    Object.keys(beliefsAnswers).length === BELIEF_QUESTIONS.length;

  const archetypeScores = scoreMindset(archetypeAnswers);
  const loveScore = scoreLoveOfMoney(loveAnswers);
  const loveTier = loveOfMoneyTier(loveScore);
  const beliefScore = scoreBeliefs(beliefsAnswers);
  const beliefMax = BELIEF_QUESTIONS.length * 10;

  // ─── Cashflow stats ───
  const cashflow = status.cashflow ?? {};
  const sumObj = (o: object | undefined) =>
    Object.values(o ?? {}).reduce<number>(
      (s, v) => s + (typeof v === "number" ? v : 0),
      0
    );
  const totalIncome = sumObj(cashflow.income);
  const totalFixed = sumObj(cashflow.fixedCosts);
  const totalVar = sumObj(cashflow.variableCosts);
  const totalExpense = totalFixed + totalVar;
  const netCashflow = totalIncome - totalExpense;
  const savingRate =
    totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  // ─── 8 báo cáo phân tích chuyên sâu ───
  const insights = buildBlueprintInsights(data);
  // ─── 4 báo cáo Pro ───
  const pro = buildBlueprintProReports(data);

  // ─── Net Worth stats ───
  const netWorth = status.netWorth ?? {};
  const totalAssets = sumObj(netWorth.assets);
  const totalLiab = sumObj(netWorth.liabilities);
  const netWorthValue = totalAssets - totalLiab;

  // ─── Insurance stats ───
  const insurance = status.insurance ?? {};
  const totalCoverage = sumObj(insurance.coverage);
  const monthlyPremium = insurance.monthlyPremium ?? 0;

  const now = new Date();
  const updated = updatedAt ? new Date(updatedAt) : now;
  const reportDate = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* ─── Toolbar (hidden when printing) ─── */}
      <div
        className="sticky top-0 z-50 print:hidden"
        style={{
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #232323",
        }}
      >
        <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/tools/entrepreneur-financial-blueprint"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại Blueprint
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-transform hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, #3B82F6, ${BRAND})`,
              color: "#0a0a0a",
              boxShadow: `0 8px 24px ${BRAND}55`,
            }}
          >
            <Printer size={14} />
            In / Lưu PDF
          </button>
        </div>
      </div>

      {/* ─── Report sheet ─── */}
      <div className="max-w-[900px] mx-auto py-8 print:py-0">
        <div
          id="report-sheet"
          className="rounded-2xl text-white print:rounded-none print:text-black"
          style={{
            background: "#141414",
            border: "1px solid #232323",
          }}
        >
          {/* Header */}
          <div
            className="p-8 print:p-6 border-b border-[#232323] print:border-gray-300"
            style={{
              background: `linear-gradient(135deg, ${BRAND}10, transparent)`,
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{
                    background: `${BRAND}1a`,
                    color: BRAND,
                    border: `1px solid ${BRAND}55`,
                  }}
                >
                  <Crown size={10} />
                  Entrepreneur Financial Blueprint™
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight print:text-2xl print:text-black">
                  Báo Cáo Tổng Hợp
                </h1>
                <p className="text-sm text-gray-400 mt-1 print:text-gray-700">
                  Hệ thống tài chính cá nhân toàn diện
                </p>
              </div>
              <div className="text-right text-[11px] text-gray-500 print:text-gray-700 shrink-0">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar size={11} />
                  In ngày {reportDate}
                </div>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <Mail size={11} />
                  {userEmail}
                </div>
                <div className="text-[10px] text-gray-600 mt-1">
                  Cập nhật:{" "}
                  {updated.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Progress overview */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {(
                [
                  { key: "profile", label: "Phần I" },
                  { key: "mindset", label: "Phần II" },
                  { key: "habits", label: "Phần III" },
                  { key: "status", label: "Phần IV" },
                ] as const
              ).map((p) => {
                const done = progress[p.key] === true;
                return (
                  <div
                    key={p.key}
                    className="rounded-lg px-2.5 py-2 flex items-center gap-2"
                    style={{
                      background: done
                        ? `${GREEN}10`
                        : "rgba(255,255,255,0.04)",
                      border: `1px solid ${done ? `${GREEN}55` : "#1f1f1f"}`,
                    }}
                  >
                    {done ? (
                      <CheckCircle2 size={12} style={{ color: GREEN }} />
                    ) : (
                      <Circle size={12} className="text-gray-600" />
                    )}
                    <span
                      className="text-[10.5px] font-bold print:text-black"
                      style={{ color: done ? GREEN : "#888" }}
                    >
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── PHẦN I — PROFILE ─── */}
          <ReportSection
            label="Phần I — Thông tin cơ bản"
            icon={User}
            color={BLUE}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <DataRow label="Họ tên" value={profile.fullName} />
              <DataRow
                label="Năm sinh"
                value={profile.birthYear ? String(profile.birthYear) : undefined}
              />
              <DataRow label="Giới tính" value={genderLabel(profile.gender)} />
              <DataRow
                label="Tình trạng hôn nhân"
                value={maritalLabel(profile.maritalStatus)}
              />
              <DataRow
                label="Số con"
                value={
                  profile.children !== undefined
                    ? String(profile.children)
                    : undefined
                }
              />
              <DataRow label="Nghề nghiệp" value={profile.occupation} />
              <DataRow
                label="Số năm Entrepreneur"
                value={
                  profile.entrepreneurYears !== undefined
                    ? String(profile.entrepreneurYears) + " năm"
                    : undefined
                }
              />
              <DataRow label="Tỉnh / TP" value={profile.city} />
              <DataRow
                label="Nguồn thu nhập chính"
                value={incomeSourcesLabel(profile)}
              />
            </div>
          </ReportSection>

          {/* ─── PHẦN II — MINDSET ─── */}
          <ReportSection
            label="Phần II — Tâm thức về tiền"
            icon={Brain}
            color={PURPLE}
          >
            {/* 2.1 Archetype — 7 nhóm khuynh hướng */}
            <SubBlock title="Test Tâm Thức Tiền Bạc (35 câu · 7 nhóm khuynh hướng)">
              {archetypeDone ? (
                <div className="space-y-1.5">
                  {archetypeScores.map((s, i) => {
                    const cat = MINDSET_CATEGORIES[i];
                    const lv = mindsetLevel(s);
                    const c = lv === "Cao" ? GREEN : lv === "Trung bình" ? BRAND : "#666";
                    return (
                      <div
                        key={i}
                        className="grid grid-cols-[1fr_120px_auto] gap-3 items-center py-2 border-b border-[#1f1f1f] print:border-gray-200 last:border-0"
                      >
                        <div>
                          <div className="text-[12px] font-extrabold text-white print:text-black leading-tight">
                            {cat.index}. {cat.name}
                            {cat.alias && (
                              <span className="text-gray-500 font-normal print:text-gray-700">
                                {" "}({cat.alias})
                              </span>
                            )}
                          </div>
                          {lv === "Cao" && (
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-snug print:text-gray-700">
                              {cat.highMeaning}
                            </p>
                          )}
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "#1a1a1a" }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${(s / 15) * 100}%`,
                              background: `linear-gradient(90deg, ${c}, ${c}cc)`,
                            }}
                          />
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div
                            className="text-base font-extrabold print:text-black"
                            style={{ color: c }}
                          >
                            {s}/15
                          </div>
                          <div
                            className="text-[9px] font-bold uppercase tracking-wider print:text-black"
                            style={{ color: c }}
                          >
                            {lv}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-2 px-3 py-2 rounded-md text-[10.5px] leading-snug print:text-gray-800"
                    style={{
                      background: `${PURPLE}08`,
                      color: PURPLE,
                      border: `1px solid ${PURPLE}33`,
                    }}>
                    💡 <strong>Quy ước mức:</strong> 0-5 = Thấp · 6-10 = Trung bình · 11-15 = Cao (nổi trội).
                    Nhóm chủ đạo {(() => {
                      let maxI = 0;
                      for (let i = 1; i < archetypeScores.length; i++)
                        if (archetypeScores[i] > archetypeScores[maxI]) maxI = i;
                      return `→ ${MINDSET_CATEGORIES[maxI].name}`;
                    })()}.
                  </div>
                </div>
              ) : (
                <NotDoneNote />
              )}
            </SubBlock>

            {/* 2.2 Love of money */}
            <SubBlock title="Mức Độ Yêu Tiền (38 câu)">
              {loveDone ? (
                <div className="grid sm:grid-cols-[140px_1fr] gap-3 items-start">
                  <div>
                    <ScoreBox
                      label="Tổng điểm"
                      value={loveScore}
                      max={38}
                      color={
                        loveTier.tier === 1
                          ? RED
                          : loveTier.tier === 2
                            ? AMBER
                            : GREEN
                      }
                    />
                  </div>
                  <div
                    className="rounded-lg p-3"
                    style={{
                      background:
                        loveTier.tier === 1
                          ? `${RED}10`
                          : loveTier.tier === 2
                            ? `${AMBER}10`
                            : `${GREEN}10`,
                      border: `1px solid ${
                        loveTier.tier === 1
                          ? RED
                          : loveTier.tier === 2
                            ? AMBER
                            : GREEN
                      }55`,
                    }}
                  >
                    <div
                      className="text-[12px] font-extrabold mb-1 print:text-black"
                      style={{
                        color:
                          loveTier.tier === 1
                            ? RED
                            : loveTier.tier === 2
                              ? AMBER
                              : GREEN,
                      }}
                    >
                      {loveTier.label}
                    </div>
                    <p className="text-[11.5px] text-gray-300 leading-snug print:text-gray-800">
                      {loveTier.desc}
                    </p>
                  </div>
                </div>
              ) : (
                <NotDoneNote />
              )}
            </SubBlock>

            {/* 2.3 Beliefs — chi tiết theo khung báo cáo */}
            <SubBlock title="Niềm Tin Về Tiền (72 nhận định · điểm 1-10)">
              {beliefsDone ? (
                <div className="space-y-3">
                  {/* 3 chỉ số chính */}
                  {(() => {
                    const avg = beliefsAverage(beliefsAnswers);
                    const strongCount = beliefsStrongCount(beliefsAnswers);
                    const tier = beliefsTier(avg);
                    const tc =
                      tier.tier === 1
                        ? GREEN
                        : tier.tier === 2
                          ? AMBER
                          : RED;
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div
                            className="rounded-lg p-3 text-center"
                            style={{
                              background: "#0a0a0a",
                              border: `1px solid ${BRAND}55`,
                            }}
                          >
                            <div className="text-[9.5px] uppercase tracking-wider text-gray-500 font-bold print:text-gray-700">
                              Tổng điểm (72-720)
                            </div>
                            <div
                              className="text-2xl font-extrabold mt-0.5 print:text-black"
                              style={{ color: BRAND }}
                            >
                              {beliefScore}
                            </div>
                            <div className="text-[9px] text-gray-600 print:text-gray-700">
                              / {beliefMax}
                            </div>
                          </div>
                          <div
                            className="rounded-lg p-3 text-center"
                            style={{
                              background: "#0a0a0a",
                              border: `1px solid ${tc}55`,
                            }}
                          >
                            <div className="text-[9.5px] uppercase tracking-wider text-gray-500 font-bold print:text-gray-700">
                              Điểm TB / câu
                            </div>
                            <div
                              className="text-2xl font-extrabold mt-0.5 print:text-black"
                              style={{ color: tc }}
                            >
                              {avg}
                            </div>
                            <div className="text-[9px] text-gray-600 print:text-gray-700">
                              / 10
                            </div>
                          </div>
                          <div
                            className="rounded-lg p-3 text-center"
                            style={{
                              background: "#0a0a0a",
                              border: `1px solid ${RED}55`,
                            }}
                          >
                            <div className="text-[9.5px] uppercase tracking-wider text-gray-500 font-bold print:text-gray-700">
                              Câu điểm ≥ 7
                            </div>
                            <div
                              className="text-2xl font-extrabold mt-0.5 print:text-black"
                              style={{ color: RED }}
                            >
                              {strongCount}
                            </div>
                            <div className="text-[9px] text-gray-600 print:text-gray-700">
                              giới hạn mạnh
                            </div>
                          </div>
                        </div>

                        {/* Tier diễn giải */}
                        <div
                          className="rounded-lg p-3"
                          style={{
                            background: `${tc}10`,
                            border: `1px solid ${tc}55`,
                          }}
                        >
                          <div
                            className="text-[12.5px] font-extrabold mb-1 print:text-black"
                            style={{ color: tc }}
                          >
                            {tier.label}
                          </div>
                          <p className="text-[11px] text-gray-300 leading-snug print:text-gray-800">
                            {tier.desc}
                          </p>
                        </div>

                        {/* 5 nhóm chủ đề */}
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 print:text-gray-700">
                            Phân tích 5 nhóm chủ đề niềm tin
                          </div>
                          <div className="space-y-1.5">
                            {BELIEF_THEMES.map((theme) => {
                              const avgT = avgBeliefTheme(theme, beliefsAnswers);
                              const c = !theme.isLimiting
                                ? BLUE
                                : avgT >= 6
                                  ? RED
                                  : avgT >= 3
                                    ? AMBER
                                    : GREEN;
                              return (
                                <div
                                  key={theme.key}
                                  className="grid grid-cols-[1fr_100px_auto] gap-3 items-center py-2 border-b border-[#1f1f1f] print:border-gray-200 last:border-0"
                                >
                                  <div>
                                    <div
                                      className="text-[11.5px] font-extrabold print:text-black"
                                      style={{ color: c }}
                                    >
                                      {theme.label}
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-snug print:text-gray-700">
                                      {theme.description}
                                    </p>
                                  </div>
                                  <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ background: "#1a1a1a" }}
                                  >
                                    <div
                                      className="h-full"
                                      style={{
                                        width: `${(avgT / 10) * 100}%`,
                                        background: `linear-gradient(90deg, ${c}, ${c}cc)`,
                                      }}
                                    />
                                  </div>
                                  <div className="text-right whitespace-nowrap">
                                    <div
                                      className="text-[13px] font-extrabold print:text-black"
                                      style={{ color: c }}
                                    >
                                      {avgT}
                                    </div>
                                    <div className="text-[9px] text-gray-500 print:text-gray-700">
                                      TB/câu · {theme.questions.length} câu
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Top niềm tin giới hạn mạnh */}
                        {(() => {
                          const top = topLimitingBeliefs(beliefsAnswers, 5);
                          if (top.length === 0) return null;
                          return (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 print:text-gray-700">
                                Top {top.length} niềm tin giới hạn cần ưu tiên tháo gỡ
                              </div>
                              <ul className="space-y-1">
                                {top.map((q, i) => (
                                  <li
                                    key={q.id}
                                    className="flex items-start gap-2 text-[11.5px] text-gray-300 print:text-gray-800 leading-snug py-1.5 border-b border-[#1f1f1f] print:border-gray-200 last:border-0"
                                  >
                                    <span
                                      className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-extrabold"
                                      style={{
                                        background: `${RED}22`,
                                        color: RED,
                                      }}
                                    >
                                      #{i + 1}
                                    </span>
                                    <span className="flex-1">
                                      <strong className="text-white print:text-black">
                                        C{q.id}.
                                      </strong>{" "}
                                      {q.text}
                                    </span>
                                    <span
                                      className="text-[12px] font-extrabold whitespace-nowrap print:text-black"
                                      style={{ color: RED }}
                                    >
                                      {q.score}/10
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <NotDoneNote />
              )}
            </SubBlock>
          </ReportSection>

          {/* ─── PHẦN III — HABITS ─── */}
          <ReportSection
            label="Phần III — Thói quen về tiền"
            icon={ListChecks}
            color={BRAND}
          >
            <div className="space-y-2">
              {HABITS_QUESTIONS.map((q) => {
                const v = habits[q.id];
                let display = "—";
                if (q.type === "yes_no") {
                  if (v === true) display = "Có";
                  else if (v === false) display = "Không";
                } else if (q.type === "single_select") {
                  if (typeof v === "string" && q.options) {
                    display = q.options.find((o) => o.value === v)?.label ?? v;
                  }
                } else if (q.type === "textarea") {
                  if (typeof v === "string" && v.trim().length > 0) display = v;
                }
                return (
                  <div
                    key={q.id}
                    className="grid grid-cols-[1fr_auto] gap-3 items-start py-1.5 border-b border-[#1f1f1f] print:border-gray-200 last:border-0"
                  >
                    <span className="text-[12px] text-gray-300 leading-snug print:text-gray-800">
                      {q.text}
                    </span>
                    <span
                      className="text-[12px] font-bold text-right shrink-0 max-w-[280px] leading-snug print:text-black"
                      style={{
                        color: display === "—" ? "#666" : BRAND,
                      }}
                    >
                      {display}
                    </span>
                  </div>
                );
              })}
            </div>
          </ReportSection>

          {/* ─── PHẦN IV — STATUS ─── */}
          <ReportSection
            label="Phần IV — Hiện trạng tài chính"
            icon={TrendingUp}
            color={GREEN}
          >
            {/* Cashflow */}
            <SubBlock title="Cân Đối Thu Chi /tháng">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI label="Tổng thu" value={totalIncome} color={GREEN} />
                <KPI label="Tổng chi" value={totalExpense} color={RED} />
                <KPI
                  label="Dòng tiền ròng"
                  value={netCashflow}
                  color={netCashflow >= 0 ? GREEN : RED}
                />
                <KPI
                  label="Tỉ lệ tiết kiệm"
                  value={savingRate}
                  color={
                    savingRate >= 20 ? GREEN : savingRate >= 10 ? AMBER : RED
                  }
                  suffix="%"
                />
              </div>
            </SubBlock>

            {/* Net Worth */}
            <SubBlock title="Cân Đối Tài Sản (Net Worth)">
              <div className="grid grid-cols-3 gap-3">
                <KPI label="Tổng tài sản" value={totalAssets} color={GREEN} />
                <KPI label="Tổng nợ" value={totalLiab} color={RED} />
                <KPI
                  label="Net Worth"
                  value={netWorthValue}
                  color={netWorthValue >= 0 ? GREEN : RED}
                />
              </div>
            </SubBlock>

            {/* Insurance */}
            <SubBlock title="Bảo hiểm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label="BH nhân thọ"
                  value={insurance.coverage?.life ?? 0}
                  color={BRAND}
                />
                <KPI
                  label="BH sức khỏe"
                  value={insurance.coverage?.health ?? 0}
                  color={RED}
                />
                <KPI
                  label="Tổng mệnh giá"
                  value={totalCoverage}
                  color={GREEN}
                />
                <KPI
                  label="Phí BH /tháng"
                  value={monthlyPremium}
                  color={BLUE}
                />
              </div>
            </SubBlock>
          </ReportSection>

          {/* ─── PHẦN V — BÁO CÁO PHÂN TÍCH CHUYÊN SÂU ─── */}
          <ReportSection
            label="Phần V — Báo cáo phân tích chuyên sâu"
            icon={BarChart3}
            color={BRAND}
          >
            {/* 1. JARS — Cân Đối Thu Chi */}
            <SubBlock title="1. Cân Đối Thu Chi — 6 quỹ JARS">
              <div className="space-y-1.5">
                {insights.jars.jars.map((j) => {
                  const over = j.actualPct > j.targetPct;
                  const c = over ? RED : j.actualPct >= j.targetPct * 0.5 ? GREEN : AMBER;
                  return (
                    <div
                      key={j.key}
                      className="grid grid-cols-[160px_1fr_100px] gap-3 items-center text-[11px]"
                    >
                      <span className="text-gray-300 print:text-gray-800 font-bold">
                        {j.label}
                      </span>
                      <div
                        className="h-2 rounded-full overflow-hidden relative"
                        style={{ background: "#1a1a1a" }}
                      >
                        {/* Target marker */}
                        <div
                          className="absolute top-0 bottom-0 w-px"
                          style={{
                            left: `${j.targetPct}%`,
                            background: BRAND,
                            opacity: 0.6,
                          }}
                        />
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, j.actualPct)}%`,
                            background: `linear-gradient(90deg, ${c}, ${c}cc)`,
                          }}
                        />
                      </div>
                      <div
                        className="text-right font-extrabold print:text-black"
                        style={{ color: c }}
                      >
                        {j.actualPct}% / {j.targetPct}%
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="mt-3 px-3 py-2 rounded-md text-[10.5px] leading-snug print:text-gray-700"
                style={{
                  background: insights.jars.necOverCap ? `${RED}10` : `${GREEN}10`,
                  color: insights.jars.necOverCap ? RED : GREEN,
                  border: `1px solid ${insights.jars.necOverCap ? RED : GREEN}55`,
                }}
              >
                {insights.jars.necOverCap
                  ? `⚠ Chi thiết yếu ${insights.jars.necRatio}% > trần 55% — tối ưu nhà ở · đi lại · gói cước.`
                  : `✓ Chi thiết yếu ${insights.jars.necRatio}% trong trần 55%. Tỉ lệ tiết kiệm ${insights.jars.savingRate}%.`}
              </div>
            </SubBlock>

            {/* 2. Net Worth — 4 nhóm tài sản */}
            <SubBlock title="2. Cân Đối Tài Sản — 4 nhóm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label={`Thanh khoản (${insights.assets.liquidPct}%)`}
                  value={insights.assets.liquid}
                  color={GREEN}
                />
                <KPI
                  label={`Đầu tư (${insights.assets.investedPct}%)`}
                  value={insights.assets.invested}
                  color={BLUE}
                />
                <KPI
                  label={`Sở hữu — nhà/xe (${insights.assets.ownedPct}%)`}
                  value={insights.assets.owned}
                  color={BRAND}
                />
                <KPI
                  label={`Tỉ lệ sinh lời`}
                  value={insights.assets.productivePct}
                  color={
                    insights.assets.productivePct >= 50
                      ? GREEN
                      : insights.assets.productivePct >= 25
                        ? AMBER
                        : RED
                  }
                  suffix="%"
                />
              </div>
              <p className="text-[10.5px] text-gray-400 leading-snug mt-3 print:text-gray-700">
                💡 Tài sản <strong>sinh lời</strong> = Thanh khoản + Đầu tư. Lý
                tưởng ≥ 50% tổng tài sản.
              </p>
            </SubBlock>

            {/* 3. Quỹ Dự Phòng (Thoát Nghèo) */}
            <SubBlock title="3. Quỹ Dự Phòng — Ngưỡng Thoát Nghèo">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label="Mục tiêu (chi × 12)"
                  value={insights.emergency.target}
                  color={BLUE}
                />
                <KPI
                  label="Đang có (TK thanh khoản)"
                  value={insights.emergency.liquid}
                  color={GREEN}
                />
                <KPI
                  label="Số tháng được phủ"
                  value={Math.round(insights.emergency.monthsCovered)}
                  color={
                    insights.emergency.monthsCovered >= 12 ? GREEN : AMBER
                  }
                  suffix=" tháng"
                />
                <KPI
                  label="% mục tiêu"
                  value={insights.emergency.achievementPct}
                  color={insights.emergency.achieved ? GREEN : AMBER}
                  suffix="%"
                />
              </div>
              <StatusRow
                achieved={insights.emergency.achieved}
                achievedText="✓ Đã thoát nghèo — quỹ dự phòng ≥ 12 tháng chi thiết yếu."
                missingText={`Còn thiếu ${fmtCompact(insights.emergency.gap)} để đạt ngưỡng Thoát Nghèo (12 tháng chi tiêu).`}
              />
            </SubBlock>

            {/* 4. An Toàn Tài Chính */}
            <SubBlock title="4. An Toàn Tài Chính — TS ≥ 120 tháng TN + BH đủ">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label="Mục tiêu (TN × 120)"
                  value={insights.safety.target}
                  color={BLUE}
                />
                <KPI
                  label="TS thanh khoản + ĐT"
                  value={insights.safety.liquidPlusInvest}
                  color={GREEN}
                />
                <KPI
                  label="% mục tiêu"
                  value={insights.safety.achievementPct}
                  color={
                    insights.safety.achievementPct >= 100 ? GREEN : AMBER
                  }
                  suffix="%"
                />
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: `${PURPLE}08`,
                    border: `1px solid ${PURPLE}33`,
                  }}
                >
                  <div className="text-[9.5px] uppercase tracking-wider text-gray-500 font-bold mb-1 print:text-gray-700">
                    Bảo hiểm
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <BadgeYesNo
                      ok={insights.safety.hasLifeInsurance}
                      label="BH Nhân Thọ"
                    />
                    <BadgeYesNo
                      ok={insights.safety.hasHealthInsurance}
                      label="BH Sức Khoẻ"
                    />
                  </div>
                </div>
              </div>
              <StatusRow
                achieved={insights.safety.achieved}
                achievedText="✓ Đã đạt An Toàn Tài Chính — TS ≥ 120 tháng TN + có đủ 2 loại BH."
                missingText="Chưa đạt — cần TS ≥ 120 tháng TN VÀ có BH nhân thọ + sức khoẻ."
              />
            </SubBlock>

            {/* 5. Độc Lập Tài Chính */}
            <SubBlock title="5. Độc Lập Tài Chính — PP1 hoặc PP2">
              <div className="grid sm:grid-cols-2 gap-3">
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: insights.independence.pp1Achieved
                      ? `${GREEN}10`
                      : "#0a0a0a",
                    border: `1px solid ${insights.independence.pp1Achieved ? `${GREEN}55` : "#1f1f1f"}`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-1 print:text-gray-700"
                    style={{ color: insights.independence.pp1Achieved ? GREEN : "#888" }}>
                    PP1 — Dòng tiền
                  </div>
                  <div className="text-[11.5px] text-gray-300 print:text-gray-800 leading-snug">
                    TN thụ động{" "}
                    <strong className="print:text-black" style={{ color: BRAND }}>
                      {fmtCompact(insights.independence.monthlyPassive)}
                    </strong>{" "}
                    /tháng vs chi{" "}
                    <strong className="print:text-black" style={{ color: BRAND }}>
                      {fmtCompact(insights.independence.monthlyExpense)}
                    </strong>{" "}
                    = <strong style={{ color: insights.independence.pp1Achieved ? GREEN : AMBER }}>
                      {insights.independence.pp1Ratio}%
                    </strong>
                  </div>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: insights.independence.pp2Achieved
                      ? `${GREEN}10`
                      : "#0a0a0a",
                    border: `1px solid ${insights.independence.pp2Achieved ? `${GREEN}55` : "#1f1f1f"}`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-1 print:text-gray-700"
                    style={{ color: insights.independence.pp2Achieved ? GREEN : "#888" }}>
                    PP2 — Quy tắc 4%
                  </div>
                  <div className="text-[11.5px] text-gray-300 print:text-gray-800 leading-snug">
                    TS{" "}
                    <strong className="print:text-black" style={{ color: BRAND }}>
                      {fmtCompact(insights.independence.totalLiquid)}
                    </strong>{" "}
                    × 4% / 12 ={" "}
                    <strong className="print:text-black" style={{ color: BRAND }}>
                      {fmtCompact(insights.independence.passiveFromAssets)}
                    </strong>{" "}
                    /tháng ·{" "}
                    <strong style={{ color: insights.independence.pp2Achieved ? GREEN : AMBER }}>
                      {insights.independence.pp2Ratio}% target
                    </strong>
                  </div>
                </div>
              </div>
              <StatusRow
                achieved={insights.independence.achieved}
                achievedText="✓ Độc Lập Tài Chính — có thể nghỉ làm full-time."
                missingText={`Mục tiêu corpus = ${fmtCompact(insights.independence.targetCorpus)} (chi ròng × 12 ÷ 4%).`}
              />
            </SubBlock>

            {/* 6. Bảo Hiểm DIME */}
            <SubBlock title="6. Mức Độ Bảo Vệ Bảo Hiểm — DIME">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label="Tổng mệnh giá"
                  value={insights.insurance.totalCoverage}
                  color={BRAND}
                />
                <KPI
                  label="Đề xuất DIME"
                  value={insights.insurance.totalNeed}
                  color={BLUE}
                />
                <KPI
                  label="% bảo vệ"
                  value={insights.insurance.overallAchievementPct}
                  color={
                    insights.insurance.overallAchievementPct >= 80 ? GREEN : AMBER
                  }
                  suffix="%"
                />
                <KPI
                  label="Phí BH /TN"
                  value={insights.insurance.premiumPct}
                  color={
                    insights.insurance.premiumPct >= 5 &&
                    insights.insurance.premiumPct <= 15
                      ? GREEN
                      : insights.insurance.premiumPct > 15
                        ? RED
                        : AMBER
                  }
                  suffix="%"
                />
              </div>
              <p className="text-[10.5px] text-gray-400 leading-snug mt-3 print:text-gray-700">
                💡 Chi tiết DIME: Nhân thọ {fmtCompact(insights.insurance.lifeNeed)} ·
                Sức khoẻ {fmtCompact(insights.insurance.healthNeed)} · Tai nạn{" "}
                {fmtCompact(insights.insurance.accidentNeed)} · Bệnh hiểm nghèo{" "}
                {fmtCompact(insights.insurance.criticalNeed)}.
              </p>
            </SubBlock>

            {/* 7. Kế Hoạch Hưu Trí */}
            <SubBlock title="7. Kế Hoạch Hưu Trí — FIRE 60-85 tuổi">
              {insights.retirement.currentAge === null ? (
                <NotDoneNote />
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KPI
                      label="Tuổi hiện tại"
                      value={insights.retirement.currentAge}
                      color={BLUE}
                      suffix=" tuổi"
                    />
                    <KPI
                      label="Còn lại tới hưu"
                      value={insights.retirement.yearsToRetirement}
                      color={AMBER}
                      suffix=" năm"
                    />
                    <KPI
                      label="Corpus cần lúc hưu"
                      value={insights.retirement.corpusNeeded}
                      color={BRAND}
                    />
                    <KPI
                      label="Cần đóng /tháng"
                      value={insights.retirement.requiredMonthlyContribution}
                      color={
                        insights.retirement.requiredMonthlyContribution === 0
                          ? GREEN
                          : RED
                      }
                    />
                  </div>
                  <p className="text-[10.5px] text-gray-400 leading-snug mt-3 print:text-gray-700">
                    💡 Giả định: lãi đầu tư 8%/năm, lạm phát 3%/năm, sống tới 85
                    tuổi. Chi tiêu /tháng lúc hưu (đã điều chỉnh lạm phát) ≈{" "}
                    <strong className="text-white print:text-black">
                      {fmtCompact(insights.retirement.futureMonthlyExpense)}
                    </strong>
                    . Đã có corpus{" "}
                    <strong className="text-white print:text-black">
                      {fmtCompact(insights.retirement.currentCorpus)}
                    </strong>{" "}
                    ({insights.retirement.achievedCorpusRatio}% target).
                  </p>
                </>
              )}
            </SubBlock>

            {/* 8. Hoạch Định Dòng Tiền */}
            <SubBlock title="8. Hoạch Định Dòng Tiền — Bucket Cascade">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label="Trần thiết yếu (55%)"
                  value={insights.cashFlowMap.essentialCap}
                  color={RED}
                />
                <KPI
                  label="Chi thực tế"
                  value={insights.cashFlowMap.essentialActual}
                  color={AMBER}
                />
                <KPI
                  label="Còn dư /tháng"
                  value={insights.cashFlowMap.afterEssential}
                  color={GREEN}
                />
                <KPI
                  label="Quỹ dự phòng (Lương×12)"
                  value={insights.cashFlowMap.emergencyTarget}
                  color={BLUE}
                />
              </div>
              <div
                className="mt-3 px-3 py-2 rounded-md text-[10.5px] leading-snug print:text-gray-700"
                style={{
                  background:
                    insights.cashFlowMap.flowStatus === "cascading"
                      ? `${GREEN}10`
                      : insights.cashFlowMap.flowStatus === "building_emergency"
                        ? `${AMBER}10`
                        : "#0a0a0a",
                  color:
                    insights.cashFlowMap.flowStatus === "cascading"
                      ? GREEN
                      : insights.cashFlowMap.flowStatus === "building_emergency"
                        ? AMBER
                        : "#888",
                  border: `1px solid ${
                    insights.cashFlowMap.flowStatus === "cascading"
                      ? GREEN
                      : insights.cashFlowMap.flowStatus === "building_emergency"
                        ? AMBER
                        : "#2a2a2a"
                  }55`,
                }}
              >
                {insights.cashFlowMap.flowStatus === "cascading" && (
                  <>
                    ✓ Quỹ dự phòng đầy — dòng tiền dư{" "}
                    {fmtCompact(insights.cashFlowMap.monthlyInvestFlow)}/th đang
                    chảy xuống An Toàn TC + Đầu Tư.
                  </>
                )}
                {insights.cashFlowMap.flowStatus === "building_emergency" && (
                  <>
                    🛠 Đang xây quỹ dự phòng — dồn{" "}
                    {fmtCompact(insights.cashFlowMap.monthlyEmergencyFlow)}/th
                    vào dự phòng. Khi đầy sẽ mở khoá tầng tiếp theo.
                  </>
                )}
                {insights.cashFlowMap.flowStatus === "no_income" && (
                  <>Chưa có dữ liệu thu nhập để vẽ dòng chảy.</>
                )}
                {insights.cashFlowMap.essentialSavings > 0 && (
                  <>
                    {" "}💎 Tiết kiệm thiết yếu{" "}
                    {fmtCompact(insights.cashFlowMap.essentialSavings)}/th → bonus
                    FFA.
                  </>
                )}
              </div>
            </SubBlock>
          </ReportSection>

          {/* ─── ENTREPRENEUR WEALTH MRI™ ─── */}
          <ReportSection
            label="Entrepreneur Wealth MRI™"
            icon={Brain}
            color={PURPLE}
          >
            <div
              className="rounded-lg p-4 mb-3"
              style={{
                background: `linear-gradient(135deg, ${PURPLE}10, ${BRAND}06)`,
                border: `1px solid ${PURPLE}55`,
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr] gap-3 items-center">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 print:text-gray-700">
                    Wealth Score™
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-5xl font-extrabold print:text-black"
                      style={{ color: PURPLE }}
                    >
                      {pro.wealthMRI.wealthScore}
                    </span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                  <div
                    className="text-[13px] font-extrabold mt-1 print:text-black"
                    style={{ color: BRAND }}
                  >
                    {pro.wealthMRI.tier}
                  </div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "#0a0a0a",
                    border: `1px solid ${BRAND}55`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5 print:text-gray-700">
                    Money Personality
                  </div>
                  <div
                    className="text-base font-extrabold print:text-black"
                    style={{ color: BRAND }}
                  >
                    {pro.wealthMRI.personality}
                  </div>
                  <div className="text-[10.5px] text-gray-400 mt-0.5 print:text-gray-700">
                    {pro.wealthMRI.personalityLabel}
                  </div>
                </div>
              </div>
            </div>

            <SubBlock title="5 Tầng Wealth MRI™">
              <TwoCol>
                <div className="space-y-2">
                  <ExplainBox
                    title="Wealth MRI™ là gì?"
                    meaning="Đo lường hệ điều hành tài chính vô hình bên trong — thứ thực sự tạo ra thu nhập, tài sản, và quyết định tài chính của anh/chị. 5 tầng từ ngoài vào trong: nhận thức → quan hệ → niềm tin → tính cách → kỷ luật."
                    color={PURPLE}
                  />
                  <ExplainBox
                    title="Wealth Score™"
                    formula="15% C + 20% R + 20% B + 35% OS + 10% P"
                    meaning="Điểm tổng tài chính nội tâm. C=Consciousness, R=Relationship, B=Belief, OS=Wealth Operating System, P=Personality. Wealth OS chiếm tỷ trọng cao nhất vì kỷ luật quyết định kết quả."
                    color={PURPLE}
                  />
                  <ExplainBox
                    title="Money Personality"
                    meaning={`Có 6 archetype: Saver · Spender · Investor · Protector · Builder · Visionary. Personality của anh/chị: ${pro.wealthMRI.personality} (${pro.wealthMRI.personalityLabel}) — sẽ ảnh hưởng cách anh/chị ra quyết định tiền bạc.`}
                    color={PURPLE}
                  />
                </div>
                <div className="space-y-2">
                  <LayerBar
                    label="Tầng 1 — Money Consciousness™"
                    sub="Nhận thức về tiền"
                    value={pro.wealthMRI.consciousness}
                  />
                  <LayerBar
                    label="Tầng 2 — Money Relationship™"
                    sub="Mối quan hệ với tiền"
                    value={pro.wealthMRI.relationship}
                  />
                  <LayerBar
                    label="Tầng 3 — Wealth Belief™"
                    sub="Hệ niềm tin tài chính"
                    value={pro.wealthMRI.belief}
                  />
                  <LayerBar
                    label="Tầng 4 — Money Personality™"
                    sub={pro.wealthMRI.personalityLabel}
                    customText={pro.wealthMRI.personality}
                  />
                  <LayerBar
                    label="Tầng 5 — Wealth Operating System™"
                    sub="Hệ điều hành tài chính"
                    value={pro.wealthMRI.wealthOS}
                  />
                </div>
              </TwoCol>
            </SubBlock>

            <AIInsightBox title="AI Insight" text={pro.wealthMRI.aiInsight} color={PURPLE} />
          </ReportSection>

          {/* ─── ENTREPRENEUR RISK MAP™ ─── */}
          <ReportSection
            label="Entrepreneur Risk Map™"
            icon={ListChecks}
            color={RED}
          >
            <div
              className="rounded-lg p-4 mb-3"
              style={{
                background: `linear-gradient(135deg, ${RED}08, transparent)`,
                border: `1px solid ${RED}55`,
              }}
            >
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 print:text-gray-700">
                    Risk Score™ (càng cao = càng an toàn)
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-5xl font-extrabold print:text-black"
                      style={{ color: pro.riskMap.riskScore >= 60 ? GREEN : pro.riskMap.riskScore >= 40 ? AMBER : RED }}
                    >
                      {pro.riskMap.riskScore}
                    </span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="inline-block px-3 py-1 rounded-full text-[12px] font-extrabold"
                    style={{
                      background: `${pro.riskMap.riskScore >= 60 ? GREEN : pro.riskMap.riskScore >= 40 ? AMBER : RED}22`,
                      color: pro.riskMap.riskScore >= 60 ? GREEN : pro.riskMap.riskScore >= 40 ? AMBER : RED,
                      border: `1px solid ${pro.riskMap.riskScore >= 60 ? GREEN : pro.riskMap.riskScore >= 40 ? AMBER : RED}77`,
                    }}
                  >
                    {pro.riskMap.level}
                  </div>
                </div>
              </div>
            </div>

            <SubBlock title="8 Nhóm Rủi Ro — Heatmap">
              <TwoCol>
                <div className="space-y-2">
                  <ExplainBox
                    title="Risk Map™ là gì?"
                    meaning="Đánh giá toàn diện 8 nhóm rủi ro có thể ảnh hưởng đến: thu nhập · tài sản · doanh nghiệp · gia đình · kế hoạch tự do tài chính. Mỗi nhóm chấm 0-100, càng cao càng RỦI RO."
                    color={RED}
                  />
                  <ExplainBox
                    title="Risk Score tổng"
                    formula="100 − avg(8 nhóm rủi ro)"
                    meaning="Đảo lại để dễ hiểu: Risk Score CAO = AN TOÀN. Critical (≤20) cần can thiệp tức thì. Strong (>80) duy trì kỷ luật."
                    color={RED}
                  />
                  <ExplainBox
                    title="3 chỉ số quan trọng nhất"
                    meaning="Emergency Risk (số tháng sống được nếu mất TN) · Protection Gap (khoảng trống bảo hiểm) · Freedom Ratio (passive ÷ expense). Khắc phục 3 chỉ số này thay đổi nhanh nhất Risk Score."
                    color={RED}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pro.riskMap.items.map((r) => (
                    <RiskCell key={r.key} label={r.label} score={r.score} note={r.note} />
                  ))}
                </div>
              </TwoCol>
            </SubBlock>

            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div
                className="rounded-lg p-3"
                style={{
                  background: `${RED}08`,
                  border: `1px solid ${RED}55`,
                }}
              >
                <div className="text-[10px] uppercase tracking-widest font-bold mb-1.5 print:text-black"
                  style={{ color: RED }}>
                  🔴 3 Rủi ro cao nhất
                </div>
                <ul className="space-y-1">
                  {pro.riskMap.topRisks.map((r, i) => (
                    <li key={i} className="text-[11.5px] text-gray-300 print:text-gray-800">
                      {i + 1}. {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-lg p-3"
                style={{
                  background: `${GREEN}08`,
                  border: `1px solid ${GREEN}55`,
                }}
              >
                <div className="text-[10px] uppercase tracking-widest font-bold mb-1.5 print:text-black"
                  style={{ color: GREEN }}>
                  🟢 3 Cơ hội lớn nhất
                </div>
                <ul className="space-y-1">
                  {pro.riskMap.topOpportunities.map((r, i) => (
                    <li key={i} className="text-[11.5px] text-gray-300 print:text-gray-800">
                      {i + 1}. {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <AIInsightBox
              title="AI Risk Analysis"
              text={pro.riskMap.aiAnalysis}
              color={RED}
            />
          </ReportSection>

          {/* ─── FINANCIAL FREEDOM ROADMAP™ ─── */}
          <ReportSection
            label="Financial Freedom Roadmap™"
            icon={Crown}
            color={GREEN}
          >
            <div
              className="rounded-lg p-4 mb-3"
              style={{
                background: `linear-gradient(135deg, ${GREEN}08, transparent)`,
                border: `1px solid ${GREEN}55`,
              }}
            >
              <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr] gap-3 items-center">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 print:text-gray-700">
                    Freedom Score™
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-5xl font-extrabold print:text-black"
                      style={{ color: GREEN }}
                    >
                      {pro.freedomRoadmap.freedomScore}
                    </span>
                    <span className="text-sm text-gray-500">/ 100</span>
                  </div>
                  <div
                    className="text-[13px] font-extrabold mt-1 print:text-black"
                    style={{ color: BRAND }}
                  >
                    {pro.freedomRoadmap.level}
                  </div>
                </div>
                <div
                  className="rounded-lg p-3 text-center"
                  style={{
                    background: "#0a0a0a",
                    border: `1px solid ${BRAND}55`,
                  }}
                >
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5 print:text-gray-700">
                    Time to Freedom
                  </div>
                  <div
                    className="text-xl font-extrabold print:text-black"
                    style={{ color: BRAND }}
                  >
                    {pro.freedomRoadmap.yearsToFreedom !== null
                      ? `${pro.freedomRoadmap.yearsToFreedom} năm`
                      : "— "}
                  </div>
                </div>
              </div>
            </div>

            <SubBlock title="Financial Freedom Number™ — quy tắc 4%">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KPI
                  label="Chi tiêu /tháng"
                  value={pro.freedomRoadmap.monthlyExpense}
                  color={RED}
                />
                <KPI
                  label="Chi tiêu /năm"
                  value={pro.freedomRoadmap.annualExpense}
                  color={AMBER}
                />
                <KPI
                  label="Freedom Number"
                  value={pro.freedomRoadmap.freedomNumber}
                  color={BRAND}
                />
                <KPI
                  label="Freedom Gap"
                  value={pro.freedomRoadmap.freedomGap}
                  color={pro.freedomRoadmap.freedomGap === 0 ? GREEN : RED}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                <KPI
                  label="TS đầu tư hiện có"
                  value={pro.freedomRoadmap.currentInvestAssets}
                  color={GREEN}
                />
                <KPI
                  label="Tiết kiệm /năm"
                  value={pro.freedomRoadmap.annualSavings}
                  color={BLUE}
                />
                <KPI
                  label="Số năm tới Freedom"
                  value={pro.freedomRoadmap.yearsToFreedom ?? 0}
                  color={pro.freedomRoadmap.yearsToFreedom === null ? RED : GREEN}
                  suffix=" năm"
                />
              </div>
            </SubBlock>

            <SubBlock title="6 Cấp Độ Tự Do Tài Chính — Yêu cầu & số tiền cần">
              <TwoCol>
                <div className="space-y-2">
                  <ExplainBox
                    title="Freedom Number™"
                    formula="Chi tiêu năm ÷ 4%"
                    meaning="Theo quy tắc 4% (Trinity Study): Nếu corpus đầu tư × 4%/năm ≥ chi tiêu năm, anh/chị có thể nghỉ làm full-time mà không hết tiền."
                    color={GREEN}
                  />
                  <ExplainBox
                    title="Freedom Gap™"
                    formula="Freedom Number − TS đầu tư hiện có"
                    meaning="Khoảng cách còn lại để đạt tự do tài chính. Càng thấp càng gần đích."
                    color={GREEN}
                  />
                  <ExplainBox
                    title="Time to Freedom™"
                    formula="Freedom Gap ÷ Tiết kiệm năm"
                    meaning="Số năm dự kiến đạt tự do TC theo tốc độ tích lũy hiện tại. Tăng thu nhập hoặc giảm chi → giảm số năm."
                    color={GREEN}
                  />
                </div>
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #232323",
                  }}
                >
                  {FREEDOM_LEVELS.map((lv, i) => {
                    const active = lv.name === pro.freedomRoadmap.level;
                    const target = computeStageTarget(i, pro.freedomRoadmap, insights);
                    return (
                      <StageRow
                        key={lv.name}
                        level={lv.name}
                        range={lv.range}
                        requirement={STAGE_REQUIREMENTS[i]}
                        amountLabel={target.label}
                        amount={target.value}
                        active={active}
                        color={GREEN}
                      />
                    );
                  })}
                </div>
              </TwoCol>
            </SubBlock>

            <AIInsightBox
              title="AI Roadmap Insight"
              text={pro.freedomRoadmap.aiInsight}
              color={GREEN}
            />
          </ReportSection>

          {/* ─── KẾ HOẠCH HƯU TRÍ AN NHÀN™ ─── */}
          <ReportSection
            label="Kế Hoạch Hưu Trí An Nhàn™"
            icon={Crown}
            color={AMBER}
          >
            {pro.retirementPlan.currentAge === null ||
            pro.retirementPlan.currentSalary === 0 ? (
              <NotDoneNote />
            ) : (
              <>
                {/* Top summary */}
                <div
                  className="rounded-lg p-4 mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${AMBER}10, ${BRAND}06)`,
                    border: `1px solid ${AMBER}55`,
                  }}
                >
                  <div className="grid sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 print:text-gray-700">
                        Tuổi nghỉ hưu
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold print:text-black"
                        style={{ color: AMBER }}
                      >
                        {pro.retirementPlan.retirementAge}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 print:text-gray-700">
                        Năm {pro.retirementPlan.retirementYear} ·{" "}
                        {pro.retirementPlan.gender === "male"
                          ? "Nam (theo luật)"
                          : pro.retirementPlan.gender === "female"
                            ? "Nữ (theo luật)"
                            : "Mặc định 60"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 print:text-gray-700">
                        Còn lại
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold print:text-black"
                        style={{ color: BLUE }}
                      >
                        {pro.retirementPlan.yearsToRetirement}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 print:text-gray-700">
                        năm tới hưu (tuổi {pro.retirementPlan.currentAge})
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 print:text-gray-700">
                        Sống hưu
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold print:text-black"
                        style={{ color: PURPLE }}
                      >
                        {pro.retirementPlan.yearsInRetirement}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 print:text-gray-700">
                        năm (đến 85 tuổi)
                      </div>
                    </div>
                  </div>
                </div>

                <SubBlock title="Công thức tính & kết quả">
                  <TwoCol>
                    <div className="space-y-2">
                      <ExplainBox
                        title="Tuổi nghỉ hưu (luật VN)"
                        meaning={`Nam: 62 tuổi · Nữ: 60 tuổi. ${pro.retirementPlan.gender === "male" ? "Anh là Nam → nghỉ hưu năm 62 tuổi." : pro.retirementPlan.gender === "female" ? "Chị là Nữ → nghỉ hưu năm 60 tuổi." : "Chưa nhập giới tính — dùng 60 tuổi mặc định."}`}
                        color={AMBER}
                      />
                      <ExplainBox
                        title="Chi tiêu lúc hưu"
                        formula="Chi hiện tại × (1 + 5%)^số năm"
                        meaning={`Với lạm phát 5%/năm, chi tiêu tăng từ ${fmtCompact(pro.retirementPlan.currentMonthlyExpense)}/tháng (hiện tại) → ${fmtCompact(pro.retirementPlan.futureMonthlyExpense)}/tháng (lúc hưu).`}
                        color={RED}
                      />
                      <ExplainBox
                        title="Lương hưu BHXH"
                        formula="75% × lương chủ động (đã lạm phát)"
                        meaning={`Lương hưu thường = 75% lương trước hưu. Với lương ${fmtCompact(pro.retirementPlan.currentSalary)}/tháng hiện tại → lương hưu ≈ ${fmtCompact(pro.retirementPlan.futurePensionMonthly)}/tháng lúc hưu (theo lạm phát).`}
                        color={GREEN}
                      />
                      <ExplainBox
                        title="Tài sản cần để an nhàn"
                        formula="(Chi năm − Lương hưu năm) ÷ 4%"
                        meaning={`Quy tắc 4%: tài sản × 4% rút mỗi năm để bù phần lương hưu không đủ chi tiêu. Anh/chị cần ${fmtCompact(pro.retirementPlan.requiredCorpus)} tài sản đầu tư lúc nghỉ hưu.`}
                        color={BRAND}
                      />
                      <ExplainBox
                        title="Cần tiết kiệm /tháng"
                        formula="PMT để đạt corpus với lãi 8%/năm"
                        meaning={`Với TS hiện có ${fmtCompact(pro.retirementPlan.currentRetirementSavings)} (${pro.retirementPlan.achievementPct}% target) và còn ${pro.retirementPlan.yearsToRetirement} năm tới hưu, anh/chị cần đóng đều đặn ${fmtCompact(pro.retirementPlan.requiredMonthlyContribution)}/tháng vào danh mục có lãi 8%/năm.`}
                        color={PURPLE}
                      />
                    </div>

                    <div
                      className="rounded-lg overflow-hidden"
                      style={{
                        background: "#0a0a0a",
                        border: "1px solid #232323",
                      }}
                    >
                      <RetirementRow
                        label="Chi tiêu /tháng hiện tại"
                        value={pro.retirementPlan.currentMonthlyExpense}
                        color={GREEN}
                      />
                      <RetirementRow
                        label="Chi tiêu /tháng lúc hưu"
                        value={pro.retirementPlan.futureMonthlyExpense}
                        color={RED}
                        sub={`× (1 + ${pro.retirementPlan.inflationPct}%)^${pro.retirementPlan.yearsToRetirement}`}
                      />
                      <RetirementRow
                        label="Chi tiêu /năm lúc hưu"
                        value={pro.retirementPlan.futureAnnualExpense}
                        color={RED}
                      />
                      <RetirementRow
                        label="Lương /tháng hiện tại"
                        value={pro.retirementPlan.currentSalary}
                        color={BLUE}
                      />
                      <RetirementRow
                        label="Lương hưu /tháng (75%)"
                        value={pro.retirementPlan.futurePensionMonthly}
                        color={GREEN}
                        sub={`${pro.retirementPlan.pensionPct}% × lương lạm phát`}
                      />
                      <RetirementRow
                        label="Lương hưu /năm"
                        value={pro.retirementPlan.futurePensionAnnual}
                        color={GREEN}
                      />
                      <RetirementRow
                        label="Thiếu hụt /năm"
                        value={pro.retirementPlan.annualShortfall}
                        color={
                          pro.retirementPlan.annualShortfall === 0 ? GREEN : AMBER
                        }
                        sub="chi năm − lương hưu năm"
                      />
                      <RetirementRow
                        label="🎯 Tài sản cần có"
                        value={pro.retirementPlan.requiredCorpus}
                        color={BRAND}
                        sub="thiếu hụt ÷ 4%"
                        bold
                      />
                      <RetirementRow
                        label="TS đầu tư hiện có"
                        value={pro.retirementPlan.currentRetirementSavings}
                        color={GREEN}
                        sub={`${pro.retirementPlan.achievementPct}% target`}
                      />
                      <RetirementRow
                        label="💎 Cần đóng /tháng"
                        value={pro.retirementPlan.requiredMonthlyContribution}
                        color={PURPLE}
                        sub={`lãi ${pro.retirementPlan.expectedReturnPct}%/năm`}
                        bold
                      />
                    </div>
                  </TwoCol>
                </SubBlock>

                <AIInsightBox
                  title="🧓 AI Retirement Insight"
                  text={pro.retirementPlan.aiInsight}
                  color={AMBER}
                />
              </>
            )}
          </ReportSection>

          {/* ─── FINANCIAL PRESCRIPTION™ ─── */}
          <ReportSection
            label="Financial Prescription™"
            icon={ListChecks}
            color={BRAND}
          >
            <AIInsightBox
              title="🩺 AI Financial Diagnosis"
              text={pro.prescription.aiDiagnosis}
              color={BRAND}
            />

            <SubBlock title="Đơn thuốc ưu tiên">
              <div className="space-y-3">
                {pro.prescription.prescriptions.map((p, i) => {
                  const c = p.level === "Khẩn cấp" ? RED : p.level === "Quan trọng" ? AMBER : BLUE;
                  const icon = p.level === "Khẩn cấp" ? "💊" : p.level === "Quan trọng" ? "💉" : "🌱";
                  return (
                    <div
                      key={i}
                      className="rounded-lg p-3 grid sm:grid-cols-[80px_1fr] gap-3"
                      style={{
                        background: `${c}08`,
                        border: `1px solid ${c}55`,
                      }}
                    >
                      <div
                        className="rounded-lg flex flex-col items-center justify-center p-3"
                        style={{
                          background: `${c}14`,
                          border: `1px dashed ${c}77`,
                        }}
                      >
                        <span className="text-3xl mb-1">{icon}</span>
                        <span
                          className="text-[9px] font-extrabold uppercase tracking-wider text-center print:text-black"
                          style={{ color: c }}
                        >
                          #{i + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="text-[9.5px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider"
                            style={{ background: `${c}22`, color: c }}
                          >
                            {p.level}
                          </span>
                        </div>
                        <div className="text-[12.5px] font-extrabold text-white print:text-black mb-2">
                          ⚠ {p.problem}
                        </div>
                        <ul className="space-y-1 mb-2">
                          {p.actions.map((a, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-1.5 text-[11.5px] text-gray-300 print:text-gray-800 leading-snug"
                            >
                              <CheckCircle2 size={11} className="shrink-0 mt-0.5" style={{ color: c }} />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                        <div
                          className="text-[10.5px] italic print:text-gray-700"
                          style={{ color: c }}
                        >
                          ✓ Kết quả mong đợi: {p.expectedResult}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SubBlock>

            <SubBlock title="Top 5 ưu tiên 12 tháng tới">
              <ul className="space-y-1.5">
                {pro.prescription.topPriorities.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[12px] text-gray-200 print:text-gray-800"
                  >
                    <span
                      className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-extrabold"
                      style={{
                        background: `${BRAND}22`,
                        color: BRAND,
                      }}
                    >
                      #{i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </SubBlock>

            <SubBlock title="Chỉ số cần cải thiện trong 12 tháng">
              <div className="space-y-2">
                {pro.prescription.improvementTargets.map((t, i) => {
                  const pct = Math.min(100, t.current);
                  const targetPct = Math.min(100, t.target);
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_auto] gap-3 items-center"
                    >
                      <div>
                        <div className="text-[11.5px] font-bold text-gray-300 print:text-gray-800 mb-1">
                          {t.label}
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden relative"
                          style={{ background: "#1a1a1a" }}
                        >
                          <div
                            className="absolute top-0 bottom-0 w-px"
                            style={{ left: `${targetPct}%`, background: GREEN, opacity: 0.7 }}
                          />
                          <div
                            className="h-full"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${BRAND}, ${BRAND}cc)`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-[11px] font-extrabold whitespace-nowrap text-right print:text-black">
                        <span style={{ color: BRAND }}>
                          {Math.round(t.current)}
                          {t.suffix ?? ""}
                        </span>
                        <span className="text-gray-500"> → </span>
                        <span style={{ color: GREEN }}>
                          {Math.round(t.target)}
                          {t.suffix ?? ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SubBlock>

            <BigProCTA />

            <div
              className="rounded-md p-3 mt-3 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed #2a2a2a",
              }}
            >
              <p className="text-[10.5px] italic text-gray-400 print:text-gray-700 leading-relaxed">
                <strong className="text-white print:text-black">Chẩn đoán</strong>{" "}
                chỉ cho bạn biết vấn đề. <strong className="text-white print:text-black">Bản đồ</strong>{" "}
                chỉ cho bạn biết con đường. Nhưng chỉ khi{" "}
                <strong className="text-white print:text-black">hành động</strong>,
                cuộc đời tài chính của bạn mới thay đổi.
              </p>
            </div>
          </ReportSection>

          {/* Footer */}
          <div
            className="p-6 text-center text-[10.5px] text-gray-500 print:text-gray-600"
            style={{ borderTop: "1px solid #232323" }}
          >
            Báo cáo được tạo tự động bởi Entrepreneur Financial Blueprint™ —{" "}
            <strong className="text-white print:text-black">VINEN</strong>
            . Toàn bộ dữ liệu được lưu mã hoá trên cloud + chỉ chủ tài khoản có
            quyền truy cập.
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 16mm 14mm;
          }
          body {
            background: white !important;
          }
          #report-sheet {
            background: white !important;
            color: black !important;
            border: none !important;
            box-shadow: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─── Helpers ─── */

function genderLabel(g?: string) {
  return g === "male"
    ? "Nam"
    : g === "female"
      ? "Nữ"
      : g === "other"
        ? "Khác"
        : undefined;
}
function maritalLabel(m?: string) {
  return m === "single"
    ? "Độc thân"
    : m === "married"
      ? "Đã kết hôn"
      : m === "divorced"
        ? "Đã ly hôn"
        : m === "widowed"
          ? "Goá"
          : undefined;
}
function incomeSourceLabel(s?: string) {
  return s === "business"
    ? "Kinh doanh"
    : s === "salary"
      ? "Lương"
      : s === "investment"
        ? "Đầu tư"
        : s === "other"
          ? "Khác"
          : undefined;
}
function incomeSourcesLabel(p: {
  primaryIncomeSources?: string[];
  primaryIncomeSource?: string;
}) {
  const list =
    p.primaryIncomeSources && p.primaryIncomeSources.length > 0
      ? p.primaryIncomeSources
      : p.primaryIncomeSource
        ? [p.primaryIncomeSource]
        : [];
  if (list.length === 0) return undefined;
  return list.map((s) => incomeSourceLabel(s) ?? s).join(" · ");
}

function fmtCompact(n: number): string {
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9)
    return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}

/* ─── Layout components ─── */

function ReportSection({
  label,
  icon: Icon,
  color,
  children,
}: {
  label: string;
  icon: typeof Crown;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="p-6 print:p-5 border-b border-[#232323] print:border-gray-300 last:border-0 print:break-inside-avoid"
      style={{
        breakInside: "avoid",
      }}
    >
      <div className="flex items-center gap-2 mb-4 print:mb-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${color}1a`, color }}
        >
          <Icon size={14} />
        </div>
        <h2
          className="text-base font-extrabold uppercase tracking-wider print:text-black"
          style={{ color }}
        >
          {label}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SubBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 print:text-gray-700">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 items-baseline py-1 border-b border-[#1f1f1f] print:border-gray-200 last:border-0">
      <span className="text-[11px] text-gray-500 uppercase tracking-wider font-bold print:text-gray-700">
        {label}
      </span>
      <span
        className="text-[12.5px] font-bold print:text-black"
        style={{ color: value ? "#ffffff" : "#555" }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function ScoreBox({
  label,
  value,
  max,
  color,
  hint,
  wide,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div
      className="rounded-lg p-3 text-center"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}55`,
      }}
    >
      <div className="text-[9.5px] uppercase tracking-wider text-gray-400 font-bold mb-0.5 print:text-gray-700">
        {label}
      </div>
      <div
        className={`font-extrabold ${wide ? "text-3xl" : "text-2xl"} print:text-black`}
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5 print:text-gray-600">
        / {max}
      </div>
      {hint && (
        <div className="text-[10px] text-gray-500 mt-1.5 leading-snug print:text-gray-600">
          {hint}
        </div>
      )}
    </div>
  );
}

function KPI({
  label,
  value,
  color,
  suffix,
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}33`,
      }}
    >
      <div className="text-[9.5px] uppercase tracking-wider text-gray-500 font-bold mb-0.5 print:text-gray-700">
        {label}
      </div>
      <div
        className="text-base font-extrabold leading-tight print:text-black"
        style={{ color }}
      >
        {suffix === "%" ? `${value}${suffix}` : fmtCompact(value)}
      </div>
    </div>
  );
}

function NotDoneNote() {
  return (
    <div
      className="rounded-md px-3 py-2 text-[11px] text-gray-500 print:text-gray-700"
      style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed #2a2a2a" }}
    >
      Chưa hoàn thành — học viên cần trả lời đủ tất cả câu hỏi để có điểm
      tổng kết.
    </div>
  );
}

function StatusRow({
  achieved,
  achievedText,
  missingText,
}: {
  achieved: boolean;
  achievedText: string;
  missingText: string;
}) {
  const color = achieved ? "#22c55e" : "#f59e0b";
  return (
    <div
      className="mt-3 px-3 py-2 rounded-md text-[10.5px] leading-snug flex items-start gap-2 print:text-gray-800"
      style={{
        background: `${color}10`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {achieved ? (
        <CheckCircle2 size={12} className="shrink-0 mt-0.5" />
      ) : (
        <Circle size={12} className="shrink-0 mt-0.5" />
      )}
      <span>{achieved ? achievedText : missingText}</span>
    </div>
  );
}

const FREEDOM_LEVELS = [
  { name: "Financial Survival", range: "0-20", short: "Sống sót tài chính" },
  { name: "Financial Stability", range: "21-40", short: "Ổn định tài chính" },
  { name: "Financial Security", range: "41-60", short: "An toàn tài chính" },
  { name: "Financial Independence", range: "61-80", short: "Độc lập tài chính" },
  { name: "Financial Freedom", range: "81-100", short: "Tự do tài chính" },
  { name: "Financial Legacy", range: "100+", short: "Di sản tài chính" },
];

const STAGE_REQUIREMENTS = [
  "Thu nhập > chi tiêu · không tạo nợ xấu mới",
  "Có quỹ dự phòng 6 tháng chi thiết yếu · tách dòng tiền CN ↔ DN",
  "TS thanh khoản ≥ 120 tháng thu nhập + có BH nhân thọ & sức khoẻ",
  "Thu nhập thụ động ≥ chi tiêu hàng tháng (PP1) hoặc TS × 4% ≥ chi năm (PP2)",
  "Corpus đầu tư ≥ Freedom Number — tiền làm việc cho mình",
  "Tài sản dư ≥ 2× Freedom Number · có kế hoạch chuyển giao + di sản xã hội",
];

function computeStageTarget(
  stage: number,
  roadmap: FreedomRoadmapReport,
  ins: BlueprintInsights
): { label: string; value: number | string } {
  const monthlyExp = roadmap.monthlyExpense;
  const annualExp = roadmap.annualExpense;
  const monthlyInc = ins.jars.totalIncome;
  switch (stage) {
    case 0: // Survival
      return {
        label: "Mục tiêu",
        value: monthlyInc > monthlyExp ? "✓ Đã đạt" : "TN > Chi",
      };
    case 1: // Stability
      return { label: "Quỹ DP 6 tháng", value: monthlyExp * 6 };
    case 2: // Security
      return { label: "TS ≥ 120 tháng TN", value: monthlyInc * 120 };
    case 3: // Independence
      return { label: "Passive ≥ chi", value: monthlyExp };
    case 4: // Freedom
      return { label: "Corpus Freedom", value: roadmap.freedomNumber };
    case 5: // Legacy
      return { label: "2× Freedom #", value: roadmap.freedomNumber * 2 };
    default:
      return { label: "—", value: 0 };
  }
}

/* ─── 2-column layout (explain | result) ─── */
function TwoCol({
  children,
}: {
  children: [React.ReactNode, React.ReactNode];
}) {
  return (
    <div className="grid sm:grid-cols-[1fr_1.2fr] gap-3 sm:gap-4 print:grid-cols-[1fr_1.2fr]">
      <div className="space-y-2">{children[0]}</div>
      <div className="space-y-2">{children[1]}</div>
    </div>
  );
}

function ExplainBox({
  title,
  formula,
  meaning,
  color,
}: {
  title: string;
  formula?: string;
  meaning: string;
  color: string;
}) {
  return (
    <div
      className="rounded-md p-3"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}33`,
      }}
    >
      <div
        className="text-[10px] uppercase tracking-widest font-bold mb-1 print:text-black"
        style={{ color }}
      >
        📘 {title}
      </div>
      {formula && (
        <div
          className="font-mono text-[11px] my-1.5 px-2 py-1 rounded print:text-black"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid #2a2a2a",
            color,
          }}
        >
          {formula}
        </div>
      )}
      <p className="text-[11px] text-gray-300 leading-relaxed print:text-gray-800">
        {meaning}
      </p>
    </div>
  );
}

/* ─── Stage requirement row ─── */
function StageRow({
  level,
  range,
  requirement,
  amountLabel,
  amount,
  active,
  color,
}: {
  level: string;
  range: string;
  requirement: string;
  amountLabel: string;
  amount: number | string;
  active: boolean;
  color: string;
}) {
  return (
    <div
      className="grid grid-cols-[80px_1fr_auto] gap-3 items-center py-2 border-b border-[#1f1f1f] print:border-gray-200 last:border-0"
      style={{ background: active ? `${color}06` : "transparent" }}
    >
      <div>
        <div
          className="text-[10px] font-bold uppercase tracking-wider print:text-black"
          style={{ color: active ? color : "#888" }}
        >
          {range} {active && "📍"}
        </div>
        <div
          className="text-[12px] font-extrabold mt-0.5 print:text-black"
          style={{ color: active ? "white" : "#aaa" }}
        >
          {level}
        </div>
      </div>
      <div className="text-[11.5px] text-gray-300 leading-snug print:text-gray-800">
        {requirement}
      </div>
      <div className="text-right">
        <div
          className="text-[10px] text-gray-500 uppercase tracking-wider font-bold print:text-gray-700"
        >
          {amountLabel}
        </div>
        <div
          className="text-[13px] font-extrabold print:text-black"
          style={{ color: active ? color : BRAND }}
        >
          {typeof amount === "number" ? fmtCompact(amount) : amount}
        </div>
      </div>
    </div>
  );
}

/* ─── Big Pro CTA ─── */
function BigProCTA() {
  return (
    <div
      className="rounded-2xl p-5 sm:p-6 mt-4"
      style={{
        background: `linear-gradient(135deg, #3B82F610, #2563EB20, #a855f710)`,
        border: `2px solid #2563EB77`,
        boxShadow: `0 12px 36px #2563EB33`,
      }}
    >
      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2"
            style={{
              background: "#2563EB22",
              color: "#3B82F6",
              border: "1px solid #2563EB77",
            }}
          >
            💎 Khuyến nghị chuyên gia
          </div>
          <h3
            className="text-lg sm:text-xl font-extrabold leading-tight mb-2 print:text-black"
            style={{ color: "#3B82F6" }}
          >
            Nâng cấp lên Founder Financial OS™ PRO
          </h3>
          <p className="text-[12.5px] text-gray-300 leading-relaxed print:text-gray-800">
            Triển khai toàn bộ Financial Prescription™ theo lộ trình{" "}
            <strong className="text-white print:text-black">28 ngày</strong> có
            hướng dẫn. Chuyển <strong className="text-white print:text-black">
              insights → hành động cụ thể
            </strong>{" "}
            với coaching 1-1 cùng VINEN.
          </p>
          <ul className="grid sm:grid-cols-2 gap-1.5 mt-3">
            {[
              "Lộ trình 28 ngày chuyên sâu",
              "Coaching 1-1 với chuyên gia",
              "Dashboard Founder Financial OS",
              "Community Pro + Live Q&A",
            ].map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11.5px] text-gray-300 print:text-gray-800"
              >
                <CheckCircle2
                  size={12}
                  className="shrink-0 mt-0.5"
                  style={{ color: "#3B82F6" }}
                />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/giai-phap-toan-dien#pricing"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold transition-transform hover:scale-[1.03] whitespace-nowrap print:hidden"
          style={{
            background: `linear-gradient(135deg, #3B82F6, #2563EB)`,
            color: "#0a0a0a",
            boxShadow: `0 10px 30px #2563EB66`,
          }}
        >
          Nâng cấp ngay
          <Crown size={16} />
        </Link>
      </div>
    </div>
  );
}

function LayerBar({
  label,
  sub,
  value,
  customText,
}: {
  label: string;
  sub: string;
  value?: number;
  customText?: string;
}) {
  const v = value ?? 0;
  const c =
    customText !== undefined
      ? "#2563EB"
      : v >= 70
        ? "#22c55e"
        : v >= 40
          ? "#f59e0b"
          : "#ef4444";
  return (
    <div
      className="rounded-md p-2.5"
      style={{
        background: "#0a0a0a",
        border: `1px solid ${c}33`,
      }}
    >
      <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
        <div>
          <div className="text-[11.5px] font-extrabold text-white print:text-black leading-tight">
            {label}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5 print:text-gray-700">
            {sub}
          </div>
        </div>
        <div className="text-right">
          {customText ? (
            <div
              className="text-base font-extrabold print:text-black"
              style={{ color: c }}
            >
              {customText}
            </div>
          ) : (
            <div
              className="text-xl font-extrabold print:text-black"
              style={{ color: c }}
            >
              {v}
              <span className="text-[10px] text-gray-500">/100</span>
            </div>
          )}
        </div>
      </div>
      {value !== undefined && (
        <div
          className="h-1.5 rounded-full overflow-hidden mt-2"
          style={{ background: "#1a1a1a" }}
        >
          <div
            className="h-full"
            style={{
              width: `${value}%`,
              background: `linear-gradient(90deg, ${c}, ${c}cc)`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function RiskCell({
  label,
  score,
  note,
}: {
  label: string;
  score: number;
  note: string;
}) {
  // Risk score càng CAO = càng RỦI RO → màu càng đỏ
  const c = score >= 60 ? "#ef4444" : score >= 30 ? "#f59e0b" : "#22c55e";
  return (
    <div
      className="rounded-lg p-2.5"
      style={{
        background: `${c}10`,
        border: `1px solid ${c}55`,
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-wider mb-1 print:text-black"
        style={{ color: c }}
      >
        {label}
      </div>
      <div
        className="text-xl font-extrabold print:text-black"
        style={{ color: c }}
      >
        {score}
        <span className="text-[10px] text-gray-500">/100</span>
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5 print:text-gray-700">
        {note}
      </div>
    </div>
  );
}

function AIInsightBox({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div
      className="rounded-lg p-3 mt-3"
      style={{
        background: `${color}06`,
        border: `1px solid ${color}55`,
      }}
    >
      <div
        className="text-[10px] uppercase tracking-widest font-bold mb-1.5 print:text-black"
        style={{ color }}
      >
        💡 {title}
      </div>
      <p className="text-[11.5px] text-gray-200 leading-relaxed print:text-gray-800">
        {text}
      </p>
    </div>
  );
}

function RetirementRow({
  label,
  value,
  color,
  sub,
  bold,
}: {
  label: string;
  value: number;
  color: string;
  sub?: string;
  bold?: boolean;
}) {
  return (
    <div
      className="grid grid-cols-[1fr_auto] gap-3 items-center px-3 py-2 border-b border-[#1f1f1f] print:border-gray-200 last:border-0"
      style={{
        background: bold ? `${color}08` : "transparent",
      }}
    >
      <div>
        <div
          className={`leading-tight print:text-black ${bold ? "text-[12.5px] font-extrabold" : "text-[11.5px] font-bold"}`}
          style={{ color: bold ? color : "white" }}
        >
          {label}
        </div>
        {sub && (
          <div className="text-[10px] text-gray-500 mt-0.5 font-mono print:text-gray-700">
            {sub}
          </div>
        )}
      </div>
      <div
        className={`font-extrabold text-right whitespace-nowrap print:text-black ${bold ? "text-[15px]" : "text-[13px]"}`}
        style={{ color }}
      >
        {fmtCompact(value)}
      </div>
    </div>
  );
}

function BadgeYesNo({ ok, label }: { ok: boolean; label: string }) {
  const c = ok ? "#22c55e" : "#ef4444";
  return (
    <div
      className="flex items-center gap-1.5 text-[10.5px] print:text-gray-800"
      style={{ color: c }}
    >
      {ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      <span className="font-bold">{label}</span>
    </div>
  );
}
