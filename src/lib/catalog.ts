/**
 * Shared option lists used by onboarding, Edit Profile, Search, bulk DMs and
 * message folders, so the words a user picks on their profile are exactly the
 * words other people search for.
 */

/** Content / business niches. Creators pick what they make; businesses pick what they sell. */
export const NICHES = [
  "Makeup",
  "Skincare",
  "Haircare",
  "Fashion",
  "Fitness",
  "Home Decor",
  "Food",
  "Travel",
  "Tech",
  "Gaming",
  "Parenting",
  "Finance",
  "Education",
  "Lifestyle",
  "Pets",
  "Wellness",
] as const;

/** Kept for older saved profiles and the badges/affiliate pages. */
export const CATEGORIES = NICHES;

/** Countries and their main cities. Kept short on purpose. */
export const LOCATIONS: Record<string, string[]> = {
  India: ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Goa"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
  "United Kingdom": ["London", "Manchester", "Birmingham"],
  "United States": ["New York", "Los Angeles", "Miami"],
  Singapore: ["Singapore"],
  Canada: ["Toronto", "Vancouver"],
};

export const COUNTRIES = Object.keys(LOCATIONS);

/** Means of earning. Each one also becomes a message folder for creators who choose it. */
export const EARNING_MODELS = [
  { id: "affiliate", label: "Affiliate marketing", short: "Affiliate", hint: "Money for every sale made through your link or code." },
  { id: "ugc", label: "UGC", short: "UGC", hint: "Videos or photos made for a brand to use in its own ads." },
  { id: "brand_deal", label: "Brand deals", short: "Brand deals", hint: "A paid collaboration with a brand." },
  { id: "pr_package", label: "PR packages", short: "PR packages", hint: "Free products sent to you to try and share." },
  { id: "sponsored", label: "Sponsored content", short: "Sponsored", hint: "A post, reel or video paid for by a brand." },
  { id: "review", label: "Product reviews", short: "Reviews", hint: "An honest review of a product." },
  { id: "shoutout", label: "Shoutouts", short: "Shoutouts", hint: "A quick mention of a brand or account." },
  { id: "ambassador", label: "Ambassador programs", short: "Ambassador", hint: "A long-term role representing a brand." },
  { id: "partnership", label: "Influencer partnerships", short: "Partnerships", hint: "An ongoing partnership over several months." },
  { id: "seeding", label: "Product seeding", short: "Seeding", hint: "Products sent to many creators with no fixed posting deal." },
  { id: "event", label: "Event collaborations", short: "Events", hint: "Attending, hosting or covering a brand event." },
] as const;

export type EarningModelId = (typeof EARNING_MODELS)[number]["id"];

export function earningLabel(id: string): string {
  return EARNING_MODELS.find((m) => m.id === id)?.label ?? id;
}
export function earningShort(id: string): string {
  return EARNING_MODELS.find((m) => m.id === id)?.short ?? id;
}

/** Things a creator can deliver in a deal. */
export const DELIVERABLE_TYPES = ["Reels", "Photos", "Stories", "Videos", "Posts", "Live streams", "Blogs"] as const;

export interface Deliverable {
  count: number;
  type: string;
}

export function deliverablesText(list: Deliverable[]): string {
  return list.filter((d) => d.count > 0).map((d) => `${d.count} ${d.count === 1 ? d.type.replace(/s$/, "") : d.type}`).join(" + ");
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

/** The Money Machine admin account. Its messages live in the pinned top folder. */
export const ADMIN_HANDLE = "moneymachine";
/** The owner's personal account. Her outreach to creators gets its own folder. */
export const OWNER_HANDLE = "zenath.sath";
export const OWNER_NAME = "Zenath Sath";

/** How many days a user must wait between bulk DMs. */
export const BULK_DM_COOLDOWN_DAYS = 10;
