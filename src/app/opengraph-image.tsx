import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #ffffff 0%, #ecfbf5 55%, #d2f5e7 100%)", fontFamily: "sans-serif" }}>
        <svg width="120" height="120" viewBox="0 0 48 48">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2DE3C8" />
              <stop offset="1" stopColor="#0E7A5C" />
            </linearGradient>
          </defs>
          <path d="M6 38V14.5c0-2.6 3.2-3.9 5-2l13 13.6L37 12.5c1.8-1.9 5-.6 5 2V38" fill="none" stroke="url(#g)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="38" r="3.5" fill="#A6E88E" />
        </svg>
        <div style={{ marginTop: 40, fontSize: 84, fontWeight: 800, color: "#0F1A17", letterSpacing: -2 }}>{SITE.name}</div>
        <div style={{ marginTop: 12, fontSize: 44, color: "#5F6F69", display: "flex" }}>
          Collaborate. Create.&nbsp;<span style={{ color: "#0E7A5C", fontWeight: 700 }}>Earn.</span>
        </div>
        <div style={{ marginTop: 36, fontSize: 28, color: "#0B503E" }}>Creators × Brands · Affiliate programs · Income tracking</div>
      </div>
    ),
    size,
  );
}
