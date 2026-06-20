/**
 * Entrepreneur Financial Blueprint — access gating
 *
 * Chỉ học viên đã MUA 1 trong các gói sau mới được dùng tool này:
 *   - Entrepreneur Financial Blueprint™  (298.456đ — salepage /blueprint)
 *   - Financial OS Pro                   (2.984.567đ)
 *   - Wealth Mentor                      (9.845.267đ)
 *
 * KHÔNG tính khóa "Money Reset" (goi-huong-dan-...) vì khóa đó được tặng miễn
 * phí cho mọi tài khoản đăng ký — nếu tính sẽ làm thủng paywall của công cụ.
 *
 * Check qua bảng `enrollments` (user_id + product_id).
 */

import { createAdminClient } from "@/lib/supabase/server";

export const BLUEPRINT_TIER_SLUGS = [
  "entrepreneur-financial-blueprint", // Blueprint salepage (298.456đ)
  // LƯU Ý: KHÔNG đưa "goi-huong-dan-hoach-dinh-tai-chinh-ca-nhan" (Money Reset)
  // vào đây — khóa đó được TẶNG MIỄN PHÍ cho mọi tài khoản đăng ký, nên nếu
  // đưa vào sẽ khiến khách dùng công cụ Blueprint trả phí miễn phí.
  "goi-hoach-dinh-tai-chinh-ca-nhan-nang-cao", // Financial OS Pro
  "goi-hoach-dinh-tai-chinh-ca-nhan-toan-dien", // Wealth Mentor
] as const;

/**
 * Returns true if the user has bought at least 1 of the 3 tier packages.
 * Uses admin client to bypass RLS for the check.
 */
export async function hasBlueprintAccess(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const admin = await createAdminClient();
    // 1) Get product IDs of the 3 tier slugs
    const { data: products } = await admin
      .from("products")
      .select("id")
      .in("slug", [...BLUEPRINT_TIER_SLUGS]);
    const productIds = (products ?? []).map((p) => p.id);
    if (productIds.length === 0) return false;
    // 2) Check enrollments
    const { data: enrolls } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .in("product_id", productIds)
      .limit(1);
    return (enrolls ?? []).length > 0;
  } catch {
    return false;
  }
}
