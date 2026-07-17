"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HiChevronDown } from "react-icons/hi";
import {
  defaultPropertyFilters,
  filterProperties,
  filtersFromSearchParams,
  propertyFilterOptions,
} from "@/features/products/data";
import { PropertiesHeader } from "@/features/products/components/PropertiesHeader";
import { PropertyFilters } from "@/features/products/components/PropertyFilters";
import { PropertyListingCard } from "@/features/products/components/PropertyListingCard";
import type {
  PropertyFilterOptions,
  PropertyFiltersState,
  PropertyListing,
} from "@/features/products/types";

type PropertiesPageContentProps = {
  listings: PropertyListing[];
  filterOptions: PropertyFilterOptions;
};

export function PropertiesPageContent({
  listings,
  filterOptions,
}: PropertiesPageContentProps) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const cityParam = searchParams.get("city");
  const purposeParam = searchParams.get("purpose");
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");

  const filtersFromUrl = useMemo(
    () =>
      filtersFromSearchParams({
        type: typeParam,
        city: cityParam,
        purpose: purposeParam,
        priceMin: priceMinParam,
        priceMax: priceMaxParam,
      }, filterOptions),
    [typeParam, cityParam, purposeParam, priceMinParam, priceMaxParam, filterOptions],
  );

  const [draftFilters, setDraftFilters] =
    useState<PropertyFiltersState>(filtersFromUrl);
  const [appliedFilters, setAppliedFilters] =
    useState<PropertyFiltersState>(filtersFromUrl);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftFilters(filtersFromUrl);
    setAppliedFilters(filtersFromUrl);
  }, [filtersFromUrl]);

  const filtered = useMemo(
    () => filterProperties(listings, appliedFilters),
    [appliedFilters, listings],
  );

  const sortLabel =
    propertyFilterOptions.sort.find((item) => item.value === appliedFilters.sort)
      ?.label ?? "Sort";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    if (sortOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sortOpen]);

  function applyFilters() {
    setAppliedFilters(draftFilters);
  }

  function changeSort(sort: string) {
    const next = { ...appliedFilters, sort };
    setAppliedFilters(next);
    setDraftFilters((prev) => ({ ...prev, sort }));
    setSortOpen(false);
  }

  return (
    <section className="w-full bg-[#f5f7fa]">
      <div className="mx-auto w-full px-4 py-8 sm:px-6 sm:py-10 md:px-4 lg:px-[100px] lg:py-14">
        <PropertiesHeader />

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-28">
            <PropertyFilters
              value={draftFilters}
                options={filterOptions}
              onChange={setDraftFilters}
              onApply={applyFilters}
            />
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-[var(--brand-navy)] sm:text-[15px]">
                {filtered.length} Properties Found
              </p>

              <div ref={sortRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((prev) => !prev)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5eaf2] bg-white px-3.5 text-[13px] font-semibold text-[var(--brand-navy)] shadow-sm transition-colors hover:border-[#c7d2e5] sm:h-11 sm:px-4 sm:text-[14px]"
                >
                  Sort
                  <HiChevronDown
                    className={`h-4 w-4 text-[#6b7280] transition-transform ${
                      sortOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {sortOpen ? (
                  <div className="absolute right-0 top-full z-30 mt-2 min-w-[210px] overflow-hidden rounded-xl border border-[#e5eaf2] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
                    {propertyFilterOptions.sort.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => changeSort(option.value)}
                        className={`flex w-full px-4 py-3 text-left text-[13px] font-medium transition-colors hover:bg-[#f3f4f6] sm:text-[14px] ${
                          option.value === appliedFilters.sort
                            ? "bg-[#eff6ff] text-[var(--brand-blue)]"
                            : "text-[var(--brand-navy)]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((item) => (
                  <PropertyListingCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d5dce8] bg-white px-6 py-16 text-center">
                <p className="text-[16px] font-semibold text-[var(--brand-navy)]">
                  No properties found
                </p>
                <p className="mt-2 text-[14px] text-[var(--muted)]">
                  Try adjusting your filters or clearing them to see more listings.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const defaults = {
                      ...defaultPropertyFilters,
                      city: filterOptions.city[0] ?? defaultPropertyFilters.city,
                      propertyType:
                        filterOptions.propertyType[0] ??
                        defaultPropertyFilters.propertyType,
                      purpose:
                        filterOptions.purpose[0] ?? defaultPropertyFilters.purpose,
                      priceMin: filterOptions.priceMin,
                      priceMax: filterOptions.priceMax,
                    };
                    setDraftFilters(defaults);
                    setAppliedFilters(defaults);
                  }}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand-blue)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <p className="mt-4 text-[12px] text-[var(--muted)] sm:hidden">
              Sorted by: {sortLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
