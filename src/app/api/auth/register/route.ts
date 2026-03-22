import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createWCCustomer, getCustomerByEmail } from "@/lib/woocommerce-customer";
import { generateToken } from "@/lib/auth/jwt";
import { RateLimiter } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  billing: z.object({
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
  }).optional(),
});

// Allow 3 registration attempts per hour per IP
const registerLimiter = new RateLimiter(3, 60 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limitResult = registerLimiter.check(ip);
    if (!limitResult.success) {
      return NextResponse.json({ success: false, error: "Too many registration attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if customer already exists
    const existingCustomer = await getCustomerByEmail(validatedData.email);
    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create customer in WooCommerce
    const customer = await createWCCustomer(validatedData);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      displayName: `${customer.first_name} ${customer.last_name}`.trim(),
    });

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        displayName: `${customer.first_name} ${customer.last_name}`.trim(),
        billing: customer.billing,
        shipping: customer.shipping,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
