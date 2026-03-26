"use client";

import { useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PremiumProductCard from "@/components/PremiumProductCard";
import type { WCProduct, WCCategory } from "@/lib/woocommerce";
import { Search } from "lucide-react";

const CATEGORY_TABS = [
  { slug: "tote-bag", label: "Tote" },
  { slug: "satchel-bag", label: "Satchel" },
  { slug: "sling-bag", label: "Sling" },
  { slug: "crossbody", label: "Crossbody" },
  { slug: "clutch", label: "Clutch" },
  { slug: "wallet", label: "Wallet" },
];

interface ShopContentProps {
  initialCategories: WCCategory[];
  initialProducts: WCProduct[];
  initialCategorySlug?: string;
  initialSearchTerm?: string;
}

export default function ShopContent({
  initialCategories,
  initialProducts,
  initialCategorySlug,
  initialSearchTerm,
}: ShopContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categorySlug = searchParams.get("category") || initialCategorySlug;
  const searchTerm = searchParams.get("search") || initialSearchTerm;

  const categories = useMemo(() => {
    return initialCategories
      .filter((c) => CATEGORY_TABS.some((t) => t.slug === c.slug))
      .sort((left, right) => {
        const leftIndex = CATEGORY_TABS.findIndex((t) => t.slug === left.slug);
        const rightIndex = CATEGORY_TABS.findIndex((t) => t.slug === right.slug);
        return leftIndex - rightIndex;
      });
  }, [initialCategories]);

  const products = useMemo(() => {
    let filtered = initialProducts;

    if (categorySlug) {
      filtered = filtered.filter((product) =>
        product.categories.some((category) => category.slug === categorySlug)
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(search) ||
        product.categories.some((c) => c.name.toLowerCase().includes(search))
      );
    }

    return filtered;
  }, [initialProducts, categorySlug, searchTerm]);

  const updateQuery = (updates: { category?: string; search?: string }) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (updates.category) {
      nextParams.set("category", updates.category);
    } else {
      nextParams.delete("category");
    }

    if (updates.search) {
      nextParams.set("search", updates.search);
    } else {
      nextParams.delete("search");
    }

    const queryString = nextParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const localSearch = searchInputRef.current?.value.trim() || "";
    updateQuery({ search: localSearch || undefined });
  };

  const handleCategoryClick = (slug: string | null) => {
    updateQuery({ category: slug || undefined });
  };

  const getCategoryLabel = (slug: string) => {
    const tab = CATEGORY_TABS.find((t) => t.slug === slug);
    return tab?.label || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <div className="relative bg-[#1a1a1a] py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "url('https://veloriavault.com/wp-content/uploads/2026/01/Bag-14-15-16-4-scaled.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white text-center">
            {searchTerm ? "SEARCH RESULTS" : "SHOP"}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-200 border ${
                !categorySlug && !searchTerm
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-200 hover:border-black"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`px-4 py-2 text-xs font-medium tracking-wider uppercase transition-all duration-200 border ${
                  categorySlug === category.slug
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-200 hover:border-black"
                }`}
              >
                {getCategoryLabel(category.slug)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                key={searchTerm || "all-products"}
                ref={searchInputRef}
                type="text"
                defaultValue={searchTerm || ""}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-black transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Showing {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {products.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.12), duration: 0.2 }}
                >
                  <PremiumProductCard
                    product={product}
                    imageLoading={index < 8 ? "eager" : "lazy"}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <button
              onClick={() => handleCategoryClick(null)}
              className="inline-flex items-center px-6 py-3 bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-[#b59a5c] transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
