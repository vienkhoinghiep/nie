import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import MentorEditForm from "@/components/admin/MentorEditForm";
import type { MentorExpertise, Mentor } from "@/types/mentor";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMentorPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) redirect("/dashboard");

  const [{ data: mentorData }, { data: expertiseData }] = await Promise.all([
    admin.from("mentors").select("*").eq("id", id).maybeSingle(),
    admin.from("mentor_expertise").select("*").order("sort_order", { ascending: true }),
  ]);

  if (!mentorData) notFound();
  const mentor = mentorData as Mentor;
  const expertise = (expertiseData ?? []) as MentorExpertise[];

  return (
    <div>
      <TopBar title={`Chỉnh sửa: ${mentor.full_name}`} subtitle="Cập nhật thông tin mentor" />
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <MentorEditForm expertise={expertise} mentor={mentor} />
      </div>
    </div>
  );
}
