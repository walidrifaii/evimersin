import Link from "next/link";
import { HotDealCard } from "@/features/home/components/HotDealCard";
import { routes } from "@/constants/routes";
import type { PropertyListing } from "@/features/products/types";

type HotDealsProps = {
  listings: PropertyListing[];
};

export function HotDeals({ listings }: HotDealsProps) {
  if (listings.length === 0) return null;

  return (
    <section className="w-full overflow-hidden rounded-t-3xl rounded-b-3xl bg-[var(--brand-navy)]">
      <div className="mx-auto w-full px-4 py-12 sm:px-6 md:px-4 lg:px-[100px] lg:py-14">
        <div className="mb-8 flex flex-col gap-5 lg:mb-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] lg:text-[2.25rem]">
              Hot Deals 🔥
            </h2>
            <p className="mt-2 text-[14px] font-normal text-white/75 sm:text-[15px]">
              Limited time offers on selected properties
            </p>
          </div>

          <Link
            href={routes.properties}
            className="inline-flex h-11 shrink-0 items-center justify-center self-start rounded-lg border border-white/80 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            View All Deals
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-4">
          {listings.map((item, index) => (
            <div
              key={item.id}
              className="min-w-0 animate-[fadeUp_600ms_ease-out] [animation-fill-mode:both]"
              style={{ animationDelay: `${100 + index * 120}ms` }}
            >
              <HotDealCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
