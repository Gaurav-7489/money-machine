"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, MapPin, MessageCircle, Minus, Quote, Star, Trash2, X } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { SampleTag } from "@/components/ui";
import { earningShort } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { matchLabel, type MatchResult } from "@/lib/match";
import type { Profile } from "@/lib/sample-data";

export interface MatchCardProps {
  result: MatchResult<Profile>;
  selected: boolean;
  onSelect: () => void;
  starred: boolean;
  onStar: () => void;
  onRemove: () => void;
  onMessage: () => void;
}

export function priceText(p: Pick<Profile, "priceFrom" | "priceTo">) {
  return p.priceFrom === p.priceTo ? formatINR(p.priceFrom) : `${formatINR(p.priceFrom)} – ${formatINR(p.priceTo)}`;
}

/** Circular match meter. */
export function MatchRing({ percent, size = 56 }: { percent: number; size?: number }) {
  // draw the ring in after mount so the progress animates
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(percent));
    return () => cancelAnimationFrame(t);
  }, [percent]);
  const r = 22;
  const c = 2 * Math.PI * r;
  const id = `mr-${percent}`;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`${percent}% match, ${matchLabel(percent)}`}>
      <svg viewBox="0 0 52 52" className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: percent >= 50 ? "var(--color-brand-500)" : "var(--color-muted)" }} />
            <stop offset="0.55" style={{ stopColor: percent >= 50 ? "var(--color-accent-2)" : "var(--color-muted)" }} />
            <stop offset="1" style={{ stopColor: percent >= 50 ? "var(--color-accent-1)" : "var(--color-line)" }} />
          </linearGradient>
        </defs>
        <circle cx="26" cy="26" r={r} fill="none" stroke="var(--color-line)" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={`url(#${id})`} strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(shown, 2) / 100)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <span className="relative text-[13px] font-extrabold tabular-nums">{percent}%</span>
    </span>
  );
}

export function MatchCard({ result, selected, onSelect, starred, onStar, onRemove, onMessage }: MatchCardProps) {
  const { profile: p, percent, checks, foundIn, snippet } = result;
  const isCreator = p.kind === "creator";
  return (
    <article className={`card relative flex flex-col p-4 transition-shadow ${selected ? "ring-aurora" : ""}`} aria-label={p.name}>
      <div className="flex items-start gap-3">
        <label className="press -m-1 mt-0.5 flex cursor-pointer items-center rounded-lg p-1">
          <input type="checkbox" checked={selected} onChange={onSelect} className="peer sr-only" />
          <span className={`grid h-6 w-6 place-items-center rounded-lg border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 ${selected ? "border-transparent bg-aurora text-on-accent" : "border-line bg-surface"}`} aria-hidden="true">
            {selected && <Check className="animate-pop h-4 w-4" strokeWidth={3} />}
          </span>
          <span className="sr-only">Select {p.name}</span>
        </label>
        <Link href={`/u/${p.handle}`} className="group flex min-w-0 flex-1 items-center gap-3">
          <Avatar name={p.name} tone={p.tone} size="md" square={!isCreator} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 font-semibold leading-tight group-hover:underline">
              <span className="truncate">{p.name}</span>
              {p.verified && <VerifiedMark />}
            </span>
            <span className="block truncate text-[13px] text-muted">@{p.handle}</span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-muted"><MapPin className="h-3.5 w-3.5 shrink-0" /> {p.city}, {p.country}</span>
          </span>
        </Link>
        {percent !== null ? <MatchRing percent={percent} /> : <SampleTag />}
      </div>

      {foundIn === "posts" && snippet && (
        <p className="mt-3 flex gap-2 rounded-xl bg-brand-50 px-3 py-2 text-[12px] text-brand-800">
          <Quote className="h-3.5 w-3.5 shrink-0" />
          <span><span className="font-semibold">Found in their posts:</span> {snippet}</span>
        </p>
      )}

      <p className="mt-3 flex flex-wrap gap-1">
        {p.niches.map((n) => (
          <span key={n} className="bg-aurora-soft rounded-full px-2 py-0.5 text-[11px] font-semibold text-brand-700">{n}</span>
        ))}
        {p.earningModels.slice(0, 3).map((m) => (
          <span key={m} className="rounded-full bg-elevated px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-line">{earningShort(m)}</span>
        ))}
        {p.earningModels.length > 3 && <span className="px-1 text-[11px] text-muted">+{p.earningModels.length - 3}</span>}
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded-xl bg-elevated px-2.5 py-2">
          <dt className="text-muted">{isCreator ? "Charges per video" : "Pays per video"}</dt>
          <dd className="font-semibold">{priceText(p)}</dd>
        </div>
        <div className="rounded-xl bg-elevated px-2.5 py-2">
          <dt className="text-muted">{isCreator ? "Asks commission" : "Pays commission"}</dt>
          <dd className="font-semibold">{p.commissionPercent !== undefined ? `${p.commissionPercent}%` : "—"}{p.perSale !== undefined ? ` · ${formatINR(p.perSale)}/sale` : ""}</dd>
        </div>
      </dl>

      {percent !== null && (
        <details className="mt-2 text-[12px]">
          <summary className="cursor-pointer font-semibold text-brand-700">{matchLabel(percent)} · why?</summary>
          <ul className="mt-1.5 space-y-1">
            {checks.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                {c.score === 1 ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : c.score > 0 ? <Minus className="h-3.5 w-3.5 text-amber-600" /> : <X className="h-3.5 w-3.5 text-rose-600" />}
                <span>{c.label}</span>
                <span className="text-muted">— {c.score === 1 ? "yes" : c.score > 0 ? c.note ?? "partly" : "no"}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="mt-3 flex gap-2">
        <button onClick={onMessage} className="press btn-glow inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-aurora text-[13px] font-semibold text-on-accent">
          <MessageCircle className="h-4 w-4" /> DM
        </button>
        <button
          onClick={onStar}
          aria-pressed={starred}
          aria-label={starred ? `Unstar ${p.name}` : `Star ${p.name}`}
          title={starred ? "Unstar" : "Star"}
          className={`press grid h-10 w-10 place-items-center rounded-full ${starred ? "bg-amber-50 text-amber-500 ring-1 ring-amber-200" : "border border-line text-muted hover:text-ink"}`}
        >
          <Star className={`h-[18px] w-[18px] ${starred ? "animate-pop fill-current" : ""}`} />
        </button>
        <button onClick={onRemove} aria-label={`Remove ${p.name} from results`} title="Remove from results" className="press grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:bg-rose-50 hover:text-rose-600">
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
      </div>
    </article>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="card space-y-3 p-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
        <div className="skeleton h-14 w-14 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-10 w-full rounded-full" />
    </div>
  );
}
