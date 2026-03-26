import { NextResponse } from "next/server";
import { getInstagramFeed } from "@/lib/instagram";

export const revalidate = 900;

export async function GET() {
  const posts = await getInstagramFeed();

  return NextResponse.json({
    success: posts.length > 0,
    posts,
  });
}
