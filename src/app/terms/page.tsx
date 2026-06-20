import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Điều Khoản Sử Dụng | ${siteConfig.name}`,
  description: `Điều khoản sử dụng nền tảng đào tạo tư vấn tài chính cá nhân ${siteConfig.name} — ${siteConfig.domain}. Bao gồm miễn trừ trách nhiệm tài chính, quyền sở hữu trí tuệ và luật áp dụng Việt Nam.`,
  alternates: {
    canonical: `https://${siteConfig.domain}/terms`,
  },
  openGraph: {
    title: `Điều Khoản Sử Dụng — ${siteConfig.name}`,
    description: `Điều khoản sử dụng nền tảng đào tạo tư vấn tài chính cá nhân ${siteConfig.name}`,
  },
};

const sections = [
  {
    id: "gioi-thieu",
    title: "1. Giới thiệu",
    content: [
      `Chào mừng bạn đến với ${siteConfig.domain} ("Nền tảng") — học viện đào tạo trực tuyến về tư vấn tài chính cá nhân dành cho nhà khởi nghiệp Việt Nam, thuộc sở hữu và vận hành bởi ${siteConfig.name} ("chúng tôi", "của chúng tôi").`,
      "Nền tảng cung cấp dịch vụ nội dung số (khoá học, tài liệu, cộng đồng học viên) trong lĩnh vực giáo dục tài chính cá nhân, hoạt động phù hợp với quy định pháp luật Việt Nam về thương mại điện tử và dịch vụ giáo dục trực tuyến.",
      "Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên Nền tảng, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản dưới đây.",
      "Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng Nền tảng.",
    ],
  },
  {
    id: "mien-tru-tai-chinh",
    title: "2. Miễn trừ trách nhiệm tài chính (quan trọng)",
    content: [
      `${siteConfig.name} là đơn vị đào tạo giáo dục — KHÔNG phải công ty môi giới chứng khoán, không phải nhà tư vấn đầu tư được cấp phép, không phải đại lý bảo hiểm và không phải tổ chức tín dụng. Vui lòng đọc kỹ phần này trước khi áp dụng bất kỳ nội dung nào của khoá học vào quyết định tài chính của bạn.`,
    ],
    list: [
      "Toàn bộ nội dung trên Nền tảng (video, bài giảng, bảng tính, tài liệu, ví dụ minh hoạ, lời khuyên chung trong cộng đồng) chỉ mang tính chất GIÁO DỤC và THAM KHẢO. Đây KHÔNG phải khuyến nghị đầu tư cá nhân, không phải tư vấn thuế chính thức, không phải lời khuyên pháp lý và không phải tư vấn bảo hiểm cụ thể cho hoàn cảnh riêng của bạn",
      "Các ví dụ về cổ phiếu, quỹ, bất động sản, kênh đầu tư hoặc sản phẩm tài chính trong khoá học chỉ phục vụ mục đích minh hoạ. Hiệu quả trong quá khứ không đảm bảo cho hiệu quả trong tương lai",
      "Mọi quyết định tài chính, đầu tư, vay nợ, mua bảo hiểm hoặc kê khai thuế dựa trên kiến thức học từ Nền tảng đều do bạn TỰ CHỊU TRÁCH NHIỆM HOÀN TOÀN",
      "Trước khi thực hiện bất kỳ quyết định tài chính trọng yếu nào, bạn nên tham vấn chuyên gia có giấy phép hành nghề phù hợp (chuyên viên tư vấn đầu tư được cấp phép, kế toán/đại lý thuế hành nghề, luật sư, đại lý bảo hiểm chính thức)",
      `${siteConfig.name} không cam kết, không bảo đảm và không chịu trách nhiệm về bất kỳ khoản lãi, lỗ, thiệt hại tài chính, mất cơ hội hay hậu quả nào phát sinh từ việc bạn áp dụng kiến thức học được`,
      "Kết quả tài chính của mỗi học viên phụ thuộc vào nỗ lực cá nhân, hoàn cảnh riêng, mức thu nhập, khẩu vị rủi ro, kỷ luật thực thi và nhiều yếu tố thị trường nằm ngoài tầm kiểm soát của Nền tảng",
    ],
    extra: [
      "Bằng việc tiếp tục sử dụng Nền tảng, bạn xác nhận đã hiểu rõ và đồng ý với toàn bộ miễn trừ trách nhiệm tài chính nêu trên.",
    ],
  },
  {
    id: "tai-khoan",
    title: "3. Tài khoản học viên",
    content: [
      "Để sử dụng đầy đủ tính năng của Nền tảng, bạn cần đăng ký tài khoản với thông tin chính xác. Khi sử dụng tài khoản, bạn cam kết:",
    ],
    list: [
      "Đủ 18 tuổi trở lên, hoặc đủ 16 tuổi với sự đồng ý của cha mẹ/người giám hộ hợp pháp",
      "Cung cấp họ tên, email và thông tin liên hệ trung thực, cập nhật khi có thay đổi",
      "Bảo mật thông tin đăng nhập và chịu trách nhiệm toàn bộ với mọi hoạt động diễn ra dưới tài khoản của mình",
      "Mỗi cá nhân chỉ đăng ký và duy trì MỘT tài khoản duy nhất",
      "KHÔNG chia sẻ, cho mượn, cho thuê, bán hoặc chuyển nhượng tài khoản cho người khác — kể cả cho người thân, đồng nghiệp hay cộng sự",
      "Thông báo ngay cho chúng tôi qua email khi phát hiện truy cập trái phép vào tài khoản",
      "Không sử dụng Nền tảng cho mục đích bất hợp pháp, gian lận, hoặc gây tổn hại đến bên thứ ba",
    ],
    extra: [
      "Chúng tôi có quyền tạm khoá hoặc chấm dứt vĩnh viễn tài khoản vi phạm điều khoản, đặc biệt là vi phạm về chia sẻ tài khoản, mà KHÔNG hoàn lại học phí.",
    ],
  },
  {
    id: "so-huu-tri-tue",
    title: "4. Quyền sở hữu trí tuệ",
    content: [
      `Toàn bộ nội dung trên Nền tảng — bao gồm nhưng không giới hạn: video bài giảng, slide, bảng tính, template, tài liệu PDF, mã nguồn, thiết kế, logo và thương hiệu "${siteConfig.name}" — là tài sản trí tuệ của ${siteConfig.name} hoặc đối tác được uỷ quyền hợp pháp, được bảo hộ theo Luật Sở hữu trí tuệ Việt Nam.`,
    ],
    list: [
      "Bạn được cấp quyền sử dụng cá nhân, không độc quyền, không chuyển nhượng để truy cập nội dung khoá học đã đăng ký",
      "NGHIÊM CẤM sao chép, tải xuống trái phép, tái sản xuất, phân phối, bán lại, cho thuê hoặc chia sẻ công khai nội dung khoá học dưới mọi hình thức",
      "NGHIÊM CẤM ghi màn hình, quay video lại bài giảng, hoặc dùng công cụ bên thứ ba để trích xuất, crawl, scrape nội dung",
      "NGHIÊM CẤM sử dụng nội dung khoá học để xây dựng khoá học cạnh tranh, làm tài liệu đào tạo nội bộ doanh nghiệp, hoặc bất kỳ mục đích thương mại nào mà không có văn bản chấp thuận của chúng tôi",
      "NGHIÊM CẤM dùng nội dung khoá học để huấn luyện mô hình AI/machine learning",
      "Vi phạm sẽ dẫn đến khoá tài khoản vĩnh viễn, không hoàn tiền, và có thể bị xử lý theo quy định pháp luật Việt Nam về sở hữu trí tuệ",
    ],
  },
  {
    id: "thanh-toan",
    title: "5. Thanh toán và hoàn tiền",
    content: [
      "Khi mua khoá học hoặc đăng ký gói thành viên trên Nền tảng, bạn đồng ý với các điều khoản thanh toán dưới đây:",
    ],
    list: [
      "Giá được niêm yết bằng Việt Nam Đồng (VND) và đã bao gồm các loại thuế áp dụng (nếu có)",
      "Phương thức thanh toán: chuyển khoản ngân hàng nội địa hoặc cổng thanh toán trực tuyến được tích hợp trên Nền tảng",
      "Quyền truy cập khoá học được kích hoạt ngay sau khi hệ thống xác nhận thanh toán thành công",
      "Chúng tôi có quyền điều chỉnh giá dịch vụ trong tương lai. Giá mới không áp dụng cho đơn hàng đã thanh toán trước đó",
    ],
    extra: [
      "Chính sách hoàn tiền chi tiết được quy định riêng tại trang Chính sách hoàn tiền. Vui lòng đọc kỹ trước khi đặt mua.",
    ],
  },
  {
    id: "hanh-vi-cam",
    title: "6. Hành vi bị nghiêm cấm",
    content: [
      "Khi sử dụng Nền tảng và tham gia cộng đồng học viên, bạn cam kết KHÔNG thực hiện các hành vi sau:",
    ],
    list: [
      "Đăng tải nội dung vi phạm pháp luật, xâm phạm thuần phong mỹ tục, xúc phạm cá nhân hoặc tổ chức",
      "Spam, quảng cáo sản phẩm/dịch vụ tài chính khác, lôi kéo học viên ra khỏi Nền tảng",
      "Mạo danh giảng viên, ban quản trị hoặc học viên khác",
      "Sử dụng thông tin liên hệ của học viên khác cho mục đích tiếp thị hoặc chào mời đầu tư",
      "Tư vấn tài chính/đầu tư cụ thể cho học viên khác trong cộng đồng nếu bạn không có chứng chỉ hành nghề phù hợp",
      "Lan truyền tin đồn, thông tin sai lệch về thị trường tài chính, doanh nghiệp niêm yết hoặc sản phẩm tài chính",
      "Can thiệp, tấn công hoặc cố gắng truy cập trái phép vào hệ thống Nền tảng",
    ],
  },
  {
    id: "gioi-han-trach-nhiem",
    title: "7. Giới hạn trách nhiệm",
    content: [
      'Trong phạm vi pháp luật Việt Nam cho phép, Nền tảng và toàn bộ nội dung được cung cấp trên cơ sở "nguyên trạng" (as-is) và "sẵn có" (as-available):',
    ],
    list: [
      "Chúng tôi không đảm bảo Nền tảng hoạt động liên tục, không gián đoạn hoặc hoàn toàn không có lỗi kỹ thuật",
      "Chúng tôi không chịu trách nhiệm về kết quả tài chính cụ thể từ việc bạn áp dụng kiến thức học được — xem Mục 2 về Miễn trừ trách nhiệm tài chính",
      "Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp, ngẫu nhiên, đặc biệt hoặc mang tính hậu quả phát sinh từ việc sử dụng Nền tảng",
      "Chúng tôi không chịu trách nhiệm về nội dung, sản phẩm hoặc dịch vụ của bên thứ ba được liên kết hoặc nhắc đến trên Nền tảng",
      "Trách nhiệm bồi thường tối đa của chúng tôi trong mọi trường hợp không vượt quá tổng số tiền học phí bạn đã thanh toán cho dịch vụ liên quan trong 12 tháng gần nhất",
    ],
  },
  {
    id: "thay-doi",
    title: "8. Thay đổi điều khoản",
    content: [
      "Chúng tôi có quyền sửa đổi, bổ sung hoặc cập nhật các Điều khoản Sử dụng này vào bất kỳ thời điểm nào. Khi có thay đổi quan trọng:",
    ],
    list: [
      "Phiên bản mới được đăng tải trên Nền tảng kèm ngày cập nhật",
      "Học viên sẽ được thông báo qua email đã đăng ký trước ít nhất 7 ngày",
      "Việc tiếp tục sử dụng Nền tảng sau ngày thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới",
      "Nếu không đồng ý, bạn có quyền ngừng sử dụng và yêu cầu xoá tài khoản",
    ],
  },
  {
    id: "luat-ap-dung",
    title: "9. Luật áp dụng và giải quyết tranh chấp",
    content: [
      "Điều khoản này được điều chỉnh và giải thích theo pháp luật nước Cộng hoà Xã hội Chủ nghĩa Việt Nam.",
      "Mọi tranh chấp phát sinh giữa bạn và Nền tảng sẽ được ưu tiên giải quyết thông qua thương lượng, hoà giải trên tinh thần thiện chí. Nếu không đạt được thoả thuận, tranh chấp sẽ được đưa ra giải quyết tại Toà án có thẩm quyền tại Việt Nam theo quy định pháp luật.",
    ],
  },
  {
    id: "lien-he",
    title: "10. Liên hệ",
    content: [
      "Mọi câu hỏi, góp ý, khiếu nại hoặc yêu cầu liên quan đến Điều khoản Sử dụng này, vui lòng liên hệ với chúng tôi:",
    ],
  },
];

export default function TermsPage() {
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
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-gray-400 text-sm">
            Cập nhật lần cuối: 22/05/2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-10">
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
                <p key={i} className="text-gray-400 leading-relaxed mb-3 text-sm italic">
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
                    <span className="text-gray-500">Đơn vị vận hành:</span>{" "}
                    <span className="text-white font-medium">
                      {siteConfig.owner.name}
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
                    <span className="text-gray-500">Email:</span>{" "}
                    <a
                      href="mailto:info@yourdomain.com"
                      className="text-[#2563EB] hover:underline"
                    >
                      info@yourdomain.com
                    </a>
                  </p>
                </div>
              )}
            </section>
          ))}

          {/* Related links */}
          <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row gap-3">
            <Link
              href="/privacy"
              className="text-sm text-[#2563EB] hover:underline"
            >
              Chính sách bảo mật &rarr;
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
