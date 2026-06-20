import type { Metadata } from "next";
import { getBaseUrl, siteConfig } from "@/lib/site-config";
import HomePage from "./HomePage";

const BASE_URL = getBaseUrl();

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: {
    canonical: BASE_URL,
  },
};

export default function Page() {
  return <HomePage />;
}
