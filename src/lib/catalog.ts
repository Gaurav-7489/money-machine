/**
 * Shared option lists used by Search filters and Edit Profile, so the words a
 * user picks on their profile are exactly the words other people search for.
 */

export const CATEGORIES = [
  "Beauty",
  "Fashion",
  "Fitness",
  "Food",
  "Travel",
  "Tech",
  "Lifestyle",
  "Finance",
  "Gaming",
  "Education",
] as const;

/** Countries and their main cities. Kept short on purpose; "Other" is allowed in profiles. */
export const LOCATIONS: Record<string, string[]> = {
  India: ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi"],
  "United Kingdom": ["London", "Manchester"],
  "United States": ["New York", "Los Angeles"],
  Singapore: ["Singapore"],
};

export const COUNTRIES = Object.keys(LOCATIONS);

/** How a collaboration gets paid. `hint` is the plain-language explanation shown in tooltips. */
export const EARNING_MODELS = [
  { id: "paid_post", label: "Paid post", hint: "A fixed price for each post, reel or video." },
  { id: "affiliate", label: "Per sale (affiliate)", hint: "Money for every sale made through a special link." },
  { id: "barter", label: "Free product", hint: "Products are given in exchange for content, no cash." },
  { id: "ugc", label: "Content for brands", hint: "Videos or photos made for a brand to use in its own ads (UGC)." },
  { id: "long_term", label: "Long-term deal", hint: "An ongoing partnership over several months." },
] as const;

export type EarningModelId = (typeof EARNING_MODELS)[number]["id"];

export function earningLabel(id: string): string {
  return EARNING_MODELS.find((m) => m.id === id)?.label ?? id;
}

/** Normalise a social handle typed as "@name", "instagram.com/name" or "name". */
export function cleanHandle(v: string): string {
  return v
    .trim()
    .replace(/^https?:\/\/(www\.)?[^/]+\//i, "")
    .replace(/^@/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}
