# Payment Reconciliation Dashboard

A dashboard for reconciling Bank of Georgia transactions against client service contracts. Built as a take-home assignment for GeoSafety.

The core problem: a company has clients on monthly contracts, and incoming bank transactions need to be matched against those contracts so finance can see who paid, who didn't, and who paid the wrong amount.

## Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + REST API, no auth needed for this project)
- TanStack Query for all data fetching and mutations
- Tailwind CSS v4
- Zod for validating filter/search state

## Running it locally

### 1. Install

```bash
git clone <repo-url>
cd frontend
npm install
```

### 2. Set up Supabase

Create a free project at [supabase.com](https://supabase.com). Go to Settings → API and grab your Project URL and the publishable/anon key.

Note: newer Supabase projects use `sb_publishable_...` / `sb_secret_...` keys instead of the older `anon` / `service_role` JWTs. Either naming works fine here, just use whatever your project's API page shows you.

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 4. Run

```bash
npm run dev
```

Visit `localhost:3000`, click "Run matching" to execute the auto-matching logic against the seeded data.

## Where the matching logic lives, and why

The auto-matching (`lib/actions/run-matching.ts`) runs as a Next.js Server Action, triggered by a button on the dashboard.

I went back and forth between three options: client-side, a Supabase RPC function, or a server action. Landed on the server action for a few reasons.

Client-side was out mostly because it would mean giving the public anon key write access to `bank_transactions` for anyone loading the page, which felt like a wider permission surface than this needed, even without real auth in place yet.

A Postgres RPC function was tempting, and is probably the better answer at real scale, since it avoids pulling every transaction into application memory before processing. But the matching rule itself is genuinely simple — compare `sender_inn` to `company.tax_id` — and writing that in plpgsql instead of TypeScript would have made it harder to read, harder to test, and harder to extend later if I wanted to add the fuzzy-name-suggestion bonus feature. For roughly 90 rows, the performance tradeoff doesn't matter enough to justify that cost.

So: server action it is. Here's roughly how it works.

1. Pull every transaction currently marked `unmatched`, plus every company, in parallel.
2. Build a lookup map of tax_id to company so each transaction can be matched in constant time instead of scanning the company list every time.
3. For each unmatched transaction, normalize and trim the sender's tax ID, then look it up. Sender name is never part of the comparison — only the tax ID — which is what makes "გეოტრანსი (ფილიალი)" correctly match "შპს გეოტრანსი" despite the different display name on the transaction.
4. Group matches by company and update them in one bulk query per company, instead of one query per transaction.
5. The whole thing is idempotent. It only ever touches rows still marked `unmatched`, so running it again after a partial match doesn't reprocess anything or create duplicates.

Verified against the seed data: 77 of 89 transactions match on the first run, the remaining 12 are from senders whose tax ID doesn't correspond to any seeded company, and running it a second time correctly reports zero newly matched transactions.

## The expected-vs-actual calculation

This was the part of the assignment that took the most care to get right, mostly because of how contract status interacts with the selected month.

A contract's `status` field reflects its state today, not its state during whatever month you're looking at. Safe Transport's contract is paused as of May 15, 2026 — but if you're looking at April, it was fully active, and if you're looking at June, it's been paused for weeks even though they kept sending payments anyway. The logic in `lib/utils/months.ts` (`contractOverlapsMonth`) checks whether a contract's date range overlapped the selected month at all, rather than checking its current status, which is what makes June correctly show zero expected for Safe Transport despite three separate June payments showing up as actual.

The same logic handles Rustavi Trans's second contract (paused April 1) and Urban Movers (ended April 30) correctly without any special-casing — it's the same date-overlap check applied uniformly.

## A note on the Suspense boundary

`app/page.tsx` is intentionally a thin wrapper around `app/dashboard-content.tsx`, with the real content wrapped in a `Suspense` boundary. This isn't stylistic — `useDashboardFilters` reads the URL's search params via `useSearchParams()`, which Next.js requires to be inside a Suspense boundary for static prerendering to work. It's easy to miss because `next dev` doesn't enforce it, only `next build` does, so it'll work fine locally and then fail the production build with no warning until you actually try to ship it.

## Project structure

```
app/
  page.tsx                Thin wrapper, Suspense boundary
  dashboard-content.tsx   Actual page logic and composition
components/               Stats bar, transactions table, month selector, expected-vs-actual
lib/
  actions/                Server Actions (matching logic)
  hooks/                  TanStack Query hooks
  services/               Supabase data-access functions, no React
  schemas/                Zod schemas for filter and search state
  utils/                  Pure helper functions: month math, contract overlap, expected-vs-actual computation
  supabase/               Browser and server Supabase client factories
  providers/              TanStack Query provider
types/database.ts         Hand-written types matching the Supabase schema
```

## What's not in here

A few things from the assignment's bonus list didn't make it in, given the timeline: search by company name or tax ID, manual match/ignore actions on individual rows, and a fuzzy-name suggestion for unmatched transactions. The core requirements — matching, the dashboard, month navigation, expected-vs-actual, validation, and proper TanStack Query usage with cache invalidation — are all in and working.

## Deployment

Live at: `####`

Set the same two environment variables in the Vercel project settings before deploying — they're read at build time, not just runtime, since they're client-exposed values.