import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface CreateSessionBody {
  mentor_id?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  topic?: string;
  goals?: string | null;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để đặt lịch." }, { status: 401 });
  }

  let body: CreateSessionBody;
  try {
    body = (await req.json()) as CreateSessionBody;
  } catch {
    return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 });
  }

  const { mentor_id, scheduled_at, duration_minutes, topic, goals } = body;

  if (!mentor_id || !scheduled_at || !duration_minutes || !topic) {
    return NextResponse.json({ error: "Thiếu trường bắt buộc." }, { status: 400 });
  }

  const scheduledDate = new Date(scheduled_at);
  if (Number.isNaN(scheduledDate.getTime())) {
    return NextResponse.json({ error: "Thời gian không hợp lệ." }, { status: 400 });
  }

  if (scheduledDate.getTime() <= Date.now() + 30 * 60 * 1000) {
    return NextResponse.json({ error: "Thời điểm phải cách hiện tại tối thiểu 30 phút." }, { status: 400 });
  }

  if (duration_minutes < 15 || duration_minutes > 240) {
    return NextResponse.json({ error: "Thời lượng phải từ 15-240 phút." }, { status: 400 });
  }

  if (topic.trim().length < 10) {
    return NextResponse.json({ error: "Chủ đề quá ngắn." }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Verify mentor exists + accepts bookings
  const { data: mentor } = await admin
    .from("mentors")
    .select("id,full_name,user_id,accepts_bookings,is_active,hourly_rate,free_intro_minutes")
    .eq("id", mentor_id)
    .maybeSingle();

  if (!mentor || !mentor.is_active) {
    return NextResponse.json({ error: "Mentor không tồn tại." }, { status: 404 });
  }
  if (!mentor.accepts_bookings) {
    return NextResponse.json({ error: "Mentor tạm thời không nhận lịch." }, { status: 409 });
  }
  if (mentor.user_id === user.id) {
    return NextResponse.json({ error: "Không thể đặt lịch với chính mình." }, { status: 400 });
  }

  // Check for duplicate pending/confirmed booking on the same day
  const startOfDay = new Date(scheduledDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(scheduledDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: existing } = await admin
    .from("mentor_sessions")
    .select("id")
    .eq("mentor_id", mentor_id)
    .eq("mentee_id", user.id)
    .in("status", ["pending", "confirmed"])
    .gte("scheduled_at", startOfDay.toISOString())
    .lte("scheduled_at", endOfDay.toISOString())
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "Bạn đã có lịch hẹn với mentor này trong ngày — vui lòng quản lý ở dashboard." },
      { status: 409 }
    );
  }

  // Calculate price (free for the intro length, hourly_rate × duration otherwise)
  const price =
    mentor.hourly_rate > 0 && duration_minutes > mentor.free_intro_minutes
      ? Math.round((mentor.hourly_rate * duration_minutes) / 60)
      : 0;

  const { data: session, error: insertError } = await admin
    .from("mentor_sessions")
    .insert({
      mentor_id,
      mentee_id: user.id,
      scheduled_at: scheduledDate.toISOString(),
      duration_minutes,
      topic: topic.trim(),
      goals: goals?.trim() || null,
      price_paid: 0, // marked paid only after payment confirmation
      status: "pending",
    })
    .select()
    .single();

  if (insertError || !session) {
    return NextResponse.json({ error: insertError?.message ?? "Không thể tạo session." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, session, price_quoted: price }, { status: 201 });
}
