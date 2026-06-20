import TopBar from "@/components/layout/TopBar";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { addActivity, updateContact } from "@/lib/actions/crm";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  FileText,
  Clock,
  DollarSign,
  BookOpen,
  Tag,
  Building2,
  Star,
  Target,
  TrendingUp,
  Globe,
  Link2,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Lightbulb,
  ListTodo,
  Briefcase,
  Edit,
  StickyNote,
  Users as UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CRM_JOURNEY_STAGES, CRM_JOURNEY_STAGE_LABELS } from "@/lib/crm-constants";

/* ---------- Types ---------- */

interface Contact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  tags: string[] | null;
  journey_stage: string | null;
  lead_score: number | null;
  lifetime_value: number | null;
  assigned_to: string | null;
  user_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  first_page: string | null;
  referrer: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string | null;
  assigned_profile: { full_name: string | null } | null;
}

interface Activity {
  id: string;
  type: string;
  content: string;
  is_system: boolean;
  created_at: string;
  created_by: string | null;
  creator_profile: { full_name: string | null } | null;
}

interface Order {
  id: string;
  order_code: string | null;
  amount: number;
  status: string;
  created_at: string;
  products: { title: string } | null;
}

interface Enrollment {
  id: string;
  created_at: string;
  products: { title: string } | null;
}

interface CourseRecommendation {
  id: string;
  reason: string | null;
  score: number | null;
  products: { title: string } | null;
}

interface NextAction {
  id: string;
  title: string;
  priority: string | null;
  due_date: string | null;
  status: string;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  amount: number;
}

/* ---------- Constants ---------- */

const JOURNEY_STAGES = CRM_JOURNEY_STAGES.map((key) => ({
  key,
  label: CRM_JOURNEY_STAGE_LABELS[key],
}));

const activityTypeConfig: Record<string, { label: string; color: string }> = {
  call: { label: "Cuộc gọi", color: "#3b82f6" },
  email: { label: "Email", color: "#8b5cf6" },
  note: { label: "Ghi chú", color: "#6b7280" },
  meeting: { label: "Cuộc họp", color: "#f59e0b" },
  task: { label: "Task", color: "#ec4899" },
  system: { label: "Hệ thống", color: "#4b5563" },
};

const sourceConfig: Record<string, { label: string; color: string; bg: string }> = {
  manual: { label: "Thủ công", color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  import: { label: "Import", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  website: { label: "Website", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  referral: { label: "Giới thiệu", color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  ads: { label: "Quảng cáo", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  social: { label: "MXH", color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
};

const dealStageConfig: Record<string, { label: string; color: string }> = {
  lead: { label: "Lead", color: "#3b82f6" },
  contacted: { label: "Đã liên hệ", color: "#f59e0b" },
  demo: { label: "Demo", color: "#a855f7" },
  proposal: { label: "Báo giá", color: "#ec4899" },
  negotiation: { label: "Đàm phán", color: "#f97316" },
  won: { label: "Thành công", color: "#2563EB" },
  lost: { label: "Thất bại", color: "#ef4444" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Thấp", color: "#6b7280", bg: "rgba(107,114,128,0.15)" },
  medium: { label: "TB", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  high: { label: "Cao", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  urgent: { label: "Gấp", color: "#dc2626", bg: "rgba(220,38,38,0.2)" },
};

/* ---------- Helpers ---------- */

function formatVND(amount: number): string {
  if (!amount) return "0đ";
  return amount.toLocaleString("vi-VN") + "đ";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(dateStr);
}

function getActivityIcon(type: string) {
  switch (type) {
    case "call":
      return Phone;
    case "email":
      return Mail;
    case "meeting":
      return Calendar;
    case "task":
      return ListTodo;
    default:
      return FileText;
  }
}

/* ---------- Page ---------- */

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const adminClient = await createAdminClient();

  // ─── Parallel Data Fetching ────────────────────────────────────────────────
  const [
    contactRes,
    activitiesRes,
    ordersRes,
    recommendationsRes,
    nextActionsRes,
    dealsRes,
  ] = await Promise.all([
    // Contact details
    adminClient
      .from("crm_contacts")
      .select("*, assigned_profile:assigned_to(full_name)")
      .eq("id", id)
      .single(),
    // Activities
    adminClient
      .from("crm_activities")
      .select("*, creator_profile:created_by(full_name)")
      .eq("contact_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
    // Orders — placeholder, we query after contact email is known
    Promise.resolve({ data: null, error: null }),
    // Course recommendations
    adminClient
      .from("crm_course_recommendations")
      .select("*, products:product_id(title)")
      .eq("contact_id", id),
    // Next actions
    adminClient
      .from("crm_next_actions")
      .select("*")
      .eq("contact_id", id)
      .eq("status", "pending")
      .order("due_date", { ascending: true }),
    // Deals
    adminClient
      .from("crm_deals")
      .select("id, title, stage, amount")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!contactRes.data) notFound();
  const contact = contactRes.data as unknown as Contact;
  const activities = (activitiesRes.data ?? []) as unknown as Activity[];
  const recommendations = (recommendationsRes.data ?? []) as unknown as CourseRecommendation[];
  const nextActions = (nextActionsRes.data ?? []) as unknown as NextAction[];
  const deals = (dealsRes.data ?? []) as unknown as Deal[];

  // ─── Fetch orders & enrollments by contact email ───────────────────────────
  let orders: Order[] = [];
  let enrollments: Enrollment[] = [];

  if (contact.email) {
    const [ordersQuery, enrollmentsQuery] = await Promise.all([
      adminClient
        .from("orders")
        .select("id, order_code, amount, status, created_at, products:product_id(title)")
        .eq("customer_email", contact.email)
        .order("created_at", { ascending: false }),
      adminClient
        .from("profiles")
        .select("id")
        .eq("email", contact.email)
        .single(),
    ]);

    orders = (ordersQuery.data ?? []) as unknown as Order[];

    // If there's a matching profile, fetch enrollments
    if (enrollmentsQuery.data) {
      const { data: enrollData } = await adminClient
        .from("enrollments")
        .select("id, created_at, products:product_id(title)")
        .eq("user_id", enrollmentsQuery.data.id)
        .order("created_at", { ascending: false });
      enrollments = (enrollData ?? []) as unknown as Enrollment[];
    }
  }

  // ─── Computed values ───────────────────────────────────────────────────────
  const journeyStage = contact.journey_stage || "visitor";
  const currentStageIndex = JOURNEY_STAGES.findIndex((s) => s.key === journeyStage);
  const leadScore = contact.lead_score ?? 0;
  const lifetimeValue = contact.lifetime_value ?? orders.reduce((sum, o) => o.status === "paid" ? sum + (o.amount || 0) : sum, 0);
  const src = sourceConfig[contact.source || "manual"] || sourceConfig.manual;

  return (
    <div>
      <TopBar title="Chi tiết khách hàng" subtitle={contact.full_name} />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/crm/contacts"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>

        {/* ═══════════ HEADER SECTION ═══════════ */}
        <div className="card-dark p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #2563EB, #b8922e)" }}
            >
              {contact.full_name.charAt(0).toUpperCase()}
            </div>

            {/* Name & Badges */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">
                {contact.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {/* Journey Stage Badge */}
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(37,99,235,0.12)",
                    color: "#2563EB",
                    border: "1px solid rgba(37,99,235,0.3)",
                  }}
                >
                  <Target size={12} />
                  {JOURNEY_STAGES.find((s) => s.key === journeyStage)?.label || journeyStage}
                </span>

                {/* Lead Score Badge */}
                {leadScore > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: leadScore >= 70 ? "rgba(34,197,94,0.12)" : leadScore >= 40 ? "rgba(245,158,11,0.12)" : "rgba(107,114,128,0.12)",
                      color: leadScore >= 70 ? "#22c55e" : leadScore >= 40 ? "#f59e0b" : "#9ca3af",
                      border: `1px solid ${leadScore >= 70 ? "rgba(34,197,94,0.3)" : leadScore >= 40 ? "rgba(245,158,11,0.3)" : "rgba(107,114,128,0.3)"}`,
                    }}
                  >
                    <Star size={12} />
                    Score: {leadScore}
                  </span>
                )}

                {/* Assigned Sales */}
                {contact.assigned_profile?.full_name && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-[#2a2a2a]">
                    <User size={12} />
                    {contact.assigned_profile.full_name}
                  </span>
                )}

                {/* Lifetime Value */}
                {lifetimeValue > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(37,99,235,0.08)",
                      color: "#2563EB",
                    }}
                  >
                    <DollarSign size={12} />
                    LTV: {formatVND(lifetimeValue)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ JOURNEY STAGE STEPPER ═══════════ */}
        <div className="card-dark p-5">
          <div className="flex items-center gap-1 overflow-x-auto">
            {JOURNEY_STAGES.map((stage, idx) => {
              const isActive = idx === currentStageIndex;
              const isPast = idx < currentStageIndex;
              return (
                <div key={stage.key} className="flex items-center flex-1 min-w-0">
                  {/* Step Circle + Label */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                      style={{
                        background: isActive
                          ? "#2563EB"
                          : isPast
                          ? "rgba(37,99,235,0.3)"
                          : "rgba(42,42,42,0.8)",
                        color: isActive ? "#000" : isPast ? "#2563EB" : "#6b7280",
                        border: isActive
                          ? "2px solid #2563EB"
                          : isPast
                          ? "2px solid rgba(37,99,235,0.4)"
                          : "2px solid #2a2a2a",
                      }}
                    >
                      {isPast ? (
                        <CheckCircle size={14} />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className="text-[10px] font-medium text-center truncate w-full"
                      style={{ color: isActive ? "#2563EB" : isPast ? "#2563EB" : "#6b7280" }}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {/* Connector Line */}
                  {idx < JOURNEY_STAGES.length - 1 && (
                    <div
                      className="h-0.5 flex-1 min-w-4 mx-1"
                      style={{
                        background: isPast ? "rgba(37,99,235,0.4)" : "#2a2a2a",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ MAIN CONTENT: LEFT + RIGHT COLUMNS ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── LEFT COLUMN (2/3) ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Activity Form */}
            <div className="card-dark p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={16} className="text-[#2563EB]" />
                <h3 className="font-semibold text-white text-sm">Thêm hoạt động</h3>
              </div>
              <form action={addActivity}>
                <input type="hidden" name="contact_id" value={contact.id} />

                {/* Type pills — radio buttons styled as compact pills.
                    Using peer-checked Tailwind for SSR-only state (no JS). */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(
                    [
                      { value: "note",    icon: StickyNote, label: "Ghi chú",   color: "#6b7280" },
                      { value: "call",    icon: Phone,      label: "Cuộc gọi",  color: "#3b82f6" },
                      { value: "email",   icon: Mail,       label: "Email",     color: "#8b5cf6" },
                      { value: "meeting", icon: UsersIcon,  label: "Cuộc họp",  color: "#f59e0b" },
                      { value: "task",    icon: ListTodo,   label: "Task",      color: "#ec4899" },
                    ] as const
                  ).map((opt, i) => {
                    const Icon = opt.icon;
                    return (
                      <label key={opt.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value={opt.value}
                          defaultChecked={i === 0}
                          className="peer sr-only"
                        />
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors peer-checked:border-[#2563EB] peer-checked:bg-[#2563EB]/15 peer-checked:text-[#2563EB] text-gray-400 hover:text-white"
                          style={{
                            background: "#141414",
                            borderColor: "#2a2a2a",
                          }}
                        >
                          <Icon size={12} style={{ color: opt.color }} />
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* Big notes textarea */}
                <textarea
                  name="content"
                  required
                  rows={4}
                  placeholder="Nhập nội dung ghi chú, kết quả cuộc gọi, nội dung email gửi cho khách, hoặc tóm tắt cuộc họp..."
                  className="input-dark w-full px-3 py-2.5 text-sm leading-relaxed resize-y min-h-[100px]"
                />

                <div className="flex items-center justify-end mt-3">
                  <button
                    type="submit"
                    className="btn-green px-5 py-2 text-sm font-medium rounded-lg whitespace-nowrap"
                  >
                    Thêm hoạt động
                  </button>
                </div>
              </form>
            </div>

            {/* Activity Timeline */}
            <div className="card-dark p-5">
              <div className="flex items-center gap-2 mb-5">
                <Clock size={16} className="text-[#2563EB]" />
                <h3 className="font-semibold text-white text-sm">
                  Lịch sử hoạt động
                </h3>
                <span className="text-xs text-gray-500 ml-auto">
                  {activities.length} hoạt động
                </span>
              </div>

              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Chưa có hoạt động nào. Hãy thêm ghi chú đầu tiên!
                </p>
              ) : (
                <div className="space-y-0">
                  {activities.map((activity, idx) => {
                    const Icon = getActivityIcon(activity.type);
                    const typeConf = activityTypeConfig[activity.type] || activityTypeConfig.note;
                    const isSystem = activity.is_system;

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-4 pb-6"
                      >
                        {/* Timeline line */}
                        {idx < activities.length - 1 && (
                          <div
                            className="absolute left-[15px] top-9 bottom-0 w-px"
                            style={{ background: "#2a2a2a" }}
                          />
                        )}
                        {/* Icon */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: isSystem ? "rgba(75,85,99,0.2)" : `${typeConf.color}18`,
                            border: `1px solid ${isSystem ? "#374151" : typeConf.color}40`,
                          }}
                        >
                          <Icon
                            size={14}
                            style={{ color: isSystem ? "#6b7280" : typeConf.color }}
                          />
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-xs font-semibold px-2 py-0.5 rounded"
                              style={{
                                background: isSystem ? "rgba(75,85,99,0.15)" : `${typeConf.color}15`,
                                color: isSystem ? "#9ca3af" : typeConf.color,
                              }}
                            >
                              {typeConf.label}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {timeAgo(activity.created_at)}
                            </span>
                          </div>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: isSystem ? "#6b7280" : "#d1d5db" }}
                          >
                            {activity.content}
                          </p>
                          {activity.creator_profile?.full_name && !isSystem && (
                            <p className="text-[11px] text-gray-500 mt-1">
                              bởi {activity.creator_profile.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ─── RIGHT COLUMN (1/3) ─── */}
          <div className="space-y-5">
            {/* Quick Info Card */}
            <div className="card-dark p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-[#2563EB]" />
                <h3 className="font-semibold text-white text-sm">Thông tin</h3>
              </div>
              <div className="space-y-3">
                {/* Email */}
                {contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-300 truncate">{contact.email}</span>
                  </div>
                )}
                {/* Phone */}
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-300">{contact.phone}</span>
                  </div>
                )}
                {/* Company */}
                {contact.company && (
                  <div className="flex items-center gap-3">
                    <Building2 size={14} className="text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-300">{contact.company}</span>
                  </div>
                )}
                {/* Source */}
                <div className="flex items-center gap-3">
                  <Tag size={14} className="text-gray-500 shrink-0" />
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ background: src.bg, color: src.color }}
                  >
                    {src.label}
                  </span>
                </div>
                {/* UTM Attribution */}
                {(contact.utm_source || contact.utm_medium || contact.utm_campaign) && (
                  <div className="pt-2 border-t border-[#2a2a2a]">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-2">UTM Attribution</p>
                    <div className="space-y-1.5">
                      {contact.utm_source && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Source:</span>
                          <span className="text-gray-300">{contact.utm_source}</span>
                        </div>
                      )}
                      {contact.utm_medium && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Medium:</span>
                          <span className="text-gray-300">{contact.utm_medium}</span>
                        </div>
                      )}
                      {contact.utm_campaign && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Campaign:</span>
                          <span className="text-gray-300">{contact.utm_campaign}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* First Page / Referrer */}
                {(contact.first_page || contact.referrer) && (
                  <div className="pt-2 border-t border-[#2a2a2a]">
                    {contact.first_page && (
                      <div className="flex items-start gap-2 text-xs mb-1.5">
                        <Globe size={12} className="text-gray-500 shrink-0 mt-0.5" />
                        <span className="text-gray-400 truncate">{contact.first_page}</span>
                      </div>
                    )}
                    {contact.referrer && (
                      <div className="flex items-start gap-2 text-xs">
                        <Link2 size={12} className="text-gray-500 shrink-0 mt-0.5" />
                        <span className="text-gray-400 truncate">{contact.referrer}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Dates */}
                <div className="pt-2 border-t border-[#2a2a2a] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Tạo lúc:</span>
                    <span className="text-gray-400">{formatDateTime(contact.created_at)}</span>
                  </div>
                  {contact.last_contacted_at && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Liên hệ cuối:</span>
                      <span className="text-gray-400">{formatDateTime(contact.last_contacted_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit contact info (collapsible) */}
            <details className="card-dark p-0">
              <summary className="p-5 cursor-pointer flex items-center gap-2 text-sm font-semibold text-white hover:bg-white/[0.02] transition-colors">
                <Edit size={14} className="text-[#2563EB]" />
                Sửa thông tin khách hàng
              </summary>
              <form action={updateContact} className="px-5 pb-5 space-y-3">
                <input type="hidden" name="contact_id" value={contact.id} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Họ tên *</label>
                    <input name="full_name" required defaultValue={contact.full_name} className="input-dark w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Email</label>
                    <input type="email" name="email" defaultValue={contact.email ?? ""} className="input-dark w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Điện thoại</label>
                    <input type="tel" name="phone" defaultValue={contact.phone ?? ""} className="input-dark w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Ngày sinh</label>
                    <input type="date" name="date_of_birth" defaultValue={(contact as { date_of_birth?: string }).date_of_birth ?? ""} className="input-dark w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Công ty</label>
                    <input name="company" defaultValue={contact.company ?? ""} className="input-dark w-full px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Quốc gia</label>
                    <select name="country" defaultValue={(contact as { country?: string }).country ?? "Vietnam"} className="input-dark w-full px-3 py-2 text-sm">
                      <option value="Vietnam">Việt Nam</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Tỉnh / TP</label>
                    <input name="province" defaultValue={(contact as { province?: string }).province ?? ""} className="input-dark w-full px-3 py-2 text-sm" placeholder="Hà Nội, TP.HCM..." />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 mb-1 block">Quận / Huyện</label>
                    <input name="city" defaultValue={(contact as { city?: string }).city ?? ""} className="input-dark w-full px-3 py-2 text-sm" placeholder="Quận 1, Cầu Giấy..." />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">Địa chỉ chi tiết</label>
                  <input name="address" defaultValue={(contact as { address?: string }).address ?? ""} className="input-dark w-full px-3 py-2 text-sm" placeholder="Số nhà, tên đường..." />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">Ghi chú</label>
                  <textarea name="notes" rows={2} defaultValue={contact.notes ?? ""} className="input-dark w-full px-3 py-2 text-sm resize-none" />
                </div>
                <input type="hidden" name="status" defaultValue={contact.status ?? "new"} />
                <input type="hidden" name="source" defaultValue={contact.source ?? ""} />
                <input type="hidden" name="tags" defaultValue={(contact.tags ?? []).join(", ")} />
                <div className="flex justify-end">
                  <button type="submit" className="btn-green px-4 py-1.5 text-xs font-medium rounded-lg">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </details>

            {/* Orders Card */}
            <div className="card-dark p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart size={16} className="text-[#2563EB]" />
                <h3 className="font-semibold text-white text-sm">Đơn hàng</h3>
                <span className="text-xs text-gray-500 ml-auto">{orders.length}</span>
              </div>
              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Chưa có đơn hàng</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #2a2a2a" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {order.products?.title || order.order_code || "Đơn hàng"}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-amber-400">
                            {formatVND(order.amount)}
                          </p>
                          <span
                            className="inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              background: order.status === "paid" ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
                              color: order.status === "paid" ? "#22c55e" : "#f59e0b",
                            }}
                          >
                            {order.status === "paid" ? "Đã TT" : "Chờ TT"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enrolled Courses Card */}
            <div className="card-dark p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} className="text-[#2563EB]" />
                <h3 className="font-semibold text-white text-sm">Khoá học đã đăng ký</h3>
                <span className="text-xs text-gray-500 ml-auto">{enrollments.length}</span>
              </div>
              {enrollments.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Chưa đăng ký khoá học nào</p>
              ) : (
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #2a2a2a" }}
                    >
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                        style={{ background: "rgba(59,130,246,0.12)" }}
                      >
                        <BookOpen size={13} className="text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 truncate">
                          {enrollment.products?.title || "Khoá học"}
                        </p>
                        <p className="text-[10px] text-gray-500">{formatDate(enrollment.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Courses Card */}
            {recommendations.length > 0 && (
              <div className="card-dark p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={16} className="text-[#2563EB]" />
                  <h3 className="font-semibold text-white text-sm">Gợi ý khoá học</h3>
                </div>
                <div className="space-y-2.5">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-lg"
                      style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.15)" }}
                    >
                      <p className="text-sm text-white font-medium truncate">
                        {rec.products?.title || "Khoá học"}
                      </p>
                      {rec.reason && (
                        <p className="text-[11px] text-gray-500 mt-1">{rec.reason}</p>
                      )}
                      {rec.score != null && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <TrendingUp size={10} className="text-[#2563EB]" />
                          <span className="text-[10px] text-[#2563EB] font-semibold">
                            Score: {rec.score}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Actions Card */}
            {nextActions.length > 0 && (
              <div className="card-dark p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ListTodo size={16} className="text-[#2563EB]" />
                  <h3 className="font-semibold text-white text-sm">Việc cần làm</h3>
                  <span className="text-xs text-gray-500 ml-auto">{nextActions.length}</span>
                </div>
                <div className="space-y-2.5">
                  {nextActions.map((action) => {
                    const prio = priorityConfig[action.priority || "medium"] || priorityConfig.medium;
                    return (
                      <div
                        key={action.id}
                        className="p-3 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #2a2a2a" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-gray-200">{action.title}</p>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: prio.bg, color: prio.color }}
                          >
                            {prio.label}
                          </span>
                        </div>
                        {action.due_date && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Calendar size={10} className="text-gray-500" />
                            <span className="text-[11px] text-gray-500">
                              {formatDate(action.due_date)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deals Card */}
            {deals.length > 0 && (
              <div className="card-dark p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={16} className="text-[#2563EB]" />
                  <h3 className="font-semibold text-white text-sm">Deals</h3>
                  <span className="text-xs text-gray-500 ml-auto">{deals.length}</span>
                </div>
                <div className="space-y-2.5">
                  {deals.map((deal) => {
                    const stageConf = dealStageConfig[deal.stage] || dealStageConfig.lead;
                    return (
                      <div
                        key={deal.id}
                        className="p-3 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #2a2a2a" }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">
                              {deal.title}
                            </p>
                            <span
                              className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ background: `${stageConf.color}18`, color: stageConf.color }}
                            >
                              {stageConf.label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-amber-400 shrink-0">
                            {formatVND(deal.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
