"use client";

import { TabIndicator } from "@/components/motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckSquare, RotateCcw, Search, SearchX, Send, SlidersHorizontal, Sparkles, Square, Star, Undo2, X } from "lucide-react";
import { useFeedback } from "@/components/feedback";
import { BulkDm } from "@/components/search/bulk-dm";
import { MatchCard, MatchCardSkeleton } from "@/components/search/match-card";
import { Button, EmptyState, Sheet, inputCls } from "@/components/ui";
import { EARNING_MODELS } from "@/lib/catalog";
import { DEFAULT_CURRENCY } from "@/lib/format";
import { FilterBuilder, fromDraft, toDraft, type Draft } from "@/components/search/filter-builder";
import { EMPTY_FILTERS, MATCH_LEVELS, activeFilterCount, countAtLeast, filtersFromParams, filtersFromProfile, filtersToParams, findMatches, type MatchFilters } from "@/lib/match";
import { SEARCHABLE_PROFILES } from "@/lib/sample-data";
import { usePostIndex } from "@/lib/search-index";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useFeedback();
  const { session, starredProfiles, hiddenProfiles, toggle, setMany } = useStore();
  const { startThread, bulkDaysLeft } = useThreads();
  const posts = usePostIndex();
  const role = session?.role ?? "creator";
  const defaultKind: "creator" | "business" = role === "business" ? "creator" : "business";

  const urlFilters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const custom = params.get("mode") === "custom" || activeFilterCount({ ...urlFilters, q: "" }) > 0;
  // Explore always looks across: creators find businesses, businesses find creators.
  // People on your own side are found from Friends.
  const kind = defaultKind;
  const currency = session?.currency ?? DEFAULT_CURRENCY;
  const matched = useMemo(() => (session ? { ...filtersFromProfile(session), kind } : { ...EMPTY_FILTERS, kind }), [session, kind]);
  const applied: MatchFilters = custom ? { ...urlFilters, kind, currency } : { ...matched, q: urlFilters.q };
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
  const draftFilters = fromDraft(draft);
  const liveCount = useMemo(() => findMatches(pool, { ...draftFilters, q, kind, currency }, 0, posts).filter((r) => !level || (r.percent ?? 0) >= level).length, [pool, JSON.stringify(draftFilters), q, kind, currency, level, posts]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handles = results.map((r) => r.profile.handle);
  const allSelected = handles.length > 0 && handles.every((h) => selected.includes(h));
  const recipients = SEARCHABLE_PROFILES.filter((p) => selected.includes(p.handle));
  const count = activeFilterCount(applied);
  const who = kind === "creator" ? "creators" : "brands";

  return (
    <div className="mx-auto max-w-6xl pb-24">
      <header className="mb-6">
        <h1 className="text-[clamp(2.6rem,7vw,4.25rem)] leading-[0.9]">Find {who}</h1>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); go({ ...applied, q }, {}, custom); }} className="relative" role="search">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <label htmlFor="explore-q" className="sr-only">Search by keyword, name or handle</label>
        <input
          id="explore-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Try “skincare”: we search bios and posts`}
          className="h-14 w-full rounded-full border border-line bg-surface pl-13 pr-24 text-[17px] outline-none transition-colors placeholder:text-muted/80 hover:border-muted/60 focus:border-ink"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); go({ ...applied, q: "" }, {}, custom); }} className="absolute right-[58px] top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-elevated" aria-label="Clear search text">
            <X className="h-4 w-4" />
          </button>
        )}
        <button type="button" onClick={() => setSheet(true)} className="press absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink text-canvas lg:hidden" aria-label={`Filters${count ? `, ${count} on` : ""}`}>
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1 text-[10px] font-bold text-on-signal">{count}</span>}
        </button>
      </form>

      <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4">
        <button
          onClick={() => router.replace(`/explore${kind !== defaultKind ? `?type=${kind}` : ""}`, { scroll: false })}
          aria-pressed={!custom}
          className={`press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold ${!custom ? "bg-ink text-canvas" : "border border-line hover:border-ink"}`}
        >
          <Sparkles className="h-4 w-4" /> Matched to you
        </button>
        <button onClick={() => setSheet(true)} aria-pressed={custom} className={`press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold lg:hidden ${custom ? "bg-ink text-canvas" : "border border-line hover:border-ink"}`}>
          <SlidersHorizontal className="h-4 w-4" /> Custom search{custom && count ? ` · ${count}` : ""}
        </button>
      </div>

      {!custom && (
        <p className="mt-4 border-l-2 border-signal pl-3 text-[14px] text-muted">
          {applied.niches.length || applied.earningModels.length ? (
            <>Showing {who} for your setup: <strong>{[...applied.niches, ...EARNING_MODELS.filter((m) => applied.earningModels.includes(m.id)).map((m) => m.short)].slice(0, 5).join(", ")}</strong>. Tap <strong>Custom search</strong> to change it.</>
          ) : (
            <>Tell us what you&apos;re looking for in your profile and we&apos;ll match you automatically. Or use <strong>Custom search</strong>.</>
          )}
        </p>
      )}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="no-scrollbar sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto border-t border-ink pt-3">
            <h2 className="sr-only">Custom search</h2>
            <FilterBuilder draft={draft} setDraft={setDraft} who={who} lookingForCreators={kind === "creator"} currency={currency} error={error} liveCount={liveCount} onSubmit={apply} onClear={clearAll} />
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
                  className={`press relative isolate flex h-12 shrink-0 flex-col items-center justify-center rounded-full px-5 leading-tight disabled:opacity-40 ${on ? "text-canvas" : "border border-line hover:border-ink"}`}
                >
                  {on && <TabIndicator group="match" variant="pill" />}
                  <span className="text-[14px] font-semibold tabular-nums">{v === 0 ? "All" : `${v}%+`}</span>
                  <span className={`text-[11px] ${on ? "opacity-80" : "text-muted"}`}>{n} {n === 1 ? "match" : "matches"}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex items-center gap-3">
            <button type="button" onClick={() => setSelected(allSelected ? [] : handles)} disabled={!handles.length} className="press inline-flex h-10 items-center gap-2 rounded-full border border-line px-3.5 text-[13px] font-semibold hover:border-ink disabled:opacity-40">
              {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {allSelected ? "Deselect all" : `Select all${level ? ` ${level}%+` : ""} (${handles.length})`}
            </button>
            <p className="ml-auto text-sm tabular-nums text-muted" aria-live="polite">{loading ? "Searching…" : `${results.length} ${results.length === 1 ? who.slice(0, -1) : who}`}</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">{[0, 1, 2].map((i) => <MatchCardSkeleton key={i} />)}</div>
          ) : results.length ? (
            <ul key={params.toString()} className="stagger grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
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
            <div className="border-y border-line">
              <EmptyState
                icon={<SearchX className="h-5 w-5" />}
                title="No matches found. Try changing your filters."
                body={level ? "Pick a lower match % like 50%+, or All." : "Remove a filter or try a broader word like “beauty” or “fitness”."}
                action={<Button variant="soft" onClick={clearAll}><RotateCcw className="h-4 w-4" /> Clear filters</Button>}
              />
            </div>
          )}

          {hiddenProfiles.length > 0 && (
            <button onClick={() => { setMany("hiddenProfiles", hiddenProfiles, false); toast("Removed profiles are back", "info"); }} className="mx-auto mt-6 flex items-center gap-1.5 text-[13px] font-semibold hover:underline">
              <Undo2 className="h-4 w-4" /> Restore {hiddenProfiles.length} removed {hiddenProfiles.length === 1 ? "profile" : "profiles"}
            </button>
          )}
        </section>
      </div>

      {selected.length > 0 && (
        <div className="animate-fade-up fixed inset-x-3 bottom-24 z-40 mx-auto flex max-w-xl items-center gap-2 rounded-full bg-ink p-1.5 pl-5 text-canvas shadow-2xl md:bottom-6">
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

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Custom search">
        {sheet && <FilterBuilder draft={draft} setDraft={setDraft} who={who} lookingForCreators={kind === "creator"} currency={currency} error={error} liveCount={liveCount} onSubmit={apply} onClear={clearAll} />}
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
