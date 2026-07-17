"use client";

import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import {
  defaultPropertyFilters,
  formatPriceLabelForOptions,
  propertyFilterOptions,
} from "@/features/products/data";
import type {
  PropertyFilterOptions,
  PropertyFiltersState,
} from "@/features/products/types";

type PropertyFiltersProps = {
  value: PropertyFiltersState;
  options: PropertyFilterOptions;
  onChange: (next: PropertyFiltersState) => void;
  onApply: () => void;
};

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <label className="mb-2 block text-[13px] font-semibold text-[var(--brand-navy)]">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-[#e5eaf2] bg-white px-4 text-left text-[14px] font-medium text-[var(--brand-navy)] transition-colors hover:border-[#c7d2e5]"
      >
        <span className="truncate">{value}</span>
        <HiChevronDown
          className={`h-4 w-4 shrink-0 text-[#6b7280] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[#e5eaf2] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`flex w-full px-4 py-3 text-left text-[14px] font-medium transition-colors hover:bg-[#f3f4f6] ${
                option === value
                  ? "bg-[#eff6ff] text-[var(--brand-blue)]"
                  : "text-[var(--brand-navy)]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PropertyFilters({
  value,
  options,
  onChange,
  onApply,
}: PropertyFiltersProps) {
  function update<K extends keyof PropertyFiltersState>(
    key: K,
    nextValue: PropertyFiltersState[K],
  ) {
    onChange({ ...value, [key]: nextValue });
  }

  function clearAll() {
    onChange({
      city: options.city[0] ?? defaultPropertyFilters.city,
      propertyType: options.propertyType[0] ?? defaultPropertyFilters.propertyType,
      purpose: options.purpose[0] ?? defaultPropertyFilters.purpose,
      priceMin: options.priceMin,
      priceMax: options.priceMax,
      sort: value.sort,
    });
  }

  const minPercent =
    ((value.priceMin - options.priceMin) /
      Math.max(1, options.priceMax - options.priceMin)) *
    100;
  const maxPercent =
    ((value.priceMax - options.priceMin) /
      Math.max(1, options.priceMax - options.priceMin)) *
    100;

  return (
    <aside className="rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.07)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-[1.1rem] font-bold text-[var(--brand-navy)]">Filters</h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-[13px] font-semibold text-[var(--brand-red)] transition-colors hover:text-[#c9181e]"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        <FilterSelect
          label="City"
          options={options.city}
          value={value.city}
          onChange={(city) => update("city", city)}
        />
        <FilterSelect
          label="Property Type"
          options={options.propertyType}
          value={value.propertyType}
          onChange={(propertyType) => update("propertyType", propertyType)}
        />
        <FilterSelect
          label="Purpose"
          options={options.purpose}
          value={value.purpose}
          onChange={(purpose) => update("purpose", purpose)}
        />

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-[13px] font-semibold text-[var(--brand-navy)]">
              Price Range
            </label>
            <span className="text-[12px] font-medium text-[var(--muted)]">
              {formatPriceLabelForOptions(value.priceMin, options)} –{" "}
              {formatPriceLabelForOptions(value.priceMax, options)}
            </span>
          </div>

          <div className="relative h-8">
            <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#e8edf5]" />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--brand-blue)]"
              style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
            />
            <input
              type="range"
              min={options.priceMin}
              max={options.priceMax}
              step={10000}
              value={value.priceMin}
              onChange={(e) => {
                const next = Number(e.target.value);
                update("priceMin", Math.min(next, value.priceMax - 10000));
              }}
              className="pointer-events-none absolute inset-0 z-10 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--brand-blue)] [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--brand-blue)] [&::-webkit-slider-thumb]:shadow"
              aria-label="Minimum price"
            />
            <input
              type="range"
              min={options.priceMin}
              max={options.priceMax}
              step={10000}
              value={value.priceMax}
              onChange={(e) => {
                const next = Number(e.target.value);
                update("priceMax", Math.max(next, value.priceMin + 10000));
              }}
              className="pointer-events-none absolute inset-0 z-20 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[var(--brand-blue)] [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--brand-blue)] [&::-webkit-slider-thumb]:shadow"
              aria-label="Maximum price"
            />
          </div>

          <div className="mt-1 flex items-center justify-between text-[12px] font-medium text-[var(--muted)]">
            <span>{formatPriceLabelForOptions(options.priceMin, options)}</span>
            <span>{formatPriceLabelForOptions(options.priceMax, options)}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--brand-blue)] text-[15px] font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
      >
        Apply Filters
      </button>
    </aside>
  );
}
