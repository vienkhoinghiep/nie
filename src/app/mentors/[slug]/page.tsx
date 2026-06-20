import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import BookSessionButton from "@/components/mentors/BookSessionButton";
import {
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Calendar,
  Star,
  Clock,
  TrendingUp,
  Building2,
  GraduationCap,
  Languages,
} from "lucide-react";
import type { Mentor, MentorExpertise, MentorRating } from "@/types/mentor";

export const dynamic = "force-dynamic";

const BRAND = siteConfig.colors.brand;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const admin = await createAdminClient();
  const { data } = await admin.from("mentors").select("full_name,title,short_bio,avatar").eq("slug", slug).maybeSingle();
  if (!data) return { title: `Mentor không tồn tại — ${siteConfig.name}` };
  return {
    title: `${data.full_name}${data.title ? ` · ${data.title}` : ""} — Mentor ${siteConfig.shortName}`,
    description: data.short_bio ?? `Đặt lịch mentoring 1-1 cùng ${data.full_name} qua ${siteConfig.name}.`,
    alternates: { canonical: `${getBaseUrl()}/mentors/${slug}` },
    openGraph: data.avatar ? { images: [data.avatar] } : undefined,
  };
}

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

export default async function MentorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const admin = await createAdminClient();

  const { data: mentorData } = await admin
    .from("mentors")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!mentorData) notFound();
  const mentor = mentorData as Mentor;

  const [{ data: expertiseData }, { data: ratingsData }] = await Promise.all([
    admin.from("mentor_expertise").select("*").in("slug", mentor.expertise_tags),
    admin
      .from("mentor_ratings")
      .select("id,rating,feedback,created_at,mentee_id")
      .eq("mentor_id", mentor.id)
      .eq("is_public", true)
      .not("feedback", "is", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const expertise = (expertiseData ?? []) as MentorExpertise[];
  const ratings = (ratingsData ?? []) as MentorRating[];

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <PublicHeader />

      {/* Hero / cover */}
      <section className="pt-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Cover */}
          <div
            className="h-44 sm:h-56 rounded-t-2xl relative overflow-hidden"
            style={{
              background: mentor.cover_image
                ? `url(${mentor.cover_image}) center/cover`
                : `linear-gradient(135deg, ${BRAND}, #0f1c3a 70%, #0a0a0a)`,
            }}
          >
            {mentor.is_featured && (
              <span
                className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ background: BRAND, color: "#0a0a0a" }}
              >
                ★ Mentor nổi bật
              </span>
            )}
          </div>

          {/* Profile card overlapping cover */}
          <div className="card-dark -mt-20 mx-4 sm:mx-8 p-6 sm:p-8 relative z-10">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-[#0a0a0a] bg-[#1a1a1a] flex-shrink-0 -mt-16 sm:-mt-20 mx-auto sm:mx-0">
                {mentor.avatar ? (
                  <Image src={mentor.avatar} alt={mentor.full_name} fill className="object-cover" sizes="(min-width:640px) 144px, 112px" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold" style={{ color: BRAND }}>
                    {mentor.full_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Identity + CTAs */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 leading-tight text-center sm:text-left">
                  {mentor.full_name}
                </h1>
                {mentor.title && <p className="text-base text-gray-400 mb-3 text-center sm:text-left">{mentor.title}</p>}
                {mentor.current_position && (
                  <p className="text-sm text-gray-300 mb-4 flex items-center gap-2 justify-center sm:justify-start">
                    <Building2 size={14} className="text-gray-500" />
                    {mentor.current_position}
                  </p>
                )}

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <Stat icon={<Star size={14} />} label="Đánh giá" value={mentor.total_ratings > 0 ? `${mentor.avg_rating.toFixed(1)}/5` : "—"} sub={mentor.total_ratings > 0 ? `${mentor.total_ratings} review` : undefined} />
                  <Stat icon={<Clock size={14} />} label="Số session" value={mentor.completed_sessions.toString()} sub="đã hoàn thành" />
                  <Stat icon={<TrendingUp size={14} />} label="Kinh nghiệm" value={`${mentor.years_experience}+`} sub="năm" />
                </div>

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <BookSessionButton
                    mentorId={mentor.id}
                    mentorSlug={mentor.slug}
                    mentorName={mentor.full_name}
                    hourlyRate={mentor.hourly_rate}
                    freeIntroMinutes={mentor.free_intro_minutes}
                    acceptsBookings={mentor.accepts_bookings}
                  />
                  <div className="flex items-center gap-3 sm:ml-auto justify-center">
                    {mentor.linkedin && (
                      <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                        <Linkedin size={18} />
                      </a>
                    )}
                    {mentor.twitter && (
                      <a href={mentor.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label="Twitter">
                        <Twitter size={18} />
                      </a>
                    )}
                    {mentor.website && (
                      <a href={mentor.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" aria-label="Website">
                        <Globe size={18} />
                      </a>
                    )}
                    {mentor.email_public && (
                      <a href={`mailto:${mentor.email_public}`} className="text-gray-400 hover:text-white" aria-label="Email">
                        <Mail size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="px-4 sm:px-6 pb-20 pt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: bio + expertise + ratings */}
          <div className="lg:col-span-2 space-y-6">
            {mentor.bio && (
              <div className="card-dark p-6">
                <h2 className="font-bold text-white mb-3">Giới thiệu</h2>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{mentor.bio}</p>
              </div>
            )}

            {expertise.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-bold text-white mb-3">Lĩnh vực chuyên môn</h2>
                <div className="flex flex-wrap gap-2">
                  {expertise.map((e) => (
                    <span
                      key={e.slug}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}55` }}
                    >
                      {e.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {ratings.length > 0 && (
              <div className="card-dark p-6">
                <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Star size={16} fill={BRAND} stroke={BRAND} /> Phản hồi từ mentee
                </h2>
                <div className="space-y-4">
                  {ratings.map((r) => (
                    <div key={r.id} className="border-l-2 pl-4" style={{ borderColor: BRAND }}>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i <= r.rating ? BRAND : "transparent"}
                            stroke={BRAND}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-300 italic">&ldquo;{r.feedback}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: side details */}
          <aside className="space-y-6">
            <div className="card-dark p-6">
              <h3 className="font-bold text-white mb-4">Thông tin</h3>
              <dl className="space-y-3 text-sm">
                {mentor.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Languages size={14} className="text-gray-500 mt-0.5" />
                    <div>
                      <dt className="text-gray-500 text-xs">Ngôn ngữ</dt>
                      <dd className="text-gray-200">{mentor.languages.map((l) => (l === "vi" ? "Tiếng Việt" : l === "en" ? "English" : l)).join(", ")}</dd>
                    </div>
                  </div>
                )}
                {mentor.education && (
                  <div className="flex items-start gap-3">
                    <GraduationCap size={14} className="text-gray-500 mt-0.5" />
                    <div>
                      <dt className="text-gray-500 text-xs">Học vấn</dt>
                      <dd className="text-gray-200">{mentor.education}</dd>
                    </div>
                  </div>
                )}
                {mentor.past_companies.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Building2 size={14} className="text-gray-500 mt-0.5" />
                    <div>
                      <dt className="text-gray-500 text-xs">Đã làm việc tại</dt>
                      <dd className="text-gray-200">{mentor.past_companies.join(", ")}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Clock size={14} className="text-gray-500 mt-0.5" />
                  <div>
                    <dt className="text-gray-500 text-xs">Múi giờ</dt>
                    <dd className="text-gray-200">{mentor.timezone}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="card-dark p-6">
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-bold text-white">Phí mentoring</h3>
                <Calendar size={16} className="text-gray-500" />
              </div>
              {mentor.hourly_rate > 0 ? (
                <>
                  <p className="text-3xl font-extrabold text-white">{formatVND(mentor.hourly_rate)}</p>
                  <p className="text-xs text-gray-500 mb-3">mỗi giờ tư vấn 1-1</p>
                </>
              ) : (
                <p className="text-2xl font-extrabold text-emerald-400 mb-3">Miễn phí</p>
              )}
              {mentor.free_intro_minutes > 0 && (
                <p className="text-xs text-gray-400 border-t border-[#1f1f1f] pt-3">
                  + <strong className="text-white">{mentor.free_intro_minutes} phút</strong> intro miễn phí cho lần đầu kết nối
                </p>
              )}
            </div>

            <Link
              href="/mentors"
              className="block text-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Quay lại danh sách mentor
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="text-center sm:text-left p-2 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f]">
      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] uppercase tracking-wider mb-1 justify-center sm:justify-start">
        {icon}
        {label}
      </div>
      <div className="font-bold text-white text-base leading-none">{value}</div>
      {sub && <div className="text-[10px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}
