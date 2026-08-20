"use client";

import { useEffect, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PropertyImage } from "@/features/products/types";

type PropertyGalleryProps = {
  title: string;
  images: PropertyImage[];
};

const VISIBLE_THUMBS = 5;

export function PropertyGallery({ title, images }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const total = images.length;
  const activeImage = images[activeIndex] ?? images[0];
  const canScrollThumbs = total > VISIBLE_THUMBS;

  function goTo(index: number) {
    if (total === 0) return;
    setActiveIndex((index + total) % total);
  }

  function scrollThumbs(direction: "left" | "right") {
    const el = thumbsRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>(`[data-thumb-index="${activeIndex}"]`);
    active?.scrollIntoView({
      behavior: "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [activeIndex]);

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-solid border-[#e8edf5] sm:aspect-[16/10] lg:aspect-[16/9]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null) return;
          const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
          const delta = endX - touchStartX.current;
          if (Math.abs(delta) > 40) {
            goTo(delta < 0 ? activeIndex + 1 : activeIndex - 1);
          }
          touchStartX.current = null;
        }}
      >
        <SafeImage
          src={activeImage}
          alt={`${title} - photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 70vw"
          className="object-cover"
        />

        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm sm:bottom-4 sm:left-4 sm:text-[13px]">
          {activeIndex + 1}/{total}
        </div>

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow-md transition-colors hover:bg-white md:inline-flex"
            >
              <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-navy)] shadow-md transition-colors hover:bg-white md:inline-flex"
            >
              <HiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="relative mt-3 sm:mt-4">
          {canScrollThumbs ? (
            <>
              <button
                type="button"
                onClick={() => scrollThumbs("left")}
                aria-label="Scroll thumbnails left"
                className="absolute -left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5eaf2] bg-white text-[var(--brand-navy)] shadow-sm transition-colors hover:bg-[#f8fafc] sm:inline-flex"
              >
                <HiChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollThumbs("right")}
                aria-label="Scroll thumbnails right"
                className="absolute -right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5eaf2] bg-white text-[var(--brand-navy)] shadow-sm transition-colors hover:bg-[#f8fafc] sm:inline-flex"
              >
                <HiChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div
            ref={thumbsRef}
            className={`flex gap-2.5 overflow-x-auto scroll-smooth pb-1 sm:gap-3 ${
              canScrollThumbs ? "sm:mx-9" : ""
            } [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#cbd5e1]`}
          >
            {images.map((image, index) => (
              <button
                key={`${title}-thumb-${index}`}
                type="button"
                data-thumb-index={index}
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-[4/3] w-[calc((100%-40px)/5)] min-w-[calc((100%-40px)/5)] shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-[calc((100%-48px)/5)] sm:min-w-[calc((100%-48px)/5)] sm:aspect-auto lg:h-[5.5rem] ${
                  index === activeIndex
                    ? "border-[var(--brand-blue)] shadow-sm"
                    : "border-transparent opacity-90 hover:opacity-100"
                }`}
                aria-label={`View photo ${index + 1}`}
                aria-current={index === activeIndex}
              >
                <SafeImage
                  src={image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 20vw, 120px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
