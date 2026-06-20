import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || `https://${siteConfig.domain}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/blog",
          "/courses",
          "/cafe",
          "/pricing",
          "/terms",
          "/privacy",
          "/refund-policy",
        ],
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/settings",
          "/notifications",
          "/email",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
