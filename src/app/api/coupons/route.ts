import { NextRequest, NextResponse } from "next/server";
import { calculateDiscounts, validateCoupon } from "@/lib/coupon-calculator";
import { z } from "zod";
import jwt from "jsonwebtoken";

const calculateSchema = z.object({
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
  })),
  appliedCouponCodes: z.array(z.string()).default([]),
  isPrepaid: z.boolean().default(true),
});

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
  itemCount: z.number().min(1).default(1),
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback-super-secret-key-for-dev";

// POST /api/coupons/calculate - Calculate discounts for cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculateSchema.parse(body);
    
    // Securely extract Lucky Draw token from HttpOnly cookie
    const token = request.cookies.get("veloria_lucky_draw")?.value;
    let luckyDrawDiscount: number | undefined;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { discount: number };
        luckyDrawDiscount = decoded.discount;
      } catch (err) {
        // Invalid or expired token: ignore and luckyDrawDiscount remains undefined
      }
    }

    const calculation = calculateDiscounts({
      items: validatedData.items.map(item => ({
        ...item,
        slug: "",
        image: "",
        category: "",
      })),
      appliedCouponCodes: validatedData.appliedCouponCodes,
      isPrepaid: validatedData.isPrepaid,
      luckyDrawDiscount,
    });
    
    return NextResponse.json({
      success: true,
      calculation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    
    console.error("Coupon calculation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate discounts" },
      { status: 500 }
    );
  }
}


