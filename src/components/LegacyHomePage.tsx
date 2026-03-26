/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import LegacyHomeTabs from "@/components/LegacyHomeTabs";
import PremiumHero from "@/components/PremiumHero";
import HomeProductCard from "@/components/HomeProductCard";
import InstagramFeed from "@/components/InstagramFeed";
import CustomerReviewsSection from "@/components/CustomerReviewsSection";
import { CATEGORY_TABS } from "@/lib/catalog";
import {
  getRelativeProductLink,
  getVariationProducts,
  getProductReviews,
  type WCProduct,
} from "@/lib/woocommerce";

// Custom Premium SVG Icons
// Custom Premium SVG Icons
const LeatherHideIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Symmetrical premium hide outline */}
    <path d="M12 2c-2 0-3 2-3 2s-1 1-3 1-2 2-2 4 1 5 1 5-1 3 1 4 4-1 6-1 4 2 6 1 1-4 1-4 1-3 1-5-2-4-2-4-1-1-3-1-1-2-3-2z" />
    {/* Elegant center stitch accent */}
    <path d="M12 6v12" strokeDasharray="1 3" />
  </svg>
);

const DesignIntentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Outer geometric circle */}
    <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
    {/* Drafting Compass */}
    <path d="M12 3l-6 16" />
    <path d="M12 3l6 16" />
    <path d="M9 13h6" />
    <circle cx="12" cy="4" r="1.5" />
    <path d="M12 1v1.5" />
  </svg>
);

const HammerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Craftsman handle */}
    <path d="M14 10L6 18a1.5 1.5 0 0 0 2 2l8-8" />
    {/* Mallet Head */}
    <path d="M12 8l4-4a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4L15 11" />
    <path d="M14 10l1-1" />
    {/* Crafting impact sparks */}
    <path d="M5 5l1.5 1.5" opacity="0.6" />
    <path d="M9 4v1.5" opacity="0.6" />
    <path d="M4 9h1.5" opacity="0.6" />
  </svg>
);

const HOME_FEATURES: Array<{
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
    {
      title: "Genuine Leather",
      description:
        "Carefully selected natural hides with durability, flexibility, and a refined finish.",
      icon: LeatherHideIcon,
    },
    {
      title: "Designed With Intent",
      description:
        "Every curve, cut, and contour is shaped with purpose so beauty never fights function.",
      icon: DesignIntentIcon,
    },
    {
      title: "Hand Crafted In India",
      description:
        "Built to move through daily life while holding shape, softness, and structure.",
      icon: HammerIcon,
    },
  ];

const POLICY_ITEMS: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
    {
      title: "Easy 7-Day Returns",
      description: "Simple returns on eligible orders.",
      icon: RotateCcw,
    },
    {
      title: "Free Shipping Above 3000",
      description: "Fast delivery on qualifying purchases.",
      icon: Truck,
    },
    {
      title: "Secure Checkout",
      description: "Protected payment flow and verified transactions.",
      icon: ShieldCheck,
    },
  ];

function findProduct(products: WCProduct[], terms: string[]): WCProduct | undefined {
  return products.find((product) => {
    const haystack = `${product.name} ${product.slug} ${product.permalink}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export default async function LegacyHomePage() {
  const [productsResult, reviewsResult] = await Promise.allSettled([
    getVariationProducts(),
    getProductReviews({ per_page: 5 }),
  ]);

  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const reviews = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];

  const tabs = CATEGORY_TABS.map((tab) => ({
    ...tab,
    products: products.filter((product) =>
      product.categories.some((category) => category.slug === tab.slug),
    ).slice(0, 12),
  })).filter((tab) => tab.products.length > 0);

  const donnaSpotlight =
    findProduct(products, ["donna", "chocolate brown"]) ||
    findProduct(products, ["donna"]);

  // Hot Seller - 4 specific bags
  const showcaseProducts = [
    findProduct(products, ["donna", "black"]),
    findProduct(products, ["donna", "camel"]),
    findProduct(products, ["the diana", "tan"]),
    findProduct(products, ["the diana", "teal green"]),
  ].filter((product): product is WCProduct => Boolean(product));

  // Fallback: If specific showcased products aren't found in the first 100,
  // just show the first 4 available products to avoid an empty section.
  const finalShowcaseProducts = showcaseProducts.length > 0 
    ? showcaseProducts 
    : products.slice(0, 4);

  return (
    <main id="main-content" className="legacy-home-page" role="main">
      <PremiumHero />

      {/* Features Section - 3 columns on ALL devices */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-2 md:gap-6 lg:gap-12">
            {HOME_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="flex flex-col items-center text-center p-2 md:p-6"
                >
                  <div className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 mb-2 md:mb-4 text-[#b59a5c]">
                    <Icon className="w-full h-full" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <h3 className="text-[11px] md:text-sm lg:text-base font-semibold text-gray-900 mb-1 md:mb-2 tracking-tight leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[9px] md:text-xs lg:text-sm text-gray-600 leading-relaxed max-w-[120px] md:max-w-[200px]">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Story Section - Dynamic with Auto-sliding */}
      <CustomerReviewsSection reviews={reviews} />

      {/* Designed for Everyday Elegance - Donna Spotlight Section */}
      {/* MOBILE: Full width image only, no text | DESKTOP: Image + Text side by side */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#b59a5c] uppercase mb-3">
              Designed For Everyday Elegance
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Mobile: Full image | Desktop: Normal aspect with text */}
            <div className="relative aspect-[3/4] lg:aspect-[3/3] rounded-2xl overflow-hidden">
              <img
                src="/wp-content/uploads/2026/01/Bag-16-4-scaled.jpg"
                alt="Donna tote spotlight"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Text - Now visible on mobile and desktop */}
            <div className="mt-8 lg:mt-0 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-6">
                Donna Tote
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Donna is designed to be that effortless companion you reach for
                without thinking. It moves through errands, coffee runs, casual
                Fridays, and easy evenings out with the same quiet confidence.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Structured enough for work, relaxed enough for everyday wear, and
                finished in premium leather that ages beautifully.
              </p>
              <Link
                href={donnaSpotlight ? getRelativeProductLink(donnaSpotlight) : "/shop"}
                className="inline-flex items-center px-8 py-4 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#b59a5c] transition-colors duration-300"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Seller Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#b59a5c] uppercase mb-3">
              Hot Seller
            </p>
            <h2 className="text-2xl lg:text-3xl font-serif font-medium text-gray-900 max-w-2xl mx-auto">
              Structured designs that carry essentials and confidence.
            </h2>
          </div>

          {/* Product Grid - Consistent gaps for alignment */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {finalShowcaseProducts.map((product) => (
                  <HomeProductCard key={product.id} product={product} />
                ))}
              </div>
        </div>
      </section>

      {/* Most Loved Styles Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#b59a5c] uppercase mb-3">
              Most Loved Styles
            </p>
            <h2 className="text-2xl lg:text-3xl font-serif font-medium text-gray-900">
              Choose the silhouette that fits her rhythm.
            </h2>
          </div>

          <LegacyHomeTabs tabs={tabs} />
        </div>
      </section>

      {/* Instagram Feed Section */}
      <InstagramFeed />

      {/* Policies Section */}
      <section className="py-16 lg:py-20 border-t border-gray-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12">
            {POLICY_ITEMS.map((policy) => {
              const Icon = policy.icon;
              return (
                <article
                  key={policy.title}
                  className="text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-4 text-[#b59a5c]">
                    <Icon className="w-full h-full" aria-hidden="true" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                    {policy.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {policy.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
