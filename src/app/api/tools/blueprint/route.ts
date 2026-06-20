/**
 * Entrepreneur Financial Blueprint API
 *
 *   GET  /api/tools/blueprint           → returns current user's data + progress
 *   PUT  /api/tools/blueprint           → upsert (body: { data?, progress? })
 *
 * Auth: required (must be logged-in)
 * Access: must have bought 1 of 3 tier packages — handled by SELECT RLS
 *         and our hasBlueprintAccess() helper (returns 403 if not).
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasBlueprintAccess } from "@/lib/blueprint/access";
import type {
  BlueprintData,
  BlueprintProgress,
} from "@/lib/blueprint/types";

export const dynamic = "force-dynamic";

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function GET() {
  const { userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const hasAccess = await hasBlueprintAccess(userId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "no_access", reason: "blueprint_requires_tier_purchase" },
      { status: 403 }
    );
  }
  // Dùng admin client — đã verify auth ở trên.
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("financial_blueprints")
    .select("data, progress, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[blueprint API GET] select error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    data: data?.data ?? {},
    progress: data?.progress ?? {},
    updated_at: data?.updated_at ?? null,
  });
}

interface PutBody {
  data?: BlueprintData;
  progress?: BlueprintProgress;
}

// POST handler — alias của PUT để hỗ trợ navigator.sendBeacon (chỉ POST được)
export async function POST(req: NextRequest) {
  return PUT(req);
}

export async function PUT(req: NextRequest) {
  const { supabase, userId } = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const hasAccess = await hasBlueprintAccess(userId);
  if (!hasAccess) {
    return NextResponse.json(
      { error: "no_access", reason: "blueprint_requires_tier_purchase" },
      { status: 403 }
    );
  }

  let body: PutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // QUAN TRỌNG: Dùng admin client cho cả SELECT + UPSERT để tránh RLS edge cases.
  // Đã verify auth qua getUserId() + hasBlueprintAccess() ở trên — userId
  // được set explicit nên không có security gap.
  void supabase;
  const admin = await createAdminClient();

  // Fetch existing row to merge (PATCH-like behaviour with upsert).
  const { data: existing } = await admin
    .from("financial_blueprints")
    .select("data, progress")
    .eq("user_id", userId)
    .maybeSingle();

  const nextData = {
    ...(existing?.data as BlueprintData | null ?? {}),
    ...(body.data ?? {}),
  };
  const nextProgress = {
    ...(existing?.progress as BlueprintProgress | null ?? {}),
    ...(body.progress ?? {}),
  };

  const { error } = await admin.from("financial_blueprints").upsert(
    {
      user_id: userId,
      data: nextData,
      progress: nextProgress,
    },
    { onConflict: "user_id" }
  );
  if (error) {
    console.error("[blueprint API PUT] upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: nextData, progress: nextProgress });
}
