"use client";

import { useState } from "react";
import { use } from "react";
import { ArrowLeft, RefreshCw, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ReturnPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default function ReturnPage({ params }: ReturnPageProps) {
  const { orderId } = use(params);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock an API call duration
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/account" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-[#b59a5c] transition-colors mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to Account
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-[#fbf9f4]">
            <div>
              <h1 className="text-2xl font-serif text-gray-900 mb-1">Request a Return</h1>
              <p className="text-sm text-gray-500">Order #{orderId}</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <RefreshCw className="text-[#b59a5c] w-6 h-6" />
            </div>
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-serif text-gray-900 mb-4">Return Request Submitted</h2>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">
                    We&apos;ve received your request to return Order #{orderId}. Our team will review the details and get back to you within 24-48 hours with next steps.
                  </p>
                  <Link
                    href="/account"
                    className="inline-block bg-[#1a1a1a] text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors rounded"
                  >
                    Return to Dashboard
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="bg-[#fcf8e8] border border-[#f0e6c8] p-4 rounded-lg mb-8">
                    <p className="text-sm text-[#8a6d3b]">
                      Please ensure the item is unused and in its original packaging with all tags attached. Returns must be initiated within 7 days of delivery.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                      Reason for Return *
                    </label>
                    <div className="relative">
                      <select
                        id="reason"
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b59a5c] focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a reason...</option>
                        <option value="defective">Item is defective or damaged</option>
                        <option value="wrong_item">Received wrong item</option>
                        <option value="not_as_described">Item not as described</option>
                        <option value="changed_mind">Changed my mind</option>
                        <option value="quality">Quality not as expected</option>
                        <option value="other">Other reason</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                        <ChevronDownIcon />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="details" className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                      Additional Details *
                    </label>
                    <textarea
                      id="details"
                      required
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Please provide more specifics about why you're returning this order..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b59a5c] focus:border-transparent transition-all resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                      Upload Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-[#b59a5c] transition-colors" />
                      <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={isSubmitting || !reason || !details}
                      className="w-full bg-[#1a1a1a] text-white py-4 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-[#b59a5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Submitting Request..." : "Submit Return Request"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
