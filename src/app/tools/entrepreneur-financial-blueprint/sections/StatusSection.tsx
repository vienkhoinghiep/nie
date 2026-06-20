"use client";

import { useState } from "react";
import { Wallet, Scale, HeartHandshake, CheckCircle2 } from "lucide-react";
import type { ProfileData, StatusData } from "@/lib/blueprint/types";
import CashflowSection from "./CashflowSection";
import NetWorthSubSection from "./status/NetWorthSubSection";
import InsuranceSubSection from "./status/InsuranceSubSection";

const BRAND = "#2563EB";
const GREEN = "#22c55e";

type SubKey = "cashflow" | "networth" | "insurance";

interface Props {
  data: StatusData;
  onChange: (next: StatusData) => void;
  onComplete: () => void;
  /** Profile data dùng để tính đề xuất DIME bảo hiểm (số con, …) */
  profile?: ProfileData;
}

const SUBS = [
  {
    key: "cashflow" as const,
    label: "Cân Đối Thu Chi",
    short: "Dòng tiền hàng tháng",
    icon: Wallet,
    color: "#2563EB",
  },
  {
    key: "networth" as const,
    label: "Cân Đối Tài Sản",
    short: "Net Worth — TS / Nợ",
    icon: Scale,
    color: "#3b82f6",
  },
  {
    key: "insurance" as const,
    label: "Bảo Hiểm",
    short: "DIME · 5 loại BH · phí hợp lý",
    icon: HeartHandshake,
    color: "#22c55e",
  },
];

export default function StatusSection({
  data,
  onChange,
  onComplete,
  profile,
}: Props) {
  const [activeSub, setActiveSub] = useState<SubKey>("cashflow");

  const cashflowHasData = !!(
    data.cashflow &&
    (Object.keys(data.cashflow.income ?? {}).length > 0 ||
      Object.keys(data.cashflow.fixedCosts ?? {}).length > 0 ||
      Object.keys(data.cashflow.variableCosts ?? {}).length > 0)
  );
  const netWorthHasData = !!(
    data.netWorth &&
    (Object.keys(data.netWorth.assets ?? {}).length > 0 ||
      Object.keys(data.netWorth.liabilities ?? {}).length > 0)
  );
  const insuranceHasData = !!(
    data.insurance &&
    (Object.keys(data.insurance.coverage ?? {}).length > 0 ||
      (data.insurance.monthlyPremium ?? 0) > 0)
  );
  const allDone = cashflowHasData && netWorthHasData && insuranceHasData;

  return (
    <div className="space-y-4">
      {/* Sub-tab nav */}
      <div className="grid sm:grid-cols-3 gap-2">
        {SUBS.map((s) => {
          const Icon = s.icon;
          const active = s.key === activeSub;
          const done =
            s.key === "cashflow"
              ? cashflowHasData
              : s.key === "networth"
                ? netWorthHasData
                : insuranceHasData;
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

      {activeSub === "cashflow" && (
        <CashflowSection
          data={data.cashflow ?? {}}
          onChange={(v) => onChange({ ...data, cashflow: v })}
          onComplete={() => {}}
          hideCompleteCta
        />
      )}
      {activeSub === "networth" && (
        <NetWorthSubSection
          data={data.netWorth ?? {}}
          onChange={(v) => onChange({ ...data, netWorth: v })}
        />
      )}
      {activeSub === "insurance" && (
        <InsuranceSubSection
          data={data.insurance ?? {}}
          onChange={(v) => onChange({ ...data, insurance: v })}
          cashflow={data.cashflow}
          profile={profile}
        />
      )}

      {/* Section-level complete */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1f1f1f]">
        <div className="text-[11px] text-gray-500">
          {allDone
            ? "✓ Đã có dữ liệu thu chi + tài sản."
            : "Nhập đủ cả thu chi và tài sản để hoàn thành Phần IV."}
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
          Hoàn thành Phần IV · Xem báo cáo →
        </button>
      </div>
    </div>
  );
}
