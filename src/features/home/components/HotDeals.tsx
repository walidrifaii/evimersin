"use client";

import { useEffect, useState, useTransition } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HotDealCard } from "@/features/home/components/HotDealCard";
import { routes } from "@/constants/routes";
import { useCarousel } from "@/hooks/useCarousel";
import type { PropertyListingsPage } from "@/features/products/types";
import type { PropertyListing } from "@/features/products/types";
import type { ApiResponse } from "@/store/api/types";

function CardSkeleton() {
  return (
    <div
      className="w-[min(260px,78vw)] shrink-0 sm:w-[min(300px,56vw)] lg:w-[calc((100%-3.75rem)/4)]"
      aria-hidden="true"
    >
      <div className="animate-pulse overflow-hidden rounded-2xl bg-white/10">
        <div className="aspect-[4/3] bg-white/15" />
        <div className="space-y-3 p-4">
          <div className="h-4 w-3/4 rounded-md bg-white/15" />
          <div className="h-3 w-1/2 rounded-md bg-white/10" />
          <div className="h-5 w-1/3 rounded-md bg-white/15" />
        </div>
      </div>
    </div>
  );
}

type HotDealsProps = {
  initialPage: PropertyListingsPage;
};

export function HotDeals({ initialPage }: HotDealsProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const isRtl = useLocale() === "ar";
  const [pageData, setPageData] = useState(initialPage);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const listings = pageData.items;
  const {
    scrollerRef,
    canPrev,
    canNext,
    scrollByPage,
  } = useCarousel({ itemCount: listings.length, gap: 20, isRtl });

  useEffect(() => {
    setPageData(initialPage);
  }, [initialPage]);

  async function goToServerPage(nextPage: number) {
    if (
      nextPage < 1 ||
      nextPage > pageData.totalPages ||
      nextPage === pageData.page ||
      loading
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/listings/hot-deals?page=${nextPage}&pageSize=${pageData.pageSize}`,
      );
      if (!response.ok) return;
      const json = (await response.json()) as ApiResponse<PropertyListingsPage>;
      if (json.success && json.data) {
        startTransition(() => {
          setPageData(json.data);
          scrollerRef.current?.scrollTo({
            left: 0,
            behavior: "auto",
          });
        });
      }
    } catch {
      // Keep current page on failure.
    } finally {
      setLoading(false);
    }
  }

  if (pageData.total === 0 && listings.length === 0) return null;

  const showControls = pageData.totalPages > 1;
  const busy = loading || isPending;
  const PrevIcon = isRtl ? HiChevronRight : HiChevronLeft;
  const NextIcon = isRtl ? HiChevronLeft : HiChevronRight;
  const skeletonCount = Math.min(pageData.pageSize || 6, 6);

  return (
    <section
      className="w-full overflow-hidden rounded-t-3xl rounded-b-3xl bg-[var(--brand-navy)]"
      aria-busy={busy}
    >
      <div className="mx-auto w-full px-4 py-12 sm:px-6 md:px-4 lg:px-[100px] lg:py-14">
        <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.25rem]">
              {t("hotDealsTitle")}
            </h2>
            <p className="mt-2 text-[14px] font-normal text-white/75 sm:text-[15px]">
              {t("hotDealsSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start">
            {showControls ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t("prevHotDeals")}
                  onClick={() => goToServerPage(pageData.page - 1)}
                  disabled={busy || pageData.page <= 1}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:text-white"
                >
                  <PrevIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={t("nextHotDeals")}
                  onClick={() => goToServerPage(pageData.page + 1)}
                  disabled={busy || pageData.page >= pageData.totalPages}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:text-white"
                >
                  <NextIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : listings.length > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={t("prevHotDeals")}
                  onClick={() => scrollByPage(-1)}
                  disabled={!canPrev}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:text-white"
                >
                  <PrevIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={t("nextHotDeals")}
                  onClick={() => scrollByPage(1)}
                  disabled={!canNext}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/20 disabled:hover:text-white"
                >
                  <NextIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <Link
              href={routes.properties}
              prefetch={false}
              className="inline-flex h-11 shrink-0 items-center justify-center self-start rounded-lg border border-white/80 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              {tCommon("viewAllDeals")}
            </Link>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:gap-5 sm:px-6 md:-mx-4 md:px-4 lg:mx-0 lg:px-0"
        >
          {busy
            ? Array.from({ length: skeletonCount }).map((_, index) => (
                <CardSkeleton key={index} />
              ))
            : listings.map((item: PropertyListing, index) => (
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

        {showControls ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pageData.totalPages }, (_, page) => (
              <button
                key={page}
                type="button"
                aria-label={t("hotDealsPage", { page: page + 1 })}
                aria-current={page + 1 === pageData.page ? "true" : undefined}
                disabled={busy}
                onClick={() => goToServerPage(page + 1)}
                className={`h-2.5 rounded-full transition-all disabled:opacity-50 ${
                  page + 1 === pageData.page
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
