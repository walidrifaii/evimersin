import Link from "next/link";
import { PropertyCard } from "@/features/home/components/PropertyCard";
import { featuredProperties } from "@/features/home/data";
import { routes } from "@/constants/routes";

function SectionArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--brand-red)]"
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeaturedProperties() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-20 sm:px-6 md:px-4 lg:px-[100px] lg:py-24">
        <div className="mb-12 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2.25rem] lg:text-[2.5rem]">
              Featured Properties
            </h2>
            <p className="mt-3 flex items-center gap-2 text-[15px] font-normal text-[var(--muted)] sm:text-[16px]">
              <SectionArrow />
              Explore our handpicked properties
            </p>
          </div>

          <Link
            href={routes.properties}
            className="inline-flex h-12 shrink-0 items-center justify-center self-start rounded-lg border border-[var(--brand-blue)] px-6 text-[15px] font-semibold text-[var(--brand-blue)] transition-colors hover:bg-[#eff6ff]"
          >
            View All Properties
          </Link>
        </div>

        <div className="-mr-4 flex snap-x snap-mandatory gap-6 overflow-x-auto pr-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-6 sm:pr-6 md:-mr-4 md:pr-4 xl:mr-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:pr-0 xl:snap-none">
          {featuredProperties.map((item, index) => (
            <div
              key={item.id}
              className="w-[min(300px,82vw)] shrink-0 snap-start animate-[fadeUp_600ms_ease-out] [animation-fill-mode:both] xl:w-auto xl:shrink"
              style={{ animationDelay: `${100 + index * 120}ms` }}
            >
              <PropertyCard item={item} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
