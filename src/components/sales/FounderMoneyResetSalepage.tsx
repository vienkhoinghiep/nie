import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Wallet,
  FileSpreadsheet,
  Calculator,
  ListChecks,
  Search,
  MessageCircle,
  Sparkles,
  Lock,
  Receipt,
} from "lucide-react";

/**
 * Full-length sales page block for Founder Money Reset™ — Entry tier (498.526đ).
 * Mounted directly below the personalised upsell on /results/[token].
 *
 * Self-contained: no props, no client state. Pure server-rendered marketing.
 * All copy provided by anh Tuệ; layout follows a classic high-conversion
 * sales-letter rhythm:
 *
 *   Hero gift  →  Big Promise  →  Pain  →  Mechanism (5 steps)  →
 *   Value Stack  →  Total value vs price  →  Refund promise  →
 *   Action guarantee  →  Who is/isn't for  →  Closing + final CTA
 */

const COURSE_SLUG = "founder-money-reset-hoach-dinh-tai-chinh-ca-nhan-cho-founder";
const PRICE_VND = 498526;
const TOTAL_VALUE_VND = 4_950_000;

const BRAND = "#2563EB";
const BRAND_HI = "#3B82F6";
const PAIN = "#ef4444";
const PROMISE = "#22c55e";

const BIG_PROMISES = [
  "Biết mình còn sống được bao lâu nếu doanh thu giảm.",
  "Biết mỗi tháng cần bao nhiêu tiền để nuôi bản thân, gia đình và doanh nghiệp.",
  "Biết nên giữ tiền, rút tiền, tái đầu tư hay cắt chi phí ở đâu.",
];

interface ValueItem {
  name: string;
  value: number;
  desc: string;
  icon: typeof Wallet;
  bonus?: boolean;
}

const VALUE_STACK: ValueItem[] = [
  {
    name: "Khóa Founder Money Reset™ 7 ngày",
    value: 1_500_000,
    desc: "Lộ trình ngắn, tập trung đúng việc: giúp founder có bản đồ tài chính cá nhân cơ bản, không lan man sang đầu tư, bảo hiểm, thuế hay chiến lược tài sản dài hạn.",
    icon: Wallet,
  },
  {
    name: "Bộ Founder Personal Finance Sheet™",
    value: 790_000,
    desc: "File mẫu để nhập thu nhập, chi phí, nợ, tiền mặt, dòng tiền cá nhân và dòng tiền hỗ trợ doanh nghiệp. Không phải Excel kế toán phức tạp — đây là bảng điều khiển tài chính dành riêng cho người đang khởi nghiệp.",
    icon: FileSpreadsheet,
  },
  {
    name: "Bài tập Founder Survival Number™",
    value: 490_000,
    desc: "Biết chính xác mỗi tháng cần tối thiểu bao nhiêu tiền để sống · doanh nghiệp cần tạo ra bao nhiêu để không gây áp lực lên đời sống cá nhân · khoản nào là chi phí sống thật, sĩ diện, hay nuôi business.",
    icon: Calculator,
  },
  {
    name: "Checklist tách bạch tiền cá nhân & kinh doanh",
    value: 390_000,
    desc: "Tránh lỗi kinh điển — một tài khoản dùng cho mọi thứ. Biết nên tách những khoản nào, theo dõi ra sao, rút tiền từ business thế nào, khi nào không nên bơm thêm tiền cá nhân vào doanh nghiệp.",
    icon: ListChecks,
  },
  {
    name: "Founder Cash Leak Audit™",
    value: 690_000,
    desc: "Bộ câu hỏi tự kiểm tra 10 điểm rò rỉ tiền phổ biến của founder: chi phí công cụ, nhân sự part-time, quảng cáo thử sai, thuê ngoài cảm tính, chi tiêu gia đình không kiểm soát, vay mượn nhỏ lẻ.",
    icon: Search,
    bonus: true,
  },
  {
    name: "30-Day Money Decision Template™",
    value: 590_000,
    desc: "Mẫu ra quyết định trong 30 ngày: khoản nào giữ · khoản nào cắt · khoản nào hoãn · khoản nào được phép đầu tư tiếp · khoản nào phải dừng ngay.",
    icon: ListChecks,
    bonus: true,
  },
  {
    name: "Founder Money Talk Script™",
    value: 490_000,
    desc: "Kịch bản nói chuyện với vợ/chồng/gia đình/đồng sáng lập về tiền bạc mà không gây căng thẳng. Vì nhiều founder không thiếu kiến thức tài chính — họ thiếu một cách nói rõ ràng để người thân hiểu và ủng hộ.",
    icon: MessageCircle,
    bonus: true,
  },
];

const FOR_AUDIENCE = [
  "Founder giai đoạn 0–3 năm",
  "Solopreneur, freelancer, coach, consultant, chủ shop, chủ dịch vụ nhỏ",
  "Người đang lấy tiền cá nhân nuôi business",
  "Người chưa tách bạch tiền cá nhân và tiền kinh doanh",
  "Người muốn vào các sản phẩm cao hơn nhưng cần bước nền trước",
];

const NOT_FOR_AUDIENCE = [
  "Người muốn học đầu tư chứng khoán, crypto, bất động sản",
  "Người muốn làm giàu nhanh",
  "Người chỉ muốn xem video nhưng không làm bài tập",
  "Người chưa sẵn sàng nhìn thẳng vào tình trạng tiền bạc thật của mình",
];

function vnd(n: number): string {
  return n.toLocaleString("vi-VN");
}

export default function FounderMoneyResetSalepage() {
  const courseUrl = `/courses/${COURSE_SLUG}`;

  return (
    <article
      className="mt-12 sm:mt-16 rounded-3xl overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.06), transparent 60%), #0a0a0a",
        border: "1px solid #2a2a2a",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
      }}
    >
      {/* ═══════════ 1. GIFT HERO ═══════════ */}
      <section
        className="relative px-6 sm:px-12 pt-8 sm:pt-10 pb-6 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(251,191,36,0.04) 100%)",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        <div
          className="absolute -top-32 -right-32 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND}26, transparent 70%)` }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND}1a, transparent 70%)` }}
        />

        <div className="relative">
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto mb-5 leading-relaxed">
            Để cải thiện tình hình sức khỏe tài chính của anh/chị, VINEN
            có một món quà đặc biệt dành tặng:
          </p>
          <h2
            className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3"
            style={{
              background: `linear-gradient(135deg, ${BRAND_HI}, ${BRAND})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Founder Money Reset™
          </h2>
          <p className="text-sm sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Khoá hoạch định tài chính cá nhân cho nhà khởi nghiệp muốn tách bạch
            tiền cá nhân – tiền kinh doanh, hết mơ hồ dòng tiền và có một bản kế
            hoạch tài chính đủ rõ để ra quyết định.
          </p>
        </div>
      </section>

      {/* ═══════════ 2. BIG PROMISE ═══════════ */}
      <section className="px-6 sm:px-12 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
              style={{ background: `${PROMISE}1a`, color: PROMISE, border: `1px solid ${PROMISE}55` }}
            >
              <Sparkles size={11} />
              Chương trình giúp anh/chị
            </div>
            <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-snug">
              Bản đồ tài chính cá nhân của founder
            </h3>
          </div>

          <ul className="space-y-3">
            {BIG_PROMISES.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{ background: "#141414", border: "1px solid #232323" }}
              >
                <CheckCircle2
                  size={20}
                  className="shrink-0 mt-0.5"
                  style={{ color: PROMISE }}
                />
                <span className="text-sm sm:text-base text-gray-200 leading-relaxed">
                  {p}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-center"
            style={{ color: "#9ca3af" }}
          >
            {[
              "Không cần giỏi tài chính",
              "Không cần biết Excel phức tạp",
              "Không cần lý thuyết đầu tư dài dòng",
            ].map((t) => (
              <div
                key={t}
                className="px-3 py-2 rounded-lg text-[11px] sm:text-xs font-medium"
                style={{ background: "#0e0e0e", border: "1px solid #1f1f1f" }}
              >
                <Lock size={11} className="inline-block mr-1.5 -mt-0.5" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VALUE STACK ═══════════ */}
      <section className="px-6 sm:px-12 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: `${BRAND}1a`, color: BRAND, border: `1px solid ${BRAND}55` }}
            >
              <Receipt size={11} />
              Giá trị chương trình
            </div>
          </div>

          <div className="space-y-3">
            {VALUE_STACK.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 sm:p-5"
                  style={{
                    background: item.bonus
                      ? `linear-gradient(135deg, ${PROMISE}0a, transparent)`
                      : "#141414",
                    border: item.bonus
                      ? `1px dashed ${PROMISE}55`
                      : "1px solid #232323",
                  }}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div
                      className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
                      style={{
                        background: item.bonus ? `${PROMISE}1a` : `${BRAND}1a`,
                        color: item.bonus ? PROMISE : BRAND,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.bonus && (
                            <span
                              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                              style={{
                                background: `${PROMISE}22`,
                                color: PROMISE,
                              }}
                            >
                              🎁 BONUS
                            </span>
                          )}
                          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                            {item.name}
                          </h4>
                        </div>
                        <span
                          className="text-xs sm:text-sm font-extrabold whitespace-nowrap"
                          style={{ color: item.bonus ? PROMISE : BRAND }}
                        >
                          {vnd(item.value)}đ
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total value vs price */}
          <div
            className="mt-7 rounded-2xl p-5 sm:p-7"
            style={{
              background: `linear-gradient(135deg, ${BRAND}1a, transparent)`,
              border: `1px solid ${BRAND}55`,
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-center sm:text-left">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                  Tổng giá trị thực nhận
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-gray-500 text-xl sm:text-2xl line-through font-bold">
                    {vnd(TOTAL_VALUE_VND)}đ
                  </span>
                  <ArrowRight size={18} className="text-gray-600" />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 mt-3">
                  Giá tham gia
                </div>
                <div
                  className="text-3xl sm:text-4xl font-extrabold"
                  style={{ color: BRAND }}
                >
                  {vnd(PRICE_VND)}đ
                </div>
              </div>

              <div
                className="px-4 py-3 rounded-xl text-center"
                style={{
                  background: `${PROMISE}1a`,
                  border: `1px solid ${PROMISE}55`,
                  color: PROMISE,
                }}
              >
                <ShieldCheck size={22} className="mx-auto mb-1" />
                <div className="text-sm font-extrabold leading-tight">
                  Hoàn lại 100%
                </div>
                <div className="text-[10px] mt-0.5 leading-tight">
                  Khi hoàn thành bài tập
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOR / NOT FOR ═══════════ */}
      <section className="px-6 sm:px-12 py-6 sm:py-8" style={{ background: "#0e0e0e" }}>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-xl sm:text-3xl font-extrabold text-white leading-snug mb-8">
            Sản phẩm này dành cho ai?
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: `linear-gradient(180deg, ${PROMISE}0a, transparent)`,
                border: `1px solid ${PROMISE}55`,
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
                style={{ background: `${PROMISE}22`, color: PROMISE }}
              >
                <CheckCircle2 size={11} />
                Phù hợp với
              </div>
              <ul className="space-y-2.5">
                {FOR_AUDIENCE.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-200 leading-relaxed"
                  >
                    <CheckCircle2
                      size={15}
                      className="shrink-0 mt-0.5"
                      style={{ color: PROMISE }}
                    />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{
                background: `linear-gradient(180deg, ${PAIN}0a, transparent)`,
                border: `1px solid ${PAIN}55`,
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
                style={{ background: `${PAIN}22`, color: PAIN }}
              >
                <XCircle size={11} />
                Không phù hợp với
              </div>
              <ul className="space-y-2.5">
                {NOT_FOR_AUDIENCE.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed"
                  >
                    <XCircle
                      size={15}
                      className="shrink-0 mt-0.5"
                      style={{ color: PAIN }}
                    />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 9. CLOSING + FINAL CTA ═══════════ */}
      <section
        className="px-6 sm:px-12 py-8 sm:py-12 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(37,99,235,0.08))",
          borderTop: "1px solid #2a2a2a",
        }}
      >
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${BRAND}26, transparent 70%)` }}
        />

        <div className="relative max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-5">
            Founder Money Reset™ là chương trình 7 ngày giúp nhà khởi nghiệp
            nhìn rõ tài chính cá nhân, tách bạch tiền cá nhân – tiền kinh doanh
            và lập kế hoạch tài chính 30 ngày để{" "}
            <strong className="text-white">
              không còn ra quyết định trong mơ hồ
            </strong>
            .
          </p>

          <h3 className="text-xl sm:text-3xl font-extrabold text-white leading-snug mb-3">
            Đây không phải khoá học để{" "}
            <span className="italic text-gray-500">&ldquo;biết thêm&rdquo;</span>.
          </h3>
          <p
            className="text-base sm:text-xl font-extrabold leading-snug mb-9"
            style={{ color: BRAND }}
          >
            Đây là bài kiểm tra đầu tiên xem anh/chị có đủ kỷ luật tài chính
            <br className="hidden sm:block" />
            để đi tiếp với doanh nghiệp của mình hay không.
          </p>

          <Link
            href={courseUrl}
            className="inline-flex items-center justify-center gap-2 px-7 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-extrabold text-black transition-transform hover:scale-[1.03]"
            style={{
              background: `linear-gradient(135deg, ${BRAND_HI}, ${BRAND})`,
              boxShadow: `0 12px 36px ${BRAND}66`,
            }}
          >
            <ShieldCheck size={20} />
            Bắt đầu Money Reset — Hoàn Tiền 100%
            <ArrowRight size={20} />
          </Link>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
            <span>Đặt cọc {vnd(PRICE_VND)}đ</span>
            <span className="text-gray-700">·</span>
            <span style={{ color: PROMISE }}>Hoàn Tiền 100% khi hoàn thành</span>
            <span className="text-gray-700">·</span>
            <span>7 ngày · trực tuyến</span>
          </div>

          <div className="mt-3 text-[11px] text-gray-600">
            <Link
              href="/pricing"
              className="underline hover:text-[#2563EB] transition-colors"
            >
              So sánh với gói Nâng Cao &amp; Toàn Diện →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
