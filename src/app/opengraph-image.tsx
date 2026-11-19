import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { siteColors } from "@/lib/site-colors";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const { canvas, ink, muted, action } = siteColors();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, backgroundColor: canvas, color: ink, fontFamily: "sans-serif" }}>
        <svg width="120" height="120" viewBox="0 0 48 48">
          <path d="M6 38V14.5c0-2.6 3.2-3.9 5-2l13 13.6L37 12.5c1.8-1.9 5-.6 5 2V38" fill="none" stroke={action} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="38" r="3.5" fill={action} />
        </svg>
        <div style={{ marginTop: 35, fontSize: 84, fontWeight: 700, letterSpacing: -2 }}>{SITE.name}</div>
        <div style={{ marginTop: 12, fontSize: 44, color: muted }}>{SITE.tagline}</div>
        <div style={{ marginTop: 36, fontSize: 28, color: action }}>Creators × Brands · Affiliate programs · Income tracking</div>
      </div>
    ),
    size,
  );
}
