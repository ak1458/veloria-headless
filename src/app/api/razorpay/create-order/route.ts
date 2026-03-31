/**
 * Secure Razorpay Order Creation
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  amount: z.number().positive(),
  orderId: z.string(),
  orderNumber: z.string(),
  customerDetails: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const RAZORPAY_KEY_ID = (process.env.RAZORPAY_KEY_ID || "").trim();
    const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const safeReceipt = validated.orderNumber.substring(0, 40);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(validated.amount * 100),
        currency: "INR",
        receipt: safeReceipt,
        notes: {
          order_id: validated.orderId.substring(0, 250),
          customer_email: validated.customerDetails.email.substring(0, 250),
          customer_name: validated.customerDetails.name.substring(0, 250),
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Razorpay error", details: errorData },
        { status: 500 }
      );
    }

    const razorpayOrder = await response.json();

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY_ID,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Payment service timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 30;
