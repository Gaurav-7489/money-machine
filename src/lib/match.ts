/**
 * Search & matching engine.
 *
 * The match percentage is the share of the filters YOU picked that a profile
 * meets. Each picked filter is worth the same, with partial credit where it
 * makes sense (same country but another city, a price range that is close, a
 * niche that only appears in their posts). With no scoring filters picked, no
 * percentage is shown.
 *
 * Keyword search reads everything a profile has published: name, handle, bio,
 * niches AND the text and #tags of their posts. A skincare brand whose bio
 * never says "skincare" is still found when its posts do.
 *
 * Name, social handle and type (creator/business) are hard filters.
 */
import { cleanHandle } from "./catalog";

export interface MatchFilters {
  /** keywords: searched across profile AND posts */
  q: string;
  kind: "all" | "creator" | "business";
  niches: string[];
  country: string;
  /** states / regions (or cities) within the country */
  cities: string[];
  /** currency the price filters are written in; amounts in other currencies aren't compared */
  currency?: string;
  /** budget per video in whole units of `currency` (null = not used) */
  priceMin: number | null;
  priceMax: number | null;
  /** affiliate: price per sale, min to max */
  saleMin: number | null;
  saleMax: number | null;
  /** UGC: price per 1,000 views, min to max */
  viewsMin: number | null;
  viewsMax: number | null;
  earningModels: string[];
  name: string;
  social: string;
}

export const EMPTY_FILTERS: MatchFilters = {
  q: "",
  kind: "all",
  niches: [],
  country: "",
  cities: [],
  priceMin: null,
  priceMax: null,
  saleMin: null,
  saleMax: null,
  viewsMin: null,
  viewsMax: null,
  earningModels: [],
  name: "",
  social: "",
};

export interface Matchable {
  handle: string;
  name: string;
  kind: "creator" | "business";
  niche: string;
  bio: string;
  category: string;
  niches?: string[];
  country: string;
  region?: string;
  city: string;
  currency?: string;
  priceFrom: number;
  priceTo: number;
  perSaleMin?: number;
  perSaleMax?: number;
  perThousandMin?: number;
  perThousandMax?: number;
  earningModels: string[];
  socials: { instagram?: string; youtube?: string; x?: string };
}

/** Published text of a profile (post captions and tags), keyed by handle. */
export type PostIndex = Record<string, string[]>;

export interface MatchCheck {
  label: string;
  /** 1 = met, between = partly, 0 = not met */
  score: number;
  /** extra detail, e.g. "found in their posts" */
  note?: string;
}

export interface MatchResult<T> {
  profile: T;
  /** 0–100, or null when no scoring filters are set */
  percent: number | null;
  checks: MatchCheck[];
  /** where the keyword was found, for the result card */
  foundIn?: "profile" | "posts";
  /** a short piece of the post that matched */
  snippet?: string;
}

const norm = (s: string) => s.trim().toLowerCase();
/** "home decor" matches "homedecor", "#HomeDecor", "Home Decor". */
const squash = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

function profileText(p: Matchable): string {
  return [p.handle, p.name, p.niche, p.bio, p.category, ...(p.niches ?? []), p.socials.instagram, p.socials.youtube, p.socials.x].filter(Boolean).join(" ");
}

function contains(hay: string, needle: string): boolean {
  if (!needle) return true;
  return hay.toLowerCase().includes(needle) || squash(hay).includes(squash(needle));
}

/** Keyword match across the profile and its posts. */
export function keywordHit(p: Matchable, q: string, posts: PostIndex): { where: "profile" | "posts" | null; snippet?: string } {
  const needle = norm(q).replace(/^[#@]/, "");
  if (!needle) return { where: "profile" };
  const words = needle.split(/\s+/).filter(Boolean);
  const text = profileText(p);
  if (words.every((w) => contains(text, w)) || contains(text, needle)) return { where: "profile" };
  const list = posts[p.handle] ?? [];
  const post = list.find((t) => words.every((w) => contains(t, w)) || contains(t, needle));
  if (post) return { where: "posts", snippet: post.length > 90 ? `${post.slice(0, 87)}…` : post };
  return { where: null };
}

export function passesHardFilters(p: Matchable, f: MatchFilters, posts: PostIndex = {}): boolean {
  if (f.kind !== "all" && p.kind !== f.kind) return false;
  if (f.q && !keywordHit(p, f.q, posts).where) return false;
  const name = norm(f.name);
  if (name && !p.name.toLowerCase().includes(name)) return false;
  const social = cleanHandle(f.social);
  if (social) {
    const handles = [p.handle, p.socials.instagram, p.socials.youtube, p.socials.x].filter(Boolean) as string[];
    if (!handles.some((h) => h.toLowerCase().includes(social))) return false;
  }
  return true;
}

function nicheScore(p: Matchable, niches: string[], posts: PostIndex): { score: number; note?: string } {
  const own = (p.niches ?? [p.category]).map(squash);
  if (niches.some((n) => own.includes(squash(n)))) return { score: 1 };
  const text = (posts[p.handle] ?? []).join(" ");
  const inPosts = niches.find((n) => contains(text, n));
  if (inPosts) return { score: 0.75, note: `posts about ${inPosts}` };
  return { score: 0 };
}

/** How well a profile's price range [from, to] fits the range the searcher asked for. */
function rangeScore(min: number | null, max: number | null, from: number | undefined, to: number | undefined): { score: number; note?: string } {
  if (from === undefined && to === undefined) return { score: 0, note: "no price set" };
  const a = from ?? to!;
  const b = to ?? from!;
  const lo = min ?? 0;
  const hi = max ?? Number.POSITIVE_INFINITY;
  if (a <= hi && b >= lo) return { score: 1 };
  if (a <= hi * 1.25 && b >= lo * 0.75) return { score: 0.5, note: "close to your range" };
  return { score: 0 };
}

export function scoreProfile(p: Matchable, f: MatchFilters, posts: PostIndex = {}): { percent: number | null; checks: MatchCheck[]; foundIn?: "profile" | "posts"; snippet?: string } {
  const checks: MatchCheck[] = [];
  let foundIn: "profile" | "posts" | undefined;
  let snippet: string | undefined;

  if (f.q.trim()) {
    const hit = keywordHit(p, f.q, posts);
    foundIn = hit.where ?? undefined;
    snippet = hit.snippet;
    checks.push({ label: `Mentions “${f.q.trim()}”`, score: hit.where === "profile" ? 1 : hit.where === "posts" ? 0.85 : 0, note: hit.where === "posts" ? "found in their posts" : undefined });
  }

  if (f.niches.length) {
    const r = nicheScore(p, f.niches, posts);
    checks.push({ label: f.niches.length === 1 ? f.niches[0]! : `${f.niches.slice(0, 2).join(" / ")}${f.niches.length > 2 ? " …" : ""}`, score: r.score, note: r.note });
  }

  if (f.cities.length) {
    const places = f.cities.map(norm);
    const here = places.includes(norm(p.city)) || (!!p.region && places.includes(norm(p.region)));
    const sameCountry = !!f.country && p.country === f.country;
    checks.push({ label: f.cities.length === 1 ? f.cities[0]! : `${f.cities.length} places`, score: here ? 1 : sameCountry ? 0.5 : 0, note: !here && sameCountry ? "same country" : undefined });
  } else if (f.country) {
    checks.push({ label: f.country, score: p.country === f.country ? 1 : 0 });
  }

  const otherCurrency = !!f.currency && !!p.currency && f.currency !== p.currency;
  const ranges: [string, number | null, number | null, number | undefined, number | undefined][] = [
    ["Budget per video", f.priceMin, f.priceMax, p.priceFrom, p.priceTo],
    ["Price per sale", f.saleMin, f.saleMax, p.perSaleMin, p.perSaleMax],
    ["Price per 1,000 views", f.viewsMin, f.viewsMax, p.perThousandMin, p.perThousandMax],
  ];
  for (const [label, min, max, from, to] of ranges) {
    if (min === null && max === null) continue;
    if (otherCurrency) {
      checks.push({ label, score: 0.5, note: `priced in ${p.currency}` });
      continue;
    }
    checks.push({ label, ...rangeScore(min, max, from, to) });
  }

  if (f.earningModels.length) {
    const hits = f.earningModels.filter((m) => p.earningModels.includes(m)).length;
    checks.push({ label: "Means of earning", score: hits === 0 ? 0 : Math.max(0.5, hits / f.earningModels.length), note: hits > 0 && hits < f.earningModels.length ? `${hits} of ${f.earningModels.length}` : undefined });
  }

  if (checks.length === 0) return { percent: null, checks, foundIn, snippet };
  const percent = Math.round((checks.reduce((s, c) => s + c.score, 0) / checks.length) * 100);
  return { percent, checks, foundIn, snippet };
}

export function findMatches<T extends Matchable>(profiles: T[], f: MatchFilters, minPercent = 0, posts: PostIndex = {}): MatchResult<T>[] {
  return profiles
    .filter((p) => passesHardFilters(p, f, posts))
    .map((p) => ({ profile: p, ...scoreProfile(p, f, posts) }))
    .filter((r) => r.percent === null || r.percent >= minPercent)
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0) || a.profile.name.localeCompare(b.profile.name));
}

/** Plain-language label for a match percentage. */
export function matchLabel(percent: number): string {
  if (percent >= 90) return "Perfect match";
  if (percent >= 70) return "Great match";
  if (percent >= 50) return "Good match";
  if (percent > 0) return "Partial match";
  return "Not a match";
}

/** Match levels offered above the results. 0 = show everyone. */
export const MATCH_LEVELS = [0, 90, 70, 60, 50] as const;

export function countAtLeast(results: { percent: number | null }[], level: number): number {
  if (level === 0) return results.length;
  return results.filter((r) => r.percent !== null && r.percent >= level).length;
}

/** Count of filters (besides type) that are currently set. */
export function activeFilterCount(f: MatchFilters): number {
  return [
    f.q.trim(),
    f.niches.length > 0,
    f.country,
    f.cities.length > 0,
    f.priceMin !== null || f.priceMax !== null,
    f.saleMin !== null || f.saleMax !== null,
    f.viewsMin !== null || f.viewsMax !== null,
    f.earningModels.length > 0,
    f.name,
    f.social,
  ].filter(Boolean).length;
}

const num = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : null);
const list = (v: string | null) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export function filtersFromParams(p: URLSearchParams): MatchFilters {
  const kind = p.get("type");
  return {
    q: p.get("q") ?? "",
    kind: kind === "creator" || kind === "business" ? kind : "all",
    niches: list(p.get("niche")),
    country: p.get("country") ?? "",
    cities: list(p.get("city")),
    priceMin: num(p.get("min")),
    priceMax: num(p.get("max")),
    saleMin: num(p.get("smin")),
    saleMax: num(p.get("smax")),
    viewsMin: num(p.get("vmin")),
    viewsMax: num(p.get("vmax")),
    earningModels: list(p.get("earn")),
    name: p.get("name") ?? "",
    social: p.get("social") ?? "",
  };
}

export function filtersToParams(f: MatchFilters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.kind !== "all") p.set("type", f.kind);
  if (f.niches.length) p.set("niche", f.niches.join(","));
  if (f.country) p.set("country", f.country);
  if (f.cities.length) p.set("city", f.cities.join(","));
  if (f.priceMin !== null) p.set("min", String(f.priceMin));
  if (f.priceMax !== null) p.set("max", String(f.priceMax));
  if (f.saleMin !== null) p.set("smin", String(f.saleMin));
  if (f.saleMax !== null) p.set("smax", String(f.saleMax));
  if (f.viewsMin !== null) p.set("vmin", String(f.viewsMin));
  if (f.viewsMax !== null) p.set("vmax", String(f.viewsMax));
  if (f.earningModels.length) p.set("earn", f.earningModels.join(","));
  if (f.name) p.set("name", f.name);
  if (f.social) p.set("social", f.social);
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  return p.toString();
}

/**
 * "Matched to you": filters built from what the signed-in user set up at
 * onboarding, so a new business immediately sees the creators it needs (and a
 * creator sees the brands that fit).
 */
export function filtersFromProfile(s: { role: "creator" | "business"; lookingFor?: string[]; niches?: string[]; earningModels?: string[]; country?: string; currency?: string }): MatchFilters {
  const niches = (s.lookingFor?.length ? s.lookingFor : s.niches) ?? [];
  return {
    ...EMPTY_FILTERS,
    kind: s.role === "business" ? "creator" : "business",
    niches,
    earningModels: s.earningModels ?? [],
    country: s.country ?? "",
    currency: s.currency,
  };
}
