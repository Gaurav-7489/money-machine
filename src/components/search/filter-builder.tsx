"use client";

import { Award, CalendarDays, Gift, Handshake, Link2, Megaphone, MessageSquareQuote, Mic, RotateCcw, Search, Sprout, Users, Video, X } from "lucide-react";
import { useGeo } from "@/lib/geo";
import { EARNING_MODELS, earningShort } from "@/lib/catalog";
import { formatMoney } from "@/lib/format";
import type { MatchFilters } from "@/lib/match";
import { PRICE_UNIT, priceKindsFor, type PriceKind } from "@/lib/pricing";
import { PriceFields } from "../price-fields";
import { inputCls, selectCls } from "../ui";

type NumKey = "priceMin" | "priceMax" | "saleMin" | "saleMax" | "viewsMin" | "viewsMax";
const NUM_KEYS: NumKey[] = ["priceMin", "priceMax", "saleMin", "saleMax", "viewsMin", "viewsMax"];
const KEYS: Record<PriceKind, [NumKey, NumKey]> = { video: ["priceMin", "priceMax"], sale: ["saleMin", "saleMax"], views: ["viewsMin", "viewsMax"] };

/** Draft form state: numbers kept as strings while typing. */
export type Draft = Omit<MatchFilters, NumKey> & Record<NumKey, string>;
const digits = (v: string) => v.replace(/[^\d]/g, "");
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(digits(v)) || 0);

export const toDraft = (f: MatchFilters): Draft => {
  const d = { ...f } as unknown as Draft;
  for (const k of NUM_KEYS) d[k] = f[k]?.toString() ?? "";
  return d;
};

/** Prices only count for the ways of working that are picked. */
export const fromDraft = (d: Draft): MatchFilters => {
  const f = { ...d } as unknown as MatchFilters;
  const kinds = priceKindsFor(d.earningModels);
  for (const kind of Object.keys(KEYS) as PriceKind[]) {
    for (const k of KEYS[kind]) f[k] = kinds.includes(kind) ? numOrNull(d[k]) : null;
  }
  return f;
};

/** First price range that is the wrong way round, if any. */
export function draftRangeError(d: Draft): PriceKind | null {
  for (const kind of priceKindsFor(d.earningModels)) {
    const [a, b] = KEYS[kind];
    if (d[a] && d[b] && Number(d[a]) > Number(d[b])) return kind;
  }
  return null;
}

const EARN_ICON: Record<string, typeof Link2> = {
  affiliate: Link2,
  ugc: Video,
  brand_deal: Handshake,
  pr_package: Gift,
  sponsored: Megaphone,
  review: MessageSquareQuote,
  shoutout: Mic,
  ambassador: Award,
  partnership: Users,
  seeding: Sprout,
  event: CalendarDays,
};

function Step({ n, title, summary, children }: { n: number; title: string; summary?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-4">
      <legend className="flex w-full items-baseline gap-2 pb-3">
        <span className="font-display text-[15px] tabular-nums text-muted" aria-hidden="true">{n}</span>
        <span className="text-[15px] font-semibold">{title}</span>
        {summary && <span className="ml-auto truncate pl-2 text-[12px] text-muted">{summary}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

/** One plain sentence that reads back the search, so people see exactly what they asked for. */
function BriefSentence({ d, who, currency }: { d: Draft; who: string; currency: string }) {
  const em = (t: string) => <strong className="rounded-[4px] bg-signal/35 px-1 font-semibold text-ink">{t}</strong>;
  const f = (v: string) => formatMoney(Number(v), currency);
  const range = (kind: PriceKind) => {
    const [a, b] = KEYS[kind];
    const lo = d[a];
    const hi = d[b];
    const t = lo && hi ? `${f(lo)}–${f(hi)}` : lo ? `${f(lo)}+` : hi ? `up to ${f(hi)}` : "";
    return t ? `${t} ${PRICE_UNIT[kind]}` : "";
  };
  const prices = priceKindsFor(d.earningModels).map(range).filter(Boolean);
  return (
    <p className="text-[17px] leading-snug tracking-[-0.01em] text-muted" aria-live="polite">
      Show me {em(who)}
      {d.q.trim() && <> for {em(`“${d.q.trim()}”`)}</>}
      {d.niches.length > 0 && <> in {em(d.niches.slice(0, 3).join(", ") + (d.niches.length > 3 ? ` +${d.niches.length - 3}` : ""))}</>}
      {d.earningModels.length > 0 && <> for {em(d.earningModels.slice(0, 2).map(earningShort).join(" or ") + (d.earningModels.length > 2 ? ` +${d.earningModels.length - 2}` : ""))}</>}
      {d.country && <> in {em([d.cities.slice(0, 2).join(", "), d.country].filter(Boolean).join(", "))}</>}
      {prices.length > 0 && <> at {em(prices.join(", "))}</>}
      .
    </p>
  );
}

/** The search options that open under the search bar: how to work, price, place and name. */
export function FilterBuilder({
  draft,
  setDraft,
  who,
  currency,
  error,
  liveCount,
  onSubmit,
  onClear,
  onClose,
}: {
  draft: Draft;
  setDraft: (fn: (d: Draft) => Draft) => void;
  /** plural noun for what is being searched: "brands" or "creators" */
  who: string;
  currency: string;
  /** which price range is the wrong way round */
  error: PriceKind | null;
  /** how many results the current draft would show */
  liveCount: number;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onClose?: () => void;
}) {
  const geo = useGeo();
  const regions = geo && draft.country ? geo.regionsOf(draft.country) : [];
  const toggle = (key: "earningModels" | "cities", v: string) => setDraft((d) => ({ ...d, [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] }));
  const kinds = priceKindsFor(draft.earningModels);
  const free = draft.earningModels.length > 0 && kinds.length === 0;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="flex items-start gap-3">
        <BriefSentence d={draft} who={who} currency={currency} />
        {onClose && (
          <button type="button" onClick={onClose} className="press -mr-1 -mt-1 ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-elevated hover:text-ink" aria-label="Close search options">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Step n={1} title="How do you want to work?" summary={draft.earningModels.length ? `${draft.earningModels.length} picked` : "Any way"}>
        <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {EARNING_MODELS.map((m) => {
            const on = draft.earningModels.includes(m.id);
            const Icon = EARN_ICON[m.id] ?? Handshake;
            return (
              <li key={m.id}>
                <button type="button" aria-pressed={on} title={m.hint} onClick={() => toggle("earningModels", m.id)} className={`press flex w-full items-center gap-2 rounded-[14px] border px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${on ? "border-primary bg-primary text-on-primary" : "border-line hover:border-brand-300"}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${on ? "text-signal" : "text-muted"}`} strokeWidth={1.8} />
                  <span className="leading-tight">{m.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Step>

      <Step n={2} title="Price">
        {kinds.length > 0 ? (
          <PriceFields
            kinds={kinds}
            currency={currency}
            value={{ video: { min: draft.priceMin, max: draft.priceMax }, sale: { min: draft.saleMin, max: draft.saleMax }, views: { min: draft.viewsMin, max: draft.viewsMax } }}
            onChange={(kind, r) => setDraft((d) => ({ ...d, [KEYS[kind][0]]: r.min, [KEYS[kind][1]]: r.max }))}
            errors={error ? { [error]: "The minimum should be smaller than the maximum." } : {}}
          />
        ) : (
          <p className="text-[13px] text-muted">{free ? "Free PR packages and product seeding are free, so there's no price to set." : "Pick how you want to work above, and the right price boxes show up here."}</p>
        )}
      </Step>

      <Step n={3} title="Where?" summary={draft.country ? (geo?.byName(draft.country)?.flag ?? "") + " " + draft.country : "Anywhere"}>
        <label className="block">
          <span className="sr-only">Country</span>
          <select className={selectCls} value={draft.country} disabled={!geo} onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value, cities: [] }))}>
            <option value="">{geo ? "Anywhere in the world" : "Loading countries…"}</option>
            {!geo && draft.country && <option value={draft.country}>{draft.country}</option>}
            {geo?.countries.map((c) => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
          </select>
        </label>
        {regions.length > 0 && (
          <div className="no-scrollbar mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
            {regions.map((r) => {
              const on = draft.cities.includes(r.name);
              return (
                <button key={r.code + r.name} type="button" aria-pressed={on} onClick={() => toggle("cities", r.name)} className={`press h-8 rounded-full px-3 text-[12px] font-medium transition-colors ${on ? "bg-primary text-on-primary" : "border border-line hover:border-brand-300"}`}>
                  {r.name}
                </button>
              );
            })}
          </div>
        )}
      </Step>

      <details className="group border-t border-line pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
          Know who you want?
          <span className="text-muted transition-transform duration-300 group-open:rotate-90" aria-hidden="true">›</span>
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Search by name</span><input className={inputCls} placeholder="e.g. Aanya" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Search by handle</span><input className={inputCls} placeholder="@handle" autoCapitalize="none" value={draft.social} onChange={(e) => setDraft((d) => ({ ...d, social: e.target.value }))} /></label>
        </div>
      </details>

      <div className="grid grid-cols-[auto_1fr] gap-2 border-t border-line pt-4">
        <button type="button" onClick={onClear} className="press inline-flex h-11 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold hover:border-brand-300">
          <RotateCcw className="h-4 w-4" /> Clear
        </button>
        <button type="submit" className="press inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-on-primary hover:opacity-90">
          <Search className="h-4 w-4" /> Show {liveCount} {liveCount === 1 ? who.replace(/s$/, "") : who}
        </button>
      </div>
    </form>
  );
}
