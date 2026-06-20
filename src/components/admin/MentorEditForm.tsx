"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Trash2, Save } from "lucide-react";
import ThumbnailUpload from "@/components/admin/ThumbnailUpload";
import type { Mentor, MentorExpertise } from "@/types/mentor";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface Props {
  expertise: MentorExpertise[];
  mentor?: Mentor;
}

export default function MentorEditForm({ expertise, mentor }: Props) {
  const router = useRouter();
  const isEdit = !!mentor;
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(mentor?.full_name ?? "");
  const [slug, setSlug] = useState(mentor?.slug ?? "");
  const [title, setTitle] = useState(mentor?.title ?? "");
  const [shortBio, setShortBio] = useState(mentor?.short_bio ?? "");
  const [bio, setBio] = useState(mentor?.bio ?? "");
  const [avatar, setAvatar] = useState(mentor?.avatar ?? "");
  const [currentPosition, setCurrentRole] = useState(mentor?.current_position ?? "");
  const [yearsExperience, setYearsExperience] = useState(mentor?.years_experience ?? 0);
  const [pastCompanies, setPastCompanies] = useState(mentor?.past_companies.join(", ") ?? "");
  const [industries, setIndustries] = useState(mentor?.industries.join(", ") ?? "");
  const [education, setEducation] = useState(mentor?.education ?? "");
  const [languages, setLanguages] = useState(mentor?.languages.join(", ") ?? "vi");
  const [linkedin, setLinkedin] = useState(mentor?.linkedin ?? "");
  const [twitter, setTwitter] = useState(mentor?.twitter ?? "");
  const [website, setWebsite] = useState(mentor?.website ?? "");
  const [emailPublic, setEmailPublic] = useState(mentor?.email_public ?? "");
  const [calendarLink, setCalendarLink] = useState(mentor?.calendar_link ?? "");
  const [hourlyRate, setHourlyRate] = useState(mentor?.hourly_rate ?? 0);
  const [freeIntroMinutes, setFreeIntroMinutes] = useState(mentor?.free_intro_minutes ?? 30);
  const [expertiseTags, setExpertiseTags] = useState<string[]>(mentor?.expertise_tags ?? []);
  const [isActive, setIsActive] = useState(mentor?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(mentor?.is_featured ?? false);
  const [acceptsBookings, setAcceptsBookings] = useState(mentor?.accepts_bookings ?? true);
  const [sortOrder, setSortOrder] = useState(mentor?.sort_order ?? 0);

  function toggleExpertise(tagSlug: string) {
    setExpertiseTags((cur) => (cur.includes(tagSlug) ? cur.filter((t) => t !== tagSlug) : [...cur, tagSlug]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError("Tên đầy đủ không được trống.");
    const finalSlug = slug.trim() || generateSlug(fullName);
    if (!finalSlug) return setError("Slug không hợp lệ.");

    const payload = {
      full_name: fullName.trim(),
      slug: finalSlug,
      title: title.trim() || null,
      short_bio: shortBio.trim() || null,
      bio: bio.trim() || null,
      avatar: avatar.trim() || null,
      current_position: currentPosition.trim() || null,
      years_experience: yearsExperience,
      past_companies: pastCompanies.split(",").map((s) => s.trim()).filter(Boolean),
      industries: industries.split(",").map((s) => s.trim()).filter(Boolean),
      education: education.trim() || null,
      languages: languages.split(",").map((s) => s.trim()).filter(Boolean),
      linkedin: linkedin.trim() || null,
      twitter: twitter.trim() || null,
      website: website.trim() || null,
      email_public: emailPublic.trim() || null,
      calendar_link: calendarLink.trim() || null,
      hourly_rate: hourlyRate,
      free_intro_minutes: freeIntroMinutes,
      expertise_tags: expertiseTags,
      is_active: isActive,
      is_featured: isFeatured,
      accepts_bookings: acceptsBookings,
      sort_order: sortOrder,
    };

    startTransition(async () => {
      const url = isEdit ? `/api/admin/mentors/${mentor!.id}` : "/api/admin/mentors";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Có lỗi xảy ra.");
        return;
      }
      router.push("/admin/mentors");
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!confirm(`Xoá mentor "${mentor!.full_name}"? Sessions liên quan sẽ bị giữ lại.`)) return;
    const res = await fetch(`/api/admin/mentors/${mentor!.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/mentors");
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Không thể xoá.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-dark p-6 space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-300 text-sm rounded-lg p-3">{error}</div>
      )}

      {/* Tên + slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Tên đầy đủ <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (!isEdit) setSlug(generateSlug(e.target.value));
            }}
            className="input-dark w-full"
            placeholder="VD: Nguyễn Văn A"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">
            Slug (URL)
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="input-dark w-full"
            placeholder="nguyen-van-a"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Title / chức danh</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-dark w-full"
          placeholder="VD: Co-Founder & CEO, Acme Vietnam"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Giới thiệu ngắn (1-2 dòng cho card)</label>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          rows={2}
          className="input-dark w-full resize-none"
          placeholder="Founder Acme · 10 năm kinh nghiệm SaaS B2B"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Bio chi tiết</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          className="input-dark w-full resize-y"
          placeholder="Mô tả chi tiết về mentor: kinh nghiệm, thành tựu, phong cách mentoring..."
        />
      </div>

      <div>
        <ThumbnailUpload value={avatar} onChange={(url) => setAvatar(url)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Chức vụ hiện tại</label>
          <input
            type="text"
            value={currentPosition}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="input-dark w-full"
            placeholder="CEO at Acme"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Năm kinh nghiệm</label>
          <input
            type="number"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
            min={0}
            className="input-dark w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Công ty từng làm (cách nhau dấu phẩy)</label>
        <input
          type="text"
          value={pastCompanies}
          onChange={(e) => setPastCompanies(e.target.value)}
          className="input-dark w-full"
          placeholder="Acme, Beta Corp, Gamma Inc"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Ngành (cách nhau dấu phẩy)</label>
        <input
          type="text"
          value={industries}
          onChange={(e) => setIndustries(e.target.value)}
          className="input-dark w-full"
          placeholder="fintech, edtech, b2b-saas"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Học vấn</label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="input-dark w-full"
            placeholder="MBA Harvard, BS Stanford"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Ngôn ngữ (mã, cách nhau dấu phẩy)</label>
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            className="input-dark w-full"
            placeholder="vi, en"
          />
        </div>
      </div>

      <div className="border-t border-[#1f1f1f] pt-5">
        <h3 className="text-sm font-semibold text-white mb-3">Lĩnh vực chuyên môn</h3>
        <div className="flex flex-wrap gap-2">
          {expertise.map((e) => {
            const selected = expertiseTags.includes(e.slug);
            return (
              <button
                key={e.slug}
                type="button"
                onClick={() => toggleExpertise(e.slug)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                style={{
                  background: selected ? `${e.color}22` : "transparent",
                  borderColor: selected ? e.color : "#2a2a2a",
                  color: selected ? e.color : "#9ca3af",
                }}
              >
                {e.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#1f1f1f] pt-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Liên kết & lịch hẹn</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">LinkedIn</label>
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input-dark w-full" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Twitter / X</label>
            <input type="url" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="input-dark w-full" placeholder="https://x.com/..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-dark w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email công khai</label>
            <input type="email" value={emailPublic} onChange={(e) => setEmailPublic(e.target.value)} className="input-dark w-full" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-gray-400 mb-1.5">Calendar link (Calendly, Google Calendar...)</label>
            <input type="url" value={calendarLink} onChange={(e) => setCalendarLink(e.target.value)} className="input-dark w-full" placeholder="https://calendly.com/..." />
          </div>
        </div>
      </div>

      <div className="border-t border-[#1f1f1f] pt-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Phí tư vấn</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phí mỗi giờ (VNĐ) — 0 nếu miễn phí</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
              min={0}
              step={100000}
              className="input-dark w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phút intro miễn phí</label>
            <input
              type="number"
              value={freeIntroMinutes}
              onChange={(e) => setFreeIntroMinutes(parseInt(e.target.value) || 0)}
              min={0}
              max={120}
              className="input-dark w-full"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[#1f1f1f] pt-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Trạng thái</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-blue-500" />
          <span className="text-sm text-gray-300">Đang hoạt động (hiển thị trên trang công khai)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={acceptsBookings} onChange={(e) => setAcceptsBookings(e.target.checked)} className="accent-blue-500" />
          <span className="text-sm text-gray-300">Đang nhận đặt lịch</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-blue-500" />
          <span className="text-sm text-gray-300">Nổi bật (ưu tiên hiển thị đầu trang)</span>
        </label>
        <div className="pt-2">
          <label className="block text-sm text-gray-400 mb-1.5">Thứ tự sắp xếp</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            className="input-dark w-full max-w-[140px]"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#1f1f1f]">
        <button
          type="submit"
          disabled={submitting}
          className="btn-green flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={15} /> Đang lưu...
            </>
          ) : isEdit ? (
            <>
              <Save size={15} /> Lưu thay đổi
            </>
          ) : (
            <>
              <Plus size={15} /> Tạo mentor
            </>
          )}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-red-300 border border-red-500/30 hover:bg-red-500/10 flex items-center gap-2 sm:ml-auto"
          >
            <Trash2 size={15} /> Xoá mentor
          </button>
        )}
      </div>
    </form>
  );
}
