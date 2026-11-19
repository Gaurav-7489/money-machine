import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, activeFilterCount, countAtLeast, filtersFromParams, filtersFromProfile, filtersToParams, findMatches, matchLabel, scoreProfile, type Matchable } from "./match";

const base: Matchable = {
  handle: "asha.cooks",
  name: "Asha Cooks",
  kind: "creator",
  niche: "Food",
  bio: "Quick dinners",
  category: "Food",
  niches: ["Food"],
  country: "India",
  city: "Pune",
  priceFrom: 4000,
  priceTo: 9000,
  perSale: 100,
  commissionPercent: 10,
  earningModels: ["brand_deal", "affiliate"],
  socials: { instagram: "asha.cooks.ig" },
};
const brand: Matchable = { ...base, handle: "spiceco", name: "SpiceCo", kind: "business", bio: "Small-batch goods.", niches: ["Wellness"], category: "Wellness", city: "Mumbai", commissionPercent: 15, socials: {} };
const posts = { spiceco: ["Our new skincare serum is here! #skincare"] };

describe("match scoring", () => {
  it("shows no percentage when no scoring filters are set", () => {
    expect(scoreProfile(base, EMPTY_FILTERS).percent).toBeNull();
  });

  it("scores 100% when every chosen filter is met", () => {
    const r = scoreProfile(base, { ...EMPTY_FILTERS, niches: ["Food"], country: "India", cities: ["Pune"], priceMin: 5000, priceMax: 8000, earningModels: ["affiliate"] });
    expect(r.percent).toBe(100);
    expect(r.checks).toHaveLength(4);
  });

  it("gives half credit for same country but another region", () => {
    expect(scoreProfile(base, { ...EMPTY_FILTERS, country: "India", cities: ["Mumbai"] }).percent).toBe(50);
    expect(scoreProfile({ ...base, region: "Maharashtra" }, { ...EMPTY_FILTERS, country: "India", cities: ["Maharashtra"] }).percent).toBe(100);
  });

  it("doesn't compare prices written in different currencies", () => {
    const r = scoreProfile({ ...base, currency: "INR" }, { ...EMPTY_FILTERS, currency: "USD", priceMin: 100, priceMax: 200 });
    expect(r.percent).toBe(50);
    expect(r.checks[0]!.note).toBe("priced in INR");
  });

  it("finds a business by its posts even when its bio never says the word", () => {
    const r = findMatches([base, brand], { ...EMPTY_FILTERS, q: "skincare" }, 0, posts);
    expect(r.map((x) => x.profile.handle)).toEqual(["spiceco"]);
    expect(r[0]!.foundIn).toBe("posts");
    expect(r[0]!.snippet).toContain("serum");
  });

  it("gives partial niche credit when the niche only appears in posts", () => {
    const r = scoreProfile(brand, { ...EMPTY_FILTERS, niches: ["Skincare"] }, posts);
    expect(r.percent).toBe(75);
    expect(scoreProfile(brand, { ...EMPTY_FILTERS, niches: ["Skincare"] }).percent).toBe(0);
  });

  it("reads commission as 'pays at least' for brands and 'asks at most' for creators", () => {
    const f = { ...EMPTY_FILTERS, commission: 12 };
    expect(scoreProfile(brand, f).percent).toBe(100);
    expect(scoreProfile(base, f).percent).toBe(100);
    expect(scoreProfile({ ...base, commissionPercent: 30 }, f).percent).toBe(0);
  });

  it("treats type, name and social handle as hard filters", () => {
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, kind: "business" }).map((r) => r.profile.handle)).toEqual(["spiceco"]);
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, name: "asha" })).toHaveLength(1);
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, social: "@asha.cooks.ig" })).toHaveLength(1);
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, social: "instagram.com/nobody" })).toHaveLength(0);
  });

  it("applies the minimum match level, counts levels and sorts best first", () => {
    const f = { ...EMPTY_FILTERS, country: "India", cities: ["Pune"] };
    const all = findMatches([brand, base], f);
    expect(all.map((r) => r.percent)).toEqual([100, 50]);
    expect(findMatches([brand, base], f, 90).map((r) => r.profile.handle)).toEqual(["asha.cooks"]);
    expect(countAtLeast(all, 0)).toBe(2);
    expect(countAtLeast(all, 70)).toBe(1);
    expect(countAtLeast(all, 50)).toBe(2);
  });

  it("labels percentages in plain words", () => {
    expect(matchLabel(95)).toBe("Perfect match");
    expect(matchLabel(72)).toBe("Great match");
    expect(matchLabel(50)).toBe("Good match");
    expect(matchLabel(10)).toBe("Partial match");
  });

  it("round-trips filters through the URL", () => {
    const f = { ...EMPTY_FILTERS, kind: "creator" as const, niches: ["Makeup", "Home Decor"], cities: ["Pune", "Goa"], priceMin: 1000, commission: 10, earningModels: ["affiliate", "ugc"], social: "x" };
    expect(filtersFromParams(new URLSearchParams(filtersToParams(f)))).toEqual(f);
    expect(activeFilterCount(f)).toBe(6);
  });

  it("builds 'matched to you' filters from the profile", () => {
    const f = filtersFromProfile({ role: "business", lookingFor: ["Skincare"], earningModels: ["ugc"], country: "India" });
    expect(f.kind).toBe("creator");
    expect(f.niches).toEqual(["Skincare"]);
  });
});
