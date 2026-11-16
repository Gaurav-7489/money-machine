"use client";

import { HelpCircle, Lightbulb, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useStore } from "@/lib/store";

type Variant = "primary" | "secondary" | "ghost" | "soft";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-900/10",
  secondary: "bg-surface text-ink border border-line hover:bg-canvas",
  ghost: "text-ink hover:bg-canvas",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
};

const base =
  "press inline-flex items-center justify-center gap-2 rounded-full font-semibold disabled:cursor-not-allowed disabled:opacity-50";
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
      <h1 className="min-w-0 flex-1 truncate text-2xl font-bold tracking-tight">{title}</h1>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="animate-fade-up flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function DeviceNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-cream/70 px-3 py-2 text-[12px] leading-snug text-amber-900">
      {children}
    </p>
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
        {optional && <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">Optional</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[12px] text-rose-600" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 aria-[invalid=true]:border-rose-400";

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-3xl bg-surface p-0 shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-sm max-md:mb-0 max-md:w-full max-md:max-w-none max-md:rounded-b-none"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-base font-bold">{title}</h2>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-canvas" aria-label="Close">
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
      <div className="animate-fade-up rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl">{message}</div>
    </div>
  );
}

/** Small "?" button that explains something in plain words. Works with hover, keyboard focus and tap. */
export function InfoTip({ text, label = "What does this mean?", className = "" }: { text: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  // "pinned" = opened by a click/tap; it then ignores hover-out and stays until dismissed.
  const [pinned, setPinned] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const close = () => {
    setOpen(false);
    setPinned(false);
  };
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  return (
    <span
      ref={ref}
      className={`group relative inline-flex align-middle ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && !pinned && setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => {
          setOpen(true);
          setPinned(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={close}
        onKeyDown={(e) => e.key === "Escape" && close()}
        className="grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-left text-[12px] font-normal leading-snug text-white shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}

/** A friendly one-time hint. Closing it is remembered on this device. */
export function Tip({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { dismissedTips, toggle, ready } = useStore();
  if (!ready || dismissedTips.includes(id)) return null;
  return (
    <div role="note" className="animate-fade-up mb-4 flex gap-3 rounded-[var(--radius-card)] border border-brand-200 bg-brand-50 p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-brand-600">
        <Lightbulb className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-brand-800">{title}</p>
        <div className="mt-0.5 text-ink/80">{children}</div>
      </div>
      <button onClick={() => toggle("dismissedTips", id)} className="-m-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-ink" aria-label="Close tip">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Horizontal progress bar for a match percentage. */
export function MatchMeter({ percent, label }: { percent: number; label: string }) {
  const color = percent >= 90 ? "bg-brand-500" : percent >= 75 ? "bg-brand-400" : percent >= 50 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-semibold">{label}</span>
        <span className="font-bold tabular-nums">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas ring-1 ring-line" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${percent}%`}>
        <div className={`h-full rounded-full transition-[width] duration-700 ${color}`} style={{ width: `${Math.max(percent, 3)}%` }} />
      </div>
    </div>
  );
}

export const selectCls =
  "w-full appearance-none rounded-xl border border-line bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%235f6f69%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat px-3.5 py-2.5 pr-10 text-[15px] outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:opacity-50";
