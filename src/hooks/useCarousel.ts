"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseCarouselOptions = {
  itemCount: number;
  /** Pixel gap between cards, matching the `gap-*` class on the scroller. */
  gap: number;
  isRtl: boolean;
};

/**
 * Horizontal card carousel that works in both LTR and RTL.
 *
 * In RTL the scroll offset runs from 0 down to negative values, so positions
 * are compared as absolute distances and scroll deltas are mirrored.
 */
export function useCarousel({ itemCount, gap, isRtl }: UseCarouselOptions) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const getMetrics = useCallback(
    (scroller: HTMLDivElement) => {
      const firstCard =
        scroller.querySelector<HTMLElement>("[data-carousel-item]");
      const cardWidth = firstCard?.offsetWidth ?? scroller.clientWidth;
      const step = cardWidth + gap;
      const visible = Math.max(
        1,
        Math.round((scroller.clientWidth + gap) / step),
      );
      return { step, visible };
    },
    [gap],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || itemCount === 0) return;

    function updateControls() {
      if (!scroller) return;

      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const position = Math.abs(scroller.scrollLeft);
      setCanPrev(position > 8);
      setCanNext(position < maxScroll - 8);

      const { step, visible } = getMetrics(scroller);
      const pages = Math.max(1, Math.ceil(itemCount / visible));
      setPageCount(pages);
      setActivePage(
        Math.min(pages - 1, Math.round(position / Math.max(1, step * visible))),
      );
    }

    updateControls();
    scroller.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);

    return () => {
      scroller.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [getMetrics, itemCount]);

  const scrollByPage = useCallback(
    (direction: -1 | 1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const { step, visible } = getMetrics(scroller);
      scroller.scrollBy({
        left: (isRtl ? -1 : 1) * direction * visible * step,
        behavior: "smooth",
      });
    },
    [getMetrics, isRtl],
  );

  const goToPage = useCallback(
    (page: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const { step, visible } = getMetrics(scroller);
      scroller.scrollTo({
        left: (isRtl ? -1 : 1) * page * visible * step,
        behavior: "smooth",
      });
    },
    [getMetrics, isRtl],
  );

  return {
    scrollerRef,
    canPrev,
    canNext,
    activePage,
    pageCount,
    scrollByPage,
    goToPage,
  };
}
