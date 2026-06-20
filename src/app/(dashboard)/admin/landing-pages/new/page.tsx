import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import LandingPageEditor from "@/components/admin/LandingPageEditor";

export const dynamic = "force-dynamic";

export default async function NewLandingPagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "manager", "marketing"].includes(profile.role)) {
    redirect("/dashboard");
  }

  const admin = await createAdminClient();
  const { data: automations } = await admin
    .from("email_automations")
    .select("id, name, status")
    .order("name");

  return (
    <div>
      <TopBar title="Tạo Landing Page" subtitle="Trang thu hút lead / quà tặng" />
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <LandingPageEditor
          mode="create"
          automations={(automations ?? []) as { id: string; name: string; status: string }[]}
        />
      </div>
    </div>
  );
}
