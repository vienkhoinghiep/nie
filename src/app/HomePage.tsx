import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import HeroSlideBanner from "@/components/layout/HeroSlideBanner";
import {
  ArrowRight,
  Handshake,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Award,
  Compass,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  GraduationCap,
  Briefcase,
  Globe,
  Flag,
} from "lucide-react";
import type { Mentor, MentorExpertise } from "@/types/mentor";

export const dynamic = "force-dynamic";

const BRAND = siteConfig.colors.brand;          // #2563EB (classic blue)
const NAVY = "#0f1c3a";                          // logo navy
const GOLD = "#D4A843";                          // logo gold accent

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  sale_price: number | null;
}

export default async function HomePage() {
  const admin = await createAdminClient();

  const [{ data: mentorsData }, { data: expertiseData }, { data: coursesData }] = await Promise.all([
    admin
      .from("mentors")
      .select("id, slug, full_name, title, short_bio, avatar, expertise_tags, total_ratings, avg_rating")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("avg_rating", { ascending: false })
      .limit(4),
    admin.from("mentor_expertise").select("*").order("sort_order", { ascending: true }),
    admin
      .from("products")
      .select("id, slug, title, description, thumbnail, price, sale_price")
      .eq("type", "course")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(4),
  ]);

  const mentors = (mentorsData ?? []) as Mentor[];
  const expertise = (expertiseData ?? []) as MentorExpertise[];
  const courses = (coursesData ?? []) as Course[];

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a" }}>
      <PublicHeader />

      {/* ─────────────── 1. HERO SLIDE BANNER ─────────────── */}
      <HeroSlideBanner />

      {/* ─────────────── 2. VISION & MISSION + INTRO VIDEO ─────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Định hướng"
            title="Mục Tiêu · Tầm Nhìn · Sứ Mệnh"
            description="Kết Nối Trí Tuệ — Nâng Tầm Doanh Nhân — Phụng Sự Dân Tộc"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 items-stretch">
            {/* LEFT: stacked goal + vision + mission */}
            <div className="space-y-5 flex flex-col">
              <VisionCard
                icon={<Flag size={22} />}
                title="Mục tiêu"
                body="Xây dựng hệ sinh thái hỗ trợ khởi nghiệp toàn diện — từ nghiên cứu, đào tạo đến kết nối mentor — giúp founder Việt Nam khởi nghiệp bài bản và bền vững."
                accent="#10b981"
              />
              <VisionCard
                icon={<Compass size={22} />}
                title="Tầm nhìn 2030"
                body="Trở thành viện nghiên cứu và đào tạo khởi nghiệp uy tín hàng đầu Việt Nam, kết nối 10.000+ founder với mạng lưới chuyên gia và mentor toàn cầu."
                accent={BRAND}
              />
              <VisionCard
                icon={<Target size={22} />}
                title="Sứ mệnh"
                body="Thúc đẩy hệ sinh thái khởi nghiệp Việt Nam thông qua nghiên cứu chuyên sâu, đào tạo bài bản và kết nối mentor 1-1 chất lượng — giúp founder tăng tỷ lệ thành công."
                accent={GOLD}
              />
            </div>
            {/* RIGHT: intro video */}
            <IntroVideo />
          </div>
        </div>
      </section>

      {/* ─────────────── 3. SLOGAN BANNER ─────────────── */}
      <section
        className="py-16 px-4 sm:px-6 text-center"
        style={{ background: `linear-gradient(90deg, ${NAVY}, #0a0a0a, ${NAVY})` }}
      >
        <div className="max-w-4xl mx-auto">
          <Lightbulb size={32} className="mx-auto mb-4" style={{ color: GOLD }} />
          <p
            className="text-2xl sm:text-3xl font-bold leading-tight italic"
            style={{ color: GOLD }}
          >
            &ldquo;Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân&rdquo;
          </p>
        </div>
      </section>

      {/* ─────────────── 4. EVENTS GALLERY — social proof ─────────────── */}
      <section
        className="py-16 px-4 sm:px-6 border-t border-[#1a1a1a]"
        style={{ background: siteConfig.colors.surface }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider mb-4"
              style={{ background: `${BRAND}1f`, color: BRAND, border: `1px solid ${BRAND}55` }}
            >
              ✦ Sự kiện thực tế
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-3">
              Đào Tạo Trực Tiếp Cho{" "}
              <span style={{ color: BRAND }}>1.000+ Doanh Nhân</span>
              <br className="hidden sm:block" />
              {" "}Trên Khắp Cả Nước
            </h2>
            <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Từ Tọa Đàm Doanh Nhân 2021 đến Diễn Đàn Khởi Nghiệp Quốc Gia
              Hà Nội 2025 — Đội ngũ chuyên gia VINEN đã trực tiếp đào tạo và đồng
              hành cùng hàng nghìn nhà khởi nghiệp trên khắp Việt Nam.
            </p>
          </div>

          {/* Gallery — 1 hero + 5 thumbnails on a 3-col grid (desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <figure className="md:col-span-2 md:row-span-2 relative aspect-[3/2] md:aspect-auto rounded-2xl overflow-hidden group">
              <Image
                src="/images/events/event-1.jpg"
                alt="Diễn Đàn Khởi Nghiệp Quốc Gia — Hà Nội 2025, Trung Tâm Hội Nghị Quốc Gia"
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-5 sm:p-6">
                <div>
                  <div
                    className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ background: BRAND, color: "#1a1a1a" }}
                  >
                    Keynote · Hà Nội 2025
                  </div>
                  <h3 className="text-white text-lg sm:text-2xl font-extrabold leading-snug mb-1">
                    Diễn Đàn Khởi Nghiệp Quốc Gia
                  </h3>
                  <p className="text-gray-200 text-sm">
                    Phát triển nguồn vốn nhân lực cho Đổi mới Sáng tạo và Khởi nghiệp Quốc gia
                  </p>
                </div>
              </div>
            </figure>

            {[
              {
                src: "/images/events/event-2.jpg",
                alt: "Toàn cảnh hội trường Tọa Đàm Hội Nghị Doanh Nhân 2021 — TCA",
                badge: "2021",
              },
              {
                src: "/images/events/event-3.jpg",
                alt: "Workshop Khởi Nghiệp Đổi Mới Sáng Tạo Cho Thanh Niên — Ninh Bình 2026",
                badge: "2026",
              },
              {
                src: "/images/events/event-4.jpg",
                alt: "Tọa Đàm TCA 2021 — Chủ đề: Kiếm Tiền Thông Minh, Giữ Tiền An Toàn, Nhân Tiền Hiệu Quả",
                badge: "2021",
              },
              {
                src: "/images/events/event-5.jpg",
                alt: "Đội ngũ chuyên gia VINEN — Chuyên gia Khởi Nghiệp Quốc Gia, Tổng Thư Ký Hội đồng Tư vấn Khởi Nghiệp Quốc Gia",
                badge: "Credential",
                contain: true,
                bg: "#b8000d",
              },
              {
                src: "/images/events/event-6.jpg",
                alt: "Chương trình tập huấn Khởi Nghiệp Sáng Tạo cho Thanh Niên tỉnh Ninh Bình 21/04/2026",
                badge: "2026",
              },
            ].map((img, i) => (
              <figure
                key={i}
                className="relative aspect-[3/2] rounded-xl overflow-hidden group"
                style={img.bg ? { background: img.bg } : undefined}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className={`${img.contain ? "object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-[1.04]`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                {img.badge && (
                  <div
                    className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: BRAND, color: "#1a1a1a" }}
                  >
                    {img.badge}
                  </div>
                )}
              </figure>
            ))}
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            {[
              { num: "1.000+", label: "Doanh nhân đã đào tạo" },
              { num: "50+", label: "Tọa đàm & workshop" },
              { num: "5+", label: "Năm kinh nghiệm thực chiến" },
              { num: "98%", label: "Học viên hài lòng" },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-4 rounded-xl"
                style={{ background: "#161616", border: "1px solid #222" }}
              >
                <div className="text-xl sm:text-2xl font-extrabold mb-0.5" style={{ color: BRAND }}>
                  {s.num}
                </div>
                <div className="text-[11px] sm:text-xs text-gray-400 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 5. FUNCTIONS & DUTIES ─────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="6 lĩnh vực hoạt động"
            title="Chức Năng & Nhiệm Vụ"
            description="VINEN hoạt động trên 6 lĩnh vực chính, phục vụ toàn diện nhu cầu của founder và hệ sinh thái khởi nghiệp Việt Nam."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            <FunctionCard
              icon={<Lightbulb size={20} />}
              title="Nghiên cứu khoa học"
              desc="Công bố báo cáo chuyên sâu về xu hướng khởi nghiệp, gọi vốn, scaling tại Việt Nam và khu vực."
              color={BRAND}
            />
            <FunctionCard
              icon={<GraduationCap size={20} />}
              title="Đào tạo bài bản"
              desc="Khoá học từ cơ bản đến nâng cao: pitch deck, go-to-market, OKR, gọi vốn, scaling."
              color="#3b82f6"
            />
            <FunctionCard
              icon={<Users size={20} />}
              title="Mentoring 1-1"
              desc="Kết nối founder với chuyên gia phù hợp theo nhu cầu cụ thể — fundraising, GTM, sản phẩm..."
              color={GOLD}
            />
            <FunctionCard
              icon={<Briefcase size={20} />}
              title="Tư vấn chuyên môn"
              desc="Tư vấn chiến lược cho startup từ giai đoạn pre-seed đến series A, B."
              color="#a855f7"
            />
            <FunctionCard
              icon={<Handshake size={20} />}
              title="Networking & Kết nối"
              desc="Sự kiện, demo day, founder dinner — kết nối founder với nhà đầu tư và đồng nghiệp."
              color="#10b981"
            />
            <FunctionCard
              icon={<Award size={20} />}
              title="Vinh danh & Giải thưởng"
              desc="Tôn vinh các founder và startup tiêu biểu, lan toả câu chuyện thành công."
              color="#f59e0b"
            />
          </div>
        </div>
      </section>

      {/* ─────────────── 6. FEATURED MENTORS ─────────────── */}
      <section
        className="py-20 px-4 sm:px-6"
        style={{ background: `linear-gradient(180deg, #0a0a0a, ${NAVY}33)` }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <SectionHeader
              eyebrow="Mạng lưới VINEN"
              title="Mentor 1-1 Nổi Bật"
              description="Các chuyên gia, founder, nhà đầu tư hàng đầu sẵn sàng đồng hành cùng bạn."
              compact
            />
            <Link
              href="/mentors"
              className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap"
              style={{ color: BRAND }}
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {mentors.length === 0 ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ border: "1px dashed #2a2a2a", background: "#0a0a0a" }}
            >
              <Users size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-white font-semibold mb-1">Đang mời chuyên gia tham gia</p>
              <p className="text-sm text-gray-500">
                Mạng lưới mentor VINEN sẽ ra mắt sớm. Đăng ký nhận thông báo:{" "}
                <Link href="/register" style={{ color: BRAND }} className="underline">
                  /register
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mentors.map((m) => (
                <Link
                  key={m.id}
                  href={`/mentors/${m.slug}`}
                  className="rounded-xl overflow-hidden flex flex-col group transition-colors"
                  style={{ background: "#0f0f0f", border: "1px solid #1f1f1f" }}
                >
                  <div
                    className="relative aspect-square"
                    style={{ background: `linear-gradient(135deg, ${BRAND}33, ${NAVY})` }}
                  >
                    {m.avatar ? (
                      <Image
                        src={m.avatar}
                        alt={m.full_name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold" style={{ color: GOLD }}>
                        {m.full_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-base mb-1 leading-tight">{m.full_name}</h3>
                    {m.title && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{m.title}</p>}
                    {m.total_ratings > 0 && (
                      <p className="text-xs flex items-center gap-1" style={{ color: GOLD }}>
                        <Star size={11} fill={GOLD} stroke={GOLD} /> {m.avg_rating.toFixed(1)} ({m.total_ratings})
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────── 7. RESEARCH AREAS ─────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="10 chuyên ngành"
            title="Lĩnh Vực Nghiên Cứu"
            description="VINEN nghiên cứu và đào tạo trên 10 lĩnh vực cốt lõi của khởi nghiệp."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
            {expertise.map((e) => (
              <Link
                key={e.slug}
                href={`/mentors?expertise=${e.slug}`}
                className="rounded-lg p-4 transition-colors group"
                style={{
                  background: `${e.color}0d`,
                  border: `1px solid ${e.color}33`,
                }}
              >
                <h3
                  className="text-sm font-bold mb-1 group-hover:underline"
                  style={{ color: e.color }}
                >
                  {e.label}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-snug">
                  {e.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 8. NEWS / ACTIVITIES (placeholder) ─────────────── */}
      <section
        className="py-20 px-4 sm:px-6"
        style={{ background: "linear-gradient(180deg, #0a0a0a, #060606)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <SectionHeader
              eyebrow="Cập nhật mới nhất"
              title="Tin Tức & Hoạt Động"
              compact
            />
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap"
              style={{ color: BRAND }}
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tag: "Sự kiện", title: "VINEN Founder Dinner #1 — Hà Nội 2026" },
              { tag: "Báo cáo", title: "Báo cáo gọi vốn startup VN 2026 — sắp ra mắt" },
              { tag: "Workshop", title: "Pitch deck masterclass cùng top mentor" },
              { tag: "Mentorship", title: "Khai trương chương trình Mentoring 1-1" },
            ].map((n, idx) => (
              <article
                key={idx}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{ background: "#0f0f0f", border: "1px solid #1f1f1f" }}
              >
                <div
                  className="aspect-[16/10] flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${BRAND}55, ${NAVY})` }}
                >
                  <Building2 size={36} className="text-white opacity-40" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span
                    className="text-[10px] uppercase tracking-wider font-bold mb-2"
                    style={{ color: GOLD }}
                  >
                    {n.tag}
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug">{n.title}</h3>
                  <p className="text-[11px] text-gray-500 mt-auto pt-3">Sắp công bố</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── 9. COURSES / TRAINING ─────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <SectionHeader
              eyebrow="Đào tạo & Huấn luyện"
              title="Khoá Học Tiêu Biểu"
              compact
            />
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap"
              style={{ color: BRAND }}
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          {courses.length === 0 ? (
            <div
              className="rounded-xl p-10 text-center"
              style={{ border: "1px dashed #2a2a2a", background: "#0a0a0a" }}
            >
              <GraduationCap size={40} className="mx-auto mb-3 text-gray-600" />
              <p className="text-white font-semibold mb-1">Đang biên soạn khoá học đầu tiên</p>
              <p className="text-sm text-gray-500">
                Các khoá học VINEN sẽ ra mắt cuối năm 2026.{" "}
                <Link href="/register" style={{ color: BRAND }} className="underline">
                  Đăng ký
                </Link>{" "}
                để nhận thông báo sớm.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="rounded-xl overflow-hidden flex flex-col group"
                  style={{ background: "#0f0f0f", border: "1px solid #1f1f1f" }}
                >
                  <div className="relative aspect-[16/10]" style={{ background: NAVY }}>
                    {c.thumbnail && (
                      <Image
                        src={c.thumbnail}
                        alt={c.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{c.title}</h3>
                    {c.description && (
                      <p className="text-[12px] text-gray-400 line-clamp-2 mb-3">{c.description}</p>
                    )}
                    <div className="mt-auto">
                      {(c.sale_price ?? c.price) > 0 ? (
                        <span className="font-bold text-sm" style={{ color: BRAND }}>
                          {(c.sale_price ?? c.price).toLocaleString("vi-VN")}₫
                        </span>
                      ) : (
                        <span className="font-bold text-sm text-emerald-400">Miễn phí</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────── 10. PARTNERSHIP OPPORTUNITIES ─────────────── */}
      <section
        className="py-20 px-4 sm:px-6"
        style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a0a0a 100%)` }}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Đồng hành cùng VINEN"
            title="Cơ Hội Hợp Tác"
            description="3 hình thức hợp tác chính dành cho doanh nghiệp, tổ chức và cá nhân muốn đồng hành cùng hệ sinh thái khởi nghiệp VN."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            <PartnershipCard
              icon={<Lightbulb size={22} />}
              title="Nghiên cứu chung"
              desc="Hợp tác công bố báo cáo, white paper với VINEN — tiếp cận data và mạng lưới founder VN."
              color={BRAND}
            />
            <PartnershipCard
              icon={<TrendingUp size={22} />}
              title="Tài trợ & Đầu tư"
              desc="Tài trợ sự kiện, học bổng, chương trình mentoring — gắn thương hiệu với cộng đồng khởi nghiệp."
              color={GOLD}
            />
            <PartnershipCard
              icon={<GraduationCap size={22} />}
              title="Đào tạo doanh nghiệp"
              desc="Thiết kế chương trình đào tạo intrapreneurship cho đội ngũ nội bộ doanh nghiệp lớn."
              color="#10b981"
            />
          </div>

          <div className="mt-12 text-center">
            <a
              href={`mailto:${siteConfig.support.email}?subject=H%E1%BB%A3p%20t%C3%A1c%20v%E1%BB%9Bi%20VINEN`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white"
              style={{ background: BRAND, boxShadow: `0 8px 32px ${BRAND}44` }}
            >
              <Mail size={16} /> Gửi đề xuất hợp tác
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="px-4 sm:px-6 pt-16 pb-8" style={{ background: "#060606", borderTop: `1px solid #1a1a1a` }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Image src={siteConfig.owner.avatar} alt="VINEN" width={48} height={48} className="rounded-lg" />
                <div>
                  <div className="font-bold text-white text-base leading-tight">Viện Nghiên Cứu Khởi Nghiệp</div>
                  <div className="text-xs" style={{ color: GOLD }}>VINEN · Founded 2023</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-md">
                Tổ chức nghiên cứu, đào tạo và mentoring 1-1 dành cho cộng đồng founder Việt Nam.
              </p>
              <p className="text-xs italic" style={{ color: GOLD }}>
                &ldquo;Kết Nối Trí Tuệ — Kiến Tạo Doanh Nhân&rdquo;
              </p>
            </div>

            {/* Nav links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Khám phá</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mentors" className="text-gray-400 hover:text-white transition-colors">Mentor 1-1</Link></li>
                <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">Khoá học</Link></li>
                <li><Link href="/shop" className="text-gray-400 hover:text-white transition-colors">Cửa hàng</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Tin tức</Link></li>
                <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Sự kiện</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                  <a href={`mailto:${siteConfig.support.email}`} className="hover:text-white">
                    {siteConfig.support.email}
                  </a>
                </li>
                {siteConfig.support.phone && (
                  <li className="flex items-start gap-2">
                    <Phone size={14} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                    <span>{siteConfig.support.phone}</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Globe size={14} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                  <span>{siteConfig.domain}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: BRAND }} />
                  <span>Hà Nội · Việt Nam</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
            <span>{siteConfig.footer.copyright}</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white">Bảo mật</Link>
              <Link href="/terms" className="hover:text-white">Điều khoản</Link>
              <Link href="/refund-policy" className="hover:text-white">Hoàn tiền</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────── Sub-components ───────────────

function SectionHeader({
  eyebrow,
  title,
  description,
  compact,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "text-center max-w-3xl mx-auto"}>
      <p
        className="text-xs uppercase tracking-[0.2em] font-bold mb-2"
        style={{ color: BRAND }}
      >
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">{title}</h2>
      {description && <p className="text-base text-gray-400 leading-relaxed">{description}</p>}
    </div>
  );
}

function IntroVideo() {
  // Env-driven: set NEXT_PUBLIC_INTRO_VIDEO_ID (YouTube ID) trong Vercel
  // hoặc NEXT_PUBLIC_INTRO_VIDEO_URL (full embed URL — Vimeo, Drive...).
  const ytId = process.env.NEXT_PUBLIC_INTRO_VIDEO_ID;
  const fullUrl = process.env.NEXT_PUBLIC_INTRO_VIDEO_URL;
  const embedUrl = fullUrl ?? (ytId ? `https://www.youtube.com/embed/${ytId}` : null);

  return (
    <div
      className="relative rounded-xl overflow-hidden aspect-video lg:aspect-auto lg:min-h-full"
      style={{
        background: `linear-gradient(135deg, ${NAVY}, #0a0a0a 70%)`,
        border: `1px solid ${GOLD}55`,
        boxShadow: `0 16px 48px rgba(0,0,0,0.4)`,
      }}
    >
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title="Video giới thiệu VINEN"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <>
          {/* Placeholder when no video set */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
            aria-label="Video giới thiệu đang được sản xuất"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 cursor-pointer"
              style={{ background: GOLD, boxShadow: `0 12px 32px ${GOLD}66` }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={NAVY} aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-white font-bold text-lg mb-1">Video giới thiệu VINEN</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Đang được sản xuất — sẽ ra mắt cùng các sự kiện đầu tiên của Viện.
            </p>
            <p className="text-[10px] text-gray-600 mt-3 uppercase tracking-wider">
              Coming soon
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function VisionCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-6 sm:p-7"
      style={{
        background: "#0f0f0f",
        border: `1px solid #1f1f1f`,
        boxShadow: `inset 4px 0 0 ${accent}`,
      }}
    >
      <div
        className="inline-flex w-11 h-11 rounded-lg items-center justify-center mb-4"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{body}</p>
    </div>
  );
}

function FunctionCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-5 transition-transform hover:-translate-y-0.5"
      style={{ background: "#0f0f0f", border: "1px solid #1f1f1f" }}
    >
      <div
        className="inline-flex w-10 h-10 rounded-lg items-center justify-center mb-3"
        style={{ background: `${color}1f`, color }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-white text-base mb-1.5">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function PartnershipCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-6 backdrop-blur-sm"
      style={{
        background: "rgba(15,15,15,0.6)",
        border: `1px solid ${color}44`,
      }}
    >
      <div
        className="inline-flex w-12 h-12 rounded-lg items-center justify-center mb-4"
        style={{ background: `${color}22`, color }}
      >
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-300 leading-relaxed">{desc}</p>
    </div>
  );
}
