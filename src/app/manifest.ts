import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Money Machine",
    short_name: "Money Machine",
    description: "Collaborate. Create. Earn.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F5F8F7",
    theme_color: "#0E7A5C",
    categories: ["social", "business", "finance"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Create", url: "/create" },
      { name: "Inbox", url: "/inbox" },
      { name: "Money", url: "/money" },
    ],
  };
}
