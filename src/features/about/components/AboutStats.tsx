import { aboutData } from "@/features/about/data";

export function AboutStats() {
  return (
    <section className="w-full bg-[#f5f7fa]">
      <div className="mx-auto w-full px-4 py-14 sm:px-6 md:px-4 lg:px-[100px] lg:py-16">
        <div className="-mr-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pr-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-6 sm:gap-5 sm:pr-6 md:-mr-4 md:pr-4 lg:mr-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pr-0 lg:snap-none">
          {aboutData.stats.map((stat) => (
            <div
              key={stat.id}
              className="w-[min(220px,72vw)] shrink-0 snap-start rounded-2xl bg-white px-6 py-8 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)] lg:w-auto"
            >
              <p className="text-[2rem] font-bold leading-none text-[var(--brand-blue)] sm:text-[2.25rem]">
                {stat.value}
              </p>
              <p className="mt-3 text-[14px] font-semibold text-[var(--brand-navy)] sm:text-[15px]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
