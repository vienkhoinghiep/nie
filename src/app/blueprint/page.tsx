import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import { hasBlueprintAccess } from "@/lib/blueprint/access";
import BlueprintSalesLanding from "./BlueprintSalesLanding";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG = "entrepreneur-financial-blueprint";

const TITLE =
  "Entrepreneur Financial Blueprint™ — Hãy Mời Tôi Một Bữa Tối | " +
  siteConfig.name;
const DESCRIPTION =
  "Chỉ 60 phút trả lời bộ câu hỏi chuyên sâu — nhìn thấy toàn bộ bản đồ tài chính của cuộc đời bạn. Báo cáo, Wealth MRI™, Risk Map™, Roadmap tự do tài chính + video. Tổng giá trị 10.000.000đ, giá niêm yết 9.845.267đ — ưu đãi 100 người đầu tiên chỉ 298.456đ.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${getBaseUrl()}/blueprint` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
    url: `${getBaseUrl()}/blueprint`,
  },
};

export default async function BlueprintSalesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = await createAdminClient();
  const { data: product } = await admin
    .from("products")
    .select("id, slug, title, description, price, sale_price, status")
    .eq("slug", PRODUCT_SLUG)
    .single();

  // Người đã có quyền dùng tool → hiển thị nút vào thẳng công cụ.
  const alreadyOwns = user ? await hasBlueprintAccess(user.id) : false;

  const price = product
    ? (product.sale_price ?? product.price ?? 298456)
    : 298456;

  return (
    <BlueprintSalesLanding
      product={
        product
          ? {
              id: product.id as string,
              name: product.title as string,
              price,
              description: (product.description as string) ?? undefined,
            }
          : null
      }
      isAuthenticated={!!user}
      alreadyOwns={alreadyOwns}
    />
  );
}
