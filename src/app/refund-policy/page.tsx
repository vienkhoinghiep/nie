import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Chính Sách Hoàn Tiền | ${siteConfig.name}`,
  description: `Chính sách hoàn tiền khi mua khoá học trên ${siteConfig.name} — cam kết hoàn tiền 100% trong 7 ngày đầu nếu chưa học quá 30% nội dung khoá.`,
  alternates: {
    canonical: `https://${siteConfig.domain}/refund-policy`,
  },
  openGraph: {
    title: `Chính Sách Hoàn Tiền — ${siteConfig.name}`,
    description: `Cam kết hoàn tiền 7 ngày khi mua khoá học trên ${siteConfig.name}`,
  },
};

const sections = [
  {
    id: "cam-ket",
    title: "1. Cam kết của chúng tôi",
    content: [
      `${siteConfig.name} cam kết mang đến trải nghiệm học tập tài chính cá nhân chất lượng cho mọi nhà khởi nghiệp. Chúng tôi hiểu rằng đôi khi khoá học có thể chưa phù hợp với giai đoạn hoặc nhu cầu hiện tại của bạn, vì vậy chúng tôi áp dụng chính sách hoàn tiền minh bạch và công bằng dưới đây.`,
      `Chính sách này áp dụng cho tất cả khoá học có trả phí được mua trực tiếp trên nền tảng ${siteConfig.domain}.`,
    ],
  },
  {
    id: "dieu-kien",
    title: "2. Điều kiện hoàn tiền 100%",
    content: [
      "Bạn được hoàn lại 100% học phí khi đáp ứng ĐỒNG THỜI cả ba điều kiện sau:",
    ],
    list: [
      "Yêu cầu hoàn tiền được gửi trong vòng 7 ngày kể từ ngày thanh toán thành công",
      "Bạn đã hoàn thành DƯỚI 30% nội dung khoá học (tính theo số bài học/video đã xem trong hệ thống tracking)",
      "Tài khoản không vi phạm Điều khoản Sử dụng — không có hành vi chia sẻ tài khoản, tải xuống trái phép hoặc lạm dụng hệ thống hoàn tiền",
    ],
    extra: [
      "Thời hạn 7 ngày được tính từ thời điểm thanh toán thành công (theo email xác nhận đơn hàng), không phải từ lần đăng nhập đầu tiên hay lần xem bài học đầu tiên.",
    ],
  },
  {
    id: "khong-hoan-tien",
    title: "3. Trường hợp KHÔNG hoàn tiền",
    content: [
      "Chúng tôi không thực hiện hoàn tiền trong các trường hợp sau:",
    ],
    list: [
      "Yêu cầu gửi sau 7 ngày kể từ ngày thanh toán",
      "Đã học từ 30% nội dung khoá học trở lên",
      "Khoá học miễn phí, khoá học tặng kèm, hoặc nhận qua chương trình giới thiệu/đối tác",
      "Gói thành viên theo tháng (membership) đã được kích hoạt và sử dụng trong tháng đó — chúng tôi chỉ ngừng gia hạn cho các kỳ tiếp theo",
      "Đã được cấp chứng nhận hoàn thành khoá học",
      "Vi phạm Điều khoản Sử dụng: chia sẻ tài khoản, ghi màn hình, phân phối tài liệu khoá học, dùng nội dung huấn luyện AI",
      "Lý do không liên quan đến chất lượng dịch vụ — ví dụ: thay đổi ý định, không có thời gian học, kỳ vọng cá nhân khác với mô tả khoá học đã công bố",
    ],
    extra: [
      "Lưu ý: Việc bạn không hài lòng với kết quả tài chính cá nhân sau khi áp dụng kiến thức khoá học KHÔNG phải lý do hoàn tiền — vì kết quả tài chính phụ thuộc vào hoàn cảnh riêng, kỷ luật thực thi và nhiều yếu tố nằm ngoài tầm kiểm soát của chúng tôi (xem chi tiết tại Mục 2 Điều khoản Sử dụng).",
    ],
  },
  {
    id: "loi-ky-thuat",
    title: "4. Trường hợp ngoại lệ: lỗi kỹ thuật từ nền tảng",
    content: [
      "Sau 7 ngày, chúng tôi vẫn xem xét hoàn tiền nếu bạn gặp các sự cố kỹ thuật nghiêm trọng phía nền tảng mà chúng tôi không thể khắc phục trong thời gian hợp lý:",
    ],
    list: [
      "Video khoá học bị lỗi không thể phát sau khi đã liên hệ hỗ trợ và chờ xử lý quá 7 ngày làm việc",
      "Mất quyền truy cập khoá học do lỗi hệ thống không khôi phục được",
      "Khoá học bị gỡ khỏi nền tảng mà không có thông báo trước hoặc không có khoá thay thế tương đương",
      "Nội dung khoá học sai lệch nghiêm trọng so với mô tả công khai tại trang bán khoá",
    ],
    extra: [
      "Trong các trường hợp này, mức hoàn tiền được tính theo tỷ lệ thuận với phần nội dung bạn chưa thể tiếp cận, hoặc 100% nếu lỗi xảy ra ngay từ đầu.",
    ],
  },
  {
    id: "quy-trinh",
    title: "5. Quy trình yêu cầu hoàn tiền",
    content: [
      "Để yêu cầu hoàn tiền, vui lòng thực hiện theo các bước dưới đây:",
    ],
    list: [
      'Bước 1: Gửi email tới info@yourdomain.com với tiêu đề "[REFUND] - Tên khoá học - Họ tên của bạn"',
      "Bước 2: Cung cấp đầy đủ thông tin trong email: họ tên, email tài khoản học viên, mã đơn hàng (trong email xác nhận thanh toán), tên khoá học cần hoàn tiền, và lý do yêu cầu",
      "Bước 3: Đội ngũ hỗ trợ xác minh thông tin, kiểm tra tiến độ học và đối chiếu điều kiện hoàn tiền trong vòng 2 ngày làm việc",
      "Bước 4: Bạn nhận email phản hồi kết quả (chấp nhận hoặc từ chối kèm lý do cụ thể)",
      "Bước 5: Nếu được chấp nhận, hoàn tiền sẽ được xử lý qua phương thức thanh toán ban đầu trong 5-7 ngày làm việc",
    ],
  },
  {
    id: "thoi-gian",
    title: "6. Thời gian xử lý",
    content: [
      "Tổng thời gian từ khi gửi yêu cầu đến khi tiền về tài khoản của bạn:",
    ],
    list: [
      "Xác minh và đối soát: 1-2 ngày làm việc",
      "Xử lý hoàn tiền sau khi được chấp nhận: 5-7 ngày làm việc",
      "Thời gian tiền về tài khoản: tuỳ ngân hàng/cổng thanh toán, thường thêm 1-3 ngày làm việc",
    ],
    extra: [
      "Tổng thời gian thông thường không quá 10-12 ngày làm việc. Nếu quá thời hạn này, vui lòng liên hệ lại qua email info@yourdomain.com để được kiểm tra.",
    ],
  },
  {
    id: "phuong-thuc",
    title: "7. Phương thức hoàn tiền",
    content: [
      "Tiền hoàn được chuyển trả theo đúng phương thức thanh toán ban đầu:",
    ],
    list: [
      "Chuyển khoản ngân hàng: hoàn vào tài khoản đã chuyển khoản đến chúng tôi",
      "Cổng thanh toán trực tuyến (PayOS, VNPay, MoMo...): hoàn qua hệ thống cổng thanh toán về tài khoản/thẻ ban đầu",
    ],
    extra: [
      "Số tiền hoàn là 100% giá trị thực bạn đã thanh toán (sau khi đã trừ giảm giá, mã coupon nếu có). Phí giao dịch ngân hàng (nếu phát sinh) do nền tảng chi trả — bạn nhận đủ số tiền hoàn.",
    ],
  },
  {
    id: "thay-doi",
    title: "8. Thay đổi chính sách",
    content: [
      "Chúng tôi có thể cập nhật chính sách hoàn tiền này. Mọi thay đổi sẽ được đăng tải tại trang này kèm ngày cập nhật. Đơn hàng được thanh toán trước ngày thay đổi vẫn áp dụng theo chính sách tại thời điểm đó.",
    ],
  },
  {
    id: "lien-he",
    title: "9. Liên hệ hỗ trợ hoàn tiền",
    content: [
      "Mọi câu hỏi, khiếu nại hoặc yêu cầu hỗ trợ liên quan đến hoàn tiền, vui lòng liên hệ:",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "radial-gradient(ellipse at top, #0d1117 0%, #0a0a0a 60%)" }}
    >
      {/* Header */}
      <div className="border-b border-[#1a1a1a] px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] hover:text-[#e6be5a] transition-colors mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Quay về trang chủ
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Chính Sách Hoàn Tiền
          </h1>
          <p className="text-gray-400 text-sm">
            Cập nhật lần cuối: 22/05/2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Promise card */}
          <div className="rounded-xl border border-[#2563EB]/30 bg-gradient-to-br from-[#2563EB]/5 to-transparent p-6">
            <p className="text-base sm:text-lg text-white font-semibold mb-2">
              Cam kết hoàn tiền 7 ngày
            </p>
            <p className="text-gray-300 leading-relaxed">
              Hoàn tiền 100% trong vòng 7 ngày đầu nếu khoá học chưa phù hợp với
              bạn — với điều kiện chưa học quá 30% nội dung. Đây là cam kết của
              chúng tôi để bạn yên tâm bắt đầu hành trình tài chính cá nhân.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Mục lục
            </h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-[#2563EB] hover:text-[#e6be5a] transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sections */}
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
                {section.title}
              </h2>

              {section.content?.map((paragraph, i) => (
                <p key={i} className="text-gray-300 leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}

              {section.list && (
                <ul className="space-y-2 my-4 ml-1">
                  {section.list.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-gray-300 leading-relaxed"
                    >
                      <span className="text-[#2563EB] mt-1.5 shrink-0">
                        <svg
                          width="6"
                          height="6"
                          viewBox="0 0 6 6"
                          fill="currentColor"
                        >
                          <circle cx="3" cy="3" r="3" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.extra?.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-gray-400 leading-relaxed mb-3 text-sm italic"
                >
                  {paragraph}
                </p>
              ))}

              {/* Contact info for the last section */}
              {section.id === "lien-he" && (
                <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5 mt-4 space-y-3">
                  <p className="text-gray-300">
                    <span className="text-gray-500">Nền tảng:</span>{" "}
                    <span className="text-white font-medium">
                      {siteConfig.name}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Website:</span>{" "}
                    <Link
                      href="/"
                      className="text-[#2563EB] hover:underline"
                    >
                      {siteConfig.domain}
                    </Link>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Email hỗ trợ:</span>{" "}
                    <a
                      href="mailto:info@yourdomain.com"
                      className="text-[#2563EB] hover:underline"
                    >
                      info@yourdomain.com
                    </a>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Thời gian phản hồi:</span>{" "}
                    <span className="text-white font-medium">
                      Thứ 2 - Thứ 6, 9:00 - 18:00 (GMT+7)
                    </span>
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Related links */}
          <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row gap-3">
            <Link
              href="/terms"
              className="text-sm text-[#2563EB] hover:underline"
            >
              Điều khoản sử dụng &rarr;
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-[#2563EB] hover:underline"
            >
              Chính sách bảo mật &rarr;
            </Link>
            <Link
              href="/"
              className="text-sm text-[#2563EB] hover:underline"
            >
              &larr; Quay về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
