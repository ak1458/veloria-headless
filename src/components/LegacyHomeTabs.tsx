"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumProductCard from "@/components/PremiumProductCard";
import type { WCProduct } from "@/lib/woocommerce";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LegacyHomeTab {
  slug: string;
  label: string;
  products: WCProduct[];
}

interface LegacyHomeTabsProps {
  tabs: LegacyHomeTab[];
}

export default function LegacyHomeTabs({ tabs }: LegacyHomeTabsProps) {
  const [activeSlug, setActiveSlug] = useState(tabs[0]?.slug ?? "");
  const activeTab = tabs.find((tab) => tab.slug === activeSlug) ?? tabs[0];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!activeTab) {
    return null;
  }

  const visibleProducts = activeTab.products.slice(0, 12);
  const viewAllHref =
    activeTab.slug === "tote-bag" ? "/shop" : `/product-category/${activeTab.slug}`;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Tab Navigation - Horizontal scrollable, NO arrows on mobile */}
      <div className="overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        <div className="flex items-center justify-start md:justify-center gap-1 md:gap-8 border-b border-gray-200 min-w-max md:min-w-0 px-4 md:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActiveSlug(tab.slug)}
              className={`relative px-4 md:px-6 py-3 text-xs md:text-sm font-medium tracking-wider uppercase transition-all duration-300 whitespace-nowrap ${
                activeTab.slug === tab.slug
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-600"
              }`}
              style={{ fontFamily: 'var(--font-lato), sans-serif' }}
            >
              {tab.label}
              {/* Active Indicator */}
              {activeTab.slug === tab.slug && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b59a5c]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal Scrollable Products Row */}
      <div className="relative">
        {/* Desktop Arrows Only */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors hidden lg:flex"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>

        {/* Scrollable Container - Larger cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={scrollContainerRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.12), duration: 0.2 }}
                className="flex-shrink-0 w-[calc(50%-8px)] md:w-[280px] lg:w-[300px] snap-start"
              >
                <PremiumProductCard
                  product={product}
                  imageLoading={index < 4 ? "eager" : "lazy"}
                  showWishlist={true}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* View All Button */}
      <div className="text-center pt-4">
        <Link
          href={viewAllHref}
          className="inline-flex items-center px-8 py-3 border-2 border-black text-black text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300"
          style={{ fontFamily: 'var(--font-lato), sans-serif' }}
        >
          Explore {activeTab.label}
        </Link>
      </div>
    </div>
  );
}
