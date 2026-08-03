import { getTranslations } from "next-intl/server";
import { howItWorksSteps } from "@/features/how-it-works/data";

const stepKeys = [
  { title: "step1Title", description: "step1Desc" },
  { title: "step2Title", description: "step2Desc" },
  { title: "step3Title", description: "step3Desc" },
  { title: "step4Title", description: "step4Desc" },
] as const;

export async function HowItWorksSteps() {
  const t = await getTranslations("howItWorks");

  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem] lg:text-[2.35rem]">
            {t("stepsTitle")}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)] sm:text-[16px]">
            {t("stepsDescription")}
          </p>
        </div>

        <div className="mt-12 -mr-4 flex snap-x snap-mandatory gap-5 overflow-x-auto pr-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mr-6 sm:pr-6 md:-mr-4 md:pr-4 lg:mr-0 lg:mt-14 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pr-0 lg:snap-none">
          {howItWorksSteps.map((item, index) => {
            const { Icon, step } = item;
            const keys = stepKeys[index];

            return (
              <div
                key={item.id}
                className="relative flex w-[min(280px,80vw)] shrink-0 snap-start flex-col rounded-2xl border border-[#e8edf5] bg-white p-7 shadow-[0_4px_20px_rgba(15,23,42,0.06)] lg:w-auto"
              >
                {index < howItWorksSteps.length - 1 ? (
                  <span
                    className="absolute right-0 top-1/2 hidden h-px w-6 translate-x-full bg-[#dbe1ea] lg:block"
                    aria-hidden="true"
                  />
                ) : null}

                <span className="text-[2rem] font-bold leading-none text-[var(--brand-red)]/20">
                  {step}
                </span>
                <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[var(--brand-blue)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-[18px] font-bold text-[var(--brand-navy)]">
                  {t(keys.title)}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  {t(keys.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
