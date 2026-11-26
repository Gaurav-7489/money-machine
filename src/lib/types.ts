export type Role = "creator" | "business";

/** Optional collaboration details a user can add from Edit Profile.
 *  All fields are optional so older saved sessions keep working. */
export interface ProfileDetails {
  bio?: string;
  category?: string;
  /** Creators: the content they make. Businesses: what they sell. */
  niches?: string[];
  /** What this account wants to find in Search (creators: brand types, businesses: creator types). */
  lookingFor?: string[];
  /** typical pay per video / reel in whole rupees */
  payPerVideoMin?: number;
  payPerVideoMax?: number;
  /** @deprecated replaced by perSaleMin / perSaleMax; kept so older saved profiles load */
  commissionPercent?: number;
  country?: string;
  /** state / province / region within the country (ISO 3166-2 name) */
  region?: string;
  city?: string;
  /** ISO 4217 code of the account's country; every amount this account enters is in it */
  currency?: string;
  /** on-device media ids (IndexedDB) for the profile photo and cover photo */
  avatarId?: string;
  coverId?: string;
  /** whole rupees per post / deliverable */
  priceFrom?: number;
  priceTo?: number;
  /** @deprecated single per-sale price from older saves; read as perSaleMin */
  perSale?: number;
  /** affiliate: price per confirmed sale, min to max, in the account currency */
  perSaleMin?: number;
  perSaleMax?: number;
  /** UGC: price per 1,000 views, min to max, in the account currency */
  perThousandMin?: number;
  perThousandMax?: number;
  /** creators: links to their social media API / insights feed, used to read monthly views */
  socialApi?: { instagram?: string; youtube?: string };
  /** monthly views read from the connected social accounts (only set by a real sync) */
  monthlyViews?: number;
  monthlyViewsAt?: string;
  /** businesses: the connected payment gateway, used to verify sales and badges.
   *  Only the provider and the key's last 4 characters are kept — never the key. */
  paymentGateway?: { provider: string; keyHint: string; connectedAt: string };
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

export type RevenueCategory = "sales" | "subscriptions" | "services" | "other";

export interface FinancialRecord {
  id: string;
  /** income = creator earnings; spending = business investment; revenue = business sales */
  kind: "income" | "spending" | "revenue";
  title: string;
  amount: number; // whole rupees
  category: IncomeCategory | SpendingCategory | RevenueCategory;
  date: string; // ISO yyyy-mm-dd
  counterparty?: string;
  /** ISO 4217 code the amount was entered in; rupees when missing */
  currency?: string;
  source: RecordSource;
  createdAt: string;
}

export type ProgramStatus = "draft" | "active" | "paused" | "closed";

export interface AffiliateProgram {
  id: string;
  name: string;
  brand: string;
  /** price paid per confirmed sale, min to max, in `currency` */
  perSaleMin?: number;
  perSaleMax?: number;
  currency?: string;
  /** @deprecated programs saved before per-sale pricing */
  commissionPercent?: number;
  description: string;
  terms: string;
  status: ProgramStatus;
  ownerHandle: string;
  createdAt: string;
  /** true for clearly-labelled sample programs shown in preview mode */
  sample?: boolean;
  /** optional on-device image for the program */
  imageId?: string;
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
  /** extra photos (up to 4 in total with image) */
  images?: string[];
  /** id of a video saved in this device's media store (IndexedDB) */
  videoId?: string;
  /** a built-in reaction GIF id, or an uploaded GIF in the media store ("media:<id>") */
  gif?: string;
  /** id of the post this one quotes */
  quoteOf?: string;
  createdAt: string;
  sample?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorHandle: string;
  authorName: string;
  body: string;
  gif?: string;
  /** id of the comment this replies to */
  parentId?: string;
  createdAt: string;
}

/** A deal proposal attached to a message (bulk DM, opportunity application). */
export interface DealOffer {
  /** an EARNING_MODELS id: decides which folder the message lands in */
  type: string;
  budgetMin?: number;
  budgetMax?: number;
  deliverables: { count: number; type: string }[];
  note: string;
  /** ISO 4217 code the budget is written in (the sender's currency); rupees when missing */
  currency?: string;
}

/** An opportunity a business posts for creators. */
export interface Opportunity {
  id: string;
  ownerHandle: string;
  title: string;
  type: string;
  niches: string[];
  budgetMin?: number;
  budgetMax?: number;
  deliverables: { count: number; type: string }[];
  details: string;
  createdAt: string;
  sample?: boolean;
  /** ISO 4217 code of the budget; rupees when missing */
  currency?: string;
  /** optional on-device cover photo */
  coverId?: string;
}

/** A conversation the user started themselves (e.g. "Message" from Search). */
export interface Thread {
  id: string;
  with: string;
  createdAt: string;
  /** deal type that started the thread, decides the folder */
  dealType?: string;
}

export interface Message {
  id: string;
  threadId: string;
  fromMe: boolean;
  body: string;
  gif?: string;
  deal?: DealOffer;
  /** optional on-device photo attached to the message */
  imageId?: string;
  createdAt: string;
}
