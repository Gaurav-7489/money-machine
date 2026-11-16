"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { BookmarkPlus, ChevronDown, Mail, RotateCcw, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Avatar } from "@/components/art";
import { useFeedback } from "@/components/feedback";
import { MatchCard, MatchCardSkeleton } from "@/components/search/match-card";
import { Button, EmptyState, Field, InfoTip, SampleTag, Tip, inputCls, selectCls } from "@/components/ui";
import { CATEGORIES, COUNTRIES, EARNING_MODELS, LOCATIONS } from "@/lib/catalog";
import { usePrograms } from "@/lib/hooks";
import { EMPTY_FILTERS, MIN_MATCH_OPTIONS, activeFilterCount, filtersFromParams, filtersToParams, findMatches, type MatchFilters } from "@/lib/match";
import { SAMPLE_PROFILES, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";

const TABS = [
  { id: "all", label: "All" },
  { id: "creator", label: "Creators" },
  { id: "business", label: "Businesses" },
  { id: "opps", label: "Opportunities" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const numOrNull = (v: string) => (v.trim() === "" ? null : Math.max(0, Math.floor(Number(v.replace(/[^\d]/g, "")) || 0)));

function FilterGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-1 flex items-center gap-1 text-sm font-bold">
        {title}
        {hint && <InfoTip text={hint} />}
      </legend>
      {children}
    </fieldset>
  );
}

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useFeedback();
  const { following, savedProfiles, toggle, setMany } = useStore();
  const { startThread } = useThreads();
  const programs = usePrograms();

  // Applied filters live in the URL so results can be shared and survive Back.
  const applied = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);
  const tab: TabId = params.get("tab") === "opps" ? "opps" : applied.kind;
  const minMatch = Number(params.get("match") ?? 0) || 0;

  const [draft, setDraft] = useState<MatchFilters>(applied);
  const [priceMin, setPriceMin] = useState(applied.priceMin?.toString() ?? "");
  const [priceMax, setPriceMax] = useState(applied.priceMax?.toString() ?? "");
  const [perSale, setPerSale] = useState(applied.perSaleMax?.toString() ?? "");
  const [q, setQ] = useState(applied.q);
  const [loading, setLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [priceErr, setPriceErr] = useState("");

  // Collapse the filter panel on phones the first time.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023px)").matches && activeFilterCount(applied) === 0) setPanelOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the form in sync when the URL changes (e.g. header search, Back button).
  useEffect(() => {
    setDraft(applied);
    setQ(applied.q);
    setPriceMin(applied.priceMin?.toString() ?? "");
    setPriceMax(applied.priceMax?.toString() ?? "");
    setPerSale(applied.perSaleMax?.toString() ?? "");
  }, [applied]);

  function go(f: MatchFilters, extra: Record<string, string> = {}) {
    const qs = filtersToParams(f, { match: minMatch ? String(minMatch) : "", tab: tab === "opps" ? "opps" : "", ...extra });
    router.replace(`/explore${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  // Quick search applies as you type (kept from the original Explore page).
  const live: MatchFilters = { ...applied, q };
  const results = useMemo(() => (tab === "opps" ? [] : findMatches(SAMPLE_PROFILES, live, minMatch)), [tab, live.q, applied, minMatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const needle = q.trim().toLowerCase().replace(/^#/, "");
  const opps = useMemo(
    () =>
      tab === "all" || tab === "opps"
        ? programs.filter((p) => p.status === "active" && (!needle || [p.name, p.brand, p.description].some((s) => s.toLowerCase().includes(needle))))
        : [],
    [programs, tab, needle],
  );

  // Drop selections that are no longer visible.
  useEffect(() => {
    setSelected((s) => s.filter((h) => results.some((r) => r.profile.handle === h)));
  }, [results]);

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const min = numOrNull(priceMin);
    const max = numOrNull(priceMax);
    if (min !== null && max !== null && min > max) {
      setPriceErr("The lowest price should be smaller than the highest price.");
      return;
    }
    setPriceErr("");
    setLoading(true);
    // A short pause so people can see the search happened.
    setTimeout(() => {
      go({ ...draft, q, priceMin: min, priceMax: max, perSaleMax: numOrNull(perSale) });
      setLoading(false);
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setPanelOpen(false);
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 450);
  }

  function clearAll() {
    setDraft({ ...EMPTY_FILTERS, kind: draft.kind });
    setQ("");
    setPriceMin("");
    setPriceMax("");
    setPerSale("");
    setPriceErr("");
    setSelected([]);
    router.replace(`/explore${tab !== "all" ? `?${tab === "opps" ? "tab=opps" : `type=${tab}`}` : ""}`, { scroll: false });
    toast("Filters cleared", "info");
  }

  function setTab(t: TabId) {
    const f = { ...applied, q, kind: t === "opps" || t === "all" ? ("all" as const) : t };
    setDraft((d) => ({ ...d, kind: f.kind }));
    go(f, { tab: t === "opps" ? "opps" : "" });
  }

  function save(handle: string, name: string, kind: string) {
    const was = savedProfiles.includes(handle);
    toggle("savedProfiles", handle);
    toast(was ? `${name} removed from Saved` : `${kind === "creator" ? "Creator" : "Business"} saved successfully!`, was ? "info" : "success");
  }

  function message(handle: string) {
    const id = startThread(handle);
    router.push(`/inbox/${id}`);
  }

  const visibleHandles = results.map((r) => r.profile.handle);
  const allSelected = visibleHandles.length > 0 && visibleHandles.every((h) => selected.includes(h));
  const selectedProfiles = SAMPLE_PROFILES.filter((p) => selected.includes(p.handle));
  const emails = selectedProfiles.map((p) => p.email).filter(Boolean) as string[];
  const filterCount = activeFilterCount(applied);
  const cities = draft.country ? LOCATIONS[draft.country] ?? [] : Object.values(LOCATIONS).flat();

  function saveSelected() {
    setMany("savedProfiles", selected, true);
    toast(`${selected.length} profile${selected.length === 1 ? "" : "s"} saved successfully!`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="mt-0.5 text-sm text-muted">Find creators and businesses to work with. Use the filters to see who matches best.</p>
      </header>

      <Tip id="search-intro" title="How search works">
        Type a name or topic in the box, or open <strong>Filters</strong> to pick a category, place and price. Then press <strong>Search matches</strong>. Each result shows a
        match bar: 100% means the profile fits every filter you picked.
      </Tip>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go({ ...applied, q });
        }}
        className="relative"
        role="search"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <label htmlFor="explore-q" className="sr-only">Search by name, topic or username</label>
        <input
          id="explore-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try “fitness”, “Glow Habit” or “@kavya.fit”"
          className="h-12 w-full rounded-full border border-line bg-surface pl-12 pr-12 text-[15px] shadow-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); go({ ...applied, q: "" }); }} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink" aria-label="Clear search text">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4" role="tablist" aria-label="Show">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`press h-10 shrink-0 rounded-full px-4 text-sm font-medium ${tab === t.id ? "bg-brand-600 text-white" : "border border-line bg-surface text-ink hover:bg-canvas"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ── Filters ─────────────────────────────────────────── */}
        {tab !== "opps" && (
          <section aria-label="Filters" className="lg:sticky lg:top-24 lg:self-start">
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              aria-controls="filter-panel"
              className="press card mb-3 flex h-12 w-full items-center gap-2 px-4 text-[15px] font-semibold lg:hidden"
            >
              <SlidersHorizontal className="h-5 w-5 text-brand-600" />
              <span className="flex-1 text-left">{panelOpen ? "Hide filters" : "Show filters"}</span>
              {filterCount > 0 && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs text-white">{filterCount} on</span>}
              <ChevronDown className={`h-5 w-5 transition-transform ${panelOpen ? "rotate-180" : ""}`} />
            </button>

            <form id="filter-panel" onSubmit={runSearch} noValidate className={`card space-y-4 p-5 ${panelOpen ? "animate-fade-in block" : "hidden"} lg:block`}>
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><SlidersHorizontal className="h-4 w-4" /> Filters</h2>
                <button type="button" onClick={clearAll} className="press inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold text-brand-700 hover:bg-brand-50">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear filters
                </button>
              </div>

              <FilterGroup title="Who are you looking for?">
                <div role="radiogroup" aria-label="Profile type" className="grid grid-cols-3 gap-1.5 rounded-2xl bg-canvas p-1">
                  {([["all", "Everyone"], ["creator", "Creators"], ["business", "Businesses"]] as const).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={draft.kind === id}
                      onClick={() => setDraft((d) => ({ ...d, kind: id }))}
                      className={`press h-10 rounded-xl text-[13px] font-semibold ${draft.kind === id ? "bg-surface text-brand-700 shadow-sm ring-1 ring-line" : "text-muted hover:text-ink"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Field label="Category" optional>
                  <select className={selectCls} value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
                    <option value="">Any category</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </FilterGroup>

              <FilterGroup title="Where?" hint="Pick a country first to see its cities. A profile in the same country but another city counts as a close match.">
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  <Field label="Country" optional>
                    <select className={selectCls} value={draft.country} onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value, city: "" }))}>
                      <option value="">Any country</option>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="City" optional>
                    <select className={selectCls} value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}>
                      <option value="">Any city</option>
                      {cities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
              </FilterGroup>

              <FilterGroup title="Money" hint="Prices are in Indian rupees (₹). For creators this is what they charge; for businesses it is what they usually pay.">
                <div>
                  <p className="mb-1.5 flex items-center gap-2 text-[13px] font-medium">Price per post <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">Optional</span></p>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      <span className="sr-only">Lowest price per post in rupees</span>
                      <input inputMode="numeric" className={inputCls} placeholder="From ₹ e.g. 2000" value={priceMin} onChange={(e) => setPriceMin(e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!priceErr} />
                    </label>
                    <label>
                      <span className="sr-only">Highest price per post in rupees</span>
                      <input inputMode="numeric" className={inputCls} placeholder="To ₹ e.g. 20000" value={priceMax} onChange={(e) => setPriceMax(e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!priceErr} />
                    </label>
                  </div>
                  {priceErr && <p className="mt-1 text-[12px] text-rose-600" role="alert">{priceErr}</p>}
                </div>
                <Field label="Price per sale — up to ₹" optional hint="For affiliate deals: the money paid for each sale.">
                  <input inputMode="numeric" className={inputCls} placeholder="e.g. 150" value={perSale} onChange={(e) => setPerSale(e.target.value.replace(/[^\d]/g, ""))} />
                </Field>
                <div>
                  <p className="mb-1.5 flex items-center gap-2 text-[13px] font-medium">How they earn <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted ring-1 ring-line">Optional</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {EARNING_MODELS.map((m) => {
                      const on = draft.earningModels.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          aria-pressed={on}
                          title={m.hint}
                          onClick={() => setDraft((d) => ({ ...d, earningModels: on ? d.earningModels.filter((x) => x !== m.id) : [...d.earningModels, m.id] }))}
                          className={`press h-9 rounded-full px-3 text-[13px] font-medium ${on ? "bg-brand-600 text-white" : "border border-line bg-surface hover:bg-canvas"}`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </FilterGroup>

              <FilterGroup title="Know who you want?" hint="These narrow results to exact people. Leave them empty to see everyone.">
                <Field label="Creator or business name" optional>
                  <input className={inputCls} placeholder="e.g. Aanya" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                </Field>
                <Field label="Social media handle" optional hint="Instagram, YouTube or X. With or without @.">
                  <input className={inputCls} placeholder="e.g. @glowhabit" autoCapitalize="none" value={draft.social} onChange={(e) => setDraft((d) => ({ ...d, social: e.target.value }))} />
                </Field>
              </FilterGroup>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Searching…</>
                ) : (
                  <><Search className="h-5 w-5" /> Search matches</>
                )}
              </Button>
            </form>
          </section>
        )}

        {/* ── Results ─────────────────────────────────────────── */}
        <section id="results" aria-label="Results" aria-busy={loading} className={`scroll-mt-24 ${tab === "opps" ? "lg:col-span-2" : ""}`}>
          {tab !== "opps" && (
            <>
              <div className="card mb-4 flex flex-wrap items-center gap-x-4 gap-y-3 p-3 pl-4">
                <p className="text-sm font-semibold" aria-live="polite">
                  {loading ? "Searching…" : `${results.length} ${results.length === 1 ? "match" : "matches"}`}
                </p>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelected(allSelected ? [] : visibleHandles)}
                    className="press h-9 rounded-full border border-line px-3 text-[13px] font-semibold hover:bg-canvas"
                  >
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                )}
                <label className="ml-auto flex items-center gap-1.5 text-[13px]">
                  <span className="font-medium">Show</span>
                  <select
                    value={minMatch}
                    onChange={(e) => go({ ...applied, q }, { match: e.target.value === "0" ? "" : e.target.value })}
                    className="h-10 appearance-auto rounded-xl border border-line bg-surface px-2.5 text-[13px] font-medium outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                    aria-label="Minimum match"
                  >
                    {MIN_MATCH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <InfoTip text="The match % shows how many of YOUR filters a profile meets. 90%+ means it fits almost everything you asked for. If you haven't picked filters, everyone is shown." />
                </label>
              </div>

              {selected.length > 0 && (
                <div className="animate-fade-up sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-ink p-2.5 pl-4 text-white shadow-xl md:top-20">
                  <span className="mr-auto text-sm font-semibold">{selected.length} selected</span>
                  <button onClick={saveSelected} className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-semibold hover:bg-white/25">
                    <BookmarkPlus className="h-4 w-4" /> Save selected
                  </button>
                  {emails.length > 0 && (
                    <a
                      href={`mailto:?bcc=${emails.join(",")}&subject=${encodeURIComponent("Collaboration via Money Machine")}`}
                      onClick={() => emails.length < selected.length && toast(`${selected.length - emails.length} of them haven't shared an email, so they're left out.`, "info")}
                      className="press inline-flex h-9 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-semibold hover:bg-white/25"
                    >
                      <Mail className="h-4 w-4" /> Email ({emails.length})
                    </a>
                  )}
                  <button onClick={() => setSelected([])} className="press inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] font-semibold hover:bg-white/15">
                    <X className="h-4 w-4" /> Deselect all
                  </button>
                </div>
              )}

              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[0, 1, 2].map((i) => <MatchCardSkeleton key={i} />)}
                </div>
              ) : results.length > 0 ? (
                <ul key={params.toString()} className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map((r, i) => (
                    <li key={r.profile.handle} style={{ ["--i" as string]: Math.min(i, 6) }}>
                      <MatchCard
                        result={r}
                        selected={selected.includes(r.profile.handle)}
                        onSelect={() => setSelected((s) => (s.includes(r.profile.handle) ? s.filter((h) => h !== r.profile.handle) : [...s, r.profile.handle]))}
                        saved={savedProfiles.includes(r.profile.handle)}
                        onSave={() => save(r.profile.handle, r.profile.name, r.profile.kind)}
                        following={following.includes(r.profile.handle)}
                        onFollow={() => {
                          const was = following.includes(r.profile.handle);
                          toggle("following", r.profile.handle);
                          toast(was ? `You unfollowed ${r.profile.name}` : `You're now following ${r.profile.name}`, was ? "info" : "success");
                        }}
                        onMessage={() => message(r.profile.handle)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="card">
                  <EmptyState
                    icon={<SearchX className="h-5 w-5" />}
                    title="No matches found. Try changing your filters."
                    body={minMatch > 0 ? "Try “Show everyone” instead of only the best matches, or remove a filter." : "Remove a filter or search for a broader word like “fitness” or “beauty”."}
                    action={<Button variant="soft" onClick={clearAll}><RotateCcw className="h-4 w-4" /> Clear filters</Button>}
                  />
                </div>
              )}
              <p className="mt-3 text-center text-xs text-muted">Profiles shown are fictional samples for this preview. Real profiles appear once accounts go live.</p>
            </>
          )}

          {opps.length > 0 && (
            <section className={tab === "opps" ? "" : "mt-8"}>
              <h2 className="mb-3 flex items-center gap-1 font-bold">
                Opportunities <InfoTip text="Affiliate programs you can join. You earn a share (commission) of each sale made through your link." />
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {opps.map((p) => (
                  <li key={p.id}>
                    <Link href={`/affiliates#${p.id}`} className="card lift flex items-center gap-3 p-4 hover:border-brand-200">
                      <Avatar name={p.brand} tone={profileByHandle(p.ownerHandle)?.tone ?? "violet"} size="md" square />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{p.name}</span>
                        <span className="block text-sm text-muted">Earn {p.commissionPercent}% of each sale · Affiliate</span>
                      </span>
                      {p.sample && <SampleTag />}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {tab === "opps" && opps.length === 0 && (
            <div className="card">
              <EmptyState icon={<SearchX className="h-5 w-5" />} title="No opportunities found" body={`Nothing matches “${q}”. Try another word.`} />
            </div>
          )}
        </section>
      </div>
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
