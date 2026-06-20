/**
 * Tier package → child course enrollment mapping.
 *
 * When a user buys one of the 3 tier packages (Hướng Dẫn / Nâng Cao /
 * Toàn Diện), they get access to the courses listed below in addition
 * to the package product itself.
 *
 * Toàn Diện = "ALL" → enrolled into every published course (except other
 * tier packages, to avoid duplicate parent enrollments).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

const TIER_PACKAGE_SLUGS = [
  // Track 1 — Hoạch Định Tài Chính Cá Nhân Toàn Diện
  "goi-huong-dan-hoach-dinh-tai-chinh-ca-nhan",
  "goi-hoach-dinh-tai-chinh-ca-nhan-nang-cao",
  "goi-hoach-dinh-tai-chinh-ca-nhan-toan-dien",
  // Track 2 — Entrepreneur Financial Mentor (EFM)
  "goi-efm-nen-tang",
  "goi-efm-solopreneur",
  "goi-efm-chuyen-gia",
  // Blueprint — tool bán riêng ở /blueprint nhưng kèm mở khóa khóa học Money Reset
  "entrepreneur-financial-blueprint",
] as const;

/** Explicit bundle children for each tier package. */
export const TIER_BUNDLES: Record<string, string[] | "ALL"> = {
  // ─── Track 1: Hoạch Định TC Cá Nhân ───
  "goi-huong-dan-hoach-dinh-tai-chinh-ca-nhan": [
    "founder-money-reset-hoach-dinh-tai-chinh-ca-nhan-cho-founder",
  ],
  "goi-hoach-dinh-tai-chinh-ca-nhan-nang-cao": [
    "founder-money-reset-hoach-dinh-tai-chinh-ca-nhan-cho-founder",
    "founder-financial-os-pro-hoach-dinh-tai-chinh-cho-nha-khoi-nghiep",
  ],
  "goi-hoach-dinh-tai-chinh-ca-nhan-toan-dien": "ALL",

  // ─── Blueprint (tool /blueprint) → kèm khóa Entrepreneur Money Reset ───
  // Mua Blueprint = tự ghi danh khóa "Entrepreneur Money Reset" để xem được ngay.
  "entrepreneur-financial-blueprint": [
    "goi-huong-dan-hoach-dinh-tai-chinh-ca-nhan",
  ],

  // ─── Track 2: Entrepreneur Financial Mentor (EFM) ───
  // Tier 1 — Nền tảng
  "goi-efm-nen-tang": ["nen-tang-khoi-nghiep-thanh-cong"],
  // Tier 2 — + AI SoloPreneur (Xây Dựng Đế Chế 1 Người)
  "goi-efm-solopreneur": [
    "nen-tang-khoi-nghiep-thanh-cong",
    "xay-dung-de-che-kinh-doanh-1-nguoi-trong-ky-nguyen-ai",
  ],
  // Tier 3 — + Chuyên Gia Tư Vấn TC Cho Nhà Khởi Nghiệp
  "goi-efm-chuyen-gia": [
    "nen-tang-khoi-nghiep-thanh-cong",
    "xay-dung-de-che-kinh-doanh-1-nguoi-trong-ky-nguyen-ai",
    "chuyen-tu-van-tai-chinh-cho-nha-khoi-nghiep",
  ],
};

export function isTierPackageSlug(slug: string | null | undefined): boolean {
  return !!slug && (TIER_PACKAGE_SLUGS as readonly string[]).includes(slug);
}

/**
 * Resolve the child product IDs for a given tier package slug. Returns
 * the list of products the user should be enrolled into (besides the
 * tier package itself). Pure DB lookup — no enrollment side-effect.
 */
export async function getBundleChildProductIds(
  admin: SupabaseClient,
  tierSlug: string
): Promise<string[]> {
  const mapping = TIER_BUNDLES[tierSlug];
  if (!mapping) return [];

  if (mapping === "ALL") {
    // Toàn Diện — enroll into every published course product except other
    // tier packages (to avoid the user accidentally getting Nâng Cao's
    // child products via Toàn Diện's "ALL" enrollment chain).
    const { data } = await admin
      .from("products")
      .select("id, slug")
      .eq("status", "published")
      .eq("type", "course")
      .not(
        "slug",
        "in",
        `(${TIER_PACKAGE_SLUGS.map((s) => `"${s}"`).join(",")})`
      );
    return (data ?? []).map((p) => p.id as string);
  }

  // Explicit child list — fetch IDs by slug
  const { data } = await admin
    .from("products")
    .select("id")
    .in("slug", mapping)
    .eq("status", "published");
  return (data ?? []).map((p) => p.id as string);
}

/**
 * Enroll the user into all bundle children for a tier package. Idempotent
 * (upsert on user_id+product_id). Never throws — logs only.
 */
export async function enrollBundleChildren(
  admin: SupabaseClient,
  userId: string,
  tierSlug: string,
  orderId?: string | null
): Promise<{ enrolled: number; failed: number }> {
  try {
    const childIds = await getBundleChildProductIds(admin, tierSlug);
    if (childIds.length === 0) return { enrolled: 0, failed: 0 };

    const rows = childIds.map((product_id) => ({
      user_id: userId,
      product_id,
      order_id: orderId ?? null,
      source: "bundle" as const,
    }));

    const { error } = await admin
      .from("enrollments")
      .upsert(rows, { onConflict: "user_id,product_id" });

    if (error) {
      console.warn(
        "[tier-bundles] enroll bundle children failed:",
        error.message
      );
      return { enrolled: 0, failed: childIds.length };
    }

    return { enrolled: childIds.length, failed: 0 };
  } catch (e) {
    console.warn(
      "[tier-bundles] enrollBundleChildren error:",
      e instanceof Error ? e.message : e
    );
    return { enrolled: 0, failed: 0 };
  }
}
