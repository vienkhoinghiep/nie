"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  Wallet,
  PiggyBank,
  CreditCard,
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  ChevronRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  computeFinancialHealth,
  formatVND,
  type FinancialHealthInputs,
} from "@/lib/financial-health/score";

const BRAND = "#2563EB";

interface Props {
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
}

interface Field {
  key: keyof FinancialHealthInputs;
  label: string;
  hint?: string;
  unit: "vnd_month" | "vnd" | "age";
  optional?: boolean;
  placeholder?: string;
}

interface Step {
  group: string;
  icon: typeof Users;
  color: string;
  title: string;
  subtitle: string;
  fields: Field[];
}

const STEPS: Step[] = [
  {
    group: "Cá nhân",
    icon: Users,
    color: "#3b82f6",
    title: "Anh/chị cho em xin thông tin gia đình",
    subtitle:
      "Tuổi giúp em đánh giá đúng cấu trúc tài sản phù hợp với từng giai đoạn cuộc đời.",
    fields: [
      { key: "age_husband", label: "Tuổi chồng", unit: "age" },
      { key: "age_wife", label: "Tuổi vợ", unit: "age", optional: true },
      { key: "age_child1", label: "Tuổi con đầu", unit: "age", optional: true },
      { key: "age_child2", label: "Tuổi con thứ hai", unit: "age", optional: true },
      { key: "age_child3", label: "Tuổi con thứ ba", unit: "age", optional: true },
    ],
  },
  {
    group: "Dòng tiền",
    icon: Wallet,
    color: "#22c55e",
    title: "Dòng tiền hàng tháng của gia đình",
    subtitle:
      "Anh/chị nhập số trung bình mỗi tháng. Thu nhập thụ động là tiền tự đến (cho thuê, cổ tức…) — có thể bỏ trống nếu chưa có.",
    fields: [
      {
        key: "monthly_income",
        label: "Tổng thu nhập / tháng",
        hint: "Gồm lương vợ + chồng + kinh doanh + đầu tư.",
        unit: "vnd_month",
      },
      {
        key: "monthly_expenses",
        label: "Tổng chi tiêu / tháng",
        hint: "Nhà ở, ăn uống, đi lại, học hành. KHÔNG tính trả nợ và bảo hiểm.",
        unit: "vnd_month",
      },
      {
        key: "monthly_passive_income",
        label: "Thu nhập thụ động / tháng",
        hint: "BĐS cho thuê, cổ tức, lãi tiết kiệm cố định…",
        unit: "vnd_month",
        optional: true,
      },
      {
        key: "monthly_debt_payment",
        label: "Tổng tiền trả nợ / tháng",
        hint: "Cộng dồn các khoản trả nợ vay nhà, xe, thẻ tín dụng, kinh doanh.",
        unit: "vnd_month",
        optional: true,
      },
    ],
  },
  {
    group: "Tài sản",
    icon: PiggyBank,
    color: "#a855f7",
    title: "Tài sản hiện có (chia 4 nhóm)",
    subtitle:
      "Phân biệt giúp đánh giá cấu trúc tài sản. Nhập 0 nếu nhóm đó chưa có.",
    fields: [
      {
        key: "assets_liquid",
        label: "Tài sản thanh khoản",
        hint: "Tiền mặt, tài khoản ngân hàng, vàng dễ rút, sổ tiết kiệm.",
        unit: "vnd",
      },
      {
        key: "assets_growth",
        label: "Tài sản tăng trưởng",
        hint: "Cổ phiếu, chứng chỉ quỹ, vàng đầu tư, BĐS đầu tư, crypto.",
        unit: "vnd",
      },
      {
        key: "assets_cashflow",
        label: "Tài sản dòng tiền",
        hint: "BĐS cho thuê (giá trị BĐS), doanh nghiệp đang tạo dòng tiền.",
        unit: "vnd",
      },
      {
        key: "assets_consumption",
        label: "Tài sản tiêu sản",
        hint: "Nhà để ở, xe để đi — không sinh dòng tiền.",
        unit: "vnd",
      },
    ],
  },
  {
    group: "Nợ phải trả",
    icon: CreditCard,
    color: "#ef4444",
    title: "Các khoản nợ hiện có",
    subtitle:
      "Phân biệt nợ xấu (tiêu sản, tiêu dùng) vs nợ tốt (đầu tư, kinh doanh). Nhập số dư nợ còn lại.",
    fields: [
      {
        key: "debt_credit_card",
        label: "Nợ thẻ tín dụng",
        hint: "Tổng dư nợ thẻ tín dụng còn phải trả.",
        unit: "vnd",
        optional: true,
      },
      {
        key: "debt_installment",
        label: "Nợ mua trả góp",
        hint: "Trả góp điện thoại, đồ gia dụng, du học…",
        unit: "vnd",
        optional: true,
      },
      {
        key: "debt_car",
        label: "Nợ vay mua xe",
        unit: "vnd",
        optional: true,
      },
      {
        key: "debt_house",
        label: "Nợ vay mua nhà",
        unit: "vnd",
        optional: true,
      },
      {
        key: "debt_business",
        label: "Nợ vay đầu tư kinh doanh (nợ tốt)",
        hint: "Vay vốn lưu động, vay mở rộng kinh doanh — nợ tạo dòng tiền.",
        unit: "vnd",
        optional: true,
      },
    ],
  },
  {
    group: "Bảo hiểm",
    icon: Shield,
    color: "#8b5cf6",
    title: "Bảo hiểm hiện có (phí / tháng)",
    subtitle:
      "Tổng phí bảo hiểm chia đều theo tháng (nếu đóng năm thì /12). Mục tiêu: 5–15% thu nhập.",
    fields: [
      {
        key: "insurance_health",
        label: "Bảo hiểm sức khoẻ",
        hint: "Bảo hiểm y tế tự nguyện, gói sức khoẻ cao cấp.",
        unit: "vnd_month",
        optional: true,
      },
      {
        key: "insurance_life_husband",
        label: "Bảo hiểm nhân thọ cho chồng",
        unit: "vnd_month",
        optional: true,
      },
      {
        key: "insurance_life_wife",
        label: "Bảo hiểm nhân thọ cho vợ",
        unit: "vnd_month",
        optional: true,
      },
    ],
  },
];

interface LoggedInUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

const EMPTY_VALUES: Record<string, number> = {};
STEPS.forEach((s) => s.fields.forEach((f) => (EMPTY_VALUES[f.key] = 0)));

export default function FinancialHealthQuiz({
  defaultEmail = "",
  defaultName = "",
  defaultPhone = "",
}: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({ ...EMPTY_VALUES });
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth detection — same as before
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) return;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        setLoggedInUser({
          id: user.id,
          email: user.email ?? "",
          full_name: (profile?.full_name as string) ?? "",
          phone: (profile?.phone as string) ?? "",
        });
      } catch {
        // anon
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist progress
  useEffect(() => {
    try {
      const cached = localStorage.getItem("fhq_progress_v3");
      if (cached) {
        const j = JSON.parse(cached);
        if (j.values) setValues((v) => ({ ...v, ...j.values }));
        if (typeof j.stepIdx === "number") setStepIdx(j.stepIdx);
      }
    } catch {
      // ignore
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "fhq_progress_v3",
        JSON.stringify({ values, stepIdx })
      );
    } catch {
      // ignore
    }
  }, [values, stepIdx]);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const progressPct = ((stepIdx + 1) / STEPS.length) * 100;

  const preview = useMemo(
    () => computeFinancialHealth(values as unknown as FinancialHealthInputs),
    [values]
  );

  const handleNumChange = (key: string, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    const n = digits ? parseInt(digits, 10) : 0;
    setValues((v) => ({ ...v, [key]: n }));
  };

  const validateCurrentStep = (): string | null => {
    // Required fields per step
    if (stepIdx === 0) {
      if (!values.age_husband) return "Vui lòng nhập tuổi chồng";
    }
    if (stepIdx === 1) {
      if (!values.monthly_income) return "Vui lòng nhập thu nhập / tháng";
      if (!values.monthly_expenses) return "Vui lòng nhập chi tiêu / tháng";
    }
    return null;
  };

  const handleNext = () => {
    setError(null);
    const err = validateCurrentStep();
    if (err) {
      setError(err);
      return;
    }
    if (!isLast) {
      setStepIdx(stepIdx + 1);
      return;
    }
    setShowContactPopup(true);
  };
  const handlePrev = () => {
    setError(null);
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const StepIcon = step.icon;

  return (
    <>
      <div
        className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background: "#141414",
          border: "1px solid #2a2a2a",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Progress bar */}
        <div className="h-1.5" style={{ background: "#1f1f1f" }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${BRAND}, #3B82F6)`,
            }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Step header */}
          <div className="flex items-center justify-between mb-5">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: `${step.color}1a`,
                color: step.color,
                border: `1px solid ${step.color}55`,
              }}
            >
              <StepIcon size={11} />
              {step.group}
            </div>
            <div className="text-[11px] text-gray-500">
              Bước {stepIdx + 1} / {STEPS.length}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2 text-white">
            {step.title}
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">{step.subtitle}</p>

          {/* Field stack */}
          <div className="space-y-4">
            {step.fields.map((f) => (
              <FieldRow
                key={f.key}
                field={f}
                value={values[f.key] ?? 0}
                onChange={(v) => handleNumChange(f.key, v)}
                accent={step.color}
              />
            ))}
          </div>

          {/* Live preview */}
          {(stepIdx >= 1 || preview.total_score > 0) && (
            <div
              className="mt-6 px-4 py-3 rounded-xl text-xs flex items-center justify-between"
              style={{ background: "#0e0e0e", border: "1px solid #232323" }}
            >
              <span className="text-gray-500">Điểm dự kiến hiện tại:</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-extrabold text-base"
                  style={{
                    color:
                      preview.rating === "good"
                        ? "#22c55e"
                        : preview.rating === "fair"
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                >
                  {preview.total_score}
                </span>
                <span className="text-gray-500">/ 100</span>
              </div>
            </div>
          )}

          {error && (
            <div
              className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg text-xs text-red-400"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-7">
            <button
              type="button"
              onClick={handlePrev}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
              style={{ background: "#1f1f1f", border: "1px solid #2a2a2a" }}
            >
              <ChevronLeft size={15} />
              Quay lại
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-bold text-black"
              style={{
                background: `linear-gradient(135deg, ${BRAND}, #3B82F6)`,
                boxShadow: `0 4px 16px ${BRAND}55`,
              }}
            >
              {isLast ? (
                <>
                  <Sparkles size={15} />
                  Xem kết quả
                </>
              ) : (
                <>
                  Tiếp tục
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ContactPopup
        open={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        previewScore={preview.total_score}
        previewRating={preview.rating}
        inputs={values}
        loggedInUser={loggedInUser}
        defaultEmail={defaultEmail}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
      />
    </>
  );
}

/* ───────────────────────── field row ───────────────────────── */

function FieldRow({
  field,
  value,
  onChange,
  accent,
}: {
  field: Field;
  value: number;
  onChange: (raw: string) => void;
  accent: string;
}) {
  const display = value > 0 ? value.toLocaleString("vi-VN") : "";
  const isAge = field.unit === "age";
  const suffix =
    field.unit === "age" ? "tuổi" : field.unit === "vnd_month" ? "₫ / tháng" : "₫";

  return (
    <div>
      <label className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-gray-300">
          {field.label}
          {!field.optional && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {field.optional && (
          <span className="text-[10px] text-gray-600 italic">tuỳ chọn</span>
        )}
      </label>
      {field.hint && (
        <p className="text-[11px] text-gray-500 mb-1.5 leading-snug">{field.hint}</p>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full px-3.5 py-3 rounded-xl text-base sm:text-lg font-bold text-white outline-none transition-colors"
          style={{ background: "#0a0a0a", border: `1.5px solid ${accent}55` }}
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
          style={{ color: accent }}
        >
          {suffix}
        </span>
      </div>
      {!isAge && value > 0 && (
        <p className="text-[10px] text-gray-500 mt-1">≈ {formatVND(value)}</p>
      )}
    </div>
  );
}

/* ───────────────────────── contact popup ───────────────────────── */

interface ContactPopupProps {
  open: boolean;
  onClose: () => void;
  previewScore: number;
  previewRating: "good" | "fair" | "critical";
  inputs: Record<string, number>;
  loggedInUser: LoggedInUser | null;
  defaultEmail: string;
  defaultName: string;
  defaultPhone: string;
}

function ContactPopup({
  open,
  onClose,
  previewScore,
  previewRating,
  inputs,
  loggedInUser,
  defaultEmail,
  defaultName,
  defaultPhone,
}: ContactPopupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(loggedInUser?.full_name || defaultName);
    setEmail(loggedInUser?.email || defaultEmail);
    setPhone(loggedInUser?.phone || defaultPhone);
    setError(null);
  }, [open, loggedInUser, defaultEmail, defaultName, defaultPhone]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Vui lòng nhập họ tên");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Email không hợp lệ");
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      return setError("Số điện thoại không hợp lệ (9-12 chữ số)");
    }
    if (!loggedInUser && password.length < 8) {
      return setError("Mật khẩu phải có ít nhất 8 ký tự");
    }
    setLoading(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/tools/financial-health/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          full_name: name.trim(),
          phone: phone.trim() || null,
          password: loggedInUser ? undefined : password,
          inputs,
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          referrer: document.referrer || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || "Có lỗi xảy ra. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      // If the server just created an account for us, sign the user in
      // client-side so the session cookie is established before we navigate
      // to the results page — they should land already logged in.
      if (data.account_created && data.account_email && password) {
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: data.account_email,
            password,
          });
        } catch {
          // Non-fatal — they can log in later. Result page still works
          // because the token is in the URL.
        }
      }

      try {
        localStorage.removeItem("fhq_progress_v3");
      } catch {
        // ignore
      }
      window.location.href = `/results/${data.token}`;
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const ratingColor =
    previewRating === "good"
      ? "#22c55e"
      : previewRating === "fair"
        ? "#f59e0b"
        : "#ef4444";
  const ratingLabel =
    previewRating === "good"
      ? "TỐT"
      : previewRating === "fair"
        ? "TRUNG BÌNH"
        : "CẦN CHÚ Ý";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={(e) => {
        if (!loading && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden text-white"
        style={{
          background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
          border: `1px solid ${BRAND}55`,
          boxShadow: "0 20px 80px rgba(0,0,0,0.8)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          style={{ background: "rgba(255,255,255,0.06)" }}
          aria-label="Đóng"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          <div
            className="rounded-xl p-4 mb-5 text-center"
            style={{
              background: `${ratingColor}0d`,
              border: `1px solid ${ratingColor}55`,
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
              Điểm sơ bộ của anh/chị
            </div>
            <div className="leading-none">
              <span className="text-4xl font-extrabold" style={{ color: ratingColor }}>
                {previewScore}
              </span>
              <span className="text-lg text-gray-500 font-bold"> / 100</span>
            </div>
            <div
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-2"
              style={{ background: ratingColor, color: "#1a1a1a" }}
            >
              {ratingLabel}
            </div>
          </div>

          <h3 className="text-xl font-extrabold leading-snug mb-2 text-center">
            {loggedInUser ? (
              <>
                Nhận{" "}
                <span style={{ color: BRAND }}>kết quả chi tiết</span>
              </>
            ) : (
              <>
                Tạo tài khoản để xem{" "}
                <span style={{ color: BRAND }}>kết quả chi tiết</span>
              </>
            )}
          </h3>
          <p className="text-xs text-gray-400 text-center leading-relaxed mb-5">
            {loggedInUser ? (
              <>
                Em sẽ gửi bản phân tích + lời khuyên cá nhân hoá qua email.
                <br />
                <span className="text-[#2563EB]">
                  ✓ Kết quả lưu vào tài khoản của anh/chị
                </span>
              </>
            ) : (
              <>
                Tài khoản giúp anh/chị nhận kết quả qua email, lưu lại bài
                test và truy cập các khoá học.
                <br />
                <span className="text-[#2563EB]">
                  ✓ Email kết quả · lưu vĩnh viễn · vào học miễn phí
                </span>
              </>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <PField
              icon={User}
              type="text"
              placeholder="Họ và tên"
              value={name}
              onChange={setName}
              required
            />
            <PField
              icon={Mail}
              type="email"
              placeholder="Email nhận kết quả"
              value={email}
              onChange={setEmail}
              required
              disabled={!!loggedInUser?.email}
            />
            <PField
              icon={Phone}
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={setPhone}
              required
            />

            {/* Password field — only for anon users (account creation) */}
            {!loggedInUser && (
              <>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu (≥ 8 ký tự)"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full pl-9 pr-10 py-3 rounded-lg text-sm text-white outline-none"
                    style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-300"
                    tabIndex={-1}
                    aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug -mt-1">
                  Đã có tài khoản với email này? Nhập đúng mật khẩu để liên
                  kết kết quả.
                </p>
              </>
            )}

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                }}
              >
                <AlertCircle size={13} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold text-black disabled:opacity-60"
              style={{
                background: `linear-gradient(135deg, ${BRAND}, #3B82F6)`,
                boxShadow: `0 6px 20px ${BRAND}55`,
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : loggedInUser ? (
                <>
                  <CheckCircle2 size={15} />
                  Xem kết quả & gửi email
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  Tạo tài khoản & xem kết quả
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-500 text-center pt-1">
              🔒 Bảo mật. Không spam, không chia sẻ bên thứ ba.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function PField({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  disabled,
}: {
  icon: typeof User;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Icon
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
      />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-3 rounded-lg text-sm text-white outline-none disabled:opacity-60"
        style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
