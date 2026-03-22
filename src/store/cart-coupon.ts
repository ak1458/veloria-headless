import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "./cart";
import { DiscountCalculation } from "@/types/coupon";

interface CouponState {
  appliedCouponCodes: string[];
  calculation: DiscountCalculation | null;
  isPrepaid: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addCoupon: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: (code: string) => void;
  clearCoupons: () => void;
  setIsPrepaid: (isPrepaid: boolean) => void;
  calculateDiscounts: (items: CartItem[]) => Promise<void>;
  validateCoupon: (code: string, subtotal: number, itemCount: number) => Promise<{ valid: boolean; error?: string }>;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      appliedCouponCodes: [],
      calculation: null,
      isPrepaid: true,
      isLoading: false,
      error: null,

      addCoupon: async (code: string) => {
        const { appliedCouponCodes, calculation } = get();
        
        // Check if already applied
        if (appliedCouponCodes.includes(code.toUpperCase())) {
          return { success: false, error: "Coupon already applied" };
        }

        // Validate coupon
        const subtotal = calculation?.originalSubtotal || 0;
        const itemCount = calculation?.itemCount || 1; // Default to 1 if not available, though in cart it should be
        const validation = await get().validateCoupon(code, subtotal, itemCount);
        
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }

        // Add coupon
        set({ 
          appliedCouponCodes: [...appliedCouponCodes, code.toUpperCase()],
          error: null,
        });

        return { success: true };
      },

      removeCoupon: (code: string) => {
        const { appliedCouponCodes } = get();
        set({
          appliedCouponCodes: appliedCouponCodes.filter((c) => c !== code.toUpperCase()),
        });
      },

      clearCoupons: () => {
        set({ appliedCouponCodes: [], calculation: null });
      },

      setIsPrepaid: (isPrepaid: boolean) => {
        set({ isPrepaid });
      },

      calculateDiscounts: async (items: CartItem[]) => {
        if (items.length === 0) {
          set({ calculation: null });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const { appliedCouponCodes, isPrepaid } = get();

          const response = await fetch("/api/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
              })),
              appliedCouponCodes,
              isPrepaid,
            }),
          });

          const data = await response.json();

          if (data.success) {
            set({ calculation: data.calculation });
          } else {
            set({ error: data.error || "Failed to calculate discounts" });
          }
        } catch (err) {
          set({ error: "Network error" });
        } finally {
          set({ isLoading: false });
        }
      },

      validateCoupon: async (code: string, subtotal: number, itemCount: number) => {
        try {
          const response = await fetch(
            `/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}&itemCount=${itemCount}`
          );
          const data = await response.json();
          return { valid: data.success, error: data.error };
        } catch {
          return { valid: false, error: "Failed to validate coupon" };
        }
      },
    }),
    {
      name: "veloria-coupons",
      partialize: (state) => ({ 
        appliedCouponCodes: state.appliedCouponCodes,
        isPrepaid: state.isPrepaid,
      }),
    }
  )
);
