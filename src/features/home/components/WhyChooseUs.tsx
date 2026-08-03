"use client";

import { ShieldCheckIcon } from "@/components/icons/ShieldCheckIcon";
import { DollarCircleIcon } from "@/components/icons/DollarCircleIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { BadgeCheckIcon } from "@/components/icons/BadgeCheckIcon";
import { useTranslations } from "next-intl";

const whyChooseIds = [
  { id: "verified", Icon: ShieldCheckIcon },
  { id: "price", Icon: DollarCircleIcon },
  { id: "agents", Icon: UserIcon },
  { id: "process", Icon: BadgeCheckIcon },
] as const;

export function WhyChooseUs() {
  const t = useTranslations("home");

  return (
    <section className="w-full bg-[#f5f7fa]">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 md:px-4 lg:px-[100px] lg:py-20">
        <h2 className="text-center text-[1.75rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-navy)] sm:text-[2rem] lg:text-[2.25rem]">
          {t("whyChooseTitle")}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-0">
          {whyChooseIds.map((item, index) => {
            const { Icon } = item;
            const titleKey = `why${item.id.charAt(0).toUpperCase()}${item.id.slice(1)}Title` as
              | "whyVerifiedTitle"
              | "whyPriceTitle"
              | "whyAgentsTitle"
              | "whyProcessTitle";
            const descKey = `why${item.id.charAt(0).toUpperCase()}${item.id.slice(1)}Desc` as
              | "whyVerifiedDesc"
              | "whyPriceDesc"
              | "whyAgentsDesc"
              | "whyProcessDesc";

            return (
              <div
                key={item.id}
                className={`flex flex-col items-center rounded-2xl bg-white px-4 py-6 text-center shadow-[0_4px_20px_rgba(15,23,42,0.06)] sm:px-6 sm:py-8 lg:rounded-none lg:bg-transparent lg:px-6 lg:py-0 lg:shadow-none ${
                  index > 0 ? "lg:border-s lg:border-[#dbe1ea]" : ""
                }`}
              >
                <Icon className="h-10 w-10 text-[var(--brand-navy)] sm:h-12 sm:w-12" />
                <h3 className="mt-4 text-[15px] font-bold text-[var(--brand-navy)] sm:mt-5 sm:text-[17px] lg:text-[18px]">
                  {t(titleKey)}
                </h3>
                <p className="mt-2 max-w-[220px] text-[13px] font-normal leading-relaxed text-[var(--muted)] sm:text-[14px]">
                  {t(descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
