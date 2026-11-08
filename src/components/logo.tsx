"use client";

import { useId } from "react";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  const id = `mm-g-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2DE3C8" />
          <stop offset="1" stopColor="#0E7A5C" />
        </linearGradient>
      </defs>
      <path d="M6 38V14.5c0-2.6 3.2-3.9 5-2l13 13.6L37 12.5c1.8-1.9 5-.6 5 2V38" fill="none" stroke={`url(#${id})`} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="38" r="3.5" fill="#A6E88E" />
    </svg>
  );
}

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      {withText && <span className="text-[17px] font-bold tracking-tight text-ink">Money Machine</span>}
    </span>
  );
}
