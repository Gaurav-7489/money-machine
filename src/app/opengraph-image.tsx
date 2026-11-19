import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#F7F6F2", fontFamily: "sans-serif" }}>
        <svg width="96" height="96" viewBox="0 0 32 32">
          <rect width="32" height="32" rx="9" fill="#121211" />
          <path d="M9 22V11.6c0-.9 1.1-1.3 1.7-.7L16 16.4l5.3-5.5c.6-.6 1.7-.2 1.7.7V22" fill="none" stroke="#F7F6F2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="23" r="2" fill="#C8F05A" />
        </svg>
        <div style={{ marginTop: 44, fontSize: 88, fontWeight: 600, color: "#121211", letterSpacing: -3 }}>{SITE.name}</div>
        <div style={{ marginTop: 12, fontSize: 44, color: "#6B6A63", display: "flex" }}>
          Collaborate. Create.&nbsp;<span style={{ color: "#1C7149" }}>Earn.</span>
        </div>
        <div style={{ marginTop: 36, fontSize: 26, color: "#121211", opacity: 0.7 }}>Creators × Brands · Affiliate programs · Income tracking</div>
      </div>
    ),
    size,
  );
}
