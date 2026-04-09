# 📖 Veloria Vault — Complete Documentation

> **Last Updated:** April 5, 2026  
> **Architecture:** Headless WooCommerce (REST API) + Next.js 16 on Vercel  
> **Domain:** [veloriavault.com](https://veloriavault.com)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project File Map](#2-project-file-map)
3. [How To: Manage Coupons](#3-how-to-manage-coupons)
4. [How To: Change the Lucky Draw Wheel](#4-how-to-change-the-lucky-draw-wheel)
5. [How To: Change Hot Sellers on Homepage](#5-how-to-change-hot-sellers-on-homepage)
6. [How To: Add/Edit Products](#6-how-to-addedit-products)
7. [How To: Manage Orders & Shipping](#7-how-to-manage-orders--shipping)
8. [How To: Deploy Changes](#8-how-to-deploy-changes)
9. [Infrastructure & Hosting](#9-infrastructure--hosting)
10. [Environment Variables](#10-environment-variables)
11. [SEO & Metadata](#11-seo--metadata)
12. [Payment (Razorpay)](#12-payment-razorpay)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Architecture Overview

```
┌──────────────────────────┐         REST API          ┌──────────────────────────┐
│   VERCEL (Frontend)      │ ◄────────────────────────► │  HOSTINGER (Backend)     │
│                          │    wp-json/wc/v3           │                          │
│   veloriavault.com       │                            │   veloriavault.com       │
│   Next.js 16 (React)     │                            │   WordPress 6.9.4        │
│   Node.js Serverless     │                            │   WooCommerce 10.6.1     │
│                          │                            │                          │
│   ✅ Frontend pages      │                            │   ✅ Products database   │
│   ✅ Cart/Checkout UI    │                            │   ✅ Orders              │
│   ✅ Coupon calculation  │                            │   ✅ Customer reviews    │
│   ✅ Razorpay payments   │                            │   ✅ Product images      │
│   ✅ Lucky Draw logic    │                            │   ✅ Shiprocket shipping │
└──────────────────────────┘                            └──────────────────────────┘
```

> [!IMPORTANT]
> **Never delete anything from the WordPress dashboard** (products, reviews, media, orders). The Next.js frontend depends on ALL of that data via the REST API. If it's deleted from WordPress, it disappears from the live site instantly.

---

## 2. Project File Map

### 📁 Quick Reference — "Where is what?"

| I want to...                        | File to edit                                      |
|-------------------------------------|---------------------------------------------------|
| Add/remove/edit coupons             | `src/config/coupons.ts`                           |
| Change the 35% max discount cap     | `src/lib/coupon-calculator.ts` (line ~10)          |
| Change base tier discounts (15/20%) | `src/lib/coupon-calculator.ts` (line ~40)          |
| Change prepaid discount (5%)        | `src/lib/coupon-calculator.ts` (line ~55)          |
| Change COD extra charge (₹149)      | `src/lib/coupon-calculator.ts` (line ~70)          |
| Change Lucky Draw probabilities     | `src/app/api/lucky-draw/spin/route.ts`            |
| Change Lucky Draw wheel UI          | `src/components/SpinWheel.tsx`                    |
| Change Hot Sellers on homepage      | `src/config/hot-sellers.ts`                       |
| Edit the header/navigation          | `src/components/PremiumHeader.tsx`                |
| Edit the footer                     | `src/components/PremiumFooter.tsx`                |
| Edit the homepage hero banner       | `src/components/PremiumHero.tsx`                  |
| Edit product detail page            | `src/components/ProductDetails.tsx`               |
| Edit cart drawer (side panel)       | `src/components/CartDrawer.tsx`                   |
| Edit checkout page layout           | `src/app/checkout/page.tsx`                       |
| Edit order summary (price breakdown)| `src/components/OrderSummary.tsx`                 |
| Change site title/description/SEO   | `src/app/layout.tsx`                              |
| Edit sitemap settings               | `src/app/sitemap.ts`                              |
| Edit robots.txt                     | `src/app/robots.ts`                               |
| Edit static pages (privacy, etc.)   | `src/app/(pages)/[page-name]/page.tsx`            |
| Change global CSS styles            | `src/app/globals.css`                             |
| Edit environment secrets            | `.env.local` (local) or Vercel Dashboard (prod)   |

### 📁 Full Directory Structure

```
src/
├── app/                        # Next.js pages and API routes
│   ├── (pages)/                # Static legal/policy pages
│   │   ├── cancellation-refund/
│   │   ├── privacy-policy/
│   │   ├── refund-returns/
│   │   ├── shipping-policy/
│   │   ├── terms-conditions/
│   │   └── warranty-policy/
│   ├── api/                    # Backend API routes (serverless)
│   │   ├── auth/               # Login, register, logout, session
│   │   ├── checkout/           # Order creation, payment update
│   │   ├── coupons/            # Coupon calculate + validate
│   │   ├── health/             # Health check endpoint
│   │   ├── instagram/          # Instagram feed API
│   │   ├── lucky-draw/         # Spin wheel (spin + status)
│   │   ├── newsletter/         # Email subscription
│   │   ├── orders/             # Order tracking
│   │   ├── razorpay/           # Payment create + verify
│   │   └── reviews/            # Product reviews
│   ├── cart/                   # Cart page
│   ├── checkout/               # Checkout page
│   ├── product/[slug]/         # Individual product pages
│   ├── shop/                   # Shop listing page
│   ├── layout.tsx              # Global layout (header, footer, fonts)
│   ├── globals.css             # Global styles
│   └── icon.svg                # Favicon (VV gold monogram)
│
├── components/                 # Reusable UI components
│   ├── PremiumHeader.tsx       # Main navigation bar
│   ├── PremiumFooter.tsx       # Site footer
│   ├── PremiumHero.tsx         # Homepage hero banner
│   ├── PremiumProductCard.tsx  # Product card on homepage
│   ├── ProductDetails.tsx      # Full product page
│   ├── ProductReviews.tsx      # Reviews section on product page
│   ├── CartDrawer.tsx          # Slide-out cart
│   ├── OrderSummary.tsx        # Price breakdown at checkout
│   ├── CouponSection.tsx       # Coupon input + applied coupons UI
│   ├── SpinWheel.tsx           # Lucky draw wheel UI
│   ├── RazorpayPayment.tsx     # Razorpay checkout button
│   ├── ShopPageClient.tsx      # Shop page filtering/sorting
│   └── MobileBottomNav.tsx     # Mobile bottom navigation bar
│
├── config/                     # ⭐ Business configuration (edit these!)
│   ├── coupons.ts              # All coupon codes and rules
│   └── hot-sellers.ts          # Homepage hot seller products
│
├── lib/                        # Core business logic
│   ├── coupon-calculator.ts    # Discount engine (35% cap, tiers, stacking)
│   ├── woocommerce.ts          # WooCommerce REST API client
│   ├── woocommerce-customer.ts # Customer account operations
│   ├── shiprocket.ts           # Shiprocket shipping integration
│   ├── rate-limit.ts           # Rate limiting for spin wheel
│   ├── auth/                   # JWT authentication helpers
│   └── site.ts                 # Legacy site URL config
│
├── store/                      # Frontend state management (Zustand)
│   ├── cart.ts                 # Shopping cart state
│   ├── cart-coupon.ts          # Coupon state + API calls
│   └── wishlist.ts             # Wishlist state
│
└── types/                      # TypeScript type definitions
    ├── coupon.ts               # Coupon + discount types
    └── customer.ts             # Customer account types
```

---

## 3. How To: Manage Coupons

### 📍 File: `src/config/coupons.ts`

This is the **only file** you need to touch for adding, removing, or editing coupon codes.

### Add a New Influencer Coupon

```typescript
// In src/config/coupons.ts — add inside the AVAILABLE_COUPONS array:

{
  id: "influencer-priya",       // Unique ID (any string)
  code: "PRIYA10",              // The code customers type (UPPERCASE)
  type: "percentage",           // "percentage" or "fixed_cart"
  category: "influencer",       // "influencer", "seasonal", or "standard"
  stackable: true,              // Can combine with other coupons?
  amount: 10,                   // 10% off
  description: "Priya's Exclusive - 10% Off",
  isActive: true,               // Set false to disable without deleting
  isAutomatic: false,           // Always false for manual coupons
  usageCount: 0,
},
```

### Add a Seasonal Coupon (with Expiry Date)

```typescript
{
  id: "seasonal-eid",
  code: "EID15",
  type: "percentage",
  category: "seasonal",
  stackable: true,
  amount: 15,
  description: "Eid Special - 15% Off",
  expiryDate: "2026-06-30",    // ⬅ Auto-expires after this date
  isActive: true,
  isAutomatic: false,
  usageCount: 0,
},
```

### Add a Flat ₹ Amount Coupon

```typescript
{
  id: "standard-save500",
  code: "SAVE500",
  type: "fixed_cart",           // ⬅ Flat rupee amount
  category: "standard",
  stackable: false,             // Non-stackable = clears other coupons
  amount: 500,                  // ₹500 off
  description: "₹500 Off on orders above ₹3000",
  minPurchase: 3000,            // ⬅ Minimum cart value required
  isActive: true,
  isAutomatic: false,
  usageCount: 0,
},
```

### Disable a Coupon (Without Deleting)

Just change `isActive: true` to `isActive: false`.

### Delete a Coupon

Remove the entire `{ ... },` block from the array.

> [!IMPORTANT]
> **After any coupon change:** Save the file → `git add . && git commit -m "update coupons" && git push` → Vercel auto-deploys in ~60 seconds.

### Understanding the Discount System

| Layer | How it works | Configurable? |
|-------|-------------|---------------|
| **Tier Discount** | 15% for 1 item, 20% for 2+ items | Yes — `coupon-calculator.ts` line ~40 |
| **Prepaid Bonus** | Extra 5% off for online payment | Yes — `coupon-calculator.ts` line ~55 |
| **COD Fee** | ₹149 added for Cash on Delivery | Yes — `coupon-calculator.ts` line ~70 |
| **Manual Coupons** | Whatever you add in `coupons.ts` | Yes — `config/coupons.ts` |
| **Lucky Draw** | 5-15% from spin wheel | Yes — `api/lucky-draw/spin/route.ts` |
| **35% Hard Cap** | All discounts combined never exceed 35% | Yes — `coupon-calculator.ts` line ~10 |

> [!CAUTION]
> The **35% cap is hidden from customers**. They see all their applied coupons with seemingly correct amounts, but the backend proportionally scales them down so the total never exceeds 35%. **Do not change** `MAX_DISCOUNT_PERCENT` unless you fully understand the revenue impact.

---

## 4. How To: Change the Lucky Draw Wheel

### Change Winning Probabilities

📍 **File:** `src/app/api/lucky-draw/spin/route.ts`

```typescript
// Current configuration:
const OPTIONS = [
  { discount: 5, weight: 50 },    // 50% chance
  { discount: 10, weight: 40 },   // 40% chance
  { discount: 15, weight: 10 },   // 10% chance (rare!)
];
```

**To make 15% more common:** Increase its weight. Weights are relative, so `{ discount: 15, weight: 30 }` would give ~30% chance.

### Change Wheel Visual Segments

📍 **File:** `src/components/SpinWheel.tsx`

```typescript
const SEGMENTS = [
  { discount: 5,  color: "#ff6b6b", label: "5% OFF" },
  { discount: 10, color: "#4ecdc4", label: "10% OFF" },
  { discount: 15, color: "#45b7d1", label: "15% OFF" },
  { discount: 5,  color: "#f9ca24", label: "5% OFF" },
  { discount: 10, color: "#6c5ce7", label: "10% OFF" },
  { discount: 5,  color: "#ff9f43", label: "5% OFF" },
];
```

> [!WARNING]
> The visual segments and the backend probabilities are **independent**. Always keep them in sync! If you add a 20% option to the backend, also add a 20% segment to the wheel UI.

---

## 5. How To: Change Hot Sellers on Homepage

📍 **File:** `src/config/hot-sellers.ts`

```typescript
export const HOT_SELLER_IDS: number[] = [
  3459,  // The Freya (Camel)
  3137,  // The Amara (Emerald)
  3692,  // The Vanya Sling (Black)
  3734,  // The Vivian (Camel)
];
```

**To change a hot seller:**
1. Go to your WordPress dashboard → Products.
2. Click on the product you want to feature.
3. Look for the **ID** in the URL or next to the title (e.g., `post=1234`).
4. Replace one of the numbers in `HOT_SELLER_IDS` with the new ID.
5. Save, commit, and push. Changes will appear on the site within 60 seconds.

> [!TIP]
> Keep exactly **4 IDs** in the list so the grid layout (2×2 on mobile, 4 on desktop) stays premium and structured.

**To change the section heading:**
```typescript
export const HOT_SELLER_HEADING = {
  label: "Hot Seller",
  title: "Structured designs that carry essentials and confidence.",
};
```

---

## 6. How To: Add/Edit Products

All products are managed through the **WordPress Admin Dashboard**:

👉 **URL:** `https://veloriavault.com/wp-admin`

1. Log in with your WordPress admin credentials.
2. Go to **Products → All Products**.
3. Edit any product: name, price, description, images, categories.
4. Click **Update** — changes appear on the live site within seconds (no deployment needed).

> [!NOTE]
> Product changes happen **instantly** because the frontend fetches data from the WordPress REST API in real-time. No code deployment needed.

---

## 7. How To: Manage Orders & Shipping

### Orders
- **WordPress Admin:** `veloriavault.com/wp-admin` → WooCommerce → Orders
- View order details, update status, issue refunds.

### Shipping (Shiprocket)
- **Shiprocket Dashboard:** Managed via the Shiprocket plugin in WordPress.
- **Config in code:** `src/lib/shiprocket.ts` — API credentials are in environment variables.

### Order Tracking
- Customers can track orders at `veloriavault.com/track-order`.
- The tracking API: `src/app/api/orders/track/route.ts`.

---

## 8. How To: Deploy Changes

### Automatic Deployment (Recommended)
Every time you push to the `main` branch on GitHub, Vercel automatically builds and deploys.

```bash
# From: d:\veloria_backup\New Veloria Vault\veloria-vault

git add .
git commit -m "describe your change"
git push origin main
```

Deployment takes ~60-90 seconds. Check status at: [vercel.com/dashboard](https://vercel.com)

### Manual Deployment
```bash
vercel --prod
```

### Git Remotes
| Remote | Repository | Purpose |
|--------|-----------|---------|
| `origin` | veloria-headless | Primary (auto-deploys to Vercel) |
| `vault` | veloria-vault | Backup |
| `v2` | veloria-headless-v2 | Archive |

---

## 9. Infrastructure & Hosting

### Frontend (Vercel)
- **Platform:** Vercel (Hobby plan)
- **Framework:** Next.js 16.1.6 with Turbopack
- **Domain:** `veloriavault.com` → A Record `76.76.21.21`
- **www:** CNAME → `cname.vercel-dns.com`
- **SSL:** Automatic via Vercel

### Backend (Hostinger)
- **Platform:** Hostinger Shared Hosting
- **Server IP:** `145.79.212.69`
- **Domain:** `veloriavault.com`
- **WordPress:** 6.9.4
- **WooCommerce:** 10.6.1
- **PHP:** 8.3.30

### SSH Access
```bash
ssh VELORIA
# or explicitly:
ssh -p 65002 -i ~/.ssh/id_ed25519_fast_v2 u679998479@145.79.212.69
```

**WordPress files:** `/home/u679998479/domains/veloriavault.com/public_html/`

### Active WordPress Plugins
| Plugin | Purpose |
|--------|---------|
| WooCommerce | Product/order management + REST API |
| Woo Razorpay | Payment gateway |
| JWT Auth for WP REST API | Secure API authentication |
| Shiprocket | Shipping labels + tracking |
| Customer Reviews WC | Product reviews |
| Checkout Fees for WC | COD surcharge handling |
| Advanced Dynamic Pricing | Price rules |
| Hostinger | Hosting management |

---

## 10. Environment Variables

### Local Development: `.env.local`

```env
WC_API_URL=https://veloriavault.com/wp-json/wc/v3
WC_CONSUMER_KEY=ck_xxxxx
WC_CONSUMER_SECRET=cs_xxxxx
JWT_SECRET=xxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
SHIPROCKET_EMAIL=api@veloriavault.com
SHIPROCKET_PASSWORD=xxxxx
NEWSLETTER_ADMIN_KEY=xxxxx
```

### Production (Vercel Dashboard)
Manage at: **Vercel → Project → Settings → Environment Variables**

> [!CAUTION]
> **Never commit `.env.local` to Git.** It contains live API keys and payment secrets.

---

## 11. SEO & Metadata

### Global Site SEO
📍 **File:** `src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: {
    default: "Veloria Vault | Luxury Leather Handbags",
    template: "%s | Veloria Vault",     // Product pages: "Product Name | Veloria Vault"
  },
  description: "Timeless leather goods for the modern minimalist...",
  metadataBase: new URL("https://veloriavault.com"),
};
```

### Sitemap
📍 **File:** `src/app/sitemap.ts` — Auto-generates XML sitemap from WooCommerce products.

### Robots.txt
📍 **File:** `src/app/robots.ts` — Controls what search engines can crawl.

---

## 12. Payment (Razorpay)

### Flow
1. Customer clicks "Pay Now" → `src/components/RazorpayPayment.tsx`
2. Frontend calls → `src/app/api/razorpay/create-order/route.ts` (creates Razorpay order)
3. Razorpay popup opens → customer completes payment
4. Frontend calls → `src/app/api/razorpay/verify/route.ts` (verifies signature)
5. Order is created in WooCommerce

### Razorpay Dashboard
Manage payments, refunds, settlements at: [dashboard.razorpay.com](https://dashboard.razorpay.com)

---

## 13. Troubleshooting

### Products not loading?
1. Check if WordPress is up: `curl https://veloriavault.com/wp-json/wc/v3`
2. Check Vercel logs: `vercel logs`
3. Verify `WC_API_URL` is correct in Vercel environment variables.

### Coupons not working?
1. Verify the coupon is in `src/config/coupons.ts` with `isActive: true`.
2. Check if `expiryDate` hasn't passed.
3. Check browser console for API errors.
4. Redeploy: `git push origin main`.

### Site shows "Not Secure" warning?
- SSL usually takes 5-10 minutes to provision after DNS changes.
- Check Vercel dashboard → Domains → SSL status.
- Ensure both A record (76.76.21.21) and CNAME (cname.vercel-dns.com) are set.

### WordPress admin not accessible?
- URL: `https://veloriavault.com/wp-admin`
- SSH: `ssh VELORIA` then check `~/domains/veloriavault.com/public_html/`

### Lucky Draw not spinning?
- Users can only spin once per 30 days (IP + cookie tracked).
- Clear the `veloria_lucky_draw` cookie to test again.
- Check `src/app/api/lucky-draw/spin/route.ts` for rate limit settings.

### Need to restore WordPress?
- Database backups are at: `/home/u679998479/domains/veloriavault.com/db_backup*.sql`
- Full site backup: `/home/u679998479/domains/veloriavault.com/public_html_backup_.zip`

---

> [!TIP]
> **Golden Rule:** If you're changing **content** (products, images, reviews, orders) → use WordPress admin.  
> If you're changing **how the site looks or behaves** (coupons, UI, checkout logic) → edit the code files and push to Git.
