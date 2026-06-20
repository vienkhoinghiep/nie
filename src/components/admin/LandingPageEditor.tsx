"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Loader2,
  Trash2,
  Plus,
  X,
  ArrowLeft,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { BonusItem, Testimonial, FormField } from "@/lib/landing-page-types";

interface AutomationOption {
  id: string;
  name: string;
  status: string;
}

interface InitialData {
  id?: string;
  slug?: string;
  title?: string;
  meta_description?: string | null;
  hero_badge?: string | null;
  hero_headline?: string;
  hero_subheadline?: string | null;
  hero_image_url?: string | null;
  benefits?: string[] | null;
  bonus_items?: BonusItem[] | null;
  testimonials?: Testimonial[] | null;
  body_html?: string | null;
  form_fields?: FormField[] | null;
  cta_label?: string | null;
  success_message?: string | null;
  success_redirect_url?: string | null;
  tag_on_submit?: string | null;
  automation_id?: string | null;
  add_to_list_id?: string | null;
  brand_color?: string | null;
  status?: "draft" | "published" | "archived";
}

interface Props {
  mode: "create" | "edit";
  initial?: InitialData;
  automations: AutomationOption[];
}

export default function LandingPageEditor({ mode, initial, automations }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");
  const [heroBadge, setHeroBadge] = useState(initial?.hero_badge ?? "🎁 QUÀ TẶNG MIỄN PHÍ");
  const [heroHeadline, setHeroHeadline] = useState(initial?.hero_headline ?? "");
  const [heroSubheadline, setHeroSubheadline] = useState(initial?.hero_subheadline ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(initial?.hero_image_url ?? "");
  const [benefits, setBenefits] = useState<string[]>(initial?.benefits ?? []);
  const [bonusItems, setBonusItems] = useState<BonusItem[]>(initial?.bonus_items ?? []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initial?.testimonials ?? []);
  const [bodyHtml, setBodyHtml] = useState(initial?.body_html ?? "");
  const [formFields, setFormFields] = useState<FormField[]>(initial?.form_fields ?? ["name", "email", "phone"]);
  const [ctaLabel, setCtaLabel] = useState(initial?.cta_label ?? "NHẬN QUÀ NGAY");
  const [successMessage, setSuccessMessage] = useState(
    initial?.success_message ?? "Cảm ơn bạn! Hãy kiểm tra hộp thư để nhận quà."
  );
  const [successRedirectUrl, setSuccessRedirectUrl] = useState(initial?.success_redirect_url ?? "");
  const [tagOnSubmit, setTagOnSubmit] = useState(initial?.tag_on_submit ?? "");
  const [automationId, setAutomationId] = useState(initial?.automation_id ?? "");
  const [brandColor, setBrandColor] = useState(initial?.brand_color ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(initial?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const autoSlug = (t: string) =>
    t
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);

  // Field arrays helpers ─────────────────────────────────────────
  const updateBenefit = (i: number, v: string) => {
    const arr = [...benefits];
    arr[i] = v;
    setBenefits(arr);
  };
  const updateBonus = (i: number, patch: Partial<BonusItem>) => {
    const arr = [...bonusItems];
    arr[i] = { ...arr[i], ...patch };
    setBonusItems(arr);
  };
  const updateTestimonial = (i: number, patch: Partial<Testimonial>) => {
    const arr = [...testimonials];
    arr[i] = { ...arr[i], ...patch };
    setTestimonials(arr);
  };

  const handleSubmit = async (publishOverride?: boolean) => {
    setError(null);
    setSuccess(null);
    if (!slug.trim()) return setError("Slug bắt buộc");
    if (!title.trim()) return setError("Tiêu đề bắt buộc");
    if (!heroHeadline.trim()) return setError("Hero headline bắt buộc");

    setSaving(true);
    const payload = {
      slug: slug.trim().toLowerCase(),
      title,
      meta_description: metaDescription || null,
      hero_badge: heroBadge || null,
      hero_headline: heroHeadline,
      hero_subheadline: heroSubheadline || null,
      hero_image_url: heroImageUrl || null,
      benefits: benefits.filter((b) => b.trim()),
      bonus_items: bonusItems.filter((b) => b.name?.trim()),
      testimonials: testimonials.filter((t) => t.name?.trim() && t.content?.trim()),
      body_html: bodyHtml || null,
      form_fields: formFields,
      cta_label: ctaLabel,
      success_message: successMessage,
      success_redirect_url: successRedirectUrl || null,
      tag_on_submit: tagOnSubmit || null,
      automation_id: automationId || null,
      brand_color: brandColor || null,
      status: publishOverride ? "published" : status,
    };

    try {
      const url =
        mode === "edit"
          ? `/api/admin/landing-pages?id=${initial?.id}`
          : "/api/admin/landing-pages";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra. Vui lòng thử lại.");
        setSaving(false);
        return;
      }
      if (mode === "create" && data?.landingPage?.id) {
        router.push(`/admin/landing-pages/${data.landingPage.id}/edit`);
        return;
      }
      setSuccess(publishOverride ? "Đã xuất bản!" : "Đã lưu thành công!");
      setSaving(false);
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial?.id) return;
    if (!confirm("Xoá landing page này? Hành động không thể hoàn tác.")) return;
    setSaving(true);
    const res = await fetch(`/api/admin/landing-pages?id=${initial.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/landing-pages");
    else {
      setError("Không xoá được");
      setSaving(false);
    }
  };

  const inputCls = "input-dark text-sm";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/admin/landing-pages"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft size={14} /> Quay lại danh sách
        </Link>
        {mode === "edit" && initial?.slug && (
          <Link
            href={`/lp/${initial.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: "rgba(37,99,235,0.1)",
              color: "#2563EB",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            <Eye size={12} /> Xem trang
          </Link>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm text-amber-400"
          style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)" }}
        >
          <CheckCircle2 size={14} /> {success}
        </div>
      )}

      {/* Basic */}
      <section className="card-dark p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!initial?.id && !slug) setSlug(autoSlug(e.target.value));
              }}
              placeholder="VD: Tặng Khoá Kiểm Tra Sức Khoẻ Tài Chính"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Slug (URL: /lp/…) <span className="text-red-400">*</span>
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="qua-tang-suc-khoe-tai-chinh"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Meta description (SEO)</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              maxLength={160}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="card-dark p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Hero (phần đầu trang)</h3>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Badge nhỏ phía trên</label>
          <input
            value={heroBadge}
            onChange={(e) => setHeroBadge(e.target.value)}
            placeholder="🎁 QUÀ TẶNG MIỄN PHÍ"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">
            Headline <span className="text-red-400">*</span>
          </label>
          <input
            value={heroHeadline}
            onChange={(e) => setHeroHeadline(e.target.value)}
            placeholder="Nhận miễn phí khoá học trị giá 1.500.000đ"
            className={`${inputCls} font-bold text-base`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Sub-headline</label>
          <textarea
            value={heroSubheadline}
            onChange={(e) => setHeroSubheadline(e.target.value)}
            rows={2}
            placeholder="Giải thích ngắn về quà tặng và giá trị nhận được"
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">URL ảnh hero</label>
          <input
            value={heroImageUrl}
            onChange={(e) => setHeroImageUrl(e.target.value)}
            placeholder="https://… (Supabase storage / public URL)"
            className={inputCls}
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="card-dark p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Bullet lợi ích</h3>
          <button
            type="button"
            onClick={() => setBenefits([...benefits, ""])}
            className="text-xs flex items-center gap-1 text-[#2563EB] hover:underline"
          >
            <Plus size={11} /> Thêm
          </button>
        </div>
        {benefits.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={b}
              onChange={(e) => updateBenefit(i, e.target.value)}
              placeholder={`Lợi ích #${i + 1}`}
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={() => setBenefits(benefits.filter((_, j) => j !== i))}
              className="p-2 text-gray-500 hover:text-red-400"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {benefits.length === 0 && (
          <p className="text-xs text-gray-500">Chưa có bullet nào.</p>
        )}
      </section>

      {/* Bonus items */}
      <section className="card-dark p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Bonus / quà tặng kèm theo</h3>
          <button
            type="button"
            onClick={() => setBonusItems([...bonusItems, { name: "", value: "", icon: "🎁" }])}
            className="text-xs flex items-center gap-1 text-[#2563EB] hover:underline"
          >
            <Plus size={11} /> Thêm
          </button>
        </div>
        {bonusItems.map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            <input
              value={item.icon ?? ""}
              onChange={(e) => updateBonus(i, { icon: e.target.value })}
              placeholder="🎁"
              className={`${inputCls} col-span-1 text-center`}
            />
            <input
              value={item.name}
              onChange={(e) => updateBonus(i, { name: e.target.value })}
              placeholder="Tên quà"
              className={`${inputCls} col-span-6`}
            />
            <input
              value={item.value}
              onChange={(e) => updateBonus(i, { value: e.target.value })}
              placeholder="VD: 1.500.000đ"
              className={`${inputCls} col-span-4`}
            />
            <button
              type="button"
              onClick={() => setBonusItems(bonusItems.filter((_, j) => j !== i))}
              className="col-span-1 p-2 text-gray-500 hover:text-red-400 justify-self-end"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {bonusItems.length === 0 && (
          <p className="text-xs text-gray-500">Chưa có bonus nào.</p>
        )}
      </section>

      {/* Testimonials */}
      <section className="card-dark p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Testimonials</h3>
          <button
            type="button"
            onClick={() => setTestimonials([...testimonials, { name: "", role: "", content: "" }])}
            className="text-xs flex items-center gap-1 text-[#2563EB] hover:underline"
          >
            <Plus size={11} /> Thêm
          </button>
        </div>
        {testimonials.map((t, i) => (
          <div key={i} className="rounded-lg p-3 space-y-2" style={{ background: "#141414", border: "1px solid #2a2a2a" }}>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={t.name}
                onChange={(e) => updateTestimonial(i, { name: e.target.value })}
                placeholder="Tên"
                className={inputCls}
              />
              <input
                value={t.role}
                onChange={(e) => updateTestimonial(i, { role: e.target.value })}
                placeholder="Vai trò / công ty"
                className={inputCls}
              />
            </div>
            <textarea
              value={t.content}
              onChange={(e) => updateTestimonial(i, { content: e.target.value })}
              rows={2}
              placeholder="Lời chia sẻ…"
              className={`${inputCls} resize-none`}
            />
            <div className="flex items-center justify-between">
              <input
                value={t.avatar ?? ""}
                onChange={(e) => updateTestimonial(i, { avatar: e.target.value })}
                placeholder="URL avatar (tuỳ chọn)"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}
                className="ml-2 p-2 text-gray-500 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Long-form body */}
      <section className="card-dark p-5 space-y-2">
        <h3 className="font-semibold text-white text-sm">Nội dung dài (HTML)</h3>
        <p className="text-xs text-gray-500">Tùy chọn — paste HTML đầy đủ nếu bạn muốn thêm content dài bên dưới hero.</p>
        <textarea
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
          rows={6}
          className={`${inputCls} font-mono text-xs resize-y`}
          placeholder="<h2>Tiêu đề</h2>…"
        />
      </section>

      {/* Form & post-submit */}
      <section className="card-dark p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Form & xử lý sau khi submit</h3>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Fields thu thập</label>
          <div className="flex flex-wrap gap-2">
            {(["name", "email", "phone"] as FormField[]).map((f) => (
              <label
                key={f}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                style={{ background: "#141414", border: "1px solid #2a2a2a" }}
              >
                <input
                  type="checkbox"
                  checked={formFields.includes(f)}
                  onChange={(e) => {
                    if (e.target.checked) setFormFields([...formFields, f]);
                    else setFormFields(formFields.filter((x) => x !== f));
                  }}
                />
                <span className="text-white capitalize">
                  {f === "name" ? "Tên" : f === "email" ? "Email" : "Số điện thoại"}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Nút CTA</label>
            <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Màu thương hiệu (#hex)</label>
            <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} placeholder="#2563EB" className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Thông báo sau khi submit</label>
          <textarea
            value={successMessage}
            onChange={(e) => setSuccessMessage(e.target.value)}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">URL redirect sau submit (tuỳ chọn)</label>
          <input value={successRedirectUrl} onChange={(e) => setSuccessRedirectUrl(e.target.value)} placeholder="/courses/…" className={inputCls} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Tag thêm vào subscriber</label>
            <input
              value={tagOnSubmit}
              onChange={(e) => setTagOnSubmit(e.target.value)}
              placeholder="VD: lead-suc-khoe-tai-chinh"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Enroll vào Email Automation</label>
            <select
              value={automationId ?? ""}
              onChange={(e) => setAutomationId(e.target.value)}
              className={inputCls}
            >
              <option value="">— Không —</option>
              {automations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} {a.status === "active" ? "✓" : `(${a.status})`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap sticky bottom-0 py-4" style={{ background: "linear-gradient(to top,#111 70%,transparent)" }}>
        <button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: "#1f1f1f", color: "#9ca3af", border: "1px solid #333" }}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {status === "published" ? "Lưu thay đổi" : "Lưu nháp"}
        </button>
        {status !== "published" && (
          <button
            onClick={() => {
              setStatus("published");
              handleSubmit(true);
            }}
            disabled={saving}
            className="btn-green text-sm py-2.5 px-5"
          >
            <CheckCircle2 size={14} /> Xuất bản
          </button>
        )}
        {mode === "edit" && (
          <button
            onClick={handleDelete}
            disabled={saving}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
          >
            <Trash2 size={13} /> Xoá
          </button>
        )}
      </div>
    </div>
  );
}
