"use client";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/features/home/components/PropertyCard";
import { routes } from "@/constants/routes";
import { useCarousel } from "@/hooks/useCarousel";
import type { PropertyListing } from "@/features/products/types";

function SectionArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--brand-red)] rtl:-scale-x-100"
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type FeaturedPropertiesProps = {
  listings: PropertyListing[];
};

export function FeaturedProperties({ listings }: FeaturedPropertiesProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const isRtl = useLocale() === "ar";
  const {
    scrollerRef,
    canPrev,
    canNext,
    activePage,
    pageCount,
    scrollByPage,
    goToPage,
  } = useCarousel({ itemCount: listings.length, gap: 24, isRtl });

  if (listings.length === 0) return null;

  const showControls = listings.length > 1;
  const PrevIcon = isRtl ? HiChevronRight : HiChevronLeft;
  const NextIcon = isRtl ? HiChevronLeft : HiChevronRight;

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-20 sm:px-6 md:px-4 lg:px-[100px] lg:py-24">
        <div className="mb-12 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2.25rem] lg:text-[2.5rem]">
              {t("featuredTitle")}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-[15px] font-normal text-[var(--muted)] sm:text-[16px]">
              <SectionArrow />
              {t("featuredSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start">
            {showControls ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t("prevFeatured")}
                  onClick={() => scrollByPage(-1)}
                  disabled={!canPrev}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e8edf5] bg-white text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#e8edf5] disabled:hover:text-[var(--brand-navy)]"
                >
                  <PrevIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={t("nextFeatured")}
                  onClick={() => scrollByPage(1)}
                  disabled={!canNext}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e8edf5] bg-white text-[var(--brand-navy)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#e8edf5] disabled:hover:text-[var(--brand-navy)]"
                >
                  <NextIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <Link
              href={routes.properties}
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg border border-[var(--brand-blue)] px-6 text-[15px] font-semibold text-[var(--brand-blue)] transition-colors hover:bg-[#eff6ff]"
            >
              {tCommon("viewAllProperties")}
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:-mx-4 md:px-4 lg:mx-0 lg:px-0"
        >
          {listings.map((item, index) => (
            <div
              key={item.id}
              data-carousel-item
              className="w-[min(300px,82vw)] shrink-0 snap-start sm:w-[min(320px,70vw)] lg:w-[calc((100%-4.5rem)/4)]"
            >
              <PropertyCard item={item} index={index} />
            </div>
          ))}
        </div>

        {showControls && pageCount > 1 ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, page) => (
              <button
                key={page}
                type="button"
                aria-label={t("featuredPage", { page: page + 1 })}
                aria-current={page === activePage ? "true" : undefined}
                onClick={() => goToPage(page)}
                className={`h-2.5 rounded-full transition-all ${
                  page === activePage
                    ? "w-7 bg-[var(--brand-red)]"
                    : "w-2.5 bg-[#dbe3ef] hover:bg-[var(--brand-red)]/50"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
