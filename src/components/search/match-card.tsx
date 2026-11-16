"use client";

import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, Mail, MapPin, MessageCircle, Minus, Tag, UserPlus, UserCheck, X } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { MatchMeter, SampleTag } from "@/components/ui";
import { earningLabel } from "@/lib/catalog";
import { formatINR } from "@/lib/format";
import { matchLabel, type MatchResult } from "@/lib/match";
import type { Profile } from "@/lib/sample-data";

export interface MatchCardProps {
  result: MatchResult<Profile>;
  selected: boolean;
  onSelect: () => void;
  saved: boolean;
  onSave: () => void;
  following: boolean;
  onFollow: () => void;
  onMessage: () => void;
}

export function priceText(p: Pick<Profile, "priceFrom" | "priceTo">) {
  return p.priceFrom === p.priceTo ? formatINR(p.priceFrom) : `${formatINR(p.priceFrom)} – ${formatINR(p.priceTo)}`;
}

export function MatchCard({ result, selected, onSelect, saved, onSave, following, onFollow, onMessage }: MatchCardProps) {
  const { profile: p, percent, checks } = result;
  const isCreator = p.kind === "creator";
  return (
    <article
      className={`card lift relative flex flex-col p-4 transition-colors ${selected ? "border-brand-400 ring-4 ring-brand-100" : "hover:border-brand-200"}`}
      aria-label={p.name}
    >
      <div className="mb-3 flex items-center justify-between">
        <label className="press -m-1 flex cursor-pointer items-center gap-2 rounded-lg p-1 text-[13px] font-medium text-muted hover:text-ink">
          <input type="checkbox" checked={selected} onChange={onSelect} className="peer sr-only" />
          <span
            className={`grid h-5 w-5 place-items-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 ${selected ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface"}`}
            aria-hidden="true"
          >
            {selected && <Check className="animate-pop h-3.5 w-3.5" strokeWidth={3} />}
          </span>
          <span>{selected ? "Selected" : "Select"}</span>
          <span className="sr-only">{p.name}</span>
        </label>
        <SampleTag />
      </div>

      <Link href={`/u/${p.handle}`} className="group flex items-center gap-3">
        <Avatar name={p.name} tone={p.tone} size="lg" square={!isCreator} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 font-semibold group-hover:underline">
            <span className="truncate">{p.name}</span>
            {p.verified && <VerifiedMark />}
          </span>
          <span className="block truncate text-sm text-muted">@{p.handle}</span>
          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${isCreator ? "bg-rose-50 text-rose-700" : "bg-violet-50 text-violet-700"}`}>
            {isCreator ? "Creator" : "Business"}
          </span>
        </span>
      </Link>

      <ul className="mt-3 space-y-1 text-[13px] text-muted">
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {p.city}, {p.country}</li>
        <li className="flex items-center gap-2"><Tag className="h-4 w-4 shrink-0" /> {p.category} · {p.niche}</li>
      </ul>

      <div className="mt-3">
        {percent === null ? (
          <p className="rounded-xl bg-canvas px-3 py-2 text-[12px] text-muted">Pick a category, place or price to see how well they match.</p>
        ) : (
          <>
            <MatchMeter percent={percent} label={matchLabel(percent)} />
            <details className="mt-1.5 text-[12px]">
              <summary className="cursor-pointer font-medium text-brand-700">Why this match?</summary>
              <ul className="mt-1.5 space-y-1">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-1.5">
                    {c.score === 1 ? <Check className="h-3.5 w-3.5 text-brand-600" /> : c.score > 0 ? <Minus className="h-3.5 w-3.5 text-amber-600" /> : <X className="h-3.5 w-3.5 text-rose-600" />}
                    <span>{c.label}</span>
                    <span className="text-muted">— {c.score === 1 ? "yes" : c.score > 0 ? "close" : "no"}</span>
                  </li>
                ))}
              </ul>
            </details>
          </>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded-xl bg-canvas px-2.5 py-2">
          <dt className="text-muted">{isCreator ? "Charges per post" : "Budget per post"}</dt>
          <dd className="font-semibold">{priceText(p)}</dd>
        </div>
        <div className="rounded-xl bg-canvas px-2.5 py-2">
          <dt className="text-muted">{isCreator ? "Asks per sale" : "Pays per sale"}</dt>
          <dd className="font-semibold">{p.perSale !== undefined ? formatINR(p.perSale) : "Not offered"}</dd>
        </div>
      </dl>
      <p className="mt-2 flex flex-wrap gap-1">
        {p.earningModels.map((m) => (
          <span key={m} className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{earningLabel(m)}</span>
        ))}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 pt-1">
        <button onClick={onMessage} className="press inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand-600 text-[13px] font-semibold text-white hover:bg-brand-700">
          <MessageCircle className="h-4 w-4" /> Message
        </button>
        <button
          onClick={onSave}
          aria-pressed={saved}
          className={`press inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold ${saved ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "border border-line bg-surface hover:bg-canvas"}`}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />} {saved ? "Saved" : "Save"}
        </button>
        <button
          onClick={onFollow}
          aria-pressed={following}
          className={`press inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold ${following ? "border border-line bg-surface" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}
        >
          {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />} {following ? "Following" : isCreator ? "Connect" : "Follow"}
        </button>
        {p.email ? (
          <a href={`mailto:${p.email}?subject=${encodeURIComponent("Collaboration via Money Machine")}`} className="press inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-surface text-[13px] font-semibold hover:bg-canvas">
            <Mail className="h-4 w-4" /> Email
          </a>
        ) : (
          <span className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-1.5 rounded-full border border-dashed border-line text-[12px] text-muted" title="This profile hasn't shared an email. Use Message instead.">
            <Mail className="h-4 w-4" /> No email
          </span>
        )}
      </div>
    </article>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="card space-y-3 p-4" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-2/3" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-2 w-full" />
      <div className="skeleton h-14 w-full" />
      <div className="grid grid-cols-2 gap-2">
        <div className="skeleton h-10 rounded-full" />
        <div className="skeleton h-10 rounded-full" />
      </div>
    </div>
  );
}
