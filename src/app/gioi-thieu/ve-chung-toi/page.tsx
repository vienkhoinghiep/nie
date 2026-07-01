import type { Metadata } from "next";
import Image from "next/image";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { Compass, Target, Award } from "lucide-react";

const NAVY = "#0f1c3a";
const GOLD = "#D4A843";
const BRAND = siteConfig.colors.brand;

export const metadata: Metadata = {
  title: `Về chúng tôi — ${siteConfig.name}`,
  description: `Câu chuyện VINEN, tầm nhìn 2030, sứ mệnh và 4 giá trị cốt lõi của Viện Nghiên Cứu Khởi Nghiệp.`,
  alternates: { canonical: `${getBaseUrl()}/gioi-thieu/ve-chung-toi` },
};

export default function VeChungToiPage() {
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* Hero */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #0a0a0a)` }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
              Giới thiệu · Về chúng tôi
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
              Viện Nghiên Cứu <span style={{ color: GOLD }}>Khởi Nghiệp</span>
            </h1>
            <p className="text-base text-gray-300 italic mb-2" style={{ color: GOLD }}>
              &ldquo;Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân&rdquo;
            </p>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed mt-4">
              Thành lập năm 2023 · Tổ chức nghiên cứu, đào tạo và mentoring 1-1 chuyên
              sâu dành cho cộng đồng founder Việt Nam.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div
              className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${NAVY}, #0a0a0a 70%)`,
                border: `2px solid ${GOLD}`,
              }}
            >
              <Image
                src={siteConfig.owner.avatar}
                alt="Logo VINEN"
                width={150}
                height={150}
                priority
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Câu chuyện */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-5">Câu chuyện VINEN</h2>
          <div className="space-y-4 text-base text-gray-300 leading-relaxed">
            <p>
              <strong className="text-white">Viện Nghiên Cứu Khởi Nghiệp (VINEN)</strong>{" "}
              ra đời năm 2023 với khát vọng xây dựng một tổ chức nghiên cứu và đào tạo
              chuyên sâu, đồng hành cùng cộng đồng founder Việt Nam trong hành trình
              kiến tạo doanh nghiệp.
            </p>
            <p>
              Trong bối cảnh hệ sinh thái khởi nghiệp Việt Nam phát triển mạnh mẽ nhưng
              vẫn thiếu các chương trình đào tạo có chiều sâu, VINEN cung cấp{" "}
              <strong className="text-white">3 trụ cột chính</strong>: nghiên cứu khoa
              học, đào tạo bài bản, và mentoring 1-1 với các chuyên gia hàng đầu.
            </p>
            <p>
              Slogan{" "}
              <em style={{ color: GOLD }}>
                &ldquo;Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân&rdquo;
              </em>{" "}
              thể hiện cam kết của VINEN: kết nối tri thức học thuật với kinh nghiệm
              thực tiễn của các founder thành công, để giúp thế hệ doanh nhân mới Việt
              Nam phát triển bền vững.
            </p>
            <p>
              VINEN tự hào là đơn vị tiên phong xây dựng{" "}
              <strong className="text-white">chương trình Chuyên Gia Khởi Nghiệp Quốc Gia</strong>{" "}
              cùng <strong className="text-white">Tinh Hoa Quản Trị & Khởi Nghiệp</strong> —
              hai chương trình đào tạo bài bản dành cho doanh nhân Việt thế hệ mới.
            </p>
          </div>
        </div>
      </section>

      {/* Vision / Mission / Values */}
      <section
        className="py-16 px-4 sm:px-6"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Tầm nhìn — Sứ mệnh — Giá trị cốt lõi
          </h2>
          <p className="text-center text-gray-400 mb-10 max-w-2xl mx-auto">
            Ba định hướng tinh thần dẫn dắt mọi quyết định và hoạt động của VINEN.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Pillar
              icon={<Compass size={22} />}
              title="Tầm nhìn 2030"
              text="Trở thành viện nghiên cứu và đào tạo khởi nghiệp uy tín hàng đầu Việt Nam, kết nối 10.000+ founder với mạng lưới chuyên gia toàn cầu."
              color={BRAND}
            />
            <Pillar
              icon={<Target size={22} />}
              title="Sứ mệnh"
              text="Thúc đẩy hệ sinh thái khởi nghiệp Việt Nam thông qua nghiên cứu, đào tạo và mentoring 1-1 — giúp founder tăng tỷ lệ thành công."
              color={GOLD}
            />
            <Pillar
              icon={<Award size={22} />}
              title="Giá trị cốt lõi"
              text="Trí tuệ — Chính trực — Đồng hành — Bền vững. Bốn giá trị định hình mọi chương trình và hoạt động của VINEN."
              color="#10b981"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Pillar({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: string }) {
  return (
    <div className="card-dark p-6">
      <div
        className="inline-flex w-11 h-11 rounded-lg items-center justify-center mb-3"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
    </div>
  );
}
