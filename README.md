# Veloria Vault Frontend

Headless WooCommerce storefront built with Next.js App Router.

## What this project does

- Renders the Veloria Vault storefront on top of WooCommerce REST APIs
- Supports catalog, category, product detail, cart, wishlist, checkout, account, and static content pages
- Handles product variations, variation image galleries, coupons, and Razorpay checkout

## Quick start

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Required environment variables

Create `.env.local` with the values below:

```env
WC_API_URL=
WC_CONSUMER_KEY=
WC_CONSUMER_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_LEGACY_SITE_URL=
JWT_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_KEY_ID=
```

## Project structure

- `src/app`
  Next.js routes, layouts, API handlers, and page-level data loading.
- `src/components`
  Reusable UI blocks like header, product cards, PDP, cart drawer, and checkout pieces.
- `src/lib`
  WooCommerce fetching, auth helpers, site utilities, and shared business logic.
- `src/store`
  Zustand stores for cart, wishlist, coupons, and UI state.
- `src/config`
  Small editable app configuration such as curated showcase lists.
- `docs`
  Working notes, audit reports, codebase guide, and archived reference files.
- `scripts`
  One-off helper scripts that are not part of the runtime app.

## Useful commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Docs for teammates

- `docs/CODEBASE_GUIDE.md`
  Simple map of the codebase for onboarding.
- `docs/RELEASE_AUDIT_2026-03-30.md`
  Latest audit and cleanup summary for GitHub update notes.

## Notes

- Product pages use WooCommerce parent + variation data, with legacy Woodmart variation galleries merged in when needed.
- Cart and wishlist now store canonical product links so variation-based products do not break into 404 routes.
- Pages that do not need per-request rendering use revalidation for better speed.
