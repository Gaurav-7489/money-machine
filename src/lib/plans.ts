/**
 * Membership prices. This file is the single source of truth: the checkout API
 * reads the amounts from here, so the browser can never choose its own price.
 * Amounts are in US dollars.
 */
export type Side = "creator" | "business";

export const PLANS: Record<Side, { label: string; firstMonth: number; monthly: number }> = {
  creator: { label: "Content creator", firstMonth: 1, monthly: 19 },
  business: { label: "Business owner", firstMonth: 1, monthly: 29 },
};

export const isSide = (v: unknown): v is Side => v === "creator" || v === "business";
