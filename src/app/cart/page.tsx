"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Truck, Shield, RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 3000 ? 0 : 150;
  const total = subtotal + shipping;

  return (
    <div className="pt-[100px] min-h-screen bg-[#faf8f5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/shop" className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-2xl md:text-3xl text-gray-900 tracking-wide">
            Shopping Cart <span className="text-gray-400 font-sans text-lg">({items.length} items)</span>
          </h1>
          <div className="w-24 hidden md:block" /> {/* Balance */}
        </div>
      </div>

      <AnimatePresence>
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="font-serif text-xl mb-2 text-gray-800">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Looks like you haven&apos;t added anything to your cart yet. Explore our latest premium leather collections.
            </p>
            <Link
              href="/shop"
              className="bg-[#1a1a1a] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors shadow-sm"
              id="continue-shopping"
            >
              Explore Collection
            </Link>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                  >
                    <div className="relative w-28 h-28 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-50">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 120px) 100vw, 120px"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{item.category}</p>
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 truncate hover:text-[#b59a5c] transition-colors">
                              <Link href={`/product/${item.slug}`}>
                                {item.name}
                              </Link>
                            </h3>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-sm md:text-base mt-1.5 text-gray-800">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-gray-400">
                          Total: <span className="font-bold text-gray-700">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                    <Truck className="w-5 h-5 text-[#b59a5c] mb-2" />
                    <span className="text-[11px] font-bold text-gray-800">Free Shipping</span>
                    <span className="text-[10px] text-gray-400">On orders over ₹3,000</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                    <Shield className="w-5 h-5 text-[#b59a5c] mb-2" />
                    <span className="text-[11px] font-bold text-gray-800">Secure Payment</span>
                    <span className="text-[10px] text-gray-400">100% safe transactions</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                    <RefreshCw className="w-5 h-5 text-[#b59a5c] mb-2" />
                    <span className="text-[11px] font-bold text-gray-800">Easy Returns</span>
                    <span className="text-[10px] text-gray-400">7-day return policy</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)] sticky top-[120px]">
                  <h2 className="font-serif text-lg text-gray-800 mb-6 border-b border-gray-50 pb-3">Order Summary</h2>

                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-800">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">Shipping</span>
                      <span className="font-bold text-[#b59a5c]">{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-[11px] text-[#b59a5c]">Add ₹{(3000 - subtotal).toLocaleString("en-IN")} more for Free Shipping</p>
                    )}
                    {shipping === 0 && (
                      <div className="bg-[#fcf8e8] text-[#8a6d3b] p-2 rounded text-center text-xs font-semibold">
                        ✓ You&apos;ve unlocked free shipping!
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-base text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-lg">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full bg-[#1a1a1a] text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors text-center rounded shadow-sm"
                    id="checkout-button"
                  >
                    Proceed to Checkout
                  </Link>

                  <div className="mt-4 flex items-center justify-center gap-3">
                    {/* Visa */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#1A1F71] to-[#2E3192] text-white px-3 py-1.5 rounded-md shadow-sm">
                      <svg className="w-5 h-3" viewBox="0 0 48 16" fill="none">
                        <path d="M17.68 1.5l-4.6 11h-3.1l-2.25-8.7c-.15-.5-.35-.7-.75-.9C5.65 2.4 4.15 2 3 1.65l.05-.4h5.3c.7 0 1.3.45 1.45 1.25l1.2 6.35L13.15 1.5h3.53zm11.55 7.45c.05-2.9-4-3.05-3.95-4.35 0-.4.4-.8 1.2-.9.4-.05 1.55-.1 2.85.5l.5-2.4c-.7-.25-1.6-.5-2.7-.5-2.85 0-4.85 1.5-4.85 3.65 0 1.6 1.2 2.45 2.1 3 1 .55 1.3.9 1.3 1.4 0 .75-.8 1.1-1.55 1.1-1.3 0-2-.35-2.55-.65l-.55 2.45c.7.3 1.75.55 2.95.55 3 0 5-1.45 5-3.85zm7.5 3.55h2.45l-2.15-11h-2.25c-.5 0-.95.3-1.15.75l-4.05 10.25h2.75l.55-1.6h3.4l.45 1.6zm-2.95-3.6l1.4-3.9 1.4 3.9h-2.8zm-12.6-7.4l-2.15 11h2.6l2.15-11h-2.6zm25.6 0l-2.15 11h2.6l2.15-11h-2.6z" fill="currentColor"/>
                      </svg>
                      <span className="text-[10px] font-semibold tracking-wide">VISA</span>
                    </div>
                    
                    {/* UPI */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white px-3 py-1.5 rounded-md shadow-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20M4 4l16 16M20 4L4 20"/>
                      </svg>
                      <span className="text-[10px] font-bold tracking-wide">UPI</span>
                    </div>
                    
                    {/* RuPay */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#8B0000] to-[#DC143C] text-white px-3 py-1.5 rounded-md shadow-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                      <span className="text-[10px] font-bold tracking-wide">RuPay</span>
                    </div>
                    
                    {/* Razorpay */}
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#072654] to-[#0d3a7a] text-white px-3 py-1.5 rounded-md shadow-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span className="text-[10px] font-bold tracking-wide">Razorpay</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
