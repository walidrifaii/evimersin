"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { StaticImageData } from "next/image";
import { SafeImage } from "@/components/ui/SafeImage";
import { toDisplayImageSrc } from "@/lib/image-url";
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
      ? slides
          .map((slide) => ({
            id: slide.id,
            src: toDisplayImageSrc(slide.image),
            alt: slide.altText,
          }))
          .filter((slide) => slide.src.length > 0)
      : [];

  const displayItems =
    items.length > 0
      ? items
      : [{ id: 0, src: fallbackImage, alt: fallbackAlt }];

  const [activeIndex, setActiveIndex] = useState(0);
  const total = displayItems.length;
  const hasMultiple = total > 1;

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
        {displayItems.map((item, index) => {
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
              <SafeImage
                src={item.src}
                alt={item.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />
      </div>

      {children}
    </>
  );
}
