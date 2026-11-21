"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, MapPin, MessageCircle, Minus, Quote, Star, Trash2, X } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { SampleTag } from "@/components/ui";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { earningShort } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
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

export function priceText(p: Pick<Profile, "priceFrom" | "priceTo" | "currency">) {
  const f = (v: number) => formatMoney(v, p.currency);
  return p.priceFrom === p.priceTo ? f(p.priceFrom) : `${f(p.priceFrom)} – ${f(p.priceTo)}`;
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
      <span className="font-display relative text-[15px] tabular-nums">{percent}%</span>
    </span>
  );
}

export function MatchCard({ result, selected, onSelect, starred, onStar, onRemove, onMessage }: MatchCardProps) {
  const { profile: p, percent, checks, foundIn, snippet } = result;
  const isCreator = p.kind === "creator";
  const strong = percent !== null && percent >= 90;
  return (
    <article className={`group/card relative flex h-full flex-col overflow-hidden rounded-[14px] border bg-surface transition-[border-color,box-shadow] duration-300 ${selected ? "border-brand-500 ring-1 ring-brand-500" : "border-line hover:border-muted/60"}`} aria-label={p.name}>
      {/* Cover: the niche they work in, with the match set large */}
      <div className="relative aspect-[16/10] overflow-hidden bg-elevated">
        <Photo photo={nichePhoto(p.category)} sizes="(min-width: 1280px) 420px, (min-width: 640px) 50vw, 100vw" className="photo-zoom" decorative />
        <span className="photo-shade absolute inset-0" aria-hidden="true" />
        <label className="press absolute left-2.5 top-2.5 flex cursor-pointer items-center rounded-lg p-1">
          <input type="checkbox" checked={selected} onChange={onSelect} className="peer sr-only" />
          <span className={`grid h-6 w-6 place-items-center rounded-md border-[1.5px] backdrop-blur-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white ${selected ? "border-signal bg-signal text-on-signal" : "border-white/80 bg-black/20"}`} aria-hidden="true">
            {selected && <Check className="animate-pop h-4 w-4" strokeWidth={3} />}
          </span>
          <span className="sr-only">Select {p.name}</span>
        </label>
        <span className="absolute right-3 top-3">{percent === null && <SampleTag className="border-white/50 bg-black/25 text-white backdrop-blur-sm" />}</span>
        {percent !== null && (
          <p className="absolute inset-x-3 bottom-2.5 flex items-end justify-between text-white" role="img" aria-label={`${percent}% match, ${matchLabel(percent)}`}>
            <span className="font-display text-[52px] leading-[0.85] tabular-nums" aria-hidden="true">{percent}<span className="text-[0.55em]">%</span></span>
            <span className={`mb-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${strong ? "bg-signal text-on-signal" : "bg-black/35 backdrop-blur-sm"}`} aria-hidden="true">{matchLabel(percent)}</span>
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/u/${p.handle}`} className="group flex min-w-0 items-center gap-3">
          <Avatar name={p.name} tone={p.tone} size="md" square={!isCreator} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[16px] font-semibold leading-tight">
              <span className="truncate group-hover:underline">{p.name}</span>
              {p.verified && <VerifiedMark />}
            </span>
            <span className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted">
              @{p.handle}
              <span aria-hidden="true">·</span>
              <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{p.city}</span>
            </span>
          </span>
        </Link>

        {foundIn === "posts" && snippet && (
          <p className="mt-3 flex gap-2 border-l-2 border-signal pl-3 text-[13px] leading-snug">
            <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
            <span><span className="font-semibold">Found in their posts:</span> {snippet}</span>
          </p>
        )}

        <p className="mt-3 flex flex-wrap gap-1">
          {p.niches.map((n) => (
            <span key={n} className="rounded-full bg-elevated px-2 py-0.5 text-[12px] font-medium">{n}</span>
          ))}
          {p.earningModels.slice(0, 3).map((m) => (
            <span key={m} className="rounded-full border border-line px-2 py-0.5 text-[12px] text-muted">{earningShort(m)}</span>
          ))}
          {p.earningModels.length > 3 && <span className="px-1 text-[12px] text-muted">+{p.earningModels.length - 3}</span>}
        </p>

        <dl className="mt-4 grid grid-cols-2 border-y border-line text-[12px]">
          <div className="py-2.5 pr-2">
            <dt className="text-muted">{isCreator ? "Charges per video" : "Pays per video"}</dt>
            <dd className="mt-0.5 text-[14px] font-semibold tabular-nums">{priceText(p)}</dd>
          </div>
          <div className="border-l border-line py-2.5 pl-3">
            <dt className="text-muted">{isCreator ? "Asks commission" : "Pays commission"}</dt>
            <dd className="mt-0.5 text-[14px] font-semibold tabular-nums">{p.commissionPercent !== undefined ? `${p.commissionPercent}%` : "—"}{p.perSale !== undefined ? ` · ${formatMoney(p.perSale, p.currency)}/sale` : ""}</dd>
          </div>
        </dl>

        {percent !== null && (
          <details className="group/why mt-2 text-[13px]">
            <summary className="flex cursor-pointer list-none items-center gap-1 py-1 font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
              Why {percent}%?
              <span className="transition-transform duration-300 group-open/why:rotate-90" aria-hidden="true">›</span>
            </summary>
            <ul className="mt-1.5 space-y-1">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5">
                  {c.score === 1 ? <Check className="h-3.5 w-3.5 text-gain" /> : c.score > 0 ? <Minus className="h-3.5 w-3.5 text-accent-4" /> : <X className="h-3.5 w-3.5 text-loss" />}
                  <span>{c.label}</span>
                  <span className="text-muted">— {c.score === 1 ? "yes" : c.score > 0 ? c.note ?? "partly" : "no"}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-auto flex gap-2 pt-3">
          <button onClick={onMessage} className="press inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-semibold text-on-primary hover:opacity-90">
            <MessageCircle className="h-4 w-4" /> DM
          </button>
          <button
            onClick={onStar}
            aria-pressed={starred}
            aria-label={starred ? `Unstar ${p.name}` : `Star ${p.name}`}
            title={starred ? "Unstar" : "Star"}
            className={`press grid h-10 w-10 place-items-center rounded-full border ${starred ? "border-signal bg-signal text-on-signal" : "border-line text-muted hover:border-brand-300 hover:text-ink"}`}
          >
            <Star className={`h-[18px] w-[18px] ${starred ? "animate-pop fill-current" : ""}`} />
          </button>
          <button onClick={onRemove} aria-label={`Remove ${p.name} from results`} title="Remove from results" className="press grid h-10 w-10 place-items-center rounded-full border border-line text-muted hover:border-danger hover:text-danger">
            <Trash2 className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface" aria-hidden="true">
      <div className="skeleton aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="skeleton h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/3" />
          </div>
        </div>
        <div className="skeleton h-12 w-full" />
        <div className="skeleton h-10 w-full rounded-full" />
      </div>
    </div>
  );
}
