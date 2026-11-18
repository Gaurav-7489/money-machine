"use client";

import { BadgeCheck, Handshake, Heart, Link2, Sparkles } from "lucide-react";
import { useRef } from "react";

/**
 * Original editorial collage for the landing hero: two photographic portrait
 * panels, geometric shapes and floating UI chips, layered at different depths.
 * Every colour comes from the theme tokens, so the same artwork reads as
 * pastel in White and neon in Dark. Pointer parallax on desktop only.
 */
function Portrait({ variant }: { variant: "creator" | "brand" }) {
  const creator = variant === "creator";
  // Independent editorial photographs instead of using the reference brand's imagery.
  const photo = creator
    ? "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=720&q=85&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=720&q=85&auto=format&fit=crop";
  return (
    <div
      className="relative h-full w-full overflow-hidden bg-gradient-to-br from-brand-200 via-rose-100 to-amber-100"
      style={{ backgroundImage: `linear-gradient(180deg, transparent 65%, rgba(13,11,20,.28)), url("${photo}")`, backgroundPosition: "center", backgroundSize: "cover" }}
      role="img"
      aria-label={creator ? "Editorial creator portrait" : "Editorial business collaboration photograph"}
    >
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" />
    </div>
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
