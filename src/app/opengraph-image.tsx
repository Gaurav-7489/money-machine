import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#ECEEE7", fontFamily: "sans-serif", color: "#0F1A14" }}>
        <svg width="96" height="96" viewBox="0 0 48 48">
          <path d="M6 38V14.5c0-2.6 3.2-3.9 5-2l13 13.6L37 12.5c1.8-1.9 5-.6 5 2V38" fill="none" stroke="#0F1A14" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="38.5" r="4.25" fill="#F2B705" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -4, lineHeight: 0.92 }}>Create. Collab.</div>
          <div style={{ display: "flex", fontSize: 132, fontWeight: 800, letterSpacing: -4, lineHeight: 0.92 }}>
            <span style={{ background: "#F2B705", padding: "0 18px" }}>Cash out.</span>
          </div>
          <div style={{ marginTop: 36, fontSize: 30, color: "#5B675F" }}>{SITE.name} · Brand deals, affiliate programs and UGC for creators and businesses</div>
        </div>
      </div>
    ),
    size,
  );
}
