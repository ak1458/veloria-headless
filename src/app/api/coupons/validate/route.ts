import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupon-calculator";
import { z } from "zod";
import jwt from "jsonwebtoken";

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
  itemCount: z.number().min(1).default(1),
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback-super-secret-key-for-dev";

// GET /api/coupons/validate - Validate a single coupon
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const body = {
      code: searchParams.get("code"),
      subtotal: parseFloat(searchParams.get("subtotal") || "0"),
      itemCount: parseInt(searchParams.get("itemCount") || "1", 10),
    };

    const validatedData = validateSchema.parse(body);
    const { code, subtotal, itemCount } = validatedData;
    
    // Check for HttpOnly Lucky Draw Token
    const token = request.cookies.get("veloria_lucky_draw")?.value;
    let luckyDrawDiscount: number | undefined;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { discount: number };
        luckyDrawDiscount = decoded.discount;
      } catch (err) {
        // Token invalid or expired
      }
    }
    
    const result = validateCoupon(code, subtotal, itemCount, luckyDrawDiscount);
    
    return NextResponse.json({
      success: result.valid,
      coupon: result.coupon,
      error: result.error,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }
    
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
