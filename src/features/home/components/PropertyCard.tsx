import Image from "next/image";
import Link from "next/link";
import { BedIcon } from "@/components/icons/BedIcon";
import { BathIcon } from "@/components/icons/BathIcon";
import { SquareMeterIcon } from "@/components/icons/SquareMeterIcon";
import type { PropertyListing } from "@/features/products/types";

type PropertyCardProps = {
  item: PropertyListing;
  index?: number;
};

export function PropertyCard({ item }: PropertyCardProps) {
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e8edf5] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 1280px) 82vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-[var(--brand-blue)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-white">
            {item.propertyType}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="text-[17px] font-bold leading-snug text-[var(--brand-navy)]">
            {item.title}
          </h3>
          <p className="mt-1.5 text-[14px] font-normal text-[var(--muted)]">
            {item.location}
          </p>
        </div>

        <div>
          <p className="text-[20px] font-bold leading-none text-[var(--brand-blue)]">
            {item.price}
          </p>
          {item.originalPrice ? (
            <p className="mt-1 text-[13px] font-medium text-[var(--muted)] line-through">
              {item.originalPrice}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eef2f7] pt-4 text-[13px] font-medium text-[var(--muted)]">
          {item.beds > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BedIcon className="h-4 w-4" />
              {item.beds} Beds
            </span>
          )}
          {item.baths > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <BathIcon className="h-4 w-4" />
              {item.baths} Baths
            </span>
          )}
          {item.sqm > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <SquareMeterIcon className="h-4 w-4" />
              {item.sqm} sqm
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
