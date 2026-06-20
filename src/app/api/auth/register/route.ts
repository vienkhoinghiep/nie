import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { logSyntheticPageView } from "@/lib/analytics/log-page-view";
import { geoFromHeaders } from "@/lib/geo/vn-province";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const rateLimitResult = await rateLimit(`register:${ip}`, 5, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
        { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfterSec) } }
      );
    }

    const { email, password, full_name, phone } = await req.json();

    // Validate
    if (!full_name?.trim()) return NextResponse.json({ error: "Vui lòng nhập họ và tên" }, { status: 400 });
    if (!phone || !/^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s+/g, "")))
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    if (!email?.trim()) return NextResponse.json({ error: "Vui lòng nhập email" }, { status: 400 });

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }

    // Max length validation
    if (full_name.trim().length > 100) return NextResponse.json({ error: "Tên quá dài" }, { status: 400 });
    if (email.trim().length > 254) return NextResponse.json({ error: "Email quá dài" }, { status: 400 });

    // Password policy — chỉ yêu cầu tối thiểu 8 ký tự
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự" }, { status: 400 });
    }
    if (password.length > 72) {
      return NextResponse.json({ error: "Mật khẩu không được quá 72 ký tự" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    const cleanEmail = email.trim().toLowerCase();
    const admin = await createAdminClient();

    // Create user — auto-confirm email (không cần verify; đăng ký xong dùng ngay).
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name.trim() },
    });
    if (createError) {
      console.error("[Register] Create user error:", createError.message);
      return NextResponse.json({ error: "Không thể tạo tài khoản. Vui lòng thử email khác." }, { status: 400 });
    }

    // Save phone (upsert to handle case where trigger hasn't fired yet)
    if (created?.user) {
      await admin.from("profiles").upsert({
        id: created.user.id,
        phone: cleanPhone,
        full_name: full_name.trim(),
      }, { onConflict: "id" });
    }

    // Tặng khóa "Entrepreneur Money Reset" cho mọi tài khoản đăng ký miễn phí —
    // để khách xem & biết cách hoạch định tài chính ngay. Idempotent, non-critical.
    if (created?.user) {
      try {
        const { data: giftCourse } = await admin
          .from("products")
          .select("id")
          .eq("slug", "goi-huong-dan-hoach-dinh-tai-chinh-ca-nhan")
          .maybeSingle();
        if (giftCourse?.id) {
          await admin.from("enrollments").upsert(
            {
              user_id: created.user.id,
              product_id: giftCourse.id,
              source: "gift",
            },
            { onConflict: "user_id,product_id" }
          );
        }
      } catch (giftErr) {
        console.error(
          "[Register] Gift course enrollment failed (non-critical):",
          giftErr
        );
      }
    }

    // VINEN auto-subscribes all signups for transactional + course updates
    // (Vietnam market default). Every email must retain an "Unsubscribe" link.
    if (created?.user) {
      let subscriberId: string | null = null;
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const { data: existingSub } = await admin
          .from("subscribers")
          .select("id, user_id")
          .eq("email", normalizedEmail)
          .single();

        if (existingSub) {
          subscriberId = existingSub.id as string;
          if (!existingSub.user_id) {
            await admin.from("subscribers").update({
              user_id: created.user.id,
              full_name: full_name || undefined,
              phone: cleanPhone || undefined,
              tags: ["registered_user", "newsletter"],
              source: "website_registration",
            }).eq("id", existingSub.id);
          }
        } else {
          const { data: newSub } = await admin.from("subscribers").insert({
            email: normalizedEmail,
            full_name: full_name || null,
            phone: cleanPhone || null,
            status: "active",
            source: "website_registration",
            tags: ["registered_user"],
            user_id: created.user.id,
            subscribed_at: new Date().toISOString(),
          }).select("id").single();

          if (newSub) {
            subscriberId = newSub.id as string;
            const { data: defaultList } = await admin
              .from("email_lists")
              .select("id")
              .ilike("name", "%newsletter%")
              .limit(1)
              .single();
            if (defaultList) {
              await admin.from("subscriber_list_members").insert({
                subscriber_id: newSub.id,
                list_id: defaultList.id,
                added_at: new Date().toISOString(),
              });
            }
          }
        }
      } catch (e) {
        console.error("Subscriber sync error:", e);
      }

      // Đưa mọi tài khoản đăng ký miễn phí vào các automation email kích hoạt
      // bằng tag "registered_user" (vd. chuỗi "5 Ngày Kiểm Tra Sức Khỏe Tài
      // Chính"). Best-effort — không chặn đăng ký nếu lỗi.
      if (subscriberId) {
        try {
          const { onTagAdded } = await import("@/lib/email/automation-triggers");
          await onTagAdded(admin, subscriberId, "registered_user");
        } catch (autoErr) {
          console.error(
            "[Register] Automation enroll failed (non-critical):",
            autoErr
          );
        }
      }

      // Log a synthetic page_view so funnel Visitor count includes this
      // signup (invariant Visitor ≥ Lead). Best-effort, never blocks.
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null;
      await logSyntheticPageView(admin, {
        email: cleanEmail,
        userId: created.user.id,
        path: "/register",
        realIp: ip,
        source: "register",
      });

      // Đồng bộ vào CRM contacts ở stage "lead" (idempotent — chỉ tạo nếu
      // chưa có. Mỗi tài khoản đăng ký = 1 lead trong sales pipeline.)
      try {
        const { data: existingContact } = await admin
          .from("crm_contacts")
          .select("id, user_id, full_name, phone")
          .ilike("email", cleanEmail)
          .limit(1)
          .maybeSingle();

        // Suy ra Tỉnh/Thành từ IP (header geo Vercel) cho báo cáo phân bổ.
        const geo = geoFromHeaders(req.headers);

        if (!existingContact) {
          await admin.from("crm_contacts").insert({
            full_name: full_name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            source: "website",
            status: "new",
            journey_stage: "lead",
            user_id: created.user.id,
            first_seen_at: new Date().toISOString(),
            country: geo.country,
            province: geo.province,
            city: geo.city,
          });
        } else {
          // Contact đã tồn tại → link user_id + backfill thông tin còn thiếu.
          const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
          if (!existingContact.user_id) patch.user_id = created.user.id;
          if (!existingContact.full_name) patch.full_name = full_name.trim();
          if (!existingContact.phone) patch.phone = cleanPhone;
          if (geo.province) patch.province = geo.province;
          if (geo.city) patch.city = geo.city;
          if (geo.country) patch.country = geo.country;
          await admin.from("crm_contacts").update(patch).eq("id", existingContact.id);
        }
      } catch (crmErr) {
        console.error("CRM contact sync error (non-critical):", crmErr);
      }
    }

    // Không gửi email xác thực — tài khoản đã auto-confirm, đăng ký xong dùng ngay.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: "Có lỗi xảy ra. Vui lòng thử lại." }, { status: 500 });
  }
}
