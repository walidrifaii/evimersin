"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { HotDealCard } from "@/features/home/components/HotDealCard";
import { routes } from "@/constants/routes";
import type { PropertyListing } from "@/features/products/types";

type HotDealsProps = {
  listings: PropertyListing[];
};

export function HotDeals({ listings }: HotDealsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || listings.length === 0) return;

    function updateControls() {
      if (!scroller) return;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const scrollLeft = scroller.scrollLeft;
      setCanPrev(scrollLeft > 8);
      setCanNext(scrollLeft < maxScroll - 8);

      const firstCard = scroller.querySelector<HTMLElement>("[data-carousel-item]");
      const cardWidth = firstCard?.offsetWidth ?? scroller.clientWidth;
      const gap = 20;
      const visible = Math.max(
        1,
        Math.round((scroller.clientWidth + gap) / (cardWidth + gap)),
      );
      const pages = Math.max(1, Math.ceil(listings.length / visible));
      setPageCount(pages);
      const page = Math.min(
        pages - 1,
        Math.round(scrollLeft / Math.max(1, cardWidth + gap) / visible),
      );
      setActivePage(page);
    }

    updateControls();
    scroller.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      scroller.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [listings.length]);

  if (listings.length === 0) return null;

  const showControls = listings.length > 1;

  function scrollByPage(direction: -1 | 1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const firstCard = scroller.querySelector<HTMLElement>("[data-carousel-item]");
    const cardWidth = firstCard?.offsetWidth ?? scroller.clientWidth;
    const gap = 20;
    const visible = Math.max(
      1,
      Math.round((scroller.clientWidth + gap) / (cardWidth + gap)),
    );

    scroller.scrollBy({
      left: direction * visible * (cardWidth + gap),
      behavior: "smooth",
    });
  }

  function goToPage(page: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const firstCard = scroller.querySelector<HTMLElement>("[data-carousel-item]");
    const cardWidth = firstCard?.offsetWidth ?? scroller.clientWidth;
    const gap = 20;
    const visible = Math.max(
      1,
      Math.round((scroller.clientWidth + gap) / (cardWidth + gap)),
    );

    scroller.scrollTo({
      left: page * visible * (cardWidth + gap),
      behavior: "smooth",
    });
  }

  return (
    <section className="w-full overflow-hidden rounded-t-3xl rounded-b-3xl bg-[var(--brand-navy)]">
      <div className="mx-auto w-full px-4 py-12 sm:px-6 md:px-4 lg:px-[100px] lg:py-14">
        <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.25rem]">
              Hot Deals 🔥
            </h2>
            <p className="mt-2 text-[14px] font-normal text-white/75 sm:text-[15px]">
              Limited time offers on selected properties
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start">
            {showControls ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous hot deals"
                  onClick={() => scrollByPage(-1)}
                  disabled={!canPrev}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:text-white"
                >
                  <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Next hot deals"
                  onClick={() => scrollByPage(1)}
                  disabled={!canNext}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:text-white"
                >
                  <HiChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <Link
              href={routes.properties}
              className="inline-flex h-11 shrink-0 items-center justify-center self-start rounded-lg border border-white/80 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              View All Deals
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:gap-5 sm:px-6 md:-mx-4 md:px-4 lg:mx-0 lg:px-0"
        >
          {listings.map((item, index) => (
            <div
              key={item.id}
              data-carousel-item
              className="w-[min(260px,78vw)] shrink-0 snap-start sm:w-[min(300px,56vw)] lg:w-[calc((100%-3.75rem)/4)] min-w-0 animate-[fadeUp_600ms_ease-out] [animation-fill-mode:both]"
              style={{ animationDelay: `${100 + index * 120}ms` }}
            >
              <HotDealCard item={item} />
            </div>
          ))}
        </div>

        {showControls && pageCount > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, page) => (
              <button
                key={page}
                type="button"
                aria-label={`Go to hot deals page ${page + 1}`}
                aria-current={page === activePage ? "true" : undefined}
                onClick={() => goToPage(page)}
                className={`h-2.5 rounded-full transition-all ${
                  page === activePage
                    ? "w-7 bg-[var(--brand-red)]"
                    : "w-2.5 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
