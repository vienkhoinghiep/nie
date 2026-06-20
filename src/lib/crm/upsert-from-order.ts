import type { SupabaseClient } from "@supabase/supabase-js";
import { CRM_JOURNEY_STAGES, type CrmJourneyStage } from "@/lib/crm-constants";

/** Rank a stage so we never DOWN-grade a contact's journey. */
function stageRank(stage: string | null | undefined): number {
  if (!stage) return -1;
  const idx = CRM_JOURNEY_STAGES.indexOf(stage as CrmJourneyStage);
  return idx === -1 ? -1 : idx;
}

/**
 * Upsert a CRM contact when a payment succeeds, so customers automatically
 * show up in /crm/contacts without a manual sync.
 *
 * - Matches existing contact by email (case-insensitive).
 * - Creates new contact if none exists.
 * - Promotes journey stage based on amount:
 *     amount > 0  → "customer" (paid)
 *     amount = 0  → "negotiation" (Shopper — đã đăng ký sản phẩm miễn phí)
 *   Never down-grades an existing higher stage.
 * - Increments lifetime_value + total_orders for paid orders.
 *
 * Safe to call from a payment webhook — wrapped errors won't propagate.
 */
export async function upsertCrmContactFromOrder(
  supabase: SupabaseClient,
  order: {
    id: string;
    user_id: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    amount: number | null;
    paid_at: string | null;
    created_at: string | null;
  }
): Promise<void> {
  const rawEmail = order.customer_email?.trim();
  if (!rawEmail) return;
  const email = rawEmail.toLowerCase();
  const now = new Date().toISOString();
  const paidAt = order.paid_at ?? now;
  const amount = Math.max(0, order.amount ?? 0);

  // 1. Look up by email (case-insensitive). We use ilike + limit 1 because
  //    crm_contacts.email isn't guaranteed lowercase-normalized historically.
  const { data: existing } = await supabase
    .from("crm_contacts")
    .select("id, lifetime_value, total_orders, journey_stage, status, full_name, phone, user_id")
    .ilike("email", email)
    .limit(1)
    .maybeSingle();

  // Decide journey stage from amount, never downgrading what's already set.
  // amount > 0  → "customer" (paid)
  // amount = 0  → "negotiation" (Shopper — đăng ký free khoá/webinar)
  const targetStage: CrmJourneyStage = amount > 0 ? "customer" : "negotiation";
  const isPaid = amount > 0;

  if (existing) {
    const currentRank = stageRank(existing.journey_stage);
    const targetRank = stageRank(targetStage);
    const finalStage =
      targetRank > currentRank ? targetStage : (existing.journey_stage as CrmJourneyStage);

    const patch: Record<string, unknown> = {
      lifetime_value: (existing.lifetime_value ?? 0) + amount,
      total_orders: (existing.total_orders ?? 0) + (isPaid ? 1 : 0),
      journey_stage: finalStage,
      last_contacted_at: paidAt,
      updated_at: now,
    };
    // Status flips to "won" only for paid orders — free signups stay "new".
    if (isPaid) patch.status = "won";
    // Set converted_at the first time they reach "customer"
    if (finalStage === "customer" && existing.journey_stage !== "customer") {
      patch.converted_at = paidAt;
    }
    // Backfill missing fields from the order
    if (!existing.full_name && order.customer_name) patch.full_name = order.customer_name;
    if (!existing.phone && order.customer_phone) patch.phone = order.customer_phone;
    if (!existing.user_id && order.user_id) patch.user_id = order.user_id;

    await supabase.from("crm_contacts").update(patch).eq("id", existing.id);
    return;
  }

  // 2. Insert new contact at the appropriate stage.
  await supabase.from("crm_contacts").insert({
    full_name: order.customer_name || email.split("@")[0],
    email,
    phone: order.customer_phone || null,
    source: "website",
    status: isPaid ? "won" : "new",
    journey_stage: targetStage,
    user_id: order.user_id || null,
    lifetime_value: amount,
    total_orders: isPaid ? 1 : 0,
    first_seen_at: order.created_at ?? paidAt,
    converted_at: isPaid ? paidAt : null,
    last_contacted_at: paidAt,
  });
}
