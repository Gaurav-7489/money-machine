import { formatMoney } from "./format";

/**
 * How each way of working is priced. The price fields people see (in Search,
 * on their profile, in deals) follow the way of working they picked:
 *  - Brand deals and other paid content: budget per video
 *  - Affiliate marketing: price per sale
 *  - UGC: price per 1,000 views
 *  - Free PR packages and product seeding: free, so no price at all
 */
export type PriceKind = "video" | "sale" | "views";

export const PRICE_KIND: Record<string, PriceKind | "free"> = {
  brand_deal: "video",
  sponsored: "video",
  review: "video",
  shoutout: "video",
  ambassador: "video",
  partnership: "video",
  event: "video",
  affiliate: "sale",
  ugc: "views",
  pr_package: "free",
  seeding: "free",
};

export const PRICE_LABEL: Record<PriceKind, string> = {
  video: "Budget per video",
  sale: "Price per sale",
  views: "Price per 1,000 views",
};

/** Short unit shown after an amount, e.g. "₹5,000 /video". */
export const PRICE_UNIT: Record<PriceKind, string> = { video: "/video", sale: "/sale", views: "/1K views" };

const ORDER: PriceKind[] = ["video", "sale", "views"];

/** The price fields to show for the ways of working picked, in a fixed order. */
export function priceKindsFor(models: string[]): PriceKind[] {
  const kinds = new Set(models.map((m) => PRICE_KIND[m]).filter((k): k is PriceKind => !!k && k !== "free"));
  return ORDER.filter((k) => kinds.has(k));
}

export function priceKindOf(model: string): PriceKind | null {
  const k = PRICE_KIND[model];
  return k && k !== "free" ? k : null;
}


/** "₹120 – ₹200 per sale" for an affiliate program (older programs saved a % commission). */
export function programPayText(p: { perSaleMin?: number; perSaleMax?: number; currency?: string; commissionPercent?: number }): string {
  const f = (v: number) => formatMoney(v, p.currency);
  if (p.perSaleMin !== undefined && p.perSaleMax !== undefined) return `${p.perSaleMin === p.perSaleMax ? f(p.perSaleMin) : `${f(p.perSaleMin)} – ${f(p.perSaleMax)}`} per sale`;
  if (p.perSaleMin !== undefined || p.perSaleMax !== undefined) return `${f((p.perSaleMin ?? p.perSaleMax)!)} per sale`;
  if (p.commissionPercent !== undefined) return `${p.commissionPercent}% per sale`;
  return "Price per sale to discuss";
}
