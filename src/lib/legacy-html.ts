import { LEGACY_SITE_URL } from "@/lib/site";

const replacements: Array<[string, string]> = [
  [`${LEGACY_SITE_URL}/staging/?post_type=product`, "/?post_type=product"],
  [`${LEGACY_SITE_URL}/?post_type=product`, "/?post_type=product"],
  [`${LEGACY_SITE_URL}/staging/about/`, "/about/"],
  [`${LEGACY_SITE_URL}/about/`, "/about/"],
  [`${LEGACY_SITE_URL}/staging/contact-us/`, "/contact-us/"],
  [`${LEGACY_SITE_URL}/contact-us/`, "/contact-us/"],
  [`${LEGACY_SITE_URL}/staging/privacy-policy/`, "/privacy-policy/"],
  [`${LEGACY_SITE_URL}/privacy-policy/`, "/privacy-policy/"],
  [`${LEGACY_SITE_URL}/staging/shipping-policy/`, "/shipping-policy/"],
  [`${LEGACY_SITE_URL}/shipping-policy/`, "/shipping-policy/"],
  [`${LEGACY_SITE_URL}/staging/warranty-policy/`, "/warranty-policy/"],
  [`${LEGACY_SITE_URL}/warranty-policy/`, "/warranty-policy/"],
  [`${LEGACY_SITE_URL}/staging/terms-conditions/`, "/terms-conditions/"],
  [`${LEGACY_SITE_URL}/terms-conditions/`, "/terms-conditions/"],
  [`${LEGACY_SITE_URL}/staging/refund_returns/`, "/refund_returns/"],
  [`${LEGACY_SITE_URL}/refund_returns/`, "/refund_returns/"],
  [
    `${LEGACY_SITE_URL}/staging/cancellation-refund-policy/`,
    "/cancellation-refund-policy/",
  ],
  [`${LEGACY_SITE_URL}/cancellation-refund-policy/`, "/cancellation-refund-policy/"],
  [`${LEGACY_SITE_URL}/staging/cart/`, "/cart/"],
  [`${LEGACY_SITE_URL}/cart/`, "/cart/"],
  [`${LEGACY_SITE_URL}/staging/checkout/`, "/checkout/"],
  [`${LEGACY_SITE_URL}/checkout/`, "/checkout/"],
  [`${LEGACY_SITE_URL}/staging/my-account/`, "/my-account/"],
  [`${LEGACY_SITE_URL}/my-account/`, "/my-account/"],
  [`${LEGACY_SITE_URL}/staging/product-category/`, "/product-category/"],
  [`${LEGACY_SITE_URL}/product-category/`, "/product-category/"],
  [`${LEGACY_SITE_URL}/staging/product/`, "/product/"],
  [`${LEGACY_SITE_URL}/product/`, "/product/"],
  [
    'action="/wp-json/wp/v2/pages?slug=contact-us#wpcf7-f238-o1"',
    `action="${LEGACY_SITE_URL}/contact-us/"`,
  ],
  ["LUXURY locked in leather", "LUXURY LOCKED IN LEATHER"],
  [
    "Each piece holds more than design It is a possession. A presence. A promise.",
    "Each piece holds more than design. It is a possession. A presence. A promise.",
  ],
  ["Designed For everyday elegance", "Designed For Everyday Elegance"],
  ["Our Story Timeless Craftmanship", "Our Story Timeless Craftsmanship"],
  [
    "After studying at leather institute and working in the fashion and export industry I took a break to focus on my family But even during that time, my eye never left the world of leather. I kept researching observing and studying the evolution of style, materials and global trends.",
    "After studying at a leather institute and working in the fashion and export industry, I took a break to focus on my family. Even during that time, my eye never left the world of leather. I kept researching, observing, and studying the evolution of style, materials, and global trends.",
  ],
  [
    "Veloria vault was born from years of experience in design, fashion and export. We saw a gap between quality and style between tradition and modern life and we set out to fill it. Most leather hand bags either felt too plain or lacked the kind of thought ful, practical design that today’s women actually need. We wanted to create something different. We wanted to create bags that weren’t just made from real leather but also felt modern, functional and well crafted.",
    "Veloria Vault was born from years of experience in design, fashion, and export. We saw a gap between quality and style, between tradition and modern life, and we set out to fill it. Most leather handbags either felt too plain or lacked the kind of thoughtful, practical design that today's women actually need. We wanted to create something different. We wanted to create bags that weren't just made from real leather, but also felt modern, functional, and well-crafted.",
  ],
  [
    "We looked at what worked, what didn&#8217;t, and what women were still looking for: handbags that perfectly balance everyday functionality with elegant design.",
    "We looked at what worked, what didn&#8217;t, and what women were still looking for: handbags that balance everyday functionality with elegant design.",
  ],
  ["Easy 7- Day Returns", "Hassle-Free Replacements"],
  [
    "Carefully derived from natural hides ,valued for its durability, flexibility, and refined finish.",
    "Carefully derived from natural hides, valued for their durability, flexibility, and refined finish.",
  ],
  ["designed with intent", "Designed With Intent"],
  [
    "each bag is designed to withstand daily movement while retaining its shape, softness, and structure",
    "Each bag is designed to withstand daily movement while retaining its shape, softness, and structure.",
  ],
];

export function rewriteLegacyHtml(html: string): string {
  return replacements.reduce(
    (output, [from, to]) => output.replaceAll(from, to),
    html,
  );
}
