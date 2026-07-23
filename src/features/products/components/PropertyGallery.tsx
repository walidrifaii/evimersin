"use client";

import { useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PropertyImage } from "@/features/products/types";

type PropertyGalleryProps = {
  title: string;
  images: PropertyImage[];
};

export function PropertyGallery({ title, images }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = images.length;
  const activeImage = images[activeIndex] ?? images[0];

  function goTo(index: number) {
    if (total === 0) return;
    setActiveIndex((index + total) % total);
  }

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e8edf5] sm:aspect-[16/10] lg:aspect-[16/9]"
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
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4 sm:gap-3">
          {images.map((image, index) => (
            <button
              key={`${title}-thumb-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[4/3] w-[calc((100%-30px)/4)] min-w-[calc((100%-30px)/4)] shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:h-20 sm:w-24 sm:min-w-24 sm:aspect-auto lg:h-[5.5rem] lg:w-28 lg:min-w-28 ${
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
                sizes="(max-width: 640px) 25vw, 112px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
