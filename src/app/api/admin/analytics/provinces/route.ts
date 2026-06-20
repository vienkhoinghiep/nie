import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/analytics/provinces
 * Phân bổ khách hàng (crm_contacts) theo Tỉnh/Thành.
 * Tỉnh được suy ra từ IP lúc đăng ký (xem lib/geo/vn-province).
 *
 * Trả về { total, known, unknown, provinces: [{ province, count }] } (sort desc).
 */
export async function GET() {
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

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("crm_contacts")
    .select("province")
    .limit(100000);
  if (error) {
    console.error("[analytics/provinces]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  let total = 0;
  let known = 0;
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    total++;
    const p = ((row as { province: string | null }).province || "").trim();
    if (p) {
      known++;
      map.set(p, (map.get(p) ?? 0) + 1);
    }
  }
  const provinces = [...map.entries()]
    .map(([province, count]) => ({ province, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    total,
    known,
    unknown: total - known,
    provinces,
  });
}
