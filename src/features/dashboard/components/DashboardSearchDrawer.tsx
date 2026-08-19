"use client";

import { useEffect, useId } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { routes } from "@/constants/routes";
import type {
  DashboardSearchHit,
  DashboardSearchType,
} from "@/store/slices/admin/searchApi";

const TYPE_LABELS: Record<DashboardSearchType, string> = {
  products: "Residential Units",
  categories: "Categories",
  countries: "Countries",
  cities: "Cities",
  purposes: "Purposes",
};

const TYPE_ORDER: DashboardSearchType[] = [
  "products",
  "categories",
  "countries",
  "cities",
  "purposes",
];

export function searchHitHref(hit: DashboardSearchHit) {
  return routes.lookupEdit(hit.type, hit.id);
}

type DashboardSearchDrawerProps = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  results: DashboardSearchHit[];
  isLoading: boolean;
  isFetching: boolean;
};

export function DashboardSearchDrawer({
  open,
  query,
  onQueryChange,
  onClose,
  results,
  isLoading,
  isFetching,
}: DashboardSearchDrawerProps) {
  const titleId = useId();
  const trimmed = query.trim();
  const showEmpty = trimmed.length > 0 && !isLoading && results.length === 0;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    label: TYPE_LABELS[type],
    items: results.filter((item) => item.type === type),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="fixed inset-0 z-[90] flex justify-end">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-[-16px_0_48px_rgba(15,23,42,0.2)]"
      >
        <div className="border-b border-[#eef2f7] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium text-[var(--muted)]">
                Global search
              </p>
              <h2
                id={titleId}
                className="text-[1.05rem] font-bold tracking-tight text-[var(--brand-navy)]"
              >
                Find anything
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e5eaf2] text-[var(--brand-navy)] transition-colors hover:bg-[#f5f7fa]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <label htmlFor="dashboard-search-drawer" className="sr-only">
            Search dashboard
          </label>
          <div className="relative mt-4">
            <input
              id="dashboard-search-drawer"
              type="search"
              autoFocus
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search units, categories, cities..."
              className="h-11 w-full rounded-full border border-[#e5eaf2] bg-[#f8fafc] pl-10 pr-4 text-[14px] text-[var(--brand-navy)] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-[var(--brand-blue)] focus:bg-white"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M16.5 16.5L20 20"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!trimmed ? (
            <p className="py-10 text-center text-[14px] text-[var(--muted)]">
              Start typing to search residential units, categories, countries,
              cities, and purposes.
            </p>
          ) : isLoading ? (
            <p className="py-10 text-center text-[14px] text-[var(--muted)]">
              Searching...
            </p>
          ) : showEmpty ? (
            <p className="py-10 text-center text-[14px] text-[var(--muted)]">
              No results for “{trimmed}”.
            </p>
          ) : (
            <div className="space-y-6">
              {isFetching ? (
                <p className="text-[12px] font-medium text-[var(--muted)]">
                  Updating results...
                </p>
              ) : null}

              {grouped.map((group) => (
                <section key={group.type}>
                  <h3 className="mb-2 text-[11px] font-bold tracking-[0.08em] text-[var(--muted)] uppercase">
                    {group.label}
                  </h3>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          href={searchHitHref(item)}
                          onClick={onClose}
                          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-[#e5eaf2] hover:bg-[#f8fafc]"
                        >
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-[#e5eaf2] bg-[#f1f5f9]">
                            {item.image ? (
                              <SafeImage
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-[var(--brand-blue)]">
                                {item.title.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] font-semibold text-[var(--brand-navy)]">
                              {item.title}
                            </p>
                            {item.subtitle ? (
                              <p className="truncate text-[12px] text-[var(--muted)]">
                                {item.subtitle}
                              </p>
                            ) : null}
                          </div>
                          <span className="shrink-0 text-[12px] font-semibold text-[var(--brand-blue)]">
                            Open
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
