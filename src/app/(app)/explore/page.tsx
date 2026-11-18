"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckSquare, RotateCcw, Search, SearchX, Send, SlidersHorizontal, Sparkles, Square, Star, Undo2, X } from "lucide-react";
import { useFeedback } from "@/components/feedback";
import { BulkDm } from "@/components/search/bulk-dm";
import { MatchCard, MatchCardSkeleton } from "@/components/search/match-card";
import { Button, EmptyState, InfoTip, Sheet, inputCls } from "@/components/ui";
import { COUNTRIES, EARNING_MODELS, LOCATIONS, NICHES } from "@/lib/catalog";
import { EMPTY_FILTERS, MATCH_LEVELS, activeFilterCount, countAtLeast, filtersFromParams, filtersFromProfile, filtersToParams, findMatches, type MatchFilters } from "@/lib/match";
import { SEARCHABLE_PROFILES } from "@/lib/sample-data";
import { usePostIndex } from "@/lib/search-index";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

const digits = (v: string) => v.replace(/[^\d]/g, "");
const numOrNull = (v: string) => (v.trim() === "" ? null : Number(digits(v)) || 0);

function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button type="button" aria-pressed={on} title={title} onClick={onClick} className={`press h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${on ? "bg-aurora text-white shadow-sm" : "border border-line bg-surface text-ink hover:border-brand-300"}`}>
      {children}
    </button>
  );
}

function Group({ title, hint, optional, children }: { title: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2.5 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-2 flex items-center gap-1.5 text-[14px] font-bold">
        {title}
        {optional && <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">Optional</span>}
        {hint && <InfoTip text={hint} />}
      </legend>
      {children}
    </fieldset>
  );
}

/** Draft form state: numbers kept as strings while typing. */
type Draft = Omit<MatchFilters, "priceMin" | "priceMax" | "commission" | "perSale"> & { priceMin: string; priceMax: string; commission: string; perSale: string };
const toDraft = (f: MatchFilters): Draft => ({ ...f, priceMin: f.priceMin?.toString() ?? "", priceMax: f.priceMax?.toString() ?? "", commission: f.commission?.toString() ?? "", perSale: f.perSale?.toString() ?? "" });
const fromDraft = (d: Draft): MatchFilters => ({ ...d, priceMin: numOrNull(d.priceMin), priceMax: numOrNull(d.priceMax), commission: numOrNull(d.commission), perSale: numOrNull(d.perSale) });

function FilterForm({ draft, setDraft, role, error, onSubmit, onClear }: { draft: Draft; setDraft: (fn: (d: Draft) => Draft) => void; role: "creator" | "business"; error: string; onSubmit: (e: React.FormEvent) => void; onClear: () => void }) {
  const lookingForCreators = draft.kind !== "business";
  const cities = draft.country ? LOCATIONS[draft.country] ?? [] : [];
  const toggle = (key: "niches" | "earningModels" | "cities", v: string) => setDraft((d) => ({ ...d, [key]: d[key].includes(v) ? d[key].filter((x) => x !== v) : [...d[key], v] }));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Group title={role === "business" ? "What type of content creator?" : lookingForCreators ? "What type of creator?" : "What are you looking for?"} hint={lookingForCreators ? "Pick one or more. We also check their posts, so creators who post about it show up even if it's not in their bio." : "Pick one or more. We also check brands' posts, so they show up even if their bio doesn't say it."}>
        <div className="flex flex-wrap gap-1.5">
          {NICHES.map((n) => <Chip key={n} on={draft.niches.includes(n)} onClick={() => toggle("niches", n)}>{n}</Chip>)}
        </div>
      </Group>

      <Group title="Means of earning">
        <div className="flex flex-wrap gap-1.5">
          {EARNING_MODELS.map((m) => <Chip key={m.id} on={draft.earningModels.includes(m.id)} onClick={() => toggle("earningModels", m.id)} title={m.hint}>{m.label}</Chip>)}
        </div>
      </Group>

      <Group title={lookingForCreators ? "Pay per video (₹)" : "Price range per video (₹)"} hint={lookingForCreators ? "What the creator charges for one video or reel." : "What the brand usually pays for one video or reel."}>
        <div className="grid grid-cols-2 gap-2">
          <label><span className="sr-only">Minimum per video</span><input inputMode="numeric" className={inputCls} placeholder="Min e.g. 3000" value={draft.priceMin} onChange={(e) => setDraft((d) => ({ ...d, priceMin: digits(e.target.value) }))} aria-invalid={!!error} /></label>
          <label><span className="sr-only">Maximum per video</span><input inputMode="numeric" className={inputCls} placeholder="Max e.g. 25000" value={draft.priceMax} onChange={(e) => setDraft((d) => ({ ...d, priceMax: digits(e.target.value) }))} aria-invalid={!!error} /></label>
        </div>
        {error && <p role="alert" className="text-[12px] text-rose-600">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">{lookingForCreators ? "Commission up to %" : "Commission at least %"}</span>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 15" value={draft.commission} onChange={(e) => setDraft((d) => ({ ...d, commission: digits(e.target.value).slice(0, 2) }))} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">{lookingForCreators ? "Per sale up to ₹" : "Per sale at least ₹"}</span>
            <input inputMode="numeric" className={inputCls} placeholder="e.g. 150" value={draft.perSale} onChange={(e) => setDraft((d) => ({ ...d, perSale: digits(e.target.value) }))} />
          </label>
        </div>
      </Group>

      <Group title="Country / city" hint="Tap a country, then tap one or more cities. Someone in the same country but another city counts as a partial match.">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <Chip on={!draft.country} onClick={() => setDraft((d) => ({ ...d, country: "", cities: [] }))}>Anywhere</Chip>
          {COUNTRIES.map((c) => <Chip key={c} on={draft.country === c} onClick={() => setDraft((d) => ({ ...d, country: d.country === c ? "" : c, cities: [] }))}>{c}</Chip>)}
        </div>
        {cities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cities.map((c) => <Chip key={c} on={draft.cities.includes(c)} onClick={() => toggle("cities", c)}>{c}</Chip>)}
          </div>
        )}
      </Group>

      <Group title="Know who you want?" optional>
        <div className="grid grid-cols-2 gap-2">
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Search by name</span><input className={inputCls} placeholder="e.g. Aanya" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Search by handle</span><input className={inputCls} placeholder="@handle" autoCapitalize="none" value={draft.social} onChange={(e) => setDraft((d) => ({ ...d, social: e.target.value }))} /></label>
        </div>
      </Group>

      <div className="sticky bottom-0 -mx-5 grid grid-cols-[auto_1fr] gap-2 border-t border-line bg-surface px-5 py-3 lg:static lg:mx-0 lg:border-0 lg:p-0">
        <Button type="button" variant="secondary" onClick={onClear}><RotateCcw className="h-4 w-4" /> Clear</Button>
        <Button type="submit"><Search className="h-4 w-4" /> Show matches</Button>
      </div>
    </form>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useFeedback();
  const { session, starredProfiles, hiddenProfiles, toggle, setMany } = useStore();
  const { startThread, bulkDaysLeft } = useThreads();
  const posts = usePostIndex();
  const role = session?.role ?? "creator";
  const defaultKind = role === "business" ? "creator" : "business";

  const urlFilters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const custom = params.get("mode") === "custom" || activeFilterCount({ ...urlFilters, q: "" }) > 0;
  const kind = urlFilters.kind === "all" ? defaultKind : urlFilters.kind;
  const matched = useMemo(() => (session ? { ...filtersFromProfile(session), kind } : { ...EMPTY_FILTERS, kind }), [session, kind]);
  const applied: MatchFilters = custom ? { ...urlFilters, kind } : { ...matched, q: urlFilters.q };
  const level = Number(params.get("match") ?? 0) || 0;

  const [q, setQ] = useState(urlFilters.q);
  const [draft, setDraftState] = useState<Draft>(toDraft(applied));
  const [sheet, setSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [error, setError] = useState("");
  const setDraft = (fn: (d: Draft) => Draft) => setDraftState(fn);

  useEffect(() => setQ(urlFilters.q), [urlFilters.q]);
  useEffect(() => setDraftState(toDraft(applied)), [params, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const pool = useMemo(() => SEARCHABLE_PROFILES.filter((p) => !hiddenProfiles.includes(p.handle)), [hiddenProfiles]);
  const live = { ...applied, q };
  const scored = useMemo(() => findMatches(pool, live, 0, posts), [pool, JSON.stringify(live), posts]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = level ? scored.filter((r) => r.percent !== null && r.percent >= level) : scored;
  const hasScores = scored.some((r) => r.percent !== null);

  useEffect(() => {
    setSelected((s) => s.filter((h) => results.some((r) => r.profile.handle === h)));
  }, [results.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function go(f: MatchFilters, extra: Record<string, string> = {}, isCustom = true) {
    if (!isCustom) {
      const p = new URLSearchParams();
      if (f.q) p.set("q", f.q);
      if (f.kind !== defaultKind) p.set("type", f.kind);
      if (level) p.set("match", String(level));
      router.replace(`/explore${p.size ? `?${p}` : ""}`, { scroll: false });
      return;
    }
    const qs = filtersToParams({ ...f, kind: f.kind === defaultKind ? "all" : f.kind }, { mode: activeFilterCount({ ...f, q: "" }) === 0 ? "custom" : "", match: level ? String(level) : "", ...extra });
    router.replace(`/explore${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const f = fromDraft(draft);
    if (f.priceMin !== null && f.priceMax !== null && f.priceMin > f.priceMax) return setError("The minimum should be smaller than the maximum.");
    setError("");
    setSheet(false);
    setLoading(true);
    setTimeout(() => {
      go({ ...f, q, kind });
      setLoading(false);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  }

  function clearAll() {
    setDraftState(toDraft({ ...EMPTY_FILTERS, kind }));
    setQ("");
    setError("");
    setSelected([]);
    go({ ...EMPTY_FILTERS, kind });
    toast("Filters cleared", "info");
  }

  function setLevel(v: number) {
    const qs = new URLSearchParams(params.toString());
    if (v) qs.set("match", String(v));
    else qs.delete("match");
    router.replace(`/explore${qs.size ? `?${qs}` : ""}`, { scroll: false });
  }

  function setKind(k: "creator" | "business") {
    go({ ...applied, q, kind: k }, {}, custom);
  }

  const handles = results.map((r) => r.profile.handle);
  const allSelected = handles.length > 0 && handles.every((h) => selected.includes(h));
  const recipients = SEARCHABLE_PROFILES.filter((p) => selected.includes(p.handle));
  const count = activeFilterCount(applied);
  const who = kind === "creator" ? "creators" : "brands";

  return (
    <div className="mx-auto max-w-6xl pb-24">
      <header className="mb-4">
        <h1 className="text-[26px] font-extrabold tracking-tight">
          Find <span className="text-aurora">{who}</span>
        </h1>
        <p className="mt-0.5 text-sm text-muted">{role === "business" ? "Creators that fit what you're looking for, ranked by match %." : "Brands that fit what you make, ranked by match %."}</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); go({ ...applied, q }, {}, custom); }} className="relative" role="search">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-500" />
        <label htmlFor="explore-q" className="sr-only">Search by keyword, name or handle</label>
        <input
          id="explore-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Try “skincare”: we search bios and posts`}
          className="h-[52px] w-full rounded-full border border-line bg-surface pl-12 pr-24 text-[15px] shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); go({ ...applied, q: "" }, {}, custom); }} className="absolute right-[58px] top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-canvas" aria-label="Clear search text">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="button" onClick={() => setSheet(true)} className="press absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-aurora text-white lg:hidden" aria-label={`Filters${count ? `, ${count} on` : ""}`}>
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-surface">{count}</span>}
        </button>
      </form>

      <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
        <button
          onClick={() => router.replace(`/explore${kind !== defaultKind ? `?type=${kind}` : ""}`, { scroll: false })}
          aria-pressed={!custom}
          className={`press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold ${!custom ? "bg-aurora text-white" : "border border-line bg-surface"}`}
        >
          <Sparkles className="h-4 w-4" /> Matched to you
        </button>
        <button onClick={() => setSheet(true)} aria-pressed={custom} className={`press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold lg:hidden ${custom ? "bg-ink text-surface" : "border border-line bg-surface"}`}>
          <SlidersHorizontal className="h-4 w-4" /> Custom search{custom && count ? ` · ${count}` : ""}
        </button>
        <span className="mx-1 h-5 w-px shrink-0 bg-line" />
        {(["creator", "business"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`press h-9 shrink-0 rounded-full px-3.5 text-[13px] font-semibold ${kind === k ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200" : "text-muted hover:text-ink"}`}>
            {k === "creator" ? "Creators" : "Brands"}
          </button>
        ))}
      </div>

      {!custom && (
        <p className="bg-aurora-soft mt-3 rounded-2xl px-4 py-3 text-[13px]">
          <Sparkles className="mr-1 inline h-4 w-4 text-brand-600" />
          {applied.niches.length || applied.earningModels.length ? (
            <>Showing {who} for your setup: <strong>{[...applied.niches, ...EARNING_MODELS.filter((m) => applied.earningModels.includes(m.id)).map((m) => m.short)].slice(0, 5).join(", ")}</strong>. Tap <strong>Custom search</strong> to change it.</>
          ) : (
            <>Tell us what you&apos;re looking for in your profile and we&apos;ll match you automatically. Or use <strong>Custom search</strong>.</>
          )}
        </p>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="card sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal className="h-4 w-4 text-brand-600" /> Custom search</h2>
            <FilterForm draft={draft} setDraft={setDraft} role={role} error={error} onSubmit={apply} onClear={clearAll} />
          </div>
        </aside>

        <section id="results" aria-label="Results" aria-busy={loading} className="min-w-0 scroll-mt-24">
          <div className="no-scrollbar -mx-4 mb-3 flex gap-2 overflow-x-auto px-4" role="radiogroup" aria-label="Minimum match">
            {MATCH_LEVELS.map((v) => {
              const n = countAtLeast(scored, v);
              const on = level === v;
              const disabled = v > 0 && !hasScores;
              return (
                <button
                  key={v}
                  role="radio"
                  aria-checked={on}
                  disabled={disabled}
                  onClick={() => setLevel(v)}
                  className={`press flex h-12 shrink-0 flex-col items-center justify-center rounded-2xl px-4 leading-tight disabled:opacity-40 ${on ? "bg-ink text-surface" : "border border-line bg-surface"}`}
                >
                  <span className="text-[13px] font-bold">{v === 0 ? "All" : `${v}%+`}</span>
                  <span className={`text-[11px] ${on ? "opacity-80" : "text-muted"}`}>{n} {n === 1 ? "match" : "matches"}</span>
                </button>
              );
            })}
            <InfoTip className="self-center" text="The % is how many of your filters a profile meets. Pick 90%+ to see only near-perfect fits, or 50%+ to see more people." />
          </div>

          <div className="mb-3 flex items-center gap-3">
            <button type="button" onClick={() => setSelected(allSelected ? [] : handles)} disabled={!handles.length} className="press inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold disabled:opacity-40">
              {allSelected ? <CheckSquare className="h-4 w-4 text-brand-600" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Deselect all" : `Select all${level ? ` ${level}%+` : ""} (${handles.length})`}
            </button>
            <p className="ml-auto text-sm font-semibold" aria-live="polite">{loading ? "Searching…" : `${results.length} ${results.length === 1 ? who.slice(0, -1) : who}`}</p>
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <MatchCardSkeleton key={i} />)}</div>
          ) : results.length ? (
            <ul key={params.toString()} className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((r, i) => (
                <li key={r.profile.handle} style={{ ["--i" as string]: Math.min(i, 6) }}>
                  <MatchCard
                    result={r}
                    selected={selected.includes(r.profile.handle)}
                    onSelect={() => setSelected((s) => (s.includes(r.profile.handle) ? s.filter((h) => h !== r.profile.handle) : [...s, r.profile.handle]))}
                    starred={starredProfiles.includes(r.profile.handle)}
                    onStar={() => {
                      const was = starredProfiles.includes(r.profile.handle);
                      toggle("starredProfiles", r.profile.handle);
                      toast(was ? `${r.profile.name} unstarred` : `${r.profile.name} starred ⭐`, was ? "info" : "success");
                    }}
                    onRemove={() => {
                      toggle("hiddenProfiles", r.profile.handle);
                      toast(`${r.profile.name} removed from your results`, "info");
                    }}
                    onMessage={() => router.push(`/inbox/${startThread(r.profile.handle)}`)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card">
              <EmptyState
                icon={<SearchX className="h-5 w-5" />}
                title="No matches found. Try changing your filters."
                body={level ? "Pick a lower match % like 50%+, or All." : "Remove a filter or try a broader word like “beauty” or “fitness”."}
                action={<Button variant="soft" onClick={clearAll}><RotateCcw className="h-4 w-4" /> Clear filters</Button>}
              />
            </div>
          )}

          {hiddenProfiles.length > 0 && (
            <button onClick={() => { setMany("hiddenProfiles", hiddenProfiles, false); toast("Removed profiles are back", "info"); }} className="mx-auto mt-4 flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
              <Undo2 className="h-4 w-4" /> Restore {hiddenProfiles.length} removed {hiddenProfiles.length === 1 ? "profile" : "profiles"}
            </button>
          )}
          <p className="mt-3 text-center text-xs text-muted">Profiles shown are fictional samples for this preview.</p>
        </section>
      </div>

      {selected.length > 0 && (
        <div className="animate-fade-up fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-full bg-ink p-1.5 pl-4 text-surface shadow-2xl md:bottom-6">
          <span className="mr-auto text-sm font-bold">{selected.length} selected</span>
          <button onClick={() => { setMany("starredProfiles", selected, true); toast(`${selected.length} starred ⭐`); }} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Star selected" title="Star selected">
            <Star className="h-5 w-5" />
          </button>
          <button onClick={() => setSelected([])} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Clear selection" title="Clear selection">
            <X className="h-5 w-5" />
          </button>
          <button onClick={() => setBulkOpen(true)} className="press btn-glow inline-flex h-10 items-center gap-1.5 rounded-full bg-aurora px-4 text-sm font-bold text-white">
            <Send className="h-4 w-4" /> Bulk DM{bulkDaysLeft > 0 ? ` · ${bulkDaysLeft}d` : ""}
          </button>
        </div>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Custom search">
        {sheet && <FilterForm draft={draft} setDraft={setDraft} role={role} error={error} onSubmit={apply} onClear={clearAll} />}
      </Sheet>
      <BulkDm open={bulkOpen} onClose={() => setBulkOpen(false)} recipients={recipients} onSent={() => setSelected([])} />
    </div>
  );
}

export default function Explore() {
  return (
    <Suspense>
      <ExploreInner />
    </Suspense>
  );
}
