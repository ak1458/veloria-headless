import { Coupon } from "@/types/coupon";

/**
 * VELORIA VAULT - COUPON CONFIGURATION
 * 
 * To add a new coupon, just add a new object to the list below.
 * No need to change complex logic!
 */

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    id: "coupon-flat15",
    code: "FLAT15",
    type: "percentage",
    amount: 15,
    description: "15% Off - No minimum items",
    minQuantity: 1,
    isActive: true,
    isAutomatic: false,
    usageCount: 0,
  },
  {
    id: "coupon-flat20",
    code: "FLAT20",
    type: "percentage",
    amount: 20,
    description: "20% Off - Min 2 items required",
    minQuantity: 2,
    isActive: true,
    isAutomatic: false,
    usageCount: 0,
  },
  // ADD NEW COUPONS BELOW THIS LINE
  // Example: { id: "c3", code: "SAVE50", type: "fixed_cart", amount: 50, isActive: true, isAutomatic: false, usageCount: 0 },
];
