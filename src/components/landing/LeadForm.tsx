"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, User, Mail, Phone, AlertCircle } from "lucide-react";
import type { FormField } from "@/lib/landing-page-types";

interface LeadFormProps {
  landingPageSlug: string;
  fields: FormField[];
  ctaLabel: string;
  successMessage: string;
  successRedirectUrl?: string | null;
  brandColor: string;
}

// (Used to redirect to /register?…&redirect=<course>. New flow goes
// through /thank-you which embeds the quiz before account creation.)

export default function LeadForm({
  landingPageSlug,
  fields,
  ctaLabel,
  successMessage,
  successRedirectUrl,
  brandColor,
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fields.includes("name") && !name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (fields.includes("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError("Email không hợp lệ");
        return;
      }
    }
    if (fields.includes("phone")) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 9 || digits.length > 12) {
        setError("Số điện thoại không hợp lệ");
        return;
      }
    }

    setLoading(true);
    try {
      // Read UTM params from URL once
      const params = new URLSearchParams(window.location.search);

      const res = await fetch("/api/landing-pages/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: landingPageSlug,
          name: name.trim() || null,
          email: email.trim(),
          phone: phone.trim() || null,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      // After ~2.5s, send user to the financial-health quiz directly.
      // The quiz collects contact info via popup at the end (email + name
      // already pre-filled from query string). If the landing page admin
      // set a custom successRedirectUrl it overrides default flow.
      setTimeout(() => {
        if (successRedirectUrl) {
          window.location.href = successRedirectUrl;
          return;
        }
        const params = new URLSearchParams({
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
        });
        window.location.href = `/tools/suc-khoe-tai-chinh?${params.toString()}`;
      }, 2500);
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="rounded-2xl p-7 text-center"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}
      >
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.18)" }}
        >
          <CheckCircle2 size={30} className="text-green-400" />
        </div>
        <h3 className="text-xl font-extrabold text-white mb-2">Đăng ký thành công!</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">{successMessage}</p>
        <div className="inline-flex items-center gap-2 text-xs" style={{ color: brandColor }}>
          <Loader2 size={13} className="animate-spin" />
          {successRedirectUrl
            ? "Đang chuyển hướng…"
            : "Đang chuyển đến trang tạo tài khoản để vào khoá học…"}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 sm:p-7 space-y-4"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${brandColor}55`,
        boxShadow: `0 10px 40px ${brandColor}22`,
      }}
    >
      {fields.includes("name") && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Họ và tên</label>
          <div className="relative">
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              className="w-full pl-9 pr-3 py-3 rounded-lg text-sm text-white outline-none transition-colors"
              style={{ background: "#141414", border: "1px solid #2a2a2a" }}
              required
            />
          </div>
        </div>
      )}
      {fields.includes("email") && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              className="w-full pl-9 pr-3 py-3 rounded-lg text-sm text-white outline-none"
              style={{ background: "#141414", border: "1px solid #2a2a2a" }}
              required
            />
          </div>
        </div>
      )}
      {fields.includes("phone") && (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Số điện thoại</label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              autoComplete="tel"
              className="w-full pl-9 pr-3 py-3 rounded-lg text-sm text-white outline-none"
              style={{ background: "#141414", border: "1px solid #2a2a2a" }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertCircle size={13} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-extrabold text-black uppercase tracking-wider transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, #3B82F6)`,
          boxShadow: `0 6px 20px ${brandColor}55`,
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Đang xử lý..." : ctaLabel}
      </button>

      <p className="text-[10px] text-gray-500 text-center leading-relaxed">
        Thông tin của bạn được bảo mật. Chúng tôi sẽ không spam.
      </p>
    </form>
  );
}
