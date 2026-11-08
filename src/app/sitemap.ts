import type { MetadataRoute } from "next";
import { AUDIENCES, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}${AUDIENCES.creators.path}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}${AUDIENCES.brands.path}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/onboarding`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
