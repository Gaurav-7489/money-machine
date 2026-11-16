export type Role = "creator" | "business";

/** Optional collaboration details a user can add from Edit Profile.
 *  All fields are optional so older saved sessions keep working. */
export interface ProfileDetails {
  bio?: string;
  category?: string;
  country?: string;
  city?: string;
  /** whole rupees per post / deliverable */
  priceFrom?: number;
  priceTo?: number;
  /** whole rupees per confirmed sale (affiliate) */
  perSale?: number;
  earningModels?: string[];
  instagram?: string;
  youtube?: string;
  x?: string;
  /** public contact email, only shown if the user chooses to add one */
  email?: string;
}

export interface Session extends ProfileDetails {
  role: Role;
  displayName: string;
  handle: string;
  createdAt: string;
}

/** Where a financial record came from. Only "verified" records may ever be
 *  shown as confirmed; everything entered by the user is "self_reported". */
export type RecordSource = "self_reported" | "verified";

export type IncomeCategory = "brand_deal" | "affiliate" | "ugc" | "campaign" | "other";
export type SpendingCategory = "creator_payment" | "affiliate_commission" | "campaign" | "product_seeding" | "other";

export interface FinancialRecord {
  id: string;
  kind: "income" | "spending";
  title: string;
  amount: number; // whole rupees
  category: IncomeCategory | SpendingCategory;
  date: string; // ISO yyyy-mm-dd
  counterparty?: string;
  source: RecordSource;
  createdAt: string;
}

export type ProgramStatus = "draft" | "active" | "paused" | "closed";

export interface AffiliateProgram {
  id: string;
  name: string;
  brand: string;
  commissionPercent: number;
  description: string;
  terms: string;
  status: ProgramStatus;
  ownerHandle: string;
  createdAt: string;
  /** true for clearly-labelled sample programs shown in preview mode */
  sample?: boolean;
}

export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface AffiliateApplication {
  id: string;
  programId: string;
  creatorHandle: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

export interface Post {
  id: string;
  authorHandle: string;
  caption: string;
  tags: string[];
  /** background tone for text posts */
  tone?: "rose" | "mint" | "violet" | "amber" | "sky" | "lime";
  /** optional photo, stored as a compressed data URL in the preview build */
  image?: string;
  createdAt: string;
  sample?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorHandle: string;
  authorName: string;
  body: string;
  createdAt: string;
}

/** A conversation the user started themselves (e.g. "Message" from Search). */
export interface Thread {
  id: string;
  with: string;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  fromMe: boolean;
  body: string;
  createdAt: string;
}
