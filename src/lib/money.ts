import type { FinancialRecord } from "./types";

export interface MoneySummary {
  total: number;
  verifiedTotal: number;
  selfReportedTotal: number;
  thisMonth: number;
  lastMonth: number;
  /** month-over-month change in percent, null when there is no prior month to compare */
  changePercent: number | null;
  /** last 6 months, oldest first */
  monthly: { month: string; total: number }[];
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function summarize(records: FinancialRecord[], kind: FinancialRecord["kind"], today = new Date()): MoneySummary {
  const rows = records.filter((r) => r.kind === kind);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const verifiedTotal = rows.filter((r) => r.source === "verified").reduce((s, r) => s + r.amount, 0);

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - i, 1));
    months.push(d.toISOString().slice(0, 7));
  }
  const byMonth = new Map<string, number>(months.map((m) => [m, 0]));
  for (const r of rows) {
    const k = monthKey(r.date);
    if (byMonth.has(k)) byMonth.set(k, byMonth.get(k)! + r.amount);
  }
  const monthly = months.map((m) => ({ month: m, total: byMonth.get(m)! }));
  const thisMonth = monthly[5]!.total;
  const lastMonth = monthly[4]!.total;
  const changePercent = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  return { total, verifiedTotal, selfReportedTotal: total - verifiedTotal, thisMonth, lastMonth, changePercent, monthly };
}
