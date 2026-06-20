"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Loader2,
  Target,
  ShoppingCart,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

interface MarketingCostProps {
  from: string;
  to: string;
  revenue: number;
  orders: number;
  leads: number;
}

interface Entry {
  id: string;
  channel: string;
  period_start: string;
  period_end: string;
  amount: number;
  prorated: number;
  note: string | null;
  source: string;
}

const CHANNELS: { key: string; label: string; color: string }[] = [
  { key: "google_ads", label: "Google Ads", color: "#4285F4" },
  { key: "facebook_ads", label: "Facebook Ads", color: "#1877F2" },
  { key: "zalo_ads", label: "Zalo Ads", color: "#0068FF" },
  { key: "tiktok_ads", label: "TikTok Ads", color: "#ec4899" },
  { key: "other", label: "Khác", color: "#6b7280" },
];
const channelLabel = (k: string) =>
  CHANNELS.find((c) => c.key === k)?.label ?? k;
const channelColor = (k: string) =>
  CHANNELS.find((c) => c.key === k)?.color ?? "#6b7280";

const fmtVND = (v: number) => Math.round(v).toLocaleString("vi-VN") + "đ";

export default function MarketingCost({
  from,
  to,
  revenue,
  orders,
  leads,
}: MarketingCostProps) {
  const [total, setTotal] = useState(0);
  const [byChannel, setByChannel] = useState<Record<string, number>>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [fChannel, setFChannel] = useState("google_ads");
  const [fAmount, setFAmount] = useState("");
  const [fStart, setFStart] = useState(from);
  const [fEnd, setFEnd] = useState(to);
  const [fNote, setFNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/analytics/marketing?from=${from}&to=${to}`
      );
      if (res.ok) {
        const data = await res.json();
        setTotal(data.total ?? 0);
        setByChannel(data.byChannel ?? {});
        setEntries(data.entries ?? []);
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mở form: prefill khoảng ngày = khoảng đang xem trên dashboard.
  const openForm = () => {
    setFStart(from);
    setFEnd(to);
    setFormErr("");
    setShowForm(true);
  };

  const cpl = leads > 0 ? total / leads : 0;
  const cpa = orders > 0 ? total / orders : 0;
  const roas = total > 0 ? revenue / total : 0;
  const profit = revenue - total;

  const metrics = [
    {
      label: "Chi phí Marketing",
      value: fmtVND(total),
      icon: <Wallet size={18} />,
      color: "#ef4444",
    },
    {
      label: "Chi phí / Lead",
      value: leads > 0 ? fmtVND(cpl) : "—",
      sub: `${leads.toLocaleString("vi-VN")} lead`,
      icon: <Target size={18} />,
      color: "#06b6d4",
    },
    {
      label: "Chi phí / Đơn",
      value: orders > 0 ? fmtVND(cpa) : "—",
      sub: `${orders.toLocaleString("vi-VN")} đơn`,
      icon: <ShoppingCart size={18} />,
      color: "#f59e0b",
    },
    {
      label: "ROAS",
      value: total > 0 ? roas.toFixed(2) + "x" : "—",
      sub: "doanh thu / chi phí",
      icon: <TrendingUp size={18} />,
      color: "#a855f7",
    },
    {
      label: "Lợi nhuận (ước tính)",
      value: fmtVND(profit),
      sub: "doanh thu − chi phí",
      icon: <Megaphone size={18} />,
      color: profit >= 0 ? "#22c55e" : "#ef4444",
    },
  ];

  const maxChannel = Math.max(1, ...Object.values(byChannel));

  async function handleSave() {
    setFormErr("");
    const amount = Math.round(Number(fAmount.replace(/[^\d]/g, "")));
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormErr("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    if (!fStart || !fEnd || fEnd < fStart) {
      setFormErr("Khoảng thời gian không hợp lệ");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/analytics/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: fChannel,
          amount,
          period_start: fStart,
          period_end: fEnd,
          note: fNote.trim() || undefined,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setFAmount("");
        setFNote("");
        await fetchData();
      } else {
        const d = await res.json().catch(() => ({}));
        setFormErr(d.error || "Không thể lưu");
      }
    } catch {
      setFormErr("Lỗi kết nối");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id)); // optimistic
    try {
      await fetch(`/api/admin/analytics/marketing?id=${id}`, {
        method: "DELETE",
      });
      await fetchData();
    } catch {
      await fetchData();
    }
  }

  return (
    <div className="card-dark p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Megaphone size={16} className="text-[#ef4444]" />
        <h3 className="font-semibold text-white">Chi phí Marketing</h3>
        <span className="text-[11px] text-gray-500">
          (nhập tay · sẽ đồng bộ Google/Facebook/Zalo/TikTok Ads)
        </span>
        <button
          onClick={openForm}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: "rgba(37,99,235,0.1)",
            color: "#2563EB",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          <Plus size={13} /> Thêm chi phí
        </button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl p-3.5"
            style={{ background: "#141414", border: "1px solid #222" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: m.color + "20", color: m.color }}
              >
                {m.icon}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mb-0.5">{m.label}</p>
            <p className="text-base sm:text-lg font-bold text-white leading-tight">
              {loading ? "…" : m.value}
            </p>
            {m.sub && (
              <p className="text-[10px] text-gray-600 mt-0.5">{m.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Per-channel breakdown */}
      {total > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-gray-400">
            Phân bổ theo kênh
          </p>
          {CHANNELS.filter((c) => (byChannel[c.key] ?? 0) > 0).map((c) => {
            const amt = byChannel[c.key] ?? 0;
            const pct = Math.round((amt / total) * 100);
            return (
              <div key={c.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="text-gray-300">{c.label}</span>
                  </span>
                  <span className="text-gray-400">
                    <span className="text-white font-semibold">
                      {fmtVND(amt)}
                    </span>{" "}
                    · {pct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-[#1a1a1a]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((amt / maxChannel) * 100, 3)}%`,
                      background: c.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="border-t border-[#1f1f1f] pt-3 space-y-1.5">
          <p className="text-xs font-medium text-gray-400 mb-1">
            Khoản chi trong kỳ
          </p>
          {entries.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 text-xs py-1.5"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: channelColor(e.channel) }}
              />
              <span className="text-gray-300 w-24 shrink-0">
                {channelLabel(e.channel)}
              </span>
              <span className="text-gray-500 shrink-0">
                {e.period_start === e.period_end
                  ? e.period_start
                  : `${e.period_start} → ${e.period_end}`}
              </span>
              {e.note && (
                <span className="text-gray-600 truncate hidden sm:inline">
                  · {e.note}
                </span>
              )}
              <span className="ml-auto text-white font-medium shrink-0">
                {fmtVND(e.amount)}
              </span>
              <button
                onClick={() => handleDelete(e.id)}
                className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                title="Xoá"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && total === 0 && entries.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-2">
          Chưa có chi phí marketing trong kỳ. Bấm &quot;Thêm chi phí&quot; để
          nhập số liệu từ Google/Facebook/Zalo/TikTok Ads.
        </p>
      )}

      {/* Add-cost modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="rounded-2xl p-5 w-full max-w-md"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">
                Thêm chi phí marketing
              </h4>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Kênh</label>
                <select
                  value={fChannel}
                  onChange={(e) => setFChannel(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]"
                >
                  {CHANNELS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Số tiền (đ)
                </label>
                <input
                  inputMode="numeric"
                  value={fAmount}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^\d]/g, "");
                    setFAmount(
                      digits ? Number(digits).toLocaleString("vi-VN") : ""
                    );
                  }}
                  placeholder="VD: 5.000.000"
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={fStart}
                    onChange={(e) => setFStart(e.target.value)}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={fEnd}
                    onChange={(e) => setFEnd(e.target.value)}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-600">
                Chi phí sẽ được phân bổ đều theo ngày trong khoảng đã chọn.
              </p>

              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Ghi chú (tuỳ chọn)
                </label>
                <input
                  value={fNote}
                  onChange={(e) => setFNote(e.target.value)}
                  placeholder="VD: Chiến dịch Blueprint tháng 6"
                  maxLength={200}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {formErr && (
                <p className="text-xs text-red-400">{formErr}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                style={{
                  background: "rgba(107,114,128,0.1)",
                  border: "1px solid #2a2a2a",
                }}
              >
                Huỷ
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black transition-transform hover:scale-[1.02] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#3B82F6,#2563EB)" }}
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Plus size={13} />
                )}
                Lưu chi phí
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
