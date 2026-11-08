"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import { Avatar, VerifiedMark } from "@/components/art";
import { EmptyState, SampleTag } from "@/components/ui";
import { usePrograms } from "@/lib/hooks";
import { SAMPLE_PROFILES, profileByHandle } from "@/lib/sample-data";
import { useStore } from "@/lib/store";

const FILTERS = ["All", "Creators", "Businesses", "Opportunities"] as const;
type Filter = (typeof FILTERS)[number];

function ExploreInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filter, setFilter] = useState<Filter>("All");
  const { following, toggle } = useStore();
  const programs = usePrograms();

  const needle = q.trim().toLowerCase().replace(/^#/, "");
  const profiles = useMemo(
    () =>
      SAMPLE_PROFILES.filter((p) => (filter === "Creators" ? p.kind === "creator" : filter === "Businesses" ? p.kind === "business" : filter === "All"))
        .filter((p) => !needle || [p.handle, p.name, p.niche, p.bio].some((s) => s.toLowerCase().includes(needle))),
    [filter, needle],
  );
  const opps = useMemo(
    () =>
      filter === "All" || filter === "Opportunities"
        ? programs.filter((p) => p.status === "active" && (!needle || [p.name, p.brand, p.description].some((s) => s.toLowerCase().includes(needle))))
        : [],
    [programs, filter, needle],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-bold tracking-tight">Explore</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(`/explore${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label htmlFor="explore-q" className="sr-only">Search</label>
        <input
          id="explore-q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search creators, brands, niches…"
          className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-4 text-[15px] outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </form>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium transition ${filter === f ? "bg-brand-600 text-white" : "border border-line bg-white text-ink hover:bg-canvas"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {profiles.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {profiles.map((p) => {
            const isFollowing = following.includes(p.handle);
            return (
              <li key={p.handle} className="card flex flex-col items-center p-4 text-center">
                <SampleTag className="self-end" />
                <Avatar name={p.name} tone={p.tone} size="lg" square={p.kind === "business"} />
                <p className="mt-2 flex max-w-full items-center gap-1 text-sm font-semibold">
                  <span className="truncate">{p.kind === "creator" ? `@${p.handle}` : p.name}</span>
                  {p.verified && <VerifiedMark />}
                </p>
                <p className="text-xs text-muted">{p.niche}</p>
                <div className="mt-3 flex w-full gap-2">
                  <button
                    onClick={() => toggle("following", p.handle)}
                    aria-pressed={isFollowing}
                    className={`h-8 flex-1 rounded-full text-[13px] font-semibold transition ${isFollowing ? "border border-line bg-white text-ink" : "bg-brand-50 text-brand-700 hover:bg-brand-100"}`}
                  >
                    {isFollowing ? "Following" : p.kind === "creator" ? "Connect" : "Follow"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {opps.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted">Opportunities</h2>
          <ul className="space-y-3">
            {opps.map((p) => (
              <li key={p.id}>
                <Link href={`/affiliates#${p.id}`} className="card flex items-center gap-3 p-3.5 hover:border-brand-200">
                  <Avatar name={p.brand} tone={profileByHandle(p.ownerHandle)?.tone ?? "violet"} square />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block text-xs text-muted">{p.commissionPercent}% commission · Affiliate</span>
                  </span>
                  {p.sample && <SampleTag />}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profiles.length === 0 && opps.length === 0 && (
        <EmptyState icon={<SearchX className="h-5 w-5" />} title="No results" body={`Nothing matches “${q}”. Try a niche like fitness or beauty.`} />
      )}
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
