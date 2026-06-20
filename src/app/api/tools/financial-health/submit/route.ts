import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmailWithParams } from "@/lib/email/ses";
import { computeFinancialHealth, type FinancialHealthInputs } from "@/lib/financial-health/score";
import { renderFinancialHealthEmailHtml } from "@/lib/financial-health/email-template";
import { logSyntheticPageView } from "@/lib/analytics/log-page-view";
import { siteConfig } from "@/lib/site-config";

/** Random 12-char base36 token, e.g. "k8j2nq3p7m4z" — URL-safe. */
function generateToken(): string {
  return crypto.randomBytes(8).toString("hex").slice(0, 12);
}

/**
 * POST /api/tools/financial-health/submit
 *
 * Body: {
 *   email, full_name, phone?,
 *   inputs: FinancialHealthInputs,
 *   utm_source?, utm_medium?, utm_campaign?,
 *   referrer?
 * }
 *
 * Returns: { token, total_score, rating }
 * Side-effects:
 *   - Insert into financial_assessments
 *   - Upsert subscriber (tag: "financial-health-check")
 *   - Send result email via Resend with link to /results/<token>
 *   - Log synthetic page_view so funnel Visitor count stays consistent
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const rl = await rateLimit(`fh-submit:${ip}`, 10, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút." },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const {
      email,
      full_name,
      phone,
      password,
      inputs,
      utm_source,
      utm_medium,
      utm_campaign,
      referrer,
    } = body ?? {};

    // Derive user_id from the server-side auth session — NEVER trust a
    // client-supplied user_id (would be trivial to spoof). If the user is
    // signed in their assessment is automatically linked to their account.
    let serverUserId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) serverUserId = user.id;
    } catch {
      // anon — leave null
    }

    // If anon → password is required so we can create an account
    // (the new flow: quiz result is gated behind account creation so the
    // student can also access courses + receive automated emails).
    if (!serverUserId) {
      if (!password || typeof password !== "string" || password.length < 8) {
        return NextResponse.json(
          { error: "Mật khẩu phải có ít nhất 8 ký tự" },
          { status: 400 }
        );
      }
    }

    // ─── Validate ────────────────────────────────────────────
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên" }, { status: 400 });
    }
    // Phone is required (≥ 9 digits, ≤ 12 — covers VN mobile + landline).
    const phoneStr = phone ? String(phone) : "";
    const phoneDigits = phoneStr.replace(/\D/g, "");
    if (!phoneStr || phoneDigits.length < 9 || phoneDigits.length > 12) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ (9-12 chữ số)" },
        { status: 400 }
      );
    }
    if (!inputs || typeof inputs !== "object") {
      return NextResponse.json({ error: "Thiếu dữ liệu inputs" }, { status: 400 });
    }
    // 21 fields total — 5 personal (age), 4 cashflow, 4 assets, 5 debts, 3 insurance.
    const numericKeys = [
      // 1. Cá nhân
      "age_husband",
      "age_wife",
      "age_child1",
      "age_child2",
      "age_child3",
      // 2. Dòng tiền
      "monthly_income",
      "monthly_expenses",
      "monthly_passive_income",
      "monthly_debt_payment",
      // 3. Tài sản
      "assets_liquid",
      "assets_growth",
      "assets_cashflow",
      "assets_consumption",
      // 4. Nợ
      "debt_credit_card",
      "debt_installment",
      "debt_car",
      "debt_house",
      "debt_business",
      // 5. Bảo hiểm
      "insurance_health",
      "insurance_life_husband",
      "insurance_life_wife",
    ] as const;
    const safeInputs: Record<string, number> = {};
    for (const k of numericKeys) {
      const v = (inputs as Record<string, unknown>)[k];
      const n = typeof v === "number" ? v : parseFloat(String(v ?? 0));
      safeInputs[k] = Number.isFinite(n) && n >= 0 && n < 1e15 ? n : 0;
    }
    // Required: at least husband or wife age + monthly income/expenses.
    if (!safeInputs.age_husband && !safeInputs.age_wife) {
      return NextResponse.json(
        { error: "Vui lòng nhập tuổi của ít nhất 1 người" },
        { status: 400 }
      );
    }
    if (!safeInputs.monthly_income || !safeInputs.monthly_expenses) {
      return NextResponse.json(
        { error: "Vui lòng nhập thu nhập + chi tiêu / tháng" },
        { status: 400 }
      );
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = String(full_name).trim().slice(0, 200);
    const cleanPhone = phone ? String(phone).trim().slice(0, 20) : null;

    // ─── Score it ────────────────────────────────────────────
    const result = computeFinancialHealth(safeInputs as unknown as FinancialHealthInputs);

    // ─── Persist ─────────────────────────────────────────────
    const admin = await createAdminClient();

    // ─── Account: create-if-anon, or verify-if-existing-email ──
    let accountCreated = false;
    if (!serverUserId && password) {
      const { data: signUpData, error: signUpError } =
        await admin.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: cleanName, phone: cleanPhone },
        });

      // Supabase admin.createUser returns success with empty identities
      // when the email already has a confirmed account → treat as existing.
      const emailAlreadyExists =
        signUpError?.message?.includes("already registered") ||
        signUpError?.message?.includes("already been registered") ||
        signUpError?.message?.includes("User already registered") ||
        (!signUpError &&
          (!signUpData?.user?.identities ||
            signUpData.user.identities.length === 0));

      if (emailAlreadyExists) {
        // Existing user — verify the password they typed matches the account
        // so we don't let anyone link their quiz to an arbitrary account.
        const { createClient: createAnonSupabase } = await import(
          "@supabase/supabase-js"
        );
        const authClient = createAnonSupabase(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );
        const { data: signInData, error: signInError } =
          await authClient.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
        if (signInError || !signInData.user) {
          return NextResponse.json(
            {
              error:
                "Email này đã có tài khoản. Mật khẩu không đúng — vui lòng đăng nhập trước rồi quay lại làm bài test.",
            },
            { status: 401 }
          );
        }
        serverUserId = signInData.user.id;
      } else if (signUpError) {
        console.error("[fh-submit] sign-up error:", signUpError);
        return NextResponse.json(
          { error: "Không thể tạo tài khoản. Vui lòng thử lại." },
          { status: 400 }
        );
      } else if (signUpData.user?.id) {
        serverUserId = signUpData.user.id;
        accountCreated = true;
        // Upsert profile with full_name + phone for the new account.
        await admin.from("profiles").upsert({
          id: signUpData.user.id,
          full_name: cleanName,
          phone: cleanPhone,
        });
      }
    }
    // Try a few times in the (very unlikely) case of token collision.
    let token = generateToken();
    let assessmentId: string | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data, error } = await admin
        .from("financial_assessments")
        .insert({
          token,
          assessment_type: "financial_health",
          email: cleanEmail,
          full_name: cleanName,
          phone: cleanPhone,
          user_id: serverUserId,
          inputs: safeInputs,
          scores: {
            metrics: result.metrics,
            groups: result.groups,
            summary: result.summary,
          },
          total_score: result.total_score,
          rating: result.rating,
          utm_source: utm_source ?? null,
          utm_medium: utm_medium ?? null,
          utm_campaign: utm_campaign ?? null,
          referrer: referrer ?? null,
        })
        .select("id, token")
        .single();
      if (!error && data) {
        assessmentId = data.id;
        token = data.token;
        break;
      }
      if (error && /duplicate key/i.test(error.message ?? "")) {
        token = generateToken();
        continue;
      }
      console.error("[fh-submit] insert failed:", error);
      return NextResponse.json(
        { error: "Không thể lưu kết quả. Vui lòng thử lại." },
        { status: 500 }
      );
    }
    if (!assessmentId) {
      return NextResponse.json({ error: "Token collision" }, { status: 500 });
    }

    // ─── Upsert subscriber + tag ─────────────────────────────
    try {
      const { data: existing } = await admin
        .from("subscribers")
        .select("id, tags")
        .eq("email", cleanEmail)
        .maybeSingle();
      const tagsToAdd = ["financial-health-check", "registered_user"];
      if (existing) {
        const cur: string[] = existing.tags ?? [];
        const merged = [...cur, ...tagsToAdd.filter((t) => !cur.includes(t))];
        if (merged.length !== cur.length) {
          await admin
            .from("subscribers")
            .update({ tags: merged, full_name: cleanName, phone: cleanPhone || undefined })
            .eq("id", existing.id);
        }
        // Link assessment row to subscriber.
        await admin
          .from("financial_assessments")
          .update({ subscriber_id: existing.id })
          .eq("id", assessmentId);
      } else {
        const { data: created } = await admin
          .from("subscribers")
          .insert({
            email: cleanEmail,
            full_name: cleanName,
            phone: cleanPhone,
            status: "active",
            source: "tool:financial-health",
            tags: tagsToAdd,
          })
          .select("id")
          .single();
        if (created) {
          await admin
            .from("financial_assessments")
            .update({ subscriber_id: created.id })
            .eq("id", assessmentId);
        }
      }
    } catch (subErr) {
      console.warn("[fh-submit] subscriber upsert (non-fatal):", subErr);
    }

    // ─── Synthetic page_view for funnel invariant ───────────
    await logSyntheticPageView(admin, {
      email: cleanEmail,
      path: "/tools/suc-khoe-tai-chinh",
      realIp: ip,
      utm: { source: utm_source, medium: utm_medium, campaign: utm_campaign },
      source: "tool_submit",
    });

    // ─── Send email ──────────────────────────────────────────
    const html = renderFinancialHealthEmailHtml(result, {
      name: cleanName,
      token,
    });
    try {
      await sendEmailWithParams({
        to: cleanEmail,
        subject: `📊 Kết quả Kiểm Tra Sức Khoẻ Tài Chính — ${result.total_score}/100`,
        html,
        fromName: siteConfig.name,
        tags: { type: "financial_health_result", token },
      });
    } catch (emailErr) {
      console.warn("[fh-submit] email send failed (non-fatal):", emailErr);
      // Result still saved; client gets the token to view online.
    }

    return NextResponse.json({
      token,
      total_score: result.total_score,
      rating: result.rating,
      account_created: accountCreated,
      account_email: accountCreated ? cleanEmail : null,
    });
  } catch (err) {
    console.error("[fh-submit] unexpected:", err);
    return NextResponse.json({ error: "Lỗi máy chủ. Vui lòng thử lại." }, { status: 500 });
  }
}
