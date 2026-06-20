import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/server";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import PublicHeader from "@/components/layout/PublicHeader";
import { Users, Star, MessageCircle, GraduationCap } from "lucide-react";
import type { Mentor, MentorExpertise } from "@/types/mentor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Chuyên gia & Mentor 1-1 — ${siteConfig.name}`,
  description:
    "Kết nối 1-1 với các chuyên gia khởi nghiệp hàng đầu Việt Nam. Đặt lịch tư vấn, mentoring, gọi vốn, go-to-market — bởi VINEN.",
  alternates: { canonical: `${getBaseUrl()}/mentors` },
};

const BRAND = siteConfig.colors.brand;

function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "₫";
}

export default async function MentorsPage() {
  const admin = await createAdminClient();

  const [{ data: mentorsData }, { data: expertiseData }] = await Promise.all([
    admin
      .from("mentors")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("avg_rating", { ascending: false }),
    admin.from("mentor_expertise").select("*").order("sort_order", { ascending: true }),
  ]);

  const mentors = (mentorsData ?? []) as Mentor[];
  const expertise = (expertiseData ?? []) as MentorExpertise[];
  const expertiseBySlug = new Map(expertise.map((e) => [e.slug, e]));

  return (
    <div className="min-h-screen text-white" style={{ background: siteConfig.colors.background }}>
      <PublicHeader />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{ background: `${BRAND}1a`, color: BRAND, border: `1px solid ${BRAND}55` }}
          >
            <Users size={14} /> Mạng lưới chuyên gia của VINEN
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-4">
            Kết Nối 1-1 với{" "}
            <span style={{ color: BRAND }}>Chuyên Gia Khởi Nghiệp</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Các founder, nhà đầu tư và chuyên gia hàng đầu Việt Nam sẵn sàng đồng hành cùng bạn —
            từ pitch deck đến go-to-market, từ tuyển dụng đến gọi vốn.
          </p>
        </div>
      </section>

      {/* Expertise filter chips */}
      {expertise.length > 0 && (
        <section className="px-4 sm:px-6 mb-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/mentors"
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={{
                  borderColor: BRAND,
                  background: `${BRAND}22`,
                  color: "#fff",
                }}
              >
                Tất cả ({mentors.length})
              </Link>
              {expertise.map((tag) => {
                const count = mentors.filter((m) => m.expertise_tags.includes(tag.slug)).length;
                if (count === 0) return null;
                return (
                  <Link
                    key={tag.slug}
                    href={`/mentors?expertise=${tag.slug}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-[#2a2a2a] text-gray-300 hover:border-[#444] hover:text-white transition-colors"
                  >
                    {tag.label} <span className="text-gray-500">({count})</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mentor grid */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {mentors.length === 0 ? (
            <div className="card-dark p-12 text-center">
              <GraduationCap size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-semibold text-white mb-1">Đang cập nhật danh sách mentor</p>
              <p className="text-sm text-gray-500">
                Mạng lưới chuyên gia của VINEN sẽ ra mắt sớm. Quay lại sau nhé.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mentors.map((m) => (
                <Link
                  key={m.id}
                  href={`/mentors/${m.slug}`}
                  className="card-dark overflow-hidden flex flex-col group hover:border-[#444] transition-colors"
                >
                  {/* Cover + avatar */}
                  <div
                    className="relative h-28"
                    style={{
                      background: m.cover_image
                        ? `url(${m.cover_image}) center/cover`
                        : `linear-gradient(135deg, ${BRAND}55, #0f172a)`,
                    }}
                  >
                    {m.is_featured && (
                      <span
                        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: BRAND, color: "#0a0a0a" }}
                      >
                        ★ Nổi bật
                      </span>
                    )}
                  </div>
                  <div className="px-5 pb-5 flex-1 flex flex-col -mt-10">
                    {/* Avatar */}
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-[#0a0a0a] bg-[#1a1a1a] mb-3">
                      {m.avatar ? (
                        <Image src={m.avatar} alt={m.full_name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold" style={{ color: BRAND }}>
                          {m.full_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Name + title */}
                    <h3 className="font-bold text-white text-lg leading-tight mb-1 group-hover:text-[--brand] transition-colors" style={{ ["--brand" as never]: BRAND }}>
                      {m.full_name}
                    </h3>
                    {m.title && <p className="text-xs text-gray-400 mb-3 line-clamp-1">{m.title}</p>}

                    {/* Short bio */}
                    {m.short_bio && (
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{m.short_bio}</p>
                    )}

                    {/* Expertise tags */}
                    {m.expertise_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {m.expertise_tags.slice(0, 3).map((slug) => {
                          const e = expertiseBySlug.get(slug);
                          if (!e) return null;
                          return (
                            <span
                              key={slug}
                              className="px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}44` }}
                            >
                              {e.label}
                            </span>
                          );
                        })}
                        {m.expertise_tags.length > 3 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-500">
                            +{m.expertise_tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="mt-auto pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-3">
                        {m.total_ratings > 0 && (
                          <span className="flex items-center gap-1">
                            <Star size={11} fill={BRAND} stroke={BRAND} />
                            <span className="text-white font-semibold">{m.avg_rating.toFixed(1)}</span>
                            <span className="text-gray-500">({m.total_ratings})</span>
                          </span>
                        )}
                        {m.completed_sessions > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle size={11} />
                            {m.completed_sessions} session
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {m.hourly_rate > 0 ? (
                          <span className="font-bold text-white">{formatVND(m.hourly_rate)}<span className="text-gray-500 font-normal text-[10px]">/giờ</span></span>
                        ) : (
                          <span className="font-bold text-emerald-400">Miễn phí</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
