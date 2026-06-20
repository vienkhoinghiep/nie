"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Coffee,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  BarChart3,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Video,
  AlertCircle,
  Lock,
  CheckCircle2,
  CheckCircle,
  Quote,
  Wallet,
  Gem,
  Hourglass,
  Target,
  ShieldAlert,
  Mail,
  User,
  Phone,
  Loader2,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import BankTransferButtons from "@/components/BankTransferButtons";
import { siteConfig } from "@/lib/site-config";
import { createClient } from "@/lib/supabase/client";

const BRAND = "#2563EB";
const BRAND_HOVER = "#3B82F6";
const TOOL_URL = "/dashboard/entrepreneur-financial-blueprint";
const REGULAR_PRICE = 9845267; // giá niêm yết
const EARLY_BIRD_PRICE = 298456; // ưu đãi 100 người đầu tiên
const EARLY_BIRD_LIMIT = 100;

interface ProductLite {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface Props {
  product: ProductLite | null;
  isAuthenticated: boolean;
  alreadyOwns: boolean;
  /** Nội dung chèn lên đầu trang (vd. video cảm ơn trên /oto). */
  videoSlot?: ReactNode;
}

interface PaymentInfo {
  order_code: string;
  amount: number;
  transfer_content: string;
  qr_url: string | null;
  bank_account: string | null;
  bank_code: string | null;
}

/* ─── Data ─── */

const HARD_QUESTIONS = [
  { icon: Wallet, q: "Mình đang sở hữu bao nhiêu tài sản?" },
  { icon: Gem, q: "Giá trị tài sản ròng hiện tại là bao nhiêu?" },
  {
    icon: Hourglass,
    q: "Nếu ngừng làm việc hôm nay, mình sống được bao lâu?",
  },
  { icon: Target, q: "Mình cần bao nhiêu tiền để độc lập tài chính?" },
  { icon: TrendingUp, q: "Bao nhiêu năm nữa đạt tự do tài chính?" },
  {
    icon: ShieldAlert,
    q: "Những rủi ro nào đang âm thầm đe dọa gia đình và tương lai của mình?",
  },
];

const DELIVERABLES = [
  {
    icon: BarChart3,
    color: BRAND,
    title: "Entrepreneur Financial Blueprint™ Report",
    value: "3.000.000đ",
    img: { src: "/images/blueprint/Picture1.png", w: 612, h: 321 },
    intro: "Giúp bạn biết:",
    points: [
      "Mình đang ở đâu trên bản đồ tài chính",
      "Điểm mạnh tài chính",
      "Điểm yếu tài chính",
      "Giá trị tài sản ròng",
      "Chỉ số sức khỏe tài chính",
    ],
  },
  {
    icon: Sparkles,
    color: "#a855f7",
    title: "Entrepreneur Wealth MRI™",
    value: "2.000.000đ",
    img: { src: "/images/blueprint/Picture2.png", w: 612, h: 336 },
    intro: "Giúp bạn khám phá:",
    points: [
      "Nhận thức về tiền",
      "Mối quan hệ với tiền",
      "Những niềm tin giới hạn",
      "Hệ điều hành tài chính bên trong",
    ],
  },
  {
    icon: ShieldCheck,
    color: "#ef4444",
    title: "Entrepreneur Risk Map™",
    value: "1.500.000đ",
    img: { src: "/images/blueprint/Picture4.png", w: 612, h: 344 },
    intro: "Giúp bạn phát hiện:",
    points: [
      "Những rủi ro tài chính lớn nhất",
      "Những lỗ hổng cần xử lý ngay",
      "Những nguy cơ có thể khiến bạn mất nhiều năm tích lũy",
    ],
  },
  {
    icon: TrendingUp,
    color: "#3b82f6",
    title: "Financial Freedom Roadmap™",
    value: "2.000.000đ",
    img: { src: "/images/blueprint/Picture5.png", w: 612, h: 328 },
    intro: "Giúp bạn biết:",
    points: [
      "Mình đang ở cấp độ tài chính nào",
      "Cần bao nhiêu tiền để tự do tài chính",
      "Khoảng cách còn lại",
      "Lộ trình hành động phù hợp",
    ],
  },
  {
    icon: Video,
    color: "#22c55e",
    title: "Bộ Video Hướng Dẫn",
    value: "1.500.000đ",
    img: { src: "/images/blueprint/Picture3.png", w: 612, h: 338 },
    intro: "Giúp bạn:",
    points: [
      "Hiểu sâu hơn về tiền",
      "Hiểu bản thân",
      "Hiểu tài sản",
      "Hiểu con đường tự do tài chính",
    ],
  },
];

const PROMISES = [
  {
    title: "Nhìn thấy toàn bộ bức tranh tài chính của mình",
    desc: "Thu nhập, chi tiêu, tài sản, nợ và rủi ro được hiển thị trên cùng một tấm bản đồ — rõ ràng, trực quan, không còn mơ hồ.",
  },
  {
    title: "Biết chính xác mình đang ở đâu",
    desc: "Giá trị tài sản ròng và chỉ số sức khỏe tài chính cho bạn biết mình đang đứng ở vị trí nào trên hành trình tiền bạc.",
  },
  {
    title: "Biết mình đang gặp rủi ro gì",
    desc: "Phát hiện những lỗ hổng và nguy cơ đang âm thầm đe dọa tài sản, gia đình và tương lai của bạn — trước khi quá muộn.",
  },
  {
    title: "Biết cần làm gì trong 12 tháng tới",
    desc: "Một lộ trình hành động cụ thể, ưu tiên đúng việc cần làm ngay để tạo ra thay đổi rõ rệt trong năm tới.",
  },
  {
    title: "Biết con đường dẫn tới tự do tài chính",
    desc: "Bạn cần bao nhiêu tiền, còn cách đích bao xa và đi theo lộ trình nào để chạm tới sự độc lập tài chính.",
  },
  {
    title: "Tiến gần hơn tới sự bình yên về tiền trong tâm trí",
    desc: "Khi đã nhìn rõ mọi con số, nỗi lo về tiền được thay bằng sự tự tin và bình an thật sự trong tâm trí.",
  },
];

const FAQ_DATA = [
  {
    q: "Tôi nhận được gì sau khi mua?",
    a: "Bạn được mở full quyền sử dụng công cụ Entrepreneur Financial Blueprint™: trả lời bộ câu hỏi chuyên sâu (~60 phút) và nhận về báo cáo đầy đủ gồm Financial Blueprint Report, Wealth MRI™, Risk Map™, Financial Freedom Roadmap™ cùng bộ video hướng dẫn.",
  },
  {
    q: "Mất bao lâu để hoàn thành?",
    a: "Chỉ khoảng 60 phút. Bạn có thể làm một lần hoặc chia nhỏ — dữ liệu được lưu lại, làm tới đâu lưu tới đó, quay lại bất cứ lúc nào.",
  },
  {
    q: "Vì sao chỉ 298.567đ trong khi giá trị tới 10.000.000đ?",
    a: "Vì tôi muốn càng nhiều nhà khởi nghiệp nhìn rõ bức tranh tài chính của mình càng tốt. 298.567đ chỉ tương đương một bữa tối — hãy xem như bạn mời tôi một bữa tối, và tôi giúp bạn nhìn thấy tương lai tài chính của chính mình.",
  },
  {
    q: "Báo cáo có chính xác với hoàn cảnh của tôi không?",
    a: "Báo cáo được cá nhân hóa hoàn toàn dựa trên câu trả lời của bạn về thu nhập, chi tiêu, tài sản, nợ, nhận thức và niềm tin về tiền. Bạn trả lời càng thật, bản đồ tài chính càng đúng.",
  },
  {
    q: "Thanh toán bằng cách nào?",
    a: "Chuyển khoản ngân hàng qua mã QR — hệ thống xác nhận tự động và mở quyền dùng công cụ ngay sau khi nhận được thanh toán.",
  },
  {
    q: "Dữ liệu tài chính của tôi có được bảo mật không?",
    a: "Có. Dữ liệu của bạn được lưu trữ an toàn và chỉ phục vụ cho việc tạo báo cáo của riêng bạn. Không ai khác xem được câu trả lời của bạn.",
  },
];

/* ─── Component ─── */

export default function BlueprintSalesLanding({
  product,
  isAuthenticated,
  alreadyOwns,
  videoSlot,
}: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const priceLabel = (product?.price ?? EARLY_BIRD_PRICE).toLocaleString(
    "vi-VN"
  );
  const regularLabel = REGULAR_PRICE.toLocaleString("vi-VN");

  // ── Inline register + pay form ──────────────────────────────
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  // Chưa đăng nhập → mời đăng ký, rồi quay lại đúng trang kèm ?checkout=1 để tự
  // bật cổng thanh toán sau khi đăng ký xong.
  const registerHref = `/register?next=${encodeURIComponent(
    `${pathname || "/blueprint"}?checkout=1`
  )}`;
  const autoCheckoutFired = useRef(false);

  // Poll order status every 5s while payment panel is shown
  useEffect(() => {
    if (!paymentInfo?.order_code || paid) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/orders/check-status?order_code=${paymentInfo.order_code}`
        );
        const data = await res.json();
        if (data.status === "paid") {
          setPaid(true);
          clearInterval(poll);
          // Tự chuyển thẳng ra trang CÔNG CỤ để khách thực hiện ngay.
          // Để 1.5s cho người dùng thấy thông báo thành công + chắc chắn
          // webhook đã mở quyền xong.
          setTimeout(() => {
            window.location.href = TOOL_URL;
          }, 1500);
        }
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(poll);
  }, [paymentInfo?.order_code, paid]);

  const scrollToForm = () =>
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu tối thiểu 8 ký tự");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blueprint/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.paymentInfo) {
        setPaymentInfo(data.paymentInfo);
        // Đăng nhập client-side để tạo session trong trình duyệt → sau khi
        // thanh toán xong có thể redirect thẳng vào khóa học mà vẫn có quyền xem.
        try {
          await createClient().auth.signInWithPassword({
            email: form.email.trim(),
            password: form.password,
          });
        } catch {
          /* không chặn luồng — khách vẫn có thể đăng nhập lại thủ công */
        }
        setTimeout(scrollToForm, 50);
      } else if (data.success) {
        setError(
          data.message || "Đăng ký thành công nhưng chưa tạo được đơn hàng."
        );
      } else {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Người đã đăng nhập (vd. tới từ /oto): bấm CTA → tạo đơn + hiện QR ngay,
  // không cần điền lại form.
  const handleInstantCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blueprint/order", { method: "POST" });
      const data = await res.json();
      if (data.success && data.paymentInfo) {
        setPaymentInfo(data.paymentInfo);
        setTimeout(scrollToForm, 50);
      } else {
        setError(data.error || "Không tạo được đơn hàng, vui lòng thử lại.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Sau khi đăng ký xong quay lại với ?checkout=1 + đã đăng nhập + chưa sở hữu
  // → tự bật cổng thanh toán (tạo đơn + hiện QR) ngay, không cần bấm lại CTA.
  useEffect(() => {
    const wantCheckout =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("checkout") === "1";
    if (
      wantCheckout &&
      isAuthenticated &&
      !alreadyOwns &&
      !paymentInfo &&
      !autoCheckoutFired.current
    ) {
      autoCheckoutFired.current = true;
      handleInstantCheckout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, alreadyOwns, paymentInfo]);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const renderCta = (size: "lg" | "sm" = "lg") => {
    const big = size === "lg";
    const cls = big
      ? "inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm sm:text-base font-extrabold text-black text-center leading-snug max-w-xl transition-transform hover:scale-[1.02] active:scale-[0.99]"
      : "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-black transition-transform hover:scale-[1.02]";
    const style = {
      background: `linear-gradient(135deg, ${BRAND_HOVER}, ${BRAND})`,
      boxShadow: `0 10px 30px ${BRAND}44`,
    };

    if (alreadyOwns) {
      return (
        <Link href={TOOL_URL} className={cls} style={style}>
          <Sparkles size={big ? 18 : 15} />
          Vào công cụ ngay
          <ArrowRight size={big ? 18 : 15} />
        </Link>
      );
    }
    const label = big
      ? "Hãy mời tôi một bữa tối — tôi sẽ giúp bạn có được bức tranh toàn cảnh về tài chính."
      : `Mời một bữa tối — ${priceLabel}₫`;

    // Đã đăng nhập → tạo đơn + hiện QR ngay (instant checkout).
    if (isAuthenticated) {
      return (
        <button
          type="button"
          onClick={handleInstantCheckout}
          disabled={loading}
          className={`${cls} disabled:opacity-70`}
          style={style}
        >
          {loading ? (
            <Loader2 size={big ? 18 : 15} className="animate-spin" />
          ) : (
            <Coffee size={big ? 18 : 15} />
          )}
          {label}
        </button>
      );
    }

    // Chưa đăng nhập → mời đăng ký; đăng ký xong tự ra cổng thanh toán.
    return (
      <Link href={registerHref} className={cls} style={style}>
        <Coffee size={big ? 18 : 15} />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between"
        style={{
          background: "rgba(7,7,7,0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${BRAND}22`,
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="font-extrabold text-sm sm:text-base"
            style={{ color: BRAND }}
          >
            {siteConfig.shortName}
          </span>
          <span className="text-gray-500 text-xs hidden sm:block">
            Entrepreneur Financial Blueprint™
          </span>
        </Link>
        {renderCta("sm")}
      </nav>

      {/* ═══ VIDEO SLOT (vd. video cảm ơn trên /oto) + CTA ═══ */}
      {videoSlot && (
        <section className="px-4 pt-24 sm:pt-28">
          <div className="max-w-3xl mx-auto">
            {videoSlot}
            <div className="text-center mt-7">{renderCta("lg")}</div>
          </div>
        </section>
      )}

      {/* ═══ HERO — Kiyosaki quote ═══ */}
      <section
        className={`relative pb-8 px-4 ${
          videoSlot ? "pt-10 sm:pt-14" : "pt-28 sm:pt-36"
        }`}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(60% 50% at 50% 0%, ${BRAND}1a, transparent 70%)`,
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <figure className="max-w-2xl mx-auto">
            <Quote size={34} className="mx-auto mb-4" style={{ color: BRAND }} />
            <blockquote className="text-lg sm:text-2xl font-medium text-gray-100 leading-relaxed italic">
              “Bạn kiếm được bao nhiêu không quan trọng. Điều quan trọng là bạn{" "}
              <span className="text-white font-semibold not-italic">
                giữ được bao nhiêu tiền
              </span>{" "}
              — và bạn làm thế nào để bắt tiền làm việc cho mình, khiến cho{" "}
              <span className="font-semibold not-italic" style={{ color: BRAND }}>
                “tiền đẻ ra tiền”
              </span>
              .”
            </blockquote>
            <figcaption
              className="mt-5 text-sm font-bold tracking-[0.15em]"
              style={{ color: BRAND }}
            >
              — ROBERT KIYOSAKI
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ═══ AUDIENCE + HARD QUESTIONS ═══ */}
      <section className="pb-7 sm:pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-300 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto mb-3">
            Bạn đang là một{" "}
            <strong className="text-white">
              Chủ doanh nghiệp, nhà khởi nghiệp, người kinh doanh
            </strong>{" "}
            — hoặc đơn giản là một{" "}
            <strong className="text-white">trụ cột gia đình</strong> đang nỗ lực
            kiếm tiền mỗi ngày.
          </p>
          <p
            className="text-center text-lg sm:text-2xl font-bold mb-10"
            style={{ color: BRAND }}
          >
            Nhưng bạn có thực sự biết:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {HARD_QUESTIONS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-5 rounded-2xl"
                  style={{
                    background: "#0e0e0e",
                    border: "1px solid #1d1d1d",
                  }}
                >
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${BRAND}1a`, color: BRAND }}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="text-sm sm:text-[15px] text-gray-200 leading-snug font-medium">
                    {item.q}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ THE FOG ═══ */}
      <section className="py-7 sm:py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-base sm:text-lg mb-4" style={{ color: BRAND }}>
            Bạn thân mến,
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            Phần lớn mọi người không gặp vấn đề vì thiếu tiền.
          </h2>
          <p className="text-gray-400 mb-6">Họ gặp vấn đề vì:</p>
          <p className="text-lg sm:text-2xl font-extrabold leading-relaxed max-w-2xl mx-auto">
            <span className="text-white">
              Không nhìn thấy bức tranh toàn cảnh về tài chính của chính mình.
            </span>{" "}
            <span style={{ color: BRAND }}>
              Giống như một người lái xe trong sương mù. Đi rất nhanh... Nhưng
              không biết mình đang đi đâu.
            </span>
          </p>
        </div>
      </section>

      {/* ═══ SOLUTION INTRO ═══ */}
      <section className="py-7 sm:py-10 px-4">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl p-8 sm:p-12"
          style={{
            background: `radial-gradient(80% 100% at 50% 0%, ${BRAND}16, #0c0c0c)`,
            border: `1px solid ${BRAND}33`,
          }}
        >
          <p className="text-gray-400 mb-3">Vì vậy tôi tạo ra:</p>
          <p
            className="text-2xl sm:text-4xl font-black mb-3"
            style={{ color: BRAND }}
          >
            ENTREPRENEUR
            <br className="sm:hidden" /> FINANCIAL BLUEPRINT™
          </p>
          <h1 className="text-xl sm:text-3xl font-black leading-tight text-white mb-6">
            Bản Đồ Tài Chính Toàn Cảnh{" "}
            <span style={{ color: BRAND }}>Cho Doanh Chủ</span>
          </h1>

          <div className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed space-y-4 text-left sm:text-center">
            <p>
              Chương trình được thiết kế để giúp bạn{" "}
              <strong className="text-white">
                kiểm tra sức khỏe tài chính cá nhân
              </strong>
              , nhìn rõ dòng tiền, tài sản, nợ, rủi ro, bảo hiểm, đầu tư và lộ
              trình hướng tới{" "}
              <strong className="text-white">
                sự bình yên về tiền trong tâm trí
              </strong>
              .
            </p>
            <p className="text-gray-400">
              Đây không chỉ là một bản báo cáo tài chính cá nhân, mà là một tấm{" "}
              <strong className="text-white">bản đồ</strong> giúp doanh chủ biết
              mình đang ở đâu, điều gì đang âm thầm cản trở sự tự do tài chính,
              và đâu là bước đi tiếp theo để xây dựng nền tảng tài chính vững
              chắc cho bản thân, gia đình và sự nghiệp kinh doanh.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ DELIVERABLES ═══ */}
      <section className="py-7 sm:py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 leading-snug">
            <span style={{ color: BRAND }}>ENTREPRENEUR FINANCIAL BLUEPRINT™</span>{" "}
            sẽ mang đến cho bạn
          </h2>

          <div className="space-y-5">
            {DELIVERABLES.map((d, i) => {
              const Icon = d.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl p-5 sm:p-6"
                  style={{
                    background: `linear-gradient(135deg, ${d.color}0c, #0d0d0d)`,
                    border: `1px solid ${d.color}2e`,
                  }}
                >
                  <div className="grid md:grid-cols-2 gap-5 md:gap-7 items-center">
                    {/* Nội dung */}
                    <div className="flex items-start gap-4">
                      <div
                        className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${d.color}1f`, color: d.color }}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {d.title}
                            </h3>
                          </div>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                            style={{
                              background: `${d.color}18`,
                              color: d.color,
                            }}
                          >
                            Giá trị {d.value}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 mb-2">
                          {d.intro}
                        </p>
                        <ul className="grid gap-x-4 gap-y-1.5">
                          {d.points.map((pt) => (
                            <li
                              key={pt}
                              className="flex items-start gap-2 text-sm text-gray-300"
                            >
                              <Check
                                size={14}
                                className="shrink-0 mt-0.5"
                                style={{ color: d.color }}
                              />
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Hình minh họa */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "#080808",
                        border: `1px solid ${d.color}33`,
                      }}
                    >
                      <Image
                        src={d.img.src}
                        alt={d.title}
                        width={d.img.w}
                        height={d.img.h}
                        className="w-full h-auto"
                        sizes="(min-width: 1024px) 460px, 100vw"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ OFFER STACK / PRICE ═══ */}
      <section className="py-7 sm:py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-black leading-snug">
            Tôi sẽ dành tặng toàn bộ chương trình{" "}
            <span style={{ color: BRAND }}>
              Entrepreneur Financial Blueprint™
            </span>{" "}
            trị giá <span style={{ color: BRAND }}>{regularLabel}đ</span> cho{" "}
            {EARLY_BIRD_LIMIT} người bạn sẵn sàng mời tôi{" "}
            <span style={{ color: BRAND }}>một bữa tối</span>.
          </h2>

          <div className="mt-9">{renderCta("lg")}</div>

          <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Lock size={11} /> Bảo mật dữ liệu
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} /> Mở quyền dùng tool ngay
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> Truy cập trọn đời
            </span>
          </div>
        </div>
      </section>

      {/* ═══ PROMISE ═══ */}
      <section className="py-7 sm:py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 leading-snug">
            Hãy mời tôi một bữa tối, và tôi sẽ giúp bạn:
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROMISES.map((p) => (
              <div
                key={p.title}
                className="flex flex-col gap-2.5 px-5 py-5 rounded-2xl h-full"
                style={{
                  background: `${BRAND}0a`,
                  border: `1px solid ${BRAND}24`,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2
                    size={20}
                    className="shrink-0 mt-0.5"
                    style={{ color: BRAND }}
                  />
                  <h3 className="text-[15px] font-bold text-white leading-snug">
                    {p.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGISTER / FINAL CTA (form nhúng trong trang) ═══ */}
      <section ref={formRef} id="dang-ky" className="py-9 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-black mb-4">
              Hãy mời tôi một bữa tối.
            </h2>
            <p className="text-gray-300 text-base sm:text-lg">
              Tôi sẽ giúp bạn nhìn thấy{" "}
              <strong className="text-white">
                tương lai tài chính của chính mình.
              </strong>
            </p>
          </div>

          {alreadyOwns ? (
            /* ─── Đã sở hữu → vào thẳng công cụ ─── */
            <div className="text-center">{renderCta("lg")}</div>
          ) : paid ? (
            /* ─── Đã thanh toán thành công ─── */
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "#0c0c0c", border: `1px solid ${BRAND}33` }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-green-500/15 border-2 border-green-500/40">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Thanh Toán Thành Công! 🎉
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Quyền sử dụng công cụ đã được mở khoá. Đang đưa bạn vào công cụ
                <span className="inline-flex items-center gap-1 ml-1">
                  <Loader2 size={14} className="animate-spin" />
                </span>
                <br />
                Nếu không tự chuyển, hãy bấm nút bên dưới.
              </p>
              <Link
                href={TOOL_URL}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-bold text-black transition-transform hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_HOVER}, ${BRAND})`,
                }}
              >
                Vào công cụ ngay <ArrowRight size={16} />
              </Link>
            </div>
          ) : paymentInfo ? (
            /* ─── Đăng ký xong → hiển thị QR thanh toán ─── */
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#0c0c0c", border: `1px solid ${BRAND}26` }}
            >
              <div
                className="p-6 sm:p-7 text-center"
                style={{
                  background: `linear-gradient(180deg, ${BRAND}1f 0%, transparent 100%)`,
                  borderBottom: `1px solid ${BRAND}1a`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: `${BRAND}26`,
                    border: `2px solid ${BRAND}4d`,
                  }}
                >
                  <CheckCircle size={32} style={{ color: BRAND }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Đăng Ký Thành Công!
                </h3>
                <p className="text-sm text-gray-400">
                  Tài khoản của bạn đã được tạo.
                </p>
              </div>

              <div className="p-6 sm:p-7">
                {paymentInfo.qr_url ? (
                  <>
                    <p className="text-sm sm:text-base font-semibold text-white mb-4 text-center leading-relaxed">
                      Chuyển khoản{" "}
                      <span style={{ color: BRAND }}>
                        {paymentInfo.amount.toLocaleString("vi-VN")}đ
                      </span>{" "}
                      để mở quyền dùng công cụ:
                    </p>
                    <div className="flex justify-center mb-5">
                      <div className="p-3 rounded-xl bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={paymentInfo.qr_url}
                          alt="QR thanh toán"
                          width={200}
                          height={200}
                          className="block"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          label: "Số tiền",
                          value: `${paymentInfo.amount.toLocaleString("vi-VN")}đ`,
                          key: "amount",
                          highlight: true,
                        },
                        {
                          label: "Nội dung CK",
                          value: paymentInfo.transfer_content,
                          key: "content",
                          copyable: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between p-4 rounded-lg bg-[#161616]"
                        >
                          <span className="text-xs text-gray-400">
                            {item.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-semibold ${
                                item.highlight ? "" : "text-white font-mono"
                              }`}
                              style={
                                item.highlight ? { color: BRAND } : undefined
                              }
                            >
                              {item.value}
                            </span>
                            {item.copyable && (
                              <button
                                type="button"
                                onClick={() => copyText(item.value, item.key)}
                                className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                              >
                                {copied === item.key ? (
                                  <Check size={13} style={{ color: BRAND }} />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {paymentInfo.bank_account && paymentInfo.bank_code && (
                      <BankTransferButtons
                        bankAccount={paymentInfo.bank_account}
                        bankCode={paymentInfo.bank_code}
                        amount={paymentInfo.amount}
                        transferContent={paymentInfo.transfer_content}
                        accentColor={BRAND}
                      />
                    )}

                    <div
                      className="mt-4 p-4 rounded-lg text-sm text-gray-400 leading-relaxed"
                      style={{
                        background: `${BRAND}0d`,
                        border: `1px solid ${BRAND}1a`,
                      }}
                    >
                      <span className="font-medium" style={{ color: BRAND }}>
                        ⚡ Tự động xác nhận
                      </span>{" "}
                      — Sau khi chuyển khoản, hệ thống sẽ tự động mở quyền dùng
                      công cụ trong vòng 60 giây. Trang này sẽ tự cập nhật.
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-lg text-sm text-gray-300 leading-relaxed bg-[#161616]">
                    Tài khoản đã được tạo. Vui lòng liên hệ {siteConfig.name} để
                    hoàn tất thanh toán và mở quyền dùng công cụ.
                  </div>
                )}

                <p className="text-[11px] text-gray-500 text-center leading-relaxed mt-5">
                  Sau khi thanh toán, đăng nhập bằng email{" "}
                  <strong className="text-gray-300">({form.email})</strong> và
                  mật khẩu bạn vừa tạo để vào công cụ.
                </p>
              </div>
            </div>
          ) : isAuthenticated ? (
            /* ─── Đã đăng nhập → thanh toán ngay (không cần điền form) ─── */
            <div
              className="p-6 sm:p-8 rounded-2xl text-center"
              style={{ background: "#0c0c0c", border: `1px solid ${BRAND}1f` }}
            >
              {error && (
                <div
                  className="p-4 rounded-lg flex items-start gap-3 text-sm mb-4 text-left"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <span className="text-red-400 leading-relaxed">{error}</span>
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Sẵn sàng nhận Blueprint của bạn
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                Bạn đã đăng nhập — chỉ một bước thanh toán nữa là mở quyền dùng
                công cụ ngay.
              </p>
              <button
                type="button"
                onClick={handleInstantCheckout}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-extrabold text-black w-full sm:w-auto transition-transform hover:scale-[1.02] disabled:opacity-70"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_HOVER}, ${BRAND})`,
                  boxShadow: `0 10px 30px ${BRAND}44`,
                }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Coffee size={18} />
                )}
                Thanh toán ngay — {priceLabel}₫
              </button>
            </div>
          ) : (
            /* ─── Form đăng ký ─── */
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-2xl space-y-3"
              style={{ background: "#0c0c0c", border: `1px solid ${BRAND}1f` }}
            >
              {error && (
                <div
                  className="p-4 rounded-lg flex items-start gap-3 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertCircle
                    size={16}
                    className="text-red-400 shrink-0 mt-0.5"
                  />
                  <span className="text-red-400 leading-relaxed">{error}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full rounded-lg outline-none text-white py-3.5 pl-11 pr-4"
                    style={{
                      background: "#111",
                      border: `1px solid ${BRAND}26`,
                    }}
                    required
                  />
                </div>
              </div>

              {/* Họ tên */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    name="full_name"
                    type="text"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg outline-none text-white py-3.5 pl-11 pr-4"
                    style={{
                      background: "#111",
                      border: `1px solid ${BRAND}26`,
                    }}
                    required
                  />
                </div>
              </div>

              {/* SĐT */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0901 234 567"
                    className="w-full rounded-lg outline-none text-white py-3.5 pl-11 pr-4"
                    style={{
                      background: "#111",
                      border: `1px solid ${BRAND}26`,
                    }}
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mật khẩu <span className="text-red-400">*</span>{" "}
                  <span className="text-gray-500">(tối thiểu 8 ký tự)</span>
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg outline-none text-white py-3.5 pl-11 pr-11"
                    style={{
                      background: "#111",
                      border: `1px solid ${BRAND}26`,
                    }}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-4 mt-4 text-base font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${BRAND_HOVER}, ${BRAND})`,
                  boxShadow: `0 10px 30px ${BRAND}44`,
                }}
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Coffee size={18} />
                )}
                {loading
                  ? "Đang xử lý..."
                  : `Đăng ký & Thanh toán — ${priceLabel}₫`}
              </button>

              <div className="flex items-center justify-center gap-4 pt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Lock size={11} /> Thanh toán an toàn
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles size={11} /> Mở quyền tự động
                </span>
              </div>

              <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-2">
                {isAuthenticated
                  ? "Bạn đang đăng nhập — nhập đúng email & mật khẩu tài khoản để tạo đơn hàng."
                  : "Đã có tài khoản? Nhập đúng email & mật khẩu — hệ thống tự tạo đơn hàng."}
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-7 sm:py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Câu Hỏi Thường Gặp
          </h2>
          <div className="space-y-3">
            {FAQ_DATA.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ background: "#0c0c0c", border: "1px solid #1c1c1c" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className="overflow-hidden transition-all"
                  style={{
                    maxHeight: openFaq === i ? "320px" : "0",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <div
                    className="px-5 sm:px-6 pb-5 text-sm text-gray-400 leading-relaxed"
                    style={{ borderTop: "1px solid #161616", paddingTop: "1rem" }}
                  >
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 px-4 text-center border-t border-[#181818]">
        <p className="text-xs text-gray-500">{siteConfig.footer.copyright}</p>
        <div className="flex items-center justify-center gap-5 mt-3">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            href="/login"
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
      </footer>
    </div>
  );
}
