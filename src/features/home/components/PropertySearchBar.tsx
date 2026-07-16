"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/components/icons/ChevronDown";
import { homeData } from "@/features/home/data";
import { routes } from "@/constants/routes";

type DropdownField = {
  label: string;
  placeholder: string;
  options: readonly string[];
};

const fields: (DropdownField & { key: string })[] = [
  { ...homeData.search.city, key: "city" },
  { ...homeData.search.propertyType, key: "propertyType" },
  { ...homeData.search.purpose, key: "purpose" },
  { ...homeData.search.priceRange, key: "priceRange" },
];

function FilterDropdown({
  field,
  value,
  onChange,
  isOpen,
  onToggle,
  onClose,
}: {
  field: DropdownField & { key: string };
  value: string;
  onChange: (v: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

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
          {field.label}
        </span>
        <span className="flex w-full min-w-0 items-center text-[18px] font-semibold leading-none text-[#1f2937] lg:text-[20px]">
          <span className="truncate">{value}</span>
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
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          {field.options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                onClose();
              }}
              className={`flex w-full px-6 py-3.5 text-left text-[15px] font-medium transition-colors hover:bg-[#f3f4f6] lg:text-[16px] ${
                opt === value
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
  );
}

export function PropertySearchBar() {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.placeholder])),
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-white p-3 text-left shadow-[0_12px_32px_rgba(0,0,0,0.14)] lg:flex-row lg:items-stretch lg:gap-0 lg:rounded-[20px] lg:p-4">
      <div className="grid min-w-0 flex-1 grid-cols-1 divide-y divide-[#e5e7eb] lg:grid-cols-4 lg:items-stretch lg:divide-y-0">
        {fields.map((field, index) => (
          <div
            key={field.key}
            className={`flex w-full min-w-0 items-stretch ${
              index < fields.length - 1 ? "lg:border-r lg:border-[#e5e7eb]" : ""
            }`}
          >
            <FilterDropdown
              field={field}
              value={values[field.key]}
              onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
              isOpen={openDropdown === field.key}
              onToggle={() =>
                setOpenDropdown((prev) =>
                  prev === field.key ? null : field.key,
                )
              }
              onClose={() => setOpenDropdown(null)}
            />
          </div>
        ))}
      </div>

      <Link
        href={routes.properties}
        className="inline-flex h-16 w-full shrink-0 items-center justify-center rounded-[16px] bg-[var(--brand-blue)] px-8 text-base font-semibold leading-none text-white transition-colors hover:bg-[#1d4ed8] lg:h-16 lg:w-auto lg:min-w-[220px] lg:self-center lg:px-12 lg:text-[17px]"
      >
        {homeData.search.button}
      </Link>
    </div>
  );
}
