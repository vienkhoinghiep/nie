import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/analytics/funnel?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * 5-step customer journey funnel:
 *
 *  1. Visitor                — anyone who viewed a PUBLIC page (page_view
 *                              events, counted by distinct IP after
 *                              excluding internal paths like /admin,
 *                              /dashboard, …).
 *  2. Lead                   — anyone who either signed up for a free
 *                              account (profiles) OR submitted a lead form
 *                              (subscribers). Union by email so we don't
 *                              double-count people who did both.
 *  3. Bấm thanh toán         — anyone who created an ORDER (any status).
 *                              i.e. got far enough to click the
 *                              "Thanh toán" button.
 *  4. Hoàn thành đơn hàng    — anyone whose order status='paid' in the
 *                              period.
 *  5. Giới thiệu khách hàng  — distinct affiliates who earned at least
 *                              one (non-rejected) affiliate_conversion in
 *                              the period — i.e. customers who became
 *                              advocates and successfully referred
 *                              another buyer.
 */

// Public path prefixes that count as a "Visitor" page view. Anything else
// (internal admin/dashboard areas) is excluded.
const PUBLIC_PATH_PREFIXES = ["/", "/blog", "/lp", "/courses", "/shop", "/about", "/contact"];

// Path prefixes that explicitly do NOT count as a visitor view.
const INTERNAL_PATH_PREFIXES = [
  "/admin",
  "/dashboard",
  "/instructor",
  "/email",
  "/crm",
  "/settings",
  "/api",
];

function isPublicPath(p: string | undefined): boolean {
  if (!p || typeof p !== "string") return false;
  if (INTERNAL_PATH_PREFIXES.some((pref) => p === pref || p.startsWith(pref + "/"))) {
    return false;
  }
  // anything else under "/" is considered public (home, blog, lp, courses listing, …)
  return PUBLIC_PATH_PREFIXES.some((pref) =>
    pref === "/" ? p === "/" : p === pref || p.startsWith(pref + "/")
  ) || p === "/";
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || !["admin", "manager", "marketing"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultTo = now.toISOString();
    const defaultFrom = new Date(now.getTime() - 30 * 86400000).toISOString();
    const rawTo = searchParams.get("to") || defaultTo;
    const rawFrom = searchParams.get("from") || defaultFrom;
    const fromISO = rawFrom.includes("T") ? rawFrom : `${rawFrom}T00:00:00.000Z`;
    const toISO = rawTo.includes("T") ? rawTo : `${rawTo}T23:59:59.999Z`;

    const admin = await createAdminClient();

    // ─── 1. Visitor: distinct IPs from page_view events on PUBLIC paths ──
    // analytics_events schema: id, session_id, user_id, event, page, utm_*,
    // meta jsonb, ip, created_at. We count distinct IPs in the period over
    // PUBLIC paths only (excluding /admin, /dashboard, …).
    let visitorCount = 0;
    {
      const PAGE = 1000;
      const ips = new Set<string>();
      const sessions = new Set<string>();
      for (let offset = 0; offset < 30000; offset += PAGE) {
        const { data, error } = await admin
          .from("analytics_events")
          .select("page, ip, session_id")
          .eq("event", "page_view")
          .gte("created_at", fromISO)
          .lte("created_at", toISO)
          .range(offset, offset + PAGE - 1);
        if (error) break;
        if (!data || data.length === 0) break;
        for (const row of data) {
          const r = row as { page?: string | null; ip?: string | null; session_id?: string | null };
          if (!isPublicPath(r.page ?? undefined)) continue;
          if (r.ip && r.ip !== "unknown") ips.add(r.ip);
          if (r.session_id) sessions.add(r.session_id);
        }
        if (data.length < PAGE) break;
      }
      // Prefer the bigger of the two visitor proxies — session_id is the
      // most accurate when present, but anonymous visitors with no session
      // still show up via IP.
      visitorCount = Math.max(ips.size, sessions.size);
    }

    // ─── 2. Lead: union(subscribers, profiles) by email ──────────────────
    let leadCount = 0;
    {
      const emails = new Set<string>();
      // subscribers
      const { data: subs } = await admin
        .from("subscribers")
        .select("email")
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .limit(50000);
      for (const s of subs ?? []) {
        const email = (s as { email?: string | null }).email?.toLowerCase().trim();
        if (email) emails.add(email);
      }
      // profiles (signed-up users)
      const { data: profs } = await admin
        .from("profiles")
        .select("email")
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .limit(50000);
      for (const p of profs ?? []) {
        const email = (p as { email?: string | null }).email?.toLowerCase().trim();
        if (email) emails.add(email);
      }
      leadCount = emails.size;
    }

    // ─── 3. Bấm thanh toán: any order created in period (distinct user) ──
    let initiatedCheckoutCount = 0;
    {
      const { data: orders } = await admin
        .from("orders")
        .select("user_id, customer_email")
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .limit(50000);
      // user_id may be null (guest checkout); fall back to email.
      const ids = new Set<string>();
      for (const o of orders ?? []) {
        const r = o as { user_id?: string | null; customer_email?: string | null };
        const key = r.user_id ?? (r.customer_email ? `email:${r.customer_email.toLowerCase().trim()}` : null);
        if (key) ids.add(key);
      }
      initiatedCheckoutCount = ids.size;
    }

    // ─── 4. Hoàn thành đơn hàng: paid orders in period ───────────────────
    let completedCount = 0;
    {
      const { data: orders } = await admin
        .from("orders")
        .select("user_id, customer_email")
        .eq("status", "paid")
        .gte("paid_at", fromISO)
        .lte("paid_at", toISO)
        .limit(50000);
      const ids = new Set<string>();
      for (const o of orders ?? []) {
        const r = o as { user_id?: string | null; customer_email?: string | null };
        const key = r.user_id ?? (r.customer_email ? `email:${r.customer_email.toLowerCase().trim()}` : null);
        if (key) ids.add(key);
      }
      completedCount = ids.size;
    }

    // ─── 5. Giới thiệu khách hàng: affiliates with ≥1 conversion in period
    let referralCount = 0;
    {
      const { data: convs } = await admin
        .from("affiliate_conversions")
        .select("affiliate_id, status")
        .neq("status", "rejected")
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .limit(50000);
      const ids = new Set<string>();
      for (const c of convs ?? []) {
        const r = c as { affiliate_id?: string | null };
        if (r.affiliate_id) ids.add(r.affiliate_id);
      }
      referralCount = ids.size;
    }

    return NextResponse.json({
      from: fromISO,
      to: toISO,
      steps: [
        { key: "visitor",  label: "Visitor",                count: visitorCount,           color: "#3b82f6" },
        { key: "lead",     label: "Lead",                   count: leadCount,              color: "#06b6d4" },
        { key: "checkout", label: "Bấm thanh toán",         count: initiatedCheckoutCount, color: "#f59e0b" },
        { key: "paid",     label: "Hoàn thành đơn hàng",    count: completedCount,         color: "#22c55e" },
        { key: "referral", label: "Giới thiệu khách hàng",  count: referralCount,          color: "#2563EB" },
      ],
    });
  } catch (err) {
    console.error("[analytics/funnel]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
