"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import type { WCReview } from "@/lib/woocommerce";
import DOMPurify from "isomorphic-dompurify";

interface ProductReviewsProps {
  productId: number;
  averageRating: string;
  reviewCount: number;
}

export default function ProductReviews({ 
  productId, 
  averageRating, 
  reviewCount 
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<WCReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/reviews?product=${productId}`);
        if (!response.ok) throw new Error("Failed to fetch reviews");
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4 text-sm">
          {reviews.length === 0 ? "No reviews yet. Be the first to review this product!" : error}
        </p>
        <a 
          href={`https://api.veloriavault.com/product/?review=true#reviews`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors inline-block"
        >
          Write a Review
        </a>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="text-4xl font-semibold text-gray-900">
          {parseFloat(averageRating).toFixed(1)}
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.round(Number(averageRating)) 
                  ? "text-[#b59a5c] fill-[#b59a5c]" 
                  : "text-gray-300"
                }
              />
            ))}
          </div>
          <p className="text-sm text-gray-500">Based on {reviewCount} reviews</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {review.reviewer.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900">{review.reviewer}</span>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(review.date_created).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < review.rating 
                    ? "text-[#b59a5c] fill-[#b59a5c]" 
                    : "text-gray-300"
                  }
                />
              ))}
            </div>
            
            <div 
              className="text-gray-600 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.review) }}
            />
            
            {review.verified && (
              <span className="inline-block mt-2 text-xs text-green-600 font-medium">
                ✓ Verified Purchase
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
