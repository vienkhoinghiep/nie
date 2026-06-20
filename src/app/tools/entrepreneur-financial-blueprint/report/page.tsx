import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasBlueprintAccess } from "@/lib/blueprint/access";
import type {
  BlueprintData,
  BlueprintProgress,
} from "@/lib/blueprint/types";
import { siteConfig } from "@/lib/site-config";
import PremiumReport from "./PremiumReport";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Báo cáo Entrepreneur Financial Blueprint | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default async function ReportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?next=" +
        encodeURIComponent("/tools/entrepreneur-financial-blueprint/report")
    );
  }

  const hasAccess = await hasBlueprintAccess(user.id);
  if (!hasAccess) {
    redirect("/tools/entrepreneur-financial-blueprint");
  }

  // Dùng admin client để fetch — đã verify auth + access ở trên.
  const admin = await createAdminClient();
  const { data: row } = await admin
    .from("financial_blueprints")
    .select("data, progress, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const blueprintData: BlueprintData = (row?.data as BlueprintData) ?? {};
  const progress: BlueprintProgress = (row?.progress as BlueprintProgress) ?? {};

  return (
    <PremiumReport
      data={blueprintData}
      progress={progress}
      userEmail={user.email ?? ""}
      updatedAt={row?.updated_at ?? null}
    />
  );
}
