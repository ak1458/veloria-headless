"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Check, ArrowRight, CreditCard, ShoppingBag, Loader2, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCartStore } from "@/store/cart";
import { useCouponStore } from "@/store/cart-coupon";
import OrderSummary from "@/components/OrderSummary";
import CouponSection from "@/components/CouponSection";
import { SpinWheel } from "@/components/SpinWheel";
import RazorpayPayment from "@/components/RazorpayPayment";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Valid postal code is required"),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const steps = [
  { id: 1, label: "Information" },
  { id: 2, label: "Payment" },
];

interface PendingOrder {
  orderId: number;
  orderNumber: string;
  total: number;
}

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { calculation, isPrepaid, setIsPrepaid, calculateDiscounts, clearCoupons } = useCouponStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<{ orderId: number; orderNumber: string } | null>(null);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const formDataRef = useRef<CheckoutFormData | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Store form values for payment screen
  const handleFormSubmit = (data: CheckoutFormData) => {
    formDataRef.current = data;
    onSubmit(data);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      return await trigger(["email", "firstName", "lastName", "address", "city", "postalCode", "phone"]);
    }
    return true;
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 2) {
      setCurrentStep(currentStep + 1);
      setOrderError(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setOrderError(null);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setOrderError(null);

    try {
      // Calculate final amounts
      const latestCalculation = await calculateDiscounts(items);
      
      if (!latestCalculation) {
        throw new Error("Failed to calculate order total");
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          paymentMethod: isPrepaid ? "card" : "cod",
          shippingMethod: "standard",
          isPrepaid,
          couponCodes: latestCalculation.appliedCoupons.map(c => c.coupon.code),
          discounts: {
            tierDiscount: latestCalculation.tierDiscount,
            prepaidDiscount: latestCalculation.prepaidDiscount,
            manualCouponDiscount: latestCalculation.manualCouponDiscount,
          },
          totals: {
            subtotal: latestCalculation.originalSubtotal,
            shipping: latestCalculation.shippingCost,
            codFee: latestCalculation.codFee,
            total: latestCalculation.finalTotal,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order");
      }

      // For prepaid orders, show Razorpay payment instead of redirecting
      if (result.paymentRequired) {
        setPendingOrder({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          total: result.total,
        });
        setIsSubmitting(false);
        return;
      }

      setPlacedOrder({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
      });
      clearCart();
      clearCoupons();
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    // Update order with payment info
    try {
      await fetch("/api/checkout/update-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: pendingOrder?.orderId,
          paymentId,
          status: "completed",
        }),
      });
    } catch (e) {
      console.error("Failed to update payment status:", e);
    }

    setPlacedOrder({
      orderId: pendingOrder!.orderId,
      orderNumber: pendingOrder!.orderNumber,
    });
    setPendingOrder(null);
    clearCart();
    clearCoupons();
  };

  const handlePaymentError = (error: string) => {
    setOrderError(error);
  };

  if (items.length === 0 && !placedOrder && !pendingOrder) {
    return (
      <div className="pt-24 min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-serif text-lg mb-4 text-gray-800">Your cart is empty</p>
          <Link href="/shop" className="bg-[#1a1a1a] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors block text-center">
            Return to shop
          </Link>
        </div>
      </div>
    );
  }

  // Razorpay Payment Screen
  if (pendingOrder) {
    return (
      <div className="pt-24 min-h-screen bg-[#faf8f5] pb-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#072654]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[#072654]" />
              </div>
              <h2 className="font-serif text-2xl text-gray-900 mb-2">Complete Your Payment</h2>
              <p className="text-sm text-gray-500">Order #{pendingOrder.orderNumber}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Amount to Pay</span>
                <span className="text-2xl font-bold text-gray-900">₹{Number(pendingOrder.total).toLocaleString("en-IN")}</span>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure payment powered by Razorpay
              </p>
            </div>

            {orderError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{orderError}</p>
              </div>
            )}

            <RazorpayPayment
              amount={Number(pendingOrder.total)}
              orderId={pendingOrder.orderId.toString()}
              orderNumber={pendingOrder.orderNumber}
              customerDetails={{
                name: `${formDataRef.current?.firstName || ''} ${formDataRef.current?.lastName || ''}`.trim(),
                email: formDataRef.current?.email || '',
                phone: formDataRef.current?.phone || '',
              }}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <button
              onClick={() => setPendingOrder(null)}
              className="w-full mt-4 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel and go back
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="pt-32 min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="font-serif text-2xl text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-sm text-gray-500 mb-2">Thank you for your purchase.</p>
          <p className="text-lg font-semibold text-[#b59a5c] mb-6">Order #{placedOrder.orderNumber}</p>
          <Link href="/shop" className="bg-[#1a1a1a] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors block text-center">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-[#faf8f5] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Form Side */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
            
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === s.id ? "bg-[#b59a5c] text-white" : currentStep > s.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                  }`}>
                    {currentStep > s.id ? <Check size={12} /> : s.id}
                  </div>
                  <span className={`text-xs font-medium ${currentStep === s.id ? "text-gray-900 font-semibold" : "text-gray-400"}`}>{s.label}</span>
                  {idx < steps.length - 1 && <div className="h-[1px] w-8 bg-gray-200 hidden md:block" /> }
                </div>
              ))}
            </div>

            {orderError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{orderError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-gray-800 mb-2">Contact & Shipping</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address *</label>
                    <input 
                      {...register("email")}
                      type="email" 
                      placeholder="email@address.com" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name *</label>
                      <input 
                        {...register("firstName")}
                        type="text" 
                        placeholder="John" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                      />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                      <input 
                        {...register("lastName")}
                        type="text" 
                        placeholder="Doe" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                      />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address *</label>
                    <input 
                      {...register("address")}
                      type="text" 
                      placeholder="Apartment, suite, street no." 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City *</label>
                      <input 
                        {...register("city")}
                        type="text" 
                        placeholder="New Delhi" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Postal Code *</label>
                      <input 
                        {...register("postalCode")}
                        type="text" 
                        placeholder="110001" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                      />
                      {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone *</label>
                    <input 
                      {...register("phone")}
                      type="tel" 
                      placeholder="9876543210" 
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#b59a5c]"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-gray-800 mb-2">Payment Method</h3>
                  
                  <div className="space-y-3">
                    <label className={`border-2 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      isPrepaid ? "border-[#b59a5c] bg-[#b59a5c]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          checked={isPrepaid}
                          onChange={() => setIsPrepaid(true)}
                          className="text-[#b59a5c]"
                        />
                      <div className="flex items-center space-x-2">
                        <CreditCard size={20} className="text-gray-500" />
                        <div>
                          <p className="text-sm font-semibold">UPI / Card / Net Banking</p>
                          <p className="text-xs text-gray-400">Secure payment via Razorpay</p>
                        </div>
                      </div>
                    </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+5% off</span>
                    </label>

                    <label className={`border-2 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      !isPrepaid ? "border-[#b59a5c] bg-[#b59a5c]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <input 
                          type="radio" 
                          checked={!isPrepaid}
                          onChange={() => setIsPrepaid(false)}
                          className="text-[#b59a5c]"
                        />
                        <div>
                          <p className="text-sm font-semibold">Cash on Delivery</p>
                          <p className="text-xs text-gray-400">Pay when you receive</p>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">+₹149</span>
                    </label>
                  </div>

                  {/* Order Summary for Mobile */}
                  <div className="lg:hidden mt-6">
                    <OrderSummary showCouponSection={false} />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
                {currentStep > 1 ? (
                  <button type="button" onClick={handlePrevStep} className="text-sm text-gray-500 font-medium hover:text-black">
                    Back
                  </button>
                ) : <div />}
                
                {currentStep < 2 ? (
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center space-x-2 bg-[#1a1a1a] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors"
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 bg-[#1a1a1a] text-white px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {isPrepaid ? "Continue to Payment" : "Place Order"} · ₹{(calculation?.finalTotal || 0).toLocaleString("en-IN")}
                        </span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

            {/* Summary Side */}
          <div className="lg:col-span-5 space-y-4 hidden lg:block">
            <OrderSummary />
            <CouponSection />
          </div>

        </div>
      </div>
      <SpinWheel />
    </div>
  );
}
