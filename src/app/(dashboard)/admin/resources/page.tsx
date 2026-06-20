import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResourcesAdmin from "./ResourcesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = await createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  const [{ data: categories }, { data: resources }, { data: products }] = await Promise.all([
    admin.from("resource_categories").select("*").order("sort_order", { ascending: true }),
    admin.from("resources").select("*").order("sort_order", { ascending: true }),
    admin.from("products").select("id, slug, title, price").eq("type", "course").order("sort_order", { ascending: true }),
  ]);

  return (
    <ResourcesAdmin
      initialCategories={categories || []}
      initialResources={resources || []}
      initialProducts={products || []}
    />
  );
}
