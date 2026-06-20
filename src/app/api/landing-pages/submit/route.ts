import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { processEnrollmentStep } from "@/lib/email/automation-processor";
import { onTagAdded, onSubscribedToList } from "@/lib/email/automation-triggers";
import { logSyntheticPageView } from "@/lib/analytics/log-page-view";
import type { FlowDefinition } from "@/lib/email/automation-types";

/**
 * POST /api/landing-pages/submit
 *
 * Public endpoint — captures a lead from a landing-page form, creates/
 * upserts a `subscribers` row, logs the lead in `landing_page_leads`,
 * adds the configured tag, optionally enrolls into an automation/list,
 * and bumps the landing page's `conversions` count.
 *
 * Body: { slug, name?, email, phone?, utm_source?, utm_medium?, utm_campaign? }
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = await rateLimit(`lp-submit:${ip}`, 5, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { slug, name, email, phone, utm_source, utm_medium, utm_campaign } = body ?? {};
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Thiếu slug landing page" }, { status: 400 });
    }
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    if (name && (typeof name !== "string" || name.length > 200)) {
      return NextResponse.json({ error: "Tên không hợp lệ" }, { status: 400 });
    }
    if (phone) {
      const digits = String(phone).replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 12) {
        return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
      }
    }

    const admin = await createAdminClient();

    // 1. Fetch the landing page so we know what to do post-submit.
    const { data: page, error: pageError } = await admin
      .from("landing_pages")
      .select(
        "id, slug, status, tag_on_submit, automation_id, add_to_list_id, conversions"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (pageError || !page) {
      return NextResponse.json({ error: "Landing page không tồn tại" }, { status: 404 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name as string | null)?.trim() || null;
    const cleanPhone = phone ? String(phone).trim() : null;

    // 2. Upsert subscriber by email.
    const { data: subscriber, error: subError } = await admin
      .from("subscribers")
      .upsert(
        {
          email: cleanEmail,
          full_name: cleanName,
          phone: cleanPhone,
          status: "active",
          source: `landing:${page.slug}`,
        },
        { onConflict: "email" }
      )
      .select("id, tags")
      .single();
    if (subError || !subscriber) {
      console.error("[lp-submit] subscriber upsert failed:", subError);
      return NextResponse.json(
        { error: "Không thể tạo subscriber. Vui lòng thử lại." },
        { status: 500 }
      );
    }

    // 3. Log lead row (always insert — gives the marketer a record per submit).
    await admin.from("landing_page_leads").insert({
      landing_page_id: page.id,
      subscriber_id: subscriber.id,
      email: cleanEmail,
      full_name: cleanName,
      phone: cleanPhone,
      ip_address: ip,
      user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
      utm_source: utm_source ?? null,
      utm_medium: utm_medium ?? null,
      utm_campaign: utm_campaign ?? null,
    });

    // 3b. Upsert CRM contact so the lead shows up in /crm/contacts and
    // analytics. The tag mirrors the subscriber tag so sales reps can
    // segment by the same label. Existing contacts get their tags merged
    // (not overwritten) and journey_stage is only set if the contact is
    // still cold ('subscriber' or null).
    try {
      const { data: existingCrm } = await admin
        .from("crm_contacts")
        .select("id, tags, journey_stage")
        .eq("email", cleanEmail)
        .maybeSingle();

      const newTag = page.tag_on_submit;
      const mergedTags = (() => {
        const cur: string[] = (existingCrm?.tags as string[] | null) ?? [];
        if (newTag && !cur.includes(newTag)) return [...cur, newTag];
        return cur;
      })();

      if (existingCrm) {
        const update: Record<string, unknown> = {
          tags: mergedTags,
          updated_at: new Date().toISOString(),
        };
        // Only upgrade journey_stage from cold leads.
        if (
          !existingCrm.journey_stage ||
          existingCrm.journey_stage === "subscriber"
        ) {
          update.journey_stage = "lead";
        }
        await admin.from("crm_contacts").update(update).eq("id", existingCrm.id);
      } else {
        // crm_contacts.source has a CHECK constraint allowing only
        // 'manual'|'import'|'website'|'referral'|'ads'|'social'.
        // We use 'website' and stash the landing slug in first_page +
        // utm_source so reports can still attribute the lead.
        await admin.from("crm_contacts").insert({
          email: cleanEmail,
          full_name: cleanName,
          phone: cleanPhone,
          source: "website",
          status: "new",
          journey_stage: "lead",
          tags: mergedTags,
          utm_source: utm_source ?? `landing:${page.slug}`,
          utm_medium: utm_medium ?? "landing_page",
          utm_campaign: utm_campaign ?? page.slug,
          first_page: `/lp/${page.slug}`,
          first_seen_at: new Date().toISOString(),
        });
      }
    } catch (crmErr) {
      console.error("[lp-submit] CRM upsert failed:", crmErr);
      // Non-fatal — we still want the rest of the flow to continue.
    }

    // 4. Add tags. ALWAYS add the universal "registered_user" tag so the
    //    standard onboarding automation fires for every signup (account
    //    register OR landing page submit). Plus the landing-page-specific
    //    tag if one is configured (e.g., "Sức khỏe tài chính") so anh có
    //    thể trigger automation hẹp hơn cho từng landing page.
    {
      const universalTag = "registered_user";
      const tagsToAdd: string[] = [universalTag];
      if (page.tag_on_submit && !tagsToAdd.includes(page.tag_on_submit)) {
        tagsToAdd.push(page.tag_on_submit);
      }
      const currentTags: string[] = subscriber.tags ?? [];
      const mergedTags = [
        ...currentTags,
        ...tagsToAdd.filter((t) => !currentTags.includes(t)),
      ];
      if (mergedTags.length !== currentTags.length) {
        await admin
          .from("subscribers")
          .update({ tags: mergedTags })
          .eq("id", subscriber.id);
      }
      // Fire tag-triggered automations for each NEW tag — `onTagAdded`
      // matches automations whose trigger.config.tag === <thisTag>.
      for (const tag of tagsToAdd) {
        if (currentTags.includes(tag)) continue; // already had it → don't re-enroll
        try {
          await onTagAdded(admin, subscriber.id, tag);
        } catch (e) {
          console.error(`[lp-submit] onTagAdded(${tag}) failed:`, e);
        }
      }
    }

    // 5. Add to mailing list (and fire list-triggered automations).
    if (page.add_to_list_id) {
      await admin
        .from("subscriber_list_members")
        .upsert(
          { subscriber_id: subscriber.id, list_id: page.add_to_list_id },
          { onConflict: "subscriber_id,list_id" }
        );
      try {
        await onSubscribedToList(admin, subscriber.id, page.add_to_list_id);
      } catch (e) {
        console.error("[lp-submit] onSubscribedToList failed:", e);
      }
    }

    // 6. Direct enrolment into a specific automation by id (bypasses trigger match).
    if (page.automation_id) {
      await enrollDirectly(admin, page.automation_id, subscriber.id, {
        trigger: "landing_page_submit",
        slug: page.slug,
      });
    }

    // 7. Bump conversions count.
    await admin
      .from("landing_pages")
      .update({ conversions: (page.conversions ?? 0) + 1 })
      .eq("id", page.id);

    // 8. Log a synthetic page_view so the funnel's Visitor count includes
    //    this lead (invariant Visitor ≥ Lead). Real IP if available.
    await logSyntheticPageView(admin, {
      email: cleanEmail,
      path: `/lp/${page.slug}`,
      realIp: ip,
      utm: { source: utm_source, medium: utm_medium, campaign: utm_campaign },
      source: "landing_page_submit",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lp-submit] unexpected error:", err);
    return NextResponse.json({ error: "Lỗi máy chủ. Vui lòng thử lại." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Direct automation enrolment helper.
// Mirrors enrollAndStart() in automation-triggers.ts but matches by
// automation_id instead of by trigger config.
// ---------------------------------------------------------------------------
async function enrollDirectly(
  admin: ReturnType<typeof createAdminClient> extends Promise<infer T> ? T : never,
  automationId: string,
  subscriberId: string,
  meta: Record<string, unknown>
): Promise<void> {
  // Skip if already enrolled.
  const { data: existing } = await admin
    .from("email_automation_enrollments")
    .select("id")
    .eq("automation_id", automationId)
    .eq("subscriber_id", subscriberId)
    .maybeSingle();
  if (existing) return;

  const { data: automation } = await admin
    .from("email_automations")
    .select("flow_definition, status")
    .eq("id", automationId)
    .single();
  if (!automation || automation.status !== "active") return;

  const flow = automation.flow_definition as FlowDefinition | null;
  const triggerNode = flow?.nodes.find((n) => n.type === "trigger");
  if (!triggerNode) return;

  const nowIso = new Date().toISOString();
  const { data: enrollment } = await admin
    .from("email_automation_enrollments")
    .insert({
      automation_id: automationId,
      subscriber_id: subscriberId,
      status: "waiting",
      current_step_id: triggerNode.id,
      next_action_at: nowIso,
      enrolled_at: nowIso,
    })
    .select("*")
    .single();
  if (!enrollment) return;

  const { data: counts } = await admin
    .from("email_automations")
    .select("enrolled_count, active_count")
    .eq("id", automationId)
    .single();
  await admin
    .from("email_automations")
    .update({
      enrolled_count: (counts?.enrolled_count ?? 0) + 1,
      active_count: (counts?.active_count ?? 0) + 1,
    })
    .eq("id", automationId);

  await admin.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: automationId,
    subscriber_id: subscriberId,
    action: "enrolled",
    metadata: meta,
  });

  try {
    await processEnrollmentStep(admin, enrollment, 0);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await admin.from("email_automation_logs").insert({
      enrollment_id: enrollment.id,
      automation_id: automationId,
      subscriber_id: subscriberId,
      step_id: enrollment.current_step_id,
      action: "error",
      metadata: { error: msg, phase: "initial_step" },
    });
  }
}
