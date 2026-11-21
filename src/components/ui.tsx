"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "signal";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10 dark:bg-primary dark:text-on-primary",
  signal: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10 dark:bg-primary dark:text-on-primary",
  secondary: "bg-surface text-ink border border-line hover:bg-canvas",
  ghost: "text-ink hover:bg-canvas",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const base =
  "press inline-flex items-center justify-center gap-2 rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50";
const sizes = { sm: "h-8 px-3.5 text-[13px]", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-[15px]" };

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
      className={`inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 ${className}`}
      title="Fictional sample content for the development preview"
    >
      Sample
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700",
    approved: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    paused: "bg-slate-100 text-slate-600",
    draft: "bg-slate-100 text-slate-600",
    rejected: "bg-rose-50 text-rose-700",
    withdrawn: "bg-slate-100 text-slate-600",
    closed: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

/** Page title: bold, friendly and calm, with an optional action. */
export function PageHeader({ title, back, action, lede }: { title: string; back?: string; action?: ReactNode; lede?: ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5">
        {back && (
          <Link href={back} className="press -ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-surface" aria-label="Back" title="Back">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight">{title}</h1>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {lede && <p className="mt-1 max-w-xl text-sm text-muted">{lede}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 max-w-xs text-sm text-muted">{body}</p>
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
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink">
        {label}
        {optional && <span className="text-[12px] font-normal text-muted">(optional)</span>}
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
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-muted/70 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-danger";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.removeAttribute("data-closing");
      d.showModal();
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
      className="m-auto w-[min(32rem,calc(100%-2rem))] overflow-hidden rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/35 backdrop:backdrop-blur-[3px] max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none"
    >
      <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden="true" />
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <button onClick={onClose} className="press grid h-9 w-9 place-items-center rounded-full hover:bg-elevated" aria-label="Close">
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
      <div className="animate-fade-up rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas shadow-xl">{message}</div>
    </div>
  );
}

/** Horizontal progress bar for a match percentage. */
export function MatchMeter({ percent, label }: { percent: number; label: string }) {
  const color = percent >= 90 ? "bg-brand-600" : percent >= 70 ? "bg-brand-400" : percent >= 50 ? "bg-accent-4" : "bg-muted/40";
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${percent}%`}>
        <div className={`h-full rounded-full transition-[width] duration-700 ${color}`} style={{ width: `${Math.max(percent, 3)}%` }} />
      </div>
    </div>
  );
}

export const selectCls =
  "w-full appearance-none rounded-xl border border-line bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235f6f69%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat px-3.5 py-2.5 pr-10 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:opacity-50";
