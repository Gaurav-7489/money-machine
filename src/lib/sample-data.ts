/**
 * SAMPLE CONTENT — development preview only.
 * Every profile, post, program, opportunity and thread here is fictional and is
 * rendered with a visible "Sample" label. Nothing in this file is a real user
 * record. Prices are what the fictional profile "asks" or "offers"; no earnings
 * are invented: money and badges only ever come from records the user enters.
 */
import { ADMIN_HANDLE, OWNER_HANDLE, OWNER_NAME } from "./catalog";
import type { AffiliateProgram, DealOffer, Opportunity, Post } from "./types";

export type Tone = "rose" | "mint" | "violet" | "amber" | "sky" | "lime";

export interface Profile {
  handle: string;
  name: string;
  kind: "creator" | "business";
  /** short display line, e.g. "Skincare · Beauty" */
  niche: string;
  tone: Tone;
  verified?: boolean;
  bio: string;
  /** main niche (first of niches) */
  category: string;
  niches: string[];
  country: string;
  /** state / province (ISO 3166-2 name) */
  region?: string;
  city: string;
  /** ISO 4217; every sample amount is written in rupees */
  currency: string;
  /** creators: what they charge per video; businesses: their usual budget per video (whole ₹) */
  priceFrom: number;
  priceTo: number;
  /** price per confirmed sale (affiliate), min to max: what a creator asks / what a business pays */
  perSaleMin?: number;
  perSaleMax?: number;
  /** UGC price per 1,000 views, min to max */
  perThousandMin?: number;
  perThousandMax?: number;
  /** creators: monthly views from their connected social accounts (sample) */
  monthlyViews?: number;
  /** businesses: a payment gateway is connected, so sales are verified (sample) */
  gatewayConnected?: boolean;
  earningModels: string[];
  socials: { instagram?: string; youtube?: string; x?: string };
  email?: string;
  /** system accounts never show in Search */
  system?: "admin" | "owner";
}

const CITY_REGION: Record<string, string> = { Mumbai: "Maharashtra", Pune: "Maharashtra", Bengaluru: "Karnataka", Delhi: "Delhi", Hyderabad: "Telangana", Chennai: "Tamil Nadu", Jaipur: "Rajasthan", Dubai: "Dubai", London: "England" };
const r10 = (v: number) => Math.max(10, Math.round(v / 10) * 10);
type Seed = Omit<Profile, "category" | "currency" | "perSaleMin" | "perSaleMax" | "perThousandMin" | "perThousandMax"> & { category?: string; perSale?: number; commissionPercent?: number; views?: number };
/** Sample profiles: per-sale and per-1K-view prices are filled in from the seed so every way of working has a price. */
const P = ({ perSale, commissionPercent: _c, views, ...p }: Seed): Profile => {
  const affiliate = p.earningModels.includes("affiliate");
  const ugc = p.earningModels.includes("ugc");
  const sale = perSale ?? (affiliate ? r10(p.priceFrom / 50) : undefined);
  return {
    ...p,
    region: p.region ?? CITY_REGION[p.city],
    currency: "INR",
    category: p.category ?? p.niches[0]!,
    perSaleMin: sale,
    perSaleMax: sale !== undefined ? r10(sale * 1.6) : undefined,
    perThousandMin: ugc ? r10(p.priceFrom / 25) : undefined,
    perThousandMax: ugc ? r10(p.priceTo / 25) : undefined,
    monthlyViews: p.kind === "creator" ? views : undefined,
  };
};

export const SAMPLE_PROFILES: Profile[] = [
  // ── creators ──
  P({ handle: "aanya.creates", name: "Aanya Mehra", kind: "creator", views: 1240000, niche: "Skincare · Makeup", tone: "rose", verified: true, bio: "Slow mornings and honest reviews.", niches: ["Skincare", "Makeup"], country: "India", city: "Mumbai", priceFrom: 8000, priceTo: 25000, perSale: 150, commissionPercent: 15, earningModels: ["brand_deal", "affiliate", "pr_package", "review"], socials: { instagram: "aanya.creates", youtube: "aanyacreates" } }),
  P({ handle: "rohitvlogs", name: "Rohit Vlogs", kind: "creator", views: 380000, niche: "Travel · Vlogs", tone: "sky", bio: "Weekend trips and budget travel.", niches: ["Travel", "Lifestyle"], country: "India", city: "Pune", priceFrom: 5000, priceTo: 15000, earningModels: ["sponsored", "partnership", "event"], socials: { instagram: "rohitvlogs", youtube: "rohitvlogs" } }),
  P({ handle: "kavya.fit", name: "Kavya Fit", kind: "creator", views: 215000, niche: "Fitness", tone: "lime", bio: "Home workouts that actually stick.", niches: ["Fitness", "Wellness"], country: "India", city: "Bengaluru", priceFrom: 3000, priceTo: 10000, perSale: 100, commissionPercent: 12, earningModels: ["affiliate", "ugc", "brand_deal", "ambassador"], socials: { instagram: "kavya.fit", x: "kavyafit" } }),
  P({ handle: "meera.home", name: "Meera Nest", kind: "creator", views: 460000, niche: "Home Decor", tone: "amber", bio: "Small flats, big personality.", niches: ["Home Decor", "Lifestyle"], country: "India", city: "Delhi", priceFrom: 6000, priceTo: 18000, commissionPercent: 10, earningModels: ["ugc", "pr_package", "seeding", "review"], socials: { instagram: "meera.home" } }),
  P({ handle: "zoya.glam", name: "Zoya Glam", kind: "creator", views: 2900000, niche: "Makeup · Haircare", tone: "violet", verified: true, bio: "Bridal looks, 5-minute faces and everything in between.", niches: ["Makeup", "Haircare", "Fashion"], country: "United Arab Emirates", city: "Dubai", priceFrom: 15000, priceTo: 60000, perSale: 250, commissionPercent: 20, earningModels: ["brand_deal", "sponsored", "ambassador", "event"], socials: { instagram: "zoya.glam", youtube: "zoyaglam" } }),
  P({ handle: "arjun.tech", name: "Arjun Unboxed", kind: "creator", views: 1750000, niche: "Tech · Gadgets", tone: "sky", bio: "Gadgets tested for a month before I say a word.", niches: ["Tech", "Gaming"], country: "India", city: "Hyderabad", priceFrom: 10000, priceTo: 40000, perSale: 300, commissionPercent: 8, earningModels: ["review", "sponsored", "affiliate", "shoutout"], socials: { youtube: "arjununboxed", x: "arjuntech" } }),
  P({ handle: "nisha.eats", name: "Nisha Eats", kind: "creator", views: 290000, niche: "Food", tone: "amber", bio: "15-minute dinners for busy people.", niches: ["Food", "Lifestyle"], country: "India", city: "Chennai", priceFrom: 4000, priceTo: 12000, commissionPercent: 10, earningModels: ["ugc", "brand_deal", "shoutout", "seeding"], socials: { instagram: "nisha.eats" } }),
  P({ handle: "sana.skin", name: "Sana Derm Diaries", kind: "creator", views: 820000, niche: "Lifestyle", tone: "mint", bio: "Real life, real routines, no filters.", niches: ["Lifestyle", "Wellness"], country: "United Kingdom", city: "London", priceFrom: 9000, priceTo: 30000, perSale: 180, commissionPercent: 18, earningModels: ["affiliate", "ugc", "review", "pr_package"], socials: { instagram: "sana.skin" } }),
  P({ handle: "dev.parent", name: "Dev & Tiny", kind: "creator", views: 340000, niche: "Parenting", tone: "lime", bio: "Dad of two, chaos documented.", niches: ["Parenting", "Home Decor"], country: "India", city: "Mumbai", priceFrom: 5000, priceTo: 14000, earningModels: ["brand_deal", "pr_package", "seeding"], socials: { instagram: "dev.parent", youtube: "devandtiny" } }),
  P({ handle: "riya.style", name: "Riya Threads", kind: "creator", views: 175000, niche: "Fashion", tone: "rose", bio: "Thrift flips and capsule wardrobes.", niches: ["Fashion", "Lifestyle"], country: "India", city: "Jaipur", priceFrom: 3500, priceTo: 9000, perSale: 90, commissionPercent: 12, earningModels: ["affiliate", "ugc", "shoutout", "partnership"], socials: { instagram: "riya.style", x: "riyastyle" } }),

  // ── businesses ──
  P({ handle: "glowhabit", name: "Glow Habit", kind: "business", gatewayConnected: true, niche: "Skincare brand", tone: "rose", verified: true, bio: "Clean skincare for everyday glow.", niches: ["Skincare", "Wellness"], country: "India", city: "Mumbai", priceFrom: 5000, priceTo: 30000, perSale: 120, commissionPercent: 15, earningModels: ["affiliate", "pr_package", "brand_deal", "ugc"], socials: { instagram: "glowhabit" }, email: "collabs@glowhabit.example" }),
  P({ handle: "fitlife", name: "FitLife", kind: "business", gatewayConnected: true, niche: "Fitness brand", tone: "mint", bio: "Supplements and gear for active living.", niches: ["Fitness", "Wellness"], country: "India", city: "Delhi", priceFrom: 2000, priceTo: 12000, perSale: 80, commissionPercent: 10, earningModels: ["affiliate", "ugc", "ambassador"], socials: { instagram: "fitlife", youtube: "fitlifeofficial" }, email: "partners@fitlife.example" }),
  P({ handle: "brandco", name: "BrandCo", kind: "business", niche: "Lifestyle brand", tone: "violet", bio: "Everyday lifestyle essentials.", niches: ["Lifestyle", "Home Decor"], country: "United Arab Emirates", city: "Dubai", priceFrom: 10000, priceTo: 50000, perSale: 200, commissionPercent: 20, earningModels: ["sponsored", "partnership", "event"], socials: { instagram: "brandco", x: "brandco" } }),
  // Bio says nothing about skincare — only its posts do. Search still finds it.
  P({ handle: "dewdrop.labs", name: "Dewdrop Labs", kind: "business", niche: "Beauty lab", tone: "sky", bio: "Small-batch formulas, made in Pune.", niches: ["Wellness"], country: "India", city: "Pune", priceFrom: 4000, priceTo: 20000, commissionPercent: 18, earningModels: ["seeding", "pr_package", "affiliate", "review"], socials: { instagram: "dewdroplabs" } }),
  P({ handle: "nestandco", name: "Nest & Co", kind: "business", niche: "Home Decor brand", tone: "amber", bio: "Handmade cushions, lamps and throws.", niches: ["Home Decor"], country: "India", city: "Bengaluru", priceFrom: 3000, priceTo: 15000, commissionPercent: 12, earningModels: ["ugc", "seeding", "affiliate"], socials: { instagram: "nestandco" } }),
  P({ handle: "lumen.audio", name: "Lumen Audio", kind: "business", gatewayConnected: true, niche: "Tech brand", tone: "violet", bio: "Earbuds and speakers tuned in Singapore.", niches: ["Tech"], country: "Singapore", city: "Singapore", priceFrom: 15000, priceTo: 80000, perSale: 400, commissionPercent: 8, earningModels: ["review", "sponsored", "affiliate", "ambassador"], socials: { youtube: "lumenaudio", x: "lumenaudio" } }),
  P({ handle: "masala.box", name: "Masala Box", kind: "business", niche: "Food brand", tone: "lime", bio: "Spice kits delivered every month.", niches: ["Food"], country: "India", city: "Hyderabad", priceFrom: 2500, priceTo: 10000, perSale: 60, commissionPercent: 15, earningModels: ["ugc", "seeding", "shoutout", "affiliate"], socials: { instagram: "masalabox" } }),
  P({ handle: "velvet.beauty", name: "Velvet Beauty", kind: "business", gatewayConnected: true, niche: "Makeup brand", tone: "rose", verified: true, bio: "Long-wear colour for every skin tone.", niches: ["Makeup", "Haircare"], country: "United Kingdom", city: "London", priceFrom: 12000, priceTo: 60000, perSale: 220, commissionPercent: 20, earningModels: ["brand_deal", "ambassador", "event", "pr_package"], socials: { instagram: "velvetbeauty" } }),

  // ── system accounts (never in Search) ──
  P({ handle: ADMIN_HANDLE, name: "Money Machine", kind: "business", niche: "Official", tone: "violet", verified: true, bio: "The official Money Machine team. We connect creators and brands for you.", niches: ["Lifestyle"], country: "India", city: "Mumbai", priceFrom: 0, priceTo: 0, earningModels: [], socials: {}, system: "admin" }),
  P({ handle: OWNER_HANDLE, name: OWNER_NAME, kind: "business", niche: "Founder, Money Machine", tone: "amber", verified: true, bio: "Founder of Money Machine. I personally reach out to creators I love.", niches: ["Lifestyle"], country: "India", city: "Mumbai", priceFrom: 0, priceTo: 0, earningModels: [], socials: {}, system: "owner" }),
];

export const SEARCHABLE_PROFILES = SAMPLE_PROFILES.filter((p) => !p.system);

export function profileByHandle(handle: string): Profile | undefined {
  return SAMPLE_PROFILES.find((p) => p.handle === handle);
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export type SamplePost = Post & { tone: Tone; media?: "bottle" | "mountain" | "dumbbell" | "bag" | "lamp" | "headphones" | "bowl"; likes: number; comments: number; reposts: number };

export const SAMPLE_POSTS: SamplePost[] = [
  { id: "s_post_1", likes: 2400, comments: 120, reposts: 88, authorHandle: "aanya.creates", caption: "New skincare collab is live! ✨ Week 3 of using this vitamin C serum and my skin has never been calmer.", tags: ["collab", "skincare"], createdAt: hoursAgo(2), sample: true, tone: "rose", media: "bottle" },
  { id: "s_post_d1", likes: 610, comments: 34, reposts: 21, authorHandle: "dewdrop.labs", caption: "Our new barrier-repair moisturiser just passed its stability tests. Looking for skincare creators to try the first batch 🧪", tags: ["skincare", "launch"], createdAt: hoursAgo(3), sample: true, tone: "sky", media: "bottle" },
  { id: "s_post_g1", likes: 120, comments: 18, reposts: 9, authorHandle: "kavya.fit", caption: "Monday motivation, no excuses.", tags: ["fitness"], createdAt: hoursAgo(4), sample: true, tone: "lime", gif: "lets-go" },
  { id: "s_post_2", likes: 860, comments: 42, reposts: 12, authorHandle: "rohitvlogs", caption: "Packed light for the hills this weekend. Full vlog on Friday.", tags: ["travel", "vlog"], createdAt: hoursAgo(5), sample: true, tone: "sky", media: "mountain" },
  { id: "s_post_s1", likes: 1900, comments: 230, reposts: 140, authorHandle: "sana.skin", caption: "My 4-step skincare routine for London winters: cleanser, niacinamide, ceramide cream, SPF. That's it.", tags: ["skincare", "routine"], createdAt: hoursAgo(7), sample: true, tone: "mint" },
  { id: "s_post_3", likes: 1300, comments: 97, reposts: 45, authorHandle: "fitlife", caption: "We're looking for fitness creators for our winter campaign. Check Opportunities 💪", tags: ["opportunity", "fitness"], createdAt: hoursAgo(9), sample: true, tone: "mint", media: "dumbbell" },
  { id: "s_post_m1", likes: 740, comments: 51, reposts: 30, authorHandle: "meera.home", caption: "Turned a 300 sq ft rental into a cosy reading nook. Rug, lamp and a lot of patience.", tags: ["homedecor", "rental"], createdAt: hoursAgo(12), sample: true, tone: "amber", media: "lamp" },
  { id: "s_post_n1", likes: 330, comments: 22, reposts: 11, authorHandle: "nestandco", caption: "New block-print cushion covers just dropped. Sending a few to home decor creators this week!", tags: ["homedecor", "seeding"], createdAt: hoursAgo(14), sample: true, tone: "amber" },
  { id: "s_post_z1", likes: 5200, comments: 410, reposts: 320, authorHandle: "zoya.glam", caption: "Soft glam in 7 minutes. Products linked in my bio 💄", tags: ["makeup", "grwm"], createdAt: hoursAgo(18), sample: true, tone: "violet", gif: "slay" },
  { id: "s_post_a1", likes: 2900, comments: 380, reposts: 110, authorHandle: "arjun.tech", caption: "30 days with these earbuds: battery is great, call quality is not. Full review tonight.", tags: ["tech", "review"], createdAt: hoursAgo(22), sample: true, tone: "sky", media: "headphones" },
  { id: "s_post_4", likes: 3100, comments: 210, reposts: 95, authorHandle: "kavya.fit", caption: "20-minute routine, zero equipment. Save this one.", tags: ["fitness", "homeworkout"], createdAt: hoursAgo(26), sample: true, tone: "lime", media: "dumbbell" },
  { id: "s_post_mb", likes: 410, comments: 29, reposts: 14, authorHandle: "masala.box", caption: "This month's kit: Chettinad. Food creators, want one? Reply below 🌶️", tags: ["food", "seeding"], createdAt: hoursAgo(30), sample: true, tone: "lime", media: "bowl" },
  { id: "s_post_ne", likes: 980, comments: 88, reposts: 40, authorHandle: "nisha.eats", caption: "One-pan paneer tikka. 15 minutes, one pan, zero stress.", tags: ["food", "recipe"], createdAt: hoursAgo(34), sample: true, tone: "amber", media: "bowl" },
  { id: "s_post_v1", likes: 1500, comments: 75, reposts: 60, authorHandle: "velvet.beauty", caption: "Our ambassador program is open for makeup artists in the UK and UAE.", tags: ["makeup", "ambassador"], createdAt: hoursAgo(40), sample: true, tone: "rose" },
  { id: "s_post_r1", likes: 640, comments: 40, reposts: 25, authorHandle: "riya.style", caption: "₹800 thrift haul → 6 outfits. Thread below 🧵", tags: ["fashion", "thrift"], createdAt: hoursAgo(46), sample: true, tone: "rose", media: "bag" },
  { id: "s_post_dp", likes: 870, comments: 66, reposts: 33, authorHandle: "dev.parent", caption: "Tried every baby carrier so you don't have to. Honest ranking coming Sunday.", tags: ["parenting", "review"], createdAt: hoursAgo(52), sample: true, tone: "lime" },
];

/** Sample comments shown under sample posts (fictional). */
export const SAMPLE_COMMENTS = [
  { id: "s_c1", postId: "s_post_1", authorHandle: "glowhabit", authorName: "Glow Habit", body: "Your skin looks amazing! DM us 💌", createdAt: hoursAgo(1) },
  { id: "s_c2", postId: "s_post_1", authorHandle: "sana.skin", authorName: "Sana Derm Diaries", body: "", gif: "fire", createdAt: hoursAgo(1.5) },
  { id: "s_c3", postId: "s_post_z1", authorHandle: "velvet.beauty", authorName: "Velvet Beauty", body: "That blend 😍", createdAt: hoursAgo(10) },
  { id: "s_c4", postId: "s_post_3", authorHandle: "kavya.fit", authorName: "Kavya Fit", body: "Applied! Would love to be part of this.", createdAt: hoursAgo(8) },
  { id: "s_c5", postId: "s_post_d1", authorHandle: "aanya.creates", authorName: "Aanya Mehra", body: "Sign me up for the first batch 🙋‍♀️", createdAt: hoursAgo(2) },
];

export const SAMPLE_PROGRAMS: AffiliateProgram[] = [
  { id: "s_prog_glow", name: "Glow Habit Affiliate", brand: "Glow Habit", perSaleMin: 120, perSaleMax: 200, currency: "INR", description: "Share our everyday skincare range with your audience.", terms: "Paid per confirmed sale through your link. Disclose the partnership in every post.", status: "active", ownerHandle: "glowhabit", createdAt: hoursAgo(300), sample: true },
  { id: "s_prog_fit", name: "FitLife Affiliate", brand: "FitLife", perSaleMin: 80, perSaleMax: 150, currency: "INR", description: "Promote supplements and gear to fitness audiences.", terms: "Paid per confirmed sale. No medical claims.", status: "active", ownerHandle: "fitlife", createdAt: hoursAgo(500), sample: true },
  { id: "s_prog_brandco", name: "BrandCo Affiliate", brand: "BrandCo", perSaleMin: 200, perSaleMax: 350, currency: "INR", description: "Lifestyle essentials for home and travel.", terms: "Paid per confirmed sale within 30 days of click.", status: "active", ownerHandle: "brandco", createdAt: hoursAgo(800), sample: true },
];

export const SAMPLE_OPPORTUNITIES: Opportunity[] = [
  { id: "s_opp_fit", ownerHandle: "fitlife", title: "Winter shred campaign", type: "brand_deal", niches: ["Fitness"], budgetMin: 8000, budgetMax: 20000, deliverables: [{ count: 2, type: "Reels" }, { count: 3, type: "Stories" }], details: "Show your winter routine using our protein and resistance bands.", createdAt: hoursAgo(9), sample: true },
  { id: "s_opp_dew", ownerHandle: "dewdrop.labs", title: "First-batch skincare seeding", type: "seeding", niches: ["Skincare", "Makeup"], deliverables: [{ count: 1, type: "Reels" }], details: "We'll send our new moisturiser. Post only if you love it.", createdAt: hoursAgo(3), sample: true },
  { id: "s_opp_nest", ownerHandle: "nestandco", title: "Cosy corner UGC", type: "ugc", niches: ["Home Decor"], budgetMin: 4000, budgetMax: 9000, deliverables: [{ count: 3, type: "Photos" }, { count: 1, type: "Videos" }], details: "Style our cushions in your space. Raw footage is fine.", createdAt: hoursAgo(20), sample: true },
  { id: "s_opp_lumen", ownerHandle: "lumen.audio", title: "Earbuds long-term review", type: "review", niches: ["Tech"], budgetMin: 25000, budgetMax: 60000, deliverables: [{ count: 1, type: "Videos" }, { count: 2, type: "Posts" }], details: "Use our earbuds for 30 days, then review honestly.", createdAt: hoursAgo(50), sample: true },
];

export interface SampleThread {
  id: string;
  with: string;
  /** messages from the other person, oldest first */
  inbound: { body: string; deal?: DealOffer; at: string }[];
  unread: boolean;
  dealType?: string;
  /** only show to this role */
  role?: "creator" | "business";
}

export const SAMPLE_THREADS: SampleThread[] = [
  {
    id: "t_owner",
    with: OWNER_HANDLE,
    role: "creator",
    unread: true,
    inbound: [{ body: `Hi! I'm ${OWNER_NAME}, founder of Money Machine. I loved your profile and I'd like to personally help you land your first deals here. Reply any time 💛`, at: hoursAgo(0.5) }],
  },
  {
    id: "t_glow",
    with: "glowhabit",
    role: "creator",
    dealType: "affiliate",
    unread: true,
    inbound: [{ body: "We'd love you in our affiliate program!", at: hoursAgo(1), deal: { type: "affiliate", deliverables: [{ count: 2, type: "Reels" }, { count: 3, type: "Photos" }], note: "₹150 on every sale through your code, plus a launch kit.", budgetMin: 5000, budgetMax: 12000 } }],
  },
  {
    id: "t_fit",
    with: "fitlife",
    role: "creator",
    dealType: "brand_deal",
    unread: true,
    inbound: [{ body: "Would you be open to a 3-post package?", at: hoursAgo(4), deal: { type: "brand_deal", budgetMin: 8000, budgetMax: 20000, deliverables: [{ count: 2, type: "Reels" }, { count: 1, type: "Posts" }], note: "Winter campaign, posting in the first week of December." } }],
  },
  {
    id: "t_velvet",
    with: "velvet.beauty",
    role: "creator",
    dealType: "pr_package",
    unread: false,
    inbound: [{ body: "Sending you our new lip kit! No strings attached 💋", at: hoursAgo(28), deal: { type: "pr_package", deliverables: [{ count: 1, type: "Stories" }], note: "Share only if you love it." } }],
  },
  { id: "t_rohit", with: "rohitvlogs", unread: true, inbound: [{ body: "Let's plan the collab reel 🙌", at: hoursAgo(30) }] },
  { id: "t_kavya", with: "kavya.fit", role: "business", unread: true, inbound: [{ body: "Hi! I saw your post about the winter campaign. My rates are in my profile 😊", at: hoursAgo(6) }] },
  { id: "t_aanya", with: "aanya.creates", role: "business", unread: false, inbound: [{ body: "Thanks for reaching out, sending my media kit now.", at: hoursAgo(40) }] },
];
