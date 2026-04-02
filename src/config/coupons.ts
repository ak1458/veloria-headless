import { Coupon } from "@/types/coupon";

/**
 * ============================================================
 * VELORIA VAULT - COUPON CONFIGURATION
 * ============================================================
 * 
 * HOW TO ADD A NEW COUPON:
 * 
 * 1. Copy one of the examples below
 * 2. Change the code, amount, and description
 * 3. Deploy to Vercel
 * 
 * COUPON TYPES:
 * - "percentage"  → Discount as % of subtotal (e.g., 15 = 15% off)
 * - "fixed_cart"  → Fixed ₹ amount off (e.g., 200 = ₹200 off)
 * 
 * OPTIONAL FIELDS:
 * - minQuantity   → Min items in cart (default: none)
 * - minPurchase   → Min ₹ amount in cart (default: none)
 * - maxDiscount   → Cap discount at ₹X (default: none)
 * - expiryDate    → "2026-12-31" format (default: never expires)
 * - usageLimit    → Max uses allowed (default: unlimited)
 * 
 * AFFILIATE COUPONS:
 * - Just add a new entry with the affiliate's unique code
 * - They share the code, customer gets discount, you track usage
 * ============================================================
 */

export const AVAILABLE_COUPONS: Coupon[] = [
  // ─────────────────────────────────────────────
  // STANDARD COUPONS (Always active)
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // AFFILIATE / INFLUENCER COUPONS
  // (Give each affiliate their own unique code)
  // ─────────────────────────────────────────────
  // Example: 
  // {
  //   id: "affiliate-priya",
  //   code: "PRIYA10",
  //   type: "percentage",
  //   amount: 10,
  //   description: "Priya's Exclusive - 10% Off",
  //   isActive: true,
  //   isAutomatic: false,
  //   usageCount: 0,
  // },

  // ─────────────────────────────────────────────
  // SEASONAL / CAMPAIGN COUPONS
  // (Set expiry dates for limited-time offers)
  // ─────────────────────────────────────────────
  // Example:
  // {
  //   id: "campaign-summer26",
  //   code: "SUMMER26",
  //   type: "percentage",
  //   amount: 25,
  //   description: "Summer Sale - 25% Off",
  //   expiryDate: "2026-06-30",
  //   isActive: true,
  //   isAutomatic: false,
  //   usageCount: 0,
  // },

  // ─────────────────────────────────────────────
  // FIXED AMOUNT COUPONS
  // (Flat ₹ off instead of percentage)
  // ─────────────────────────────────────────────
  // Example:
  // {
  //   id: "fixed-save500",
  //   code: "SAVE500",
  //   type: "fixed_cart",
  //   amount: 500,
  //   description: "₹500 Off on orders above ₹3000",
  //   minPurchase: 3000,
  //   isActive: true,
  //   isAutomatic: false,
  //   usageCount: 0,
  // },

  // ─────────────────────────────────────────────
  // CAPPED PERCENTAGE COUPONS
  // (Percentage off but capped at max ₹ amount)
  // ─────────────────────────────────────────────
  // Example:
  // {
  //   id: "capped-mega30",
  //   code: "MEGA30",
  //   type: "percentage",
  //   amount: 30,
  //   maxDiscount: 1000,
  //   description: "30% Off (max ₹1000)",
  //   isActive: true,
  //   isAutomatic: false,
  //   usageCount: 0,
  // },

  // ====== ADD YOUR COUPONS ABOVE THIS LINE ======
];
