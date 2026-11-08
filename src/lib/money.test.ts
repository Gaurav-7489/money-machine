import { describe, expect, it } from "vitest";
import { summarize } from "./money";
import type { FinancialRecord } from "./types";

const r = (kind: FinancialRecord["kind"], amount: number, date: string, source: FinancialRecord["source"] = "self_reported"): FinancialRecord => ({
  id: date + amount, kind, title: "t", amount, category: "other", date, source, createdAt: date,
});

describe("summarize", () => {
  const today = new Date("2026-11-08T00:00:00Z");

  it("separates verified from self-reported totals and filters by kind", () => {
    const s = summarize([r("income", 500, "2026-11-01"), r("income", 300, "2026-11-02", "verified"), r("spending", 999, "2026-11-01")], "income", today);
    expect(s.total).toBe(800);
    expect(s.verifiedTotal).toBe(300);
    expect(s.selfReportedTotal).toBe(500);
  });

  it("computes month-over-month change", () => {
    const s = summarize([r("income", 1000, "2026-10-05"), r("income", 1180, "2026-11-05")], "income", today);
    expect(s.changePercent).toBe(18);
    expect(s.monthly).toHaveLength(6);
  });

  it("returns null change when there is no prior month", () => {
    expect(summarize([r("income", 10, "2026-11-01")], "income", today).changePercent).toBeNull();
  });
});
