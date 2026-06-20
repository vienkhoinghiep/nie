import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const templates = [
  {
    id: "welcome-series",
    name: "Chuỗi chào mừng",
    description: "Gửi 3 email trong 7 ngày đầu sau khi đăng ký",
    trigger_type: "subscribed_to_list",
    flow_definition: {
      nodes: [
        { id: "trigger-1", type: "trigger", position: { x: 250, y: 0 }, data: { triggerType: "subscribed_to_list", config: {} } },
        { id: "email-1", type: "sendEmail", position: { x: 250, y: 120 }, data: { subject: "Chào mừng bạn! 🎉" } },
        { id: "wait-1", type: "wait", position: { x: 250, y: 240 }, data: { days: 2, hours: 0, minutes: 0 } },
        { id: "email-2", type: "sendEmail", position: { x: 250, y: 360 }, data: { subject: "Bạn đã khám phá hết chưa?" } },
        { id: "wait-2", type: "wait", position: { x: 250, y: 480 }, data: { days: 3, hours: 0, minutes: 0 } },
        { id: "email-3", type: "sendEmail", position: { x: 250, y: 600 }, data: { subject: "Ưu đãi đặc biệt cho bạn" } },
        { id: "end-1", type: "end", position: { x: 250, y: 720 }, data: {} },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "email-1" },
        { id: "e2", source: "email-1", target: "wait-1" },
        { id: "e3", source: "wait-1", target: "email-2" },
        { id: "e4", source: "email-2", target: "wait-2" },
        { id: "e5", source: "wait-2", target: "email-3" },
        { id: "e6", source: "email-3", target: "end-1" },
      ],
    },
  },
  {
    id: "post-purchase",
    name: "Sau mua hàng",
    description: "Follow-up sau khi khách mua khoá học",
    trigger_type: "purchase",
    flow_definition: {
      nodes: [
        { id: "trigger-1", type: "trigger", position: { x: 250, y: 0 }, data: { triggerType: "purchase", config: {} } },
        { id: "email-1", type: "sendEmail", position: { x: 250, y: 120 }, data: { subject: "Cảm ơn bạn đã mua hàng! 🎁" } },
        { id: "tag-1", type: "addTag", position: { x: 250, y: 240 }, data: { tagName: "customer" } },
        { id: "wait-1", type: "wait", position: { x: 250, y: 360 }, data: { days: 3, hours: 0, minutes: 0 } },
        { id: "email-2", type: "sendEmail", position: { x: 250, y: 480 }, data: { subject: "Bạn học đến đâu rồi?" } },
        { id: "wait-2", type: "wait", position: { x: 250, y: 600 }, data: { days: 7, hours: 0, minutes: 0 } },
        { id: "cond-1", type: "condition", position: { x: 250, y: 720 }, data: { conditionType: "opened_email", config: {} } },
        { id: "email-3", type: "sendEmail", position: { x: 100, y: 860 }, data: { subject: "Mời bạn đánh giá khoá học ⭐" } },
        { id: "email-4", type: "sendEmail", position: { x: 400, y: 860 }, data: { subject: "Bạn cần hỗ trợ gì không?" } },
        { id: "end-1", type: "end", position: { x: 250, y: 1000 }, data: {} },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "email-1" },
        { id: "e2", source: "email-1", target: "tag-1" },
        { id: "e3", source: "tag-1", target: "wait-1" },
        { id: "e4", source: "wait-1", target: "email-2" },
        { id: "e5", source: "email-2", target: "wait-2" },
        { id: "e6", source: "wait-2", target: "cond-1" },
        { id: "e7", source: "cond-1", target: "email-3", sourceHandle: "yes" },
        { id: "e8", source: "cond-1", target: "email-4", sourceHandle: "no" },
        { id: "e9", source: "email-3", target: "end-1" },
        { id: "e10", source: "email-4", target: "end-1" },
      ],
    },
  },
  {
    id: "onboarding-7-day-financial-health",
    name: "Onboarding 7 ngày — Hướng dẫn kiểm tra sức khỏe tài chính",
    description:
      "Gửi 7 email trong 7 ngày sau khi người dùng đăng ký tài khoản (trigger qua tag 'registered_user' — register flow đã tự gắn sẵn). Email 1-3, 5, 6 dẫn vào chương trình 'Hướng dẫn kiểm tra sức khỏe tài chính'. Email 4 và 7 điều hướng sang 'Nâng tầm nhận thức về tài chính'.",
    trigger_type: "tag_added",
    flow_definition: {
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          position: { x: 250, y: 0 },
          data: { triggerType: "tag_added", config: { tag: "registered_user" } },
        },

        // ─── Day 1 — Welcome + intro to Sức khỏe tài chính ───
        {
          id: "email-1",
          type: "sendEmail",
          position: { x: 250, y: 120 },
          data: {
            subject: "Ngày 1 — Chào mừng bạn đến với VINEN",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: Chào mừng + giới thiệu chương trình "Hướng dẫn kiểm tra sức khỏe tài chính"
            // CTA: /courses/huong-dan-kiem-tra-suc-khoe-tai-chinh-cho-nha-khoi-nghiep
          },
        },
        { id: "wait-1", type: "wait", position: { x: 250, y: 240 }, data: { days: 1, hours: 0, minutes: 0 } },

        // ─── Day 2 — Sức khỏe tài chính ───
        {
          id: "email-2",
          type: "sendEmail",
          position: { x: 250, y: 360 },
          data: {
            subject: "Ngày 2 — Vì sao founder cần kiểm tra sức khỏe tài chính cá nhân",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: Đào sâu vấn đề + nhắc CTA vào chương trình "Hướng dẫn kiểm tra sức khỏe tài chính"
          },
        },
        { id: "wait-2", type: "wait", position: { x: 250, y: 480 }, data: { days: 1, hours: 0, minutes: 0 } },

        // ─── Day 3 — Sức khỏe tài chính ───
        {
          id: "email-3",
          type: "sendEmail",
          position: { x: 250, y: 600 },
          data: {
            subject: "Ngày 3 — 6 chỉ số đo lường sức khỏe tài chính cá nhân",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: Cung cấp value cụ thể + CTA vào chương trình "Hướng dẫn kiểm tra sức khỏe tài chính"
          },
        },
        { id: "wait-3", type: "wait", position: { x: 250, y: 720 }, data: { days: 1, hours: 0, minutes: 0 } },

        // ─── Day 4 — ĐIỀU HƯỚNG sang "Nâng tầm nhận thức về tài chính" ───
        {
          id: "email-4",
          type: "sendEmail",
          position: { x: 250, y: 840 },
          data: {
            subject: "Ngày 4 — Nâng tầm nhận thức về tài chính: bước tiếp theo cho founder",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: ĐIỀU HƯỚNG sang chương trình "Nâng tầm nhận thức về tài chính"
            // CTA: link chương trình "Nâng tầm nhận thức về tài chính"
          },
        },
        { id: "wait-4", type: "wait", position: { x: 250, y: 960 }, data: { days: 1, hours: 0, minutes: 0 } },

        // ─── Day 5 — Quay lại Sức khỏe tài chính ───
        {
          id: "email-5",
          type: "sendEmail",
          position: { x: 250, y: 1080 },
          data: {
            subject: "Ngày 5 — Câu chuyện founder thoát khỏi khủng hoảng dòng tiền cá nhân",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: Testimonial / case study + nhắc CTA vào "Hướng dẫn kiểm tra sức khỏe tài chính"
          },
        },
        { id: "wait-5", type: "wait", position: { x: 250, y: 1200 }, data: { days: 1, hours: 0, minutes: 0 } },

        // ─── Day 6 — Sức khỏe tài chính (last push) ───
        {
          id: "email-6",
          type: "sendEmail",
          position: { x: 250, y: 1320 },
          data: {
            subject: "Ngày 6 — Bắt đầu kiểm tra sức khỏe tài chính của bạn ngay hôm nay",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: Push mạnh CTA vào "Hướng dẫn kiểm tra sức khỏe tài chính"
          },
        },
        { id: "wait-6", type: "wait", position: { x: 250, y: 1440 }, data: { days: 1, hours: 0, minutes: 0 } },

        // ─── Day 7 — ĐIỀU HƯỚNG sang "Nâng tầm nhận thức về tài chính" ───
        {
          id: "email-7",
          type: "sendEmail",
          position: { x: 250, y: 1560 },
          data: {
            subject: "Ngày 7 — Sẵn sàng nâng tầm tư duy tài chính của bạn?",
            fromName: "VINEN",
            templateId: "",
            htmlContent: "",
            // Mục đích: ĐIỀU HƯỚNG sang chương trình "Nâng tầm nhận thức về tài chính"
            // CTA: link chương trình "Nâng tầm nhận thức về tài chính"
          },
        },

        { id: "end-1", type: "end", position: { x: 250, y: 1680 }, data: {} },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "email-1" },
        { id: "e2", source: "email-1", target: "wait-1" },
        { id: "e3", source: "wait-1", target: "email-2" },
        { id: "e4", source: "email-2", target: "wait-2" },
        { id: "e5", source: "wait-2", target: "email-3" },
        { id: "e6", source: "email-3", target: "wait-3" },
        { id: "e7", source: "wait-3", target: "email-4" },
        { id: "e8", source: "email-4", target: "wait-4" },
        { id: "e9", source: "wait-4", target: "email-5" },
        { id: "e10", source: "email-5", target: "wait-5" },
        { id: "e11", source: "wait-5", target: "email-6" },
        { id: "e12", source: "email-6", target: "wait-6" },
        { id: "e13", source: "wait-6", target: "email-7" },
        { id: "e14", source: "email-7", target: "end-1" },
      ],
    },
  },
  {
    id: "re-engagement",
    name: "Tái kích hoạt",
    description: "Gửi email cho subscriber không hoạt động",
    trigger_type: "tag_added",
    flow_definition: {
      nodes: [
        { id: "trigger-1", type: "trigger", position: { x: 250, y: 0 }, data: { triggerType: "tag_added", config: { tag: "inactive" } } },
        { id: "wait-1", type: "wait", position: { x: 250, y: 120 }, data: { days: 1, hours: 0, minutes: 0 } },
        { id: "email-1", type: "sendEmail", position: { x: 250, y: 240 }, data: { subject: "Chúng tôi nhớ bạn! 💛" } },
        { id: "wait-2", type: "wait", position: { x: 250, y: 360 }, data: { days: 5, hours: 0, minutes: 0 } },
        { id: "cond-1", type: "condition", position: { x: 250, y: 480 }, data: { conditionType: "opened_email", config: {} } },
        { id: "tag-1", type: "removeTag", position: { x: 100, y: 620 }, data: { tagName: "inactive" } },
        { id: "email-2", type: "sendEmail", position: { x: 400, y: 620 }, data: { subject: "Ưu đãi cuối cùng dành cho bạn" } },
        { id: "end-1", type: "end", position: { x: 250, y: 760 }, data: {} },
      ],
      edges: [
        { id: "e1", source: "trigger-1", target: "wait-1" },
        { id: "e2", source: "wait-1", target: "email-1" },
        { id: "e3", source: "email-1", target: "wait-2" },
        { id: "e4", source: "wait-2", target: "cond-1" },
        { id: "e5", source: "cond-1", target: "tag-1", sourceHandle: "yes" },
        { id: "e6", source: "cond-1", target: "email-2", sourceHandle: "no" },
        { id: "e7", source: "tag-1", target: "end-1" },
        { id: "e8", source: "email-2", target: "end-1" },
      ],
    },
  },
];

// GET /api/email/automations/templates — list predefined automation templates
export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: only admin/manager
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "manager"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ templates });
  } catch (err) {
    console.error("GET /api/email/automations/templates error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/email/automations/templates — create automation from a template
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check: only admin/manager
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["admin", "manager"].includes(profile?.role ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { template_id, name } = body;

    if (!template_id) {
      return NextResponse.json(
        { error: "template_id is required" },
        { status: 400 }
      );
    }

    // Find the matching template
    const template = templates.find((t) => t.id === template_id);
    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const admin = await createAdminClient();

    const automationData = {
      name: name?.trim() || template.name,
      description: template.description,
      status: "draft",
      trigger_type: template.trigger_type,
      trigger_config: {},
      flow_definition: template.flow_definition,
      created_by: user.id,
    };

    const { data: newAutomation, error: insertError } = await admin
      .from("email_automations")
      .insert(automationData)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ automation: newAutomation }, { status: 201 });
  } catch (err) {
    console.error("POST /api/email/automations/templates error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
