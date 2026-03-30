/**
 * ============================================================
 * CHECKOUT API — /api/checkout
 * ============================================================
 *
 * FLOW:
 * 1. Frontend submits cart items + billing details + payment method
 * 2. This API fetches REAL prices from WooCommerce to prevent tampering
 * 3. Discounts are recalculated server-side (tier, prepaid, coupons, lucky draw)
 * 4. A WooCommerce order is created via REST API (/wp-json/wc/v3/orders)
 *    → This order appears in your WooCommerce dashboard immediately
 *
 * PAYMENT METHODS:
 * - COD: Order created as "pending" → no further steps
 * - Prepaid (UPI/Card/NetBanking): Order created as "pending" →
 *   frontend opens Razorpay SDK → on payment success →
 *   /api/razorpay/verify confirms signature →
 *   /api/checkout/update-payment marks order as "completed"
 *
 * WOOCOMMERCE DASHBOARD:
 * All orders sync automatically. Credentials are in .env files:
 *   WC_API_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET
 * ============================================================
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateDiscounts } from "@/lib/coupon-calculator";
import { getProductsByIds } from "@/lib/woocommerce";
import { verifyToken } from "@/lib/auth/jwt";
import jwt from "jsonwebtoken";

// Basic HTML sanitizer for security
function stripHtmlTags(str: string) {
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
}

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address").transform(stripHtmlTags),
  firstName: z.string().min(1, "First name is required").transform(stripHtmlTags),
  lastName: z.string().min(1, "Last name is required").transform(stripHtmlTags),
  address: z.string().min(5, "Address is required").transform(stripHtmlTags),
  city: z.string().min(2, "City is required").transform(stripHtmlTags),
  state: z.string().min(2, "State is required").transform(stripHtmlTags),
  postalCode: z.string().min(4, "Valid postal code is required").transform(stripHtmlTags),
  phone: z.string().min(10, "Valid phone number is required").transform(stripHtmlTags),
  paymentMethod: z.enum(["card", "cod"]),
  shippingMethod: z.enum(["standard", "express"]),
  isPrepaid: z.boolean().default(true),
  items: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number().min(1),
      price: z.number().positive(),
    })
  ).min(1, "Cart is empty"),
  couponCodes: z.array(z.string()).default([]),
  discounts: z.object({
    tierDiscount: z.number().default(0),
    prepaidDiscount: z.number().default(0),
    manualCouponDiscount: z.number().default(0),
  }).optional(),
  totals: z.object({
    subtotal: z.number(),
    shipping: z.number(),
    codFee: z.number(),
    total: z.number(),
  }),
});

const WC_API_URL = process.env.WC_API_URL?.trim();
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY?.trim();
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET?.trim();

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = checkoutSchema.parse(body);
    
    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Fetch real products from WooCommerce to prevent price manipulation
    // getProductsByIds uses /products?include= which may miss variations,
    // so we also try fetching individually as a fallback.
    const productIds = validatedData.items.map(i => i.id);
    const realProducts = await getProductsByIds(productIds);
    
    // For any missing products (likely variations), fetch them individually
    const missingIds = productIds.filter(id => !realProducts.find(p => p.id === id));
    if (missingIds.length > 0) {
      const { getProductById } = await import("@/lib/woocommerce");
      const individualFetches = await Promise.all(
        missingIds.map(id => getProductById(id))
      );
      for (const p of individualFetches) {
        if (p) realProducts.push(p);
      }
    }

    // Map real prices to items
    const secureItems = validatedData.items.map(clientItem => {
      const realProduct = realProducts.find(p => p.id === clientItem.id);
      if (!realProduct) {
        // Last resort: use client price but log a warning
        console.warn(`[Checkout] Product ${clientItem.id} not found in WC, using client price`);
        return {
          ...clientItem,
          slug: "", image: "", category: ""
        };
      }
      return {
        ...clientItem,
        price: parseFloat(realProduct.price || realProduct.regular_price || "0"),
        slug: "", image: "", category: ""
      };
    });

    console.log("[Checkout] Secure items prepared:", secureItems.length);

    let customerId = 0;
    
    // Check for Lucky Draw token and Auth token
    let luckyDrawDiscount = 0;
    
    const luckyToken = request.cookies.get("veloria_lucky_draw")?.value;
    if (luckyToken) {
      try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(luckyToken, secret) as { discount: number };
        luckyDrawDiscount = decoded.discount;
      } catch {
        // ignore invalid/expired lucky draw token
      }
    }

    const authToken = request.cookies.get("token")?.value;
    if (authToken) {
      try {
        const payload = await verifyToken(authToken);
        if (payload?.userId) {
          customerId = payload.userId as number;
        }
      } catch {
        // Not authenticated
      }
    }

    // Recalculate to ensure totals are correct
    const calculation = calculateDiscounts({
      items: secureItems,
      appliedCouponCodes: validatedData.couponCodes,
      isPrepaid: validatedData.isPrepaid,
      luckyDrawDiscount
    });

    // Prepare coupon lines for WooCommerce based ONLY on successfully verified local coupons
    const couponLines = calculation.appliedCoupons.map((c) => ({
      code: c.coupon.code,
    }));

    // Create WooCommerce order
    const orderData = {
      payment_method: validatedData.paymentMethod === "cod" ? "cod" : "razorpay",
      payment_method_title: validatedData.paymentMethod === "cod" 
        ? "Cash on Delivery" 
        : "UPI / Card / Net Banking",
      set_paid: false,
      status: "pending",
      currency: "INR",
      billing: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        address_1: validatedData.address,
        address_2: "",
        city: validatedData.city,
        state: validatedData.state,
        postcode: validatedData.postalCode,
        country: "IN",
        email: validatedData.email,
        phone: validatedData.phone,
      },
      shipping: {
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        address_1: validatedData.address,
        address_2: "",
        city: validatedData.city,
        state: validatedData.state,
        postcode: validatedData.postalCode,
        country: "IN",
      },
      line_items: validatedData.items.map((item) => {
        const realProduct = realProducts.find(p => p.id === item.id);
        return {
          product_id: realProduct?.parent_id || item.id,
          variation_id: realProduct?.parent_id ? item.id : 0,
          quantity: item.quantity,
        };
      }),
      shipping_lines: [
        {
          method_id: validatedData.shippingMethod,
          method_title: validatedData.shippingMethod === "standard" 
            ? "Standard Shipping" 
            : "Express Shipping",
          total: calculation.shippingCost.toString(),
        },
      ],
      coupon_lines: couponLines,
      fee_lines: calculation.codFee > 0 ? [
        {
          name: "Cash on Delivery Fee",
          total: calculation.codFee.toString(),
          tax_status: "taxable",
        },
      ] : [],
      meta_data: [
        {
          key: "_order_source",
          value: "Next.js Headless",
        },
        {
          key: "_is_prepaid",
          value: validatedData.isPrepaid ? "yes" : "no",
        },
        {
          key: "_tier_discount",
          value: calculation.tierDiscount.toString(),
        },
        {
          key: "_prepaid_discount",
          value: calculation.prepaidDiscount.toString(),
        },
        {
          key: "_manual_coupon_discount",
          value: calculation.manualCouponDiscount.toString(),
        },
        {
          key: "_original_subtotal",
          value: calculation.originalSubtotal.toString(),
        },
        {
          key: "_total_savings",
          value: calculation.savingsBreakdown.reduce((sum, s) => sum + s.amount, 0).toString(),
        },
      ],
      // Add customer if exists
      customer_id: customerId,
    };

    // Create WooCommerce order with retry logic for invalid coupons
    let response = await fetch(`${WC_API_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    // If invalid coupon, retry once without coupons
    if (!response.ok) {
      const errorData = await response.clone().json().catch(() => ({}));
      if (
        errorData.code === "woocommerce_rest_invalid_coupon" || 
        errorData.message?.toLowerCase().includes("does not exist")
      ) {
        console.warn("[Checkout] Invalid coupon detected, retrying without coupons...");
        response = await fetch(`${WC_API_URL}/orders`, {
          method: "POST",
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...orderData, coupon_lines: [] }),
        });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("WooCommerce API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create order", details: errorData },
        { status: 500 }
      );
    }

    const order = await response.json();
    const wpBaseUrl = WC_API_URL.replace(/\/wp-json\/wc\/v3\/?$/, "");
    const paymentUrl =
      validatedData.paymentMethod === "cod"
        ? null
        : order.payment_url ||
          order.checkout_payment_url ||
          (order.order_key
            ? `${wpBaseUrl}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${encodeURIComponent(order.order_key)}`
            : null);

    if (validatedData.paymentMethod !== "cod" && !paymentUrl) {
      return NextResponse.json(
        { error: "Payment link could not be generated" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number,
      total: order.total,
      status: order.status,
      paymentRequired: validatedData.paymentMethod !== "cod",
      paymentUrl,
      calculation: {
        subtotal: calculation.originalSubtotal,
        tierDiscount: calculation.tierDiscount,
        prepaidDiscount: calculation.prepaidDiscount,
        manualCouponDiscount: calculation.manualCouponDiscount,
        shipping: calculation.shippingCost,
        codFee: calculation.codFee,
        finalTotal: calculation.finalTotal,
        savingsBreakdown: calculation.savingsBreakdown,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
