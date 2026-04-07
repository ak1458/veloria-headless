import { NextRequest, NextResponse } from "next/server";
import { uploadCustomerReviewMedia } from "@/lib/reviews";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productId = Number(formData.get("productId"));
    const file = formData.get("file") as File | null;

    if (!Number.isFinite(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 },
      );
    }

    const result = await uploadCustomerReviewMedia({
      productId,
      file,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading review media:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload image",
      },
      { status: 500 },
    );
  }
}
