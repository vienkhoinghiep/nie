import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Chính Sách Bảo Mật | ${siteConfig.name}`,
  description: `Chính sách bảo mật và bảo vệ dữ liệu cá nhân của ${siteConfig.name} — tuân thủ Luật An ninh mạng 2018 và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.`,
  alternates: {
    canonical: `https://${siteConfig.domain}/privacy`,
  },
  openGraph: {
    title: `Chính Sách Bảo Mật — ${siteConfig.name}`,
    description: `Chính sách bảo mật và bảo vệ dữ liệu cá nhân của nền tảng ${siteConfig.name}`,
  },
};

const sections = [
  {
    id: "thu-thap",
    title: "1. Thông tin chúng tôi thu thập",
    content: [
      `Khi bạn sử dụng nền tảng ${siteConfig.domain}, chúng tôi thu thập các loại thông tin cá nhân sau đây, phù hợp với quy định tại Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân:`,
    ],
    subsections: [
      {
        label: "a) Thông tin bạn cung cấp trực tiếp:",
        items: [
          "Họ và tên đầy đủ",
          "Địa chỉ email",
          "Số điện thoại (nếu cung cấp)",
          "Thông tin về doanh nghiệp/dự án khởi nghiệp (tuỳ chọn, dùng để cá nhân hoá nội dung tư vấn)",
          "Thông tin thanh toán được xử lý hoàn toàn qua cổng thanh toán bên thứ ba — chúng tôi KHÔNG lưu trữ số thẻ ngân hàng, mã CVV hay số tài khoản",
        ],
      },
      {
        label: "b) Thông tin thu thập tự động (hành vi học tập):",
        items: [
          "Lịch sử học tập: khoá học đã đăng ký, tiến độ hoàn thành bài học, kết quả bài kiểm tra/quiz",
          "Dữ liệu sử dụng: tần suất truy cập, thời lượng xem video, tương tác trong cộng đồng",
          "Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, hệ điều hành, thiết bị truy cập",
          "Dữ liệu cookie và mã theo dõi (xem Mục 5)",
        ],
      },
    ],
  },
  {
    id: "muc-dich",
    title: "2. Mục đích sử dụng thông tin",
    content: [
      "Chúng tôi chỉ xử lý dữ liệu cá nhân của bạn với mục đích rõ ràng và chính đáng:",
    ],
    subsections: [
      {
        label: "a) Cung cấp dịch vụ đào tạo:",
        items: [
          "Tạo và quản lý tài khoản học viên",
          "Cấp quyền truy cập khoá học đã đăng ký",
          "Theo dõi tiến độ học tập và cấp chứng nhận hoàn thành",
          "Xử lý đơn hàng, hoá đơn và yêu cầu hoàn tiền",
        ],
      },
      {
        label: "b) Cải thiện trải nghiệm học:",
        items: [
          "Phân tích hành vi học tập để tối ưu nội dung và lộ trình",
          "Đề xuất khoá học phù hợp với giai đoạn tài chính của bạn",
          "Phát triển tính năng và nội dung mới đáp ứng nhu cầu học viên",
        ],
      },
      {
        label: "c) Truyền thông và hỗ trợ:",
        items: [
          "Gửi email xác nhận đăng ký, thông báo bài học mới, nhắc nhở học tập",
          "Gửi nội dung giáo dục, bản tin tài chính, ưu đãi khoá học (bạn có thể huỷ đăng ký bất cứ lúc nào qua link unsubscribe)",
          "Phản hồi câu hỏi và yêu cầu hỗ trợ qua email info@yourdomain.com",
        ],
      },
      {
        label: "d) An ninh và pháp lý:",
        items: [
          "Phát hiện và ngăn chặn gian lận, truy cập trái phép, chia sẻ tài khoản",
          "Tuân thủ Luật An ninh mạng 2018 và các yêu cầu pháp lý hiện hành",
        ],
      },
    ],
  },
  {
    id: "luu-tru",
    title: "3. Nơi lưu trữ dữ liệu",
    content: [
      "Để vận hành Nền tảng, chúng tôi sử dụng các nhà cung cấp hạ tầng đám mây đạt chuẩn bảo mật quốc tế:",
    ],
    list: [
      "Supabase (khu vực Singapore — ap-southeast-1): cơ sở dữ liệu chính, xác thực người dùng, quản lý phiên đăng nhập",
      "Vercel: hosting nền tảng web, xử lý yêu cầu HTTP qua mạng CDN toàn cầu",
      "Dịch vụ gửi email giao dịch (Resend / Amazon SES): gửi email xác nhận, thông báo, hỗ trợ",
      "Cloudflare: bảo mật, chống tấn công DDoS và tối ưu hiệu suất",
    ],
    extra: [
      "Tất cả nhà cung cấp dịch vụ trên đều tuân thủ các tiêu chuẩn bảo mật quốc tế (SOC 2, ISO 27001) và có cam kết bảo vệ dữ liệu (DPA) phù hợp.",
      "Chúng tôi không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại. Chỉ chia sẻ dữ liệu khi được yêu cầu bởi cơ quan nhà nước có thẩm quyền theo quy định pháp luật.",
    ],
  },
  {
    id: "bao-mat",
    title: "4. Biện pháp bảo mật",
    content: [
      "Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn:",
    ],
    subsections: [
      {
        label: "a) Biện pháp kỹ thuật:",
        items: [
          "Mã hoá toàn bộ dữ liệu truyền tải qua HTTPS (TLS 1.3)",
          "Supabase Row Level Security (RLS): mỗi học viên chỉ truy cập được dữ liệu của chính mình",
          "Mật khẩu được băm bằng thuật toán bcrypt, không bao giờ lưu dưới dạng văn bản",
          "Xác thực hai yếu tố (2FA) cho tài khoản quản trị nội bộ",
          "Sao lưu dữ liệu định kỳ và quy trình khôi phục sau sự cố",
        ],
      },
      {
        label: "b) Biện pháp tổ chức:",
        items: [
          "Giới hạn quyền truy cập dữ liệu — chỉ nhân sự được uỷ quyền mới có thể truy cập",
          "Giám sát hệ thống liên tục để phát hiện sớm mối đe doạ",
          "Đánh giá và cập nhật quy trình bảo mật định kỳ",
        ],
      },
    ],
  },
  {
    id: "cookie",
    title: "5. Cookie và công nghệ theo dõi",
    content: [
      "Nền tảng sử dụng cookie và các công nghệ tương tự để cải thiện trải nghiệm của bạn:",
    ],
    subsections: [
      {
        label: "a) Loại cookie chúng tôi dùng:",
        items: [
          "Cookie phiên (session): duy trì trạng thái đăng nhập, tự động xoá khi đóng trình duyệt",
          "Cookie thiết yếu: bảo mật phiên làm việc, ngăn chặn CSRF",
          "Cookie phân tích (analytics): thu thập dữ liệu ẩn danh về cách bạn sử dụng nền tảng — dùng để cải thiện sản phẩm",
          "Cookie ưu tiên: ghi nhớ ngôn ngữ, theme và cài đặt giao diện",
        ],
      },
      {
        label: "b) Quản lý cookie:",
        items: [
          "Bạn có thể từ chối cookie phân tích thông qua banner đồng ý cookie hoặc cài đặt trình duyệt",
          "Vô hiệu hoá cookie thiết yếu có thể khiến một số tính năng không hoạt động đầy đủ",
          "Bạn có thể xoá cookie đã lưu bất cứ lúc nào từ trình duyệt",
        ],
      },
    ],
  },
  {
    id: "quyen",
    title: "6. Quyền của bạn đối với dữ liệu cá nhân",
    content: [
      "Theo Nghị định 13/2023/NĐ-CP, bạn có đầy đủ các quyền sau đối với dữ liệu cá nhân của mình:",
    ],
    list: [
      "Quyền được biết: được thông báo về việc thu thập, xử lý dữ liệu cá nhân",
      "Quyền truy cập: xem toàn bộ dữ liệu cá nhân chúng tôi đang lưu trữ về bạn",
      "Quyền chỉnh sửa: yêu cầu sửa thông tin không chính xác hoặc chưa cập nhật",
      "Quyền xoá: yêu cầu xoá vĩnh viễn dữ liệu cá nhân khỏi hệ thống (trừ dữ liệu phải lưu theo yêu cầu pháp luật như hoá đơn kế toán)",
      "Quyền hạn chế xử lý: yêu cầu ngừng xử lý dữ liệu trong một số trường hợp",
      "Quyền phản đối: phản đối việc dùng dữ liệu cho mục đích tiếp thị trực tiếp",
      "Quyền rút lại sự đồng ý đã cung cấp trước đó bất cứ lúc nào",
      "Quyền di chuyển dữ liệu: nhận bản sao dữ liệu của bạn ở định dạng máy đọc được",
      "Quyền khiếu nại đến cơ quan có thẩm quyền nếu bạn cho rằng quyền của mình bị vi phạm",
    ],
    extra: [
      "Để thực hiện bất kỳ quyền nào nêu trên, vui lòng gửi yêu cầu tới email info@yourdomain.com kèm thông tin xác minh danh tính. Chúng tôi sẽ phản hồi trong vòng 72 giờ và xử lý hoàn tất trong vòng 30 ngày kể từ ngày nhận yêu cầu hợp lệ.",
    ],
  },
  {
    id: "thoi-han",
    title: "7. Thời gian lưu trữ dữ liệu",
    content: [
      "Chúng tôi chỉ lưu trữ dữ liệu cá nhân trong thời gian cần thiết cho mục đích đã thông báo:",
    ],
    list: [
      "Dữ liệu tài khoản (tên, email, SĐT): trong suốt thời gian tài khoản còn hoạt động và 30 ngày sau khi yêu cầu xoá",
      "Lịch sử học tập và chứng nhận: trong suốt thời gian tài khoản hoạt động để đảm bảo quyền truy cập khoá học",
      "Dữ liệu thanh toán và hoá đơn: lưu trữ tối thiểu 10 năm theo Luật Kế toán Việt Nam",
      "Nhật ký truy cập (IP, User-Agent): tối đa 12 tháng phục vụ bảo mật",
      "Dữ liệu cookie phân tích: tối đa 26 tháng",
    ],
    extra: [
      "Sau khi hết thời gian lưu trữ, dữ liệu sẽ được xoá vĩnh viễn hoặc ẩn danh hoá để không thể nhận dạng cá nhân.",
    ],
  },
  {
    id: "tre-em",
    title: "8. Dữ liệu của trẻ em",
    content: [
      "Nền tảng phục vụ đối tượng học viên từ 16 tuổi trở lên. Chúng tôi không chủ động thu thập dữ liệu của trẻ em dưới 16 tuổi. Nếu phát hiện đã vô tình thu thập dữ liệu của trẻ em dưới 16 tuổi mà không có sự đồng ý của cha mẹ/người giám hộ, chúng tôi sẽ xoá dữ liệu đó ngay lập tức. Cha mẹ/người giám hộ phát hiện trường hợp này vui lòng liên hệ qua email để chúng tôi xử lý.",
    ],
  },
  {
    id: "thay-doi",
    title: "9. Thay đổi chính sách bảo mật",
    content: [
      "Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian để phản ánh thay đổi trong hoạt động hoặc yêu cầu pháp lý mới. Khi có thay đổi quan trọng, chúng tôi sẽ:",
    ],
    list: [
      "Thông báo qua email đã đăng ký ít nhất 7 ngày trước khi thay đổi có hiệu lực",
      "Đăng thông báo rõ ràng trên Nền tảng",
      'Cập nhật ngày "Cập nhật lần cuối" ở đầu trang chính sách',
    ],
  },
  {
    id: "lien-he",
    title: "10. Liên hệ về dữ liệu cá nhân",
    content: [
      "Nếu bạn có câu hỏi, yêu cầu hoặc khiếu nại liên quan đến chính sách bảo mật hoặc cách chúng tôi xử lý dữ liệu cá nhân, vui lòng liên hệ:",
    ],
  },
];

export default function PrivacyPage() {
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Quay về trang chủ
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Chính Sách Bảo Mật
          </h1>
          <p className="text-gray-400 text-sm">
            Cập nhật lần cuối: 22/05/2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Introduction */}
          <div className="space-y-3">
            <p className="text-gray-300 leading-relaxed">
              Chào mừng bạn đến với{" "}
              <span className="text-white font-medium">{siteConfig.domain}</span>{" "}
              — học viện đào tạo tư vấn tài chính cá nhân cho nhà khởi nghiệp,
              vận hành bởi{" "}
              <span className="text-white font-medium">{siteConfig.name}</span>.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Chúng tôi hiểu rằng dữ liệu tài chính và thông tin cá nhân là điều
              rất nhạy cảm, đặc biệt với nhà khởi nghiệp đang xây dựng cơ đồ.
              Chính sách này được xây dựng phù hợp với{" "}
              <span className="text-white font-medium">
                Luật An ninh mạng 2018
              </span>{" "}
              (Luật số 24/2018/QH14) và{" "}
              <span className="text-white font-medium">
                Nghị định 13/2023/NĐ-CP
              </span>{" "}
              về bảo vệ dữ liệu cá nhân, nhằm giải thích minh bạch cách chúng
              tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu của bạn.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Bằng việc truy cập và sử dụng Nền tảng, bạn xác nhận đã đọc, hiểu
              và đồng ý với các điều khoản trong chính sách này.
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

              {/* Simple list */}
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

              {/* Subsections with lettered labels */}
              {section.subsections?.map((sub, si) => (
                <div key={si} className="mb-5">
                  <h3 className="text-sm font-semibold text-white mb-2 mt-4">
                    {sub.label}
                  </h3>
                  <ul className="space-y-2 ml-1">
                    {sub.items.map((item, ii) => (
                      <li
                        key={ii}
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
                </div>
              ))}

              {section.extra?.map((paragraph, i) => (
                <p key={i} className="text-gray-300 leading-relaxed mb-3">
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
                    <span className="text-gray-500">
                      Người chịu trách nhiệm bảo vệ dữ liệu (DPO):
                    </span>{" "}
                    <span className="text-white font-medium">
                      Ban quản trị {siteConfig.name}
                    </span>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Email liên hệ:</span>{" "}
                    <a
                      href="mailto:info@yourdomain.com"
                      className="text-[#2563EB] hover:underline"
                    >
                      info@yourdomain.com
                    </a>
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-500">Website:</span>{" "}
                    <Link href="/" className="text-[#2563EB] hover:underline">
                      {siteConfig.domain}
                    </Link>
                  </p>
                  <p className="text-gray-300 text-sm pt-1">
                    Khi gửi yêu cầu, vui lòng ghi rõ tiêu đề email theo định
                    dạng:{" "}
                    <span className="text-white">
                      [DATA REQUEST] - Loại yêu cầu - Họ tên
                    </span>
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Legal basis note */}
          <div className="rounded-xl border border-[#1a1a1a] bg-[#111] p-5">
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-white font-medium">Cơ sở pháp lý:</span>{" "}
              Chính sách bảo mật này được xây dựng tuân thủ Luật An ninh mạng
              2018 (Luật số 24/2018/QH14), Nghị định 13/2023/NĐ-CP về bảo vệ
              dữ liệu cá nhân, và các quy định pháp luật liên quan của nước
              Cộng hoà Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh sẽ
              được giải quyết theo pháp luật Việt Nam.
            </p>
          </div>

          {/* Related links */}
          <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row gap-3">
            <Link
              href="/terms"
              className="text-sm text-[#2563EB] hover:underline"
            >
              Điều khoản sử dụng &rarr;
            </Link>
            <Link
              href="/refund-policy"
              className="text-sm text-[#2563EB] hover:underline"
            >
              Chính sách hoàn tiền &rarr;
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
