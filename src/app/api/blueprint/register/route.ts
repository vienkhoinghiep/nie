import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { randomBytes } from "crypto";

/**
 * POST /api/blueprint/register
 * Đăng ký tài khoản + tạo đơn hàng cho landing page /blueprint
 * Body: { full_name, email, phone, password, coupon_code? }
 *
 * QUAN TRỌNG: Admin cần tạo sản phẩm với slug "entrepreneur-financial-blueprint"
 * và giá tương ứng trong trang admin trước khi landing page hoạt động.
 */

const BLUEPRINT_PRODUCT_SLUG = "entrepreneur-financial-blueprint";

function generateOrderCode(prefix: string = "DK", length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const maxValid = 256 - (256 % chars.length); // reject values >= this to avoid modulo bias
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

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per 10 minutes
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimit(`blueprint-reg:${ip}`, 5, 600);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const { full_name, email, phone, password, coupon_code } = body;

    // Validate
    if (!full_name?.trim())
      return NextResponse.json(
        { error: "Vui lòng nhập họ tên" },
        { status: 400 }
      );
    if (!email?.trim())
      return NextResponse.json(
        { error: "Vui lòng nhập email" },
        { status: 400 }
      );
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 8 ký tự" },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    // 1. Try to create user
    let userId: string;
    let isExistingUser = false;

    const { data: signUpData, error: signUpError } =
      await admin.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name?.trim() || "" },
      });

    const emailAlreadyExists =
      signUpError?.message?.includes("already registered") ||
      signUpError?.message?.includes("already been registered") ||
      (!signUpError &&
        (!signUpData?.user?.identities ||
          signUpData.user.identities.length === 0));

    if (emailAlreadyExists) {
      // Existing user — verify password and create order for them
      const { createClient: createSupabase } = await import(
        "@supabase/supabase-js"
      );
      const authClient = createSupabase(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      const { data: signInData, error: signInError } =
        await authClient.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      if (signInError || !signInData.user) {
        return NextResponse.json(
          {
            error:
              "Email đã đăng ký. Sai mật khẩu — vui lòng nhập đúng mật khẩu tài khoản đã có.",
          },
          { status: 401 }
        );
      }
      userId = signInData.user.id;
      isExistingUser = true;
    } else if (signUpError) {
      console.error("[Blueprint Register] Sign-up error:", signUpError);
      return NextResponse.json(
        { error: "Không thể tạo tài khoản. Vui lòng thử lại sau." },
        { status: 400 }
      );
    } else {
      if (!signUpData.user?.id) {
        return NextResponse.json(
          { error: "Không thể tạo tài khoản" },
          { status: 500 }
        );
      }
      userId = signUpData.user.id;
    }

    // 2. Update profile with phone
    await admin.from("profiles").upsert({
      id: userId,
      full_name: full_name?.trim() || "",
      phone: phone?.trim() || null,
    });

    // 3. Find the blueprint product
    const { data: product } = await admin
      .from("products")
      .select("id, title, price, sale_price")
      .eq("slug", BLUEPRINT_PRODUCT_SLUG)
      .single();

    if (!product) {
      return NextResponse.json({
        success: true,
        registered: true,
        noProduct: true,
        message:
          "Tài khoản đã tạo thành công! Sản phẩm đang được cập nhật, vui lòng quay lại sau.",
      });
    }

    const baseAmount = product.sale_price || product.price || 0;
    if (!baseAmount || baseAmount <= 0) {
      return NextResponse.json(
        { error: "Sản phẩm không có giá hợp lệ" },
        { status: 400 }
      );
    }

    // 4. Apply coupon (optional)
    let amount = baseAmount;
    let appliedCouponId: string | null = null;
    let appliedCouponCode: string | null = null;
    let appliedCouponUsedCount: number | null = null;

    if (coupon_code && typeof coupon_code === "string" && coupon_code.trim()) {
      const normalizedCode = coupon_code.trim().toUpperCase();
      const { data: coupon, error: couponError } = await admin
        .from("coupons")
        .select("*")
        .eq("code", normalizedCode)
        .single();

      if (couponError || !coupon) {
        return NextResponse.json(
          { error: "Mã giảm giá không tồn tại" },
          { status: 400 }
        );
      }
      if (!coupon.is_active) {
        return NextResponse.json(
          { error: "Mã giảm giá đã bị vô hiệu hoá" },
          { status: 400 }
        );
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Mã giảm giá đã hết hạn" },
          { status: 400 }
        );
      }
      if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json(
          { error: "Mã giảm giá đã hết lượt sử dụng" },
          { status: 400 }
        );
      }
      if (baseAmount < (coupon.min_order_amount ?? 0)) {
        return NextResponse.json(
          { error: "Đơn hàng không đạt giá trị tối thiểu để dùng mã này" },
          { status: 400 }
        );
      }

      let discountAmount: number;
      if (coupon.discount_type === "percent") {
        discountAmount = Math.round((baseAmount * coupon.discount_value) / 100);
      } else {
        discountAmount = Math.round(Number(coupon.discount_value));
      }
      discountAmount = Math.min(discountAmount, baseAmount);
      amount = Math.max(baseAmount - discountAmount, 0);
      appliedCouponId = coupon.id;
      appliedCouponCode = normalizedCode;
      appliedCouponUsedCount = coupon.used_count ?? 0;
    }

    // 5. Create order
    const orderCode = generateOrderCode();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        order_code: orderCode,
        user_id: userId,
        product_id: product.id,
        amount,
        status: "pending",
        payment_method: "bank_transfer",
        customer_name: full_name.trim(),
        customer_email: email.trim(),
        customer_phone: phone?.trim() || null,
        ...(appliedCouponCode ? { coupon_code: appliedCouponCode } : {}),
      })
      .select()
      .single();

    if (orderError) {
      console.error("[Blueprint Register] Order error:", orderError);
      return NextResponse.json(
        { error: "Lỗi tạo đơn hàng. Vui lòng thử lại sau." },
        { status: 500 }
      );
    }

    // 6. Record coupon usage + bump count
    if (appliedCouponId && appliedCouponUsedCount !== null && order) {
      await Promise.all([
        admin
          .from("coupons")
          .update({ used_count: appliedCouponUsedCount + 1 })
          .eq("id", appliedCouponId),
        admin.from("coupon_usages").insert({
          coupon_id: appliedCouponId,
          user_id: userId,
          order_id: order.id,
        }),
      ]).catch(() => {
        // Non-critical — order is already created
      });
    }

    // 7. Generate payment info
    const bankAccount = process.env.SEPAY_BANK_ACCOUNT;
    const bankCode = process.env.SEPAY_BANK_CODE;
    const hasSepay = bankAccount && bankCode && !bankAccount.includes("your-");

    const paymentInfo = {
      order_code: orderCode,
      amount,
      bank_account: hasSepay ? bankAccount : null,
      bank_code: hasSepay ? bankCode : null,
      transfer_content: orderCode,
      qr_url: hasSepay
        ? `/api/qr?bank=${bankCode}&acc=${bankAccount}&amount=${amount}&des=${orderCode}`
        : null,
    };

    // 8. Award XP (only for new users)
    if (!isExistingUser) {
      try {
        await admin.from("xp_events").insert({
          user_id: userId,
          action: "register",
          xp_amount: 100,
          meta: { source: "blueprint_landing" },
        });
      } catch {
        // Non-critical
      }
    }

    // 9. Send welcome email (only for new users)
    if (!isExistingUser) {
      try {
        const { sendWelcomeEmail } = await import("@/lib/email/transactional");
        await sendWelcomeEmail(email.trim(), full_name.trim()).catch(() => {});
      } catch {
        // Email service not configured
      }
    }

    return NextResponse.json({ success: true, order, paymentInfo });
  } catch (err) {
    console.error("[Blueprint Register Error]", err);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
