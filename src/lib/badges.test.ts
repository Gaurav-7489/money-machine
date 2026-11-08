import { describe, expect, it } from "vitest";
import { evaluateBadges } from "./badges";
import type { FinancialRecord } from "./types";

const rec = (over: Partial<FinancialRecord>): FinancialRecord => ({
  id: Math.random().toString(),
  kind: "income",
  title: "x",
  amount: 1000,
  category: "brand_deal",
  date: "2026-11-02",
  source: "self_reported",
  createdAt: "2026-11-02T00:00:00Z",
  ...over,
});

const today = new Date("2026-11-08T00:00:00Z");

describe("evaluateBadges", () => {
  it("awards First Earnings after one income record", () => {
    const res = evaluateBadges({ role: "creator", handle: "me", records: [rec({})], programs: [], applications: [] }, today);
    expect(res.find((b) => b.badge.id === "first_income")?.earned).toBe(true);
    expect(res.find((b) => b.badge.id === "collab_pro")?.earned).toBe(false);
  });

  it("only shows badges for the user's role", () => {
    const res = evaluateBadges({ role: "business", handle: "me", records: [], programs: [], applications: [] }, today);
    expect(res.every((b) => b.badge.role === "business")).toBe(true);
  });

  it("never awards verification badges from self-reported records", () => {
    const records = Array.from({ length: 20 }, () => rec({ amount: 10_000 }));
    const res = evaluateBadges({ role: "creator", handle: "me", records, programs: [], applications: [] }, today);
    expect(res.find((b) => b.badge.id === "top_creator")?.earned).toBe(false);
  });

  it("awards Growth Star when this month beats last month", () => {
    const records = [rec({ date: "2026-10-10", amount: 1000 }), rec({ date: "2026-11-03", amount: 2000 })];
    const res = evaluateBadges({ role: "creator", handle: "me", records, programs: [], applications: [] }, today);
    expect(res.find((b) => b.badge.id === "growth_star")?.earned).toBe(true);
  });

  it("does not count sample programs toward business badges", () => {
    const res = evaluateBadges(
      {
        role: "business",
        handle: "me",
        records: [],
        programs: [{ id: "p", name: "S", brand: "S", commissionPercent: 10, description: "", terms: "", status: "active", ownerHandle: "me", createdAt: "", sample: true }],
        applications: [],
      },
      today,
    );
    expect(res.find((b) => b.badge.id === "first_program")?.earned).toBe(false);
  });
});
