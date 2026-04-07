"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Camera, ChevronDown, ChevronUp } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import type { ProductReviewBundle } from "@/lib/reviews";
import type { WCReview, WCReviewMedia } from "@/lib/woocommerce";
import { PRODUCT_PAGE_REVIEW_BADGES } from "@/config/product-page";
import WriteReviewModal from "@/components/WriteReviewModal";

interface ProductReviewSectionProps {
  productId: number;
  productName: string;
  bundle: ProductReviewBundle;
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? "#e0b31c" : "none"}
          className={star <= rating ? "text-[#e0b31c]" : "text-[#d9cfbf]"}
        />
      ))}
    </div>
  );
}

function HistogramBar({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="w-4 text-right text-[#5c564d]">{stars}</span>
      <Star size={11} fill="#e0b31c" className="text-[#e0b31c]" />
      <div className="h-2 flex-1 overflow-hidden bg-[#f0ebe1]">
        <div
          className="h-full bg-[#b89a57] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-7 text-right text-[#8e8578]">{count}</span>
    </div>
  );
}

function MediaGallery({ media }: { media: WCReviewMedia[] }) {
  const [selectedMedia, setSelectedMedia] = useState<WCReviewMedia | null>(
    null,
  );

  if (media.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <Camera size={14} className="text-[#b89a57]" />
          <span className="text-[13px] font-medium text-[#1f1a13]">
            Customer Photos
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {media.slice(0, 20).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedMedia(item)}
              className="relative h-20 w-20 shrink-0 overflow-hidden border border-[#e9e2d5] transition hover:border-[#b89a57]"
            >
              {item.type === "image" ? (
                <Image
                  src={item.thumbnail || item.url}
                  alt={item.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#f0ebe1] text-[10px] text-[#8e8578]">
                  ▶ Video
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-[rgba(18,15,11,0.9)] p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative max-h-[85vh] max-w-[85vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedMedia.url}
                alt={selectedMedia.alt}
                className="max-h-[85vh] max-w-full object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full"
              />
            )}
            <button
              type="button"
              onClick={() => setSelectedMedia(null)}
              className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1f1a13] shadow"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ReviewCard({ review }: { review: WCReview }) {
  const dateLabel =
    review.date_label ||
    new Date(review.date_created).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="border-b border-[#f0ebe1] py-5 last:border-0">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0ebe1] text-[12px] font-semibold text-[#5c564d]">
              {review.reviewer.charAt(0).toUpperCase()}
            </div>
            <span className="text-[14px] font-medium text-[#1f1a13]">
              {review.reviewer_display_name || review.reviewer}
            </span>
            {review.verified && (
              <span className="text-[11px] font-medium text-green-600">
                ✓ Verified
              </span>
            )}
          </div>
          <StarRow rating={review.rating} size={12} />
        </div>
        <span className="shrink-0 text-[12px] text-[#b5a890]">
          {dateLabel}
        </span>
      </div>

      <div
        className="text-[14px] leading-relaxed text-[#5c564d]"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(review.review),
        }}
      />

      {/* Review images */}
      {review.media && review.media.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.media.map((m) => (
            <div
              key={m.id}
              className="relative h-16 w-16 overflow-hidden border border-[#e9e2d5]"
            >
              {m.type === "image" ? (
                <Image
                  src={m.thumbnail || m.url}
                  alt={m.alt}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#f0ebe1] text-[9px] text-[#8e8578]">
                  ▶
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductReviewSection({
  productId,
  productName,
  bundle,
}: ProductReviewSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { reviews, averageRating, reviewCount, histogram, media } = bundle;
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section
      id="reviews"
      className="mx-auto max-w-[1320px] px-3 pb-10 sm:px-6 lg:px-8"
    >
      <div className="border-t border-[#e6dfd2] pt-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="font-serif text-[1.5rem] text-[#1f1a13] sm:text-[1.8rem]">
            Customer Reviews
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 border border-[#1f1a13] px-6 py-2.5 text-[13px] font-medium uppercase tracking-[0.04em] text-[#1f1a13] transition hover:bg-[#1f1a13] hover:text-white"
          >
            Write a review
          </button>
        </div>

        {reviewCount > 0 ? (
          <>
            {/* Summary row */}
            <div className="mb-8 grid gap-8 sm:grid-cols-[auto_1fr_auto]">
              {/* Average */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[2.5rem] font-semibold leading-none text-[#1f1a13]">
                  {averageRating.toFixed(1)}
                </span>
                <StarRow rating={Math.round(averageRating)} size={16} />
                <span className="mt-1 text-[13px] text-[#8e8578]">
                  {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Histogram */}
              <div className="flex flex-col justify-center gap-1.5">
                {([5, 4, 3, 2, 1] as const).map((stars) => (
                  <HistogramBar
                    key={stars}
                    stars={stars}
                    count={histogram[stars]}
                    total={reviewCount}
                  />
                ))}
              </div>

              {/* Review Badges */}
              {PRODUCT_PAGE_REVIEW_BADGES.length > 0 && (
                <div className="flex gap-4 sm:flex-col sm:items-end sm:justify-center">
                  {PRODUCT_PAGE_REVIEW_BADGES.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-2">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2"
                        style={{ borderColor: badge.ringColor }}
                      >
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: badge.ringColor }}
                        >
                          {badge.score}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-[#5c564d]">
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media Gallery */}
            <MediaGallery media={media} />

            {/* Reviews List */}
            <div>
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {reviews.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-[#b89a57] transition hover:text-[#8a6e31]"
              >
                {showAll ? (
                  <>
                    Show fewer <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Show all {reviews.length} reviews{" "}
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="mb-4 text-[14px] text-[#8e8578]">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}
      </div>

      <WriteReviewModal
        productId={productId}
        productName={productName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
