"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { formatMoney } from "@/lib/format";
import { matchLabel, type MatchResult } from "@/lib/match";
import type { Profile } from "@/lib/sample-data";

/** "₹5,000 – ₹20,000", "₹5,000", or null when there's no price. */
export function rangeText(from: number | undefined, to: number | undefined, currency?: string): string | null {
  if (from === undefined && to === undefined) return null;
  const f = (v: number) => formatMoney(v, currency);
  if (from !== undefined && to !== undefined) return from === to ? f(from) : `${f(from)} – ${f(to)}`;
  return f((from ?? to)!);
}

export function priceText(p: Pick<Profile, "priceFrom" | "priceTo" | "currency">) {
  return rangeText(p.priceFrom, p.priceTo, p.currency) ?? "—";
}

/** Circular match meter: an aqua arc that sweeps in once. */
export function MatchRing({ percent, size = 56 }: { percent: number; size?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(percent));
    return () => cancelAnimationFrame(t);
  }, [percent]);
  const r = 22;
  const c = 2 * Math.PI * r;
  const strong = percent >= 70;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${percent}% match, ${matchLabel(percent)}`}>
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={strong ? "var(--color-signal)" : "var(--color-muted)"} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(shown, 2) / 100)} className="transition-[stroke-dashoffset] duration-1000 ease-[var(--ease-out-expo)]" />
      </svg>
      <span className={`font-display relative tabular-nums ${size < 50 ? "text-[12px]" : "text-[15px]"}`}>{percent}%</span>
    </span>
  );
}

/**
 * One result in Search: a small tile with the photo, the name and the match %.
 * Everything else lives on their profile, one tap away.
 */
export function MatchRow({ result, selected, onSelect }: { result: MatchResult<Profile>; selected: boolean; onSelect: () => void }) {
  const { profile: p, percent } = result;
  return (
    <div className={`flex items-center gap-2 rounded-2xl border bg-surface pl-2 pr-3 transition-colors ${selected ? "border-brand-500 ring-1 ring-brand-500" : "border-line hover:border-muted/60"}`}>
      <label className="press flex shrink-0 cursor-pointer items-center p-1.5">
        <input type="checkbox" checked={selected} onChange={onSelect} className="peer sr-only" />
        <span className={`grid h-6 w-6 place-items-center rounded-md border-[1.5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 ${selected ? "border-signal bg-signal text-on-signal" : "border-line"}`} aria-hidden="true">
          {selected && <Check className="animate-pop h-4 w-4" strokeWidth={3} />}
        </span>
        <span className="sr-only">Select {p.name}</span>
      </label>
      <Link href={`/u/${p.handle}`} className="group flex min-w-0 flex-1 items-center gap-3 py-2.5">
        <Avatar name={p.name} tone={p.tone} size="md" square={p.kind === "business"} />
        <span className="flex min-w-0 flex-1 items-center gap-1 text-[15px] font-semibold leading-tight">
          <span className="truncate group-hover:underline">{p.name}</span>
          {p.verified && <VerifiedMark />}
        </span>
        {percent !== null ? <MatchRing percent={percent} size={46} /> : <span className="text-[12px] text-muted">—</span>}
      </Link>
    </div>
  );
}

export function MatchRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3" aria-hidden="true">
      <div className="skeleton h-6 w-6 rounded-md" />
      <div className="skeleton h-11 w-11 rounded-full" />
      <div className="skeleton h-4 flex-1" />
      <div className="skeleton h-10 w-10 rounded-full" />
    </div>
  );
}
