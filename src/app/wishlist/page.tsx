"use client";

import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      slug: item.slug,
      href: item.href,
      price: item.price,
      image: item.image,
      category: item.category,
    });
    openCart();
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        slug: item.slug,
        href: item.href,
        price: item.price,
        image: item.image,
        category: item.category,
      });
    });
    openCart();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Premium Hero Header */}
      <div className="relative bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(181,154,92,0.3) 0%, transparent 50%),
                              radial-gradient(circle at 80% 50%, rgba(181,154,92,0.2) 0%, transparent 50%)`,
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-[#b59a5c] transition-colors text-sm mb-4"
              >
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>
              <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#b59a5c]" fill="currentColor" />
                My Wishlist
              </h1>
              <p className="text-gray-400 text-sm mt-2 tracking-wide">
                {items.length} {items.length === 1 ? "item" : "items"} saved for later
              </p>
            </div>
            {items.length > 1 && (
              <button
                onClick={handleMoveAllToCart}
                className="flex items-center gap-2 bg-[#b59a5c] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#a08a4f] transition-colors shadow-lg"
              >
                <ShoppingBag size={14} />
                Add All to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-lg mx-auto"
            >
              <div className="relative mb-8">
                <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center shadow-inner">
                  <Heart className="w-12 h-12 text-gray-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#b59a5c]/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#b59a5c]" />
                </div>
              </div>
              <h2 className="font-serif text-2xl mb-3 text-gray-800">
                Your wishlist is empty
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm">
                Save the pieces you love to find them later. Your favorites will be waiting right here.
              </p>
              <Link
                href="/shop"
                className="bg-[#1a1a1a] text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-all duration-300 shadow-sm hover:shadow-lg"
              >
                Explore Collection
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7"
            >
              <AnimatePresence>
                {items.map((item, index) => {
                  const itemHref = item.href ?? `/product/${item.slug}`;

                  return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col h-full"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-[#f0ede8] overflow-hidden flex-shrink-0">
                      <Link href={itemHref}>
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </Link>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Remove from wishlist"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Sale Badge */}
                      {item.originalPrice && (
                        <div className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase">
                          Sale
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] md:text-[10px] text-[#b59a5c] uppercase tracking-[0.2em] mb-1.5 font-bold">
                          {item.category}
                        </p>
                        <Link href={itemHref}>
                          <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 mb-2 leading-snug hover:text-[#b59a5c] transition-colors">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="font-bold text-base text-gray-900">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </motion.div>
                )})}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
