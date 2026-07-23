"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/components/icons/ChevronDown";
import { homeData } from "@/features/home/data";
import {
  buildPropertiesSearchHref,
  getFilterOptionLabel,
} from "@/features/products/data";
import type {
  FilterOption,
  PropertyFilterOptions,
  PropertyFiltersState,
} from "@/features/products/types";

type PropertySearchBarProps = {
  filterOptions: PropertyFilterOptions;
};

function getPriceRangeOptions(maxPrice: number) {
  return [
    "Any Price",
    "$0 - $50,000",
    "$50,000 - $100,000",
    "$100,000 - $200,000",
    "$200,000 - $500,000",
    `$500,000 - $${maxPrice.toLocaleString("en-US")}`,
  ];
}

function parsePriceRange(value: string) {
  if (value === "Any Price") {
    return { priceMin: null as number | null, priceMax: null as number | null };
  }
  const numbers = value
    .match(/\d[\d,]*/g)
    ?.map((item) => Number(item.replace(/,/g, "")));
  if (!numbers?.length) {
    return { priceMin: null as number | null, priceMax: null as number | null };
  }
  return {
    priceMin: numbers[0] ?? null,
    priceMax: numbers[1] ?? numbers[0] ?? null,
  };
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
}: {
  label: string;
  options: FilterOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = getFilterOptionLabel(
    options,
    value,
    options[0]?.label ?? "",
  );

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative flex w-full min-w-0 items-stretch">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="flex h-full min-h-[60px] w-full min-w-0 flex-col justify-center gap-3 px-8 py-4 text-left transition-colors hover:bg-black/[0.02] lg:min-h-[68px] lg:gap-4 lg:px-12 lg:py-5"
      >
        <span className="text-[14px] font-medium leading-none text-[#9ca3af] lg:text-[15px]">
          {label}
        </span>
        <span className="flex w-full min-w-0 items-center text-[18px] font-semibold leading-none text-[#1f2937] lg:text-[20px]">
          <span className="truncate">{selectedLabel}</span>
          <ChevronDown
            className={`ml-auto h-4 w-4 shrink-0 text-[#6b7280] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          {options.map((opt) => (
            <button
              key={`${opt.id ?? "all"}-${opt.label}`}
              type="button"
              role="option"
              aria-selected={opt.id === value}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={(event) => {
                event.stopPropagation();
                onChange(opt.id);
                onClose();
              }}
              className={`flex w-full px-6 py-3.5 text-left text-[15px] font-medium transition-colors hover:bg-[#f3f4f6] lg:text-[16px] ${
                opt.id === value
                  ? "bg-[#eff6ff] text-[var(--brand-blue)]"
                  : "text-[#374151]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PropertySearchBar({ filterOptions }: PropertySearchBarProps) {
  const [filters, setFilters] = useState<
    Pick<PropertyFiltersState, "cityId" | "categoryId" | "purposeId">
  >({
    cityId: null,
    categoryId: null,
    purposeId: null,
  });
  const [priceRange, setPriceRange] = useState("Any Price");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const price = parsePriceRange(priceRange);
  const searchHref = buildPropertiesSearchHref(
    {
      cityId: filters.cityId,
      categoryId: filters.categoryId,
      purposeId: filters.purposeId,
      priceMin: price.priceMin ?? filterOptions.priceMin,
      priceMax: price.priceMax ?? filterOptions.priceMax,
    },
    filterOptions,
  );

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-white p-3 text-left shadow-[0_12px_32px_rgba(0,0,0,0.14)] lg:flex-row lg:items-stretch lg:gap-0 lg:rounded-[20px] lg:p-4">
      <div className="grid min-w-0 flex-1 grid-cols-1 divide-y divide-[#e5e7eb] lg:grid-cols-4 lg:items-stretch lg:divide-y-0">
        <div className="flex w-full min-w-0 items-stretch lg:border-r lg:border-[#e5e7eb]">
          <FilterDropdown
            label={homeData.search.city.label}
            options={filterOptions.city}
            value={filters.cityId}
            onChange={(cityId) => setFilters((prev) => ({ ...prev, cityId }))}
            isOpen={openDropdown === "city"}
            onToggle={() =>
              setOpenDropdown((prev) => (prev === "city" ? null : "city"))
            }
            onClose={() => setOpenDropdown(null)}
          />
        </div>

        <div className="flex w-full min-w-0 items-stretch lg:border-r lg:border-[#e5e7eb]">
          <FilterDropdown
            label={homeData.search.propertyType.label}
            options={filterOptions.propertyType}
            value={filters.categoryId}
            onChange={(categoryId) =>
              setFilters((prev) => ({ ...prev, categoryId }))
            }
            isOpen={openDropdown === "propertyType"}
            onToggle={() =>
              setOpenDropdown((prev) =>
                prev === "propertyType" ? null : "propertyType",
              )
            }
            onClose={() => setOpenDropdown(null)}
          />
        </div>

        <div className="flex w-full min-w-0 items-stretch lg:border-r lg:border-[#e5e7eb]">
          <FilterDropdown
            label={homeData.search.purpose.label}
            options={filterOptions.purpose}
            value={filters.purposeId}
            onChange={(purposeId) =>
              setFilters((prev) => ({ ...prev, purposeId }))
            }
            isOpen={openDropdown === "purpose"}
            onToggle={() =>
              setOpenDropdown((prev) => (prev === "purpose" ? null : "purpose"))
            }
            onClose={() => setOpenDropdown(null)}
          />
        </div>

        <div className="relative flex w-full min-w-0 items-stretch">
          <button
            type="button"
            aria-expanded={openDropdown === "priceRange"}
            onClick={() =>
              setOpenDropdown((prev) =>
                prev === "priceRange" ? null : "priceRange",
              )
            }
            className="flex h-full min-h-[60px] w-full min-w-0 flex-col justify-center gap-3 px-8 py-4 text-left transition-colors hover:bg-black/[0.02] lg:min-h-[68px] lg:gap-4 lg:px-12 lg:py-5"
          >
            <span className="text-[14px] font-medium leading-none text-[#9ca3af] lg:text-[15px]">
              {homeData.search.priceRange.label}
            </span>
            <span className="flex w-full min-w-0 items-center text-[18px] font-semibold leading-none text-[#1f2937] lg:text-[20px]">
              <span className="truncate">{priceRange}</span>
              <ChevronDown
                className={`ml-auto h-4 w-4 shrink-0 text-[#6b7280] transition-transform duration-200 ${
                  openDropdown === "priceRange" ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {openDropdown === "priceRange" ? (
            <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
              {getPriceRangeOptions(filterOptions.priceMax).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setPriceRange(opt);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full px-6 py-3.5 text-left text-[15px] font-medium transition-colors hover:bg-[#f3f4f6] lg:text-[16px] ${
                    opt === priceRange
                      ? "bg-[#eff6ff] text-[var(--brand-blue)]"
                      : "text-[#374151]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Link
        href={searchHref}
        className="inline-flex h-16 w-full shrink-0 items-center justify-center rounded-[16px] bg-[var(--brand-blue)] px-8 text-base font-semibold leading-none text-white transition-colors hover:bg-[#1d4ed8] lg:h-16 lg:w-auto lg:min-w-[220px] lg:self-center lg:px-12 lg:text-[17px]"
      >
        {homeData.search.button}
      </Link>
    </div>
  );
}
