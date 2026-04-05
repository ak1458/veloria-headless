/**
 * ============================================================
 * 🔥 HOT SELLERS CONFIG — Homepage "Hot Seller" Section
 * ============================================================
 *
 * HOW TO CHANGE THE HOT-SELLING BAGS:
 * ------------------------------------
 * 1. Go to your WooCommerce dashboard and pick the bag you want.
 * 2. Note the bag's NAME and COLOR (e.g. "Donna" in "Black").
 * 3. Replace one of the entries below with your new bag's keywords.
 *    - Use LOWERCASE only.
 *    - The first keyword is the bag name, the second is the color.
 * 4. Save this file, push to Git, and Vercel will auto-deploy.
 *
 * EXAMPLE:
 *   To show "The Elira" in "Cherry", change one line to:
 *   ["the elira", "cherry"],
 *
 * RULES:
 * - Keep exactly 4 entries so the grid looks correct (2x2 on mobile, 4 on desktop).
 * - Each entry is an array of search keywords. The system finds the first
 *   product whose name/slug/URL contains ALL the keywords.
 *
 * ============================================================
 */

export const HOT_SELLER_IDS: number[] = [
  3459, // 🛍️ Freya
  3137, // 🛍️ The Amara
  3692, // 🛍️ The Vanya Sling
  3734, // 🛍️ Vivian
];

/**
 * Section heading & subheading — change these to update the text above the grid.
 */
export const HOT_SELLER_HEADING = {
  label: "Hot Seller",
  title: "Structured designs that carry essentials and confidence.",
};
