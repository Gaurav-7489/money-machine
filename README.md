# Money Machine

**Collaborate. Create. Earn.** A social-first platform where creators and businesses
connect for collabs, affiliate programs and paid promotions.

Built by VandLabs Studio for Jannat Shaikh. Read [`docs/PLAN.md`](docs/PLAN.md) for the
architecture, schema, auth model, affiliate tracking, badge rules, PWA strategy and
milestones.

> **Preview build.** Sign-in and the database aren't connected yet. Anything you enter
> (profile, posts, income and spending records, affiliate programs) is stored only in
> your browser. Sample profiles and posts are fictional and carry a **Sample** tag.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · lucide-react · Zod ·
Drizzle ORM schema for PostgreSQL · Vitest · Playwright

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright smoke tests: mobile, tablet, desktop (needs `npm run build` first) |
| `npm run icons` | Regenerate PWA PNG icons from `public/icons/icon.svg` |

## Structure

```
src/app         routes (App Router); (app)/ is the signed-in area with the responsive shell
src/components  UI components: shell, navigation, cards, sheets, install prompt
src/lib         validation (Zod), business rules (badges, money), preview store
src/db          proposed PostgreSQL schema (Drizzle). Not connected yet
public/         service worker, PWA icons
e2e/            Playwright tests
docs/PLAN.md    technical plan
```

## Add to Home Screen

Money Machine is an installable PWA. On Android and desktop Chrome, use the **Install**
prompt. On iPhone, open the site in Safari and tap **Share → Add to Home Screen**.
Instructions are also under Profile → Settings.
