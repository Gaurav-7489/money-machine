"use client";

import { Award, CalendarDays, Check, Handshake, Link2, Megaphone, MessageSquareQuote, Mic, Package, RotateCcw, Search, Sprout, Users, Video } from "lucide-react";
import { useGeo } from "@/lib/geo";
import { EARNING_MODELS, NICHES, earningShort } from "@/lib/catalog";
import { currencySymbol, formatMoney } from "@/lib/format";
import { nichePhoto } from "@/lib/photos";
import type { MatchFilters } from "@/lib/match";
import { Photo } from "../photo";
import { inputCls, selectCls } from "../ui";

/** Draft form state: numbers kept as strings while typing. */
export type Draft = Omit<MatchFilters, "priceMin" | "priceMax" | "commission" | "perSale"> & { priceMin: string; priceMax: string; commission: string; perSale: string };
const digits = (v: string) => v.replace(/[^\d]/g, "");
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(digits(v)) || 0);
export const toDraft = (f: MatchFilters): Draft => ({ ...f, priceMin: f.priceMin?.toString() ?? "", priceMax: f.priceMax?.toString() ?? "", commission: f.commission?.toString() ?? "", perSale: f.perSale?.toString() ?? "" });
export const fromDraft = (d: Draft): MatchFilters => ({ ...d, priceMin: numOrNull(d.priceMin), priceMax: numOrNull(d.priceMax), commission: numOrNull(d.commission), perSale: numOrNull(d.perSale) });

const EARN_ICON: Record<string, typeof Link2> = {
  affiliate: Link2,
  ugc: Video,
  brand_deal: Handshake,
  pr_package: Package,
  sponsored: Megaphone,
  review: MessageSquareQuote,
  shoutout: Mic,
  ambassador: Award,
  partnership: Users,
  seeding: Sprout,
  event: CalendarDays,
};

/** Budget presets in the searcher's own currency. */
const BANDS: [number | null, number | null][] = [
  [null, 5000],
  [5000, 20000],
  [20000, 50000],
  [50000, null],
];

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

/** One plain sentence that reads back the brief, so people see exactly what they asked for. */
function BriefSentence({ d, who, currency }: { d: Draft; who: string; currency: string }) {
  const em = (t: string) => <strong className="rounded-[4px] bg-signal/35 px-1 font-semibold text-ink">{t}</strong>;
  const f = (v: string) => formatMoney(Number(v), currency);
  const budget = d.priceMin && d.priceMax ? `${f(d.priceMin)}–${f(d.priceMax)}` : d.priceMin ? `${f(d.priceMin)}+` : d.priceMax ? `up to ${f(d.priceMax)}` : "";
  return (
    <p className="text-[19px] leading-snug tracking-[-0.01em] text-muted" aria-live="polite">
      Show me {em(who)}
      {d.niches.length > 0 && <> in {em(d.niches.slice(0, 3).join(", ") + (d.niches.length > 3 ? ` +${d.niches.length - 3}` : ""))}</>}
      {d.earningModels.length > 0 && <> for {em(d.earningModels.slice(0, 2).map(earningShort).join(" or ") + (d.earningModels.length > 2 ? ` +${d.earningModels.length - 2}` : ""))}</>}
      {d.country && <> in {em([d.cities.slice(0, 2).join(", "), d.country].filter(Boolean).join(", "))}</>}
      {budget && <> around {em(budget)}</>}
      {d.commission && <> with {em(`${d.commission}%`)} commission</>}
      .
    </p>
  );
}

export function FilterBuilder({
  draft,
  setDraft,
  who,
  lookingForCreators,
  currency,
  error,
  liveCount,
  onSubmit,
  onClear,
}: {
  draft: Draft;
  setDraft: (fn: (d: Draft) => Draft) => void;
  /** plural noun for what is being searched: "brands" or "creators" */
  who: string;
  lookingForCreators: boolean;
  currency: string;
  error: string;
  /** how many results the current draft would show */
  liveCount: number;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}) {
  const geo = useGeo();
  const regions = geo && draft.country ? geo.regionsOf(draft.country) : [];
  const sym = currencySymbol(currency);
  const toggle = (key: "niches" | "earningModels" | "cities", v: string) => setDraft((d) => ({ ...d, [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] }));
  const band = BANDS.findIndex(([lo, hi]) => (lo?.toString() ?? "") === draft.priceMin && (hi?.toString() ?? "") === draft.priceMax);
  const short = (v: number) => (v >= 1000 ? `${v / 1000}K` : String(v));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <BriefSentence d={draft} who={who} currency={currency} />

      <Step n={1} title={lookingForCreators ? "What do they create?" : "What do they sell?"} summary={draft.niches.length ? `${draft.niches.length} picked` : "Any niche"}>
        <ul className="grid grid-cols-3 gap-1.5">
          {NICHES.map((n) => {
            const on = draft.niches.includes(n);
            return (
              <li key={n}>
                <button type="button" aria-pressed={on} onClick={() => toggle("niches", n)} className={`press group relative block aspect-square w-full overflow-hidden rounded-[14px] bg-elevated text-left transition-shadow ${on ? "ring-2 ring-signal ring-offset-2 ring-offset-surface" : ""}`}>
                  <Photo photo={nichePhoto(n)} sizes="110px" className={`transition duration-500 ${on ? "scale-105" : "photo-zoom grayscale-[35%]"}`} decorative />
                  <span className={`absolute inset-0 transition-colors ${on ? "bg-black/25" : "bg-black/45 group-hover:bg-black/30"}`} aria-hidden="true" />
                  <span className="absolute inset-x-1.5 bottom-1.5 text-[12px] font-semibold leading-tight text-white">{n}</span>
                  {on && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-signal text-on-signal"><Check className="animate-pop h-3 w-3" strokeWidth={3} /></span>}
                </button>
              </li>
            );
          })}
        </ul>
      </Step>

      <Step n={2} title="How do you want to work?" summary={draft.earningModels.length ? `${draft.earningModels.length} picked` : "Any way"}>
        <ul className="grid grid-cols-2 gap-1.5">
          {EARNING_MODELS.map((m) => {
            const on = draft.earningModels.includes(m.id);
            const Icon = EARN_ICON[m.id] ?? Handshake;
            return (
              <li key={m.id}>
                <button type="button" aria-pressed={on} title={m.hint} onClick={() => toggle("earningModels", m.id)} className={`press flex w-full items-center gap-2 rounded-[14px] border px-2.5 py-2 text-left text-[13px] font-medium transition-colors ${on ? "border-primary bg-primary text-on-primary" : "border-line hover:border-brand-300"}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${on ? "text-signal" : "text-muted"}`} strokeWidth={1.8} />
                  <span className="truncate">{m.short}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Step>

      <Step n={3} title={lookingForCreators ? "Your budget per video" : "Their price per video"} summary={sym}>
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Budget presets">
          {BANDS.map(([lo, hi], i) => (
            <button
              key={i}
              type="button"
              aria-pressed={band === i}
              onClick={() => setDraft((d) => (band === i ? { ...d, priceMin: "", priceMax: "" } : { ...d, priceMin: lo?.toString() ?? "", priceMax: hi?.toString() ?? "" }))}
              className={`press h-10 rounded-full text-[12px] font-semibold tabular-nums transition-colors ${band === i ? "bg-signal text-on-signal" : "border border-line hover:border-brand-300"}`}
            >
              {lo === null ? `<${short(hi!)}` : hi === null ? `${short(lo)}+` : `${short(lo)}–${short(hi)}`}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label><span className="sr-only">Minimum per video</span><input inputMode="numeric" className={inputCls} placeholder={`Min ${sym}`} value={draft.priceMin} onChange={(e) => setDraft((d) => ({ ...d, priceMin: digits(e.target.value) }))} aria-invalid={!!error} /></label>
          <label><span className="sr-only">Maximum per video</span><input inputMode="numeric" className={inputCls} placeholder={`Max ${sym}`} value={draft.priceMax} onChange={(e) => setDraft((d) => ({ ...d, priceMax: digits(e.target.value) }))} aria-invalid={!!error} /></label>
        </div>
        {error && <p role="alert" className="mt-2 text-[12px] text-danger">{error}</p>}
        <label className="mt-4 block">
          <span className="mb-2 flex items-baseline justify-between text-[13px]">
            <span className="font-medium">{lookingForCreators ? "Commission they ask, at most" : "Commission they pay, at least"}</span>
            <span className="font-display text-[20px] tabular-nums">{draft.commission ? `${draft.commission}%` : "Any"}</span>
          </span>
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={draft.commission || 0}
            onChange={(e) => setDraft((d) => ({ ...d, commission: e.target.value === "0" ? "" : e.target.value }))}
            className="w-full accent-[var(--color-ink)]"
            aria-valuetext={draft.commission ? `${draft.commission} percent` : "Any commission"}
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-[13px] font-medium">{lookingForCreators ? `Per sale, at most (${sym})` : `Per sale, at least (${sym})`}</span>
          <input inputMode="numeric" className={inputCls} placeholder="e.g. 150" value={draft.perSale} onChange={(e) => setDraft((d) => ({ ...d, perSale: digits(e.target.value) }))} />
        </label>
      </Step>

      <Step n={4} title="Where?" summary={draft.country ? (geo?.byName(draft.country)?.flag ?? "") + " " + draft.country : "Anywhere"}>
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

      <div className="sticky bottom-0 -mx-5 grid grid-cols-[auto_1fr] gap-2 border-t border-line bg-surface px-5 py-3 lg:-mx-0 lg:bg-canvas lg:px-0">
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
