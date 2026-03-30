"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Navigate to internal checkout
    window.location.href = "/checkout";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-[#faf8f5] z-[60] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#b59a5c]" />
                <h2 className="font-serif text-xl tracking-wide text-[#1a1a1a]">Shopping Cart</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-black transition-colors"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-serif text-lg mb-2 text-gray-800">Your cart is empty</p>
                  <p className="text-sm text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
                  <button
                    onClick={onClose}
                    className="bg-[#1a1a1a] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const itemHref = item.href ?? `/product/${item.slug}`;

                    return (
                    <div key={item.id} className="flex gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                      <div className="relative w-20 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        <Image
                           src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</p>
                          <h3 className="font-medium text-sm text-gray-800 truncate hover:text-[#b59a5c]">
                            <Link href={itemHref} onClick={onClose}>
                              {item.name}
                            </Link>
                          </h3>
                          <p className="font-semibold text-sm mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-200 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3 text-gray-600" />
                            </button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3 text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 pb-24 lg:pb-6 space-y-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-lg font-bold text-[#1a1a1a]">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-gray-400 text-center">
                  Shipping and taxes calculated at checkout
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="flex items-center justify-center border border-[#1a1a1a] text-[#1a1a1a] py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors text-center"
                  >
                    View Cart
                  </Link>
                  <button
                    onClick={handleCheckout}
                    className="flex items-center justify-center bg-[#1a1a1a] text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors text-center"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

  );
}
