import { redirect, notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import TopBar from "@/components/layout/TopBar";
import LandingPageEditor from "@/components/admin/LandingPageEditor";

export const dynamic = "force-dynamic";

export default async function EditLandingPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  const { data: page, error } = await admin
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !page) notFound();

  // Fetch list of active automations for the picker.
  const { data: automations } = await admin
    .from("email_automations")
    .select("id, name, status")
    .order("name");

  return (
    <div>
      <TopBar title="Sửa Landing Page" subtitle={page.title} />
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <LandingPageEditor
          mode="edit"
          initial={page}
          automations={(automations ?? []) as { id: string; name: string; status: string }[]}
        />
      </div>
    </div>
  );
}
