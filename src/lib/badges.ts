import type { AffiliateApplication, AffiliateProgram, FinancialRecord, Role } from "./types";

export type BadgeIcon = "star" | "sparkles" | "trophy" | "flame" | "shield" | "chart" | "rocket" | "users" | "wallet";

export interface BadgeDef {
  id: string;
  role: Role;
  name: string;
  description: string;
  icon: BadgeIcon;
  /** Badges that need platform-verified data stay locked until verification exists. */
  requiresVerification?: boolean;
}

export interface BadgeContext {
  role: Role;
  handle: string;
  records: FinancialRecord[];
  programs: AffiliateProgram[];
  applications: AffiliateApplication[];
}

export interface BadgeProgress {
  badge: BadgeDef;
  earned: boolean;
  current: number;
  target: number;
}

export const BADGES: BadgeDef[] = [
  // Creator
  { id: "first_income", role: "creator", name: "First Earnings", description: "Record your first income", icon: "wallet" },
  { id: "collab_pro", role: "creator", name: "Collab Pro", description: "Record 5 brand-deal or campaign incomes", icon: "star" },
  { id: "affiliate_ace", role: "creator", name: "Affiliate Ace", description: "Get approved into 3 affiliate programs", icon: "sparkles" },
  { id: "money_tracker", role: "creator", name: "Money Tracker", description: "Keep 10 income records", icon: "chart" },
  { id: "growth_star", role: "creator", name: "Growth Star", description: "Earn more this month than last month", icon: "flame" },
  { id: "top_creator", role: "creator", name: "Top Creator", description: "₹1,00,000 in verified earnings", icon: "trophy", requiresVerification: true },
  // Business
  { id: "first_program", role: "business", name: "Program Launcher", description: "Launch your first affiliate program", icon: "rocket" },
  { id: "affiliate_builder", role: "business", name: "Affiliate Builder", description: "Approve 3 creators into your programs", icon: "users" },
  { id: "budget_tracker", role: "business", name: "Budget Tracker", description: "Keep 10 spending records", icon: "chart" },
  { id: "creator_backer", role: "business", name: "Creator Backer", description: "Record 5 creator payments", icon: "star" },
  { id: "trusted_brand", role: "business", name: "Trusted Brand", description: "Complete 10 verified collaborations", icon: "shield", requiresVerification: true },
];

function count<T>(arr: T[], pred: (x: T) => boolean): number {
  return arr.reduce((n, x) => (pred(x) ? n + 1 : n), 0);
}

function monthTotals(records: FinancialRecord[], today: Date) {
  const cur = today.toISOString().slice(0, 7);
  const prevDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const prev = prevDate.toISOString().slice(0, 7);
  let a = 0;
  let b = 0;
  for (const r of records) {
    if (r.date.startsWith(cur)) a += r.amount;
    else if (r.date.startsWith(prev)) b += r.amount;
  }
  return { cur: a, prev: b };
}

export function evaluateBadges(ctx: BadgeContext, today = new Date()): BadgeProgress[] {
  const income = ctx.records.filter((r) => r.kind === "income");
  const spending = ctx.records.filter((r) => r.kind === "spending");
  const myPrograms = ctx.programs.filter((p) => p.ownerHandle === ctx.handle && !p.sample);
  const myProgramIds = new Set(myPrograms.map((p) => p.id));

  const progress = (badge: BadgeDef, current: number, target: number): BadgeProgress => ({
    badge,
    current: Math.min(current, target),
    target,
    earned: !badge.requiresVerification && current >= target,
  });

  return BADGES.filter((b) => b.role === ctx.role).map((b) => {
    switch (b.id) {
      case "first_income":
        return progress(b, income.length, 1);
      case "collab_pro":
        return progress(b, count(income, (r) => r.category === "brand_deal" || r.category === "campaign"), 5);
      case "affiliate_ace":
        return progress(b, count(ctx.applications, (a) => a.creatorHandle === ctx.handle && a.status === "approved"), 3);
      case "money_tracker":
        return progress(b, income.length, 10);
      case "growth_star": {
        const { cur, prev } = monthTotals(income, today);
        return progress(b, prev > 0 && cur > prev ? 1 : 0, 1);
      }
      case "top_creator":
        return progress(b, income.filter((r) => r.source === "verified").reduce((s, r) => s + r.amount, 0), 100_000);
      case "first_program":
        return progress(b, count(myPrograms, (p) => p.status === "active"), 1);
      case "affiliate_builder":
        return progress(b, count(ctx.applications, (a) => myProgramIds.has(a.programId) && a.status === "approved"), 3);
      case "budget_tracker":
        return progress(b, spending.length, 10);
      case "creator_backer":
        return progress(b, count(spending, (r) => r.category === "creator_payment"), 5);
      case "trusted_brand":
        return progress(b, 0, 10);
      default:
        return progress(b, 0, 1);
    }
  });
}
