import { Suspense } from "react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import TopBar from "@/components/layout/TopBar";
import CoursesClient from "@/components/courses/CoursesClient";
import CoursesPublicGrid from "@/components/courses/CoursesPublicGrid";

const BASE_URL = getBaseUrl();

export const metadata = {
  title: `Khoá học — ${siteConfig.name}`,
  description:
    "Khoá học tư vấn tài chính cá nhân cho nhà khởi nghiệp: dòng tiền, tối ưu thuế, hoạch định đầu tư và xây dựng tài sản bền vững.",
  alternates: {
    canonical: `${BASE_URL}/courses`,
  },
  openGraph: {
    title: `Khoá học — ${siteConfig.name}`,
    description:
      "Khoá học tư vấn tài chính cá nhân cho nhà khởi nghiệp: dòng tiền, tối ưu thuế, hoạch định đầu tư và xây dựng tài sản bền vững.",
    url: "/courses",
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
    // images omitted on purpose — Next.js auto-uses the root opengraph-image.tsx
  },
};

export default async function CoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch published products với chapter + lesson counts (admin client bypass RLS).
  // Loại bỏ sản phẩm cửa hàng (book/ebook/tool) — chúng có trang riêng /shop.
  const adminDb = await createAdminClient();
  const { data: products } = await adminDb
    .from("products")
    .select(
      `
      id, slug, title, description, price, sale_price, type, tier_required, thumbnail, status, category,
      chapters(id, lessons(id))
    `
    )
    .in("status", ["published", "coming_soon"])
    .not("type", "in", "(book,ebook,tool)")
    .order("sort_order");

  const allProducts = (products ?? []).map((p) => {
    const chapters =
      (p.chapters as { id: string; lessons: { id: string }[] }[]) ?? [];
    const chapterCount = chapters.length;
    const lessonCount = chapters.reduce(
      (sum, ch) => sum + (ch.lessons?.length ?? 0),
      0
    );
    const pAny = p as Record<string, unknown>;
    return { ...p, chapterCount, lessonCount, status: pAny.status as string, category: (pAny.category as string) || null };
  });

  /* ── Authenticated: full dashboard experience ── */
  if (user) {
    const { data: enrollments } = await adminDb
      .from("enrollments")
      .select("product_id")
      .eq("user_id", user.id);

    const { data: progressRows } = await adminDb
      .from("lesson_progress")
      .select("product_id, completed")
      .eq("user_id", user.id)
      .eq("completed", true);

    const { data: profile } = await adminDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    const enrolledIds = new Set(
      (enrollments ?? []).map((e) => e.product_id)
    );

    const completedByProduct: Record<string, number> = {};
    for (const row of progressRows ?? []) {
      completedByProduct[row.product_id] =
        (completedByProduct[row.product_id] ?? 0) + 1;
    }

    const courses = allProducts.map((p) => {
      const completedLessons = completedByProduct[p.id] ?? 0;
      const progress =
        p.lessonCount > 0
          ? Math.round((completedLessons / p.lessonCount) * 100)
          : 0;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        price: p.price,
        sale_price: p.sale_price,
        type: p.type,
        tier_required: p.tier_required,
        thumbnail: p.thumbnail,
        status: p.status,
        category: p.category,
        enrolled: isAdmin || enrolledIds.has(p.id),
        progress,
        lesson_count: p.lessonCount,
        chapter_count: p.chapterCount,
      };
    });

    return (
      <div>
        <TopBar title="Khoá học" subtitle="Học từ những người đã làm được" />
        <Suspense fallback={null}>
          <CoursesClient courses={courses} />
        </Suspense>
      </div>
    );
  }

  /* ── Public: clean course grid for visitors ── */
  const publicCourses = allProducts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    price: p.price,
    sale_price: p.sale_price,
    thumbnail: p.thumbnail,
    type: p.type,
    status: p.status,
    category: p.category,
    lessonCount: p.lessonCount,
    chapterCount: p.chapterCount,
  }));

  return <CoursesPublicGrid courses={publicCourses} />;
}
