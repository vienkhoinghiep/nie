import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const, status: 401 };
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) {
    return { error: "forbidden" as const, status: 403 };
  }
  return { admin };
}

export async function POST(req: Request) {
  const auth = await checkAdmin();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  if (!body.full_name || !body.slug) {
    return NextResponse.json({ error: "Thiếu full_name hoặc slug." }, { status: 400 });
  }

  const { data, error } = await auth.admin.from("mentors").insert(body).select().single();
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug đã tồn tại — chọn slug khác." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, mentor: data }, { status: 201 });
}
