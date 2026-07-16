import Link from "next/link";
import { HotDealCard } from "@/features/home/components/HotDealCard";
import { hotDeals } from "@/features/home/data";
import { routes } from "@/constants/routes";

export function HotDeals() {
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

        <div className="-mr-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-6 sm:pr-6 md:-mr-4 md:pr-4 xl:mr-0 xl:grid xl:grid-cols-3 xl:overflow-visible xl:pr-0 xl:snap-none">
          {hotDeals.map((item, index) => (
            <div
              key={item.id}
              className="w-[min(320px,84vw)] shrink-0 snap-start animate-[fadeUp_600ms_ease-out] [animation-fill-mode:both] xl:w-auto xl:shrink"
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
