import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-super-secret-key-for-dev";

const OPTIONS = [
  { discount: 5, weight: 400 },   // 40% chance
  { discount: 10, weight: 300 },  // 30% chance
  { discount: 15, weight: 150 },  // 15% chance
  { discount: 20, weight: 100 },  // 10% chance
  { discount: 30, weight: 40 },   // 4% chance
  { discount: 50, weight: 10 },   // 1% chance
];

function getRandomDiscount() {
  const totalWeight = OPTIONS.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);
  for (const opt of OPTIONS) {
    if (random < opt.weight) return opt.discount;
    random -= opt.weight;
  }
  return 5;
}

export async function POST(request: NextRequest) {
  // Check if already spun
  const token = request.cookies.get("veloria_lucky_draw")?.value;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      // Valid token exists, user has already spun
      return NextResponse.json({ success: false, error: "You have already spun the wheel!" }, { status: 403 });
    } catch {
      // Invalid or expired token, let them spin
    }
  }

  // Calculate random outcome
  const discount = getRandomDiscount();
  
  // Sign JWT
  const payload = {
    discount,
    timestamp: Date.now()
  };
  
  const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  
  const response = NextResponse.json({ success: true, discount });
  
  // Set HttpOnly cookie
  response.cookies.set("veloria_lucky_draw", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  });
  
  return response;
}
