"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "soft";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-action text-on-accent hover:bg-action-hover",
  secondary: "bg-surface text-ink border border-line hover:bg-elevated",
  ghost: "text-ink hover:bg-elevated",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const base =
  "press inline-flex items-center justify-center gap-2 rounded-control font-semibold disabled:cursor-not-allowed disabled:opacity-50";
const sizes = { sm: "h-9 px-3.5 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[15px]" };

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <button className={`${base} ${VARIANTS[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: keyof typeof sizes }) {
  return <Link className={`${base} ${VARIANTS[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function SampleTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent ring-1 ring-accent/30 ${className}`}
      title="Fictional sample content for the development preview"
    >
      Sample
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-brand-50 text-brand-700",
    approved: "bg-brand-50 text-brand-700",
    pending: "bg-accent-soft text-accent",
    paused: "bg-elevated text-muted",
    draft: "bg-elevated text-muted",
    rejected: "bg-danger-soft text-danger",
    withdrawn: "bg-elevated text-muted",
    closed: "bg-elevated text-muted",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? "bg-elevated text-muted"}`}>
      {status}
    </span>
  );
}

export function PageHeader({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-1.5">
      {back && (
        <Link href={back} className="press -ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-surface" aria-label="Back" title="Back">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      )}
      <h1 className="min-w-0 flex-1 truncate text-[26px] font-bold">{title}</h1>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-10 text-center">
      <div className="bg-brand-50 mb-3 grid h-14 w-14 place-items-center rounded-2xl text-brand-700 ring-1 ring-line">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  optional,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  /** shows a small "Optional" marker next to the label */
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">Optional</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[12px] text-danger" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-control border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none transition-colors placeholder:text-muted/70 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 aria-[invalid=true]:border-danger";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      d.removeAttribute("data-closing");
      if (!d.open) d.showModal();
    }
    if (!open && d.open) {
      // play the closing animation, then close
      const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      d.setAttribute("data-closing", "");
      const t = setTimeout(() => {
        d.removeAttribute("data-closing");
        d.close();
      }, quick ? 0 : 210);
      return () => clearTimeout(t);
    }
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-auto w-[min(32rem,calc(100%-2rem))] overflow-hidden rounded-panel border border-line bg-surface p-0 text-ink shadow-panel backdrop:bg-scrim/55 max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="press grid h-10 w-10 place-items-center rounded-control hover:bg-elevated" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-5 py-4 pb-safe">{children}</div>
    </dialog>
  );
}

export function Toast({ message, onDone }: { message: string | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div role="status" className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-8">
      <div className="animate-fade-up rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-surface shadow-xl">{message}</div>
    </div>
  );
}

/** Horizontal progress bar for a match percentage. */
export function MatchMeter({ percent, label }: { percent: number; label: string }) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-semibold tabular-nums text-brand-700">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated ring-1 ring-line" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${value}%`}>
        <div className="h-full origin-left rounded-full bg-brand-500 transition-transform duration-300" style={{ transform: `scaleX(${value / 100})` }} />
      </div>
    </div>
  );
}

export const selectCls = `${inputCls} disabled:opacity-50`;
