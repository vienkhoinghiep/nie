/**
 * Automation Triggers
 * Call these functions when events happen to auto-enroll subscribers
 * into matching active automations.
 *
 * Each trigger inserts an enrollment AND immediately kicks off the first
 * step (the welcome email, or whatever follows the trigger node). The
 * cron at /api/email/automations/process advances enrollments whose
 * `next_action_at` has passed.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { processEnrollmentStep } from "./automation-processor";
import type { FlowDefinition } from "./automation-types";

// ─── Shared enrollment helper ───────────────────────────────

/**
 * Insert an enrollment for the given subscriber/automation and synchronously
 * advance it through the trigger node so the first real step fires now.
 *
 * Returns the new enrollment id, or null if the subscriber was already
 * enrolled (or insert failed).
 */
async function enrollAndStart(
  adminClient: SupabaseClient,
  automationId: string,
  subscriberId: string,
  triggerMeta: Record<string, unknown>
): Promise<string | null> {
  // Skip if already enrolled.
  const { data: existing } = await adminClient
    .from("email_automation_enrollments")
    .select("id")
    .eq("automation_id", automationId)
    .eq("subscriber_id", subscriberId)
    .maybeSingle();
  if (existing) return null;

  // Look up the automation's flow to find the trigger node id.
  const { data: automation } = await adminClient
    .from("email_automations")
    .select("flow_definition")
    .eq("id", automationId)
    .single();
  if (!automation) return null;

  const flow = automation.flow_definition as FlowDefinition | null;
  const triggerNode = flow?.nodes.find((n) => n.type === "trigger");
  if (!triggerNode) {
    // No trigger node — can't initialise. Log and skip.
    await adminClient.from("email_automation_logs").insert({
      automation_id: automationId,
      subscriber_id: subscriberId,
      action: "error",
      metadata: { error: "No trigger node in flow", ...triggerMeta },
    });
    return null;
  }

  // Insert with current_step_id = trigger node, status = waiting,
  // next_action_at = now. The processor (and our immediate call below)
  // will then advance through the trigger to the first real step.
  const nowIso = new Date().toISOString();
  const { data: enrollment, error: enrollError } = await adminClient
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
  if (enrollError || !enrollment) return null;

  // Bump enrolled_count.
  const { data: current } = await adminClient
    .from("email_automations")
    .select("enrolled_count, active_count")
    .eq("id", automationId)
    .single();
  await adminClient
    .from("email_automations")
    .update({
      enrolled_count: (current?.enrolled_count || 0) + 1,
      active_count: (current?.active_count || 0) + 1,
    })
    .eq("id", automationId);

  // Log enrolment.
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: automationId,
    subscriber_id: subscriberId,
    action: "enrolled",
    metadata: triggerMeta,
  });

  // Kick off the first step synchronously so the welcome email goes now,
  // rather than waiting for the next cron tick. Failures are caught and
  // logged but don't block the caller (enrollment still exists; the cron
  // will retry on the next tick).
  try {
    await processEnrollmentStep(adminClient, enrollment, 0);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await adminClient.from("email_automation_logs").insert({
      enrollment_id: enrollment.id,
      automation_id: automationId,
      subscriber_id: subscriberId,
      step_id: enrollment.current_step_id,
      action: "error",
      metadata: { error: errorMessage, phase: "initial_step" },
    });
  }

  return enrollment.id;
}

// ─── Public triggers ────────────────────────────────────────

/** Called when a tag is added to a subscriber. */
export async function onTagAdded(
  adminClient: SupabaseClient,
  subscriberId: string,
  tagName: string
): Promise<{ enrolled: string[] }> {
  const { data: automations } = await adminClient
    .from("email_automations")
    .select("id, trigger_config")
    .eq("status", "active")
    .eq("trigger_type", "tag_added");

  const enrolled: string[] = [];
  for (const auto of automations || []) {
    const config = auto.trigger_config as { tag?: string };
    if (config.tag !== tagName) continue;
    const id = await enrollAndStart(adminClient, auto.id, subscriberId, {
      trigger: "tag_added",
      tag: tagName,
    });
    if (id) enrolled.push(auto.id);
  }
  return { enrolled };
}

/** Called when a subscriber is added to a list. */
export async function onSubscribedToList(
  adminClient: SupabaseClient,
  subscriberId: string,
  listId: string
): Promise<{ enrolled: string[] }> {
  const { data: automations } = await adminClient
    .from("email_automations")
    .select("id, trigger_config")
    .eq("status", "active")
    .eq("trigger_type", "subscribed_to_list");

  const enrolled: string[] = [];
  for (const auto of automations || []) {
    const config = auto.trigger_config as { listId?: string };
    if (config.listId !== listId) continue;
    const id = await enrollAndStart(adminClient, auto.id, subscriberId, {
      trigger: "subscribed_to_list",
      listId,
    });
    if (id) enrolled.push(auto.id);
  }
  return { enrolled };
}

/**
 * Called when a purchase (or free enrollment) completes for the given
 * subscriber on the given product. Matches automations whose
 * `trigger_config.productId` equals productId, or whose trigger_config has
 * no productId (treat as "any purchase").
 */
export async function onPurchase(
  adminClient: SupabaseClient,
  subscriberId: string,
  productId: string
): Promise<{ enrolled: string[] }> {
  const { data: automations } = await adminClient
    .from("email_automations")
    .select("id, trigger_config")
    .eq("status", "active")
    .eq("trigger_type", "purchase");

  const enrolled: string[] = [];
  for (const auto of automations || []) {
    const config = auto.trigger_config as { productId?: string };
    if (config.productId && config.productId !== productId) continue;
    const id = await enrollAndStart(adminClient, auto.id, subscriberId, {
      trigger: "purchase",
      productId,
    });
    if (id) enrolled.push(auto.id);
  }
  return { enrolled };
}
