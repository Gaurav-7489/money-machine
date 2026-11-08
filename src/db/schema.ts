/**
 * Proposed PostgreSQL schema (Drizzle ORM). Not yet connected — the preview
 * build stores data in the browser. See docs/PLAN.md §3 for rationale.
 *
 * Conventions: uuid primary keys, timestamptz, money stored as integer paise
 * (bigint) to avoid floating-point errors, soft enums via pgEnum.
 */
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const roleEnum = pgEnum("role", ["creator", "business", "admin"]);
export const programStatusEnum = pgEnum("program_status", ["draft", "active", "paused", "closed"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected", "withdrawn"]);
export const invitationStatusEnum = pgEnum("invitation_status", ["sent", "accepted", "declined", "expired"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "suspended", "ended"]);
export const conversionStatusEnum = pgEnum("conversion_status", ["pending", "approved", "reversed", "paid"]);
export const recordKindEnum = pgEnum("record_kind", ["income", "spending"]);
export const recordSourceEnum = pgEnum("record_source", ["self_reported", "verified"]);
export const opportunityTypeEnum = pgEnum("opportunity_type", ["brand_deal", "ugc", "pr", "affiliate"]);
export const opportunityStatusEnum = pgEnum("opportunity_status", ["draft", "open", "closed"]);
export const collabStatusEnum = pgEnum("collab_status", ["offered", "accepted", "in_progress", "delivered", "approved", "cancelled", "disputed"]);

// ── Identity ────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: id(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  role: roleEnum("role").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    handle: varchar("handle", { length: 30 }).notNull(),
    displayName: varchar("display_name", { length: 50 }).notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    niches: text("niches").array().notNull().default(sql`'{}'::text[]`),
    contentStyles: text("content_styles").array().notNull().default(sql`'{}'::text[]`),
    /** creator pricing & availability preferences, e.g. { reelFrom: 500000, availableFrom: "2026-12-01" } */
    preferences: jsonb("preferences").notNull().default({}),
    isVerified: boolean("is_verified").notNull().default(false),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("profiles_handle_lower_idx").on(sql`lower(${t.handle})`)],
);

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    followeeId: uuid("followee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followeeId] }), check("no_self_follow", sql`${t.followerId} <> ${t.followeeId}`)],
);

// ── Social ──────────────────────────────────────────────────────────────────
export const posts = pgTable(
  "posts",
  {
    id: id(),
    authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    caption: text("caption").notNull(),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    createdAt: createdAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("posts_author_created_idx").on(t.authorId, t.createdAt)],
);

export const postMedia = pgTable("post_media", {
  id: id(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  kind: varchar("kind", { length: 10 }).notNull(), // image | video
  position: integer("position").notNull().default(0),
});

export const postLikes = pgTable(
  "post_likes",
  {
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

export const comments = pgTable("comments", {
  id: id(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: createdAt(),
});

// ── Messaging ───────────────────────────────────────────────────────────────
export const conversations = pgTable("conversations", { id: id(), createdAt: createdAt() });

export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.conversationId, t.userId] })],
);

export const messages = pgTable(
  "messages",
  {
    id: id(),
    conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull().references(() => users.id),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conversation_created_idx").on(t.conversationId, t.createdAt)],
);

// ── Collaboration marketplace (Stage 3) ─────────────────────────────────────
export const opportunities = pgTable("opportunities", {
  id: id(),
  businessId: uuid("business_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: opportunityTypeEnum("type").notNull(),
  title: varchar("title", { length: 120 }).notNull(),
  brief: text("brief").notNull(),
  budgetMinPaise: bigint("budget_min_paise", { mode: "number" }),
  budgetMaxPaise: bigint("budget_max_paise", { mode: "number" }),
  niches: text("niches").array().notNull().default(sql`'{}'::text[]`),
  status: opportunityStatusEnum("status").notNull().default("draft"),
  closesAt: timestamp("closes_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const collaborations = pgTable("collaborations", {
  id: id(),
  opportunityId: uuid("opportunity_id").references(() => opportunities.id),
  businessId: uuid("business_id").notNull().references(() => users.id),
  creatorId: uuid("creator_id").notNull().references(() => users.id),
  agreedFeePaise: bigint("agreed_fee_paise", { mode: "number" }),
  terms: text("terms"),
  status: collabStatusEnum("status").notNull().default("offered"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const deliverables = pgTable("deliverables", {
  id: id(),
  collaborationId: uuid("collaboration_id").notNull().references(() => collaborations.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  submittedUrl: text("submitted_url"),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

// ── Affiliate programs (Mandatory A) ────────────────────────────────────────
export const affiliatePrograms = pgTable(
  "affiliate_programs",
  {
    id: id(),
    businessId: uuid("business_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 60 }).notNull(),
    description: text("description").notNull(),
    terms: text("terms").notNull(),
    commissionPercent: numeric("commission_percent", { precision: 5, scale: 2 }).notNull(),
    cookieWindowDays: integer("cookie_window_days").notNull().default(30),
    landingUrl: text("landing_url"),
    status: programStatusEnum("status").notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [check("commission_range", sql`${t.commissionPercent} > 0 AND ${t.commissionPercent} <= 90`)],
);

export const affiliateApplications = pgTable(
  "affiliate_applications",
  {
    id: id(),
    programId: uuid("program_id").notNull().references(() => affiliatePrograms.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    status: applicationStatusEnum("status").notNull().default("pending"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("one_open_application").on(t.programId, t.creatorId).where(sql`${t.status} in ('pending','approved')`)],
);

export const affiliateInvitations = pgTable("affiliate_invitations", {
  id: id(),
  programId: uuid("program_id").notNull().references(() => affiliatePrograms.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: invitationStatusEnum("status").notNull().default("sent"),
  createdAt: createdAt(),
});

/** An approved creator in a program. Holds the unique tracking code. */
export const affiliateMemberships = pgTable(
  "affiliate_memberships",
  {
    id: id(),
    programId: uuid("program_id").notNull().references(() => affiliatePrograms.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    trackingCode: varchar("tracking_code", { length: 16 }).notNull().unique(),
    status: membershipStatusEnum("status").notNull().default("active"),
    joinedAt: createdAt(),
  },
  (t) => [uniqueIndex("membership_unique").on(t.programId, t.creatorId)],
);

export const affiliateClicks = pgTable(
  "affiliate_clicks",
  {
    id: id(),
    membershipId: uuid("membership_id").notNull().references(() => affiliateMemberships.id, { onDelete: "cascade" }),
    clickedAt: createdAt(),
    /** salted hash only — never raw IP */
    visitorHash: varchar("visitor_hash", { length: 64 }),
    referrer: text("referrer"),
  },
  (t) => [index("clicks_membership_time_idx").on(t.membershipId, t.clickedAt)],
);

/** Conversions are ONLY created by the business (manual entry, CSV import, or
 *  signed server-to-server postback). Never inferred by the platform. */
export const affiliateConversions = pgTable(
  "affiliate_conversions",
  {
    id: id(),
    membershipId: uuid("membership_id").notNull().references(() => affiliateMemberships.id),
    externalOrderId: varchar("external_order_id", { length: 100 }).notNull(),
    orderValuePaise: bigint("order_value_paise", { mode: "number" }).notNull(),
    commissionPaise: bigint("commission_paise", { mode: "number" }).notNull(),
    status: conversionStatusEnum("status").notNull().default("pending"),
    reportedBy: uuid("reported_by").notNull().references(() => users.id),
    reportedVia: varchar("reported_via", { length: 20 }).notNull(), // manual | csv | postback
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("conversion_order_unique").on(t.membershipId, t.externalOrderId)],
);

// ── Money (Mandatory B) ─────────────────────────────────────────────────────
export const financialRecords = pgTable(
  "financial_records",
  {
    id: id(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: recordKindEnum("kind").notNull(),
    source: recordSourceEnum("source").notNull().default("self_reported"),
    title: varchar("title", { length: 80 }).notNull(),
    category: varchar("category", { length: 30 }).notNull(),
    amountPaise: bigint("amount_paise", { mode: "number" }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    occurredOn: date("occurred_on").notNull(),
    counterparty: varchar("counterparty", { length: 60 }),
    /** set when source = verified: the system record that proves it */
    conversionId: uuid("conversion_id").references(() => affiliateConversions.id),
    collaborationId: uuid("collaboration_id").references(() => collaborations.id),
    createdAt: createdAt(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("records_owner_date_idx").on(t.ownerId, t.occurredOn),
    check("amount_positive", sql`${t.amountPaise} > 0`),
    check("verified_has_proof", sql`${t.source} = 'self_reported' OR ${t.conversionId} IS NOT NULL OR ${t.collaborationId} IS NOT NULL`),
  ],
);

export const userBadges = pgTable(
  "user_badges",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    badgeId: varchar("badge_id", { length: 40 }).notNull(),
    awardedAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })],
);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 40 }).notNull(),
    payload: jsonb("payload").notNull().default({}),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("notifications_user_idx").on(t.userId, t.createdAt)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  posts: many(posts),
  records: many(financialRecords),
}));
