/**
 * SAMPLE CONTENT — development preview only.
 * Every profile, post, program and thread here is fictional and is rendered
 * with a visible "Sample" label. Nothing in this file is a real user record,
 * and no financial figures are included: money and badges only ever come from
 * records the signed-in user enters.
 */
import type { AffiliateProgram, Post } from "./types";

export type Tone = "rose" | "mint" | "violet" | "amber" | "sky" | "lime";

export interface Profile {
  handle: string;
  name: string;
  kind: "creator" | "business";
  niche: string;
  tone: Tone;
  verified?: boolean;
  bio: string;
}

export const SAMPLE_PROFILES: Profile[] = [
  { handle: "aanya.creates", name: "Aanya Mehra", kind: "creator", niche: "Lifestyle · Beauty", tone: "rose", verified: true, bio: "Skincare, slow mornings and honest reviews." },
  { handle: "rohitvlogs", name: "Rohit Vlogs", kind: "creator", niche: "Travel · Vlogs", tone: "sky", bio: "Weekend trips and budget travel." },
  { handle: "kavya.fit", name: "Kavya Fit", kind: "creator", niche: "Fitness", tone: "lime", bio: "Home workouts that actually stick." },
  { handle: "glowhabit", name: "Glow Habit", kind: "business", niche: "Beauty brand", tone: "rose", verified: true, bio: "Clean skincare for everyday glow." },
  { handle: "fitlife", name: "FitLife", kind: "business", niche: "Fitness brand", tone: "mint", bio: "Supplements and gear for active living." },
  { handle: "brandco", name: "BrandCo", kind: "business", niche: "Lifestyle brand", tone: "violet", bio: "Everyday lifestyle essentials." },
];

export function profileByHandle(handle: string): Profile | undefined {
  return SAMPLE_PROFILES.find((p) => p.handle === handle);
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const SAMPLE_POSTS: (Post & { tone: Tone; media: "bottle" | "mountain" | "dumbbell" | "bag"; likes: number; comments: number })[] = [
  { id: "s_post_1", likes: 2400, comments: 120, authorHandle: "aanya.creates", caption: "New skincare collab is live! ✨", tags: ["collab", "skincare"], createdAt: hoursAgo(2), sample: true, tone: "rose", media: "bottle" },
  { id: "s_post_2", likes: 860, comments: 42, authorHandle: "rohitvlogs", caption: "Packed light for the hills this weekend. Full vlog on Friday.", tags: ["travel", "vlog"], createdAt: hoursAgo(5), sample: true, tone: "sky", media: "mountain" },
  { id: "s_post_3", likes: 1300, comments: 97, authorHandle: "fitlife", caption: "We're looking for fitness creators for our winter campaign. Applications open in Affiliates.", tags: ["opportunity", "fitness"], createdAt: hoursAgo(9), sample: true, tone: "mint", media: "dumbbell" },
  { id: "s_post_4", likes: 3100, comments: 210, authorHandle: "kavya.fit", caption: "20-minute routine, zero equipment. Save this one.", tags: ["fitness", "homeworkout"], createdAt: hoursAgo(26), sample: true, tone: "lime", media: "dumbbell" },
];

export const SAMPLE_PROGRAMS: AffiliateProgram[] = [
  { id: "s_prog_glow", name: "Glow Habit Affiliate", brand: "Glow Habit", commissionPercent: 15, description: "Share our everyday skincare range with your audience.", terms: "Commission on confirmed sales through your link. Disclose the partnership in every post.", status: "active", ownerHandle: "glowhabit", createdAt: hoursAgo(300), sample: true },
  { id: "s_prog_fit", name: "FitLife Affiliate", brand: "FitLife", commissionPercent: 10, description: "Promote supplements and gear to fitness audiences.", terms: "Commission on confirmed sales. No medical claims.", status: "active", ownerHandle: "fitlife", createdAt: hoursAgo(500), sample: true },
  { id: "s_prog_brandco", name: "BrandCo Affiliate", brand: "BrandCo", commissionPercent: 20, description: "Lifestyle essentials for home and travel.", terms: "Commission on confirmed sales within 30 days of click.", status: "active", ownerHandle: "brandco", createdAt: hoursAgo(800), sample: true },
];

export const SAMPLE_THREADS = [
  { id: "t_glow", with: "glowhabit", preview: "Thanks for applying! We'll review this week.", at: hoursAgo(1), unread: true },
  { id: "t_fit", with: "fitlife", preview: "Would you be open to a 3-post package?", at: hoursAgo(4), unread: true },
  { id: "t_rohit", with: "rohitvlogs", preview: "Let's plan the collab reel 🙌", at: hoursAgo(30), unread: true },
];
