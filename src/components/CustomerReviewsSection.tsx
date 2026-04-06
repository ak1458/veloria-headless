"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { WCReview } from "@/lib/woocommerce";
import DOMPurify from "isomorphic-dompurify";

const REVIEW_EDITORIAL_FALLBACK = "/wp-content/uploads/2026/01/Bag-3-5-scaled.jpg";

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
  const editorialImage =
    currentReview.product_image?.src ||
    REVIEW_EDITORIAL_FALLBACK;
  const editorialAlt =
    currentReview.product_name
      ? `${currentReview.product_name} customer review`
      : "Veloria Vault customer review editorial";

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Container - Added min-height to prevent jumping of the whole section */}
          <div className="order-2 lg:order-1 flex flex-col justify-center min-h-[350px]">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#b59a5c] uppercase mb-3">
              What Our Customers Say
            </p>
            <h2 className="text-3xl lg:text-4xl font-serif font-medium text-gray-900 mb-6 leading-tight">
              Quiet luxury, built to last.
            </h2>

            {/* Review Content Container - Added min-height to lock height for different text lengths */}
            <div className="min-h-[160px] md:min-h-[140px] flex flex-col justify-start">
              <blockquote
                key={currentReview.id}
                className="text-lg lg:text-xl text-gray-600 italic mb-6 leading-relaxed border-l-4 border-[#b59a5c] pl-6 transition-opacity duration-500"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`&ldquo;${currentReview.review}&rdquo;`) }}
              />
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-900">
                  {currentReview.reviewer}
                </p>
                <span className="text-[#b59a5c]">|</span>
                <StarRating rating={currentReview.rating} />
              </div>
            </div>

            {/* Slide indicators */}
            <div className="flex items-center gap-2 mt-8">
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
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
              <Image
                key={editorialImage}
                src={editorialImage}
                alt={editorialAlt}
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
