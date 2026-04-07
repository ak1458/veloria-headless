"use client";

import { useState, useCallback, useRef } from "react";
import { Star, X, ImagePlus, Loader2, Trash2 } from "lucide-react";

interface WriteReviewModalProps {
  productId: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UploadedImage {
  file: File;
  preview: string;
  token: { id: number; key: string } | null;
  uploading: boolean;
  error: string | null;
}

export default function WriteReviewModal({
  productId,
  productName,
  isOpen,
  onClose,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [review, setReview] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      const remaining = 5 - images.length;
      const selected = Array.from(files).slice(0, remaining);

      for (const file of selected) {
        const preview = URL.createObjectURL(file);
        const entry: UploadedImage = {
          file,
          preview,
          token: null,
          uploading: true,
          error: null,
        };

        setImages((prev) => [...prev, entry]);

        try {
          const formData = new FormData();
          formData.append("productId", String(productId));
          formData.append("file", file);

          const res = await fetch("/api/reviews/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Upload failed");
          }

          const data = await res.json();

          setImages((prev) =>
            prev.map((img) =>
              img.preview === preview
                ? { ...img, token: data.token, uploading: false }
                : img,
            ),
          );
        } catch {
          setImages((prev) =>
            prev.map((img) =>
              img.preview === preview
                ? { ...img, uploading: false, error: "Upload failed" }
                : img,
            ),
          );
        }
      }
    },
    [images.length, productId],
  );

  const removeImage = useCallback((preview: string) => {
    setImages((prev) => {
      const toRemove = prev.find((img) => img.preview === preview);
      if (toRemove) {
        URL.revokeObjectURL(toRemove.preview);
      }
      return prev.filter((img) => img.preview !== preview);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!rating || !name.trim() || !email.trim() || !review.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const mediaTokens = images
      .filter((img) => img.token)
      .map((img) => img.token!);

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          review: review.trim(),
          name: name.trim(),
          email: email.trim(),
          mediaTokens,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }, [rating, name, email, review, images, productId]);

  if (!isOpen) return null;

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(18,15,11,0.7)] px-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:p-8">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center text-[#9b917f] transition hover:text-[#1f1a13]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl">✓</div>
            <h3 className="mb-2 font-serif text-xl text-[#1f1a13]">
              Thank you!
            </h3>
            <p className="text-[14px] text-[#7a7264]">
              Your review has been submitted and is pending approval.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 bg-[#b89a57] px-8 py-3 text-[13px] font-medium uppercase tracking-[0.04em] text-white transition hover:bg-[#a98a48]"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="mb-1 font-serif text-xl text-[#1f1a13]">
              Write a Review
            </h3>
            <p className="mb-6 text-[13px] text-[#8e8578]">
              for {productName}
            </p>

            {/* Star Rating */}
            <div className="mb-5">
              <label className="mb-2 block text-[13px] font-medium text-[#1f1a13]">
                Your Rating <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition"
                    aria-label={`${star} star`}
                  >
                    <Star
                      size={22}
                      fill={star <= displayRating ? "#e0b31c" : "none"}
                      className={
                        star <= displayRating
                          ? "text-[#e0b31c]"
                          : "text-[#d9cfbf]"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Name & Email */}
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#1f1a13]">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full border border-[#e0d9cc] bg-white px-3 text-[14px] text-[#1f1a13] outline-none transition focus:border-[#b89a57]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#1f1a13]">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full border border-[#e0d9cc] bg-white px-3 text-[14px] text-[#1f1a13] outline-none transition focus:border-[#b89a57]"
                  placeholder="Your email"
                />
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[13px] font-medium text-[#1f1a13]">
                Your Review <span className="text-red-400">*</span>
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                className="w-full border border-[#e0d9cc] bg-white p-3 text-[14px] text-[#1f1a13] outline-none transition focus:border-[#b89a57]"
                placeholder="Share your experience with this product..."
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="mb-2 block text-[13px] font-medium text-[#1f1a13]">
                Photos (optional, max 5)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {images.map((img) => (
                  <div key={img.preview} className="relative">
                    <div className="h-16 w-16 overflow-hidden border border-[#e0d9cc]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.preview}
                        alt="Upload preview"
                        className="h-full w-full object-cover"
                      />
                      {img.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <Loader2
                            size={16}
                            className="animate-spin text-[#b89a57]"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(img.preview)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f1a13] text-white"
                      aria-label="Remove image"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 items-center justify-center border-2 border-dashed border-[#dad3c5] text-[#b5a890] transition hover:border-[#b89a57] hover:text-[#b89a57]"
                  >
                    <ImagePlus size={20} />
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageSelect(e.target.files)}
                />
              </div>
            </div>

            {error && (
              <p className="mb-4 text-[13px] text-red-500">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !rating}
              className="w-full bg-[#b89a57] py-3.5 text-[13px] font-medium uppercase tracking-[0.04em] text-white transition hover:bg-[#a98a48] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={16} className="mx-auto animate-spin" />
              ) : (
                "Submit Review"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
