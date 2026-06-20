import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// GET /api/blog?id=xxx — fetch single blog post for editing
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "manager", "marketing"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data: post, error } = await admin
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err) {
    console.error("[GET /api/blog]", err);
    return NextResponse.json({ error: "Không thể thực hiện. Vui lòng thử lại." }, { status: 500 });
  }
}

// POST /api/blog — create or update blog post
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "manager", "marketing"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      id,
      title,
      slug,
      excerpt,
      content,
      body,
      category,
      tags,
      status,
      thumbnail,
      sendEmail,
      focus_keyword,
      author_name,
      author_avatar,
    } = await req.json();

    if (!title?.trim())
      return NextResponse.json({ error: "Title required" }, { status: 400 });

    const admin = await createAdminClient();

    // Generate slug if not provided
    const finalSlug =
      slug?.trim() ||
      title
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 80);

    // Core columns guaranteed to exist (per schema.sql).
    const postData: Record<string, unknown> = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt?.trim() || null,
      content: content?.trim() || body?.trim() || null,
      category: category?.trim() || null,
      tags: tags || null,
      status: status || "draft",
      thumbnail: thumbnail || null,
    };

    // Optional extended columns — only present after migration
    // 20260525_blog_posts_add_columns.sql has been applied. If a column
    // doesn't exist Supabase returns PGRST204 ("Could not find ... column
    // in the schema cache"); we strip that column and retry once.
    const extendedColumns: Record<string, unknown> = {
      body: body?.trim() || content?.trim() || null,
      focus_keyword: focus_keyword?.trim() || null,
      author_name: author_name?.trim() || null,
      author_avatar: author_avatar?.trim() || null,
    };
    for (const [k, v] of Object.entries(extendedColumns)) {
      if (v !== null) postData[k] = v;
    }

    // Only set published_at when first publishing
    if (status === "published") {
      if (id) {
        // Check if already published — don't overwrite published_at
        const { data: existing } = await admin
          .from("blog_posts")
          .select("published_at")
          .eq("id", id)
          .single();
        if (!existing?.published_at) {
          postData.published_at = new Date().toISOString();
        }
      } else {
        postData.published_at = new Date().toISOString();
      }
    }

    // Drop a key from payload when Supabase reports "column not found"
    // (PGRST204). Returns the stripped key, or null if it can't recover.
    type PgrstError = { code?: string; message?: string };
    function stripUnknownColumn(
      payload: Record<string, unknown>,
      err: PgrstError | null
    ): string | null {
      if (!err) return null;
      const msg = err.message ?? "";
      // Match "Could not find the 'col' column of 'blog_posts' in the schema cache"
      const m = msg.match(/Could not find the '([^']+)' column/i);
      if (m && m[1] && m[1] in payload) {
        delete payload[m[1]];
        return m[1];
      }
      return null;
    }

    async function insertOrUpdate(payload: Record<string, unknown>) {
      // Retry up to N extended columns; stripping one bad column per pass.
      const MAX_RETRIES = 6;
      for (let i = 0; i < MAX_RETRIES; i++) {
        let res;
        if (id) {
          res = await admin
            .from("blog_posts")
            .update(payload)
            .eq("id", id)
            .select()
            .single();
        } else {
          res = await admin
            .from("blog_posts")
            .insert(payload)
            .select()
            .single();
        }
        if (!res.error) return res;
        const stripped = stripUnknownColumn(payload, res.error);
        if (!stripped) return res;
        console.warn(
          `[Blog] column '${stripped}' not in schema — retrying without it. ` +
            `Apply migration 20260525_blog_posts_add_columns.sql to enable.`
        );
      }
      // Final attempt with whatever payload remains
      if (id) {
        return await admin
          .from("blog_posts")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
      }
      return await admin
        .from("blog_posts")
        .insert(payload)
        .select()
        .single();
    }

    const { data, error } = await insertOrUpdate(postData);
    if (error) {
      console.error(id ? "[Blog Update] Error:" : "[Blog Create] Error:", error);
      return NextResponse.json(
        {
          error: id
            ? "Có lỗi xảy ra khi cập nhật bài viết. Vui lòng thử lại."
            : "Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại.",
        },
        { status: 500 }
      );
    }
    const result = data;

    // Only send email if explicitly requested
    if (status === "published" && sendEmail === true) {
      try {
        await sendBlogNotificationEmail(admin, result);
      } catch {
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ post: result });
  } catch (err) {
    console.error("[POST /api/blog]", err);
    return NextResponse.json({ error: "Không thể thực hiện. Vui lòng thử lại." }, { status: 500 });
  }
}

// DELETE /api/blog?id=xxx — delete blog post
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "manager"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { error } = await admin.from("blog_posts").delete().eq("id", id);

    if (error) {
      console.error("[Blog Delete] Error:", error);
      return NextResponse.json({ error: "Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/blog]", err);
    return NextResponse.json({ error: "Không thể thực hiện. Vui lòng thử lại." }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendBlogNotificationEmail(admin: any, post: any) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "no-reply@taitue.academy";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://taitue.academy";
  const siteDomain = (() => { try { return new URL(baseUrl).hostname; } catch { return "taitue.academy"; } })();

  if (!apiKey || apiKey.startsWith("re_your")) return;

  // Get all user emails
  const { data: authUsers } = await admin.auth.admin.listUsers({ perPage: 500 });
  if (!authUsers?.users) return;

  const emails = authUsers.users
    .map((u: { email?: string }) => u.email)
    .filter((e: string | undefined): e is string => !!e);

  if (emails.length === 0) return;

  // Send via Resend batch (max 50 per batch)
  const batches = [];
  for (let i = 0; i < emails.length; i += 50) {
    batches.push(emails.slice(i, i + 50));
  }

  for (const batch of batches) {
    await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        batch.map((email: string) => {
          const safeTitle = escapeHtml(post.title);
          const safeExcerpt = post.excerpt ? escapeHtml(post.excerpt) : "";
          return {
          from: fromEmail,
          to: email,
          subject: `Bài viết mới: ${post.title}`,
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563EB;">${safeTitle}</h2>
              ${safeExcerpt ? `<p style="color: #666;">${safeExcerpt}</p>` : ""}
              <a href="${baseUrl}/blog/${post.slug}"
                 style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Đọc bài viết
              </a>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #999;">
                Bạn nhận email này vì đã đăng ký tài khoản tại ${siteDomain}
              </p>
            </div>
          `,
        };})
      ),
    });
  }
}
