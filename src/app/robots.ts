import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const PRIVATE = ["/home", "/explore", "/create", "/inbox", "/profile", "/affiliates", "/money", "/badges", "/notifications", "/offline"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // Answer engines / AI search crawlers: welcome on public pages
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"], allow: ["/", "/llms.txt"], disallow: PRIVATE },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
