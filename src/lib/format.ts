/** The currency used when an account hasn't picked a country yet (Money Machine launched in India). */
export const DEFAULT_CURRENCY = "INR";

const formatters = new Map<string, Intl.NumberFormat>();
function fmt(currency: string): Intl.NumberFormat {
  let f = formatters.get(currency);
  if (!f) {
    try {
      f = new Intl.NumberFormat(currency === "INR" ? "en-IN" : undefined, { style: "currency", currency, maximumFractionDigits: 0 });
    } catch {
      f = new Intl.NumberFormat("en-IN", { style: "currency", currency: DEFAULT_CURRENCY, maximumFractionDigits: 0 });
    }
    formatters.set(currency, f);
  }
  return f;
}

/** Whole-unit money in the given ISO 4217 currency, e.g. ₹2,500, $2,500, AED 2,500. Amounts are never converted. */
export function formatMoney(amount: number, currency: string = DEFAULT_CURRENCY): string {
  return fmt(currency).format(amount);
}

/** The symbol (or code) people recognise for a currency, e.g. ₹, $, £, AED. */
export function currencySymbol(currency: string = DEFAULT_CURRENCY): string {
  return fmt(currency).formatToParts(0).find((p) => p.type === "currency")?.value ?? currency;
}

/** Kept for existing callers: rupees. */
export function formatINR(amount: number): string {
  return formatMoney(amount, "INR");
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const s = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDate(iso: string): string {
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function uid(prefix = "id"): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

export function initials(name: string): string {
  return name
    .replace(/[@_.-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
