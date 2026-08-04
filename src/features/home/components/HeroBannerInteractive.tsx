"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import type { PublicHeroSlide } from "@/lib/hero-slides";

type HeroBannerInteractiveProps = {
  slides: PublicHeroSlide[];
  fallbackImage: StaticImageData;
  fallbackAlt: string;
  children: ReactNode;
};

const INTERVAL_MS = 6000;

export function HeroBannerInteractive({
  slides,
  fallbackImage,
  fallbackAlt,
  children,
}: HeroBannerInteractiveProps) {
  const items =
    slides.length > 0
      ? slides.map((slide) => ({
          id: slide.id,
          src: slide.image,
          alt: slide.altText,
        }))
      : [{ id: 0, src: fallbackImage, alt: fallbackAlt }];

  const [activeIndex, setActiveIndex] = useState(0);
  const total = items.length;
  const hasMultiple = total > 1;

  function goTo(index: number) {
    if (total === 0) return;
    setActiveIndex((index + total) % total);
  }

  useEffect(() => {
    if (!hasMultiple) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [hasMultiple, total]);

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
                unoptimized={
                  typeof item.src === "string" && item.src.startsWith("/uploads/")
                }
              />
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />
      </div>

      {hasMultiple ? (
        <div className="pointer-events-none absolute inset-0 z-40">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous slide"
            className="pointer-events-auto absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow-[0_8px_24px_rgba(15,23,42,0.2)] transition-colors hover:bg-white sm:left-6 sm:h-12 sm:w-12 lg:left-10"
          >
            <HiChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next slide"
            className="pointer-events-auto absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow-[0_8px_24px_rgba(15,23,42,0.2)] transition-colors hover:bg-white sm:right-6 sm:h-12 sm:w-12 lg:right-10"
          >
            <HiChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="pointer-events-auto absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}

      {children}
    </>
  );
}
