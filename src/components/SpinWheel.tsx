"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCouponStore } from "@/store/cart-coupon";
import { useCartStore } from "@/store/cart";
import { Gift, X } from "lucide-react";

const SEGMENTS = [
  { discount: 5,  color: "#ff6b6b", label: "5% OFF" },
  { discount: 10, color: "#4ecdc4", label: "10% OFF" },
  { discount: 15, color: "#45b7d1", label: "15% OFF" },
  { discount: 20, color: "#f9ca24", label: "20% OFF" },
  { discount: 30, color: "#6c5ce7", label: "30% OFF" },
  { discount: 50, color: "#ff9f43", label: "50% OFF" },
];

export function SpinWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(true); // default true until we check
  const [wonDiscount, setWonDiscount] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  
  const addCoupon = useCouponStore((state) => state.addCoupon);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    // Check if they already spun
    fetch("/api/lucky-draw/status")
      .then(res => res.json())
      .then(data => {
        setHasSpun(data.hasSpun);
        if (data.hasSpun && data.discount) {
          setWonDiscount(data.discount);
        } else if (!data.hasSpun) {
          // Show widget after brief delay if they haven't spun
          setTimeout(() => setIsOpen(true), 3000);
        }
      })
      .catch(console.error);
  }, []);

  const spin = async () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);

    try {
      const res = await fetch("/api/lucky-draw/spin", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const discountResult = data.discount;
        const targetIndex = SEGMENTS.findIndex(s => s.discount === discountResult);
        
        if (targetIndex === -1) {
          throw new Error("Invalid discount returned");
        }

        const segmentAngle = 360 / SEGMENTS.length;
        const targetSegmentCenter = (targetIndex * segmentAngle) + (segmentAngle / 2);
        const variance = Math.floor(Math.random() * (segmentAngle - 10)) - (segmentAngle / 2 - 5);
        const targetRotation = 360 * 5 + (360 - targetSegmentCenter) + variance;

        setRotation(targetRotation);

        setTimeout(async () => {
          setIsSpinning(false);
          setHasSpun(true);
          setWonDiscount(discountResult);
          setIsApplyingDiscount(true);
          const result = await addCoupon("LUCKYDRAW", items);
          setIsApplyingDiscount(false);

          if (!result.success && result.error) {
            alert(`You won ${discountResult}% off. ${result.error}`);
          }
        }, 5100);

      } else {
        alert(data.error || "Failed to spin!");
        setIsSpinning(false);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
      setIsSpinning(false);
    }
  };

  // If already spun and widget closed, don't show the floating button
  if (hasSpun && !isOpen) return null;

  return (
    <>
      {/* Floating Action Button to open Wheel if they closed it before spinning */}
      {!isOpen && !hasSpun && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 lg:left-8 lg:right-auto z-50 bg-[#c3a378] text-white p-4 px-6 rounded-full shadow-2xl hover:bg-[#a68862] transition-colors flex items-center gap-2 font-medium"
        >
          <Gift size={24} />
          <span className="hidden sm:inline">Want an extra discount? Spin the wheel!</span>
        </button>
      )}

      {/* The Wheel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1c1c1c] text-[#f4ecd8] p-8 rounded-3xl shadow-3xl max-w-md w-full relative border border-[#c3a378]/20"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-light mb-2 text-[#c3a378]">Lucky Draw</h2>
                {wonDiscount ? (
                  <p className="text-gray-300">Congratulations! Your discount is now available for this cart.</p>
                ) : (
                  <p className="text-gray-300">Want an extra discount? Spin the wheel to get up to 50% off!</p>
                )}
              </div>

              {!wonDiscount ? (
                <div className="relative flex justify-center items-center py-4">
                  {/* Wheel Pointer */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[10px] z-10 text-[#c3a378] drop-shadow-md">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L22 20H2L12 2Z" className="rotate-180 origin-center" />
                    </svg>
                  </div>

                  {/* The Wheel itself */}
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-[#c3a378] shadow-[0_0_30px_rgba(195,163,120,0.3)] overflow-hidden bg-[#2a2a2a]">
                    <motion.div
                      className="w-full h-full relative"
                      animate={{ rotate: rotation }}
                      transition={{ duration: 5, type: "tween", ease: [0.2, 0.8, 0.2, 1] }}
                      style={{
                        background: `conic-gradient(
                          ${SEGMENTS[0].color} 0deg 60deg,
                          ${SEGMENTS[1].color} 60deg 120deg,
                          ${SEGMENTS[2].color} 120deg 180deg,
                          ${SEGMENTS[3].color} 180deg 240deg,
                          ${SEGMENTS[4].color} 240deg 300deg,
                          ${SEGMENTS[5].color} 300deg 360deg
                        )`,
                      }}
                    >
                      {/* Segment Labels */}
                      {SEGMENTS.map((segment, i) => {
                        const angle = i * 60 + 30; // center of the segment
                        return (
                          <div
                            key={i}
                            className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg sm:text-xl drop-shadow-md"
                            style={{
                              transform: `rotate(${angle}deg) translateY(-35%)`,
                              transformOrigin: "center",
                            }}
                          >
                            <span className="rotate-90 origin-center tracking-wider">{segment.label}</span>
                          </div>
                        );
                      })}
                      
                      {/* Inner gold circle for premium look */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#1c1c1c] rounded-full border-4 border-[#c3a378] shadow-inner z-20 flex items-center justify-center">
                        <Gift size={20} className="text-[#c3a378]" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#2a2a2a] rounded-2xl p-6 text-center border border-[#c3a378]/30 mb-6"
                >
                  <div className="text-5xl font-bold text-[#c3a378] mb-2">{wonDiscount}% OFF</div>
                  <p className="text-gray-300 text-sm">
                    {isApplyingDiscount
                      ? "Applying your reward to this cart..."
                      : "Your exclusive discount is now locked to this cart."}
                  </p>
                </motion.div>
              )}

              <div className="mt-8 text-center">
                {!wonDiscount ? (
                  <button
                    onClick={spin}
                    disabled={isSpinning || hasSpun}
                    className="w-full bg-[#c3a378] text-[#1c1c1c] py-4 rounded-xl font-bold text-lg hover:bg-[#a68862] focus:ring-4 focus:ring-[#c3a378]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSpinning ? "Spinning..." : "SPIN NOW"}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-[#c3a378] text-[#1c1c1c] py-4 rounded-xl font-bold text-lg hover:bg-[#a68862] transition-colors"
                  >
                    CONTINUE SHOPPING
                  </button>
                )}
                <p className="mt-4 text-xs text-gray-500">
                  *Offer tied to this browser session. Valid for one-time use only. Cannot be shared.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
