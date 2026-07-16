import Image from "next/image";
import Link from "next/link";
import { BathIcon } from "@/components/icons/BathIcon";
import { BedIcon } from "@/components/icons/BedIcon";
import { SquareMeterIcon } from "@/components/icons/SquareMeterIcon";
import type { PropertyListing } from "@/features/products/types";

type PropertyListingCardProps = {
  item: PropertyListing;
};

const badgeStyles: Record<string, string> = {
  FEATURED: "bg-[var(--brand-red)]",
  APARTMENT: "bg-[var(--brand-blue)]",
  STUDIO: "bg-[var(--brand-red)]",
  LAND: "bg-[var(--brand-blue)]",
  COMMERCIAL: "bg-[var(--brand-navy)]",
  PENTHOUSE: "bg-[var(--brand-blue)]",
};

export function PropertyListingCard({ item }: PropertyListingCardProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8edf5] bg-white shadow-[0_6px_24px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
      <Link href={item.href} className="relative block aspect-[16/10] w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white ${
            badgeStyles[item.badge] || badgeStyles.FEATURED
          }`}
        >
          {item.badge}
        </span>
      </Link>

      <div className="relative flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <Link href={item.href}>
            <h3 className="text-[16px] font-bold leading-snug text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-blue)] sm:text-[17px]">
              {item.title}
            </h3>
          </Link>
          <p className="mt-1.5 text-[13px] font-normal text-[var(--muted)] sm:text-[14px]">
            {item.location}
          </p>
        </div>

        <p className="text-[18px] font-bold leading-none text-[var(--brand-blue)] sm:text-[20px]">
          {item.price}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#eef2f7] pt-3.5 text-[13px] font-medium text-[var(--muted)]">
          {item.beds > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <BedIcon className="h-4 w-4" />
              {item.beds}
            </span>
          ) : null}
          {item.baths > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <BathIcon className="h-4 w-4" />
              {item.baths}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <SquareMeterIcon className="h-4 w-4" />
            {item.sqm} sqm
          </span>
        </div>
      </div>
    </article>
  );
}
