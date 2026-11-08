import { z } from "zod";

const today = () => new Date().toISOString().slice(0, 10);

export const financialRecordInput = z.object({
  kind: z.enum(["income", "spending"]),
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
  caption: z.string().trim().min(1, "Write a caption").max(2200),
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
