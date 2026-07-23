import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PropertyListing } from "@/features/products/types";

type HotDealCardProps = {
  item: PropertyListing;
};

export function HotDealCard({ item }: HotDealCardProps) {
  return (
    <Link
      href={item.href}
      className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[5/4] lg:aspect-[16/10] xl:aspect-[16/9]">
        <SafeImage
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 1280px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md bg-[var(--brand-red)] px-2 py-0.5 text-[10px] font-bold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
          {item.discountLabel ?? "Hot Deal"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[var(--brand-navy)] sm:text-[15px] lg:text-[16px]">
            {item.title}
          </h3>
          <p className="mt-1 truncate text-[11px] font-normal text-[var(--muted)] sm:text-[13px]">
            {item.location}
          </p>
        </div>

        <div className="mt-auto flex min-w-0 flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2">
          {item.originalPrice ? (
            <span className="text-[11px] font-medium text-[#9ca3af] line-through sm:text-[13px]">
              {item.originalPrice}
            </span>
          ) : null}
          <span className="text-[15px] font-bold leading-none text-[var(--brand-navy)] sm:text-[17px] lg:text-[18px]">
            {item.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
