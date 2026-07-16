import { whyChooseUsItems } from "@/features/home/data";

export function WhyChooseUs() {
  return (
    <section className="w-full bg-[#f5f7fa]">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <h2 className="text-center text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem] lg:text-[2.25rem]">
          Why Choose EviMersin?
        </h2>

        <div className="mt-12 -mr-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-6 sm:pr-6 md:-mr-4 md:pr-4 lg:mr-0 lg:mt-14 lg:grid lg:grid-cols-4 lg:gap-0 lg:overflow-visible lg:pr-0 lg:snap-none">
          {whyChooseUsItems.map((item, index) => {
            const { Icon, title, description } = item;

            return (
              <div
                key={item.id}
                className={`flex w-[min(260px,78vw)] shrink-0 snap-start flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)] lg:w-auto lg:rounded-none lg:bg-transparent lg:px-6 lg:py-0 lg:shadow-none ${
                  index > 0 ? "lg:border-l lg:border-[#dbe1ea]" : ""
                }`}
              >
                <Icon className="h-12 w-12 text-[var(--brand-navy)]" />
                <h3 className="mt-5 text-[17px] font-bold text-[var(--brand-navy)] sm:text-[18px]">
                  {title}
                </h3>
                <p className="mt-2 max-w-[220px] text-[14px] font-normal leading-relaxed text-[var(--muted)]">
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
