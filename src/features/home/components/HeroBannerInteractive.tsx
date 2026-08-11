"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { StaticImageData } from "next/image";
import {
  getUploadSrcCandidates,
  toDisplayImageSrc,
} from "@/lib/image-url";
import type { PublicHeroSlide } from "@/lib/hero-slides";
import type { ApiResponse } from "@/store/api/types";

type HeroBannerInteractiveProps = {
  initialSlides?: PublicHeroSlide[];
  fallbackImage: StaticImageData;
  fallbackAlt: string;
  children: ReactNode;
};

const INTERVAL_MS = 6000;

function HeroSlideImage({
  src,
  alt,
  fallbackImage,
  priority,
  className,
}: {
  src: string;
  alt: string;
  fallbackImage: StaticImageData;
  priority?: boolean;
  className?: string;
}) {
  const candidates = useMemo(() => getUploadSrcCandidates(src), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const activeSrc = candidates[candidateIndex] ?? toDisplayImageSrc(src);

  useEffect(() => {
    setCandidateIndex(0);
    setUseFallback(false);
  }, [src]);

  if (!activeSrc || useFallback) {
    return (
      <Image
        src={fallbackImage}
        alt={alt || fallbackImage.src}
        fill
        priority={priority}
        sizes="100vw"
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt={alt}
      className={`absolute inset-0 h-full w-full object-cover object-center ${className ?? ""}`}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => {
        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex((current) => current + 1);
          return;
        }
        setUseFallback(true);
      }}
    />
  );
}

export function HeroBannerInteractive({
  initialSlides = [],
  fallbackImage,
  fallbackAlt,
  children,
}: HeroBannerInteractiveProps) {
  const [slides, setSlides] = useState<PublicHeroSlide[]>(initialSlides);

  useEffect(() => {
    let cancelled = false;

    async function loadSlides() {
      try {
        const response = await fetch("/api/hero-slides", { cache: "no-store" });
        if (!response.ok) return;

        const json = (await response.json()) as ApiResponse<PublicHeroSlide[]>;
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setSlides(json.data);
        }
      } catch {
        // Keep SSR / fallback hero when the API is unavailable.
      }
    }

    void loadSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  const items =
    slides.length > 0
      ? slides
          .map((slide) => ({
            id: slide.id,
            src: slide.image,
            alt: slide.altText,
          }))
          .filter((slide) => slide.src.length > 0)
      : [];

  const displayItems =
    items.length > 0
      ? items
      : [{ id: 0, src: null as string | null, alt: fallbackAlt, useFallback: true }];

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
              {"useFallback" in item && item.useFallback ? (
                <Image
                  src={fallbackImage}
                  alt={item.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              ) : (
                <HeroSlideImage
                  src={item.src!}
                  alt={item.alt}
                  fallbackImage={fallbackImage}
                  priority={index === 0}
                  className="object-cover object-center"
                />
              )}
            </div>
          );
        })}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />
      </div>

      {children}
    </>
  );
}
