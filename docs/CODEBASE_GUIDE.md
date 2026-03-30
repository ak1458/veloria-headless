# Codebase Guide

This file is the quickest way for a new developer to understand where to work.

## Mental model

- `src/app`
  Route entry points. If you need to change page-level data loading, metadata, or API routes, start here.
- `src/components`
  UI pieces. If the change is visual, interactive, or layout-related, it usually lives here.
- `src/lib`
  Shared business logic. WooCommerce integration starts in `src/lib/woocommerce.ts`.
- `src/store`
  Client-side state. Cart, wishlist, and coupon logic live here.

## Most important flows

## 1. Product listing

- Shop page entry: `src/app/shop/page.tsx`
- Category page entry: `src/app/product-category/[slug]/page.tsx`
- Grid/card rendering: `src/components/ShopPageClient.tsx`
- Card UI: `src/components/PremiumProductCard.tsx`, `src/components/ProductCard.tsx`, `src/components/HomeProductCard.tsx`

## 2. Product details page

- Route entry: `src/app/product/[slug]/page.tsx`
- Main UI: `src/components/ProductDetails.tsx`
- Woo product lookup and variation gallery merge: `src/lib/woocommerce.ts`

## 3. Cart and wishlist

- Cart state: `src/store/cart.ts`
- Wishlist state: `src/store/wishlist.ts`
- Drawer UI: `src/components/CartDrawer.tsx`
- Full pages: `src/app/cart/page.tsx`, `src/app/wishlist/page.tsx`

## 4. Checkout and payments

- Checkout page: `src/app/checkout/page.tsx`
- Order summary: `src/components/OrderSummary.tsx`
- Razorpay client: `src/components/RazorpayPayment.tsx`
- Checkout API: `src/app/api/checkout/route.ts`
- Razorpay APIs: `src/app/api/razorpay/*`

## 5. Account and after-purchase flows

- Account dashboard: `src/app/account/page.tsx`
- Return request page: `src/app/account/return/[orderId]/page.tsx`

## Where to edit common requests

- Header or navigation: `src/components/PremiumHeader.tsx`
- Footer: `src/components/PremiumFooter.tsx`
- Home page sections: `src/components/LegacyHomePage.tsx`
- Product image gallery behavior: `src/components/ProductDetails.tsx`
- Woo fetch logic or slug resolution: `src/lib/woocommerce.ts`

## Ground rules for this repo

- Prefer changing shared helpers in `src/lib` before duplicating logic in pages/components.
- Keep cart and wishlist links canonical by storing `href` with each item.
- If a product route breaks, debug `getProductBySlug` and `getRelativeProductLink` first.
- Use archived files inside `docs/archive` only as references, not active runtime inputs.
