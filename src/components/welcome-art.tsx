"use client";

import { ArrowUpRight, Check, FolderOpen, Search } from "lucide-react";

/**
 * Landing hero visual: three real-looking product cards (a match, an incoming
 * offer, earnings) stacked in CSS 3D. On desktop the stack tilts toward the
 * pointer; on touch screens it stays still. No canvas, no WebGL: transforms
 * only, so it composites on the GPU and costs almost nothing.
 * Names and numbers are illustrative.
 */
function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-2xl border border-line bg-surface p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_48px_-24px_rgb(0_0_0/0.28)] ${className}`}>{children}</div>;
}

function MatchCard() {
  const pct = 94;
  const c = 2 * Math.PI * 18;
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">New match</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10.5px] font-medium text-brand-700">
          <Search className="h-3 w-3" /> found in posts
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-[13px] font-semibold text-sky-700">DL</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold tracking-[-0.01em]">Dewdrop Labs</p>
          <p className="truncate text-[12px] text-muted">“…our new <span className="mark text-ink">skincare</span> drop…”</p>
        </div>
        <svg viewBox="0 0 44 44" className="h-12 w-12 shrink-0 -rotate-90" aria-label={`${pct}% match`} role="img">
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-elevated)" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke="var(--color-brand-600)" strokeWidth="4" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className="deck-ring" style={{ ["--c" as string]: c }} />
          <text x="22" y="22" textAnchor="middle" dominantBaseline="central" transform="rotate(90 22 22)" className="fill-ink text-[11px] font-semibold">{pct}%</text>
        </svg>
      </div>
    </Card>
  );
}

function OfferCard() {
  return (
    <Card>
      <div className="flex items-center gap-2 text-[11.5px] text-muted">
        <FolderOpen className="h-3.5 w-3.5" /> Brand deals
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-2" aria-label="Unread" />
      </div>
      <p className="mt-2 text-[14px] font-semibold tracking-[-0.01em]">Summer serum launch</p>
      <p className="mt-0.5 text-[12px] text-muted">1 Reel · 2 Stories · usage 30 days</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <p className="text-[22px] font-semibold tracking-[-0.03em] tabular-nums">₹25,000</p>
        <div className="flex gap-1.5">
          <span className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12px] font-medium">Counter</span>
          <span className="inline-flex h-8 items-center gap-1 rounded-full bg-ink px-3 text-[12px] font-medium text-canvas">
            <Check className="h-3.5 w-3.5" /> Accept
          </span>
        </div>
      </div>
    </Card>
  );
}

const BARS = [28, 42, 36, 55, 48, 70, 62, 84];

function EarningsCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Earned this quarter</span>
        <span className="inline-flex items-center gap-0.5 text-[11.5px] font-medium text-brand-600">
          <ArrowUpRight className="h-3.5 w-3.5" /> 32%
        </span>
      </div>
      <p className="mt-1.5 text-[26px] font-semibold tracking-[-0.035em] tabular-nums">₹1,84,500</p>
      <div className="mt-3 flex h-14 items-end gap-1.5" aria-hidden="true">
        {BARS.map((h, i) => (
          <span
            key={i}
            className={`deck-bar flex-1 rounded-[4px] ${i === BARS.length - 1 ? "bg-brand-600" : "bg-elevated"}`}
            style={{ height: `${h}%`, ["--i" as string]: i }}
          />
        ))}
      </div>
    </Card>
  );
}

export function WelcomeArt() {
  return (
    <div
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        e.currentTarget.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.setProperty("--px", "0");
        e.currentTarget.style.setProperty("--py", "0");
      }}
      className="deck relative mx-auto aspect-[1/1.32] w-full max-w-[520px] sm:aspect-[1/1.02]"
    >
      <div className="deck-stage absolute inset-0">
        <div className="deck-layer absolute left-0 top-0 w-[88%] max-w-[320px] sm:top-[3%] sm:w-[74%] [--z:0px]">
          <div className="deck-float [--fd:0s]"><MatchCard /></div>
        </div>
        <div className="deck-layer absolute right-0 top-[30%] w-[90%] max-w-[330px] sm:top-[33%] sm:w-[74%] [--z:70px]">
          <div className="deck-float [--fd:-2.5s]"><OfferCard /></div>
        </div>
        <div className="deck-layer absolute bottom-0 left-[3%] w-[84%] max-w-[300px] sm:bottom-[2%] sm:left-[6%] sm:w-[70%] [--z:140px]">
          <div className="deck-float [--fd:-5s]"><EarningsCard /></div>
        </div>
      </div>
    </div>
  );
}
