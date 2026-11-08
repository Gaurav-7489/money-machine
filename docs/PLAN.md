# Money Machine — Greenfield Technical Plan

**Client:** Jannat Shaikh · **Development partner:** VandLabs Studio
**Repository:** `Gaurav-7489/money-machine` (greenfield; nothing copied from any earlier implementation)

## 0. Repository status and what this branch delivers

When work started, the repository held only `README.md`. This branch adds:

| Area | Status |
| --- | --- |
| Next.js App Router + TypeScript + Tailwind v4 foundation | ✅ Done |
| Design tokens from the approved design system | ✅ Done |
| Responsive app shell: desktop sidebar, tablet rail, mobile top bar + bottom nav | ✅ Done |
| Screens: Welcome, Choose Role, Home feed, Explore, Create, Inbox and thread, Profile, Affiliates (creator and business), Create Program, Money, Badges, Notifications, Offline | ✅ UI done, preview data layer |
| PWA: manifest, icons (any + maskable + Apple), service worker, offline page, install guidance (iOS/Android/desktop) | ✅ Done |
| Badge rules engine + money summaries (unit tested) | ✅ Done |
| Zod validation for every form | ✅ Done |
| Proposed PostgreSQL schema (`src/db/schema.ts`, Drizzle) | ✅ Written, **not connected** |
| Authentication, server-side authorization, database persistence | ⏳ Stage 2 (needs a provider decision and credentials) |

**About the preview data layer.** No database or auth credentials exist yet, so the
current build keeps user-entered data in the browser's `localStorage` (`src/lib/store.tsx`).
The UI says this wherever it applies ("saved on this device"). Sample profiles, posts,
programs and threads are fictional, carry a visible **Sample** tag, and never include
financial figures. Money and badges come only from records the user enters, and every
such record is marked **self-reported**.

---

## 1. Application architecture

```
src/
  app/                    Next.js App Router (routes only, thin)
    (app)/…               authenticated area: shared AppShell layout
    onboarding/, offline/, manifest.ts
  components/             presentational, accessible UI (no data access)
  lib/
    validation.ts         Zod schemas: shared by client forms and (later) server actions
    badges.ts, money.ts   pure business rules: framework-free, unit tested
    store.tsx             preview persistence (to be replaced by server data)
  db/schema.ts            Drizzle schema (PostgreSQL)
  server/ (Stage 2)       server-only: db client, auth, repositories, actions
```

* **One deployable.** A Next.js monolith on Vercel, using Server Components and Server
  Actions. No microservices.
* **Layering.** Route → server action → service (business rules + authorization) →
  repository (Drizzle). Components never import `server/`, which is enforced with
  `import "server-only"`.
* **Recommended managed services** (to confirm with the client, considering cost and region):
  * Database: **Neon Postgres** (serverless, branching for previews, Mumbai region available).
  * Auth: **Auth.js v5** with email magic link and Google, using a Drizzle adapter and
    database sessions. This keeps users in our own Postgres, avoids vendor lock-in, and
    makes role-based authorization straightforward.
  * Media: **Vercel Blob** or Cloudflare R2 for post images and video, with signed uploads.
  * Email: Resend, for magic links and notifications.

## 2. Responsive page map

| Route | Mobile (<768) | Tablet (768–1023) | Desktop (≥1024) |
| --- | --- | --- | --- |
| `/` Welcome | Full-screen hero, CTA at the bottom | Same, centred | Two columns: value props and hero |
| `/onboarding` Choose role | Full-screen form | Centred card | Centred card |
| `/home` | Stories row, tabs, single-column feed | Rail, feed, quick cards (Money / Affiliates / Badges / Create) | Sidebar, feed, *Your Growth* and *Active Programs* |
| `/explore` | Search, filter chips, 2-column cards | 3-column | 3-column, max width 3xl |
| `/create` | Post composer | Composer | Composer and "other things to create" |
| `/inbox`, `/inbox/[id]` | List, then thread | Same | Same (split view planned) |
| `/profile` | Header, tools grid, posts grid, settings sheet | Same | Same |
| `/affiliates` | Creator: My Programs / Discover, commission records. Business: My Programs / Applications | Same | Same |
| `/affiliates/new` | Business only | | |
| `/money` | Role-locked: Income (creator) **or** Spending (business) | | |
| `/badges`, `/notifications`, `/offline` | | | |

Primary navigation: Home · Explore · Create · Inbox · Profile. Money, Affiliates and Badges
are secondary. They are reached from Profile, the home side panels, and the desktop
sidebar "tools" group, matching the approved mockup. Stage 3 adds `/opportunities`,
`/opportunities/[id]`, `/collabs/[id]`, `/u/[handle]` and `/settings`.

## 3. Database schema

See `src/db/schema.ts` for the full definition. Key decisions:

* **Money is stored as `bigint` paise.** No floats anywhere.
* `financial_records.source` is either `self_reported` or `verified`. A CHECK constraint
  requires a `verified` row to reference a conversion or collaboration that proves it.
* `affiliate_conversions` has a unique `(membership_id, external_order_id)`, which makes
  imports idempotent.
* `affiliate_applications` uses a partial unique index, so a creator can have only one
  open application per program.
* Clicks store a salted visitor hash, never raw IPs.
* Every table that holds user content has the owner's user ID, so authorization filters
  stay simple.

Entities: users, profiles (niches, content styles, pricing/availability preferences),
follows, posts, post_media, post_likes, comments, conversations, conversation_members,
messages, opportunities, collaborations, deliverables, affiliate_programs,
affiliate_applications, affiliate_invitations, affiliate_memberships, affiliate_clicks,
affiliate_conversions, financial_records, user_badges, notifications.

## 4. Authentication and authorization

* **Authentication:** Auth.js with a magic link (email) and Google OAuth. Sessions are
  stored in the database in httpOnly, Secure, SameSite=Lax cookies. Role is chosen once at
  onboarding and stored on `users.role`. Changing it requires support, because it changes
  which data you own.
* **Authorization:** checked on the server in every action and loader. The client is never
  trusted.
  * `requireUser()` and `requireRole("business")` guards live in `server/auth.ts`.
  * Repository functions always take `actorId` and scope queries by it (for example,
    `WHERE owner_id = $actor`).
  * Policy matrix:
    * Financial records: owner only (read and write).
    * Program: the owning business can write. Anyone can read active programs.
    * Applications: the creator can create and withdraw. The program owner can approve
      or reject.
    * Conversions: the program owner can create. The member creator can read their own.
    * Messages: conversation members only.
  * Optional defence in depth: Postgres row-level security keyed on
    `current_setting('app.user_id')`.
* **Hardening:** rate limiting on auth and message endpoints, CSRF protection (built into
  Server Actions), Zod validation on every input, security headers (already in
  `next.config.ts`), and no secrets in the client bundle.

## 5. Affiliate tracking approach

1. A business creates a program (commission %, terms, cookie window, landing URL).
2. A creator applies, or the business invites them. On approval, an
   `affiliate_membership` row is created with a random `tracking_code`.
3. The creator shares `https://moneymachine.app/r/{tracking_code}`. That route logs an
   `affiliate_click` and redirects to the landing URL with `?mm_ref={code}`. The brand's
   site keeps the code for the cookie window.
4. **Conversions are reported by the business only**, through one of:
   * manual entry in the program dashboard,
   * CSV import (order ID, value, date, code), or
   * a signed server-to-server postback (HMAC with a per-program secret).

   The platform never invents or estimates conversions. The commission is computed on the
   server as `order_value × commission%` and frozen on the row.
5. Status flow: `pending → approved → paid`, or `reversed` for refunds. When a conversion
   is marked `paid`, the system writes **verified** financial records: income for the
   creator and spending for the business.
6. Creators see clicks and conversions per program. Empty states say plainly that nothing
   is shown until the brand reports it.

## 6. Financial records model

* One table, `financial_records`, with `kind` set to income or spending. The UI restricts
  each account to its own kind: creators record income, businesses record spending.
* **Self-reported** records are created by the user and can be edited or deleted (soft
  delete).
* **Verified** records are created by the system from a paid conversion or an approved
  collaboration payment. They are read-only for the user, labelled with a check mark, and
  totalled separately.
* Summaries (total, this month, month-over-month change, 6-month trend) are computed on
  the server with SQL aggregates. The same logic exists in `lib/money.ts` and is tested.
* Records are private. No other user, including the counterparty, can read them. Exports
  (CSV) come later.
* No payment processing is built or implied. If payouts are added later, they will go
  through a regulated provider (for example, Razorpay Route) after legal review.

## 7. Badge award rules

Implemented in `src/lib/badges.ts` and unit tested.

| Role | Badge | Rule |
| --- | --- | --- |
| Creator | First Earnings | ≥ 1 income record |
| Creator | Collab Pro | ≥ 5 brand-deal or campaign income records |
| Creator | Affiliate Ace | Approved into ≥ 3 affiliate programs |
| Creator | Money Tracker | ≥ 10 income records |
| Creator | Growth Star | Income this month > last month (last month > 0) |
| Creator | Top Creator | ≥ ₹1,00,000 **verified** income *(locked until verification exists)* |
| Business | Program Launcher | ≥ 1 active program |
| Business | Affiliate Builder | ≥ 3 approved creators across their programs |
| Business | Budget Tracker | ≥ 10 spending records |
| Business | Creator Backer | ≥ 5 creator-payment spending records |
| Business | Trusted Brand | 10 **verified** collaborations *(locked until verification exists)* |

On the server, rules are re-evaluated after the relevant writes. Awards are inserted into
`user_badges` (idempotent primary key) and send a notification. Sample content never
counts toward a badge.

## 8. PWA implementation strategy

* `app/manifest.ts`: standalone display, start URL `/home`, theme `#0E7A5C`, 192/512
  icons plus a maskable 512 icon, and shortcuts (Create, Inbox, Money).
* Apple support: `apple-touch-icon`, `appleWebApp` metadata, `viewport-fit=cover`, and
  safe-area padding on the top bar and bottom nav.
* `public/sw.js`, a hand-written service worker kept small on purpose:
  * pages are network-first, with `/offline` as the fallback;
  * `/_next/static` and icons are cache-first;
  * API calls and user data are never cached.
* Install UX (`components/install-prompt.tsx`):
  * Android and desktop Chromium: captures `beforeinstallprompt` and shows an
    **Install** button.
  * iOS Safari: step-by-step Share → Add to Home Screen instructions.
  * Hidden once the app is installed (`display-mode: standalone`).
  * Dismissible banner on phones and tablets, plus a permanent entry under
    Profile → Settings.
* Stage 5 adds Web Push (VAPID) where supported, including iOS 16.4+ for installed apps.

## 9. Testing and deployment plan

* **Unit tests (Vitest):** business rules (badges, money). Stage 2 adds services and
  authorization policies, tested against a Neon branch or a local Postgres.
* **End-to-end (Playwright):** projects for mobile (Pixel 7), tablet (900×1180) and desktop
  (1440×900). Current smoke suite covers onboarding validation, income → badge, business
  program publishing, auth redirect, and manifest shape. Later: cross-account
  authorization tests (creator A cannot read creator B's records, a creator cannot approve
  applications).
* **Quality gates:** `npm run typecheck`, `npm test`, `npm run build`,
  `npm run test:e2e`. A GitHub Actions workflow to run these is proposed but not committed
  yet.
* **Accessibility:** semantic landmarks, labelled icon buttons, `aria-current` and
  `aria-pressed`, visible focus rings, reduced-motion support. Add axe-core checks to the
  e2e suite.
* **Deployment:** Vercel with preview deployments per branch and a Neon branch per
  preview. Production only after explicit client approval. Environment variables are
  listed in `.env.example`, and no values are committed.

## 10. Development milestones

| # | Milestone | Scope | Exit criteria |
| --- | --- | --- | --- |
| M1 ✅ | Foundation and UI | Everything in §0 | Builds, unit and e2e tests green on 3 viewports |
| M2 | Accounts | Neon + Drizzle migrations, Auth.js, onboarding writes `users`/`profiles`, server guards | Sign in and out works; protected routes are enforced on the server |
| M3 | Social core | Posts with media upload, likes, comments, follows, Explore search (Postgres full-text search), public profiles `/u/[handle]` | Data persists across devices; sample content removed from production |
| M4 | Messaging | Conversations, unread counts, polling (realtime later) | Two accounts can message each other |
| M5 | Affiliate programs | Programs, applications, invitations, memberships, `/r/[code]` click tracking, manual and CSV conversions | End-to-end flow with real rows; authorization tests pass |
| M6 | Money and badges on the server | `financial_records`, verified records from paid conversions, server-side badge awards, notifications | Self-reported and verified totals reconcile |
| M7 | Marketplace | Opportunities (brand deal, UGC, PR), offers, agreements, deliverables, statuses | Full collab lifecycle |
| M8 | Mobile polish | Web Push, loading skeletons, pull-to-refresh, image optimisation | Lighthouse PWA and performance ≥ 90 on mobile |
| M9 | Production readiness | Security review, axe audit, rate limits, monitoring, backups, privacy policy and terms | Client sign-off, then production deploy |

### Open questions for the client

1. Confirm managed providers (Neon, Auth.js, Vercel Blob, Resend) and the budget.
2. Commission payouts: tracked only (current plan), or processed through a provider later?
3. Rules for "enhanced visibility" and "bulk outreach" messaging (limits, pricing,
   anti-spam).
4. Subscription tiers: none are shown or hardcoded until business rules are confirmed.
