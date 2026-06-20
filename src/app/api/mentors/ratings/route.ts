import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface RateBody {
  session_id?: string;
  rating?: number;
  nps_score?: number | null;
  feedback?: string | null;
  is_public?: boolean;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });

  const body = (await req.json()) as RateBody;
  if (!body.session_id || !body.rating || body.rating < 1 || body.rating > 5) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const admin = await createAdminClient();

  // Verify the session belongs to the user and is completed
  const { data: session } = await admin
    .from("mentor_sessions")
    .select("id,mentor_id,mentee_id,status")
    .eq("id", body.session_id)
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session không tồn tại." }, { status: 404 });
  if (session.mentee_id !== user.id) return NextResponse.json({ error: "Bạn không phải mentee của session này." }, { status: 403 });
  if (session.status !== "completed") return NextResponse.json({ error: "Chỉ đánh giá session đã hoàn thành." }, { status: 409 });

  const { data, error } = await admin
    .from("mentor_ratings")
    .insert({
      session_id: body.session_id,
      mentor_id: session.mentor_id,
      mentee_id: user.id,
      rating: body.rating,
      nps_score: body.nps_score ?? null,
      feedback: body.feedback ?? null,
      is_public: body.is_public ?? false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Bạn đã đánh giá session này rồi." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, rating: data }, { status: 201 });
}
