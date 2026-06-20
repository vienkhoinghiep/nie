"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, X, Loader2, CheckCircle2 } from "lucide-react";

interface BookSessionButtonProps {
  mentorId: string;
  mentorSlug: string;
  mentorName: string;
  hourlyRate: number;
  freeIntroMinutes: number;
  acceptsBookings: boolean;
}

const DURATION_OPTIONS = [
  { value: 30, label: "30 phút (intro)" },
  { value: 60, label: "60 phút (chính)" },
  { value: 90, label: "90 phút (sâu)" },
];

export default function BookSessionButton({
  mentorId,
  mentorSlug,
  mentorName,
  hourlyRate,
  freeIntroMinutes,
  acceptsBookings,
}: BookSessionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // form state
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [topic, setTopic] = useState("");
  const [goals, setGoals] = useState("");

  if (!acceptsBookings) {
    return (
      <button
        disabled
        className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#1a1a1a] text-gray-500 cursor-not-allowed flex items-center gap-2"
      >
        <Calendar size={15} /> Tạm thời không nhận lịch
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!scheduledDate || !scheduledTime) {
      setError("Vui lòng chọn ngày và giờ.");
      return;
    }
    if (topic.trim().length < 10) {
      setError("Vui lòng mô tả chủ đề (tối thiểu 10 ký tự).");
      return;
    }

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (scheduledAt.getTime() <= Date.now() + 30 * 60 * 1000) {
      setError("Thời điểm phải cách hiện tại tối thiểu 30 phút.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/mentors/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentor_id: mentorId,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: duration,
          topic: topic.trim(),
          goals: goals.trim() || null,
        }),
      });

      if (res.status === 401) {
        router.push(`/register?next=/mentors/${mentorSlug}`);
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Không thể đặt lịch. Thử lại sau.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/mentoring");
      }, 1500);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-colors"
        style={{ background: "var(--primary)" }}
      >
        <Calendar size={15} /> Đặt lịch mentoring
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !submitting && setOpen(false)}
        >
          <div
            className="card-dark w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-5 border-b border-[#1f1f1f]">
              <div>
                <h3 className="font-bold text-white text-lg">Đặt lịch mentoring</h3>
                <p className="text-xs text-gray-400 mt-0.5">cùng {mentorName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="text-gray-500 hover:text-white"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400" />
                <p className="text-white font-semibold text-lg mb-1">Đã gửi yêu cầu!</p>
                <p className="text-sm text-gray-400">Mentor sẽ xác nhận trong vòng 24h. Đang chuyển đến trang quản lý...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-300 text-sm rounded-lg p-3">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Ngày *</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="input-dark w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Giờ *</label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="input-dark w-full"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Thời lượng *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="input-dark w-full"
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                        {hourlyRate > 0 && opt.value > freeIntroMinutes
                          ? ` — ${Math.round((hourlyRate * opt.value) / 60).toLocaleString("vi-VN")}₫`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    Chủ đề muốn trao đổi * <span className="text-gray-600">({topic.length}/200)</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value.slice(0, 200))}
                    placeholder="VD: Pitch deck cho seed round, go-to-market B2B SaaS..."
                    className="input-dark w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Mục tiêu cụ thể (tuỳ chọn)</label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="Bạn muốn rời session với kết quả gì?"
                    rows={3}
                    className="input-dark w-full resize-none"
                  />
                </div>

                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
                  💡 Sau khi gửi, mentor có 24h để xác nhận. Bạn sẽ nhận email + link Google Meet khi được duyệt.
                  {hourlyRate > 0 && duration > freeIntroMinutes && (
                    <span className="block mt-1 text-yellow-300">Thanh toán sau khi mentor xác nhận lịch.</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-green w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={15} /> Đang gửi...
                    </>
                  ) : (
                    <>
                      <Calendar size={15} /> Gửi yêu cầu đặt lịch
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
