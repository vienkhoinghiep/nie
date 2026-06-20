"use client";

import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  AlertOctagon,
  Banknote,
  Building2,
  Unlink,
  HeartPulse,
  ShieldCheck,
  Hourglass,
  Bird,
  Brain,
  Shield,
  Sparkles,
  Sprout,
  Stethoscope,
  Target,
} from "lucide-react";
import type {
  BlueprintData,
  BlueprintProgress,
  CashflowData,
} from "@/lib/blueprint/types";
import {
  MINDSET_CATEGORIES,
  mindsetLevel,
  scoreMindset,
} from "@/lib/blueprint/data/mindset-questions";
import {
  loveOfMoneyTier,
  LOVE_OF_MONEY_QUESTIONS,
  scoreLoveOfMoney,
} from "@/lib/blueprint/data/love-of-money-questions";
import {
  avgBeliefTheme,
  BELIEF_QUESTIONS,
  BELIEF_THEMES,
  beliefsAverage,
  beliefsStrongCount,
  beliefsTier,
  topLimitingBeliefs,
} from "@/lib/blueprint/data/beliefs-questions";
import { buildBlueprintProReports } from "@/lib/blueprint/pro-reports";
import { buildBlueprintInsights } from "@/lib/blueprint/insights";
import {
  computeIncomeAnalysis,
  type IncomeAnalysisResult,
  type IncomeCriterion,
} from "@/lib/blueprint/income-analysis";
import {
  computeNetWorthAnalysis,
  type NetWorthAnalysisResult,
  type GroupBreakdown,
  type DebtQualityCategory,
} from "@/lib/blueprint/networth-analysis";
import {
  CREAM,
  CREAM_LIGHT,
  DANGER,
  GOLD,
  GOLD_DARK,
  GOLD_LIGHT,
  KPICard,
  NAVY,
  NAVY_DARK,
  NAVY_LIGHT,
  ProgressBar,
  RadarChart,
  ScoreCircle,
  SUCCESS,
  TEXT_BODY,
  TEXT_DARK,
  TEXT_MUTED,
  WARNING,
} from "./charts";

interface Props {
  data: BlueprintData;
  progress: BlueprintProgress;
  userEmail: string;
  updatedAt: string | null;
}

const SERIF = "'Playfair Display', 'Georgia', serif";

export default function PremiumReport({
  data,
  userEmail,
  updatedAt,
}: Props) {
  const profile = data.profile ?? {};
  const mindset = data.mindset ?? {};

  // ─── Computations ───
  const pro = buildBlueprintProReports(data);
  const ins = buildBlueprintInsights(data);
  const archetypeAnswers = mindset.archetypeAnswers ?? {};
  const loveAnswers = mindset.loveOfMoneyAnswers ?? {};
  const beliefsAnswers = mindset.beliefsAnswers ?? {};
  // Show partial results when at least 1 câu đã trả lời — full gating chỉ
  // dùng cho các trang chi tiết nếu cần. Counts để hiển thị progress.
  const archetypeCount = Object.keys(archetypeAnswers).length;
  const loveCount = Object.keys(loveAnswers).length;
  const beliefsCount = Object.keys(beliefsAnswers).length;
  const archetypeDone = archetypeCount > 0;
  const loveDone = loveCount > 0;
  const beliefsDone = beliefsCount > 0;
  const archetypeFull = archetypeCount === 35;
  const loveFull = loveCount === LOVE_OF_MONEY_QUESTIONS.length;
  const beliefsFull = beliefsCount === BELIEF_QUESTIONS.length;

  const archetypeScores = scoreMindset(archetypeAnswers);
  const loveScore = scoreLoveOfMoney(loveAnswers);
  const loveTier = loveOfMoneyTier(loveScore);
  const beliefAvg = beliefsAverage(beliefsAnswers);
  const beliefStrong = beliefsStrongCount(beliefsAnswers);
  const beliefTier = beliefsTier(beliefAvg);
  const topBeliefs = topLimitingBeliefs(beliefsAnswers, 3);

  // Top + bottom archetype groups
  let topIdx = 0;
  let botIdx = 0;
  for (let i = 1; i < archetypeScores.length; i++) {
    if (archetypeScores[i] > archetypeScores[topIdx]) topIdx = i;
    if (archetypeScores[i] < archetypeScores[botIdx]) botIdx = i;
  }
  const topCat = MINDSET_CATEGORIES[topIdx];
  const botCat = MINDSET_CATEGORIES[botIdx];

  // Top theme of beliefs (limiting + highest avg)
  const limitingThemes = BELIEF_THEMES.filter((t) => t.isLimiting);
  let heaviestTheme = limitingThemes[0];
  let heaviestAvg = 0;
  for (const t of limitingThemes) {
    const a = avgBeliefTheme(t, beliefsAnswers);
    if (a > heaviestAvg) {
      heaviestAvg = a;
      heaviestTheme = t;
    }
  }

  const reportDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : reportDate;

  return (
    <div
      style={{
        background: CREAM,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: TEXT_DARK,
      }}
    >
      {/* ─── Toolbar ─── */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: "rgba(30, 58, 95, 0.96)",
          backdropFilter: "blur(8px)",
          borderBottom: `2px solid ${GOLD}`,
        }}
      >
        <div className="max-w-[1080px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/tools/entrepreneur-financial-blueprint"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Quay lại Blueprint
          </Link>
          <div className="text-[11px] text-white/60 font-bold uppercase tracking-widest">
            Báo cáo Premium · 5 Phần
          </div>
        </div>
      </div>

      {/* ─── Pages ─── */}
      <main style={{ padding: "clamp(16px, 3vw, 32px) 16px clamp(40px, 6vw, 80px)" }}>
        {/* PAGE 1 — COVER */}
        <CoverPage
          fullName={profile.fullName || userEmail || "Học viên"}
          birthDate={profile.birthDate}
          coach="Your Coach"
          date={updatedStr}
          score={pro.wealthMRI.wealthScore}
          tier={pro.wealthMRI.tier}
        />

        {/* PAGE 2 — ✦ PHẦN I — ENTREPRENEUR WEALTH MRI™ DIVIDER ─── */}
        <PartDivider
          numeral="I"
          partLabel="Phần I"
          title="Entrepreneur Wealth MRI™"
          subtitle="Soi chiếu sâu vào tâm thức tiền bạc của anh/chị — gốc rễ của mọi hành vi tài chính và quyết định thịnh vượng."
          modules={[
            "Bức tranh tính cách về tiền bạc — 7 khuynh hướng tự nhiên",
            "Chỉ số yêu tiền & tải trọng niềm tin giới hạn",
            "5 tầng nhận thức tài chính từ ý thức đến hệ điều hành",
          ]}
        />

        {/* PAGE 3 — TAM GIÁC TÂM THỨC (3 trụ cột) */}
        <ReportPage>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 24,
              fontWeight: 900,
              color: NAVY,
              margin: "0 0 14px",
              lineHeight: 1.25,
              letterSpacing: 0.2,
              textAlign: "left",
            }}
          >
            Khung Đánh Giá Tâm Thức Tiền Bạc: 3 Trụ Cột Hình Thành Hành Vi Tài Chính
          </h2>
          <p
            style={{
              fontSize: 13,
              color: TEXT_BODY,
              lineHeight: 1.7,
              margin: "0 0 8px",
              maxWidth: 920,
            }}
          >
            Hành vi tài chính không hề ngẫu nhiên mà bắt nguồn sâu thẳm từ tâm
            thức. Thông qua việc đánh giá ba trụ cột cốt lõi —{" "}
            <strong style={{ color: NAVY }}>Tính cách</strong>,{" "}
            <strong style={{ color: NAVY }}>Cảm xúc</strong> và{" "}
            <strong style={{ color: NAVY }}>Niềm tin</strong> — chúng ta có thể
            giải mã được thế giới nội tâm để điều chỉnh hành vi tài chính bên
            ngoài.
          </p>

          <MindsetTriangle
            wealthScore={pro.wealthMRI.wealthScore}
            tier={pro.wealthMRI.tier}
          />
        </ReportPage>

        {/* PAGE 3 — TRỤ CỘT 1: RADAR */}
        <ReportPage>
          <PageHeader title="Trụ cột 1: Bức Tranh Tính Cách Tiền Bạc" />
          {!archetypeFull && archetypeDone && (
            <PartialProgressNote
              count={archetypeCount}
              total={35}
              label="Test Tâm Thức"
            />
          )}
          {archetypeDone ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "center" }}>
              <RadarChart
                scores={archetypeScores}
                labels={MINDSET_CATEGORIES.map((c) => c.name)}
                max={15}
                size={420}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <HighlightBox
                  icon="●"
                  iconColor={SUCCESS}
                  badge="Nhóm Chủ Đạo - Điểm Cao Nhất"
                  badgeColor={SUCCESS}
                  title={`${topCat.name} (Điểm: ${archetypeScores[topIdx]}/15)`}
                  body={topCat.highMeaning}
                />
                <HighlightBox
                  icon="●"
                  iconColor={DANGER}
                  badge="Nhóm Còn Yếu - Cơ Hội Phát Triển"
                  badgeColor={DANGER}
                  title={`${botCat.name} (Điểm: ${archetypeScores[botIdx]}/15)`}
                  body={botCat.caution}
                />
              </div>
            </div>
          ) : (
            <NotCompletedNote message="Học viên chưa trả lời câu nào trong 35 câu Test Tâm Thức. Quay lại Blueprint Phần II để hoàn thành." />
          )}

          {/* Full 7 groups table */}
          {archetypeDone && (
            <div style={{ marginTop: 32 }}>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: 16,
                  color: NAVY,
                  marginBottom: 12,
                }}
              >
                Bảng tổng hợp 7 nhóm khuynh hướng
              </h3>
              <div style={{ display: "grid", gap: 6 }}>
                {archetypeScores.map((s, i) => {
                  const cat = MINDSET_CATEGORIES[i];
                  const lv = mindsetLevel(s);
                  const c = lv === "Cao" ? SUCCESS : lv === "Trung bình" ? GOLD_DARK : TEXT_MUTED;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 200px 80px",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 12px",
                        background: i === topIdx ? `${SUCCESS}10` : i === botIdx ? `${DANGER}10` : CREAM_LIGHT,
                        borderRadius: 4,
                        border: `1px solid ${c}33`,
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: NAVY }}>
                        {cat.index}. {cat.name}
                        {cat.alias && (
                          <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
                            {" "}({cat.alias})
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 4,
                          background: "#e6dfc9",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${(s / 15) * 100}%`,
                            background: c,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: 13,
                          fontWeight: 800,
                          color: c,
                        }}
                      >
                        {s}/15 · {lv}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ReportPage>

        {/* PAGE 4 — TRỤ CỘT 2 & 3: GAUGE + NIỀM TIN */}
        <ReportPage>
          <PageHeader title="Trụ cột 2 & 3: Chỉ Số Yêu Tiền & Tải Trọng Niềm Tin" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* LEFT — Love of Money Gauge */}
            <div>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: NAVY,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Chỉ Số Yêu Tiền
              </h3>
              {!loveFull && loveDone && (
                <PartialProgressNote
                  count={loveCount}
                  total={LOVE_OF_MONEY_QUESTIONS.length}
                  label="Mức Độ Yêu Tiền"
                />
              )}
              {loveDone ? (
                <>
                  <PremiumLoveGauge value={loveScore} max={38} tier={loveTier} />
                </>
              ) : (
                <NotCompletedNote message="Chưa có dữ liệu Mức Độ Yêu Tiền. Quay lại Blueprint Phần II → tab Yêu tiền để trả lời 38 câu." />
              )}
            </div>

            {/* RIGHT — Beliefs */}
            <div>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontSize: 17,
                  color: NAVY,
                  textAlign: "center",
                  marginBottom: 12,
                }}
              >
                Tải Trọng Niềm Tin Giới Hạn
              </h3>
              {!beliefsFull && beliefsDone && (
                <PartialProgressNote
                  count={beliefsCount}
                  total={BELIEF_QUESTIONS.length}
                  label="Niềm Tin Về Tiền"
                />
              )}
              {beliefsDone ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    <Stat
                      number="1"
                      label="Điểm trung bình:"
                      value={`${beliefAvg}/10`}
                    />
                    <Stat
                      number="2"
                      label="Số niềm tin kìm hãm mạnh:"
                      value={String(beliefStrong)}
                    />
                  </div>

                  {/* Anchor + Arrow illustration */}
                  <BeliefAnchorVisual avg={beliefAvg} />

                  <div
                    style={{
                      border: `2px solid ${DANGER}`,
                      borderRadius: 6,
                      padding: 14,
                      background: `${DANGER}08`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: DANGER,
                        marginBottom: 8,
                      }}
                    >
                      Các rào cản nặng nhất:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                      {topBeliefs.length > 0 ? (
                        topBeliefs.map((q) => (
                          <li
                            key={q.id}
                            style={{
                              fontSize: 11.5,
                              color: TEXT_DARK,
                              padding: "4px 0",
                              display: "flex",
                              gap: 6,
                              alignItems: "start",
                            }}
                          >
                            <AlertCircle size={12} style={{ color: DANGER, marginTop: 2, flexShrink: 0 }} />
                            <span>{q.text}</span>
                          </li>
                        ))
                      ) : (
                        <li style={{ fontSize: 11.5, color: TEXT_MUTED, fontStyle: "italic" }}>
                          Không có niềm tin giới hạn mạnh (điểm ≥ 7).
                        </li>
                      )}
                    </ul>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      background: NAVY,
                      color: "white",
                      padding: "10px 14px",
                      fontSize: 12,
                      borderRadius: 4,
                    }}
                  >
                    <strong>Nhóm chủ đề rủi ro cao nhất:</strong>{" "}
                    {heaviestTheme.label} — {heaviestTheme.description}
                  </div>

                  {/* Tier label */}
                  <div
                    style={{
                      marginTop: 12,
                      padding: "10px 14px",
                      borderLeft: `3px solid ${
                        beliefTier.tier === 1 ? SUCCESS : beliefTier.tier === 2 ? WARNING : DANGER
                      }`,
                      background: CREAM_LIGHT,
                      fontSize: 12.5,
                      lineHeight: 1.55,
                      color: TEXT_BODY,
                    }}
                  >
                    <strong style={{ color: NAVY }}>Kết luận:</strong>{" "}
                    {beliefTier.label}. {beliefTier.desc}
                  </div>
                </>
              ) : (
                <NotCompletedNote message="Chưa có dữ liệu Niềm Tin Về Tiền. Quay lại Blueprint Phần II → tab Niềm tin để chấm 72 nhận định." />
              )}
            </div>
          </div>
        </ReportPage>

        {/* PAGE 5 — WEALTH MRI PYRAMID */}
        <ReportPage>
          <PageHeader title="Entrepreneur Wealth MRI™ — 5 Tầng Nhận Thức Tài Chính" />
          <p style={paragraphStyle}>
            Hành vi tài chính là phần nổi của tảng băng. 4 tầng nội tâm bên dưới
            quyết định tốc độ + chất lượng tích lũy thịnh vượng.
          </p>

          <MRIPyramidVisual
            consciousness={pro.wealthMRI.consciousness}
            relationship={pro.wealthMRI.relationship}
            belief={pro.wealthMRI.belief}
            personalityLabel={pro.wealthMRI.personalityLabel}
            wealthOS={pro.wealthMRI.wealthOS}
          />
        </ReportPage>

        {/* PAGE 6 — ENTREPRENEUR WEALTH SCORE SCALE (kết thúc Phần I) */}
        <ReportPage>
          <PageHeader title="Entrepreneur Wealth Score™ — Định Vị Hiện Tại" />
          <p style={paragraphStyle}>
            Tổng điểm Wealth Score phản ánh tổng hợp 5 tầng nội tâm tài chính.
            Đây là điểm xuất phát để định vị anh/chị trên thang 0-100 — từ{" "}
            <i>Financial Victim</i> đến <i>Freedom Architect</i>.
          </p>

          <WealthScoreScale
            value={pro.wealthMRI.wealthScore}
            tier={pro.wealthMRI.tier}
          />

          <AIDiagnosisBox text={pro.wealthMRI.aiInsight} />
        </ReportPage>

        {/* ─── PHẦN II — ENTREPRENEUR RISK MAP™ ─── */}
        <PartDivider
          numeral="II"
          partLabel="Phần II"
          title="Entrepreneur Risk Map™"
          subtitle="Soi chiếu toàn diện thực trạng thu chi, tài sản, nợ và 8 nhóm rủi ro tài chính của chủ doanh nghiệp."
          modules={[
            "Thực trạng thu nhập — 3 nhóm + chấm 10 điểm",
            "Thực trạng chi tiêu — JARS + tỉ lệ tiết kiệm",
            "Phân tích cơ cấu tài sản · nợ · Net Worth",
            "8 nhóm rủi ro tài chính",
            "Bản đồ nhiệt rủi ro — vùng nguy hiểm ưu tiên",
            "3 bảng điểm mù định lượng — KPI chiến lược",
          ]}
        />

        {/* PAGE — PHÂN TÍCH THỰC TRẠNG THU NHẬP */}
        <ReportPage>
          <PageHeader title="Phân Tích Thực Trạng Thu Nhập" />
          <p style={paragraphStyle}>
            Đánh giá cấu trúc thu nhập theo 3 nhóm — Lương · Kinh doanh ·
            Thụ động. Càng đa dạng và ít phụ thuộc vào công sức trực tiếp,
            khả năng tự do tài chính càng cao.
          </p>
          <IncomeAnalysisReport
            result={computeIncomeAnalysis(data.status?.cashflow?.income)}
          />
        </ReportPage>

        {/* PAGE — PHÂN TÍCH THỰC TRẠNG CHI TIÊU */}
        <ReportPage>
          <PageHeader title="Phân Tích Thực Trạng Chi Tiêu" />
          <p style={paragraphStyle}>
            Cơ cấu chi tiêu theo 6 quỹ JARS, tỉ lệ tiết kiệm và 3 chỉ số sức
            khoẻ dòng tiền (chi cố định / chi biến động / để dành).
          </p>
          <SpendingAnalysisReport
            cashflow={data.status?.cashflow}
          />
        </ReportPage>

        {/* PAGE — PHÂN TÍCH CƠ CẤU TÀI SẢN + NỢ + NET WORTH */}
        <ReportPage>
          <PageHeader title="Phân Tích Cơ Cấu Tài Sản · Nợ · Net Worth" />
          <p style={paragraphStyle}>
            Đánh giá tài sản theo 4 nhóm (Thanh khoản · Tiêu dùng · Tăng trưởng ·
            Dòng tiền), 3 nhóm nợ và 3 chỉ số nợ chính. Phân loại nợ tốt vs nợ
            xấu để xác định ưu tiên xử lý.
          </p>
          <NetWorthAnalysisReport
            result={computeNetWorthAnalysis(
              data.status?.netWorth?.assets,
              data.status?.netWorth?.liabilities,
              data.status?.cashflow?.income
            )}
          />
        </ReportPage>

        {/* PAGE 7 — RISK MAP 8 NHÓM (Shield with radial groups) */}
        <ReportPage>
          <PageHeader title="Entrepreneur Risk Map™ — 8 Nhóm Rủi Ro" />
          <p style={paragraphStyle}>
            Bản đồ rủi ro tài chính ngắn hạn và dài hạn cho nhà khởi nghiệp.
            Mỗi nhóm chấm 0-100 — càng cao càng RỦI RO.
          </p>

          <RiskMapVisual items={pro.riskMap.items} />
        </ReportPage>

        {/* PAGE 8 — RISK HEATMAP — Grid 8 cards + AI Analysis box */}
        <ReportPage>
          <PageHeader title="Entrepreneur Risk Heatmap™ — Bảng Đo Nhiệt Rủi Ro" />
          <p style={paragraphStyle}>
            Mỗi nhóm rủi ro được chấm 0-100 (càng cao càng an toàn). Các vùng{" "}
            <strong style={{ color: DANGER }}>ĐỎ</strong> cần xử lý trước khi
            mở rộng đầu tư hoặc tăng tốc kinh doanh.
          </p>

          <RiskHeatmapGrid
            items={pro.riskMap.items}
            riskScore={pro.riskMap.riskScore}
            level={pro.riskMap.level}
            topRisks={pro.riskMap.topRisks}
            topOpportunities={pro.riskMap.topOpportunities}
          />

          <div
            style={{
              marginTop: 20,
              padding: 14,
              background: CREAM_LIGHT,
              border: `1px solid ${GOLD}33`,
              borderLeft: `4px solid ${GOLD}`,
              borderRadius: 6,
              fontSize: 12,
              color: TEXT_DARK,
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: NAVY }}>📍 AI Risk Analysis:</strong>{" "}
            {pro.riskMap.aiAnalysis}
          </div>
        </ReportPage>

        {/* PAGE 9 — ĐIỂM MÙ ĐỊNH LƯỢNG */}
        <ReportPage>
          <PageHeader title="Điểm Mù Định Lượng — 3 KPI Chiến Lược" />
          <p style={paragraphStyle}>
            3 chỉ số định lượng quan trọng nhất phản ánh độ vững của hệ thống
            tài chính cá nhân.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
              marginTop: 18,
            }}
          >
            <KPICard
              label="Emergency Risk"
              value={`${Math.round(ins.emergency.monthsCovered)}`}
              unit="tháng phủ chi"
              color={
                ins.emergency.monthsCovered >= 6
                  ? SUCCESS
                  : ins.emergency.monthsCovered >= 3
                    ? WARNING
                    : DANGER
              }
              consequence={
                ins.emergency.monthsCovered < 3
                  ? "Nguy cơ đứt gãy dòng tiền nếu mất thu nhập. Cần xây quỹ dự phòng tối thiểu 6 tháng."
                  : ins.emergency.monthsCovered < 12
                    ? "Đã có nền tảng, hướng tới 12 tháng để đạt ngưỡng Thoát Nghèo."
                    : "✓ Đã đạt Thoát Nghèo — quỹ dự phòng vững."
              }
            />
            <KPICard
              label="Protection Gap"
              value={fmtBnLocal(
                Math.max(
                  0,
                  pro.prescription.improvementTargets[2]?.current ?? 0
                ) > 0
                  ? `${pro.riskMap.items[4]?.score ?? 0}/100`
                  : `${pro.riskMap.items[4]?.score ?? 0}/100`
              )}
              color={
                (pro.riskMap.items[4]?.score ?? 0) >= 60
                  ? DANGER
                  : (pro.riskMap.items[4]?.score ?? 0) >= 40
                    ? WARNING
                    : SUCCESS
              }
              consequence="Khoảng trống bảo vệ = Nhu cầu bảo vệ gia đình − Tổng quyền lợi BH hiện có. Càng nhỏ càng tốt."
            />
            <KPICard
              label="Freedom Ratio"
              value={`${pro.freedomRoadmap.freedomScore}`}
              unit="/100"
              color={
                pro.freedomRoadmap.freedomScore >= 100
                  ? SUCCESS
                  : pro.freedomRoadmap.freedomScore >= 50
                    ? WARNING
                    : DANGER
              }
              consequence={
                pro.freedomRoadmap.freedomScore < 20
                  ? "Phụ thuộc cao vào thu nhập chủ động. Ưu tiên xây tài sản tạo dòng tiền."
                  : pro.freedomRoadmap.freedomScore < 100
                    ? "Tiến trình tự do tài chính đang hình thành — duy trì kỷ luật tích sản."
                    : "✓ Tự do tài chính — dòng tiền thụ động đã phủ chi."
              }
            />
          </div>
        </ReportPage>

        {/* "5 Cấp Độ Tự Do" trang cũ đã chuyển sang Phần III dạng 6 cấp độ
            (Xóa nợ xấu → Di sản tài chính) — xem PartDivider III bên dưới. */}

        {/* ─── PHẦN III — FINANCIAL FREEDOM ROADMAP™ ─── */}
        <PartDivider
          numeral="III"
          partLabel="Phần III"
          title="Financial Freedom Roadmap™"
          subtitle="6 cấp độ tự do tài chính — từ Xóa nợ xấu đến Di sản tài chính. Định vị hiện tại + lộ trình leo từng bậc."
          modules={[
            "Vị trí hiện tại trên 6 cấp độ tài chính",
            "Cấp độ 1: Xóa nợ xấu",
            "Cấp độ 2: Thoát nghèo",
            "Cấp độ 3: An toàn tài chính",
            "Cấp độ 4: Độc lập tài chính",
            "Cấp độ 5: Tự do tài chính",
            "Cấp độ 6: Di sản tài chính",
          ]}
        />

        {/* PAGE — VỊ TRÍ HIỆN TẠI TRÊN 6 CẤP ĐỘ */}
        <ReportPage>
          <PageHeader title="Vị Trí Hiện Tại Trên 6 Cấp Độ Tài Chính" />
          <p style={paragraphStyle}>
            Mô hình 6 bậc thang tự do tài chính — mỗi cấp độ là một cột mốc
            quan trọng. Xác định vị trí hiện tại để biết bước đi tiếp theo.
          </p>
          <FinancialLevelsOverview
            data={data}
            wealthScore={pro.wealthMRI.wealthScore}
          />
        </ReportPage>

        {/* PAGE — 6 CẤP ĐỘ CHI TIẾT */}
        {FINANCIAL_LEVELS.map((lvl) => (
          <ReportPage key={lvl.num}>
            <PageHeader
              title={`Cấp độ ${lvl.num}: ${lvl.name}`}
            />
            <FinancialLevelDetail
              level={lvl}
              data={data}
              wealthScore={pro.wealthMRI.wealthScore}
            />
          </ReportPage>
        ))}

        {/* ─── PHẦN IV — FINANCIAL PRESCRIPTION™ ─── */}
        <PartDivider
          numeral="IV"
          partLabel="Phần IV"
          title="Financial Prescription™"
          subtitle="Đơn thuốc tài chính cá nhân hóa — chẩn đoán AI và 3 hành động ưu tiên theo mức độ Khẩn cấp · Quan trọng · Phát triển."
          modules={[
            "AI Financial Diagnosis™ — chẩn đoán tổng quan",
            "Mục tiêu chỉ số 12 tháng — Before / After",
            "Đơn thuốc #1 Khẩn cấp — cần xử lý ngay",
            "Đơn thuốc #2 Quan trọng — cần triển khai trong quý",
            "Đơn thuốc #3 Phát triển — kế hoạch dài hạn",
          ]}
        />

        {/* PAGE 14 — TÓM TẮT KẾT QUẢ + FINANCIAL PRESCRIPTION */}
        <ReportPage>
          <PageHeader title="Financial Prescription™ — Tóm Tắt Hành Động" />

          {/* Diagnosis box */}
          <div
            style={{
              background: CREAM_LIGHT,
              border: `1px solid ${GOLD}55`,
              padding: 18,
              borderRadius: 6,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: NAVY_LIGHT,
                letterSpacing: 1.5,
                marginBottom: 8,
                textTransform: "uppercase",
              }}
            >
              🩺 Chẩn đoán AI
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                color: TEXT_DARK,
                margin: 0,
              }}
            >
              {pro.prescription.aiDiagnosis}
            </p>
          </div>

        </ReportPage>

        {/* PAGE — MỤC TIÊU CHỈ SỐ 12 THÁNG */}
        <ReportPage>
          <PageHeader title="Mục Tiêu Chỉ Số 12 Tháng — Before / After" />
          <p style={paragraphStyle}>
            5 chỉ số cần cải thiện trong 12 tháng tới. Cột mục tiêu là điểm thầy
            sẽ giúp anh/chị đạt được nếu triển khai đầy đủ Financial
            Prescription™.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              marginTop: 24,
            }}
          >
            {pro.prescription.improvementTargets.map((t, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  padding: 16,
                  borderRadius: 10,
                  border: `1px solid ${NAVY}22`,
                  boxShadow: "0 4px 12px rgba(12,38,66,0.05)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: NAVY,
                    marginBottom: 12,
                  }}
                >
                  {t.label}
                </div>
                <ProgressBar
                  current={Math.round(t.current)}
                  target={Math.round(t.target)}
                />
              </div>
            ))}
          </div>
        </ReportPage>

        {/* PAGE — 3 ĐƠN THUỐC ƯU TIÊN (redesigned) */}
        <ReportPage>
          <PageHeader title="3 Đơn Thuốc Ưu Tiên — Khẩn cấp · Quan trọng · Phát triển" />
          <p style={paragraphStyle}>
            Ba hành động ưu tiên được kê theo nguyên tắc bác sĩ tài chính:
            xử lý nguy cơ trước (Khẩn cấp) → bảo vệ & ổn định (Quan trọng) →
            đầu tư cho tương lai (Phát triển). Mỗi đơn thuốc đi kèm hành động
            cụ thể và kết quả mong đợi đo lường được.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginTop: 24,
              alignItems: "stretch",
            }}
          >
            {pro.prescription.prescriptions.map((p, i) => {
              const meta = {
                "Khẩn cấp": {
                  c: DANGER,
                  cLight: "#fee2e2",
                  Icon: AlertOctagon,
                  tag: "Cần xử lý ngay trong 30 ngày",
                },
                "Quan trọng": {
                  c: WARNING,
                  cLight: "#fef3c7",
                  Icon: Stethoscope,
                  tag: "Triển khai trong quý tới",
                },
                "Phát triển": {
                  c: SUCCESS,
                  cLight: "#dcfce7",
                  Icon: Sprout,
                  tag: "Đầu tư cho tương lai",
                },
              } as const;
              const m = meta[p.level];
              const Icon = m.Icon;
              return (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    border: `1px solid ${m.c}40`,
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 6px 18px rgba(12,38,66,0.06)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Gradient top strip */}
                  <div
                    style={{
                      height: 6,
                      background: `linear-gradient(90deg, ${m.c}, ${m.c}99 60%, ${m.c}33)`,
                    }}
                  />

                  <div
                    style={{
                      padding: 18,
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    {/* Icon + badge centered */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 78,
                          height: 78,
                          borderRadius: "50%",
                          background: `radial-gradient(circle at 30% 30%, ${m.cLight}, ${m.c}33)`,
                          border: `2px solid ${m.c}66`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 4px 12px ${m.c}33`,
                        }}
                      >
                        <Icon size={38} strokeWidth={1.8} color={m.c} />
                      </div>
                      <div
                        style={{
                          fontSize: 9.5,
                          fontWeight: 900,
                          color: m.c,
                          letterSpacing: 1.2,
                          background: m.cLight,
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: `1px solid ${m.c}55`,
                        }}
                      >
                        ĐƠN THUỐC #{i + 1}
                      </div>
                    </div>

                    {/* Level badge + tag */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 12,
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 900,
                          color: "#fff",
                          background: m.c,
                          padding: "4px 14px",
                          borderRadius: 999,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                        }}
                      >
                        {p.level}
                      </span>
                      <span
                        style={{
                          fontSize: 10.5,
                          color: TEXT_MUTED,
                          fontStyle: "italic",
                        }}
                      >
                        {m.tag}
                      </span>
                    </div>

                    {/* Problem */}
                    <div
                      style={{
                        display: "flex",
                        gap: 7,
                        alignItems: "flex-start",
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: NAVY,
                        marginBottom: 14,
                        lineHeight: 1.4,
                        paddingBottom: 14,
                        borderBottom: `1px solid ${m.c}22`,
                      }}
                    >
                      <AlertCircle
                        size={17}
                        color={m.c}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <span>{p.problem}</span>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        fontSize: 9.5,
                        fontWeight: 800,
                        color: TEXT_MUTED,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        marginBottom: 10,
                      }}
                    >
                      ✦ Hành động cụ thể
                    </div>
                    <div style={{ display: "grid", gap: 9, marginBottom: 16 }}>
                      {p.actions.map((a, j) => (
                        <div
                          key={j}
                          style={{
                            display: "flex",
                            gap: 9,
                            alignItems: "flex-start",
                            fontSize: 11.5,
                            color: TEXT_BODY,
                            lineHeight: 1.5,
                          }}
                        >
                          <div
                            style={{
                              flexShrink: 0,
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: m.cLight,
                              border: `1.5px solid ${m.c}66`,
                              color: m.c,
                              fontSize: 10.5,
                              fontWeight: 900,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {j + 1}
                          </div>
                          <span style={{ paddingTop: 1 }}>{a}</span>
                        </div>
                      ))}
                    </div>

                    {/* Expected result callout — pinned to bottom */}
                    <div
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        gap: 9,
                        alignItems: "flex-start",
                        background: m.cLight,
                        border: `1px dashed ${m.c}66`,
                        padding: "11px 13px",
                        borderRadius: 8,
                      }}
                    >
                      <Target
                        size={17}
                        color={m.c}
                        strokeWidth={2.2}
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: m.c,
                          lineHeight: 1.45,
                        }}
                      >
                        Kết quả mong đợi:{" "}
                        <span style={{ color: NAVY_DARK, fontWeight: 800 }}>
                          {p.expectedResult}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div
            style={{
              marginTop: 24,
              padding: "14px 18px",
              borderRadius: 8,
              background: `linear-gradient(90deg, ${NAVY}08, ${GOLD}10)`,
              border: `1px solid ${GOLD}55`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Sparkles size={20} color={GOLD_DARK} />
            <div
              style={{
                fontSize: 12,
                color: TEXT_DARK,
                lineHeight: 1.55,
              }}
            >
              <strong style={{ color: NAVY }}>Lưu ý:</strong> Ba đơn thuốc trên
              cần được triển khai <em>theo đúng thứ tự ưu tiên</em>. Bỏ qua hoặc
              đảo trình tự sẽ làm giảm hiệu quả phục hồi tài chính tổng thể —
              giống như uống thuốc bổ trước khi cấp cứu vết thương.
            </div>
          </div>
        </ReportPage>

        {/* ─── PHẦN V — GIỚI THIỆU GIẢI PHÁP ─── */}
        <PartDivider
          numeral="V"
          partLabel="Phần V"
          title="Giải Pháp Toàn Diện"
          subtitle="Founder Financial OS™ PRO — biến bản chẩn đoán thành hệ điều hành tài chính vận hành hằng tuần, có coaching 1-1 cùng coach của bạn."
          modules={[
            "Founder Financial OS™ PRO — chương trình 28 ngày",
            "Coaching 1-1 cá nhân hóa với chuyên gia",
            "Triển khai toàn bộ Financial Prescription™ thực chiến",
            "Cộng đồng học viên + hỗ trợ trọn đời",
          ]}
        />

        {/* PAGE 15 — CTA PRO */}
        <ReportPage>
          <PageHeader title="Nâng cấp Founder Financial OS™ PRO" />

          {/* Hero CTA */}
          <div
            style={{
              padding: 32,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
              color: "white",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: GOLD_LIGHT,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              💎 Khuyến nghị chuyên gia
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                fontWeight: 800,
                margin: "0 0 14px",
                color: GOLD_LIGHT,
              }}
            >
              Founder Financial OS™ PRO
            </h3>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.7,
                margin: "0 auto 20px",
                maxWidth: 520,
                color: "rgba(255,255,255,0.88)",
              }}
            >
              Triển khai toàn bộ Financial Prescription™ theo lộ trình 28 ngày
              có hướng dẫn. Chuyển insights → hành động cụ thể với coaching
              1-1 cùng coach.
            </p>
            <Link
              href="/giai-phap-toan-dien#pricing"
              className="print:hidden"
              style={{
                display: "inline-block",
                padding: "14px 32px",
                background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`,
                color: NAVY_DARK,
                fontWeight: 800,
                fontSize: 15,
                borderRadius: 8,
                textDecoration: "none",
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
              }}
            >
              Nâng cấp ngay →
            </Link>
          </div>

          {/* What's included */}
          <h3
            style={{
              fontFamily: SERIF,
              fontSize: 17,
              color: NAVY,
              marginBottom: 14,
            }}
          >
            Trong gói PRO bao gồm
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              {
                icon: "🎯",
                title: "Roadmap 28 ngày chi tiết",
                desc: "Lộ trình từng tuần với mục tiêu, công cụ, deliverable cụ thể.",
              },
              {
                icon: "👨‍🏫",
                title: "Coaching 1-1",
                desc: "4 buổi private (60 phút/buổi) — review tiến độ, điều chỉnh đơn thuốc.",
              },
              {
                icon: "🛠️",
                title: "Bộ công cụ Founder Financial OS™",
                desc: "Cashflow Tracker, Risk Heatmap, Freedom Calculator, Master Plan — tất cả tích hợp.",
              },
              {
                icon: "👥",
                title: "Cộng đồng học viên + hỗ trợ trọn đời",
                desc: "Tham gia mastermind hàng tháng + truy cập update miễn phí.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  background: "#fff",
                  border: `1px solid ${GOLD}55`,
                  borderRadius: 8,
                  boxShadow: `0 4px 12px ${NAVY}10`,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: NAVY,
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </div>
                <p
                  style={{
                    fontSize: 11.5,
                    color: TEXT_BODY,
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Closing */}
          <div
            style={{
              marginTop: 24,
              padding: 18,
              background: CREAM_LIGHT,
              border: `1px solid ${GOLD}55`,
              borderRadius: 6,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 12.5,
                color: TEXT_DARK,
                margin: "0 0 4px",
                fontStyle: "italic",
                lineHeight: 1.6,
              }}
            >
              &ldquo;Tài chính cá nhân không phải toán học — nó là tâm lý học.
              Hệ điều hành đúng + hành động đúng = tự do tài chính.&rdquo;
            </p>
            <p
              style={{
                fontSize: 11,
                color: NAVY,
                margin: 0,
                fontWeight: 700,
              }}
            >
              — Your Coach
            </p>
          </div>
        </ReportPage>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "32px 16px",
            color: TEXT_MUTED,
            fontSize: 11,
            fontStyle: "italic",
          }}
        >
          Báo cáo được tạo tự động bởi Entrepreneur Financial Blueprint™ ·{" "}
          <strong style={{ color: NAVY }}>VINEN</strong> · In ngày{" "}
          {reportDate}
        </div>
      </main>

    </div>
  );
}

/* ─────────────────────────────────────────────
 *  Layout components
 * ───────────────────────────────────────────── */

function PartDivider({
  numeral,
  partLabel,
  title,
  subtitle,
  modules,
}: {
  numeral: string;
  partLabel: string;
  title: string;
  subtitle: string;
  modules: string[];
}) {
  return (
    <section
      className="report-part-divider"
      style={{
        width: "100%",
        maxWidth: 1080,
        margin: "48px auto",
        background: `linear-gradient(135deg, ${CREAM_LIGHT}, ${CREAM})`,
        position: "relative",
        boxShadow: `0 8px 28px ${NAVY}10`,
        padding: "clamp(32px, 6vw, 64px) clamp(20px, 5vw, 48px)",
        boxSizing: "border-box",
        borderRadius: 16,
        border: `1px solid ${GOLD}33`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ width: "100%" }}>
        {/* Part label */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 4,
            color: GOLD,
            marginBottom: 32,
            textTransform: "uppercase",
          }}
        >
          ✦ {partLabel} ✦
        </div>

        {/* Numeral with ornament */}
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
          }}
        >
          {/* Decorative left line */}
          <div
            style={{
              width: 80,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${GOLD})`,
              marginRight: 28,
            }}
          />
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${CREAM_LIGHT}, ${CREAM})`,
              border: `3px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 6px 20px ${NAVY}15, inset 0 2px 8px ${GOLD}22`,
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 64,
                fontWeight: 900,
                color: NAVY,
                lineHeight: 1,
              }}
            >
              {numeral}
            </span>
          </div>
          {/* Decorative right line */}
          <div
            style={{
              width: 80,
              height: 2,
              background: `linear-gradient(270deg, transparent, ${GOLD})`,
              marginLeft: 28,
            }}
          />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: "clamp(28px, 4.5vw, 38px)",
            fontWeight: 900,
            color: NAVY,
            margin: "0 auto 14px",
            letterSpacing: 0.3,
            lineHeight: 1.2,
            maxWidth: 600,
            textAlign: "center",
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 14,
            color: TEXT_BODY,
            fontStyle: "italic",
            margin: "0 auto 36px",
            lineHeight: 1.6,
            maxWidth: 520,
            textAlign: "center",
          }}
        >
          {subtitle}
        </p>

        {/* Module list */}
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            margin: "0 auto",
            padding: "22px 28px",
            background: CREAM_LIGHT,
            border: `1px solid ${GOLD}44`,
            borderRadius: 12,
            boxShadow: `0 4px 16px ${NAVY}08`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 2,
              color: GOLD_DARK,
              textTransform: "uppercase",
              marginBottom: 14,
              textAlign: "center",
            }}
          >
            Nội dung trong phần này
          </div>
          <ol
            style={{
              margin: 0,
              paddingLeft: 22,
              textAlign: "left",
            }}
          >
            {modules.map((m, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13,
                  color: TEXT_DARK,
                  fontWeight: 500,
                  marginBottom: 8,
                  lineHeight: 1.55,
                }}
              >
                {m}
              </li>
            ))}
          </ol>
        </div>

        {/* Decorative dot ornament */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: GOLD,
              border: `2px solid ${NAVY}`,
            }}
          />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD }} />
        </div>
      </div>
    </section>
  );
}

function ReportPage({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="report-page"
      style={{
        width: "100%",
        maxWidth: 1080,
        margin: "24px auto",
        background: "#fff",
        position: "relative",
        boxShadow: "0 6px 24px rgba(26,43,71,0.06)",
        padding: "clamp(24px, 4vw, 40px)",
        boxSizing: "border-box",
        borderRadius: 16,
        border: `1px solid ${NAVY}11`,
      }}
    >
      {children}
    </section>
  );
}

function CoverPage({
  fullName,
  birthDate,
  coach,
  date,
  score,
  tier,
}: {
  fullName: string;
  birthDate?: string;
  coach: string;
  date: string;
  score: number;
  tier: string;
}) {
  const dobStr = (() => {
    if (!birthDate) return null;
    const [y, m, d] = birthDate.split("-");
    return d && m && y ? `${d}/${m}/${y}` : birthDate;
  })();
  return (
    <section
      className="report-cover"
      style={{
        width: "100%",
        maxWidth: 1080,
        margin: "24px auto 40px",
        background: `linear-gradient(135deg, ${CREAM_LIGHT}, ${CREAM})`,
        position: "relative",
        boxShadow: `0 8px 32px ${NAVY}10`,
        padding: "clamp(32px, 6vw, 64px) clamp(20px, 5vw, 48px)",
        boxSizing: "border-box",
        borderRadius: 16,
        border: `1px solid ${GOLD}33`,
        overflow: "hidden",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 3,
          color: GOLD_DARK,
          marginBottom: 24,
          textTransform: "uppercase",
        }}
      >
        VINEN · Làm chủ tài chính – Thịnh vượng tương lai
      </div>

      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: "clamp(28px, 5vw, 44px)",
          fontWeight: 900,
          color: NAVY,
          lineHeight: 1.15,
          margin: "0 0 14px",
          letterSpacing: 0.3,
        }}
      >
        BÁO CÁO ĐÁNH GIÁ
        <br />
        TÀI CHÍNH & TÂM THỨC TOÀN DIỆN
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: 15,
          color: TEXT_BODY,
          fontStyle: "italic",
          margin: "0 auto 40px",
          maxWidth: 600,
          lineHeight: 1.6,
        }}
      >
        Giải mã thế giới nội tâm và tái thiết lập hệ điều hành thịnh vượng.
      </p>

      {/* Info + Score */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 32,
          alignItems: "center",
          maxWidth: 760,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InfoBox label="Học viên" value={fullName} />
          {dobStr && <InfoBox label="Ngày sinh" value={dobStr} />}
          <InfoBox label="Chuyên gia huấn luyện" value={coach} />
          <InfoBox label="Ngày thực hiện" value={date} />
        </div>
        <div style={{ textAlign: "center" }}>
          <ScoreCircle
            value={score}
            max={100}
            size={220}
            label="Tổng điểm Wealth Score™"
            sublabel={tier}
          />
        </div>
      </div>
    </section>
  );
}

function PageHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: SERIF,
          fontSize: "clamp(20px, 3vw, 28px)",
          fontWeight: 900,
          color: NAVY,
          margin: 0,
          letterSpacing: 0.3,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${GOLD}, transparent)`,
          marginTop: 10,
          width: 200,
          borderRadius: 999,
        }}
      />
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px 18px",
        background: CREAM_LIGHT,
        border: `1.5px solid ${NAVY}22`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: GOLD_DARK,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14.5, color: NAVY, fontWeight: 700 }}>
        {value}
      </div>
    </div>
  );
}

function HighlightBox({
  badge,
  badgeColor,
  title,
  body,
}: {
  icon?: string;
  iconColor?: string;
  badge: string;
  badgeColor: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        border: `2px solid ${badgeColor}`,
        padding: "18px 18px 16px",
        borderRadius: 12,
        background: `linear-gradient(135deg, ${badgeColor}0d, transparent 70%), #fff`,
        boxShadow: `0 6px 18px ${badgeColor}22`,
        overflow: "hidden",
      }}
    >
      {/* Decorative top-left corner */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: `linear-gradient(180deg, ${badgeColor}, ${shade(badgeColor, -25)})`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 8,
          marginLeft: 6,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: badgeColor,
            color: "#fff",
            fontSize: 9,
            fontWeight: 900,
          }}
        >
          ●
        </span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            color: badgeColor,
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {badge}
        </span>
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 17,
          fontWeight: 900,
          color: NAVY,
          marginBottom: 8,
          marginLeft: 6,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <p
        style={{
          fontSize: 12,
          color: TEXT_BODY,
          margin: 0,
          marginLeft: 6,
          lineHeight: 1.6,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function Stat({
  number,
  label,
  value,
}: {
  number: string;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        border: `1px solid ${NAVY}33`,
        borderRadius: 6,
        padding: 12,
        background: "#fff",
        textAlign: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -10,
          left: 10,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: NAVY,
          color: "white",
          fontSize: 11,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: TEXT_MUTED,
          marginTop: 4,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 900,
          color: NAVY,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const paragraphStyle: React.CSSProperties = {
  fontSize: 13,
  color: TEXT_BODY,
  lineHeight: 1.6,
  margin: "0 0 14px",
};

function fmtBnLocal(n: number | string): string {
  if (typeof n === "string") return n;
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e9)
    return sign + (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return sign + Math.round(abs / 1e6) + " triệu";
  if (abs >= 1e3) return sign + Math.round(abs / 1e3) + "k";
  return sign + abs.toLocaleString("vi-VN") + "₫";
}

/* ─────────────────────────────────────────────
 *  MRIPyramidVisual — 5 tầng nhận thức tài chính (3D pyramid)
 * ───────────────────────────────────────────── */

function MRIPyramidVisual({
  consciousness,
  relationship,
  belief,
  personalityLabel,
  wealthOS,
}: {
  consciousness: number;
  relationship: number;
  belief: number;
  personalityLabel: string;
  wealthOS: number;
}) {
  // Verdict helper
  const verdictOf = (
    score: number
  ): { label: string; color: string } => {
    if (score >= 80) return { label: "Xuất sắc", color: SUCCESS };
    if (score >= 60) return { label: "Tốt", color: SUCCESS };
    if (score >= 40) return { label: "Trung bình", color: WARNING };
    if (score >= 20) return { label: "Yếu", color: WARNING };
    return { label: "Rất yếu", color: DANGER };
  };

  const tiers = [
    {
      level: 5,
      title: "Wealth Operating System™",
      subtitle: "Hệ điều hành tài chính",
      desc: "Kỹ năng thực chiến: quản trị dòng tiền, rủi ro, đầu tư, tích sản.",
      score: wealthOS,
      scoreText: `${wealthOS}/100`,
      verdict: verdictOf(wealthOS),
      color: GOLD_LIGHT,
      align: "right" as const,
    },
    {
      level: 4,
      title: "Money Personality™",
      subtitle: "Tính cách tài chính",
      desc: `Khuynh hướng hành vi tự nhiên.`,
      score: -1,
      scoreText: personalityLabel,
      verdict: { label: "Khuynh hướng", color: GOLD_DARK },
      color: "#C99D5B",
      align: "left" as const,
    },
    {
      level: 3,
      title: "Wealth Belief™",
      subtitle: "Hệ niềm tin tài chính",
      desc: "Rào cản vô hình: tôi có xứng đáng không?",
      score: belief,
      scoreText: `${belief}/100`,
      verdict: verdictOf(belief),
      color: "#9F7B3F",
      align: "right" as const,
    },
    {
      level: 2,
      title: "Money Relationship™",
      subtitle: "Mối quan hệ với tiền",
      desc: "Cảm xúc: yêu, ghét, sợ hãi, hay ám ảnh?",
      score: relationship,
      scoreText: `${relationship}/100`,
      verdict: verdictOf(relationship),
      color: "#4F6A8A",
      align: "left" as const,
    },
    {
      level: 1,
      title: "Money Consciousness™",
      subtitle: "Nhận thức về tiền",
      desc: "Nền tảng: tiền là công cụ hay mục đích?",
      score: consciousness,
      scoreText: `${consciousness}/100`,
      verdict: verdictOf(consciousness),
      color: NAVY,
      align: "right" as const,
    },
  ];

  // Geometry: pyramid là 5 trapezoid stacked, tổng width 460, height 360
  const W = 460;
  const H = 360;
  const tierH = H / 5;
  // Apex width / base width
  const minW = 80; // top
  const maxW = 460; // base

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 18,
          alignItems: "center",
        }}
      >
        {/* LEFT side labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 10,
            height: H,
          }}
        >
          {tiers
            .filter((t) => t.align === "left")
            .map((t) => (
              <PyramidTagLeft key={t.level} tier={t} />
            ))}
        </div>

        {/* CENTER pyramid SVG */}
        <svg
          width={W}
          height={H + 30}
          viewBox={`0 -10 ${W} ${H + 30}`}
          style={{ filter: `drop-shadow(0 12px 24px ${NAVY}22)` }}
        >
          <defs>
            {tiers.map((t, idx) => {
              const isTop = idx === 0;
              return (
                <linearGradient
                  key={t.level}
                  id={`mri-grad-${t.level}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={isTop ? GOLD_LIGHT : shade(t.color, 30)}
                  />
                  <stop
                    offset="50%"
                    stopColor={t.color}
                  />
                  <stop
                    offset="100%"
                    stopColor={shade(t.color, -25)}
                  />
                </linearGradient>
              );
            })}
            <linearGradient id="mri-glow-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFEB99" />
              <stop offset="100%" stopColor={GOLD_LIGHT} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Glow halo above top */}
          <ellipse
            cx={W / 2}
            cy={-2}
            rx={50}
            ry={18}
            fill="url(#mri-glow-top)"
            opacity="0.6"
          />

          {/* 5 trapezoids from top (idx 0) → base (idx 4) */}
          {tiers.map((t, idx) => {
            // top of tier
            const yTop = idx * tierH;
            const yBot = (idx + 1) * tierH;
            // width interpolation
            const topW = minW + ((maxW - minW) * idx) / 5;
            const botW = minW + ((maxW - minW) * (idx + 1)) / 5;
            const cx = W / 2;
            const topL = cx - topW / 2;
            const topR = cx + topW / 2;
            const botL = cx - botW / 2;
            const botR = cx + botW / 2;
            const path = `M ${topL} ${yTop} L ${topR} ${yTop} L ${botR} ${yBot} L ${botL} ${yBot} Z`;
            return (
              <g key={t.level}>
                <path
                  d={path}
                  fill={`url(#mri-grad-${t.level})`}
                  stroke={GOLD}
                  strokeWidth="1.3"
                  strokeOpacity={idx === 0 ? 0.9 : 0.55}
                />
                {/* Inner highlight line for 3D feel */}
                <line
                  x1={topL + 2}
                  y1={yTop + 1}
                  x2={topR - 2}
                  y2={yTop + 1}
                  stroke={GOLD_LIGHT}
                  strokeWidth="0.5"
                  strokeOpacity={0.5}
                />
              </g>
            );
          })}

          {/* Tier level number labels in middle of each tier */}
          {tiers.map((t, idx) => {
            const yMid = idx * tierH + tierH / 2;
            const labelFill = idx === 0 ? NAVY : "#fff";
            return (
              <g key={`label-${t.level}`}>
                <text
                  x={W / 2}
                  y={yMid - 3}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill={labelFill}
                  letterSpacing="1.5"
                  opacity={0.75}
                >
                  TẦNG {t.level}
                </text>
                <text
                  x={W / 2}
                  y={yMid + 9}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="900"
                  fill={labelFill}
                  fontFamily="'Playfair Display', Georgia, serif"
                >
                  {t.score > 0 ? `${t.score}/100` : ""}
                </text>
              </g>
            );
          })}
        </svg>

        {/* RIGHT side labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: 10,
            height: H,
          }}
        >
          {tiers
            .filter((t) => t.align === "right")
            .map((t) => (
              <PyramidTagRight key={t.level} tier={t} />
            ))}
        </div>
      </div>

      {/* Bottom caption */}
      <div
        style={{
          marginTop: 24,
          padding: "14px 22px",
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
          color: "#fff",
          borderRadius: 12,
          textAlign: "center",
          fontSize: 12.5,
          lineHeight: 1.6,
          border: `1px solid ${GOLD}66`,
          boxShadow: `0 6px 20px ${NAVY}33`,
        }}
      >
        <strong style={{ color: GOLD_LIGHT }}>Điểm nghẽn của bạn</strong> đang
        nằm ở tầng nào?{" "}
        <strong>Hành vi tài chính quyết định kết quả tài chính.</strong>
      </div>
    </div>
  );
}

interface MRITier {
  level: number;
  title: string;
  subtitle: string;
  desc: string;
  score: number;        // -1 nếu không phải numeric (tier 4)
  scoreText: string;    // "65/100" hoặc personality label
  verdict: { label: string; color: string };
  color: string;
  align: "left" | "right";
}

function PyramidTagLeft({ tier }: { tier: MRITier }) {
  return <PyramidTagBody tier={tier} align="left" />;
}

function PyramidTagRight({ tier }: { tier: MRITier }) {
  return <PyramidTagBody tier={tier} align="right" />;
}

function PyramidTagBody({
  tier,
  align,
}: {
  tier: MRITier;
  align: "left" | "right";
}) {
  const isLeft = align === "left";
  return (
    <div
      style={{
        position: "relative",
        padding: "10px 14px",
        background: isLeft
          ? `linear-gradient(90deg, ${NAVY_DARK}, ${NAVY})`
          : `linear-gradient(270deg, ${NAVY_DARK}, ${NAVY})`,
        borderRadius: isLeft ? "10px 0 0 10px" : "0 10px 10px 0",
        borderRight: isLeft ? `4px solid ${tier.color}` : undefined,
        borderLeft: !isLeft ? `4px solid ${tier.color}` : undefined,
        boxShadow: `0 4px 14px ${NAVY}22`,
        color: "#fff",
        textAlign: isLeft ? "right" : "left",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: GOLD_LIGHT,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        }}
      >
        Tầng {tier.level} · {tier.subtitle}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: GOLD_LIGHT,
          marginTop: 2,
          letterSpacing: 0.3,
        }}
      >
        {tier.title}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: "#cdd3df",
          marginTop: 3,
          lineHeight: 1.45,
        }}
      >
        {tier.desc}
      </div>
      {/* Score + verdict pill row */}
      <div
        style={{
          marginTop: 6,
          display: "flex",
          gap: 6,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: isLeft ? "flex-end" : "flex-start",
        }}
      >
        {/* Score badge */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "#fff",
            background: `${tier.verdict.color}33`,
            border: `1px solid ${tier.verdict.color}77`,
            padding: "2px 8px",
            borderRadius: 999,
            fontFamily: SERIF,
            letterSpacing: 0.3,
          }}
        >
          {tier.scoreText}
        </span>
        {/* Verdict pill */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: tier.verdict.color,
            background: "rgba(255,255,255,0.08)",
            border: `1px solid ${tier.verdict.color}55`,
            padding: "2px 7px",
            borderRadius: 999,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          ● {tier.verdict.label}
        </span>
      </div>
    </div>
  );
}

// Shade helper: positive = lighter, negative = darker
function shade(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return (
    "#" +
    ((r << 16) | (g << 8) | b)
      .toString(16)
      .padStart(6, "0")
  );
}

/* ─────────────────────────────────────────────
 *  WealthScoreScale — 6 cấp độ + location pin
 * ───────────────────────────────────────────── */

const WEALTH_TIERS = [
  { label: "Financial Victim",       short: "Victim",       range: "0-20",   from: 0,   to: 20,  color: "#C33232" },
  { label: "Financial Survivor",     short: "Survivor",     range: "21-40",  from: 21,  to: 40,  color: "#E5715D" },
  { label: "Financial Struggler",    short: "Struggler",    range: "41-60",  from: 41,  to: 60,  color: "#E5B547" },
  { label: "Financial Builder",      short: "Builder",      range: "61-80",  from: 61,  to: 80,  color: "#7CB342" },
  { label: "Financial Wealth Creator", short: "Wealth Creator", range: "81-90", from: 81, to: 90, color: "#388E3C" },
  { label: "Financial Freedom Architect", short: "Freedom Architect", range: "91-100", from: 91, to: 100, color: "#0F5C36" },
];

function WealthScoreScale({ value, tier }: { value: number; tier: string }) {
  const score = Math.max(0, Math.min(100, value));
  // Each segment is 100/6 of the bar
  // Map score 0-100 → position 0-100% across the bar
  const pinPct = score; // 1:1 mapping

  // Current segment for highlight
  const currentIdx = WEALTH_TIERS.findIndex(
    (t) => score >= t.from && score <= t.to
  );

  return (
    <div style={{ marginTop: 28, marginBottom: 28 }}>
      {/* Score bubble above pin */}
      <div
        style={{
          position: "relative",
          height: 70,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${pinPct}%`,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            top: 0,
          }}
        >
          {/* Bubble */}
          <div
            style={{
              padding: "8px 18px",
              background: `linear-gradient(135deg, ${NAVY_DARK}, ${NAVY})`,
              color: "#fff",
              borderRadius: 999,
              border: `2px solid ${GOLD}`,
              boxShadow: `0 6px 18px ${NAVY}55, 0 0 16px ${GOLD}44`,
              fontSize: 14,
              fontWeight: 900,
              fontFamily: SERIF,
              letterSpacing: 0.3,
              whiteSpace: "nowrap",
              position: "relative",
            }}
          >
            <span style={{ color: GOLD_LIGHT }}>{score}</span>
            <span style={{ color: "#cdd3df", margin: "0 4px" }}>/</span>
            <span style={{ color: "#cdd3df" }}>100</span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: GOLD_LIGHT,
                marginLeft: 8,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Điểm hiện tại
            </span>
          </div>
          {/* Arrow down */}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: `10px solid ${GOLD}`,
              filter: `drop-shadow(0 2px 4px ${NAVY}44)`,
              marginTop: -2,
            }}
          />
          {/* Pin dot on the bar */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: `radial-gradient(circle, #fff, ${GOLD})`,
              border: `2px solid ${NAVY}`,
              boxShadow: `0 0 12px ${GOLD}, 0 4px 8px ${NAVY}55`,
              marginTop: 4,
            }}
          />
        </div>
      </div>

      {/* 6-segment bar */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 38,
          borderRadius: 8,
          overflow: "hidden",
          border: `1.5px solid ${NAVY}33`,
          boxShadow: `inset 0 2px 6px ${NAVY}22`,
        }}
      >
        {WEALTH_TIERS.map((t, i) => {
          const width = ((t.to - t.from + 1) / 101) * 100;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={i}
              style={{
                flexBasis: `${width}%`,
                background: isCurrent
                  ? `linear-gradient(180deg, ${t.color}, ${shade(t.color, -30)})`
                  : `linear-gradient(180deg, ${t.color}, ${shade(t.color, -15)})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 11,
                fontWeight: 800,
                position: "relative",
                opacity: isCurrent ? 1 : 0.92,
                boxShadow: isCurrent
                  ? `inset 0 0 14px rgba(255,255,255,0.3)`
                  : "none",
              }}
            >
              {t.range}
            </div>
          );
        })}
      </div>

      {/* Labels below */}
      <div
        style={{
          display: "flex",
          width: "100%",
          marginTop: 8,
        }}
      >
        {WEALTH_TIERS.map((t, i) => {
          const width = ((t.to - t.from + 1) / 101) * 100;
          const isCurrent = i === currentIdx;
          return (
            <div
              key={i}
              style={{
                flexBasis: `${width}%`,
                textAlign: "center",
                padding: "0 4px",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: t.color,
                  letterSpacing: 0.4,
                  marginBottom: 2,
                }}
              >
                {t.range}
              </div>
              <div
                style={{
                  fontSize: isCurrent ? 11 : 10,
                  fontWeight: isCurrent ? 900 : 700,
                  color: isCurrent ? t.color : TEXT_BODY,
                  lineHeight: 1.2,
                  fontFamily: isCurrent ? SERIF : undefined,
                }}
              >
                {t.short}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tier badge */}
      <div
        style={{
          marginTop: 24,
          textAlign: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${WEALTH_TIERS[Math.max(0, currentIdx)]?.color ?? NAVY}, ${shade(WEALTH_TIERS[Math.max(0, currentIdx)]?.color ?? NAVY, -25)})`,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 0.4,
            boxShadow: `0 6px 18px ${(WEALTH_TIERS[Math.max(0, currentIdx)]?.color ?? NAVY)}55`,
          }}
        >
          <span style={{ fontSize: 9, opacity: 0.85, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Cấp độ hiện tại
          </span>
          <strong>{tier}</strong>
        </span>
      </div>
    </div>
  );
}

function AIDiagnosisBox({ text }: { text: string }) {
  return (
    <div
      style={{
        marginTop: 28,
        padding: "18px 22px",
        background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
        border: `1.5px solid ${GOLD}77`,
        borderRadius: 12,
        color: "#fff",
        boxShadow: `0 8px 24px ${NAVY}33`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gold lines */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${GOLD}, transparent, ${GOLD})`,
        }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: GOLD_LIGHT,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 8,
          textAlign: "center",
          fontFamily: SERIF,
        }}
      >
        ✦ AI Financial Diagnosis ✦
      </div>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.75,
          color: "#e5e7eb",
          margin: 0,
          textAlign: "center",
          maxWidth: 720,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  PremiumLoveGauge — Chỉ số Yêu Tiền (semi-circle với needle)
 * ───────────────────────────────────────────── */

function PremiumLoveGauge({
  value,
  max,
  tier,
}: {
  value: number;
  max: number;
  tier: { tier: 1 | 2 | 3; label: string; desc: string };
}) {
  const score = Math.max(0, Math.min(max, value));
  // Map score → angle (-90deg = left/0, 90deg = right/max)
  const pct = score / max;
  const angle = -90 + pct * 180; // -90 to +90

  // Gauge dimensions
  const W = 320;
  const H = 210;
  const cx = W / 2;
  const cy = H - 28;
  const r = 120;
  const stroke = 26;

  // Tier zones
  // tier 1 = 0-10/38 (≈26%), tier 2 = 11-30/38 (≈79%), tier 3 = 31-38/38
  const zones = [
    { from: 0, to: 10 / 38, color: DANGER, label: "Bất hòa" },
    { from: 10 / 38, to: 30 / 38, color: WARNING, label: "Đang vun đắp" },
    { from: 30 / 38, to: 1, color: SUCCESS, label: "Gắn bó tốt" },
  ];

  const tierColor =
    tier.tier === 1 ? DANGER : tier.tier === 2 ? WARNING : SUCCESS;

  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ maxWidth: W, display: "block", margin: "0 auto" }}
      >
        {/* Zones */}
        {zones.map((z, i) => {
          const startAngle = -Math.PI + z.from * Math.PI;
          const endAngle = -Math.PI + z.to * Math.PI;
          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);
          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={z.color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                opacity={0.92}
              />
              {/* Zone label */}
              {(() => {
                const midA = (startAngle + endAngle) / 2;
                const lx = cx + (r - 12) * Math.cos(midA);
                const ly = cy + (r - 12) * Math.sin(midA);
                return (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill="#fff"
                    transform={`rotate(${(midA * 180) / Math.PI + 90} ${lx} ${ly})`}
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                    }}
                  >
                    {z.label}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Tick marks at 0, 11, 30, 38 */}
        {[0, 10 / 38, 30 / 38, 1].map((p, i) => {
          const a = -Math.PI + p * Math.PI;
          const x1 = cx + (r - stroke / 2 - 4) * Math.cos(a);
          const y1 = cy + (r - stroke / 2 - 4) * Math.sin(a);
          const x2 = cx + (r + stroke / 2 + 4) * Math.cos(a);
          const y2 = cy + (r + stroke / 2 + 4) * Math.sin(a);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={NAVY}
              strokeWidth="1.5"
            />
          );
        })}

        {/* Tick values */}
        {[
          { p: 0, label: "0" },
          { p: 10 / 38, label: "11" },
          { p: 30 / 38, label: "30" },
          { p: 1, label: "38" },
        ].map((tk, i) => {
          const a = -Math.PI + tk.p * Math.PI;
          const lx = cx + (r + stroke / 2 + 16) * Math.cos(a);
          const ly = cy + (r + stroke / 2 + 16) * Math.sin(a);
          return (
            <text
              key={i}
              x={lx}
              y={ly + 3}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill={NAVY}
            >
              {tk.label}
            </text>
          );
        })}

        {/* Needle */}
        <g transform={`rotate(${angle} ${cx} ${cy})`}>
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 6}
            stroke={NAVY_DARK}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Diamond tip */}
          <polygon
            points={`${cx},${cy - r + 4} ${cx - 5},${cy - r + 16} ${cx},${cy - r + 28} ${cx + 5},${cy - r + 16}`}
            fill={GOLD}
            stroke={NAVY}
            strokeWidth="1"
          />
        </g>
        {/* Hub */}
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill={`url(#hub-grad)`}
          stroke={NAVY}
          strokeWidth="2"
        />
        <circle cx={cx} cy={cy} r={5} fill={NAVY} />
        <defs>
          <radialGradient id="hub-grad">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="100%" stopColor={GOLD_DARK} />
          </radialGradient>
        </defs>

        {/* Score value below hub */}
        <text
          x={cx}
          y={cy + 32}
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill={tierColor}
          fontFamily="'Playfair Display', Georgia, serif"
        >
          {score}
        </text>
      </svg>

      {/* Conclusion */}
      <div
        style={{
          marginTop: 12,
          padding: "12px 16px",
          background: `linear-gradient(135deg, ${tierColor}11, transparent)`,
          border: `1.5px solid ${tierColor}55`,
          borderLeft: `4px solid ${tierColor}`,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: tierColor,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Kết luận
        </div>
        <div style={{ fontSize: 13, color: NAVY, fontWeight: 700 }}>
          {tier.label}
        </div>
        <p
          style={{
            fontSize: 11.5,
            color: TEXT_BODY,
            lineHeight: 1.55,
            margin: "4px 0 0",
          }}
        >
          {tier.desc}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  BeliefAnchorVisual — Anchor + Arrow rising
 * ───────────────────────────────────────────── */

function BeliefAnchorVisual({ avg }: { avg: number }) {
  // avg 0-10. Higher avg = heavier belief load → anchor stronger
  const intensity = Math.min(1, avg / 10);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 14,
        position: "relative",
      }}
    >
      <svg width="120" height="100" viewBox="0 0 120 100">
        <defs>
          <linearGradient id="anchor-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="100%" stopColor={GOLD_DARK} />
          </linearGradient>
          <linearGradient id="arrow-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={GOLD_DARK} />
            <stop offset="100%" stopColor={GOLD_LIGHT} />
          </linearGradient>
        </defs>

        {/* Anchor (left side, weighing down) */}
        <g
          transform="translate(28, 30)"
          opacity={0.4 + intensity * 0.6}
        >
          {/* Top ring */}
          <circle
            cx="20"
            cy="6"
            r="4"
            fill="none"
            stroke={NAVY}
            strokeWidth="2.5"
          />
          {/* Vertical shaft */}
          <line
            x1="20"
            y1="10"
            x2="20"
            y2="48"
            stroke={NAVY}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Horizontal arm */}
          <line
            x1="8"
            y1="22"
            x2="32"
            y2="22"
            stroke={NAVY}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Curved arms */}
          <path
            d="M 6 44 Q 6 56 20 56 Q 34 56 34 44"
            fill="none"
            stroke={NAVY}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Chain decorations */}
          <circle cx="20" cy="0" r="2" fill={NAVY} />
        </g>

        {/* Rising arrow (right side, growth) */}
        <g transform="translate(70, 20)">
          {/* Arrow shaft */}
          <path
            d="M 4 60 Q 12 30 24 24"
            fill="none"
            stroke="url(#arrow-grad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <polygon
            points="20,15 32,22 24,30"
            fill={GOLD_LIGHT}
            stroke={GOLD_DARK}
            strokeWidth="1"
          />
        </g>

        {/* Caption */}
        <text
          x="60"
          y="95"
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill={TEXT_MUTED}
          letterSpacing="1"
        >
          ⚓ KÌM HÃM ↔ TĂNG TRƯỞNG ↗
        </text>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  MindsetTriangle — 3 vertex circles + wireframe + center cluster
 * ───────────────────────────────────────────── */

function MindsetTriangle({
  wealthScore,
  tier,
}: {
  wealthScore: number;
  tier: string;
}) {
  // SVG geometry — equilateral triangle, balanced
  const W = 760;
  const H = 540;
  // Triangle vertices — equilateral hơn
  const apex = { x: W / 2, y: 70 };
  const leftV = { x: 130, y: 440 };
  const rightV = { x: W - 130, y: 440 };
  // Center of mass (centroid của tam giác đều)
  const cmX = (apex.x + leftV.x + rightV.x) / 3;
  const cmY = (apex.y + leftV.y + rightV.y) / 3;

  const PILLAR1_COLOR = NAVY; // Money Personality
  const PILLAR2_COLOR = GOLD_DARK; // Love for Money
  const PILLAR3_COLOR = "#4a4a4a"; // Wealth Beliefs

  const cornerR = 40; // radius of vertex circles (giảm từ 56 → 40)

  return (
    <div style={{ marginTop: 14, maxWidth: 760, margin: "14px auto 0" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{
          width: "100%",
          maxWidth: W,
          margin: "0 auto",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Vertex circle gradients (3D look) */}
          <radialGradient id="grad-personality" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#3b5982" />
            <stop offset="50%" stopColor={PILLAR1_COLOR} />
            <stop offset="100%" stopColor={NAVY_DARK} />
          </radialGradient>
          <radialGradient id="grad-love" cx="35%" cy="30%">
            <stop offset="0%" stopColor={GOLD_LIGHT} />
            <stop offset="50%" stopColor={GOLD} />
            <stop offset="100%" stopColor={GOLD_DARK} />
          </radialGradient>
          <radialGradient id="grad-beliefs" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#7c7c7c" />
            <stop offset="50%" stopColor={PILLAR3_COLOR} />
            <stop offset="100%" stopColor="#1f1f1f" />
          </radialGradient>
          <radialGradient id="grad-center" cx="50%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={CREAM} />
          </radialGradient>
          <radialGradient id="grad-score" cx="50%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={CREAM} />
          </radialGradient>
          <filter id="circle-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* TRIANGLE WIREFRAME — 3 connection lines */}
        {/* Apex → Left */}
        <line
          x1={apex.x - 30}
          y1={apex.y + 35}
          x2={leftV.x + 35}
          y2={leftV.y - 25}
          stroke={NAVY_LIGHT}
          strokeWidth="2.5"
          opacity="0.6"
        />
        {/* Apex → Right */}
        <line
          x1={apex.x + 30}
          y1={apex.y + 35}
          x2={rightV.x - 35}
          y2={rightV.y - 25}
          stroke={NAVY_LIGHT}
          strokeWidth="2.5"
          opacity="0.6"
        />
        {/* Left → Right (base) */}
        <line
          x1={leftV.x + 50}
          y1={leftV.y}
          x2={rightV.x - 50}
          y2={rightV.y}
          stroke={NAVY_LIGHT}
          strokeWidth="2.5"
          opacity="0.6"
        />

        {/* Inner triangle wireframe (depth) */}
        <polygon
          points={`${apex.x},${apex.y + 90} ${leftV.x + 80},${leftV.y - 50} ${rightV.x - 80},${rightV.y - 50}`}
          fill="none"
          stroke={`${NAVY_LIGHT}55`}
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        {/* Lines from each corner toward center */}
        <line x1={apex.x} y1={apex.y + 35} x2={cmX} y2={cmY - 40} stroke={`${GOLD}77`} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1={leftV.x + 30} y1={leftV.y - 20} x2={cmX - 40} y2={cmY + 20} stroke={`${GOLD}77`} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
        <line x1={rightV.x - 30} y1={rightV.y - 20} x2={cmX + 40} y2={cmY + 20} stroke={`${GOLD}77`} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        {/* ─── 3 VERTEX CIRCLES with icons ─── */}

        {/* APEX: Trụ cột 1 — Money Personality (Brain head + gears) */}
        <g filter="url(#circle-shadow)">
          <circle
            cx={apex.x}
            cy={apex.y}
            r={cornerR}
            fill="url(#grad-personality)"
            stroke="#fff"
            strokeWidth="4"
          />
          {/* Icon: simplified head profile with gear */}
          <PersonalityIcon cx={apex.x} cy={apex.y} size={42} />
        </g>

        {/* LEFT BOTTOM: Trụ cột 2 — Love for Money */}
        <g filter="url(#circle-shadow)">
          <circle
            cx={leftV.x}
            cy={leftV.y}
            r={cornerR}
            fill="url(#grad-love)"
            stroke="#fff"
            strokeWidth="4"
          />
          <LoveIcon cx={leftV.x} cy={leftV.y} size={40} />
        </g>

        {/* RIGHT BOTTOM: Trụ cột 3 — Wealth Beliefs */}
        <g filter="url(#circle-shadow)">
          <circle
            cx={rightV.x}
            cy={rightV.y}
            r={cornerR}
            fill="url(#grad-beliefs)"
            stroke="#fff"
            strokeWidth="4"
          />
          <BeliefsIcon cx={rightV.x} cy={rightV.y} size={40} />
        </g>

        {/* ─── CENTER CLUSTER ─── */}
        {/* Main "Hành Vi Tài Chính" */}
        <g filter="url(#circle-shadow)">
          <circle
            cx={cmX}
            cy={cmY + 20}
            r={62}
            fill="url(#grad-center)"
            stroke={NAVY}
            strokeWidth="2"
          />
        </g>
        <text x={cmX} y={cmY + 6} textAnchor="middle" fontSize="14" fontWeight="900" fill={NAVY} fontFamily="'Playfair Display', Georgia, serif">
          Hành Vi
        </text>
        <text x={cmX} y={cmY + 24} textAnchor="middle" fontSize="14" fontWeight="900" fill={NAVY} fontFamily="'Playfair Display', Georgia, serif">
          Tài Chính
        </text>
        <text x={cmX} y={cmY + 42} textAnchor="middle" fontSize="8" fontWeight="700" fill={TEXT_MUTED} fontStyle="italic" letterSpacing="0.5">
          (Financial Behavior)
        </text>

        {/* Wealth Score small badge offset top-right of center */}
        <g filter="url(#circle-shadow)">
          <circle
            cx={cmX + 100}
            cy={cmY - 40}
            r={32}
            fill="url(#grad-score)"
            stroke={GOLD}
            strokeWidth="2"
          />
        </g>
        <text x={cmX + 100} y={cmY - 46} textAnchor="middle" fontSize="7" fontWeight="800" fill={GOLD_DARK} letterSpacing="1.2">
          WEALTH SCORE™
        </text>
        <text x={cmX + 100} y={cmY - 28} textAnchor="middle" fontSize="17" fontWeight="900" fill={NAVY} fontFamily="'Playfair Display', Georgia, serif">
          {wealthScore}
        </text>
        <text x={cmX + 100} y={cmY - 16} textAnchor="middle" fontSize="7" fill={TEXT_MUTED} fontWeight="600">
          /100
        </text>
      </svg>

      {/* ─── SIDE DESCRIPTION PANELS ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 14,
          marginTop: 32,
        }}
      >
        <PillarPanel
          number={1}
          color={PILLAR1_COLOR}
          title="Trụ cột 1: Bức Tranh Tính Cách"
          alias="Money Personality"
          desc="Bao gồm 7 khuynh hướng hành vi tự nhiên quyết định cách bạn phản ứng với tiền hàng ngày."
        />
        <PillarPanel
          number={2}
          color={PILLAR2_COLOR}
          title="Trụ cột 2: Chỉ Số Cảm Xúc"
          alias="Love for Money"
          desc="Thước đo mức độ hòa hợp và trạng thái cảm xúc trong mối quan hệ giữa bạn và đồng tiền."
        />
        <PillarPanel
          number={3}
          color={PILLAR3_COLOR}
          title="Trụ cột 3: Tải Trọng Niềm Tin"
          alias="Wealth Beliefs"
          desc="Xác định các rào cản vô hình và niềm tin giới hạn đang kìm hãm sự phát triển tài sản."
        />
      </div>

      {/* Center caption explaining outcome */}
      <div
        style={{
          marginTop: 16,
          padding: "14px 22px",
          background: `linear-gradient(135deg, ${CREAM_LIGHT}, ${CREAM})`,
          border: `1px solid ${GOLD}44`,
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: GOLD_DARK,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Trung tâm — Hành Vi Tài Chính
        </div>
        <p
          style={{
            fontSize: 12,
            color: TEXT_BODY,
            margin: 0,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          Đây là kết quả cuối cùng được thể hiện ra bên ngoài dựa trên sự tác
          động của 3 trụ cột tâm thức. Tổng điểm{" "}
          <strong style={{ color: NAVY }}>Wealth Score™ {wealthScore}/100</strong>{" "}
          —{" "}
          <strong style={{ color: GOLD_DARK }}>{tier}</strong>.
        </p>
      </div>
    </div>
  );
}

/* ─── Icon helpers (inline SVG) ─── */
function PersonalityIcon({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s})`}>
      {/* Brain shape */}
      <path
        d={`M${s * 0.3},${s * 0.5} Q${s * 0.1},${s * 0.85} ${s * 0.45},${s * 1.15} Q${s * 0.5},${s * 1.5} ${s * 0.75},${s * 1.5} L${s * 1.05},${s * 1.5} Q${s * 1.45},${s * 1.5} ${s * 1.55},${s * 1.15} Q${s * 1.85},${s * 0.85} ${s * 1.55},${s * 0.45} Q${s * 1.35},${s * 0.15} ${s * 0.95},${s * 0.25} Q${s * 0.55},${s * 0.25} ${s * 0.3},${s * 0.5} Z`}
        fill="#fff"
        opacity="0.95"
      />
      {/* Gear (small) on the right */}
      <circle cx={s * 1.55} cy={s * 0.95} r={s * 0.32} fill="#fff" opacity="0.9" />
      <circle cx={s * 1.55} cy={s * 0.95} r={s * 0.18} fill={NAVY} />
      {/* Tiny dots */}
      <circle cx={s * 0.7} cy={s * 0.7} r={s * 0.08} fill={NAVY} />
      <circle cx={s * 1.0} cy={s * 0.95} r={s * 0.08} fill={NAVY} />
    </g>
  );
}

function LoveIcon({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s})`}>
      {/* Heart */}
      <path
        d={`M${s},${s * 1.55} Q${s * 0.2},${s * 1.05} ${s * 0.35},${s * 0.6} Q${s * 0.5},${s * 0.25} ${s},${s * 0.7} Q${s * 1.5},${s * 0.25} ${s * 1.65},${s * 0.6} Q${s * 1.8},${s * 1.05} ${s},${s * 1.55} Z`}
        fill="#fff"
        opacity="0.95"
      />
      {/* Euro / currency symbol in center */}
      <text
        x={s}
        y={s * 1.05}
        textAnchor="middle"
        fontSize={s * 0.65}
        fontWeight="900"
        fill={GOLD_DARK}
        fontFamily="serif"
      >
        €
      </text>
    </g>
  );
}

function BeliefsIcon({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const s = size / 2;
  return (
    <g transform={`translate(${cx - s}, ${cy - s})`}>
      {/* Scale top horizontal beam */}
      <line x1={s * 0.3} y1={s * 0.5} x2={s * 1.7} y2={s * 0.5} stroke="#fff" strokeWidth="2" />
      {/* Center post */}
      <line x1={s} y1={s * 0.5} x2={s} y2={s * 1.5} stroke="#fff" strokeWidth="2" />
      {/* Base */}
      <line x1={s * 0.7} y1={s * 1.5} x2={s * 1.3} y2={s * 1.5} stroke="#fff" strokeWidth="2" />
      {/* Top ball */}
      <circle cx={s} cy={s * 0.4} r={s * 0.12} fill="#fff" />
      {/* Left pan */}
      <path d={`M${s * 0.3},${s * 0.5} L${s * 0.15},${s * 0.85} L${s * 0.45},${s * 0.85} Z`} fill="#fff" opacity="0.9" />
      {/* Right pan */}
      <path d={`M${s * 1.7},${s * 0.5} L${s * 1.55},${s * 0.85} L${s * 1.85},${s * 0.85} Z`} fill="#fff" opacity="0.9" />
      {/* Anchor below scale */}
      <circle cx={s} cy={s * 1.18} r={s * 0.07} fill="#fff" />
      <path d={`M${s},${s * 1.25} L${s},${s * 1.55} M${s * 0.78},${s * 1.4} L${s * 1.22},${s * 1.4}`} stroke="#fff" strokeWidth="1.5" fill="none" />
    </g>
  );
}

function PillarPanel({
  number,
  color,
  title,
  alias,
  desc,
}: {
  number: number;
  color: string;
  title: string;
  alias: string;
  desc: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: "#fff",
        border: `1.5px solid ${color}44`,
        borderTop: `4px solid ${color}`,
        borderRadius: 10,
        boxShadow: `0 4px 14px ${color}11`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: color,
            color: "#fff",
            fontSize: 13,
            fontWeight: 900,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {number}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 13.5,
              fontWeight: 800,
              color: NAVY,
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 10,
              color: TEXT_MUTED,
              fontStyle: "italic",
              marginTop: 1,
            }}
          >
            {alias}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11.5, color: TEXT_BODY, lineHeight: 1.5, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  IncomeAnalysisReport — Phân tích thu nhập (light theme)
 * ───────────────────────────────────────────── */

function IncomeAnalysisReport({ result }: { result: IncomeAnalysisResult }) {
  const hasData = result.total > 0;
  if (!hasData) {
    return (
      <NotCompletedNote message="Học viên chưa nhập thông tin thu nhập. Quay lại Blueprint Phần IV → Cân Đối Thu Chi để cập nhật." />
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* HERO — Tổng + tier + score ring */}
      <div
        style={{
          padding: 22,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${result.tierColor}11, ${CREAM_LIGHT})`,
          border: `1.5px solid ${result.tierColor}55`,
          boxShadow: `0 6px 20px ${result.tierColor}22`,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${result.tierColor}44, ${result.tierColor}11)`,
                border: `1.5px solid ${result.tierColor}77`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              {result.tierEmoji}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: GOLD_DARK,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Tổng thu nhập /tháng
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 26,
                  fontWeight: 900,
                  color: NAVY,
                  lineHeight: 1.1,
                }}
              >
                {fmtVNDLocal(result.total)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: result.tierColor,
                  fontWeight: 700,
                  fontStyle: "italic",
                  marginTop: 2,
                }}
              >
                {result.tierLabel}
              </div>
            </div>
          </div>
          {/* 3 ratio pills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <RatioPillReport label="Lương" pct={result.salaryPct} color={SUCCESS} />
            <RatioPillReport label="Kinh doanh" pct={result.businessPct} color={GOLD_DARK} />
            <RatioPillReport label="Thụ động" pct={result.passivePct} color="#8b5cf6" />
          </div>
        </div>
        {/* Score badge */}
        <ScoreCircleReport score={result.score} max={10} color={result.tierColor} />
      </div>

      {/* TỶ TRỌNG bar + LEGEND */}
      <div
        style={{
          marginTop: 14,
          padding: 18,
          background: "#fff",
          borderRadius: 12,
          border: `1px solid ${NAVY}11`,
        }}
      >
        <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 12px" }}>
          Tỷ trọng 3 nhóm thu nhập
        </h4>
        <RatioBarReport
          salary={result.totalSalary}
          business={result.totalBusiness}
          passive={result.totalPassive}
          total={result.total}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 12 }}>
          <RatioLegendReport
            color={SUCCESS}
            label="Lương"
            amount={result.totalSalary}
            pct={result.salaryPct}
          />
          <RatioLegendReport
            color={GOLD_DARK}
            label="Kinh doanh"
            amount={result.totalBusiness}
            pct={result.businessPct}
          />
          <RatioLegendReport
            color="#8b5cf6"
            label="Thụ động"
            amount={result.totalPassive}
            pct={result.passivePct}
          />
          {result.otherIncome > 0 && (
            <RatioLegendReport
              color={NAVY_LIGHT}
              label="Khác"
              amount={result.otherIncome}
              pct={result.otherPct}
            />
          )}
        </div>
      </div>

      {/* 5 TIÊU CHÍ */}
      <div
        style={{
          marginTop: 14,
          padding: 18,
          background: "#fff",
          borderRadius: 12,
          border: `1px solid ${NAVY}11`,
        }}
      >
        <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 12px" }}>
          Khung 5 tiêu chí · {result.score}/10 điểm
        </h4>
        <div style={{ display: "grid", gap: 8 }}>
          {result.criteria.map((c, i) => (
            <CriterionRowReport key={i} criterion={c} />
          ))}
        </div>
      </div>

      {/* 3 CARDS — Praise / Warning / Advice */}
      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        <FeedbackCardReport
          label="Lời tán dương"
          color={SUCCESS}
          icon="🏆"
          text={result.praise}
        />
        <FeedbackCardReport
          label="Cảnh báo"
          color={WARNING}
          icon="⚠️"
          text={result.warning}
        />
        <FeedbackCardReport
          label="Lời khuyên"
          color={GOLD_DARK}
          icon="💡"
          text={result.advice}
        />
      </div>

      {/* Kết luận */}
      <div
        style={{
          marginTop: 16,
          padding: 18,
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
          borderRadius: 12,
          color: "#fff",
          border: `1px solid ${GOLD}66`,
          boxShadow: `0 6px 18px ${NAVY}33`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: GOLD_LIGHT,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            marginBottom: 8,
            textAlign: "center",
            fontFamily: SERIF,
          }}
        >
          ✦ Kết luận ✦
        </div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.75,
            color: "#e5e7eb",
            margin: 0,
            textAlign: "center",
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {result.conclusion}
        </p>
      </div>
    </div>
  );
}

function RatioPillReport({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div
      style={{
        padding: "8px 10px",
        background: `${color}11`,
        border: `1px solid ${color}44`,
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1.2, marginTop: 2 }}>
        {pct}%
      </div>
    </div>
  );
}

function ScoreCircleReport({
  score,
  max,
  color,
}: {
  score: number;
  max: number;
  color: string;
}) {
  const size = 100;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const filled = ((score / max) * 100 * circ) / 100;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`${NAVY}15`} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 8, fontWeight: 800, color: TEXT_MUTED, letterSpacing: 1.5 }}>
          ĐIỂM
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 26,
            fontWeight: 900,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: 9, color: TEXT_MUTED, marginTop: 1 }}>/ {max}</div>
      </div>
    </div>
  );
}

function RatioBarReport({
  salary,
  business,
  passive,
  total,
}: {
  salary: number;
  business: number;
  passive: number;
  total: number;
}) {
  if (total === 0)
    return <div style={{ height: 12, background: `${NAVY}11`, borderRadius: 6 }} />;
  const sP = (salary / total) * 100;
  const bP = (business / total) * 100;
  const pP = (passive / total) * 100;
  return (
    <div
      style={{
        height: 14,
        background: `${NAVY}11`,
        borderRadius: 7,
        overflow: "hidden",
        display: "flex",
      }}
    >
      {sP > 0 && (
        <div
          style={{ width: `${sP}%`, background: `linear-gradient(90deg, ${SUCCESS}cc, ${SUCCESS})` }}
        />
      )}
      {bP > 0 && (
        <div
          style={{
            width: `${bP}%`,
            background: `linear-gradient(90deg, ${GOLD_DARK}cc, ${GOLD_DARK})`,
          }}
        />
      )}
      {pP > 0 && (
        <div
          style={{ width: `${pP}%`, background: `linear-gradient(90deg, #8b5cf6cc, #8b5cf6)` }}
        />
      )}
    </div>
  );
}

function RatioLegendReport({
  color,
  label,
  amount,
  pct,
}: {
  color: string;
  label: string;
  amount: number;
  pct: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
      <span
        style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }}
      />
      <span style={{ color: TEXT_BODY }}>{label}</span>
      <span style={{ color: NAVY, fontWeight: 700, marginLeft: "auto" }}>
        {fmtCompactLocal(amount)} <span style={{ color: TEXT_MUTED, fontWeight: 500 }}>· {pct}%</span>
      </span>
    </div>
  );
}

function CriterionRowReport({ criterion }: { criterion: IncomeCriterion }) {
  const c =
    criterion.score === 2 ? SUCCESS : criterion.score === 1 ? WARNING : DANGER;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        padding: "14px 18px",
        background: `linear-gradient(135deg, ${c}10, ${c}05 50%, transparent 100%), #fff`,
        border: `1px solid ${c}55`,
        borderLeft: `4px solid ${c}`,
        borderRadius: 10,
        boxShadow: `0 3px 10px ${c}15`,
        alignItems: "center",
      }}
    >
      {/* Big score badge */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${c}33, ${c}11)`,
          border: `1.5px solid ${c}77`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: c,
          fontFamily: SERIF,
          boxShadow: `0 3px 8px ${c}33, inset 0 1px 2px rgba(255,255,255,0.5)`,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>
          {criterion.score}
        </span>
        <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.7, letterSpacing: 0.5 }}>
          / 2 ĐIỂM
        </span>
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.2,
            marginBottom: 4,
            fontFamily: SERIF,
          }}
        >
          {criterion.label}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: TEXT_BODY,
            lineHeight: 1.5,
            fontStyle: criterion.score === 0 ? "italic" : "normal",
          }}
        >
          {criterion.reason}
        </div>
      </div>

      {/* Right side — 2 dots progress + verdict pill */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2].map((dot) => (
            <div
              key={dot}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  dot <= criterion.score
                    ? `radial-gradient(circle at 30% 30%, ${c}, ${shade(c, -25)})`
                    : `${c}22`,
                border: `1px solid ${c}77`,
                boxShadow:
                  dot <= criterion.score
                    ? `0 0 6px ${c}77, inset 0 1px 1px rgba(255,255,255,0.4)`
                    : "none",
              }}
            />
          ))}
        </div>
        {/* Verdict mini-pill */}
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 800,
            color: c,
            background: `${c}1a`,
            padding: "2px 8px",
            borderRadius: 999,
            textTransform: "uppercase",
            letterSpacing: 0.6,
            border: `1px solid ${c}44`,
            whiteSpace: "nowrap",
          }}
        >
          {criterion.score === 2 ? "✓ Đạt" : criterion.score === 1 ? "⚡ Cần cải thiện" : "⚠ Chưa đạt"}
        </span>
      </div>
    </div>
  );
}

function FeedbackCardReport({
  label,
  color,
  icon,
  text,
}: {
  label: string;
  color: string;
  icon: string;
  text: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: `linear-gradient(135deg, ${color}0d, transparent 70%), #fff`,
        border: `1px solid ${color}55`,
        borderRadius: 12,
        boxShadow: `0 4px 12px ${color}11`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color,
            letterSpacing: 1.3,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <p style={{ fontSize: 11.5, color: TEXT_BODY, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  NetWorthAnalysisReport — Phân tích tài sản + nợ + Net Worth (light theme)
 * ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
 *  SpendingAnalysisReport — Phân tích thực trạng chi tiêu (light theme)
 * ───────────────────────────────────────────── */

function SpendingAnalysisReport({
  cashflow,
}: {
  cashflow: CashflowData | undefined;
}) {
  const cf = cashflow ?? {};
  const sumNumbers = (o: object | undefined) =>
    Object.values(o ?? {}).reduce<number>(
      (s, v) => s + (typeof v === "number" ? v : 0),
      0
    );

  // Income total — dùng compute từ income-analysis logic
  const incTotal = (() => {
    const inc = cf.income ?? {};
    const salaryBase = inc.salaryBase ?? inc.personal ?? 0;
    const salary = salaryBase + (inc.salaryBonus ?? 0) + (inc.spouse ?? 0);
    const business = inc.businessProfit ?? 0;
    const newPassive =
      (inc.passiveRental ?? 0) +
      (inc.passiveInvestment ?? 0) +
      (inc.passiveRoyalty ?? 0);
    const passive = newPassive > 0 ? newPassive : inc.passive ?? 0;
    return salary + business + passive + (inc.other ?? 0);
  })();

  const fixedTotal = sumNumbers(cf.fixedCosts);
  const variableTotal = sumNumbers(cf.variableCosts);
  const savingsTotal = sumNumbers(cf.savings);
  const expenseTotal = fixedTotal + variableTotal;
  const emergencyFund = cf.savings?.emergencyFund ?? 0;
  const debt = cf.fixedCosts?.debt ?? 0;

  const savingRate =
    incTotal > 0 ? Math.round((savingsTotal / incTotal) * 100) : 0;
  const fixedRate =
    incTotal > 0 ? Math.round((fixedTotal / incTotal) * 100) : 0;
  const variableRate =
    incTotal > 0 ? Math.round((variableTotal / incTotal) * 100) : 0;
  const debtRate =
    incTotal > 0 ? Math.round((debt / incTotal) * 100) : 0;
  const emergencyRate =
    incTotal > 0 ? Math.round((emergencyFund / incTotal) * 100) : 0;
  const balance = incTotal - expenseTotal - savingsTotal;

  if (incTotal === 0 && expenseTotal === 0) {
    return (
      <NotCompletedNote message="Học viên chưa nhập thông tin thu chi. Quay lại Blueprint Phần IV → Cân Đối Thu Chi để cập nhật." />
    );
  }

  // ─── 5 tiêu chí scoring (× 2 = 10 điểm) ───
  type Criterion = { label: string; score: 0 | 1 | 2; reason: string };
  const criteria: Criterion[] = [];

  // 1. Tỉ lệ tiết kiệm
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa có tỉ lệ tiết kiệm";
    if (savingRate >= 20) {
      s = 2;
      reason = `Tiết kiệm ${savingRate}% — xuất sắc`;
    } else if (savingRate >= 10) {
      s = 1;
      reason = `Tiết kiệm ${savingRate}% — đạt tối thiểu`;
    } else if (savingRate > 0) {
      reason = `Chỉ ${savingRate}% — cần tăng lên ≥ 10%`;
    }
    criteria.push({ label: "Tỉ lệ tiết kiệm /thu nhập", score: s, reason });
  }

  // 2. Tỉ lệ chi cố định
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa có dữ liệu chi cố định";
    if (incTotal > 0) {
      if (fixedRate <= 50) {
        s = 2;
        reason = `Chi cố định ${fixedRate}% — kiểm soát tốt`;
      } else if (fixedRate <= 65) {
        s = 1;
        reason = `Chi cố định ${fixedRate}% — chấp nhận được`;
      } else {
        reason = `Chi cố định ${fixedRate}% — vượt ngưỡng 65%`;
      }
    }
    criteria.push({ label: "Tỉ lệ chi cố định", score: s, reason });
  }

  // 3. Quỹ dự phòng
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa có quỹ dự phòng đều";
    if (emergencyRate >= 10) {
      s = 2;
      reason = `Đóng ${emergencyRate}% /tháng vào quỹ DP — rất tốt`;
    } else if (emergencyRate >= 5) {
      s = 1;
      reason = `Đóng ${emergencyRate}% /tháng — cần tăng lên 10%`;
    } else if (emergencyRate > 0) {
      reason = `Chỉ ${emergencyRate}% /tháng vào quỹ DP`;
    }
    criteria.push({ label: "Đóng góp quỹ dự phòng", score: s, reason });
  }

  // 4. Tỉ lệ trả nợ
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Không có nợ định kỳ";
    if (debt === 0) {
      s = 2;
      reason = "Không có nợ định kỳ — an toàn";
    } else if (debtRate <= 25) {
      s = 2;
      reason = `Trả nợ ${debtRate}% — trong vùng an toàn`;
    } else if (debtRate <= 35) {
      s = 1;
      reason = `Trả nợ ${debtRate}% — cần kiểm soát`;
    } else {
      reason = `Trả nợ ${debtRate}% — vượt ngưỡng 35%`;
    }
    criteria.push({ label: "Tỉ lệ trả nợ /thu nhập", score: s, reason });
  }

  // 5. Cân đối dòng tiền
  {
    let s: 0 | 1 | 2 = 0;
    let reason = "Chưa cân đối được dòng tiền";
    if (balance > 0 && savingRate >= 10) {
      s = 2;
      reason = `Dư ${fmtCompactLocal(balance)} /tháng — dòng tiền lành mạnh`;
    } else if (balance >= 0) {
      s = 1;
      reason = "Cân bằng nhưng chưa tiết kiệm đủ";
    } else if (balance < 0) {
      reason = `Âm ${fmtCompactLocal(Math.abs(balance))} /tháng — đang chi vượt thu`;
    }
    criteria.push({ label: "Cân đối dòng tiền tháng", score: s, reason });
  }

  const totalScore = criteria.reduce((s, c) => s + c.score, 0);

  // Tier
  let tierColor: string;
  let tierLabel: string;
  let tierEmoji: string;
  if (totalScore >= 9) {
    tierColor = SUCCESS;
    tierLabel = "Xuất sắc · dòng tiền tối ưu";
    tierEmoji = "🏆";
  } else if (totalScore >= 7) {
    tierColor = SUCCESS;
    tierLabel = "Tốt · cần tinh chỉnh";
    tierEmoji = "💎";
  } else if (totalScore >= 4) {
    tierColor = WARNING;
    tierLabel = "Cần hệ thống hóa";
    tierEmoji = "⚡";
  } else {
    tierColor = DANGER;
    tierLabel = "Đang mất cân đối";
    tierEmoji = "⚠️";
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* HERO */}
      <div
        style={{
          padding: 22,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${tierColor}11, ${CREAM_LIGHT})`,
          border: `1.5px solid ${tierColor}55`,
          boxShadow: `0 6px 20px ${tierColor}22`,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${tierColor}44, ${tierColor}11)`,
                border: `1.5px solid ${tierColor}77`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              {tierEmoji}
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: GOLD_DARK,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                }}
              >
                Dòng tiền ròng /tháng
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 26,
                  fontWeight: 900,
                  color: balance >= 0 ? SUCCESS : DANGER,
                  lineHeight: 1.1,
                }}
              >
                {balance >= 0 ? "+" : ""}{fmtVNDLocal(balance)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: tierColor,
                  fontWeight: 700,
                  fontStyle: "italic",
                  marginTop: 2,
                }}
              >
                {tierLabel}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <RatioPillReport label="Thu" pct={incTotal > 0 ? 100 : 0} color={SUCCESS} />
            <RatioPillReport label="Cố định" pct={fixedRate} color={WARNING} />
            <RatioPillReport label="Biến động" pct={variableRate} color="#8b5cf6" />
            <RatioPillReport label="Để dành" pct={savingRate} color={GOLD_DARK} />
          </div>
        </div>
        <ScoreCircleReport score={totalScore} max={10} color={tierColor} />
      </div>

      {/* TỶ TRỌNG bar */}
      <div
        style={{
          marginTop: 14,
          padding: 18,
          background: "#fff",
          borderRadius: 12,
          border: `1px solid ${NAVY}11`,
        }}
      >
        <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 12px" }}>
          Cơ cấu chi tiêu — so với thu nhập {fmtCompactLocal(incTotal)}
        </h4>
        <RatioBarReport
          salary={fixedTotal}
          business={variableTotal}
          passive={savingsTotal}
          total={incTotal || (fixedTotal + variableTotal + savingsTotal)}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 12 }}>
          <RatioLegendReport color={WARNING} label="Chi cố định" amount={fixedTotal} pct={fixedRate} />
          <RatioLegendReport color="#8b5cf6" label="Chi biến động" amount={variableTotal} pct={variableRate} />
          <RatioLegendReport color={GOLD_DARK} label="Để dành (savings)" amount={savingsTotal} pct={savingRate} />
          <RatioLegendReport color={DANGER} label="Trả nợ định kỳ" amount={debt} pct={debtRate} />
        </div>
      </div>

      {/* 5 tiêu chí */}
      <div
        style={{
          marginTop: 14,
          padding: 18,
          background: "#fff",
          borderRadius: 12,
          border: `1px solid ${NAVY}11`,
        }}
      >
        <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 12px" }}>
          Khung 5 tiêu chí · {totalScore}/10 điểm
        </h4>
        <div style={{ display: "grid", gap: 8 }}>
          {criteria.map((c, i) => (
            <CriterionRowReport key={i} criterion={c} />
          ))}
        </div>
      </div>

      {/* Tổng kết */}
      <div
        style={{
          marginTop: 16,
          padding: 18,
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
          borderRadius: 12,
          color: "#fff",
          border: `1px solid ${GOLD}66`,
          boxShadow: `0 6px 18px ${NAVY}33`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: GOLD_LIGHT,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            marginBottom: 8,
            textAlign: "center",
            fontFamily: SERIF,
          }}
        >
          ✦ Lời khuyên hành động ✦
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#e5e7eb", margin: 0, textAlign: "center", maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          {totalScore >= 9
            ? "Dòng tiền của anh/chị đang ở mức xuất sắc. Tiếp tục duy trì kỷ luật JARS và tăng tỉ lệ đóng vào FFA để gia tốc tự do tài chính."
            : totalScore >= 7
              ? "Dòng tiền tốt, cần tinh chỉnh thêm 1-2 chỉ số. Trong 6 tháng tới: tăng tỉ lệ tiết kiệm lên ≥ 20% và đóng quỹ dự phòng đủ 6 tháng chi tiêu."
              : totalScore >= 4
                ? "Cần hệ thống hóa dòng tiền: tách bạch tài khoản theo 6 quỹ JARS, đặt mục tiêu tiết kiệm ≥ 10% và kiểm soát chi cố định ≤ 50% thu nhập."
                : "Đang mất cân đối — ưu tiên trước tiên: cắt chi không thiết yếu, đặt budget cố định, dừng vay tiêu dùng mới và tích lũy quỹ dự phòng 3 tháng chi phí."}
        </p>
      </div>
    </div>
  );
}

function NetWorthAnalysisReport({
  result,
}: {
  result: NetWorthAnalysisResult;
}) {
  if (result.totalAssets === 0 && result.totalDebt === 0) {
    return (
      <NotCompletedNote message="Học viên chưa nhập thông tin tài sản và nợ. Quay lại Blueprint Phần IV → Cân Đối Tài Sản để cập nhật." />
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* HERO — Net Worth + tier */}
      <div
        style={{
          padding: 22,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${result.tierColor}11, ${CREAM_LIGHT})`,
          border: `1.5px solid ${result.tierColor}55`,
          boxShadow: `0 6px 20px ${result.tierColor}22`,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <NWStat
          label="Tổng tài sản"
          value={result.totalAssets}
          color={SUCCESS}
        />
        <NWStat
          label="Tổng nợ"
          value={result.totalDebt}
          color={DANGER}
        />
        <NWStat
          label="Net Worth"
          value={result.netWorth}
          color={result.netWorth >= 0 ? result.tierColor : DANGER}
          emoji={result.tierEmoji}
          tier={result.tierLabel}
        />
      </div>

      {/* SECTION 1: 4 NHÓM TÀI SẢN */}
      <SectionTitle title="Cơ cấu tài sản — 4 nhóm" />
      <AssetDonutBreakdown result={result} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
          marginTop: 14,
        }}
      >
        <GroupBreakdownCard
          label="A. Thanh khoản"
          sub="Tiền · vàng · crypto · quỹ NH"
          break_={result.liquidBreak}
        />
        <GroupBreakdownCard
          label="B. Tiêu dùng"
          sub="Nhà · xe · nội thất · đồ cá nhân"
          break_={result.consumptionBreak}
        />
        <GroupBreakdownCard
          label="C. Tăng trưởng"
          sub="Đất nền · cổ phiếu · quỹ · startup"
          break_={result.growthBreak}
        />
        <GroupBreakdownCard
          label="D. Dòng tiền"
          sub="BĐS cho thuê · cổ tức · bản quyền"
          break_={result.cashflowBreak}
        />
      </div>

      {/* SECTION 2: 3 RATIO NỢ */}
      <SectionTitle title="3 chỉ số nợ quan trọng" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <DebtRatioCard
          label="Nợ / Tổng tài sản"
          value={result.debtToAssetPct}
          verdict={result.debtToAssetVerdict}
          color={result.debtToAssetColor}
          thresholds={[
            { range: "0-20%", note: "An toàn" },
            { range: "20-40%", note: "Chấp nhận được" },
            { range: "40-60%", note: "Cần theo dõi" },
            { range: ">60%", note: "Rủi ro cao" },
          ]}
        />
        <DebtRatioCard
          label="Nợ / Net Worth"
          value={result.netWorth > 0 ? result.debtToNetWorthPct : -1}
          verdict={result.debtToNetWorthVerdict}
          color={result.debtToNetWorthColor}
          thresholds={[
            { range: "<50%", note: "Khá an toàn" },
            { range: "50-100%", note: "Cẩn thận" },
            { range: "100-200%", note: "Đòn bẩy cao" },
            { range: ">200%", note: "Nghiêm trọng" },
          ]}
        />
        <DebtRatioCard
          label="Trả nợ / Thu nhập"
          value={result.monthlyDebtPaymentPct}
          verdict={result.monthlyDebtVerdict}
          color={result.monthlyDebtColor}
          thresholds={[
            { range: "<25%", note: "An toàn" },
            { range: "25-35%", note: "Chấp nhận được" },
            { range: "35-50%", note: "Áp lực cao" },
            { range: ">50%", note: "Mất cân đối" },
          ]}
          extra={`${fmtCompactLocal(result.totalMonthlyDebtPayment)} trả /tháng / ${fmtCompactLocal(result.totalMonthlyIncome)} thu`}
        />
      </div>

      {/* SECTION 3: CHẤT LƯỢNG NỢ */}
      {result.debtCategories.length > 0 && (
        <>
          <SectionTitle title="Phân loại chất lượng nợ" />
          <DebtQualityDonut result={result} />
          <div style={{ display: "grid", gap: 6, marginBottom: 16, marginTop: 14 }}>
            {result.debtCategories.map((c, i) => (
              <DebtCategoryRow key={i} cat={c} />
            ))}
          </div>
        </>
      )}

      {/* TỔNG KẾT */}
      <div
        style={{
          padding: 18,
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
          borderRadius: 12,
          color: "#fff",
          border: `1px solid ${GOLD}66`,
          boxShadow: `0 6px 18px ${NAVY}33`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: GOLD_LIGHT,
            letterSpacing: 2.5,
            textTransform: "uppercase",
            marginBottom: 8,
            textAlign: "center",
            fontFamily: SERIF,
          }}
        >
          ✦ Tổng kết ✦
        </div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.75,
            color: "#e5e7eb",
            margin: 0,
            textAlign: "center",
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {result.summary}
        </p>
      </div>
    </div>
  );
}

function NWStat({
  label,
  value,
  color,
  emoji,
  tier,
}: {
  label: string;
  value: number;
  color: string;
  emoji?: string;
  tier?: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: GOLD_DARK,
          textTransform: "uppercase",
          letterSpacing: 1.3,
          marginBottom: 4,
        }}
      >
        {emoji && <span style={{ marginRight: 4 }}>{emoji}</span>}
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 900,
          color,
          lineHeight: 1.15,
        }}
      >
        {fmtCompactLocal(value)}
      </div>
      {tier && (
        <div
          style={{
            fontSize: 10,
            color,
            fontWeight: 700,
            fontStyle: "italic",
            marginTop: 2,
          }}
        >
          {tier}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h4
      style={{
        fontFamily: SERIF,
        fontSize: 15,
        color: NAVY,
        margin: "20px 0 10px",
        paddingBottom: 6,
        borderBottom: `2px solid ${GOLD}55`,
      }}
    >
      {title}
    </h4>
  );
}

function AssetDonutBreakdown({ result }: { result: NetWorthAnalysisResult }) {
  const segments = [
    { label: "A. Thanh khoản", value: result.liquidTotal, pct: result.liquidBreak.pct, color: "#3b82f6" },
    { label: "B. Tiêu dùng",   value: result.consumptionTotal, pct: result.consumptionBreak.pct, color: "#f97316" },
    { label: "C. Tăng trưởng", value: result.growthTotal, pct: result.growthBreak.pct, color: "#a855f7" },
    { label: "D. Dòng tiền",   value: result.cashflowTotal, pct: result.cashflowBreak.pct, color: "#10b981" },
  ];
  return (
    <DonutChartWithLegend
      total={result.totalAssets}
      totalLabel="Tổng tài sản"
      segments={segments}
    />
  );
}

function DebtQualityDonut({ result }: { result: NetWorthAnalysisResult }) {
  const segments = [
    { label: "Nợ tốt",       value: result.goodDebtTotal,    pct: 0, color: SUCCESS, sub: "Tạo dòng tiền dương hoặc lợi suất > lãi vay" },
    { label: "Nợ trung tính", value: result.neutralDebtTotal, pct: 0, color: WARNING, sub: "Phụ thuộc khả năng trả nợ + biến động thị trường" },
    { label: "Nợ xấu",       value: result.badDebtTotal,     pct: 0, color: DANGER,  sub: "Lãi cao · giảm giá · không tạo dòng tiền" },
  ];
  // compute pct
  const total = segments.reduce((s, x) => s + x.value, 0);
  segments.forEach((s) => {
    s.pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
  });
  return (
    <DonutChartWithLegend
      total={total}
      totalLabel="Tổng nợ phân loại"
      segments={segments}
    />
  );
}

function DonutChartWithLegend({
  total,
  totalLabel,
  segments,
}: {
  total: number;
  totalLabel: string;
  segments: { label: string; value: number; pct: number; color: string; sub?: string }[];
}) {
  // Donut geometry
  const size = 220;
  const stroke = 36;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;

  // Compute cumulative offsets (immutable)
  const cumulativeOffsets = segments.map((_, i) =>
    segments.slice(0, i).reduce((s, x) => s + (x.pct / 100) * circ, 0)
  );
  const arcs = segments.map((seg, i) => {
    const len = (seg.pct / 100) * circ;
    return {
      ...seg,
      strokeDasharray: `${len} ${circ - len}`,
      strokeDashoffset: -cumulativeOffsets[i],
    };
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 24,
        alignItems: "center",
        padding: 20,
        background: `linear-gradient(135deg, ${CREAM_LIGHT}, #fff)`,
        border: `1px solid ${NAVY}11`,
        borderRadius: 14,
        boxShadow: `0 4px 14px ${NAVY}08`,
      }}
    >
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={`${NAVY}10`}
            strokeWidth={stroke}
          />
          {/* Segments */}
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={arc.strokeDasharray}
              strokeDashoffset={arc.strokeDashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ filter: `drop-shadow(0 2px 4px ${arc.color}55)` }}
            />
          ))}
          {/* Inner ring (depth) */}
          <circle
            cx={cx}
            cy={cy}
            r={r - stroke / 2 - 2}
            fill="#fff"
            stroke={`${NAVY}11`}
            strokeWidth="1"
          />
        </svg>
        {/* Center label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 800,
              color: GOLD_DARK,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            {totalLabel}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 20,
              fontWeight: 900,
              color: NAVY,
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            {fmtCompactLocal(total)}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 12,
              alignItems: "center",
              padding: "10px 14px",
              background: `linear-gradient(135deg, ${seg.color}11, transparent 70%), #fff`,
              border: `1px solid ${seg.color}55`,
              borderRadius: 10,
              boxShadow: `0 2px 6px ${seg.color}11`,
            }}
          >
            {/* Color chip */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${seg.color}, ${shade(seg.color, -30)})`,
                boxShadow: `0 2px 6px ${seg.color}55, inset 0 1px 2px rgba(255,255,255,0.4)`,
              }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, lineHeight: 1.2 }}>
                {seg.label}
              </div>
              {seg.sub && (
                <div style={{ fontSize: 10, color: TEXT_MUTED, marginTop: 2 }}>
                  {seg.sub}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 18,
                  fontWeight: 900,
                  color: seg.color,
                  lineHeight: 1,
                }}
              >
                {seg.pct}%
              </div>
              <div style={{ fontSize: 9, color: TEXT_MUTED, fontWeight: 700, marginTop: 2 }}>
                {fmtCompactLocal(seg.value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupBreakdownCard({
  label,
  sub,
  break_,
}: {
  label: string;
  sub: string;
  break_: GroupBreakdown;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: `linear-gradient(135deg, ${break_.verdictColor}0d, transparent 70%), #fff`,
        border: `1px solid ${break_.verdictColor}44`,
        borderRadius: 10,
        boxShadow: `0 4px 10px ${break_.verdictColor}11`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: NAVY }}>{label}</div>
          <div style={{ fontSize: 9.5, color: TEXT_MUTED, marginTop: 1 }}>{sub}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 900,
              color: break_.verdictColor,
              lineHeight: 1,
            }}
          >
            {break_.pct}%
          </div>
          <div style={{ fontSize: 10, color: TEXT_MUTED, fontWeight: 700, marginTop: 2 }}>
            {fmtCompactLocal(break_.total)}
          </div>
        </div>
      </div>
      <div
        style={{
          height: 6,
          background: `${break_.verdictColor}22`,
          borderRadius: 3,
          overflow: "hidden",
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(100, break_.pct)}%`,
            background: `linear-gradient(90deg, ${break_.verdictColor}cc, ${break_.verdictColor})`,
            borderRadius: 3,
          }}
        />
      </div>
      <div style={{ fontSize: 10.5, color: TEXT_BODY, lineHeight: 1.5 }}>
        {break_.verdict}
      </div>
    </div>
  );
}

function DebtRatioCard({
  label,
  value,
  verdict,
  color,
  thresholds,
  extra,
}: {
  label: string;
  value: number;
  verdict: string;
  color: string;
  thresholds: { range: string; note: string }[];
  extra?: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: `linear-gradient(135deg, ${color}0d, transparent 70%), #fff`,
        border: `1px solid ${color}44`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          color,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 28,
          fontWeight: 900,
          color,
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value < 0 ? "—" : `${value}%`}
      </div>
      <div style={{ fontSize: 11, color: NAVY, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
        {verdict}
      </div>
      {extra && (
        <div
          style={{
            fontSize: 9.5,
            color: TEXT_MUTED,
            marginBottom: 8,
            fontStyle: "italic",
          }}
        >
          {extra}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          paddingTop: 8,
          borderTop: `1px solid ${NAVY}11`,
        }}
      >
        {thresholds.map((t, i) => (
          <div key={i} style={{ fontSize: 9.5 }}>
            <span style={{ color: TEXT_MUTED, fontWeight: 700 }}>{t.range}: </span>
            <span style={{ color: TEXT_BODY }}>{t.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DebtCategoryRow({ cat }: { cat: DebtQualityCategory }) {
  const color =
    cat.type === "good"
      ? SUCCESS
      : cat.type === "bad"
        ? DANGER
        : WARNING;
  const typeLabel =
    cat.type === "good" ? "Nợ tốt" : cat.type === "bad" ? "Nợ xấu" : "Trung tính";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: 10,
        alignItems: "center",
        padding: "8px 12px",
        background: `${color}08`,
        border: `1px solid ${color}33`,
        borderRadius: 6,
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>
          {cat.label}
        </div>
        <div style={{ fontSize: 10.5, color: TEXT_BODY, marginTop: 2 }}>{cat.note}</div>
      </div>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          color,
          background: `${color}22`,
          padding: "3px 8px",
          borderRadius: 999,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
        }}
      >
        {typeLabel}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: NAVY,
          fontFamily: SERIF,
          whiteSpace: "nowrap",
        }}
      >
        {fmtCompactLocal(cat.amount)}
      </div>
    </div>
  );
}

function fmtVNDLocal(n: number): string {
  return Math.round(n).toLocaleString("vi-VN") + "₫";
}

function fmtCompactLocal(n: number): string {
  if (n === 0) return "0₫";
  const abs = Math.abs(n);
  if (abs >= 1e9) return (abs / 1e9).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (abs >= 1e6) return Math.round(abs / 1e6) + "tr";
  if (abs >= 1e3) return Math.round(abs / 1e3) + "k";
  return abs.toLocaleString("vi-VN") + "₫";
}

/* ─────────────────────────────────────────────
 *  RiskMapVisual — 8 nhóm rủi ro với central shield
 * ───────────────────────────────────────────── */

interface RiskMapItem {
  key: string;
  label: string;
  score: number;
  note: string;
}

type RiskMeta = {
  icon: typeof Shield;
  desc: string;
};

const RISK_META: Record<string, RiskMeta> = {
  cashflow:   { icon: Banknote,    desc: "Biến động và phụ thuộc dòng tiền."         },
  debt:       { icon: Unlink,      desc: "Nợ tiêu dùng, nợ xấu, đòn bẩy quá mức."   },
  emergency:  { icon: HeartPulse,  desc: "Khả năng sinh tồn khi mất thu nhập."      },
  protection: { icon: ShieldCheck, desc: "Khoảng trống bảo hiểm nhân thọ, sức khỏe." },
  asset:      { icon: Building2,   desc: "Thiếu đa dạng, thanh khoản kém."          },
  retirement: { icon: Hourglass,   desc: "Thiếu hụt quỹ hưu trí."                   },
  freedom:    { icon: Bird,        desc: "Tỷ lệ phụ thuộc lao động chủ động cao."   },
  mindset:    { icon: Brain,       desc: "Rào cản từ hệ niềm tin và tâm thức."      },
};

const SHORT_GROUP = ["cashflow", "debt", "emergency", "protection"]; // ngắn hạn
const LONG_GROUP = ["asset", "retirement", "freedom", "mindset"];    // dài hạn

/* ─────────────────────────────────────────────
 *  RiskHeatmapGrid — 8 risk cards + AI Analysis box
 * ───────────────────────────────────────────── */

function RiskHeatmapGrid({
  items,
  riskScore,
  level,
  topRisks,
  topOpportunities,
}: {
  items: RiskMapItem[];
  riskScore: number;
  level: string;
  topRisks: string[];
  topOpportunities: string[];
}) {
  // Sắp xếp theo Sinh tồn (short) + Thịnh vượng (long)
  const byKey = Object.fromEntries(items.map((it) => [it.key, it]));
  const orderedKeys = [...SHORT_GROUP, ...LONG_GROUP];
  const orderedItems = orderedKeys
    .map((k) => byKey[k])
    .filter(Boolean);

  const isHighRisk = riskScore < 40;
  const isModerate = riskScore < 70;
  const totalColor = isHighRisk
    ? DANGER
    : isModerate
      ? WARNING
      : SUCCESS;
  const totalBg = `linear-gradient(135deg, ${totalColor}, ${shade(totalColor, -25)})`;

  return (
    <div
      style={{
        marginTop: 18,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
        gap: 16,
      }}
    >
      {/* LEFT: 8 risk cards in 2-col grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        {orderedItems.map((r) => (
          <HeatmapRiskCard key={r.key} item={r} />
        ))}
      </div>

      {/* RIGHT: AI Risk Analysis box */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Title */}
        <div
          style={{
            padding: "8px 14px",
            background: `linear-gradient(135deg, ${NAVY_DARK}, ${NAVY})`,
            borderRadius: 8,
            border: `1px solid ${GOLD}77`,
            color: GOLD_LIGHT,
            fontFamily: SERIF,
            fontSize: 13,
            fontWeight: 900,
            textAlign: "center",
            letterSpacing: 1.5,
            boxShadow: `0 4px 12px ${NAVY}33`,
          }}
        >
          ✦ AI RISK ANALYSIS ✦
        </div>

        {/* Top risks (Critical) */}
        <div
          style={{
            padding: 14,
            background: `linear-gradient(135deg, ${DANGER}11, transparent)`,
            border: `1.5px solid ${DANGER}66`,
            borderRadius: 10,
            boxShadow: `0 3px 10px ${DANGER}15`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 800,
              color: DANGER,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontSize: 14 }}>⚠</span>
            Rủi ro cao nhất (Critical)
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
            {topRisks.map((r, i) => (
              <li
                key={i}
                style={{
                  fontSize: 11.5,
                  color: NAVY,
                  fontWeight: 600,
                  paddingLeft: 14,
                  position: "relative",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: DANGER,
                    fontWeight: 900,
                  }}
                >
                  •
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Top opportunities */}
        <div
          style={{
            padding: 14,
            background: `linear-gradient(135deg, ${SUCCESS}11, transparent)`,
            border: `1.5px solid ${SUCCESS}66`,
            borderRadius: 10,
            boxShadow: `0 3px 10px ${SUCCESS}15`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 800,
              color: SUCCESS,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <span style={{ fontSize: 14 }}>📈</span>
            Cơ hội lớn nhất
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
            {topOpportunities.map((r, i) => (
              <li
                key={i}
                style={{
                  fontSize: 11.5,
                  color: NAVY,
                  fontWeight: 600,
                  paddingLeft: 14,
                  position: "relative",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    color: SUCCESS,
                    fontWeight: 900,
                  }}
                >
                  •
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Total Risk Score */}
        <div
          style={{
            padding: "14px 16px",
            background: totalBg,
            color: "#fff",
            borderRadius: 10,
            border: `2px solid ${GOLD}66`,
            textAlign: "center",
            boxShadow: `0 6px 16px ${totalColor}55`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: GOLD_LIGHT,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Tổng điểm Risk Score
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 30,
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#fff",
            }}
          >
            {riskScore}
            <span style={{ fontSize: 16, opacity: 0.75, marginLeft: 2 }}>/100</span>
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: GOLD_LIGHT,
              marginTop: 4,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            ({level})
          </div>
        </div>
      </div>
    </div>
  );
}

function HeatmapRiskCard({ item }: { item: RiskMapItem }) {
  const c =
    item.score >= 70
      ? SUCCESS
      : item.score >= 40
        ? WARNING
        : DANGER;
  const verdict =
    item.score >= 70
      ? "An toàn"
      : item.score >= 40
        ? "Cần cải thiện"
        : "Nguy hiểm";
  const icon =
    item.score >= 70
      ? "✓"
      : item.score >= 40
        ? "!"
        : "⚠";

  return (
    <div
      style={{
        padding: 12,
        background: `linear-gradient(135deg, ${c}11, ${c}05 60%, #fff)`,
        border: `1.5px solid ${c}55`,
        borderRadius: 10,
        boxShadow: `0 3px 10px ${c}15`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Top row: icon + name + score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${c}22`,
            color: c,
            border: `1px solid ${c}77`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 900,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: SERIF,
            fontSize: 13,
            fontWeight: 900,
            color: NAVY,
            lineHeight: 1.2,
          }}
        >
          {item.label.replace(" Risk", "")}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 15,
            fontWeight: 900,
            color: c,
            whiteSpace: "nowrap",
          }}
        >
          {item.score}
          <span style={{ fontSize: 9, color: TEXT_MUTED, fontWeight: 600 }}>
            /100
          </span>
        </div>
      </div>

      {/* Progress bar (inverted — full bar = safer) */}
      <div
        style={{
          height: 6,
          background: `${c}22`,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${100 - item.score}%`, // invert: high risk = full bar
            background: `linear-gradient(90deg, ${c}, ${shade(c, -25)})`,
            borderRadius: 999,
            boxShadow: `0 0 6px ${c}55`,
          }}
        />
      </div>

      {/* Verdict row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 10.5,
          fontWeight: 700,
          color: c,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: c,
            boxShadow: `0 0 4px ${c}`,
          }}
        />
        {verdict}
      </div>
    </div>
  );
}

function RiskMapVisual({ items }: { items: RiskMapItem[] }) {
  const byKey = Object.fromEntries(items.map((it) => [it.key, it]));
  const shortItems = SHORT_GROUP.map((k) => byKey[k]).filter(Boolean);
  const longItems = LONG_GROUP.map((k) => byKey[k]).filter(Boolean);

  // Tách 4 items mỗi side thành 2 nhóm trên (2 items) + label + 2 dưới
  const renderColumn = (
    list: RiskMapItem[],
    align: "left" | "right",
    groupLabel: string,
    groupSubtitle: string,
    groupColor: string
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* 2 cards on top */}
      {list.slice(0, 2).map((r) => (
        <RiskCard key={r.key} item={r} align={align} />
      ))}
      {/* Group label — pill style centered */}
      <div
        style={{
          padding: "8px 0",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: `linear-gradient(135deg, ${groupColor}11, transparent)`,
            border: `1px solid ${groupColor}55`,
            borderRadius: 999,
          }}
        >
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              fontWeight: 900,
              color: groupColor,
              lineHeight: 1,
              letterSpacing: 0.2,
            }}
          >
            {groupLabel}
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: TEXT_MUTED,
              letterSpacing: 1.3,
              textTransform: "uppercase",
            }}
          >
            ({groupSubtitle})
          </span>
        </div>
      </div>
      {/* 2 cards on bottom */}
      {list.slice(2, 4).map((r) => (
        <RiskCard key={r.key} item={r} align={align} />
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: 20 }}>
      {/* 3-column: LEFT cards + CENTER shield + RIGHT cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        {renderColumn(shortItems, "right", "Ngắn hạn", "Sinh tồn", NAVY)}
        <CenterShield />
        {renderColumn(longItems, "left", "Dài hạn", "Thịnh vượng", GOLD_DARK)}
      </div>

      {/* Bottom caption */}
      <div
        style={{
          marginTop: 24,
          padding: "14px 22px",
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
          color: "#fff",
          borderRadius: 12,
          textAlign: "center",
          fontSize: 12.5,
          lineHeight: 1.6,
          border: `1px solid ${GOLD}66`,
          boxShadow: `0 6px 20px ${NAVY}33`,
        }}
      >
        <strong style={{ color: GOLD_LIGHT, letterSpacing: 0.3 }}>
          Đánh giá toàn diện
        </strong>{" "}
        các rủi ro tác động đến{" "}
        <strong>Thu nhập · Tài sản · Doanh nghiệp · Gia đình</strong> và{" "}
        <strong>Kế hoạch tự do tài chính</strong>.
      </div>
    </div>
  );
}

function RiskCard({
  item,
  align,
}: {
  item: RiskMapItem;
  align: "left" | "right";
}) {
  const meta = RISK_META[item.key];
  const Icon = meta?.icon ?? Shield;
  const desc = meta?.desc ?? item.note;
  const c =
    item.score >= 60 ? DANGER : item.score >= 40 ? WARNING : SUCCESS;
  const verdict =
    item.score >= 75
      ? "Nguy hiểm"
      : item.score >= 60
        ? "Rủi ro cao"
        : item.score >= 40
          ? "Cần cải thiện"
          : "An toàn";

  const isLeft = align === "left";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isLeft ? "44px 36px 1fr auto" : "auto 1fr 36px 44px",
        gap: 12,
        alignItems: "center",
        minHeight: 76,
        padding: "12px 14px",
        background: `linear-gradient(135deg, ${NAVY_DARK}, ${NAVY})`,
        borderRadius: 10,
        border: `1px solid ${GOLD}55`,
        boxShadow: `0 4px 12px ${NAVY}22, inset 0 1px 0 ${GOLD}22`,
        color: "#fff",
      }}
    >
      {/* Score (luôn ở mép xa shield) */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${c}33, ${c}11)`,
          border: `2px solid ${c}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 900,
          color: c,
          flexShrink: 0,
          boxShadow: `0 0 10px ${c}55`,
          fontFamily: SERIF,
          gridColumn: isLeft ? "1" : "4",
          gridRow: "1",
        }}
      >
        {item.score}
      </div>
      {/* Icon (cạnh số) */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `linear-gradient(135deg, ${GOLD}44, ${GOLD}11)`,
          border: `1px solid ${GOLD}77`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: GOLD_LIGHT,
          flexShrink: 0,
          gridColumn: isLeft ? "2" : "3",
          gridRow: "1",
        }}
      >
        <Icon size={17} />
      </div>
      {/* Text body */}
      <div
        style={{
          minWidth: 0,
          textAlign: isLeft ? "left" : "right",
          gridColumn: isLeft ? "3" : "2",
          gridRow: "1",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: GOLD_LIGHT,
            letterSpacing: 0.2,
            lineHeight: 1.15,
          }}
        >
          {item.label}
          <sup style={{ fontSize: 8, marginLeft: 1 }}>™</sup>
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: "#bdc3cf",
            marginTop: 2,
            lineHeight: 1.35,
          }}
        >
          {desc}
        </div>
      </div>
      {/* Verdict pill */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: c,
          background: `${c}22`,
          border: `1px solid ${c}55`,
          padding: "3px 7px",
          borderRadius: 999,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          whiteSpace: "nowrap",
          gridColumn: isLeft ? "4" : "1",
          gridRow: "1",
        }}
      >
        {verdict}
      </div>
    </div>
  );
}

function CenterShield() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 12px",
        minWidth: 220,
      }}
    >
      {/* Concentric rings — 200px để dominate visual */}
      <div
        style={{
          position: "relative",
          width: 200,
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outermost dashed ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px dashed ${GOLD}55`,
          }}
        />
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: "50%",
            border: `1.5px solid ${GOLD}66`,
          }}
        />
        {/* Middle ring (with gold accent) */}
        <div
          style={{
            position: "absolute",
            inset: 34,
            borderRadius: "50%",
            border: `2.5px solid ${GOLD}88`,
            boxShadow: `0 0 16px ${GOLD}44`,
          }}
        />
        {/* Glow halo behind inner */}
        <div
          style={{
            position: "absolute",
            inset: 50,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${GOLD}33 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />
        {/* Inner core */}
        <div
          style={{
            position: "absolute",
            inset: 58,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, ${NAVY_LIGHT}, ${NAVY} 50%, ${NAVY_DARK})`,
            border: `3px solid ${GOLD}`,
            boxShadow: `0 0 32px ${GOLD}aa, inset 0 3px 12px ${GOLD}55, inset 0 -6px 16px ${NAVY_DARK}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Shield
            size={44}
            strokeWidth={1.5}
            style={{
              color: GOLD_LIGHT,
              filter: `drop-shadow(0 0 6px ${GOLD})`,
            }}
          />
        </div>
      </div>

      {/* Vertical divider — connect to label */}
      <div
        style={{
          width: 1,
          height: 14,
          background: `linear-gradient(180deg, ${GOLD}, transparent)`,
          marginTop: 8,
        }}
      />

      {/* Tag */}
      <div
        style={{
          padding: "5px 14px",
          background: `linear-gradient(135deg, ${NAVY_DARK}, ${NAVY})`,
          border: `1px solid ${GOLD}77`,
          borderRadius: 999,
          color: GOLD_LIGHT,
          fontFamily: SERIF,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: 2,
          textTransform: "uppercase",
          marginTop: 6,
          boxShadow: `0 4px 12px ${NAVY}33`,
        }}
      >
        Risk Map™
      </div>
    </div>
  );
}

function NotCompletedNote({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 24,
        background: CREAM_LIGHT,
        border: `1px dashed ${GOLD}77`,
        borderRadius: 8,
        textAlign: "center",
        color: TEXT_BODY,
        fontSize: 13,
        fontStyle: "italic",
        lineHeight: 1.6,
      }}
    >
      ⚠ {message}
    </div>
  );
}

function PartialProgressNote({
  count,
  total,
  label,
}: {
  count: number;
  total: number;
  label: string;
}) {
  const pct = Math.round((count / total) * 100);
  return (
    <div
      style={{
        marginBottom: 18,
        padding: "12px 16px",
        background: `${WARNING}15`,
        border: `1px solid ${WARNING}55`,
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <AlertCircle size={16} style={{ color: WARNING, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            color: WARNING,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          Dữ liệu chưa đầy đủ — chỉ trả lời {count}/{total} câu {label} ({pct}%)
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${WARNING}, ${GOLD})`,
              boxShadow: `0 0 8px ${WARNING}77`,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: TEXT_BODY,
            marginTop: 4,
            fontStyle: "italic",
          }}
        >
          Kết quả dưới đây dựa trên dữ liệu hiện có. Hoàn thành đủ {total} câu
          để có phân tích chính xác.
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
 *  6 CẤP ĐỘ TÀI CHÍNH — Roadmap component & data
 * ───────────────────────────────────────────── */

interface FinancialLevel {
  num: number;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  description: string;
  criteria: string[];
  nextStep: string;
}

const LEVEL_COLORS = ["#C33232", "#E5715D", "#E5B547", "#7CB342", "#388E3C", "#0F5C36"];

const FINANCIAL_LEVELS: FinancialLevel[] = [
  {
    num: 1,
    name: "Xóa nợ xấu",
    shortName: "Xóa nợ xấu",
    emoji: "🩹",
    color: LEVEL_COLORS[0],
    description:
      "Loại bỏ hoàn toàn nợ tiêu dùng lãi cao (thẻ TD, vay app, vay online, margin) — đây là điểm xuất phát của mọi lộ trình tài chính.",
    criteria: [
      "Không còn dư nợ thẻ tín dụng / vay app / margin / vay tiêu dùng lãi > 20%",
      "Không có khoản nợ quá hạn",
      "Tổng trả nợ tiêu dùng /tháng = 0",
    ],
    nextStep:
      "Khi hết nợ xấu → chuyển sang Cấp 2: xây quỹ dự phòng 1 tháng chi phí và lập kế hoạch chi tiêu kỷ luật.",
  },
  {
    num: 2,
    name: "Thoát nghèo",
    shortName: "Thoát nghèo",
    emoji: "🌱",
    color: LEVEL_COLORS[1],
    description:
      "Không còn nợ xấu và tài sản thanh khoản đủ trang trải chi tiêu thiết yếu trong 12 tháng — đủ vùng đệm khi mất thu nhập đột ngột.",
    criteria: [
      "Không có nợ xấu (thẻ TD, vay app, margin, vay tiêu dùng lãi cao)",
      "Tài sản thanh khoản + quỹ dự phòng > 12 tháng chi tiêu thiết yếu",
    ],
    nextStep:
      "Khi đạt 12 tháng chi thiết yếu → chuyển sang Cấp 3: nâng lên 10 năm chi thiết yếu (có thể bù bằng BH nhân thọ).",
  },
  {
    num: 3,
    name: "An toàn tài chính",
    shortName: "An toàn",
    emoji: "🛡️",
    color: LEVEL_COLORS[2],
    description:
      "Tài sản thanh khoản đủ chi tiêu thiết yếu trong 10 năm (120 tháng), có thể bù trừ bằng mệnh giá bảo hiểm nhân thọ — gia đình an toàn trước biến cố mất thu nhập kéo dài.",
    criteria: [
      "Tài sản thanh khoản ≥ 10 năm chi tiêu thiết yếu",
      "Hoặc: Thanh khoản ≥ (10 năm chi thiết yếu − mệnh giá BH nhân thọ)",
      "Có bảo hiểm sức khỏe + bệnh hiểm nghèo (nâng cao an toàn)",
      "Tỉ lệ nợ /tổng tài sản ≤ 40%",
    ],
    nextStep:
      "Khi đã an toàn → chuyển sang Cấp 4: xây tài sản tạo thu nhập thụ động.",
  },
  {
    num: 4,
    name: "Độc lập tài chính",
    shortName: "Độc lập",
    emoji: "🏛️",
    color: LEVEL_COLORS[3],
    description:
      "Đạt 1 trong 2 điều kiện: HOẶC có thu nhập thụ động (lãi, cổ tức, cho thuê, kinh doanh thụ động) ≥ chi tiêu, HOẶC tài sản đầu tư đủ lớn để rule 4% sinh ra dòng tiền phủ chi.",
    criteria: [
      "ĐK1: Có thu nhập thụ động (lãi, cổ tức, cho thuê, kinh doanh thụ động)",
      "ĐK2: Hoặc (Tài sản thanh khoản + tăng trưởng + đầu tư) > Chi tiêu năm ÷ 4%",
    ],
    nextStep:
      "Khi passive income ≥ 100% chi phí → chuyển sang Cấp 5: Tự do tài chính.",
  },
  {
    num: 5,
    name: "Tự do tài chính",
    shortName: "Tự do",
    emoji: "🦅",
    color: LEVEL_COLORS[4],
    description:
      "Thu nhập thụ động đủ trang trải PHONG CÁCH SỐNG — không chỉ chi thiết yếu. Định tính: passive ≈ 1 tỷ/tháng HOẶC tổng tài sản đầu tư > 100 tỷ — có thể nghỉ làm full-time và sống tự do.",
    criteria: [
      "ĐK1: Thu nhập thụ động ≥ 1 tỷ /tháng (≈ phong cách sống cao cấp)",
      "ĐK2: Hoặc tổng tài sản (thanh khoản + tăng trưởng + đầu tư) ≥ 100 tỷ",
    ],
    nextStep:
      "Khi tự do tài chính bền vững → chuyển sang Cấp 6: xây dựng di sản tài chính cho thế hệ sau.",
  },
  {
    num: 6,
    name: "Di sản tài chính",
    shortName: "Di sản",
    emoji: "🏆",
    color: LEVEL_COLORS[5],
    description:
      "Tài sản ròng ≥ 10× Freedom Number — đủ truyền lại nhiều thế hệ + đóng góp cộng đồng. Tâm thức chuyển từ 'kiếm tiền' sang 'để lại giá trị'.",
    criteria: [
      "Tài sản ròng ≥ 10× Freedom Number",
      "Có quỹ thừa kế / quỹ giáo dục cho thế hệ sau",
      "Có kế hoạch từ thiện · đóng góp xã hội bài bản",
      "Đã thiết lập cấu trúc pháp lý (trust, di chúc, holding company)",
    ],
    nextStep:
      "Cấp độ cao nhất — tập trung tối ưu thuế · pháp lý · chuyển giao + giáo dục tài chính cho thế hệ sau.",
  },
];

/** Đoán cấp độ hiện tại của học viên dựa trên dữ liệu */
function computeFinancialLevel(
  data: BlueprintData,
  wealthScore: number
): { current: number; progress: number } {
  void wealthScore;
  const ins = data.status ?? {};
  const cf = ins.cashflow ?? {};
  const nw = ins.netWorth ?? {};
  const l = nw.liabilities ?? {};

  const hasBadDebt =
    (l.creditCard ?? 0) > 0 ||
    (l.personalLoan ?? 0) > 0 ||
    (l.installment ?? 0) > 0 ||
    (l.onlineLoan ?? 0) > 0 ||
    (l.cryptoLoan ?? 0) > 0 ||
    (l.marginStock ?? 0) > 0 ||
    l.hasPastDueDebt === true ||
    l.hasHighInterestDebt === true;

  if (hasBadDebt) return { current: 1, progress: 30 };

  // Cấp 2 mới: thanh khoản ≥ 12 tháng chi tiêu thiết yếu
  const essentialMonthly = computeEssentialMonthlyLocal(cf);
  const twelveMonthsEssential = essentialMonthly * 12;
  const liquidAssets =
    (nw.assets?.cash ?? 0) +
    (nw.assets?.bankAccount ?? 0) +
    (nw.assets?.savings ?? 0) +
    (nw.assets?.goldCertificate ?? 0) +
    (nw.assets?.moneyMarketFund ?? 0);

  const level2OK = liquidAssets >= twelveMonthsEssential && essentialMonthly > 0;
  if (!level2OK) return { current: 2, progress: 50 };

  const totalAssets = sumNumberValues(nw.assets);
  const totalDebt = sumNumberValues(nw.liabilities);
  const debtRatio = totalAssets > 0 ? (totalDebt / totalAssets) * 100 : 0;

  // Cấp 3: tài sản thanh khoản ≥ 10 năm chi tiêu thiết yếu
  // (Có thể bù trừ bằng mệnh giá bảo hiểm nhân thọ)
  const tenYearEssential = essentialMonthly * 120;
  const lifeInsurance = ins.insurance?.coverage?.life ?? 0;
  const effectiveTarget = Math.max(0, tenYearEssential - lifeInsurance);

  const level3OK = liquidAssets >= effectiveTarget && essentialMonthly > 0;

  if (!level3OK || debtRatio > 40) return { current: 3, progress: 70 };

  const monthlyExpense =
    sumNumberValues(cf.fixedCosts) + sumNumberValues(cf.variableCosts);
  const passiveIncome = computePassiveIncomeLocal(cf);

  // Cấp 4 mới — 2 điều kiện OR:
  // ĐK1: có thu nhập thụ động (≥ chi tiêu /tháng) — tiêu chí gốc
  // ĐK2: investable assets ≥ chi năm / 4% (= chi năm × 25)
  const annualExpense = monthlyExpense * 12;
  const freedomNumber = annualExpense * 25;
  const assetsRec = nw.assets as Record<string, number | undefined> | undefined;
  const investableAssets =
    liquidAssets + computeGrowthAssetsLocal(assetsRec) +
    computeCashflowAssetsLocal(assetsRec);

  const condition1 = passiveIncome >= monthlyExpense; // passive ≥ chi tiêu
  const condition2 = investableAssets >= freedomNumber;
  const level4OK = (condition1 || condition2) && monthlyExpense > 0;

  if (!level4OK) return { current: 4, progress: 75 };

  const netWorth = totalAssets - totalDebt;
  void netWorth;

  // Cấp 5 mới — threshold tuyệt đối:
  // ĐK1: passive ≥ 1 tỷ/tháng (1,000,000,000 đ)
  // ĐK2: investable assets ≥ 100 tỷ (100,000,000,000 đ)
  const ONE_BILLION = 1_000_000_000;
  const HUNDRED_BILLION = 100_000_000_000;
  const cond5_passive = passiveIncome >= ONE_BILLION;
  const cond5_assets = investableAssets >= HUNDRED_BILLION;
  const level5OK = cond5_passive || cond5_assets;

  if (!level5OK) return { current: 5, progress: 85 };

  // Cấp 6 — di sản: cần investable ≥ 1000 tỷ (10× ngưỡng Cấp 5)
  if (investableAssets < HUNDRED_BILLION * 10) {
    return { current: 6, progress: 90 };
  }

  return { current: 6, progress: 100 };
}

function sumNumberValues(o: object | undefined): number {
  if (!o) return 0;
  return Object.values(o as Record<string, unknown>).reduce<number>(
    (s, v) => s + (typeof v === "number" ? v : 0),
    0
  );
}

/** Tài sản tăng trưởng — bao gồm legacy stocks/funds */
function computeGrowthAssetsLocal(
  a: Record<string, number | undefined> | undefined
): number {
  if (!a) return 0;
  return (
    (a.rawLand ?? 0) +
    (a.agriLand ?? 0) +
    (a.individualStocks ?? 0) +
    (a.stocks ?? 0) +
    (a.equityFunds ?? 0) +
    (a.funds ?? 0) +
    (a.etf ?? 0) +
    (a.privateEquity ?? 0) +
    (a.startup ?? 0) +
    (a.propertyForGrowth ?? 0) +
    (a.otherGrowth ?? 0)
  );
}

/** Tài sản dòng tiền (đầu tư sinh dòng tiền) — bao gồm legacy bonds */
function computeCashflowAssetsLocal(
  a: Record<string, number | undefined> | undefined
): number {
  if (!a) return 0;
  return (
    (a.rentalProperty ?? 0) +
    (a.bondsForCashflow ?? 0) +
    (a.bonds ?? 0) +
    (a.dividendStocks ?? 0) +
    (a.businessEquity ?? 0) +
    (a.passiveSystem ?? 0) +
    (a.royaltyAsset ?? 0) +
    (a.lendingCapital ?? 0) +
    (a.otherCashflow ?? 0)
  );
}

/** Chi tiêu thiết yếu /tháng = fixed costs + food (var.food) */
function computeEssentialMonthlyLocal(cf: CashflowData): number {
  const f = cf.fixedCosts ?? {};
  const v = cf.variableCosts ?? {};
  const fixedSum =
    (f.housing ?? 0) +
    (f.utilities ?? 0) +
    (f.education ?? 0) +
    (f.insurance ?? 0) +
    (f.debt ?? 0) +
    (f.transport ?? 0);
  const food = v.food ?? 0;
  const healthcare = v.healthcare ?? 0;
  return fixedSum + food + healthcare;
}

function computeIncomeTotalLocal(cf: CashflowData): number {
  const inc = cf.income ?? {};
  const salaryBase = inc.salaryBase ?? inc.personal ?? 0;
  const salary = salaryBase + (inc.salaryBonus ?? 0) + (inc.spouse ?? 0);
  const business = inc.businessProfit ?? 0;
  const newPassive =
    (inc.passiveRental ?? 0) +
    (inc.passiveInvestment ?? 0) +
    (inc.passiveRoyalty ?? 0);
  const passive = newPassive > 0 ? newPassive : inc.passive ?? 0;
  return salary + business + passive + (inc.other ?? 0);
}

function computePassiveIncomeLocal(cf: CashflowData): number {
  const inc = cf.income ?? {};
  const newPassive =
    (inc.passiveRental ?? 0) +
    (inc.passiveInvestment ?? 0) +
    (inc.passiveRoyalty ?? 0);
  return newPassive > 0 ? newPassive : inc.passive ?? 0;
}

function FinancialLevelsOverview({
  data,
  wealthScore,
}: {
  data: BlueprintData;
  wealthScore: number;
}) {
  const { current, progress } = computeFinancialLevel(data, wealthScore);
  const currentLevel = FINANCIAL_LEVELS[current - 1];

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          padding: 22,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${currentLevel.color}11, ${CREAM_LIGHT})`,
          border: `1.5px solid ${currentLevel.color}55`,
          boxShadow: `0 6px 20px ${currentLevel.color}22`,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${currentLevel.color}44, ${currentLevel.color}11)`,
              border: `2px solid ${currentLevel.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              boxShadow: `0 4px 14px ${currentLevel.color}55`,
            }}
          >
            {currentLevel.emoji}
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: GOLD_DARK,
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Bạn đang ở
            </div>
            <h3
              style={{
                fontFamily: SERIF,
                fontSize: 26,
                fontWeight: 900,
                color: currentLevel.color,
                margin: "2px 0",
                lineHeight: 1.15,
              }}
            >
              Cấp độ {currentLevel.num}: {currentLevel.name}
            </h3>
            <div style={{ fontSize: 11, color: TEXT_MUTED, fontStyle: "italic" }}>
              {progress}% hoàn thành cấp độ này
            </div>
          </div>
        </div>

        {/* Staircase */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 220, marginTop: 28 }}>
          {FINANCIAL_LEVELS.map((lvl) => {
            const stepHeight = 30 + lvl.num * 28;
            const isCurrent = lvl.num === current;
            const isPast = lvl.num < current;
            const isFuture = lvl.num > current;
            return (
              <div
                key={lvl.num}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  position: "relative",
                }}
              >
                {isCurrent && (
                  <div
                    style={{
                      position: "absolute",
                      top: -28,
                      background: `linear-gradient(135deg, ${NAVY_DARK}, ${NAVY})`,
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: 1,
                      border: `2px solid ${GOLD}`,
                      boxShadow: `0 4px 10px ${NAVY}55`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    📍 BẠN Ở ĐÂY
                  </div>
                )}
                <div
                  style={{
                    width: "100%",
                    height: stepHeight,
                    background: isPast
                      ? `linear-gradient(180deg, ${lvl.color}cc, ${shade(lvl.color, -25)})`
                      : isCurrent
                        ? `linear-gradient(180deg, ${lvl.color}, ${shade(lvl.color, -30)})`
                        : `${lvl.color}33`,
                    border: isCurrent
                      ? `2.5px solid ${GOLD}`
                      : `1px solid ${lvl.color}77`,
                    borderRadius: "6px 6px 0 0",
                    boxShadow: isCurrent
                      ? `0 -4px 16px ${lvl.color}77, inset 0 1px 4px rgba(255,255,255,0.3)`
                      : isPast
                        ? `inset 0 1px 3px rgba(255,255,255,0.25)`
                        : "none",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingTop: 8,
                    fontSize: 18,
                    opacity: isFuture ? 0.55 : 1,
                  }}
                >
                  {lvl.emoji}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: isCurrent ? lvl.color : isPast ? lvl.color : TEXT_MUTED,
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}
                >
                  Cấp {lvl.num}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? lvl.color : NAVY,
                    textAlign: "center",
                    lineHeight: 1.15,
                  }}
                >
                  {lvl.shortName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          padding: 18,
          background: "#fff",
          borderRadius: 12,
          border: `1px solid ${currentLevel.color}33`,
          borderLeft: `4px solid ${currentLevel.color}`,
        }}
      >
        <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 8px" }}>
          Tóm tắt cấp độ hiện tại
        </h4>
        <p style={{ fontSize: 12.5, color: TEXT_BODY, margin: "0 0 12px", lineHeight: 1.6 }}>
          {currentLevel.description}
        </p>
        <div
          style={{
            padding: 12,
            background: `${currentLevel.color}0d`,
            borderRadius: 8,
            border: `1px solid ${currentLevel.color}33`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: currentLevel.color,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            🎯 Bước tiếp theo
          </div>
          <p style={{ fontSize: 12, color: TEXT_DARK, margin: 0, lineHeight: 1.6 }}>
            {currentLevel.nextStep}
          </p>
        </div>
      </div>
    </div>
  );
}

function FinancialLevelDetail({
  level,
  data,
  wealthScore,
}: {
  level: FinancialLevel;
  data: BlueprintData;
  wealthScore: number;
}) {
  const { current } = computeFinancialLevel(data, wealthScore);
  const status =
    level.num < current
      ? "achieved"
      : level.num === current
        ? "current"
        : "future";

  const statusBadge =
    status === "achieved"
      ? { label: "✓ Đã đạt", color: SUCCESS }
      : status === "current"
        ? { label: "📍 Bạn đang ở đây", color: GOLD_DARK }
        : { label: "⏳ Chưa đạt", color: TEXT_MUTED };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          padding: 22,
          borderRadius: 14,
          background:
            status === "current"
              ? `linear-gradient(135deg, ${level.color}22, ${CREAM_LIGHT})`
              : `linear-gradient(135deg, ${level.color}11, ${CREAM_LIGHT})`,
          border: `1.5px solid ${level.color}55`,
          boxShadow: `0 6px 20px ${level.color}22`,
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 18,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: `linear-gradient(135deg, ${level.color}55, ${level.color}11)`,
            border: `2.5px solid ${level.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 42,
            boxShadow: `0 6px 16px ${level.color}55`,
          }}
        >
          {level.emoji}
        </div>
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: GOLD_DARK,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Cấp độ {level.num} · {level.shortName}
          </div>
          <h2
            style={{
              fontFamily: SERIF,
              fontSize: 28,
              fontWeight: 900,
              color: level.color,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {level.name}
          </h2>
        </div>
        <span
          style={{
            padding: "8px 16px",
            borderRadius: 999,
            background: `${statusBadge.color}22`,
            border: `1.5px solid ${statusBadge.color}`,
            color: statusBadge.color,
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* 2-col layout: LEFT description + criteria, RIGHT projection */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 1fr)",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* LEFT col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              padding: 18,
              background: "#fff",
              borderRadius: 12,
              border: `1px solid ${NAVY}11`,
            }}
          >
            <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 8px" }}>
              Cấp độ này là gì?
            </h4>
            <p style={{ fontSize: 13, color: TEXT_BODY, lineHeight: 1.7, margin: 0 }}>
              {level.description}
            </p>
          </div>

          <div
            style={{
              padding: 18,
              background: "#fff",
              borderRadius: 12,
              border: `1px solid ${NAVY}11`,
            }}
          >
            <h4 style={{ fontFamily: SERIF, fontSize: 14, color: NAVY, margin: "0 0 12px" }}>
              Tiêu chí đạt cấp độ này
            </h4>
            <div style={{ display: "grid", gap: 8 }}>
              {level.criteria.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: 10,
                    padding: 10,
                    background: `${level.color}08`,
                    border: `1px solid ${level.color}33`,
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: `${level.color}22`,
                      color: level.color,
                      fontWeight: 900,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: SERIF,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: NAVY,
                      fontWeight: 600,
                      lineHeight: 1.55,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {c}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT col — Projection */}
        <LevelProjectionPanel level={level} data={data} status={status} />
      </div>

      {/* Bước tiếp theo */}
      <div
        style={{
          padding: 18,
          background: `linear-gradient(135deg, ${NAVY}, ${NAVY_DARK})`,
          borderRadius: 12,
          color: "#fff",
          border: `1px solid ${GOLD}66`,
          boxShadow: `0 6px 18px ${NAVY}33`,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: GOLD_LIGHT,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 8,
            textAlign: "center",
            fontFamily: SERIF,
          }}
        >
          ✦ Bước tiếp theo ✦
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#e5e7eb", margin: 0, textAlign: "center" }}>
          {level.nextStep}
        </p>
      </div>
    </div>
  );
}

/* ─── LevelProjectionPanel — dự phóng riêng từng cấp ─── */

function LevelProjectionPanel({
  level,
  data,
  status,
}: {
  level: FinancialLevel;
  data: BlueprintData;
  status: "achieved" | "current" | "future";
}) {
  // Compute key metrics
  const cf = data.status?.cashflow ?? {};
  const l = data.status?.netWorth?.liabilities ?? {};
  const a = data.status?.netWorth?.assets ?? {};

  const monthlyIncome = computeIncomeTotalLocal(cf);
  const monthlyExpense =
    sumNumberValues(cf.fixedCosts) + sumNumberValues(cf.variableCosts);
  const monthlySavings = sumNumberValues(cf.savings);
  const monthlySurplus = monthlyIncome - monthlyExpense - monthlySavings;

  const passiveIncome = computePassiveIncomeLocal(cf);

  // Bad debt (Cấp 1)
  const badDebt =
    (l.creditCard ?? 0) +
    (l.personalLoan ?? 0) +
    (l.installment ?? 0) +
    (l.onlineLoan ?? 0) +
    (l.cryptoLoan ?? 0) +
    (l.marginStock ?? 0);

  // Liquid assets — dùng cho Cấp 2 (12 tháng) + Cấp 3 (10 năm với BH bù trừ)
  const currentLiquid =
    (a.cash ?? 0) +
    (a.bankAccount ?? 0) +
    (a.savings ?? 0) +
    (a.goldCertificate ?? 0) +
    (a.moneyMarketFund ?? 0);

  // Tổng tài sản (dùng cho Cấp 5/6 nếu cần)
  void sumNumberValues(a);
  void sumNumberValues(l);

  // Build content per level
  let metric: ProjectionMetric;
  switch (level.num) {
    case 1: {
      metric = projectionForLevel1(badDebt, monthlySurplus);
      break;
    }
    case 2: {
      const essentialMonthly = computeEssentialMonthlyLocal(cf);
      metric = projectionForLevel2(
        currentLiquid,
        essentialMonthly,
        monthlySavings + Math.max(0, monthlySurplus)
      );
      break;
    }
    case 3: {
      const essentialMonthly = computeEssentialMonthlyLocal(cf);
      const lifeInsurance =
        data.status?.insurance?.coverage?.life ?? 0;
      metric = projectionForLevel3(
        currentLiquid,
        essentialMonthly,
        lifeInsurance,
        monthlySavings + Math.max(0, monthlySurplus)
      );
      break;
    }
    case 4: {
      const liquidPart =
        (a.cash ?? 0) +
        (a.bankAccount ?? 0) +
        (a.savings ?? 0) +
        (a.goldCertificate ?? 0) +
        (a.moneyMarketFund ?? 0);
      const aRec = a as Record<string, number | undefined>;
      const investablePart =
        liquidPart +
        computeGrowthAssetsLocal(aRec) +
        computeCashflowAssetsLocal(aRec);
      metric = projectionForLevel4(
        passiveIncome,
        monthlyExpense,
        investablePart
      );
      break;
    }
    case 5: {
      const aRec5 = a as Record<string, number | undefined>;
      const liquidPart5 =
        (a.cash ?? 0) +
        (a.bankAccount ?? 0) +
        (a.savings ?? 0) +
        (a.goldCertificate ?? 0) +
        (a.moneyMarketFund ?? 0);
      const investablePart5 =
        liquidPart5 +
        computeGrowthAssetsLocal(aRec5) +
        computeCashflowAssetsLocal(aRec5);
      metric = projectionForLevel5(
        passiveIncome,
        investablePart5,
        monthlySurplus
      );
      break;
    }
    case 6:
    default: {
      const aRec6 = a as Record<string, number | undefined>;
      const liquidPart6 =
        (a.cash ?? 0) +
        (a.bankAccount ?? 0) +
        (a.savings ?? 0) +
        (a.goldCertificate ?? 0) +
        (a.moneyMarketFund ?? 0);
      const investablePart6 =
        liquidPart6 +
        computeGrowthAssetsLocal(aRec6) +
        computeCashflowAssetsLocal(aRec6);
      metric = projectionForLevel6(investablePart6);
      break;
    }
  }

  // If already achieved this level → show celebration version
  const isAchieved = status === "achieved";

  return (
    <div
      style={{
        padding: 18,
        background: `linear-gradient(135deg, ${level.color}0a, #fff 60%), #fff`,
        borderRadius: 12,
        border: `1px solid ${level.color}55`,
        borderTop: `4px solid ${level.color}`,
        boxShadow: `0 4px 14px ${level.color}11`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: GOLD_DARK,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {isAchieved ? "Đã đạt cấp này" : "Dự phóng cá nhân"}
        </div>
        <h4
          style={{
            fontFamily: SERIF,
            fontSize: 16,
            color: NAVY,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {metric.title}
        </h4>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gap: 8 }}>
        {metric.stats.map((s, i) => (
          <ProjectionStatRow key={i} {...s} />
        ))}
      </div>

      {/* Hero result */}
      {metric.hero && (
        <div
          style={{
            padding: "14px 16px",
            background: `linear-gradient(135deg, ${metric.heroColor ?? level.color}, ${shade(metric.heroColor ?? level.color, -25)})`,
            color: "#fff",
            borderRadius: 10,
            border: `1.5px solid ${GOLD}77`,
            boxShadow: `0 4px 12px ${(metric.heroColor ?? level.color)}44`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: GOLD_LIGHT,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {metric.heroLabel}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            {metric.hero}
          </div>
          {metric.heroSub && (
            <div
              style={{
                fontSize: 10.5,
                color: GOLD_LIGHT,
                marginTop: 4,
                fontStyle: "italic",
              }}
            >
              {metric.heroSub}
            </div>
          )}
        </div>
      )}

      {/* Note / advice */}
      {metric.note && (
        <div
          style={{
            padding: 12,
            background: `${level.color}11`,
            border: `1px solid ${level.color}44`,
            borderRadius: 8,
            fontSize: 11.5,
            color: TEXT_BODY,
            lineHeight: 1.55,
          }}
        >
          💡 {metric.note}
        </div>
      )}
    </div>
  );
}

interface ProjectionMetric {
  title: string;
  stats: {
    label: string;
    value: string;
    color?: string;
  }[];
  hero?: string;
  heroLabel?: string;
  heroSub?: string;
  heroColor?: string;
  note?: string;
}

function ProjectionStatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "8px 10px",
        background: "#fafafa",
        border: `1px solid ${NAVY}11`,
        borderRadius: 8,
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11.5, color: TEXT_BODY, fontWeight: 600 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: color ?? NAVY,
          fontFamily: SERIF,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Per-level projection logic ─── */

function projectionForLevel1(badDebt: number, surplus: number): ProjectionMetric {
  if (badDebt === 0) {
    return {
      title: "Đã sạch nợ xấu",
      stats: [
        { label: "Tổng nợ xấu hiện tại", value: "0₫", color: SUCCESS },
        { label: "Trạng thái", value: "Hoàn thành ✓", color: SUCCESS },
      ],
      hero: "0 tháng",
      heroLabel: "Thời gian xóa nợ xấu",
      heroSub: "Anh/chị đã vượt qua cấp này",
      heroColor: SUCCESS,
      note: "Tiếp tục giữ kỷ luật: không vay tiêu dùng mới + đóng quỹ dự phòng để vượt sang Cấp 2.",
    };
  }

  if (surplus <= 0) {
    return {
      title: "Dự phóng xóa nợ xấu",
      stats: [
        { label: "Tổng nợ xấu", value: fmtCompactLocal(badDebt), color: DANGER },
        { label: "Mức dư hàng tháng", value: fmtCompactLocal(surplus), color: DANGER },
      ],
      hero: "Không đủ dư",
      heroLabel: "Thời gian dự kiến",
      heroSub: "Cần cắt giảm chi tiêu để có dư",
      heroColor: DANGER,
      note: "Dòng tiền đang âm hoặc bằng 0 — không có nguồn để trả nợ xấu. Ưu tiên: cắt chi không thiết yếu + tăng thu trước khi xử lý nợ.",
    };
  }

  const months = Math.ceil(badDebt / surplus);
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  const timeStr =
    years > 0
      ? `${years} năm ${remainMonths > 0 ? remainMonths + " tháng" : ""}`.trim()
      : `${months} tháng`;
  const interestEstimate = badDebt * 0.02 * months; // ~2%/tháng (24%/năm) lãi xấp xỉ

  return {
    title: "Dự phóng xóa nợ xấu",
    stats: [
      { label: "Tổng nợ xấu", value: fmtCompactLocal(badDebt), color: DANGER },
      { label: "Mức dư hàng tháng", value: fmtCompactLocal(surplus), color: SUCCESS },
      { label: "Lãi phát sinh ước tính", value: `~ ${fmtCompactLocal(interestEstimate)}`, color: WARNING },
    ],
    hero: timeStr,
    heroLabel: "Thời gian xóa nợ xấu",
    heroSub: `Trả ${fmtCompactLocal(surplus)} /tháng đều đặn`,
    heroColor: months <= 12 ? SUCCESS : months <= 36 ? WARNING : DANGER,
    note:
      months > 24
        ? "Lộ trình hơi dài — cân nhắc thương lượng giảm lãi suất hoặc tăng dư qua side income để rút ngắn xuống < 24 tháng."
        : "Lộ trình khả thi. Tự động hoá việc trả nợ ngay đầu tháng để tránh tiêu nhầm.",
  };
}

function projectionForLevel2(
  liquidAssets: number,
  essentialMonthly: number,
  monthlyAdd: number
): ProjectionMetric {
  if (essentialMonthly === 0) {
    return {
      title: "Chưa có dữ liệu chi thiết yếu",
      stats: [],
      note: "Quay lại Phần IV để nhập chi cố định + thực phẩm — hệ thống tính ngưỡng Thoát nghèo.",
    };
  }

  const target = essentialMonthly * 12;

  if (liquidAssets >= target) {
    return {
      title: "Đã thoát nghèo",
      stats: [
        { label: "Chi thiết yếu /tháng", value: fmtCompactLocal(essentialMonthly) },
        { label: "Mục tiêu 12 tháng chi", value: fmtCompactLocal(target) },
        { label: "Thanh khoản hiện có", value: fmtCompactLocal(liquidAssets), color: SUCCESS },
      ],
      hero: "Đã đạt ✓",
      heroLabel: "Thanh khoản 12 tháng chi",
      heroColor: SUCCESS,
      note: "Tiếp tục nâng quỹ thanh khoản lên 10 năm chi thiết yếu (Cấp 3 — An toàn tài chính).",
    };
  }

  const gap = target - liquidAssets;

  if (monthlyAdd <= 0) {
    return {
      title: "Dự phóng Thoát nghèo",
      stats: [
        { label: "Chi thiết yếu /tháng", value: fmtCompactLocal(essentialMonthly) },
        { label: "Mục tiêu 12 tháng chi", value: fmtCompactLocal(target), color: GOLD_DARK },
        { label: "Thanh khoản hiện có", value: fmtCompactLocal(liquidAssets) },
        { label: "Còn thiếu", value: fmtCompactLocal(gap), color: WARNING },
      ],
      hero: "Không có dư",
      heroLabel: "Tốc độ tích lũy /tháng",
      heroColor: DANGER,
      note: "Chưa có dư để tích lũy. Ưu tiên tăng tỉ lệ tiết kiệm lên ≥ 10% thu nhập + cắt chi không thiết yếu.",
    };
  }

  const months = Math.ceil(gap / monthlyAdd);
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  const timeStr =
    months >= 12
      ? `${years} năm ${remainMonths > 0 ? remainMonths + " tháng" : ""}`.trim()
      : `${months} tháng`;

  return {
    title: "Dự phóng Thoát nghèo",
    stats: [
      { label: "Chi thiết yếu /tháng", value: fmtCompactLocal(essentialMonthly) },
      { label: "Mục tiêu 12 tháng chi", value: fmtCompactLocal(target), color: GOLD_DARK },
      { label: "Thanh khoản hiện có", value: fmtCompactLocal(liquidAssets) },
      { label: "Đóng /tháng", value: fmtCompactLocal(monthlyAdd), color: SUCCESS },
      { label: "Còn thiếu", value: fmtCompactLocal(gap), color: WARNING },
    ],
    hero: timeStr,
    heroLabel: "Thời gian đạt Thoát nghèo",
    heroSub: `Tích lũy ${fmtCompactLocal(monthlyAdd)} /tháng đều đặn`,
    heroColor: months <= 24 ? SUCCESS : months <= 60 ? WARNING : DANGER,
    note:
      months > 60
        ? "Lộ trình dài — cân nhắc tăng thu nhập song song để rút ngắn xuống < 5 năm."
        : "Tự động hoá đóng vào tài khoản tiết kiệm CKH ngay đầu tháng để tránh tiêu nhầm.",
  };
}

function projectionForLevel3(
  liquidAssets: number,
  essentialMonthly: number,
  lifeInsurance: number,
  monthlyAdd: number
): ProjectionMetric {
  if (essentialMonthly === 0) {
    return {
      title: "Chưa có dữ liệu chi thiết yếu",
      stats: [],
      note: "Quay lại Phần IV để nhập chi cố định + thực phẩm — hệ thống tính ngưỡng An toàn tài chính.",
    };
  }
  const tenYearEssential = essentialMonthly * 120;
  const effectiveTarget = Math.max(0, tenYearEssential - lifeInsurance);

  // Đã đạt — thanh khoản ≥ effective target
  if (liquidAssets >= effectiveTarget) {
    return {
      title: "Đã đạt An toàn tài chính",
      stats: [
        { label: "Chi thiết yếu /tháng", value: fmtCompactLocal(essentialMonthly) },
        { label: "10 năm chi thiết yếu", value: fmtCompactLocal(tenYearEssential) },
        ...(lifeInsurance > 0
          ? [{ label: "Mệnh giá BH nhân thọ", value: fmtCompactLocal(lifeInsurance), color: SUCCESS }]
          : []),
        { label: "Mục tiêu hiệu dụng", value: fmtCompactLocal(effectiveTarget) },
        { label: "Tài sản thanh khoản", value: fmtCompactLocal(liquidAssets), color: SUCCESS },
      ],
      hero: "Đã đạt ✓",
      heroLabel: "An toàn 10 năm",
      heroColor: SUCCESS,
      note: "Bước tiếp theo: hoàn thiện BH sức khỏe + bệnh hiểm nghèo + xây tài sản tạo dòng tiền (Cấp 4).",
    };
  }

  const gap = effectiveTarget - liquidAssets;

  if (monthlyAdd <= 0) {
    return {
      title: "Dự phóng đạt An toàn tài chính",
      stats: [
        { label: "Chi thiết yếu /tháng", value: fmtCompactLocal(essentialMonthly) },
        { label: "10 năm chi thiết yếu", value: fmtCompactLocal(tenYearEssential) },
        ...(lifeInsurance > 0
          ? [{ label: "BH nhân thọ bù trừ", value: fmtCompactLocal(lifeInsurance), color: SUCCESS }]
          : []),
        { label: "Mục tiêu hiệu dụng", value: fmtCompactLocal(effectiveTarget), color: GOLD_DARK },
        { label: "Thanh khoản hiện có", value: fmtCompactLocal(liquidAssets) },
        { label: "Còn thiếu", value: fmtCompactLocal(gap), color: WARNING },
      ],
      hero: "Không có dư",
      heroLabel: "Tốc độ tích lũy /tháng",
      heroColor: DANGER,
      note: "Chưa có dư để tích lũy. Ưu tiên: tăng thu nhập + tăng BH nhân thọ (lifecycle, chi phí thấp) để rút ngắn mục tiêu hiệu dụng.",
    };
  }

  const months = Math.ceil(gap / monthlyAdd);
  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  const timeStr =
    months >= 12
      ? `${years} năm ${remainMonths > 0 ? remainMonths + " tháng" : ""}`.trim()
      : `${months} tháng`;

  return {
    title: "Dự phóng đạt An toàn tài chính",
    stats: [
      { label: "Chi thiết yếu /tháng", value: fmtCompactLocal(essentialMonthly) },
      { label: "10 năm chi thiết yếu", value: fmtCompactLocal(tenYearEssential) },
      ...(lifeInsurance > 0
        ? [{ label: "BH nhân thọ bù trừ", value: fmtCompactLocal(lifeInsurance), color: SUCCESS }]
        : []),
      { label: "Mục tiêu hiệu dụng", value: fmtCompactLocal(effectiveTarget), color: GOLD_DARK },
      { label: "Thanh khoản hiện có", value: fmtCompactLocal(liquidAssets) },
      { label: "Đóng /tháng", value: fmtCompactLocal(monthlyAdd), color: SUCCESS },
      { label: "Còn thiếu", value: fmtCompactLocal(gap), color: WARNING },
    ],
    hero: timeStr,
    heroLabel: "Thời gian đạt An toàn",
    heroSub: `Tích lũy ${fmtCompactLocal(monthlyAdd)} /tháng đều đặn`,
    heroColor: months <= 60 ? SUCCESS : months <= 120 ? WARNING : DANGER,
    note:
      lifeInsurance === 0
        ? "Mua BH nhân thọ ngay (mệnh giá ≥ 60 tháng chi thiết yếu) để giảm mạnh mục tiêu hiệu dụng — chi phí phí thấp hơn nhiều so với tích lũy thanh khoản."
        : "Song song tăng thanh khoản, nâng mệnh giá BH nhân thọ + bệnh hiểm nghèo để bảo vệ gia đình khỏi biến cố lớn.",
  };
}

function projectionForLevel4(
  passive: number,
  monthlyExpense: number,
  investableAssets: number
): ProjectionMetric {
  if (monthlyExpense === 0) {
    return {
      title: "Chưa có dữ liệu chi tiêu",
      stats: [],
      note: "Quay lại Phần IV để nhập chi tiêu để hệ thống tính tiêu chí Độc lập tài chính.",
    };
  }

  const annualExpense = monthlyExpense * 12;
  const targetAssets = annualExpense * 25; // Rule 4%
  const ratio = Math.round((passive / monthlyExpense) * 100);
  const assetRatio = Math.round((investableAssets / targetAssets) * 100);

  // ĐK1 (passive ≥ chi tiêu) hoặc ĐK2 (investable assets ≥ chi năm × 25)
  const condition1Met = passive >= monthlyExpense;
  const condition2Met = investableAssets >= targetAssets;

  if (condition1Met || condition2Met) {
    return {
      title: "Đã đạt Độc lập tài chính",
      stats: [
        { label: "Passive income /tháng", value: fmtCompactLocal(passive), color: SUCCESS },
        { label: "Chi tiêu /tháng", value: fmtCompactLocal(monthlyExpense) },
        ...(condition1Met
          ? [{ label: "ĐK1 (Passive ≥ Chi)", value: `${ratio}% ✓`, color: SUCCESS }]
          : [{ label: "ĐK1 (Passive ≥ Chi)", value: `${ratio}%`, color: WARNING }]),
        { label: "Tài sản đầu tư", value: fmtCompactLocal(investableAssets) },
        ...(condition2Met
          ? [{ label: "ĐK2 (≥ Chi năm ÷ 4%)", value: `${assetRatio}% ✓`, color: SUCCESS }]
          : [{ label: "ĐK2 (≥ Chi năm ÷ 4%)", value: `${assetRatio}%`, color: WARNING }]),
      ],
      hero: condition2Met ? `${assetRatio}%` : `${ratio}%`,
      heroLabel: condition2Met ? "Tài sản / Mục tiêu 4%" : "Passive / Chi tiêu",
      heroColor: SUCCESS,
      note:
        "Tiếp tục mở rộng passive income lên ≥ 100% chi tiêu và tăng tài sản đầu tư để bước sang Cấp 5 — Tự do tài chính.",
    };
  }

  // Chưa đạt — hiển thị 2 path
  const passiveGap = monthlyExpense - passive;
  const assetGap = targetAssets - investableAssets;

  return {
    title: "Dự phóng đạt Độc lập tài chính",
    stats: [
      { label: "Chi tiêu /tháng", value: fmtCompactLocal(monthlyExpense) },
      { label: "Chi tiêu /năm", value: fmtCompactLocal(annualExpense) },
      { label: "Passive hiện tại", value: fmtCompactLocal(passive) },
      {
        label: "Cần thêm passive /tháng",
        value: fmtCompactLocal(passiveGap),
        color: GOLD_DARK,
      },
      { label: "Tài sản đầu tư hiện có", value: fmtCompactLocal(investableAssets) },
      {
        label: "Mục tiêu (Chi năm × 25)",
        value: fmtCompactLocal(targetAssets),
        color: GOLD_DARK,
      },
      {
        label: "Còn thiếu tài sản",
        value: fmtCompactLocal(assetGap),
        color: WARNING,
      },
    ],
    hero: fmtCompactLocal(assetGap),
    heroLabel: "Tài sản đầu tư cần xây thêm",
    heroSub: `(Hoặc passive +${fmtCompactLocal(passiveGap)} /tháng)`,
    heroColor: WARNING,
    note:
      "2 đường đến Cấp 4: (a) tăng dòng tiền thụ động (BĐS cho thuê, cổ tức, lãi) HOẶC (b) tích lũy đủ tài sản đầu tư để rule 4% sinh ra dòng tiền phủ chi.",
  };
}

function projectionForLevel5(
  passive: number,
  investableAssets: number,
  monthlySurplus: number
): ProjectionMetric {
  const ONE_BILLION = 1_000_000_000; // 1 tỷ
  const HUNDRED_BILLION = 100_000_000_000; // 100 tỷ

  const passiveRatio = Math.round((passive / ONE_BILLION) * 100);
  const assetRatio = Math.round((investableAssets / HUNDRED_BILLION) * 100);

  const cond1 = passive >= ONE_BILLION;
  const cond2 = investableAssets >= HUNDRED_BILLION;

  if (cond1 || cond2) {
    return {
      title: "Đã đạt Tự do tài chính",
      stats: [
        { label: "Passive income /tháng", value: fmtCompactLocal(passive), color: cond1 ? SUCCESS : undefined },
        { label: "Mục tiêu 1 tỷ /tháng", value: fmtCompactLocal(ONE_BILLION) },
        ...(cond1
          ? [{ label: "ĐK1 (Passive ≥ 1 tỷ)", value: `${passiveRatio}% ✓`, color: SUCCESS }]
          : [{ label: "ĐK1 (Passive ≥ 1 tỷ)", value: `${passiveRatio}%`, color: WARNING }]),
        { label: "Tài sản đầu tư", value: fmtCompactLocal(investableAssets), color: cond2 ? SUCCESS : undefined },
        { label: "Mục tiêu 100 tỷ", value: fmtCompactLocal(HUNDRED_BILLION) },
        ...(cond2
          ? [{ label: "ĐK2 (TS ≥ 100 tỷ)", value: `${assetRatio}% ✓`, color: SUCCESS }]
          : [{ label: "ĐK2 (TS ≥ 100 tỷ)", value: `${assetRatio}%`, color: WARNING }]),
      ],
      hero: cond2 ? `${assetRatio}%` : `${passiveRatio}%`,
      heroLabel: cond2 ? "Tài sản / 100 tỷ" : "Passive / 1 tỷ",
      heroColor: SUCCESS,
      note: "Tiếp tục mở rộng tài sản lên ≥ 1.000 tỷ để xây dựng Di sản tài chính (Cấp 6).",
    };
  }

  // Chưa đạt — tính số năm để đạt 100 tỷ TS bằng compound 7%/năm
  const monthlyCompound = monthlySurplus > 0 ? monthlySurplus : 0;
  let yearsToReach = -1;
  if (monthlyCompound > 0) {
    const r = 0.07 / 12;
    let ass = investableAssets;
    let m = 0;
    while (ass < HUNDRED_BILLION && m < 600) {
      // Max 50 năm
      ass = ass * (1 + r) + monthlyCompound;
      m++;
    }
    yearsToReach = m >= 600 ? -1 : Math.ceil(m / 12);
  }

  const passiveGap = ONE_BILLION - passive;
  const assetGap = HUNDRED_BILLION - investableAssets;

  return {
    title: "Dự phóng đạt Tự do tài chính",
    stats: [
      { label: "Passive hiện tại", value: fmtCompactLocal(passive) },
      { label: "Mục tiêu 1 tỷ /tháng", value: fmtCompactLocal(ONE_BILLION), color: GOLD_DARK },
      { label: "Còn thiếu passive", value: fmtCompactLocal(passiveGap), color: WARNING },
      { label: "Tài sản đầu tư", value: fmtCompactLocal(investableAssets) },
      { label: "Mục tiêu 100 tỷ", value: fmtCompactLocal(HUNDRED_BILLION), color: GOLD_DARK },
      { label: "Còn thiếu tài sản", value: fmtCompactLocal(assetGap), color: WARNING },
      { label: "Đầu tư /tháng", value: fmtCompactLocal(monthlySurplus) },
    ],
    hero:
      yearsToReach > 0
        ? `${yearsToReach} năm`
        : monthlyCompound === 0
          ? "Chưa có dư"
          : "> 50 năm",
    heroLabel: "Thời gian đạt 100 tỷ (lãi 7%/năm)",
    heroSub:
      yearsToReach > 0
        ? `Đầu tư đều ${fmtCompactLocal(monthlySurplus)} /tháng`
        : "Cần tăng dòng tiền đầu tư đáng kể",
    heroColor: yearsToReach > 0 && yearsToReach <= 20 ? SUCCESS : WARNING,
    note: "Tự do tài chính cấp độ tỷ phú — cần đa dạng danh mục (cổ phiếu tăng trưởng + BĐS + cổ phần DN) và tận dụng lãi kép dài hạn.",
  };
}

function projectionForLevel6(investableAssets: number): ProjectionMetric {
  const HUNDRED_BILLION = 100_000_000_000;
  const target = HUNDRED_BILLION * 10; // 1.000 tỷ
  const ratio = investableAssets > 0 ? Math.round((investableAssets / target) * 100) : 0;

  if (investableAssets >= target) {
    return {
      title: "Đã đạt Di sản tài chính",
      stats: [
        { label: "Tài sản đầu tư", value: fmtCompactLocal(investableAssets), color: SUCCESS },
        { label: "Mục tiêu (1.000 tỷ)", value: fmtCompactLocal(target) },
      ],
      hero: "🏆 Hoàn thành",
      heroLabel: "Cấp độ cao nhất",
      heroColor: SUCCESS,
      note: "Tập trung vào di sản: trust, quỹ giáo dục, từ thiện bài bản và tối ưu thuế chuyển giao đa thế hệ.",
    };
  }

  return {
    title: "Dự phóng đạt Di sản tài chính",
    stats: [
      { label: "Tài sản đầu tư", value: fmtCompactLocal(investableAssets) },
      { label: "Mục tiêu (10× Cấp 5 = 1.000 tỷ)", value: fmtCompactLocal(target), color: GOLD_DARK },
      { label: "Tiến độ", value: `${ratio}%`, color: ratio >= 20 ? SUCCESS : WARNING },
    ],
    hero: `${ratio}%`,
    heroLabel: "Tiến độ Di sản",
    heroSub: "Cấp độ tối thượng — không đặt deadline",
    heroColor: WARNING,
    note: "Khi đạt Tự do tài chính, tự nhiên có thể tích lũy tiếp lên Di sản nhờ lãi kép + tài sản tăng trưởng + chuyển giao đa thế hệ.",
  };
}
