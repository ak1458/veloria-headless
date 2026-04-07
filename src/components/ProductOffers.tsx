"use client";

import { useState } from "react";
import { Tag, ChevronRight, Sparkles } from "lucide-react";
import { PRODUCT_PAGE_PROMO } from "@/config/product-page";

export default function ProductOffers() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
      <div className="border border-[#e9e2d5] bg-white">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-[#ede7db] px-5 py-3.5">
          <Tag size={15} className="text-[#b89a57]" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#1f1a13]">
            {PRODUCT_PAGE_PROMO.eyebrow}
          </span>
        </div>

        {/* Offer Items */}
        <div className="divide-y divide-[#f0ebe1]">
          {PRODUCT_PAGE_PROMO.items.map((item, index) => {
            const isExpanded = expandedIndex === index;
            const isScratch = item.title.toLowerCase().includes("scratch");

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (isScratch) {
                    window.dispatchEvent(new CustomEvent("open-scratch-modal"));
                  } else {
                    setExpandedIndex(isExpanded ? null : index);
                  }
                }}
                className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-[#faf8f4]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                  {isScratch ? (
                    <Sparkles size={14} className="text-[#b89a57]" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#b89a57]" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-medium text-[#1f1a13]">
                    {item.title}
                  </span>
                  {isExpanded && (
                    <p className="mt-1 text-[13px] leading-relaxed text-[#7a7264]">
                      {item.description}
                    </p>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className={`mt-1.5 shrink-0 text-[#b5a890] transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
