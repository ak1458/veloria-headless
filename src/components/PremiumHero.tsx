"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Hero Slider Images
const HERO_SLIDES = [
  {
    id: 1,
    image: "/images/hero/Ultra_realistic_luxury_202603301304.png",
    alt: "Premium leather handbag collection",
  },
  {
    id: 2,
    image: "/images/hero/Ultra_realistic_luxury_202603301304 (1).png",
    alt: "Luxury tote bag with model",
  },
  {
    id: 3,
    image: "/images/hero/Ultra_realistic_luxury_202603301309.png",
    alt: "Black leather bag with gold chain",
  },
  {
    id: 4,
    image: "/images/hero/Ultra_realistic_luxury_202603301309 (1).png",
    alt: "Close-up of Veloria Vault logo",
  },
];

const SLIDE_DURATION = 6000;

export default function PremiumHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, SLIDE_DURATION);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, nextSlide]);

  // GSAP animation for text
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(
        titleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1 }
      ).fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Subtle text animation on slide change
  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0.7 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [currentSlide]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] flex items-start lg:items-center pt-50 lg:pt-0 overflow-hidden bg-[#1a1a1a]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Images - Stacked with crossfade */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, index) => (
          <motion.div
            key={slide.id}
            initial={false}
            animate={{
              opacity: index === currentSlide ? 1 : 0,
              scale: index === currentSlide ? 1 : 1.05,
            }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 6, ease: "easeOut" },
            }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url('${slide.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              zIndex: index === currentSlide ? 1 : 0,
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30" />
          </motion.div>
        ))}
      </div>

      {/* Navigation Arrows - Desktop */}
      <div className="hidden lg:block absolute inset-y-0 left-4 right-4 z-20 pointer-events-none">
        <div className="container mx-auto h-full relative">
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all pointer-events-auto"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all pointer-events-auto"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Slide Indicators/Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentSlide
                ? "w-8 h-2 bg-white rounded-full"
                : "w-2 h-2 bg-white/50 hover:bg-white/80 rounded-full"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && isAutoPlaying && (
              <motion.div
                className="absolute inset-0 bg-[#b59a5c] rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 z-20 hidden lg:block">
        <span className="text-white/80 text-sm font-light tracking-widest">
          {String(currentSlide + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl text-white lg:text-left text-left mx-20 lg:mx-0">
          <h1
            ref={titleRef}
            className="text-3xl md:text-5xl lg:text-7xl font-serif leading-[1.1] mb-3 lg:mb-6 tracking-tight"
          >
            <span className="block">LUXURY</span>
            <span className="block italic font-light">locked in leather</span>
          </h1>

          <p
            ref={subtitleRef}
            className="lg:hidden text-xs text-gray-100 max-w-[260px] mx-auto leading-relaxed font-light"
          >
            Each piece holds more than design. It is a possession. A presence. A promise.
          </p>

          <div className="hidden lg:block">
            <p className="text-base lg:text-lg text-gray-200 max-w-lg mb-8 leading-relaxed font-light tracking-wide">
              Each piece holds more than design. It is a possession. A presence. A promise. Handcrafted for the modern minimalist.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
