import { aboutValues } from "@/features/about/data";

export function AboutValues() {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem] lg:text-[2.25rem]">
            What We Stand For
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
            The principles behind every property search, viewing, and purchase we support.
          </p>
        </div>

        <div className="mt-12 -mr-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-6 sm:pr-6 md:-mr-4 md:pr-4 lg:mr-0 lg:mt-14 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pr-0 lg:snap-none">
          {aboutValues.map((item) => {
            const { Icon, title, description } = item;

            return (
              <div
                key={item.id}
                className="flex w-[min(280px,80vw)] shrink-0 snap-start flex-col rounded-2xl border border-[#e8edf5] bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.05)] lg:w-auto"
              >
                <Icon className="h-11 w-11 text-[var(--brand-navy)]" />
                <h3 className="mt-5 text-[18px] font-bold text-[var(--brand-navy)]">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  {description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
