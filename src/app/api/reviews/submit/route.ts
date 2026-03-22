import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth/jwt";

const reviewSchema = z.object({
  productId: z.number().min(1, "Product ID is required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  review: z.string().min(5, "Review must be at least 5 characters").max(2000, "Review is too long"),
  reviewer: z.string().min(1, "Name is required"),
  reviewerEmail: z.string().email("Valid email is required"),
});

const WC_API_URL = process.env.WC_API_URL;
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

function getAuthHeader(): string {
  return "Basic " + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional - allow guest reviews or require login)
    const token = request.cookies.get("token")?.value;
    let userId: number | undefined;

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    // Parse multipart form data for image support
    const formData = await request.formData();
    
    const productId = parseInt(formData.get("productId") as string);
    const rating = parseInt(formData.get("rating") as string);
    const reviewText = formData.get("review") as string;
    const reviewer = formData.get("reviewer") as string;
    const reviewerEmail = formData.get("reviewerEmail") as string;
    
    // Get image files
    const images: File[] = [];
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image${i}`) as File | null;
      if (file && file.size > 0) {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            { success: false, error: `Invalid file type for image${i}. Only JPG, PNG, and WebP are allowed.` },
            { status: 400 }
          );
        }
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: `File size exceeds 2MB limit for image${i}.` },
            { status: 400 }
          );
        }
        images.push(file);
      }
    }

    // Validate data
    const validatedData = reviewSchema.parse({
      productId,
      rating,
      review: reviewText,
      reviewer,
      reviewerEmail,
    });

    if (!WC_API_URL || !CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Upload images to WordPress media library first
    const imageUrls: string[] = [];
    
    for (const image of images) {
      try {
        const uploadUrl = `${WC_API_URL.replace("/wc/v3", "")}/wp/v2/media`;
        
        // Convert File to Buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": image.type,
            "Content-Disposition": `attachment; filename="${image.name}"`,
          },
          body: buffer,
        });

        if (uploadResponse.ok) {
          const mediaData = await uploadResponse.json();
          imageUrls.push(mediaData.source_url);
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        // Continue without the image
      }
    }

    // Create the review in WooCommerce
    const reviewData: any = {
      product_id: validatedData.productId,
      review: validatedData.review,
      reviewer: validatedData.reviewer,
      reviewer_email: validatedData.reviewerEmail,
      rating: validatedData.rating,
      verified: false, // Safely do not auto-verify unless cross-referenced with WC orders
    };

    // Add image URLs to review metadata if any were uploaded
    if (imageUrls.length > 0) {
      reviewData.meta_data = [
        {
          key: "review_images",
          value: JSON.stringify(imageUrls),
        },
      ];
    }

    const response = await fetch(`${WC_API_URL}/products/reviews`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("WooCommerce review creation error:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to submit review", details: errorData },
        { status: 500 }
      );
    }

    const review = await response.json();

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        review: review.review,
        reviewer: review.reviewer,
        dateCreated: review.date_created,
        images: imageUrls,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Review submission error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
