import type { Metadata } from "next";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import { hasBlueprintAccess } from "@/lib/blueprint/access";
import { Sparkles } from "lucide-react";
import BlueprintSalesLanding from "../blueprint/BlueprintSalesLanding";

export const dynamic = "force-dynamic";

const BRAND = "#2563EB";
const PRODUCT_SLUG = "entrepreneur-financial-blueprint";

// Video cảm ơn — thay YouTube ID dưới đây bằng video cảm ơn của Thầy.
// (Tạm dùng video giới thiệu để trang không trống.)
const THANK_YOU_VIDEO_ID = "zB3orvoBQaU";

export const metadata: Metadata = {
  title: `Cảm ơn bạn đã đăng ký | ${siteConfig.name}`,
  description:
    "Cảm ơn bạn đã gia nhập VINEN. Xem video chào mừng và nhận Entrepreneur Financial Blueprint™.",
  robots: { index: false, follow: false },
};

export default async function OtoPage() {
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

  const alreadyOwns = user ? await hasBlueprintAccess(user.id) : false;
  const price = product
    ? (product.sale_price ?? product.price ?? 298456)
    : 298456;

  const videoSlot = (
    <div className="text-center">
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
        style={{
          background: `${BRAND}1a`,
          color: BRAND,
          border: `1px solid ${BRAND}40`,
        }}
      >
        <Sparkles size={13} /> Chào mừng thành viên mới
      </span>
      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
        Cảm ơn bạn đã gia nhập{" "}
        <span style={{ color: BRAND }}>{siteConfig.name}</span>! 🎉
      </h1>
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-7 max-w-2xl mx-auto">
        Tài khoản của bạn đã sẵn sàng. Hãy xem video bên dưới — một lời nhắn
        đặc biệt dành riêng cho bạn.
      </p>
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#2a2a2a] bg-black shadow-2xl">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${THANK_YOU_VIDEO_ID}?rel=0&modestbranding=1`}
          title="Video cảm ơn — VINEN"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );

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
      videoSlot={videoSlot}
    />
  );
}
