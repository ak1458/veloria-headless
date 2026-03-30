"use client";

import Link from "next/link";
import { Instagram, Facebook, ArrowUp, Loader2, CheckCircle } from "lucide-react";
import { useState } from "react";

const COLLECTIONS = [
  { label: "Tote Bags", href: "/product-category/tote-bag" },
  { label: "Satchel Bags", href: "/product-category/satchel-bag" },
  { label: "Sling Bags", href: "/product-category/sling-bag" },
  { label: "Crossbody", href: "/product-category/crossbody" },
  { label: "Clutch", href: "/product-category/clutch" },
  { label: "Wallet", href: "/product-category/wallet" },
];

const IMPORTANT_LINKS = [
  { label: "Refund & Cancellation", href: "/cancellation-refund" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/refund-returns" },
  { label: "Warranty Policy", href: "/warranty-policy" },
  { label: "Terms & Conditions", href: "/terms-conditions" },
];

export default function PremiumFooter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: data.message });
        setEmail("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to subscribe" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-serif font-semibold tracking-wide mb-4">
              VELORIA VAULT
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Timeless leather goods for the modern minimalist. Handcrafted with 
              precision and designed to last a lifetime.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/veloriavault/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#b59a5c] transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/p/Veloria-Vault-61568488662553/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#b59a5c] transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Mobile Side-by-Side Links Container */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-2">
            {/* Collections Column */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#b59a5c]">
                Collections
              </h4>
              <ul className="space-y-3">
                {COLLECTIONS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Links Column */}
            <div>
              <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#b59a5c]">
                Important Links
              </h4>
              <ul className="space-y-3">
                {IMPORTANT_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase mb-4 text-[#b59a5c]">
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for early access to new drops and exclusive offers.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-none text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#b59a5c] transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-3 bg-[#b59a5c] text-white text-sm font-medium hover:bg-[#a08a4f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
              {message && (
                <div className={`flex items-center gap-2 text-xs ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {message.type === "success" && <CheckCircle size={14} />}
                  <span>{message.text}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Veloria Vault. All rights reserved.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
              aria-label="Scroll to top"
            >
              <span>Back to top</span>
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
