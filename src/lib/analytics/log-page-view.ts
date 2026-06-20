import type { SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

/**
 * Insert a synthetic page_view row into analytics_events whenever a lead
 * is captured (subscribe, register, landing-page submit, …) — so the
 * funnel invariant **Visitor ≥ Lead** always holds.
 *
 * Why: leads = distinct subscribers/profiles by email. Visitors = distinct
 * IPs/sessions on public pages. In theory every lead must have visited
 * at least once before submitting an email — but if the request comes
 * from a server-to-server context (or PageTracker is blocked by cookie
 * consent), the page_view never fires.
 *
 * This helper guarantees the visit is logged. It's idempotent-ish:
 * multiple calls within the same session will create separate rows but
 * collapse into one when counted because we use a stable session_id
 * derived from the email/seed.
 *
 * Best-effort: never throws.
 */
export async function logSyntheticPageView(
  supabase: SupabaseClient,
  options: {
    email?: string | null;
    userId?: string | null;
    path?: string;
    realIp?: string | null;
    utm?: { source?: string | null; medium?: string | null; campaign?: string | null };
    source?: string; // free-form label saved in meta.source (e.g. "landing", "register")
  }
): Promise<void> {
  try {
    const email = options.email?.toLowerCase().trim() ?? null;
    const seed = email || options.userId || `anon:${Date.now()}-${Math.random()}`;

    // Stable pseudo-IP in the 10.x.x.x private range. Falls back to a
    // real IP if the caller passed one (preferred for accuracy).
    const realIp = options.realIp && options.realIp !== "unknown" ? options.realIp : null;
    const ip = realIp || pseudoIpFromSeed(seed);

    // Stable session id so multiple events from the same lead dedupe
    // into one visitor in the funnel.
    const sessionId = `lead:${crypto
      .createHash("md5")
      .update(seed)
      .digest("hex")
      .slice(0, 16)}`;

    await supabase.from("analytics_events").insert({
      event: "page_view",
      page: options.path ?? "/",
      user_id: options.userId ?? null,
      session_id: sessionId,
      ip,
      utm_source: options.utm?.source ?? null,
      utm_medium: options.utm?.medium ?? null,
      utm_campaign: options.utm?.campaign ?? null,
      meta: {
        source: options.source ?? "synthetic_signup",
        synthetic: true,
        ...(realIp ? {} : { pseudo_ip: true }),
      },
    });
  } catch (err) {
    // Never block lead-capture on analytics failure.
    console.warn(
      "[logSyntheticPageView] non-fatal:",
      err instanceof Error ? err.message : err
    );
  }
}

function pseudoIpFromSeed(seed: string): string {
  const hash = crypto.createHash("md5").update(seed).digest();
  return `10.${hash[0]}.${hash[1]}.${hash[2]}`;
}
