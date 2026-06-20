import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * POST /api/blueprint/order
 * Tạo đơn hàng Blueprint cho NGƯỜI ĐÃ ĐĂNG NHẬP (không cần điền lại form).
 * Dùng cho nút CTA trên /oto — bấm là ra thẳng QR thanh toán.
 *
 * Trả về { success, paymentInfo } giống /api/blueprint/register.
 * Nếu đã có đơn pending cho sản phẩm này thì tái sử dụng (tránh tạo trùng).
 */

const BLUEPRINT_PRODUCT_SLUG = "entrepreneur-financial-blueprint";

function generateOrderCode(prefix = "DK", length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const maxValid = 256 - (256 % chars.length);
  let result = prefix;
  while (result.length < prefix.length + length) {
    const bytes = randomBytes(length - (result.length - prefix.length));
    for (const byte of bytes) {
      if (byte < maxValid && result.length < prefix.length + length) {
        result += chars[byte % chars.length];
      }
    }
  }
  return result;
}

function buildPaymentInfo(orderCode: string, amount: number) {
  const bankAccount = process.env.SEPAY_BANK_ACCOUNT;
  const bankCode = process.env.SEPAY_BANK_CODE;
  const hasSepay = bankAccount && bankCode && !bankAccount.includes("your-");
  return {
    order_code: orderCode,
    amount,
    bank_account: hasSepay ? bankAccount : null,
    bank_code: hasSepay ? bankCode : null,
    transfer_content: orderCode,
    qr_url: hasSepay
      ? `/api/qr?bank=${bankCode}&acc=${bankAccount}&amount=${amount}&des=${orderCode}`
      : null,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    // Cho phép truyền product_slug để tái dùng cho các trang bán khác
    // (vd. /nace). Mặc định là Blueprint.
    let productSlug = BLUEPRINT_PRODUCT_SLUG;
    try {
      const body = await req.json();
      if (body?.product_slug && typeof body.product_slug === "string") {
        productSlug = body.product_slug;
      }
    } catch {
      /* không có body — dùng mặc định */
    }

    const admin = await createAdminClient();

    // 1. Sản phẩm
    const { data: product } = await admin
      .from("products")
      .select("id, title, price, sale_price")
      .eq("slug", productSlug)
      .single();
    if (!product) {
      return NextResponse.json(
        { error: "Sản phẩm chưa sẵn sàng, vui lòng quay lại sau." },
        { status: 400 }
      );
    }

    const amount = product.sale_price || product.price || 0;
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Sản phẩm không có giá hợp lệ" },
        { status: 400 }
      );
    }

    // 2. Tái sử dụng đơn pending nếu có (tránh tạo trùng khi bấm nhiều lần)
    const { data: existing } = await admin
      .from("orders")
      .select("order_code, amount, status")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.order_code) {
      return NextResponse.json({
        success: true,
        paymentInfo: buildPaymentInfo(
          existing.order_code as string,
          (existing.amount as number) || amount
        ),
      });
    }

    // 3. Thông tin khách từ profile + auth
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    // 4. Tạo đơn mới
    const orderCode = generateOrderCode();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_code: orderCode,
        user_id: user.id,
        product_id: product.id,
        amount,
        status: "pending",
        payment_method: "bank_transfer",
        customer_name: profile?.full_name || user.email || "",
        customer_email: user.email || null,
        customer_phone: profile?.phone || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("[Blueprint Order] error:", orderError);
      return NextResponse.json(
        { error: "Lỗi tạo đơn hàng. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      paymentInfo: buildPaymentInfo(orderCode, amount),
    });
  } catch (err) {
    console.error("[Blueprint Order Error]", err);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
