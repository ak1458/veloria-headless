import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-super-secret-key-for-dev";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("veloria_lucky_draw")?.value;
  
  if (!token) {
    return NextResponse.json({ hasSpun: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { discount: number };
    return NextResponse.json({ hasSpun: true, discount: decoded.discount });
  } catch {
    return NextResponse.json({ hasSpun: false });
  }
}
