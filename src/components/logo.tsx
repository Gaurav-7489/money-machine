/**
 * Money Machine mark: an ink tile with a single-stroke "M" and a signal dot
 * (the "coin" that drops out of the machine). Colours come from theme tokens.
 */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--color-ink)" />
      <path d="M9 22V11.6c0-.9 1.1-1.3 1.7-.7L16 16.4l5.3-5.5c.6-.6 1.7-.2 1.7.7V22" fill="none" stroke="var(--color-canvas)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="23" r="2" fill="var(--color-signal)" />
    </svg>
  );
}

export function Logo({ withText = true }: { withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      {withText && <span className="text-[16px] font-semibold tracking-[-0.02em] text-ink">Money Machine</span>}
    </span>
  );
}
