"use client";

import React from "react";
import { PRODUCT_PAGE_TRUST_BADGES } from "@/config/product-page";

const BADGE_ICONS: Record<string, React.JSX.Element> = {
  leather: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M12 2c-2 0-3 2-3 2s-1 1-3 1-2 2-2 4 1 5 1 5-1 3 1 4 4-1 6-1 4 2 6 1 1-4 1-4 1-3 1-5-2-4-2-4-1-1-3-1-1-2-3-2z" />
      <path d="M12 6v12" strokeDasharray="1 3" />
    </svg>
  ),
  craft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M14 10L6 18a1.5 1.5 0 0 0 2 2l8-8" />
      <path d="M12 8l4-4a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4L15 11" />
      <path d="M14 10l1-1" />
    </svg>
  ),
  secure: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M12 2l8 4v6c0 5.5-3.84 8.5-8 10-4.16-1.5-8-4.5-8-10V6l8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  ethical: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 0 0 20" />
      <path d="M2 12h20" />
      <path d="M12 2c2.76 2.76 4 6 4 10s-1.24 7.24-4 10" />
      <path d="M12 2c-2.76 2.76-4 6-4 10s1.24 7.24 4 10" />
    </svg>
  ),
  packaging: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path d="M12 12l8-4.5" />
      <path d="M12 12v9" />
      <path d="M12 12L4 7.5" />
    </svg>
  ),
  warranty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M12 2l8 4v6c0 5.5-3.84 8.5-8 10-4.16-1.5-8-4.5-8-10V6l8-4z" />
      <path d="M12 8v4" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" />
    </svg>
  ),
  returns: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d="M9 14l-4-4 4-4" />
      <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
    </svg>
  ),
};

export default function ProductTrustBadges() {
  return (
    <section className="mx-auto max-w-[1320px] px-3 sm:px-6 lg:px-8">
      <div className="grid grid-cols-3 gap-x-3 gap-y-6 py-8 sm:grid-cols-4 md:grid-cols-7 md:gap-x-4">
        {PRODUCT_PAGE_TRUST_BADGES.map((badge) => {
          const icon = BADGE_ICONS[badge.icon] ?? BADGE_ICONS.secure;

          return (
            <div
              key={badge.id}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-2 h-8 w-8 text-[#b89a57] sm:h-9 sm:w-9">
                {icon}
              </div>
              <span className="text-[11px] font-semibold leading-tight text-[#1f1a13] sm:text-[12px]">
                {badge.title}
              </span>
              {badge.subtitle && (
                <span className="mt-0.5 text-[10px] text-[#8e8578] sm:text-[11px]">
                  {badge.subtitle}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
