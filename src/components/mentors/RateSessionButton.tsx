"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, X, Loader2 } from "lucide-react";

interface Props {
  sessionId: string;
  mentorName: string;
}

export default function RateSessionButton({ sessionId, mentorName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating === 0) return setError("Vui lòng chọn số sao.");

    startTransition(async () => {
      const res = await fetch("/api/mentors/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          rating,
          nps_score: npsScore,
          feedback: feedback.trim() || null,
          is_public: isPublic && feedback.trim().length > 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Không thể gửi đánh giá.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-blue-500/40 text-blue-300 hover:bg-blue-500/10 transition-colors"
      >
        <Star size={12} /> Đánh giá session
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => !submitting && setOpen(false)}
        >
          <div className="card-dark w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-[#1f1f1f]">
              <div>
                <h3 className="font-bold text-white text-lg">Đánh giá session</h3>
                <p className="text-xs text-gray-400 mt-0.5">cùng {mentorName}</p>
              </div>
              <button onClick={() => setOpen(false)} disabled={submitting} className="text-gray-500 hover:text-white" aria-label="Đóng">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="bg-red-500/10 border border-red-500/50 text-red-300 text-sm rounded-lg p-3">{error}</div>}

              {/* Rating stars */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Đánh giá tổng quan *</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      className="p-1 hover:scale-110 transition-transform"
                      aria-label={`${i} sao`}
                    >
                      <Star size={28} fill={i <= rating ? "#D4A843" : "transparent"} stroke="#D4A843" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              </div>

              {/* NPS */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Bạn có giới thiệu mentor này cho bạn bè? (0-10)
                </label>
                <div className="flex flex-wrap gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNpsScore(n)}
                      className="w-8 h-8 rounded text-xs font-bold transition-colors"
                      style={{
                        background: npsScore === n ? (n >= 9 ? "#22c55e" : n >= 7 ? "#eab308" : "#ef4444") : "#1a1a1a",
                        color: npsScore === n ? "#0a0a0a" : "#9ca3af",
                        border: "1px solid #2a2a2a",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>0 = Không bao giờ</span>
                  <span>10 = Chắc chắn</span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Phản hồi (tuỳ chọn)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="input-dark w-full resize-none"
                  placeholder="Mentor đã giúp bạn điều gì? Điều gì có thể cải thiện?"
                />
              </div>

              {feedback.trim().length > 0 && (
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="accent-blue-500 mt-0.5"
                  />
                  <span className="text-xs text-gray-300">
                    Cho phép hiển thị phản hồi này công khai trên trang mentor (giúp người khác chọn được mentor phù hợp)
                  </span>
                </label>
              )}

              <button type="submit" disabled={submitting || rating === 0} className="btn-green w-full flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={15} /> Đang gửi...
                  </>
                ) : (
                  <>
                    <Star size={15} /> Gửi đánh giá
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
