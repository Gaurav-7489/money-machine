/**
 * Search matching.
 *
 * The match percentage is not a guess or a popularity number: it is the share of
 * the filters YOU picked that a profile meets. Each picked filter is worth the
 * same, with half credit for "close" (same country but another city, a price
 * range that is near yours). If you pick no scoring filters, no percentage is
 * shown at all.
 *
 * Name, social handle, type (creator/business) and the quick-search text are
 * hard filters: profiles that don't fit them are hidden rather than scored.
 */
import { LOCATIONS, cleanHandle } from "./catalog";

export interface MatchFilters {
  /** quick search text: name, handle, niche, bio */
  q: string;
  kind: "all" | "creator" | "business";
  category: string;
  country: string;
  city: string;
  /** budget per post in whole ₹ (empty = not used) */
  priceMin: number | null;
  priceMax: number | null;
  /** maximum ₹ per sale (empty = not used) */
  perSaleMax: number | null;
  earningModels: string[];
  name: string;
  social: string;
}

export const EMPTY_FILTERS: MatchFilters = {
  q: "",
  kind: "all",
  category: "",
  country: "",
  city: "",
  priceMin: null,
  priceMax: null,
  perSaleMax: null,
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
  country: string;
  city: string;
  priceFrom: number;
  priceTo: number;
  perSale?: number;
  earningModels: string[];
  socials: { instagram?: string; youtube?: string; x?: string };
}

export interface MatchCheck {
  label: string;
  /** 1 = met, 0.5 = close, 0 = not met */
  score: number;
}

export interface MatchResult<T> {
  profile: T;
  /** 0–100, or null when no scoring filters are set */
  percent: number | null;
  checks: MatchCheck[];
}

const norm = (s: string) => s.trim().toLowerCase();

export function passesHardFilters(p: Matchable, f: MatchFilters): boolean {
  if (f.kind !== "all" && p.kind !== f.kind) return false;
  const q = norm(f.q).replace(/^[#@]/, "");
  if (q && ![p.handle, p.name, p.niche, p.bio, p.category].some((s) => s.toLowerCase().includes(q))) return false;
  const name = norm(f.name);
  if (name && !p.name.toLowerCase().includes(name)) return false;
  const social = cleanHandle(f.social);
  if (social) {
    const handles = [p.handle, p.socials.instagram, p.socials.youtube, p.socials.x].filter(Boolean) as string[];
    if (!handles.some((h) => h.toLowerCase().includes(social))) return false;
  }
  return true;
}

export function scoreProfile(p: Matchable, f: MatchFilters): { percent: number | null; checks: MatchCheck[] } {
  const checks: MatchCheck[] = [];

  if (f.category) checks.push({ label: `Category: ${f.category}`, score: p.category === f.category ? 1 : 0 });

  if (f.city) {
    const cityCountry = f.country || Object.keys(LOCATIONS).find((c) => LOCATIONS[c]!.includes(f.city)) || "";
    checks.push({ label: `City: ${f.city}`, score: p.city === f.city ? 1 : cityCountry && p.country === cityCountry ? 0.5 : 0 });
  } else if (f.country) {
    checks.push({ label: `Country: ${f.country}`, score: p.country === f.country ? 1 : 0 });
  }

  if (f.priceMin !== null || f.priceMax !== null) {
    const lo = f.priceMin ?? 0;
    const hi = f.priceMax ?? Number.POSITIVE_INFINITY;
    const overlaps = p.priceFrom <= hi && p.priceTo >= lo;
    // "close": within 25% of the range edge
    const near = p.priceFrom <= hi * 1.25 && p.priceTo >= lo * 0.75;
    checks.push({ label: "Price per post", score: overlaps ? 1 : near ? 0.5 : 0 });
  }

  if (f.perSaleMax !== null) {
    checks.push({
      label: "Price per sale",
      score: p.perSale === undefined ? 0 : p.perSale <= f.perSaleMax ? 1 : p.perSale <= f.perSaleMax * 1.25 ? 0.5 : 0,
    });
  }

  if (f.earningModels.length) {
    const hits = f.earningModels.filter((m) => p.earningModels.includes(m)).length;
    checks.push({ label: "How they earn", score: hits === f.earningModels.length ? 1 : hits > 0 ? 0.5 : 0 });
  }

  if (checks.length === 0) return { percent: null, checks };
  const percent = Math.round((checks.reduce((s, c) => s + c.score, 0) / checks.length) * 100);
  return { percent, checks };
}

export function findMatches<T extends Matchable>(profiles: T[], f: MatchFilters, minPercent = 0): MatchResult<T>[] {
  return profiles
    .filter((p) => passesHardFilters(p, f))
    .map((p) => ({ profile: p, ...scoreProfile(p, f) }))
    .filter((r) => r.percent === null || r.percent >= minPercent)
    .sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0) || a.profile.name.localeCompare(b.profile.name));
}

/** Plain-language label for a match percentage. */
export function matchLabel(percent: number): string {
  if (percent >= 90) return "Perfect match";
  if (percent >= 75) return "Great match";
  if (percent >= 50) return "Good match";
  if (percent > 0) return "Partial match";
  return "Not a match";
}

export const MIN_MATCH_OPTIONS = [
  { value: 0, label: "Show everyone", hint: "Show every profile, even ones that meet none of your filters." },
  { value: 50, label: "Good matches (50%+)", hint: "Meets at least half of your filters." },
  { value: 75, label: "Great matches (75%+)", hint: "Meets at least 3 out of every 4 filters." },
  { value: 90, label: "Perfect matches (90%+)", hint: "Meets almost all of your filters." },
] as const;

/** Count of filters (besides quick search and type) that are currently set. */
export function activeFilterCount(f: MatchFilters): number {
  return [
    f.category,
    f.country,
    f.city,
    f.priceMin !== null,
    f.priceMax !== null,
    f.perSaleMax !== null,
    f.earningModels.length > 0,
    f.name,
    f.social,
  ].filter(Boolean).length;
}

const num = (v: string | null) => (v && /^\d+$/.test(v) ? Number(v) : null);

export function filtersFromParams(p: URLSearchParams): MatchFilters {
  const kind = p.get("type");
  return {
    q: p.get("q") ?? "",
    kind: kind === "creator" || kind === "business" ? kind : "all",
    category: p.get("category") ?? "",
    country: p.get("country") ?? "",
    city: p.get("city") ?? "",
    priceMin: num(p.get("min")),
    priceMax: num(p.get("max")),
    perSaleMax: num(p.get("sale")),
    earningModels: (p.get("earn") ?? "").split(",").filter(Boolean),
    name: p.get("name") ?? "",
    social: p.get("social") ?? "",
  };
}

export function filtersToParams(f: MatchFilters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.kind !== "all") p.set("type", f.kind);
  if (f.category) p.set("category", f.category);
  if (f.country) p.set("country", f.country);
  if (f.city) p.set("city", f.city);
  if (f.priceMin !== null) p.set("min", String(f.priceMin));
  if (f.priceMax !== null) p.set("max", String(f.priceMax));
  if (f.perSaleMax !== null) p.set("sale", String(f.perSaleMax));
  if (f.earningModels.length) p.set("earn", f.earningModels.join(","));
  if (f.name) p.set("name", f.name);
  if (f.social) p.set("social", f.social);
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  return p.toString();
}
