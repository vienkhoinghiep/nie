import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { withErrorHandler } from "@/lib/api-handler";

async function _POST(req: NextRequest) {
  // Capture IP + UA early (used for both rate limiting and analytics tracking)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const ua = req.headers.get("user-agent") ?? "";

  const rateLimitResult = await rateLimit(`analytics:${ip}`, 60, 60);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfterSec) } }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { event, properties } = body;

  if (!event) return NextResponse.json({ error: "event required" }, { status: 400 });

  // Whitelist allowed event types
  const ALLOWED_EVENTS = ["page_view", "click", "scroll", "video_play", "lesson_view", "course_view"];
  if (!ALLOWED_EVENTS.includes(event)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  // Limit properties payload size
  if (JSON.stringify(properties || {}).length > 2000) {
    return NextResponse.json({ error: "Properties too large" }, { status: 400 });
  }

  // Map client properties into the actual schema columns
  // (analytics_events has: session_id, user_id, event, page, utm_*, meta, ip).
  // Anything not column-mapped lands in `meta` as JSONB.
  const props = (properties ?? {}) as Record<string, unknown>;
  const page = typeof props.path === "string" ? props.path : null;
  const utmSource =
    typeof props.utm_source === "string" ? props.utm_source : null;
  const utmMedium =
    typeof props.utm_medium === "string" ? props.utm_medium : null;
  const utmCampaign =
    typeof props.utm_campaign === "string" ? props.utm_campaign : null;
  const sessionId =
    typeof props.session_id === "string" ? props.session_id : null;

  // Stash the rest (referrer, title, utm_term, utm_content, ua, …) in meta
  // so we don't lose them. Skip keys that already became columns.
  const meta: Record<string, unknown> = { ua: ua.slice(0, 200) };
  for (const [k, v] of Object.entries(props)) {
    if (
      k === "path" ||
      k === "utm_source" ||
      k === "utm_medium" ||
      k === "utm_campaign" ||
      k === "session_id"
    )
      continue;
    meta[k] = v;
  }

  await supabase.from("analytics_events").insert({
    session_id: sessionId,
    user_id: user?.id ?? null,
    event,
    page,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    ip,
    meta,
  });

  return NextResponse.json({ ok: true });
}

export const POST = withErrorHandler(_POST);
