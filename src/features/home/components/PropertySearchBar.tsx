"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "@/components/icons/ChevronDown";
import {
  ANY_PRICE_KEY,
  formatPriceRangeLabel,
  formatTranslatedFilterOption,
  getPriceRangeKeys,
  parsePriceRangeKey,
  translateHomeFilterLabel,
} from "@/lib/i18n-filters";
import {
  buildPropertiesSearchHref,
  findOptionById,
  getCityOptionsForCountry,
} from "@/features/products/data";
import type {
  FilterOption,
  PropertyFilterOptions,
  PropertyFiltersState,
} from "@/features/products/types";
import { useLocale, useTranslations } from "next-intl";

type PropertySearchBarProps = {
  filterOptions: PropertyFilterOptions;
};

function FilterDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
  translateLabel,
}: {
  label: string;
  options: FilterOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  translateLabel: (label: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const selectedOption =
    findOptionById(value, options) ?? options[0] ?? null;
  const selectedLabel = selectedOption
    ? formatTranslatedFilterOption(selectedOption, translateLabel, {
        withCount: false,
      })
    : translateLabel("");

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
    <div
      ref={ref}
      className={`relative flex w-full min-w-0 items-stretch ${isOpen ? "z-50" : ""}`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="group flex h-full min-h-[60px] w-full min-w-0 flex-col justify-center gap-3 px-5 py-4 text-start transition-colors lg:min-h-[68px] lg:gap-4 lg:px-6 lg:py-5"
      >
        <span className="text-[14px] font-medium leading-none text-[#9ca3af] lg:text-[15px]">
          {label}
        </span>
        <span className="flex w-full min-w-0 items-center gap-2 text-[18px] font-semibold leading-none text-[#1f2937] transition-colors group-hover:text-[var(--brand-red)] lg:text-[20px]">
          <span className="min-w-0 flex-1 truncate text-start">{selectedLabel}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#6b7280] transition-all duration-200 group-hover:text-[var(--brand-red)] ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
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
              className={`flex w-full items-center justify-between gap-3 px-6 py-3.5 text-start text-[15px] font-medium transition-colors hover:text-[var(--brand-red)] lg:text-[16px] ${
                opt.id === value
                  ? "text-[var(--brand-red)]"
                  : "text-[#374151]"
              }`}
            >
              <span className="truncate">
                {formatTranslatedFilterOption(opt, translateLabel)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PropertySearchBar({ filterOptions }: PropertySearchBarProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const t = useTranslations("home");
  const priceRangeRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<
    Pick<PropertyFiltersState, "countryId" | "cityId" | "categoryId" | "purposeId">
  >({
    countryId: null,
    cityId: null,
    categoryId: null,
    purposeId: null,
  });
  const [priceRangeKey, setPriceRangeKey] = useState(ANY_PRICE_KEY);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const cityOptions = getCityOptionsForCountry(
    filterOptions,
    filters.countryId,
  );
  const priceKeys = getPriceRangeKeys(filterOptions.priceMax);
  const price = parsePriceRangeKey(priceRangeKey);
  const searchHref = buildPropertiesSearchHref(
    {
      countryId: filters.countryId,
      cityId: filters.cityId,
      regionId: null,
      categoryId: filters.categoryId,
      purposeId: filters.purposeId,
      priceMin: price.priceMin ?? filterOptions.priceMin,
      priceMax: price.priceMax ?? filterOptions.priceMax,
    },
    filterOptions,
  );

  const translateLabel = (label: string) => translateHomeFilterLabel(t, label);
  const priceRangeLabel = formatPriceRangeLabel(
    priceRangeKey,
    filterOptions.priceMax,
    t,
  );

  useEffect(() => {
    if (openDropdown !== "priceRange") return;

    function handlePointerDown(event: PointerEvent) {
      if (
        priceRangeRef.current &&
        !priceRangeRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [openDropdown]);

  const dropdownLayer = (key: string) =>
    openDropdown === key ? "z-50" : openDropdown ? "z-0" : "z-[1]";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="relative z-50 flex w-full flex-col gap-2 overflow-visible rounded-2xl bg-white p-3 text-start shadow-[0_12px_32px_rgba(0,0,0,0.14)] lg:flex-row lg:items-stretch lg:gap-0 lg:rounded-[20px] lg:p-4"
    >
      <div className="grid min-w-0 flex-1 grid-cols-1 divide-y divide-[#e5e7eb] overflow-visible lg:grid-cols-5 lg:items-stretch lg:divide-y-0">
        <div
          className={`relative flex w-full min-w-0 items-stretch overflow-visible lg:border-e lg:border-[#e5e7eb] ${dropdownLayer("country")}`}
        >
          <FilterDropdown
            label={t("searchCountry")}
            options={filterOptions.country}
            value={filters.countryId}
            onChange={(countryId) =>
              setFilters((prev) => ({
                ...prev,
                countryId,
                cityId: null,
              }))
            }
            isOpen={openDropdown === "country"}
            onToggle={() =>
              setOpenDropdown((prev) =>
                prev === "country" ? null : "country",
              )
            }
            onClose={() => setOpenDropdown(null)}
            translateLabel={translateLabel}
          />
        </div>

        <div
          className={`relative flex w-full min-w-0 items-stretch overflow-visible lg:border-e lg:border-[#e5e7eb] ${dropdownLayer("city")}`}
        >
          <FilterDropdown
            label={t("searchCity")}
            options={cityOptions}
            value={filters.cityId}
            onChange={(cityId) => {
              const selectedCity = findOptionById(cityId, cityOptions);
              setFilters((prev) => ({
                ...prev,
                cityId,
                countryId: selectedCity?.countryId ?? prev.countryId,
              }));
            }}
            isOpen={openDropdown === "city"}
            onToggle={() =>
              setOpenDropdown((prev) => (prev === "city" ? null : "city"))
            }
            onClose={() => setOpenDropdown(null)}
            translateLabel={translateLabel}
          />
        </div>

        <div
          className={`relative flex w-full min-w-0 items-stretch overflow-visible lg:border-e lg:border-[#e5e7eb] ${dropdownLayer("purpose")}`}
        >
          <FilterDropdown
            label={t("searchPurpose")}
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
            translateLabel={translateLabel}
          />
        </div>

        <div
          className={`relative flex w-full min-w-0 items-stretch overflow-visible lg:border-e lg:border-[#e5e7eb] ${dropdownLayer("propertyType")}`}
        >
          <FilterDropdown
            label={t("searchPropertyType")}
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
            translateLabel={translateLabel}
          />
        </div>

        <div
          ref={priceRangeRef}
          className={`relative flex w-full min-w-0 items-stretch overflow-visible ${dropdownLayer("priceRange")}`}
        >
          <button
            type="button"
            aria-expanded={openDropdown === "priceRange"}
            onClick={() =>
              setOpenDropdown((prev) =>
                prev === "priceRange" ? null : "priceRange",
              )
            }
            className="group flex h-full min-h-[60px] w-full min-w-0 flex-col justify-center gap-3 px-5 py-4 text-start transition-colors lg:min-h-[68px] lg:gap-4 lg:px-6 lg:py-5"
          >
            <span className="text-[14px] font-medium leading-none text-[#9ca3af] lg:text-[15px]">
              {t("searchPriceRange")}
            </span>
            <span className="flex w-full min-w-0 items-center gap-2 text-[18px] font-semibold leading-none text-[#1f2937] transition-colors group-hover:text-[var(--brand-red)] lg:text-[20px]">
              <span className="min-w-0 flex-1 truncate text-start">{priceRangeLabel}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-[#6b7280] transition-all duration-200 group-hover:text-[var(--brand-red)] ${
                  openDropdown === "priceRange" ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>

          {openDropdown === "priceRange" ? (
            <div className="absolute inset-x-0 top-full z-[100] mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
              {priceKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setPriceRangeKey(key);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full px-6 py-3.5 text-start text-[15px] font-medium transition-colors hover:text-[var(--brand-red)] lg:text-[16px] ${
                    key === priceRangeKey
                      ? "text-[var(--brand-red)]"
                      : "text-[#374151]"
                  }`}
                >
                  {formatPriceRangeLabel(key, filterOptions.priceMax, t)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Link
        href={searchHref}
        className="inline-flex h-16 w-full shrink-0 items-center justify-center rounded-[16px] bg-[var(--brand-blue)] px-8 text-base font-semibold leading-none text-white transition-colors hover:bg-[#1d4ed8] lg:h-16 lg:w-auto lg:min-w-[180px] lg:self-center lg:px-10 lg:text-[17px]"
      >
        {t("searchButton")}
      </Link>
    </div>
  );
}
