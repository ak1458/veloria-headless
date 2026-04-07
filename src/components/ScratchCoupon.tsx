"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useCouponStore } from "@/store/cart-coupon";
import { useCartStore } from "@/store/cart";

const SCRATCH_CANVAS_SIZE = 280;
const SCRATCH_RADIUS = 22;
const REVEAL_THRESHOLD = 0.4; // 40% revealed to clear

export default function ScratchCoupon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasScratched, setHasScratched] = useState(true); // default true until checked
  const [isOpen, setIsOpen] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wonDiscount, setWonDiscount] = useState<number | null>(null);
  const [visualLabel, setVisualLabel] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const scratchedPixelsRef = useRef(0);
  const totalPixelsRef = useRef(SCRATCH_CANVAS_SIZE * SCRATCH_CANVAS_SIZE);
  const isDrawingRef = useRef(false);

  const addCoupon = useCouponStore((state) => state.addCoupon);
  const items = useCartStore((state) => state.items);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Gold scratch overlay
    const gradient = ctx.createLinearGradient(0, 0, SCRATCH_CANVAS_SIZE, SCRATCH_CANVAS_SIZE);
    gradient.addColorStop(0, "#c9a84c");
    gradient.addColorStop(0.3, "#e8d48b");
    gradient.addColorStop(0.5, "#d4b55a");
    gradient.addColorStop(0.7, "#e8d48b");
    gradient.addColorStop(1, "#c9a84c");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCRATCH_CANVAS_SIZE, SCRATCH_CANVAS_SIZE);

    // "SCRATCH HERE" text
    ctx.fillStyle = "#9e7e2e";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "✦ SCRATCH HERE ✦",
      SCRATCH_CANVAS_SIZE / 2,
      SCRATCH_CANVAS_SIZE / 2,
    );

    // Decorative dashes
    ctx.strokeStyle = "#9e7e2e";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(16, 16, SCRATCH_CANVAS_SIZE - 32, SCRATCH_CANVAS_SIZE - 32);
    ctx.setLineDash([]);

    scratchedPixelsRef.current = 0;
  }, []);

  const scratch = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || revealed) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) * (SCRATCH_CANVAS_SIZE / rect.width);
      const y = (clientY - rect.top) * (SCRATCH_CANVAS_SIZE / rect.height);

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Better progress check (actual pixel counting)
      // This is expensive, so we only do it on 5% of scratch moves
      if (Math.random() > 0.9) {
        const imageData = ctx.getImageData(0, 0, SCRATCH_CANVAS_SIZE, SCRATCH_CANVAS_SIZE);
        const pixels = imageData.data;
        let transparent = 0;
        for (let i = 3; i < pixels.length; i += 4) {
          if (pixels[i] === 0) transparent++;
        }
        const ratio = transparent / (SCRATCH_CANVAS_SIZE * SCRATCH_CANVAS_SIZE);
        if (ratio >= REVEAL_THRESHOLD && !revealed) {
          setRevealed(true);
          ctx.clearRect(0, 0, SCRATCH_CANVAS_SIZE, SCRATCH_CANVAS_SIZE);
        }
      }
    },
    [revealed],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDrawingRef.current = true;
      scratch(e.clientX, e.clientY);
    },
    [scratch],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawingRef.current) return;
      scratch(e.clientX, e.clientY);
    },
    [scratch],
  );

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const startScratch = useCallback(async () => {
    if (isScratching || hasScratched) return;
    setIsScratching(true);

    try {
      const res = await fetch("/api/lucky-draw/spin", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setWonDiscount(data.discount);
        setHasScratched(true);

        const visualOptions =
          data.discount >= 15
            ? ["50% OFF"]
            : data.discount >= 10
              ? ["30% OFF", "40% OFF"]
              : ["20% OFF", "25% OFF"];
        setVisualLabel(
          visualOptions[Math.floor(Math.random() * visualOptions.length)],
        );
      } else {
        setHasScratched(true);
        setRevealed(true);
      }
    } catch {
      setHasScratched(true);
    } finally {
      setIsScratching(false);
    }
  }, [isScratching, hasScratched]);

  // Handle auto-init when canvas is mounted
  useEffect(() => {
    if (isOpen && wonDiscount && !revealed) {
      setTimeout(initCanvas, 100);
    }
  }, [isOpen, wonDiscount, revealed, initCanvas]);

  // Listen for custom trigger event (e.g. from ProductOffers)
  useEffect(() => {
    const handleTrigger = () => {
      if (!hasScratched) {
        setIsOpen(true);
        startScratch();
      } else if (revealed && wonDiscount) {
        // If already scratched, just show the result
        setIsOpen(true);
      }
    };
    window.addEventListener("open-scratch-modal", handleTrigger);
    return () => window.removeEventListener("open-scratch-modal", handleTrigger);
  }, [startScratch, hasScratched, revealed, wonDiscount]);

  // Check initial status
  useEffect(() => {
    fetch("/api/lucky-draw/status")
      .then((res) => res.json())
      .then((data) => {
        setHasScratched(data.hasSpun === true);
        if (data.hasSpun && data.discount) {
          setWonDiscount(data.discount);
          setRevealed(true);
        }
        setStatusChecked(true);
      })
      .catch(() => {
        setStatusChecked(true);
      });
  }, []);

  // Apply coupon when revealed
  useEffect(() => {
    if (!revealed || !wonDiscount || isApplying) return;

    setIsApplying(true);
    addCoupon("SCRATCHCARD", items)
      .then(() => {
        setIsApplying(false);
      })
      .catch(() => {
        setIsApplying(false);
      });
  }, [revealed, wonDiscount, addCoupon, items]);

  if (!statusChecked) return null;

  return (
    <>
      {/* Floating trigger at bottom right - only if NOT already scratched */}
      {!isOpen && !hasScratched && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            startScratch();
          }}
          className="fixed bottom-24 right-5 z-[60] flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#1b1b1b] text-[#d4b55a] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition hover:scale-105 active:scale-95 sm:bottom-10"
        >
          <Sparkles size={20} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Scratch</span>
        </button>
      )}

      {/* Card Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(18,15,11,0.85)] px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#1c1c1c] p-10 text-center shadow-2xl border border-[#d4b55a]/20">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-[#6b6357] transition hover:text-white"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <Sparkles size={24} className="mx-auto mb-3 text-[#d4b55a]" />
            <h2 className="mb-1 font-serif text-3xl text-[#d4b55a]">
              {revealed ? "You Won!" : "Scratch & Save"}
            </h2>
            <p className="mb-8 text-[14px] text-[#9b917f]">
              {revealed
                ? `Enjoy your ${wonDiscount}% discount on this order!`
                : "Reveal the gold below for your flat discount."}
            </p>

            <div className="relative mx-auto" style={{ width: SCRATCH_CANVAS_SIZE, height: SCRATCH_CANVAS_SIZE }}>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#242424] border border-[#d4b55a]/10"
                style={{ width: SCRATCH_CANVAS_SIZE, height: SCRATCH_CANVAS_SIZE }}
              >
                {wonDiscount ? (
                  <>
                    <span className="text-[4rem] font-bold leading-none text-[#d4b55a]">
                      {revealed ? `${wonDiscount}%` : visualLabel || `${wonDiscount}%`}
                    </span>
                    <span className="mt-2 text-xl font-medium text-[#d4b55a]/80">
                      FLAT OFF
                    </span>
                  </>
                ) : (
                  <span className="text-[#9b917f]">Setting up reward...</span>
                )}
              </div>

              {!revealed && wonDiscount && (
                <canvas
                  ref={canvasRef}
                  width={SCRATCH_CANVAS_SIZE}
                  height={SCRATCH_CANVAS_SIZE}
                  className="absolute inset-0 cursor-pointer touch-none"
                  style={{ width: SCRATCH_CANVAS_SIZE, height: SCRATCH_CANVAS_SIZE }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              )}
            </div>

            {revealed && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mt-8 w-full bg-[#d4b55a] py-4 text-[13px] font-bold uppercase tracking-widest text-[#1c1c1c] transition hover:bg-[#e8d48b]"
              >
                {isApplying ? "Applying..." : "Cool, Continue Shopping"}
              </button>
            )}

            <p className="mt-6 text-[11px] text-[#6b6357] italic">
              *Applied automatically at checkout. Valid for today.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
