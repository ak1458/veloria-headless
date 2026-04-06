"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { WCReview } from "@/lib/woocommerce";
import DOMPurify from "isomorphic-dompurify";

const REVIEW_EDITORIAL_IMAGE = "/wp-content/uploads/2026/01/Bag-3-5-scaled.jpg";

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating
              ? "fill-[#b59a5c] text-[#b59a5c]"
              : "fill-gray-200 text-gray-200"
            }`}
        />
      ))}
    </div>
  );
}

// Customer Reviews Section Component with Auto-sliding
export default function CustomerReviewsSection({ reviews = [] }: { reviews?: WCReview[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use real reviews if available, otherwise use a placeholder message
  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: 0,
      date_created: "",
      date_created_gmt: "",
      product_id: 0,
      status: "approved",
      reviewer: "Veloria Customer",
      reviewer_email: "",
      rating: 5,
      review: "Luxurious quality and exceptional craftsmanship. Experience the vault.",
      verified: false,
      reviewer_avatar_urls: {},
    }
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (displayReviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [displayReviews.length]);

  const currentReview = displayReviews[currentIndex];

  return (
    <section className="bg-white py-14 sm:py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex flex-col justify-center min-h-[260px] sm:min-h-[320px] lg:order-1 lg:min-h-[350px]">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#b59a5c] uppercase mb-3">
              What Our Customers Say
            </p>
            <h2 className="mb-5 font-serif text-[2rem] leading-tight text-gray-900 sm:text-4xl">
              Quiet luxury, built to last.
            </h2>

            <div className="flex min-h-[150px] flex-col justify-start sm:min-h-[170px] lg:min-h-[140px]">
              <blockquote
                key={currentReview.id}
                className="mb-5 border-l-4 border-[#b59a5c] pl-4 text-base leading-relaxed text-gray-600 italic transition-opacity duration-500 sm:pl-6 sm:text-lg lg:text-xl"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`&ldquo;${currentReview.review}&rdquo;`) }}
              />
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <p className="text-sm font-medium text-gray-900">
                  {currentReview.reviewer}
                </p>
                <span className="text-[#b59a5c]">|</span>
                <StarRating rating={currentReview.rating} />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 sm:mt-8">
              {displayReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                      ? "w-8 bg-[#b59a5c]"
                      : "w-1.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-lg lg:max-w-none">
              <Image
                src={REVIEW_EDITORIAL_IMAGE}
                alt="Veloria Vault customer review editorial"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition-opacity duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
