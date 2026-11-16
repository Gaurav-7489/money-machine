import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, activeFilterCount, filtersFromParams, filtersToParams, findMatches, matchLabel, scoreProfile, type Matchable } from "./match";

const base: Matchable = {
  handle: "asha.cooks",
  name: "Asha Cooks",
  kind: "creator",
  niche: "Food",
  bio: "Quick dinners",
  category: "Food",
  country: "India",
  city: "Pune",
  priceFrom: 4000,
  priceTo: 9000,
  perSale: 100,
  earningModels: ["paid_post", "affiliate"],
  socials: { instagram: "asha.cooks.ig" },
};
const brand: Matchable = { ...base, handle: "spiceco", name: "SpiceCo", kind: "business", category: "Food", city: "Mumbai", socials: {} };

describe("match scoring", () => {
  it("shows no percentage when no scoring filters are set", () => {
    expect(scoreProfile(base, EMPTY_FILTERS).percent).toBeNull();
  });

  it("scores 100% when every chosen filter is met", () => {
    const r = scoreProfile(base, { ...EMPTY_FILTERS, category: "Food", country: "India", city: "Pune", priceMin: 5000, priceMax: 8000, perSaleMax: 150, earningModels: ["affiliate"] });
    expect(r.percent).toBe(100);
    expect(r.checks).toHaveLength(5);
  });

  it("gives half credit for same country but another city", () => {
    const r = scoreProfile(base, { ...EMPTY_FILTERS, city: "Mumbai" });
    expect(r.percent).toBe(50);
  });

  it("gives 0 for a wrong category", () => {
    expect(scoreProfile(base, { ...EMPTY_FILTERS, category: "Tech" }).percent).toBe(0);
  });

  it("treats type, name and social handle as hard filters", () => {
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, kind: "business" }).map((r) => r.profile.handle)).toEqual(["spiceco"]);
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, name: "asha" })).toHaveLength(1);
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, social: "@asha.cooks.ig" })).toHaveLength(1);
    expect(findMatches([base, brand], { ...EMPTY_FILTERS, social: "instagram.com/nobody" })).toHaveLength(0);
  });

  it("applies the minimum match filter and sorts best first", () => {
    const f = { ...EMPTY_FILTERS, city: "Pune" };
    expect(findMatches([brand, base], f).map((r) => r.percent)).toEqual([100, 50]);
    expect(findMatches([brand, base], f, 90).map((r) => r.profile.handle)).toEqual(["asha.cooks"]);
  });

  it("labels percentages in plain words", () => {
    expect(matchLabel(95)).toBe("Perfect match");
    expect(matchLabel(80)).toBe("Great match");
    expect(matchLabel(50)).toBe("Good match");
    expect(matchLabel(10)).toBe("Partial match");
  });

  it("round-trips filters through the URL", () => {
    const f = { ...EMPTY_FILTERS, kind: "creator" as const, category: "Food", priceMin: 1000, earningModels: ["affiliate", "barter"], social: "x" };
    expect(filtersFromParams(new URLSearchParams(filtersToParams(f)))).toEqual(f);
    expect(activeFilterCount(f)).toBe(4);
  });
});
