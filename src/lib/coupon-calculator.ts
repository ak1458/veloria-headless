import { 
  Coupon, 
  DiscountCalculation, 
  CartCoupon,
  PREPAID_BONUS_PERCENT,
  COD_FEE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST 
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

export function calculateDiscounts(input: CalculationInput): DiscountCalculation {
  const { items, appliedCouponCodes, isPrepaid, luckyDrawDiscount } = input;
  
  const originalSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  let prepaidDiscountAmount = 0;
  if (isPrepaid) {
    prepaidDiscountAmount = Math.round((originalSubtotal * PREPAID_BONUS_PERCENT) / 100);
  }
  
  let manualCouponDiscountAmount = 0;
  const appliedCoupons: CartCoupon[] = [];

  for (const code of appliedCouponCodes) {
    let coupon = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
    
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

    if (!coupon || !coupon.isActive) continue;
    
    if (coupon.minPurchase && originalSubtotal < coupon.minPurchase) continue;
    if (coupon.minQuantity && itemCount < coupon.minQuantity) continue;
    
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((originalSubtotal * coupon.amount) / 100);
    } else if (coupon.type === "fixed_cart") {
      discountAmount = coupon.amount;
    }
    
    discountAmount = Math.min(discountAmount, originalSubtotal);
    manualCouponDiscountAmount += discountAmount;
    
    appliedCoupons.push({
      coupon,
      discountAmount,
      appliedTo: "subtotal"
    });
  }

  const subtotalAfterDiscounts = originalSubtotal - prepaidDiscountAmount - manualCouponDiscountAmount;
  const shippingCost = subtotalAfterDiscounts >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST;
  const codFee = !isPrepaid ? COD_FEE : 0;
  
  const finalTotal = subtotalAfterDiscounts + shippingCost + codFee;

  const savingsBreakdown: { label: string; amount: number }[] = [];
  if (prepaidDiscountAmount > 0) {
    savingsBreakdown.push({ label: `Prepaid Discount (${PREPAID_BONUS_PERCENT}%)`, amount: prepaidDiscountAmount });
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
  luckyDrawDiscount?: number
): { valid: boolean; coupon?: Coupon; error?: string } {

  let coupon = AVAILABLE_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
  
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
  
  if (!coupon) {
    if (code.toUpperCase() === "LUCKYDRAW") {
      return { valid: false, error: "Lucky Draw coupon is invalid or expired. Please spin the wheel." };
    }
    return { valid: false, error: "Invalid coupon code" };
  }

  if (!coupon.isActive) {
    return { valid: false, error: "This coupon is not active" };
  }
  
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return { valid: false, error: `Minimum purchase of ₹${coupon.minPurchase} required` };
  }
  
  if (coupon.minQuantity && itemCount < coupon.minQuantity) {
    return { valid: false, error: `Minimum of ${coupon.minQuantity} items required for this coupon` };
  }
  
  return { valid: true, coupon };
}

