import { z } from "zod";

const today = () => new Date().toISOString().slice(0, 10);

export const financialRecordInput = z.object({
  kind: z.enum(["income", "spending", "revenue"]),
  title: z.string().trim().min(2, "Add a short description").max(80),
  amount: z.coerce
    .number({ message: "Enter an amount" })
    .int("Use whole rupees")
    .positive("Amount must be more than 0")
    .max(100_000_000, "That amount looks too large"),
  category: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")
    .refine((d) => d <= today(), "Date can't be in the future"),
  counterparty: z.string().trim().max(60).optional(),
});

export const affiliateProgramInput = z.object({
  name: z.string().trim().min(3, "Program name needs at least 3 characters").max(60),
  commissionPercent: z.coerce
    .number({ message: "Enter a commission" })
    .min(1, "Commission must be at least 1%")
    .max(90, "Commission can't exceed 90%"),
  description: z.string().trim().min(10, "Describe the program in a sentence or two").max(400),
  terms: z.string().trim().min(10, "Add the key terms creators agree to").max(1000),
});

export const applicationInput = z.object({
  message: z.string().trim().min(10, "Tell the brand a little about you").max(500),
});

export const postInput = z.object({
  caption: z.string().min(1, "Write something first").max(2200),
  tags: z.string().max(200).optional(),
});

export const onboardingInput = z.object({
  role: z.enum(["creator", "business"]),
  displayName: z.string().trim().min(2, "Enter your name").max(50),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, "3–30 letters, numbers, dots or underscores"),
});

export type FieldErrors = Record<string, string>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

const optionalRupees = z
  .union([z.literal(""), z.coerce.number({ message: "Use numbers only" }).int("Use whole rupees").min(0, "Can't be below 0").max(100_000_000, "That amount looks too large")])
  .transform((v) => (v === "" ? undefined : v));

const socialHandle = z
  .string()
  .trim()
  .max(60)
  .transform((v) => v.replace(/^https?:\/\/(www\.)?[^/]+\//i, "").replace(/^@/, "").replace(/\/+$/, ""))
  .refine((v) => v === "" || /^[A-Za-z0-9_.-]{1,40}$/.test(v), "Use letters, numbers, dots or underscores")
  .transform((v) => v || undefined);

export const profileInput = z
  .object({
    displayName: z.string().trim().min(2, "Name must be 2–50 characters").max(50, "Name must be 2–50 characters"),
    bio: z.string().trim().max(160, "Keep your bio under 160 characters").transform((v) => v || undefined),
    category: z.string().transform((v) => v || undefined),
    niches: z.array(z.string()).max(16).default([]),
    lookingFor: z.array(z.string()).max(16).default([]),
    commissionPercent: z.union([z.literal(""), z.coerce.number({ message: "Use numbers only" }).min(0, "Can't be below 0").max(90, "Commission can't exceed 90%")]).optional().transform((v) => (v === "" || v === undefined ? undefined : v)),
    country: z.string().transform((v) => v || undefined),
    city: z.string().transform((v) => v || undefined),
    priceFrom: optionalRupees,
    priceTo: optionalRupees,
    perSale: optionalRupees,
    earningModels: z.array(z.string()).max(10),
    instagram: socialHandle,
    youtube: socialHandle,
    x: socialHandle,
    email: z
      .string()
      .trim()
      .max(320)
      .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email, like name@example.com")
      .transform((v) => v || undefined),
  })
  .refine((d) => d.priceFrom === undefined || d.priceTo === undefined || d.priceFrom <= d.priceTo, {
    message: "“From” should be smaller than “To”",
    path: ["priceTo"],
  });
