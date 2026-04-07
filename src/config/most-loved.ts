export interface MostLovedTabConfig {
  slug: string;
  label: string;
  categorySlug: string;
  allowedColors: string[];
  productIds: number[];
  maxItems: number;
  viewAllHref?: string;
}

export const MOST_LOVED_STYLES = {
  sectionId: "most-loved-styles",
  eyebrow: "Most Loved Styles",
  title: "Choose the silhouette that fits her rhythm.",
  labelColor: "#b59a5c",
  tabs: [
    {
      slug: "tote-bag",
      label: "Tote",
      categorySlug: "tote-bag",
      allowedColors: ["black", "brown", "burgundy", "tan"],
      productIds: [3003, 3459, 3137],
      maxItems: 8,
      viewAllHref: "/product-category/tote-bag",
    },
    {
      slug: "satchel-bag",
      label: "Satchel",
      categorySlug: "satchel-bag",
      allowedColors: ["black", "tan", "cherry", "brown"],
      productIds: [],
      maxItems: 8,
      viewAllHref: "/product-category/satchel-bag",
    },
    {
      slug: "sling-bag",
      label: "Sling",
      categorySlug: "sling-bag",
      allowedColors: ["black", "tan", "chocolate brown", "burgundy"],
      productIds: [3692, 3734],
      maxItems: 8,
      viewAllHref: "/product-category/sling-bag",
    },
    {
      slug: "crossbody",
      label: "Crossbody",
      categorySlug: "crossbody",
      allowedColors: ["black", "tan", "brown", "teal green"],
      productIds: [],
      maxItems: 8,
      viewAllHref: "/product-category/crossbody",
    },
  ] satisfies MostLovedTabConfig[],
};
