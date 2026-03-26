import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCustomerByEmail } from "@/lib/woocommerce-customer";
import { generateToken } from "@/lib/auth/jwt";
import { RateLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const WP_API_URL = process.env.WC_API_URL?.replace("/wc/v3", "");

// Allow 5 login attempts per 15 minutes per IP
const loginLimiter = new RateLimiter(5, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limitResult = loginLimiter.check(ip);
    if (!limitResult.success) {
      return NextResponse.json({ success: false, error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Step 1: Verify password with WordPress JWT endpoint
    const jwtResponse = await fetch(`${WP_API_URL}/jwt-auth/v1/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: validatedData.email,
        password: validatedData.password,
      }),
    });

    if (!jwtResponse.ok) {
      const errorData = await jwtResponse.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, error: errorData.message || "Invalid email or password" },
        { status: 401 }
      );
    }

    await jwtResponse.json();

    // Step 2: Get customer details from WooCommerce
    const customer = await getCustomerByEmail(validatedData.email);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Customer account not found" },
        { status: 404 }
      );
    }

    // Step 3: Generate our own JWT token
    const token = generateToken({
      userId: customer.id,
      email: customer.email,
      displayName: `${customer.first_name} ${customer.last_name}`.trim(),
    });

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

    // Set HTTP-only cookie
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

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
