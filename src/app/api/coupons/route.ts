import { NextRequest, NextResponse } from "next/server";
import { calculateDiscounts } from "@/lib/coupon-calculator";
import { getProductsByIds } from "@/lib/woocommerce";
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

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}

// POST /api/coupons/calculate - Calculate discounts for cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = calculateSchema.parse(body);
    const productIds = validatedData.items.map((item) => item.id);
    const realProducts = await getProductsByIds(productIds);
    
    // Securely extract Lucky Draw token from HttpOnly cookie
    const token = request.cookies.get("veloria_lucky_draw")?.value;
    let luckyDrawDiscount: number | undefined;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { discount: number };
        luckyDrawDiscount = decoded.discount;
      } catch {
        // Invalid or expired token: ignore and luckyDrawDiscount remains undefined
      }
    }

    const calculation = calculateDiscounts({
      items: validatedData.items.map((item) => {
        const realProduct = realProducts.find((product) => product.id === item.id);

        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(realProduct?.price || realProduct?.regular_price || String(item.price || 0)),
          slug: "",
          image: "",
          category: "",
        };
      }),
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


