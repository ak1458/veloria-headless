import {
  Coupon,
  DiscountCalculation,
  CartCoupon,
  PREPAID_BONUS_PERCENT,
  COD_FEE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST,
} from "@/types/coupon";
import { CartItem } from "@/store/cart";
import { AVAILABLE_COUPONS } from "@/config/coupons";

export interface CalculationInput {
  items: CartItem[];
  appliedCouponCodes: string[];
  isPrepaid: boolean;
  customerId?: number;
  luckyDrawDiscount?: number;
}

function getCouponByCode(code: string, luckyDrawDiscount?: number): Coupon | null {
  let coupon = AVAILABLE_COUPONS.find((item) => item.code.toUpperCase() === code.toUpperCase());

  if (!coupon && code.toUpperCase() === "LUCKYDRAW" && luckyDrawDiscount) {
    coupon = {
      id: "lucky-draw-dynamic",
      code: "LUCKYDRAW",
      type: "percentage",
      amount: luckyDrawDiscount,
      description: `Lucky Draw Winner - ${luckyDrawDiscount}% Off`,
      isActive: true,
      isAutomatic: false,
      usageCount: 0,
    };
  }

  return coupon ?? null;
}

function getCouponValidationError(
  coupon: Coupon,
  subtotal: number,
  itemCount: number,
): string | null {
  if (!coupon.isActive) {
    return "This coupon is not active";
  }

  if (coupon.expiryDate) {
    const expiry = new Date(coupon.expiryDate);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return "This coupon has expired";
    }
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return "This coupon has reached its usage limit";
  }

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return `Minimum purchase of ₹${coupon.minPurchase} required`;
  }

  if (coupon.minQuantity && itemCount < coupon.minQuantity) {
    return `Minimum of ${coupon.minQuantity} items required for this coupon`;
  }

  return null;
}

function calculateCouponAmount(coupon: Coupon, subtotal: number): number {
  let discountAmount = 0;

  if (coupon.type === "percentage") {
    discountAmount = Math.round((subtotal * coupon.amount) / 100);
  } else if (coupon.type === "fixed_cart") {
    discountAmount = coupon.amount;
  }

  if (coupon.maxDiscount) {
    discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  }

  return Math.min(discountAmount, subtotal);
}

function resolveBestCoupon(
  appliedCouponCodes: string[],
  subtotal: number,
  itemCount: number,
  luckyDrawDiscount?: number,
): CartCoupon[] {
  const uniqueCodes = Array.from(new Set(appliedCouponCodes.map((code) => code.toUpperCase())));
  const validCoupons = uniqueCodes
    .map((code) => getCouponByCode(code, luckyDrawDiscount))
    .filter((coupon): coupon is Coupon => Boolean(coupon))
    .map((coupon) => ({
      coupon,
      error: getCouponValidationError(coupon, subtotal, itemCount),
    }))
    .filter((entry) => !entry.error)
    .map(({ coupon }) => ({
      coupon,
      discountAmount: calculateCouponAmount(coupon, subtotal),
      appliedTo: "subtotal" as const,
    }))
    .filter((entry) => entry.discountAmount > 0)
    .sort((left, right) => right.discountAmount - left.discountAmount);

  return validCoupons.length > 0 ? [validCoupons[0]] : [];
}

export function calculateDiscounts(input: CalculationInput): DiscountCalculation {
  const { items, appliedCouponCodes, isPrepaid, luckyDrawDiscount } = input;

  const originalSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const prepaidDiscountAmount = isPrepaid
    ? Math.round((originalSubtotal * PREPAID_BONUS_PERCENT) / 100)
    : 0;

  const appliedCoupons = resolveBestCoupon(
    appliedCouponCodes,
    originalSubtotal,
    itemCount,
    luckyDrawDiscount,
  );
  const manualCouponDiscountAmount = appliedCoupons.reduce(
    (sum, item) => sum + item.discountAmount,
    0,
  );

  const subtotalAfterDiscounts = Math.max(
    0,
    originalSubtotal - prepaidDiscountAmount - manualCouponDiscountAmount,
  );
  const shippingCost = originalSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const codFee = !isPrepaid ? COD_FEE : 0;
  const finalTotal = Math.max(0, subtotalAfterDiscounts + shippingCost + codFee);

  const savingsBreakdown: { label: string; amount: number }[] = [];
  if (prepaidDiscountAmount > 0) {
    savingsBreakdown.push({
      label: `Prepaid Discount (${PREPAID_BONUS_PERCENT}%)`,
      amount: prepaidDiscountAmount,
    });
  }
  appliedCoupons.forEach(({ coupon, discountAmount }) => {
    savingsBreakdown.push({ label: `Coupon: ${coupon.code}`, amount: discountAmount });
  });

  return {
    originalSubtotal,
    itemCount,
    isPrepaid,
    tierDiscount: 0,
    prepaidDiscount: prepaidDiscountAmount,
    manualCouponDiscount: manualCouponDiscountAmount,
    appliedCoupons,
    codFee,
    shippingCost,
    finalTotal,
    savingsBreakdown,
  };
}

export function validateCoupon(
  code: string,
  subtotal: number,
  itemCount: number = 1,
  luckyDrawDiscount?: number,
): { valid: boolean; coupon?: Coupon; error?: string } {
  const coupon = getCouponByCode(code, luckyDrawDiscount);

  if (!coupon) {
    if (code.toUpperCase() === "LUCKYDRAW") {
      return {
        valid: false,
        error: "Lucky Draw coupon is invalid or expired. Please spin the wheel.",
      };
    }
    return { valid: false, error: "Invalid coupon code" };
  }

  const validationError = getCouponValidationError(coupon, subtotal, itemCount);
  if (validationError) {
    return { valid: false, error: validationError };
  }

  return { valid: true, coupon };
}
