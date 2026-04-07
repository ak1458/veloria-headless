import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProductById } from "@/lib/woocommerce";
import { getProductReviewBundle, submitCustomerReview } from "@/lib/reviews";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const reviewSubmissionSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(10).max(5000),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  mediaTokens: z
    .array(
      z.object({
        id: z.number().int().positive(),
        key: z.string().min(1),
      }),
    )
    .max(5)
    .default([]),
  website: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const productId = Number(request.nextUrl.searchParams.get("product"));

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const bundle = await getProductReviewBundle(product);
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("Error fetching review bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = `review-submit:${getClientIp(request)}`;
    const limitResult = rateLimit(
      identifier,
      4,
      RATE_LIMITS.API.windowMs * 10,
    );

    if (!limitResult.success) {
      return NextResponse.json(
        { error: limitResult.message || "Too many review attempts." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsedBody = reviewSubmissionSchema.parse(body);

    if (parsedBody.website?.trim()) {
      return NextResponse.json(
        { error: "Review submission blocked." },
        { status: 400 },
      );
    }

    const result = await submitCustomerReview({
      productId: parsedBody.productId,
      rating: parsedBody.rating,
      review: parsedBody.review,
      name: parsedBody.name,
      email: parsedBody.email,
      mediaTokens: parsedBody.mediaTokens,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid review submission", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error submitting review:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit review",
      },
      { status: 500 },
    );
  }
}
