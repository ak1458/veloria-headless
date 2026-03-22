export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed_cart" | "fixed_product" | "tiered" | "prepaid_bonus";
  amount: number;
  description: string;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  expiryDate?: string;
  isActive: boolean;
  excludeSaleItems?: boolean;
  productIds?: number[];
  excludedProductIds?: number[];
  categoryIds?: number[];
  excludedCategoryIds?: number[];
  // Tiered discount specific
  // Tiered discount specific (deprecated, now using manual coupons)
  tiers?: {
    minQuantity: number;
    discountPercent: number;
    bonusPrepaidDiscount?: number;
  }[];
  // Minimum quantity required in cart for this coupon to apply
  minQuantity?: number;
  // For automatic coupons (like tiered discounts)
  isAutomatic: boolean;
}

export interface CartCoupon {
  coupon: Coupon;
  discountAmount: number;
  appliedTo: "subtotal" | "shipping" | "total";
}

export interface DiscountCalculation {
  originalSubtotal: number;
  itemCount: number;
  isPrepaid: boolean;
  appliedCoupons: CartCoupon[];
  tierDiscount: number;
  prepaidDiscount: number;
  manualCouponDiscount: number;
  codFee: number;
  shippingCost: number;
  finalTotal: number;
  savingsBreakdown: {
    label: string;
    amount: number;
  }[];
}

export const PREPAID_BONUS_PERCENT = 5;

export const COD_FEE = 149;
export const FREE_SHIPPING_THRESHOLD = 3000;
export const STANDARD_SHIPPING_COST = 150;
