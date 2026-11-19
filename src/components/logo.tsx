export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={`${className} text-brand-700`} aria-hidden="true">
      <path d="M6 38V14.5c0-2.6 3.2-3.9 5-2l13 13.6L37 12.5c1.8-1.9 5-.6 5 2V38" fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="38" r="3.5" fill="currentColor" />
    </svg>
  );
}

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      {withText && <span className="font-display text-[18px] font-bold tracking-tight text-ink">Money Machine</span>}
    </span>
  );
}
