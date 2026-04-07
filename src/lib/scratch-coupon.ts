import jwt from "jsonwebtoken";
import type { NextRequest, NextResponse } from "next/server";

export const SCRATCH_COOKIE_NAME = "veloria_lucky_draw";
export const SCRATCH_COUPON_CODE = "SCRATCHCARD";
export const SCRATCH_COUPON_ALIASES = [SCRATCH_COUPON_CODE, "LUCKYDRAW"];
export const SCRATCH_VISUAL_REVEALS = [20, 25, 30, 40, 50];
export const SCRATCH_DURATION_SECONDS = 30 * 24 * 60 * 60;

export const SCRATCH_DISCOUNT_OPTIONS = [
  { discount: 5, weight: 50 },
  { discount: 10, weight: 40 },
  { discount: 15, weight: 10 },
] as const;

export interface ScratchCouponPayload {
  discount: number;
  displayDiscount?: number;
  timestamp: number;
}

export function isScratchCouponCode(code: string) {
  return SCRATCH_COUPON_ALIASES.includes(code.trim().toUpperCase());
}

export function normalizeScratchCouponCode(code: string) {
  return isScratchCouponCode(code) ? SCRATCH_COUPON_CODE : code.trim().toUpperCase();
}

export function pickWeightedScratchDiscount() {
  const totalWeight = SCRATCH_DISCOUNT_OPTIONS.reduce(
    (sum, option) => sum + option.weight,
    0,
  );

  let random = Math.floor(Math.random() * totalWeight);

  for (const option of SCRATCH_DISCOUNT_OPTIONS) {
    if (random < option.weight) {
      return option.discount;
    }

    random -= option.weight;
  }

  return 5;
}

export function pickVisualScratchReveal(realDiscount: number) {
  if (realDiscount >= 15) {
    return 50;
  }

  if (realDiscount >= 10) {
    return SCRATCH_VISUAL_REVEALS[Math.floor(Math.random() * 2) + 2];
  }

  return SCRATCH_VISUAL_REVEALS[Math.floor(Math.random() * 3)];
}

export function readScratchCouponToken(
  request: Pick<NextRequest, "cookies">,
  secret: string,
) {
  const token = request.cookies.get(SCRATCH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, secret) as ScratchCouponPayload;
  } catch {
    return null;
  }
}

export function setScratchCouponCookie(
  response: NextResponse,
  payload: ScratchCouponPayload,
  secret: string,
) {
  const token = jwt.sign(payload, secret, { expiresIn: `${SCRATCH_DURATION_SECONDS}s` });

  response.cookies.set(SCRATCH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SCRATCH_DURATION_SECONDS,
  });
}
