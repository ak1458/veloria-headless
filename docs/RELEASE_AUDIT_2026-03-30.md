# Release Audit - 2026-03-30

## Summary

This audit focused on product-page stability, route reliability, codebase cleanup, and front-end performance.

## Fixed in this pass

- Removed SKU from the product meta block.
- Replaced multi-icon social sharing with a single copy-link action on PDP.
- Fixed product slug resolution so products like Donna and Venessa no longer fall into false 404 pages.
- Stored canonical product links in cart and wishlist items to stop broken product redirects later.
- Reduced excess white space in the mobile PDP gallery and made the mobile image area feel larger.
- Switched key storefront pages from forced dynamic rendering to timed revalidation for better speed.
- Enabled Next.js image optimization in production config.
- Cleaned several lint issues in account, auth, Razorpay, footer, shop, and PDP files.

## Repo cleanup

- Moved raw audit HTML files into `docs/archive/raw-html-audits/`.
- Moved loose debug logs into `docs/archive/debug/`.
- Moved the Woo debug script into `scripts/debug/`.
- Moved `FONTS.md` into `docs/`.

## Validation checklist

- `npm run lint`
- `npm run build`
- Product route spot checks:
  - `/product/aria-tote`
  - `/product/donna`
  - `/product/venessa-tote`
- Shop product-link sweep for 404 regression

## Remaining focus areas for future passes

- A few large marketing pages still mix inline backgrounds and content-heavy markup that could be componentized further.
- More image-heavy sections can be optimized further with `next/image` only if design parity remains intact.
- Checkout and account flows would benefit from dedicated automated test coverage.
