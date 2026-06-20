import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ALLOWED_ROLES = ["admin", "manager", "marketing"];

async function authorize() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Unauthorized" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return { ok: false as const, status: 403, error: "Forbidden" };
  }
  return { ok: true as const, userId: user.id, role: profile.role };
}

// GET /api/admin/landing-pages — list
export async function GET() {
  const auth = await authorize();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("landing_pages")
    .select(
      "id, slug, title, status, views, conversions, updated_at, created_at, hero_headline"
    )
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[admin landing-pages GET]", error);
    return NextResponse.json(
      { error: "Không tải được landing pages." },
      { status: 500 }
    );
  }
  return NextResponse.json({ landingPages: data ?? [] });
}

// POST /api/admin/landing-pages — create
export async function POST(req: NextRequest) {
  const auth = await authorize();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { slug, title } = body;
  if (!slug?.trim() || !title?.trim()) {
    return NextResponse.json(
      { error: "slug và title bắt buộc" },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();
  const insertData = {
    slug: slug.trim().toLowerCase(),
    title: title.trim(),
    hero_headline: body.hero_headline?.trim() || title.trim(),
    hero_subheadline: body.hero_subheadline?.trim() || null,
    hero_badge: body.hero_badge?.trim() || "🎁 QUÀ TẶNG MIỄN PHÍ",
    hero_image_url: body.hero_image_url?.trim() || null,
    meta_description: body.meta_description?.trim() || null,
    benefits: Array.isArray(body.benefits) ? body.benefits : [],
    bonus_items: Array.isArray(body.bonus_items) ? body.bonus_items : [],
    testimonials: Array.isArray(body.testimonials) ? body.testimonials : [],
    body_html: body.body_html?.trim() || null,
    form_fields: Array.isArray(body.form_fields) ? body.form_fields : ["name", "email", "phone"],
    cta_label: body.cta_label?.trim() || "NHẬN QUÀ NGAY",
    success_message: body.success_message?.trim() ||
      "Cảm ơn bạn! Hãy kiểm tra hộp thư để nhận quà.",
    success_redirect_url: body.success_redirect_url?.trim() || null,
    tag_on_submit: body.tag_on_submit?.trim() || null,
    automation_id: body.automation_id || null,
    add_to_list_id: body.add_to_list_id || null,
    brand_color: body.brand_color?.trim() || null,
    status: body.status === "published" ? "published" : "draft",
  };

  const { data, error } = await admin
    .from("landing_pages")
    .insert(insertData)
    .select()
    .single();
  if (error) {
    console.error("[admin landing-pages POST]", error);
    return NextResponse.json(
      { error: error.message ?? "Không tạo được landing page." },
      { status: 500 }
    );
  }
  return NextResponse.json({ landingPage: data });
}

// PATCH /api/admin/landing-pages?id=… — update existing
export async function PATCH(req: NextRequest) {
  const auth = await authorize();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Whitelist of fields callers may update — protects views/conversions/timestamps.
  const allowedFields = [
    "slug",
    "title",
    "meta_description",
    "hero_badge",
    "hero_headline",
    "hero_subheadline",
    "hero_image_url",
    "benefits",
    "bonus_items",
    "testimonials",
    "body_html",
    "form_fields",
    "cta_label",
    "success_message",
    "success_redirect_url",
    "tag_on_submit",
    "automation_id",
    "add_to_list_id",
    "brand_color",
    "status",
  ] as const;

  const update: Record<string, unknown> = {};
  for (const f of allowedFields) {
    if (f in body) update[f] = body[f];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Không có field nào để cập nhật" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("landing_pages")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[admin landing-pages PATCH]", error);
    return NextResponse.json(
      { error: error.message ?? "Không cập nhật được." },
      { status: 500 }
    );
  }
  return NextResponse.json({ landingPage: data });
}

// DELETE /api/admin/landing-pages?id=…
export async function DELETE(req: NextRequest) {
  const auth = await authorize();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });

  const admin = await createAdminClient();
  const { error } = await admin.from("landing_pages").delete().eq("id", id);
  if (error) {
    console.error("[admin landing-pages DELETE]", error);
    return NextResponse.json(
      { error: error.message ?? "Không xoá được." },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
