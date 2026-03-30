"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface RazorpayPaymentProps {
  amount: number;
  orderId: string;
  orderNumber: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: RazorpayResponse) => Promise<void>;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): {
    open: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export default function RazorpayPayment({
  amount,
  orderId,
  orderNumber,
  customerDetails,
  onSuccess,
  onError,
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Window not available"));
        return;
      }
      
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(script);
    });
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await loadRazorpayScript();

      // Create Razorpay order
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: orderNumber,
          notes: {
            order_id: orderId,
            customer_email: customerDetails.email,
          },
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Veloria Vault",
        description: `Order #${orderNumber}`,
        order_id: orderData.orderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: "#b59a5c",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess(response.razorpay_payment_id);
            } else {
              onError("Payment verification failed");
            }
          } catch {
            onError("Error verifying payment");
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK unavailable");
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      onError(error instanceof Error ? error.message : "Payment failed");
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full flex items-center justify-center space-x-2 bg-[#072654] text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#0d3a7a] transition-colors disabled:opacity-50 rounded shadow-sm"
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Initializing Payment...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Pay Securely with Razorpay</span>
        </>
      )}
    </button>
  );
}
