import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteCustomerReviewMedia,
  uploadCustomerReviewMedia,
} from "@/lib/reviews";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const deleteMediaSchema = z.object({
  id: z.number().int().positive(),
  key: z.string().min(1),
});

const ALLOWED_REVIEW_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/mpeg",
  "video/ogg",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

const MAX_REVIEW_MEDIA_SIZE = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const identifier = `review-media:${getClientIp(request)}`;
    const limitResult = rateLimit(identifier, 10, 5 * 60 * 1000);

    if (!limitResult.success) {
      return NextResponse.json(
        { error: limitResult.message || "Too many upload attempts." },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const productId = Number(formData.get("productId"));

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A review image is required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 },
      );
    }

    if (!ALLOWED_REVIEW_MEDIA_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only approved image or video formats can be uploaded." },
        { status: 400 },
      );
    }

    if (file.size > MAX_REVIEW_MEDIA_SIZE) {
      return NextResponse.json(
        { error: "Each upload must be 25 MB or smaller." },
        { status: 400 },
      );
    }

    const upload = await uploadCustomerReviewMedia({ productId, file });
    return NextResponse.json(upload);
  } catch (error) {
    console.error("Error uploading review media:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Media upload failed.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const parsedBody = deleteMediaSchema.parse(await request.json());
    await deleteCustomerReviewMedia(parsedBody);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid uploaded image token.", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error deleting review media:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not remove upload.",
      },
      { status: 500 },
    );
  }
}
