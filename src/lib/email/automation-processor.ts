/**
 * Email Automation Processor
 * Core engine that processes automation enrollments by advancing subscribers
 * through their automation flow steps.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  FlowDefinition,
  FlowNode,
  SendEmailNodeData,
  WaitNodeData,
  ConditionNodeData,
  AddTagNodeData,
  RemoveTagNodeData,
} from "./automation-types";
import { sendEmailWithParams } from "./ses";

// ─── Constants ──────────────────────────────────────────────

const MAX_RECURSION_DEPTH = 10;

// ─── Wait time computation ──────────────────────────────────

/**
 * Compute next_action_at for a wait node.
 *
 * Default: now + days*86400000 + hours*3600000 + minutes*60000.
 *
 * If `sendAtHour` is set, snap the resulting time UP to the next occurrence
 * of that hour-of-day in `timezone` (default "Asia/Ho_Chi_Minh"). This lets
 * the flow author say "1 day later, but at 8 AM Vietnam time" without
 * worrying about what wall-clock time the enrollment started at.
 */
export function computeWaitTarget(now: Date, waitData: WaitNodeData): Date {
  const waitMs =
    (waitData.days || 0) * 86400000 +
    (waitData.hours || 0) * 3600000 +
    (waitData.minutes || 0) * 60000;
  const minTarget = new Date(now.getTime() + waitMs);

  if (waitData.sendAtHour === undefined || waitData.sendAtHour === null) {
    return minTarget;
  }

  const tz = waitData.timezone || "Asia/Ho_Chi_Minh";
  const sendAtHour = Math.max(0, Math.min(23, Math.floor(waitData.sendAtHour)));

  // Use Intl to extract the wall-clock hour of `minTarget` in target tz.
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(minTarget);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  let year = get("year");
  let month = get("month"); // 1-12
  let day = get("day");
  const hour = get("hour");
  // "24" can appear at midnight in some locales — normalise to 0.
  const wallHour = hour === 24 ? 0 : hour;

  // If we're already past sendAtHour for that local calendar day, roll to next day.
  if (wallHour >= sendAtHour) {
    // Increment the local-tz calendar day. Build a Date in UTC for the
    // local-tz midnight, add a day, then snap to sendAtHour.
    const incremented = new Date(Date.UTC(year, month - 1, day) + 86400000);
    year = incremented.getUTCFullYear();
    month = incremented.getUTCMonth() + 1;
    day = incremented.getUTCDate();
  }

  // We want the UTC moment that corresponds to `year-month-day sendAtHour:00`
  // in `tz`. Compute the tz offset for that local moment, then back-solve.
  // Strategy: assume offset, compute candidate UTC, then re-check offset by
  // formatting it back. One iteration is enough for fixed offsets (Vietnam).
  const naiveUTC = Date.UTC(year, month - 1, day, sendAtHour, 0, 0);
  const offsetMin = timezoneOffsetMinutes(new Date(naiveUTC), tz);
  const candidate = new Date(naiveUTC - offsetMin * 60000);

  // Sanity: candidate must be ≥ minTarget. If timezone DST math pushed us
  // backwards, add 24h.
  if (candidate.getTime() < minTarget.getTime()) {
    return new Date(candidate.getTime() + 86400000);
  }
  return candidate;
}

/** Get the timezone offset in minutes for `date` in `tz` (positive = east of UTC). */
function timezoneOffsetMinutes(date: Date, tz: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const localUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") === 24 ? 0 : get("hour"),
    get("minute"),
    get("second")
  );
  return Math.round((localUTC - date.getTime()) / 60000);
}

// ─── Main Processing Function ───────────────────────────────

/**
 * Process all automation enrollments that are ready for their next action.
 * Queries enrollments with status='waiting' and next_action_at <= now().
 */
export async function processAutomations(
  adminClient: SupabaseClient
): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  const { data: enrollments, error: fetchError } = await adminClient
    .from("email_automation_enrollments")
    .select("*")
    .eq("status", "waiting")
    .lte("next_action_at", new Date().toISOString());

  if (fetchError) {
    return { processed: 0, errors: [`Failed to fetch enrollments: ${fetchError.message}`] };
  }

  if (!enrollments || enrollments.length === 0) {
    return { processed: 0, errors: [] };
  }

  for (const enrollment of enrollments) {
    try {
      await processEnrollmentStep(adminClient, enrollment);
      processed++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`Enrollment ${enrollment.id}: ${errorMessage}`);

      // Log the error to automation_logs
      await adminClient.from("email_automation_logs").insert({
        enrollment_id: enrollment.id,
        automation_id: enrollment.automation_id,
        subscriber_id: enrollment.subscriber_id,
        step_id: enrollment.current_step_id,
        action: "error",
        metadata: { error: errorMessage },
      });
    }
  }

  return { processed, errors };
}

// ─── Process Single Enrollment Step ─────────────────────────

/**
 * Process the current step for a single enrollment.
 * Fetches the automation flow definition, finds the current node,
 * and executes the appropriate action based on node type.
 */
export async function processEnrollmentStep(
  adminClient: SupabaseClient,
  enrollment: any,
  depth: number = 0
): Promise<void> {
  // Fetch the automation's flow definition
  const { data: automation, error: autoError } = await adminClient
    .from("email_automations")
    .select("flow_definition")
    .eq("id", enrollment.automation_id)
    .single();

  if (autoError || !automation) {
    throw new Error(`Failed to fetch automation: ${autoError?.message || "not found"}`);
  }

  const flowDef: FlowDefinition = automation.flow_definition;

  // Find the current step node
  const currentNode = flowDef.nodes.find(
    (node) => node.id === enrollment.current_step_id
  );

  if (!currentNode) {
    throw new Error(`Current step node not found: ${enrollment.current_step_id}`);
  }

  // Process based on node type
  switch (currentNode.type) {
    case "trigger": {
      // Trigger nodes are passthrough — advance to the next node so the
      // first real step (usually a sendEmail) runs immediately.
      const nextNode = getNextNode(flowDef, currentNode.id);
      await advanceToNextStep(adminClient, enrollment, nextNode, depth);
      break;
    }

    case "sendEmail":
      await handleSendEmail(adminClient, enrollment, currentNode, flowDef, depth);
      break;

    case "wait":
      await handleWait(adminClient, enrollment, currentNode);
      break;

    case "condition":
      await handleCondition(adminClient, enrollment, currentNode, flowDef, depth);
      break;

    case "addTag":
      await handleAddTag(adminClient, enrollment, currentNode, flowDef, depth);
      break;

    case "removeTag":
      await handleRemoveTag(adminClient, enrollment, currentNode, flowDef, depth);
      break;

    case "end":
      await handleEnd(adminClient, enrollment);
      break;

    default:
      throw new Error(`Unknown node type: ${currentNode.type}`);
  }
}

// ─── Node Type Handlers ─────────────────────────────────────

async function handleSendEmail(
  adminClient: SupabaseClient,
  enrollment: any,
  node: FlowNode,
  flowDef: FlowDefinition,
  depth: number
): Promise<void> {
  const nodeData = node.data as SendEmailNodeData;

  // Get subscriber. Schema uses `full_name`, not first/last separately.
  const { data: subscriber, error: subError } = await adminClient
    .from("subscribers")
    .select("email, full_name")
    .eq("id", enrollment.subscriber_id)
    .single();

  if (subError || !subscriber) {
    throw new Error(`Failed to fetch subscriber: ${subError?.message || "not found"}`);
  }

  // Resolve email body: if a templateId is set, fetch the template's
  // html_content (and optionally its subject) — fall back to the
  // inline htmlContent / subject in nodeData otherwise.
  let subject = nodeData.subject || "";
  let html = nodeData.htmlContent || "";
  if (nodeData.templateId) {
    const { data: tpl, error: tplErr } = await adminClient
      .from("email_templates")
      .select("subject, html_content, is_active")
      .eq("id", nodeData.templateId)
      .maybeSingle();
    if (tplErr) {
      console.warn(
        `[automation processor] template ${nodeData.templateId} lookup failed:`,
        tplErr.message
      );
    } else if (!tpl) {
      console.warn(
        `[automation processor] template ${nodeData.templateId} not found — falling back to inline HTML`
      );
    } else {
      const t = tpl as { subject: string | null; html_content: string | null; is_active: boolean };
      if (t.html_content) html = t.html_content;
      // Inline subject wins if provided — otherwise use template subject.
      if (!subject && t.subject) subject = t.subject;
    }
  }

  // Render simple {{name}} / {{email}} variables in subject + html.
  const fullName = (subscriber.full_name as string) || "bạn";
  const firstName = fullName !== "bạn" ? fullName.split(" ").slice(-1)[0] : "bạn";
  const replace = (s: string) =>
    s
      .replace(/\{\{name\}\}/g, fullName)
      .replace(/\{\{full_name\}\}/g, fullName)
      .replace(/\{\{first_name\}\}/g, firstName)
      .replace(/\{\{email\}\}/g, subscriber.email as string);

  // Send via shared library (Resend fallback when SES not configured).
  const result = await sendEmailWithParams({
    to: subscriber.email as string,
    subject: replace(subject),
    html: replace(html),
    fromName: nodeData.fromName,
    fromEmail: nodeData.fromEmail,
    tags: {
      automation_id: enrollment.automation_id,
      enrollment_id: enrollment.id,
      step_id: node.id,
    },
  });
  if (!result.success) {
    throw new Error(result.error || "Email send failed");
  }

  // Log the action
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: enrollment.automation_id,
    subscriber_id: enrollment.subscriber_id,
    step_id: node.id,
    action: "email_sent",
    metadata: { subject: nodeData.subject, to: subscriber.email },
  });

  // Move to next step
  const nextNode = getNextNode(flowDef, node.id);
  await advanceToNextStep(adminClient, enrollment, nextNode, depth);
}

async function handleWait(
  adminClient: SupabaseClient,
  enrollment: any,
  node: FlowNode
): Promise<void> {
  const nodeData = node.data as WaitNodeData;

  const now = new Date();
  const nextActionAt = computeWaitTarget(now, nodeData);

  // Update enrollment
  await adminClient
    .from("email_automation_enrollments")
    .update({
      status: "waiting",
      next_action_at: nextActionAt.toISOString(),
    })
    .eq("id", enrollment.id);

  // Log the action
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: enrollment.automation_id,
    subscriber_id: enrollment.subscriber_id,
    step_id: node.id,
    action: "wait_started",
    metadata: {
      days: nodeData.days,
      hours: nodeData.hours,
      minutes: nodeData.minutes,
      sendAtHour: nodeData.sendAtHour ?? null,
      timezone: nodeData.timezone ?? null,
      next_action_at: nextActionAt.toISOString(),
    },
  });
}

async function handleCondition(
  adminClient: SupabaseClient,
  enrollment: any,
  node: FlowNode,
  flowDef: FlowDefinition,
  depth: number
): Promise<void> {
  const nodeData = node.data as ConditionNodeData;

  // Evaluate the condition
  const result = await evaluateCondition(adminClient, enrollment, nodeData);

  // Follow yes or no edge
  const handle = result ? "yes" : "no";
  const nextNode = getNextNode(flowDef, node.id, handle);

  // Log the action
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: enrollment.automation_id,
    subscriber_id: enrollment.subscriber_id,
    step_id: node.id,
    action: result ? "condition_yes" : "condition_no",
    metadata: {
      conditionType: nodeData.conditionType,
      config: nodeData.config,
      result,
    },
  });

  // Advance to next step
  await advanceToNextStep(adminClient, enrollment, nextNode, depth);
}

async function handleAddTag(
  adminClient: SupabaseClient,
  enrollment: any,
  node: FlowNode,
  flowDef: FlowDefinition,
  depth: number
): Promise<void> {
  const nodeData = node.data as AddTagNodeData;

  // Get subscriber's current tags
  const { data: subscriber, error: subError } = await adminClient
    .from("subscribers")
    .select("tags")
    .eq("id", enrollment.subscriber_id)
    .single();

  if (subError || !subscriber) {
    throw new Error(`Failed to fetch subscriber: ${subError?.message || "not found"}`);
  }

  // Add tag if not already present
  const currentTags: string[] = subscriber.tags || [];
  if (!currentTags.includes(nodeData.tagName)) {
    currentTags.push(nodeData.tagName);
    await adminClient
      .from("subscribers")
      .update({ tags: currentTags })
      .eq("id", enrollment.subscriber_id);
  }

  // Log the action
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: enrollment.automation_id,
    subscriber_id: enrollment.subscriber_id,
    step_id: node.id,
    action: "tag_added",
    metadata: { tag: nodeData.tagName },
  });

  // Move to next step
  const nextNode = getNextNode(flowDef, node.id);
  await advanceToNextStep(adminClient, enrollment, nextNode, depth);
}

async function handleRemoveTag(
  adminClient: SupabaseClient,
  enrollment: any,
  node: FlowNode,
  flowDef: FlowDefinition,
  depth: number
): Promise<void> {
  const nodeData = node.data as RemoveTagNodeData;

  // Get subscriber's current tags
  const { data: subscriber, error: subError } = await adminClient
    .from("subscribers")
    .select("tags")
    .eq("id", enrollment.subscriber_id)
    .single();

  if (subError || !subscriber) {
    throw new Error(`Failed to fetch subscriber: ${subError?.message || "not found"}`);
  }

  // Remove tag
  const currentTags: string[] = subscriber.tags || [];
  const updatedTags = currentTags.filter((tag) => tag !== nodeData.tagName);

  if (updatedTags.length !== currentTags.length) {
    await adminClient
      .from("subscribers")
      .update({ tags: updatedTags })
      .eq("id", enrollment.subscriber_id);
  }

  // Log the action
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: enrollment.automation_id,
    subscriber_id: enrollment.subscriber_id,
    step_id: node.id,
    action: "tag_removed",
    metadata: { tag: nodeData.tagName },
  });

  // Move to next step
  const nextNode = getNextNode(flowDef, node.id);
  await advanceToNextStep(adminClient, enrollment, nextNode, depth);
}

async function handleEnd(
  adminClient: SupabaseClient,
  enrollment: any
): Promise<void> {
  // Mark enrollment as completed
  await adminClient
    .from("email_automation_enrollments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", enrollment.id);

  // Update automation completed_count
  await adminClient.rpc("increment_field", {
    table_name: "email_automations",
    row_id: enrollment.automation_id,
    field_name: "completed_count",
    increment_by: 1,
  });

  // Log the action
  await adminClient.from("email_automation_logs").insert({
    enrollment_id: enrollment.id,
    automation_id: enrollment.automation_id,
    subscriber_id: enrollment.subscriber_id,
    step_id: null,
    action: "completed",
    metadata: {},
  });
}

// ─── Flow Navigation ────────────────────────────────────────

/**
 * Find the next node in the flow from the current node.
 * Optionally filter by sourceHandle (for condition yes/no branches).
 */
export function getNextNode(
  flowDef: FlowDefinition,
  currentNodeId: string,
  handle?: string
): FlowNode | null {
  // Find the edge from the current node
  const edge = flowDef.edges.find((e) => {
    if (e.source !== currentNodeId) return false;
    if (handle && e.sourceHandle !== handle) return false;
    return true;
  });

  if (!edge) return null;

  // Find and return the target node
  const targetNode = flowDef.nodes.find((node) => node.id === edge.target);
  return targetNode || null;
}

// ─── Condition Evaluation ───────────────────────────────────

/**
 * Evaluate a condition node based on its conditionType.
 */
export async function evaluateCondition(
  adminClient: SupabaseClient,
  enrollment: any,
  conditionData: ConditionNodeData
): Promise<boolean> {
  switch (conditionData.conditionType) {
    case "has_tag": {
      const { data: subscriber } = await adminClient
        .from("subscribers")
        .select("tags")
        .eq("id", enrollment.subscriber_id)
        .single();

      if (!subscriber) return false;
      const tags: string[] = subscriber.tags || [];
      return tags.includes(conditionData.config.tag || "");
    }

    case "opened_email": {
      const { data: sends } = await adminClient
        .from("email_sends")
        .select("opened_at")
        .eq("subscriber_id", enrollment.subscriber_id)
        .eq("automation_step_id", conditionData.config.stepId || "")
        .not("opened_at", "is", null)
        .limit(1);

      return (sends && sends.length > 0) || false;
    }

    case "clicked_link": {
      const { data: sends } = await adminClient
        .from("email_sends")
        .select("clicked_at")
        .eq("subscriber_id", enrollment.subscriber_id)
        .eq("automation_step_id", conditionData.config.stepId || "")
        .not("clicked_at", "is", null)
        .limit(1);

      return (sends && sends.length > 0) || false;
    }

    case "in_list": {
      const { data: membership } = await adminClient
        .from("subscriber_list_members")
        .select("id")
        .eq("subscriber_id", enrollment.subscriber_id)
        .eq("list_id", conditionData.config.listId || "")
        .limit(1);

      return (membership && membership.length > 0) || false;
    }

    default:
      return false;
  }
}

// ─── Step Advancement ───────────────────────────────────────

/**
 * Advance the enrollment to the next step.
 * If nextNode is null, complete the enrollment.
 * If nextNode is a wait node, set status='waiting' with calculated next_action_at.
 * Otherwise, update current_step_id and recursively process (max depth 10).
 */
export async function advanceToNextStep(
  adminClient: SupabaseClient,
  enrollment: any,
  nextNode: FlowNode | null,
  depth: number = 0
): Promise<void> {
  // Prevent infinite loops
  if (depth >= MAX_RECURSION_DEPTH) {
    await adminClient.from("email_automation_logs").insert({
      enrollment_id: enrollment.id,
      automation_id: enrollment.automation_id,
      subscriber_id: enrollment.subscriber_id,
      step_id: enrollment.current_step_id,
      action: "error",
      metadata: { error: "Max recursion depth reached", depth },
    });
    return;
  }

  // No next node means end of flow
  if (!nextNode) {
    await adminClient
      .from("email_automation_enrollments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id);

    await adminClient.rpc("increment_field", {
      table_name: "email_automations",
      row_id: enrollment.automation_id,
      field_name: "completed_count",
      increment_by: 1,
    });

    await adminClient.from("email_automation_logs").insert({
      enrollment_id: enrollment.id,
      automation_id: enrollment.automation_id,
      subscriber_id: enrollment.subscriber_id,
      step_id: null,
      action: "completed",
      metadata: {},
    });
    return;
  }

  // If next node is a wait node, set up the wait
  if (nextNode.type === "wait") {
    const waitData = nextNode.data as WaitNodeData;
    const now = new Date();
    const nextActionAt = computeWaitTarget(now, waitData);

    await adminClient
      .from("email_automation_enrollments")
      .update({
        current_step_id: nextNode.id,
        status: "waiting",
        next_action_at: nextActionAt.toISOString(),
      })
      .eq("id", enrollment.id);

    await adminClient.from("email_automation_logs").insert({
      enrollment_id: enrollment.id,
      automation_id: enrollment.automation_id,
      subscriber_id: enrollment.subscriber_id,
      step_id: nextNode.id,
      action: "wait_started",
      metadata: {
        days: waitData.days,
        hours: waitData.hours,
        minutes: waitData.minutes,
        sendAtHour: waitData.sendAtHour ?? null,
        timezone: waitData.timezone ?? null,
        next_action_at: nextActionAt.toISOString(),
      },
    });
    return;
  }

  // For other node types, update current_step_id and process immediately
  await adminClient
    .from("email_automation_enrollments")
    .update({
      current_step_id: nextNode.id,
    })
    .eq("id", enrollment.id);

  // Update the enrollment object for recursive processing
  const updatedEnrollment = { ...enrollment, current_step_id: nextNode.id };
  await processEnrollmentStep(adminClient, updatedEnrollment, depth + 1);
}
