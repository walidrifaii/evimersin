"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { PublicHeroSlide } from "@/lib/hero-slides";

type HeroBannerSliderProps = {
  slides: PublicHeroSlide[];
  fallbackImage: StaticImageData;
  fallbackAlt: string;
};

const INTERVAL_MS = 6000;

export function HeroBannerSlider({
  slides,
  fallbackImage,
  fallbackAlt,
}: HeroBannerSliderProps) {
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

  useEffect(() => {
    if (!hasMultiple) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [hasMultiple, total]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {items.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100" : "opacity-0"
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

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />

      {hasMultiple ? (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
