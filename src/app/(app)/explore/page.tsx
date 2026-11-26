"use client";

import { TabIndicator } from "@/components/motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckSquare, RotateCcw, Search, SearchX, Send, Square, Star, Undo2, X } from "lucide-react";
import { useFeedback } from "@/components/feedback";
import { BulkDm } from "@/components/search/bulk-dm";
import { MatchRow, MatchRowSkeleton } from "@/components/search/match-card";
import { Button, EmptyState } from "@/components/ui";
import { NICHES } from "@/lib/catalog";
import { Photo } from "@/components/photo";
import { nichePhoto } from "@/lib/photos";
import { DEFAULT_CURRENCY } from "@/lib/format";
import { FilterBuilder, draftRangeError, fromDraft, toDraft, type Draft } from "@/components/search/filter-builder";
import { EMPTY_FILTERS, MATCH_LEVELS, activeFilterCount, countAtLeast, filtersFromParams, filtersFromProfile, filtersToParams, findMatches, type MatchFilters } from "@/lib/match";
import type { PriceKind } from "@/lib/pricing";
import { SEARCHABLE_PROFILES } from "@/lib/sample-data";
import { usePostIndex } from "@/lib/search-index";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useFeedback();
  const { session, hiddenProfiles, setMany } = useStore();
  const { bulkDaysLeft } = useThreads();
  const posts = usePostIndex();
  const role = session?.role ?? "creator";
  // Search always looks across: creators find businesses, businesses find creators.
  // People on your own side are found from Friends.
  const kind: "creator" | "business" = role === "business" ? "creator" : "business";
  const currency = session?.currency ?? DEFAULT_CURRENCY;

  const urlFilters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const applied: MatchFilters = { ...urlFilters, kind, currency };
  const level = Number(params.get("match") ?? 0) || 0;
  // With nothing searched yet, the % still means something: how well each one fits your own profile.
  const fromProfile = useMemo(() => (session ? { ...filtersFromProfile(session), kind } : { ...EMPTY_FILTERS, kind }), [session, kind]);

  const [q, setQ] = useState(urlFilters.q);
  const [draft, setDraftState] = useState<Draft>(toDraft(applied));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [error, setError] = useState<PriceKind | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const setDraft = (fn: (d: Draft) => Draft) => setDraftState(fn);

  useEffect(() => setQ(urlFilters.q), [urlFilters.q]);
  useEffect(() => setDraftState(toDraft(applied)), [params, session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tapping outside the search box, or pressing Escape, folds the options away.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const pool = useMemo(() => SEARCHABLE_PROFILES.filter((p) => !hiddenProfiles.includes(p.handle)), [hiddenProfiles]);
  const scoringFor = (f: MatchFilters, text: string): MatchFilters => (activeFilterCount({ ...f, q: "" }) > 0 ? { ...f, q: text } : { ...fromProfile, q: text });
  const live = scoringFor(applied, q);
  const scored = useMemo(() => findMatches(pool, live, 0, posts), [pool, JSON.stringify(live), posts]); // eslint-disable-line react-hooks/exhaustive-deps
  const results = level ? scored.filter((r) => r.percent !== null && r.percent >= level) : scored;
  const hasScores = scored.some((r) => r.percent !== null);
  const draftFilters = { ...fromDraft({ ...draft, q }), kind, currency };
  const liveCount = useMemo(() => findMatches(pool, scoringFor(draftFilters, q), 0, posts).filter((r) => !level || (r.percent ?? 0) >= level).length, [pool, JSON.stringify(draftFilters), q, level, posts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelected((s) => s.filter((h) => results.some((r) => r.profile.handle === h)));
  }, [results.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function go(f: MatchFilters) {
    const qs = filtersToParams({ ...f, kind: "all" }, { match: level ? String(level) : "" });
    router.replace(`/explore${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const bad = draftRangeError(draft);
    if (bad) return setError(bad);
    setError(null);
    setOpen(false);
    setLoading(true);
    setTimeout(() => {
      go({ ...fromDraft(draft), q, kind });
      setLoading(false);
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }

  function clearAll() {
    setDraftState(toDraft({ ...EMPTY_FILTERS, kind }));
    setQ("");
    setError(null);
    setSelected([]);
    go({ ...EMPTY_FILTERS, kind });
    toast("Search cleared", "info");
  }

  function setLevel(v: number) {
    const qs = new URLSearchParams(params.toString());
    if (v) qs.set("match", String(v));
    else qs.delete("match");
    router.replace(`/explore${qs.size ? `?${qs}` : ""}`, { scroll: false });
  }

  const handles = results.map((r) => r.profile.handle);
  const allSelected = handles.length > 0 && handles.every((h) => selected.includes(h));
  const recipients = SEARCHABLE_PROFILES.filter((p) => selected.includes(p.handle));
  const who = kind === "creator" ? "creators" : "brands";
  const searching = activeFilterCount(applied) > 0;

  return (
    <div className="mx-auto max-w-4xl pb-24">
      <header className="mb-5">
        <h1 className="text-xl font-bold tracking-tight">Find {who}</h1>
      </header>

      <div ref={boxRef} className="relative">
        <form onSubmit={apply} role="search" className="relative">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          <label htmlFor="explore-q" className="sr-only">Search</label>
          <input
            id="explore-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setOpen(true)}
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Search e.g. makeup, skin care, lifestyle"
            aria-expanded={open}
            aria-controls="search-options"
            className="h-14 w-full rounded-full border border-line bg-surface pl-13 pr-12 text-[17px] outline-none transition-colors placeholder:text-muted/80 hover:border-muted/60 focus:border-brand-400"
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); go({ ...applied, q: "" }); }} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-elevated" aria-label="Clear search text">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {open && (
          <div id="search-options" className="animate-fade-up card mt-2 p-5">
            <FilterBuilder draft={draft} setDraft={setDraft} who={who} currency={currency} error={error} liveCount={liveCount} onSubmit={apply} onClear={clearAll} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>

      {/* The niches as photo tiles: one tap filters */}
      <ul className="no-scrollbar -mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1" aria-label="Pick a niche">
        {NICHES.map((n) => {
          const on = applied.niches.includes(n);
          return (
            <li key={n} className="snap-start">
              <button
                type="button"
                aria-pressed={on}
                onClick={() => go({ ...applied, q, niches: on ? applied.niches.filter((x) => x !== n) : [...applied.niches, n] })}
                className={`press relative block h-[88px] w-[88px] overflow-hidden rounded-[18px] bg-elevated text-left ${on ? "ring-2 ring-signal ring-offset-2 ring-offset-canvas" : ""}`}
              >
                <Photo photo={nichePhoto(n)} sizes="88px" className={on ? "scale-105" : "grayscale-[30%]"} decorative />
                <span className={`absolute inset-0 ${on ? "bg-black/25" : "bg-black/45"}`} aria-hidden="true" />
                <span className="absolute inset-x-2 bottom-1.5 text-[12px] font-semibold leading-tight text-white">{n}</span>
                {on && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-signal text-on-signal"><Check className="h-3 w-3" strokeWidth={3} /></span>}
              </button>
            </li>
          );
        })}
      </ul>

      <section id="results" aria-label="Results" aria-busy={loading} className="mt-6 min-w-0 scroll-mt-24">
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
                className={`press relative isolate flex h-12 shrink-0 flex-col items-center justify-center rounded-full px-5 leading-tight disabled:opacity-40 ${on ? "text-on-primary" : "border border-line hover:border-brand-300"}`}
              >
                {on && <TabIndicator group="match" variant="pill" />}
                <span className="text-[14px] font-semibold tabular-nums">{v === 0 ? "All" : `${v}%+`}</span>
                <span className={`text-[11px] ${on ? "opacity-80" : "text-muted"}`}>{n} {v === 0 ? who : n === 1 ? "match" : "matches"}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-3 flex items-center gap-3">
          <button type="button" onClick={() => setSelected(allSelected ? [] : handles)} disabled={!handles.length} className="press inline-flex h-10 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] font-semibold hover:border-brand-300 disabled:opacity-40">
            {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
            {allSelected ? "Deselect all" : `Select all (${handles.length})`}
          </button>
          {searching && (
            <button type="button" onClick={clearAll} className="press inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-muted hover:text-ink">
              <RotateCcw className="h-4 w-4" /> Clear search
            </button>
          )}
          <p className="ml-auto text-sm tabular-nums text-muted" aria-live="polite">{loading ? "Searching…" : `${results.length} ${results.length === 1 ? who.slice(0, -1) : who}`}</p>
        </div>

        {loading ? (
          <div className="grid gap-2 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <MatchRowSkeleton key={i} />)}</div>
        ) : results.length ? (
          <ul key={params.toString()} className="stagger grid gap-2 sm:grid-cols-2">
            {results.map((r, i) => (
              <li key={r.profile.handle} style={{ ["--i" as string]: Math.min(i, 8) }}>
                <MatchRow result={r} selected={selected.includes(r.profile.handle)} onSelect={() => setSelected((s) => (s.includes(r.profile.handle) ? s.filter((h) => h !== r.profile.handle) : [...s, r.profile.handle]))} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-y border-line">
            <EmptyState
              icon={<SearchX className="h-5 w-5" />}
              title="No one found. Try another word."
              body={level ? "Pick a lower match % like 50%+, or All." : "Try a broader word like “beauty” or “fitness”, or clear your search."}
              action={<Button variant="soft" onClick={clearAll}><RotateCcw className="h-4 w-4" /> Clear search</Button>}
            />
          </div>
        )}

        {hiddenProfiles.length > 0 && (
          <button onClick={() => { setMany("hiddenProfiles", hiddenProfiles, false); toast("Removed profiles are back", "info"); }} className="mx-auto mt-6 flex items-center gap-1.5 text-[13px] font-semibold hover:underline">
            <Undo2 className="h-4 w-4" /> Restore {hiddenProfiles.length} removed {hiddenProfiles.length === 1 ? "profile" : "profiles"}
          </button>
        )}
      </section>

      {selected.length > 0 && (
        <div className="animate-fade-up fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-full bg-primary p-1.5 pl-5 text-on-primary shadow-2xl md:bottom-6">
          <span className="mr-auto text-sm font-bold">{selected.length} selected</span>
          <button onClick={() => { setMany("starredProfiles", selected, true); toast(`${selected.length} starred ⭐`); }} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-canvas/10" aria-label="Star selected" title="Star selected">
            <Star className="h-5 w-5" />
          </button>
          <button onClick={() => setSelected([])} className="press grid h-10 w-10 place-items-center rounded-full hover:bg-canvas/10" aria-label="Clear selection" title="Clear selection">
            <X className="h-5 w-5" />
          </button>
          <button onClick={() => setBulkOpen(true)} className="press inline-flex h-10 items-center gap-1.5 rounded-full bg-signal px-4 text-sm font-bold text-on-signal">
            <Send className="h-4 w-4" /> Bulk DM{bulkDaysLeft > 0 ? ` · ${bulkDaysLeft}d` : ""}
          </button>
        </div>
      )}

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
