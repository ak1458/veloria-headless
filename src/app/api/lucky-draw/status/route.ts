import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// JWT_SECRET validated at request time

export async function GET(request: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return NextResponse.json({ hasSpun: false, error: "Server config error" }, { status: 500 });
  }

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
