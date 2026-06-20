import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import MentorEditForm from "@/components/admin/MentorEditForm";
import type { MentorExpertise } from "@/types/mentor";

export const dynamic = "force-dynamic";

export default async function NewMentorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "manager"].includes(profile.role)) redirect("/dashboard");

  const { data: expertiseData } = await admin
    .from("mentor_expertise")
    .select("*")
    .order("sort_order", { ascending: true });

  const expertise = (expertiseData ?? []) as MentorExpertise[];

  return (
    <div>
      <TopBar title="Thêm Mentor" subtitle="Tạo profile mentor mới cho mạng lưới VINEN" />
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <MentorEditForm expertise={expertise} />
      </div>
    </div>
  );
}
