import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Chi phí marketing (ad spend) — nhập tay theo kênh.
 *
 *  GET    ?from=YYYY-MM-DD&to=YYYY-MM-DD
 *         → { total, byChannel: {channel: amount}, entries: [...] }
 *         Chi phí được PHÂN BỔ theo ngày: 1 khoản chi cho [period_start,
 *         period_end] sẽ tính phần chồng lấn với khoảng [from, to].
 *  POST   { channel, amount, period_start, period_end, note? } → tạo khoản chi
 *  DELETE ?id=<uuid> → xoá khoản chi
 *
 * Cột `source` ('manual' mặc định) để sau cắm API Google/Facebook/Zalo/TikTok.
 */

const CHANNELS = [
  "google_ads",
  "facebook_ads",
  "zalo_ads",
  "tiktok_ads",
  "other",
] as const;
type Channel = (typeof CHANNELS)[number];

const dayNum = (s: string): number =>
  Math.floor(new Date(`${s}T00:00:00Z`).getTime() / 86400000);

async function getRole(): Promise<{ userId: string; role: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { userId: user.id, role: profile?.role ?? "" };
}

// ─── GET: tổng hợp chi phí trong khoảng ───────────────────────────────────
export async function GET(req: NextRequest) {
  const auth = await getRole();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager", "marketing"].includes(auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const to = searchParams.get("to") || now.toISOString().slice(0, 10);
  const from =
    searchParams.get("from") ||
    new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);

  const admin = await createAdminClient();
  // Lấy mọi khoản chi có khoảng [period_start, period_end] giao với [from, to].
  const { data, error } = await admin
    .from("marketing_costs")
    .select("id, channel, period_start, period_end, amount, note, source, created_at")
    .lte("period_start", to)
    .gte("period_end", from)
    .order("period_start", { ascending: false });

  if (error) {
    console.error("[analytics/marketing GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  const fNum = dayNum(from);
  const tNum = dayNum(to);
  let total = 0;
  const byChannel: Record<string, number> = {};
  const entries = (data ?? []).map((e) => {
    const psNum = dayNum(e.period_start as string);
    const peNum = dayNum(e.period_end as string);
    const entryDays = Math.max(1, peNum - psNum + 1);
    const overlapDays = Math.max(
      0,
      Math.min(tNum, peNum) - Math.max(fNum, psNum) + 1
    );
    const prorated = Math.round(
      (Number(e.amount) || 0) * (overlapDays / entryDays)
    );
    total += prorated;
    byChannel[e.channel as string] =
      (byChannel[e.channel as string] ?? 0) + prorated;
    return { ...e, amount: Number(e.amount) || 0, prorated };
  });

  return NextResponse.json({ from, to, total, byChannel, entries });
}

// ─── POST: thêm khoản chi ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await getRole();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    channel?: string;
    amount?: number | string;
    period_start?: string;
    period_end?: string;
    note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const channel = body.channel as Channel;
  if (!CHANNELS.includes(channel)) {
    return NextResponse.json({ error: "Kênh không hợp lệ" }, { status: 400 });
  }
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 });
  }
  const period_start = body.period_start;
  const period_end = body.period_end;
  if (
    !period_start ||
    !period_end ||
    !/^\d{4}-\d{2}-\d{2}$/.test(period_start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(period_end) ||
    period_end < period_start
  ) {
    return NextResponse.json(
      { error: "Khoảng thời gian không hợp lệ" },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("marketing_costs")
    .insert({
      channel,
      amount,
      period_start,
      period_end,
      source: "manual",
      note: body.note?.trim() || null,
      created_by: auth.userId,
    })
    .select()
    .single();

  if (error) {
    console.error("[analytics/marketing POST]", error);
    return NextResponse.json(
      { error: "Không thể lưu chi phí" },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, entry: data });
}

// ─── DELETE: xoá khoản chi ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const auth = await getRole();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "manager"].includes(auth.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

  const admin = await createAdminClient();
  const { error } = await admin.from("marketing_costs").delete().eq("id", id);
  if (error) {
    console.error("[analytics/marketing DELETE]", error);
    return NextResponse.json({ error: "Không thể xoá" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
