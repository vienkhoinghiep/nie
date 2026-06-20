import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Shared admin check
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { admin };
}

// GET: list all categories with nested resources
export async function GET() {
  const check = await requireAdmin();
  if ("error" in check) return check.error;

  const { data: categories } = await check.admin
    .from("resource_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: resources } = await check.admin
    .from("resources")
    .select("*")
    .order("sort_order", { ascending: true });

  // Also load courses for the "linked course" dropdown
  const { data: products } = await check.admin
    .from("products")
    .select("id, slug, title, price")
    .eq("type", "course")
    .order("sort_order", { ascending: true });

  return NextResponse.json({
    categories: categories || [],
    resources: resources || [],
    products: products || [],
  });
}

// POST: create resource OR category, depending on body.kind
export async function POST(req: NextRequest) {
  const check = await requireAdmin();
  if ("error" in check) return check.error;
  const body = await req.json();

  if (body.kind === "category") {
    const { data, error } = await check.admin.from("resource_categories").insert({
      name: body.name,
      icon: body.icon || "FileText",
      color: body.color || "#2563EB",
      bg: body.bg || "rgba(37,99,235,0.1)",
      sort_order: body.sort_order ?? 999,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ category: data });
  }

  if (body.kind === "resource") {
    const { data, error } = await check.admin.from("resources").insert({
      category_id: body.category_id,
      title: body.title,
      description: body.description || null,
      file_url: body.file_url || null,
      available: body.available ?? false,
      sort_order: body.sort_order ?? 999,
      product_id: body.product_id || null,
    }).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ resource: data });
  }

  return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
}

// PATCH: update resource or category by id
export async function PATCH(req: NextRequest) {
  const check = await requireAdmin();
  if ("error" in check) return check.error;
  const body = await req.json();
  if (!body.id || !body.kind) return NextResponse.json({ error: "Missing id/kind" }, { status: 400 });

  const table = body.kind === "category" ? "resource_categories" : "resources";
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of ["name","icon","color","bg","sort_order","title","description","file_url","available","category_id","product_id"]) {
    if (field in body) updates[field] = body[field];
  }
  const { data, error } = await check.admin.from(table).update(updates).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// DELETE: ?id=...&kind=resource|category
export async function DELETE(req: NextRequest) {
  const check = await requireAdmin();
  if ("error" in check) return check.error;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind");
  if (!id || !kind) return NextResponse.json({ error: "Missing id/kind" }, { status: 400 });
  const table = kind === "category" ? "resource_categories" : "resources";
  const { error } = await check.admin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
