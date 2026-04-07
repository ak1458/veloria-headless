"use client";

import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Truck, Shield, RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-[92px] sm:pt-[100px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link href="/shop" className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="font-serif text-xl text-gray-900 tracking-wide sm:text-2xl md:text-3xl">
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
                {items.map((item) => {
                  const itemHref = item.href ?? `/product/${item.slug}`;

                  return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:flex-row sm:p-5"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-50 bg-gray-50 sm:h-28 sm:w-28 sm:aspect-auto sm:flex-shrink-0">
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
                              <Link href={itemHref}>
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

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                )})}

                {/* Trust Badges */}
                <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                    <Truck className="w-5 h-5 text-[#b59a5c] mb-2" />
                    <span className="text-[11px] font-bold text-gray-800">Free Shipping</span>
                    <span className="text-[10px] text-gray-400">Always free on all orders</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                    <Shield className="w-5 h-5 text-[#b59a5c] mb-2" />
                    <span className="text-[11px] font-bold text-gray-800">Secure Payment</span>
                    <span className="text-[10px] text-gray-400">100% safe transactions</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                    <RefreshCw className="w-5 h-5 text-[#b59a5c] mb-2" />
                    <span className="text-[11px] font-bold text-gray-800">Hassle-Free Replacements</span>
                    <span className="text-[10px] text-gray-400">Contact support for replacements</span>
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
                      <span className="font-bold text-[#b59a5c]">FREE</span>
                    </div>
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

                  <div className="mt-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-3">
                      100% Secure Payments
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1.5 shadow-sm hover:shadow transition-shadow">
                        <Image src="/images/payment/visa-logo.svg" alt="Visa" width={32} height={20} className="object-contain w-full h-full" />
                      </div>
                      <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shadow-sm hover:shadow transition-shadow">
                        <Image src="/images/payment/mastercard-logo.svg" alt="Mastercard" width={32} height={20} className="object-contain w-full h-full pt-0.5" />
                      </div>
                      <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shadow-sm hover:shadow transition-shadow">
                        <Image src="/images/payment/rupay-logo.svg" alt="RuPay" width={32} height={20} className="object-contain w-full h-full" />
                      </div>
                      <div className="h-8 w-12 bg-white border border-gray-200 rounded flex items-center justify-center p-1 shadow-sm hover:shadow transition-shadow">
                        <Image src="/images/payment/upi-logo.svg" alt="UPI" width={32} height={20} className="object-contain w-full h-full" />
                      </div>
                      <div className="h-8 w-20 bg-white border border-gray-200 rounded flex items-center justify-center p-1.5 shadow-sm hover:shadow transition-shadow">
                        <Image src="/images/payment/razorpay-logo.svg" alt="Netbanking & More via Razorpay" width={64} height={20} className="object-contain w-full h-full" />
                      </div>
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
