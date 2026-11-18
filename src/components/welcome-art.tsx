"use client";

import { BadgeCheck, Handshake, Heart, Link2, Sparkles } from "lucide-react";
import { useRef } from "react";

/**
 * Original editorial collage for the landing hero: two "cutout" portrait
 * panels, geometric shapes and floating UI chips, layered at different depths.
 * Every colour comes from the theme tokens, so the same artwork reads as
 * pastel in White and neon in Dark. Pointer parallax on desktop only.
 */
function Portrait({ variant }: { variant: "creator" | "brand" }) {
  const c = variant === "creator";
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: c ? "var(--color-accent-2)" : "var(--color-accent-1)" }} />
          <stop offset="1" style={{ stopColor: c ? "var(--color-accent-3)" : "var(--color-accent-4)" }} />
        </linearGradient>
        <clipPath id={`clip-${variant}`}>
          <rect width="200" height="260" rx="34" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${variant})`}>
        <rect width="200" height="260" fill={`url(#bg-${variant})`} />
        {/* halftone-ish rings */}
        <circle cx={c ? 160 : 40} cy="60" r="70" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1.5" />
        <circle cx={c ? 160 : 40} cy="60" r="48" fill="none" stroke="rgb(255 255 255 / 0.28)" strokeWidth="1.5" />
        {/* figure */}
        <path d={c ? "M28 260 C 34 196, 70 176, 100 176 S 168 196, 174 260 Z" : "M20 260 C 30 200, 66 182, 100 182 S 172 200, 180 260 Z"} fill="rgb(13 11 18 / 0.88)" />
        <path d="M86 150 h28 v34 a14 14 0 0 1 -28 0 Z" fill={c ? "#c98a6b" : "#8d5b44"} />
        <ellipse cx="100" cy="118" rx="38" ry="44" fill={c ? "#e0a586" : "#a26a4f"} />
        {c ? (
          <path d="M60 116 C 56 66, 96 58, 112 66 C 140 64, 150 96, 140 128 C 136 104, 124 92, 104 92 C 84 92, 70 100, 64 132 Z" fill="#241329" />
        ) : (
          <path d="M64 104 C 64 70, 136 66, 138 104 C 128 92, 112 88, 100 88 C 86 88, 72 92, 64 104 Z" fill="#1b1220" />
        )}
        {/* sunglasses for the creator, collar for the brand */}
        {c ? (
          <g fill="rgb(13 11 18 / 0.9)">
            <rect x="72" y="110" width="24" height="14" rx="6" />
            <rect x="104" y="110" width="24" height="14" rx="6" />
            <rect x="94" y="114" width="12" height="3" />
          </g>
        ) : (
          <path d="M78 196 L100 222 L122 196" fill="none" stroke="rgb(255 255 255 / 0.85)" strokeWidth="5" strokeLinejoin="round" />
        )}
        {/* cutout stripe */}
        <rect x={c ? -20 : 120} y="0" width="34" height="260" fill="rgb(255 255 255 / 0.18)" transform={c ? "skewX(-8)" : "skewX(8)"} />
      </g>
    </svg>
  );
}

function Chip({ icon, children, className = "" }: { icon: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <span className={`glass absolute inline-flex items-center gap-1.5 rounded-full border border-line/70 px-3 py-2 text-[12px] font-bold text-ink shadow-lg ${className}`}>
      {icon}
      {children}
    </span>
  );
}

export function WelcomeArt() {
  const ref = useRef<HTMLDivElement>(null);
  const layer = (depth: number) => ({ transform: `translate3d(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px), 0)` });

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
        e.currentTarget.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--px", "0");
        e.currentTarget.style.setProperty("--py", "0");
      }}
      className="relative mx-auto aspect-[1/1.05] w-full max-w-[440px] [&>*]:transition-transform [&>*]:duration-500 [&>*]:ease-out"
      aria-hidden="true"
    >
      {/* colour field */}
      <div style={layer(6)} className="bg-aurora-flow absolute inset-[8%] rounded-full opacity-70 blur-2xl" />
      {/* geometric cutouts */}
      <div style={layer(14)} className="absolute left-[4%] top-[10%] h-20 w-20 rounded-[28px] border-2 border-dashed border-brand-400/60" />
      <div style={layer(-10)} className="bg-aurora absolute bottom-[6%] right-[8%] h-16 w-16 rounded-full" />
      <div style={layer(18)} className="absolute right-[2%] top-[4%] h-0 w-0 border-x-[22px] border-b-[38px] border-x-transparent border-b-accent-4" />
      {/* portraits */}
      <div style={layer(-16)} className="absolute left-[6%] top-[16%] h-[62%] w-[46%]">
        <div style={{ ["--r" as string]: "-6deg" }} className="animate-float h-full w-full overflow-hidden rounded-[34px] shadow-2xl ring-4 ring-surface">
          <Portrait variant="creator" />
        </div>
      </div>
      <div style={layer(12)} className="absolute bottom-[10%] right-[6%] h-[58%] w-[44%]">
        <div style={{ ["--r" as string]: "5deg" }} className="h-full w-full overflow-hidden rounded-[34px] shadow-2xl ring-4 ring-surface [animation:float_8s_ease-in-out_-3s_infinite]">
          <Portrait variant="brand" />
        </div>
      </div>
      {/* deal handshake */}
      <div style={layer(4)} className="absolute left-[calc(50%-2rem)] top-[calc(50%-2rem)] grid h-16 w-16 place-items-center rounded-2xl bg-surface text-brand-600 shadow-xl ring-1 ring-line">
        <Handshake className="h-8 w-8" />
      </div>
      {/* floating UI */}
      <div style={layer(22)} className="absolute inset-0">
        <Chip icon={<Sparkles className="h-4 w-4 text-accent-2" />} className="left-[38%] top-[6%]">Perfect match</Chip>
        <Chip icon={<BadgeCheck className="h-4 w-4 text-brand-600" />} className="bottom-[4%] left-[2%]">Brand deal</Chip>
        <Chip icon={<Link2 className="h-4 w-4 text-accent-1" />} className="right-[-2%] top-[34%] max-sm:hidden">Affiliate</Chip>
        <Chip icon={<Heart className="h-4 w-4 fill-accent-3 text-accent-3" />} className="bottom-[34%] left-[-4%] max-sm:hidden">UGC</Chip>
      </div>
    </div>
  );
}
