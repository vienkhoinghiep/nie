import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import RateSessionButton from "@/components/mentors/RateSessionButton";
import { Calendar, Clock, MessageSquare, ExternalLink, Star, XCircle, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface SessionRow {
  id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  topic: string;
  status: string;
  price_paid: number;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  mentor: {
    full_name: string;
    avatar: string | null;
    slug: string;
    title: string | null;
  } | null;
  rating: { id: string; rating: number } | null;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ mentor xác nhận", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  confirmed: { label: "Đã xác nhận", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  completed: { label: "Hoàn thành", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  cancelled: { label: "Đã huỷ", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  no_show: { label: "Không tham dự", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function MentoringPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await createAdminClient();

  const { data } = await admin
    .from("mentor_sessions")
    .select(
      "id,mentor_id,scheduled_at,duration_minutes,meeting_link,topic,status,price_paid,confirmed_at,completed_at,cancelled_at,mentor:mentor_id(full_name,avatar,slug,title)"
    )
    .eq("mentee_id", user.id)
    .order("scheduled_at", { ascending: false });

  // Fetch existing ratings (for showing "đã đánh giá")
  const sessionIds = (data ?? []).map((s) => s.id);
  const { data: ratingsData } = sessionIds.length
    ? await admin.from("mentor_ratings").select("id,session_id,rating").in("session_id", sessionIds)
    : { data: [] };
  const ratingsBySession = new Map((ratingsData ?? []).map((r) => [r.session_id, r]));

  const sessions = ((data ?? []) as unknown as SessionRow[]).map((s) => ({
    ...s,
    rating: ratingsBySession.get(s.id) ?? null,
  }));

  const upcoming = sessions.filter((s) => s.status === "pending" || s.status === "confirmed");
  const completed = sessions.filter((s) => s.status === "completed");
  const history = sessions.filter((s) => s.status === "cancelled" || s.status === "no_show");

  return (
    <div>
      <TopBar title="Mentoring 1-1" subtitle="Lịch hẹn với mentor của bạn" />

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-8">
        {sessions.length === 0 ? (
          <div className="card-dark p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-semibold text-white mb-1">Chưa có session nào</p>
            <p className="text-sm text-gray-500 mb-5">Tìm và đặt lịch với mentor để bắt đầu hành trình.</p>
            <Link href="/mentors" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#2563EB" }}>
              <Calendar size={15} /> Khám phá mentor
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <Section title="Sắp tới">
                {upcoming.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </Section>
            )}
            {completed.length > 0 && (
              <Section title="Đã hoàn thành">
                {completed.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </Section>
            )}
            {history.length > 0 && (
              <Section title="Lịch sử (đã huỷ)">
                {history.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function SessionCard({ session }: { session: SessionRow }) {
  const meta = STATUS_META[session.status] ?? STATUS_META.pending;
  const mentor = session.mentor;
  return (
    <div className="card-dark p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-white text-base">{session.topic}</h3>
              {mentor && (
                <Link href={`/mentors/${mentor.slug}`} className="text-xs text-blue-400 hover:underline">
                  với {mentor.full_name}
                </Link>
              )}
            </div>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-semibold whitespace-nowrap"
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}55` }}
            >
              {meta.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} /> {formatDateTime(session.scheduled_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {session.duration_minutes} phút
            </span>
            {session.price_paid > 0 && (
              <span className="text-emerald-400">
                Đã thanh toán {session.price_paid.toLocaleString("vi-VN")}₫
              </span>
            )}
          </div>

          {session.status === "confirmed" && session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline mb-2"
            >
              <ExternalLink size={12} /> Vào phòng meeting
            </a>
          )}

          {session.status === "completed" && !session.rating && (
            <div className="mt-3 pt-3 border-t border-[#1f1f1f]">
              <RateSessionButton sessionId={session.id} mentorName={mentor?.full_name ?? "mentor"} />
            </div>
          )}

          {session.status === "completed" && session.rating && (
            <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>Bạn đã đánh giá:</span>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={11} fill={i <= session.rating!.rating ? "#D4A843" : "transparent"} stroke="#D4A843" />
                ))}
              </span>
            </div>
          )}

          {session.status === "cancelled" && (
            <div className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
              <XCircle size={12} /> Đã huỷ ngày {session.cancelled_at && formatDateTime(session.cancelled_at)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
