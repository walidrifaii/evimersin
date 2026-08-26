import { Suspense } from "react";
import heroImage from "@/assets/images/hero.webp";
import { HeroBannerInteractive } from "@/features/home/components/HeroBannerInteractive";
import {
  HeroCategoryCardsSlot,
  HeroSearchBarSlot,
} from "@/features/home/components/HeroDeferredSections";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import { getHeroSlides } from "@/lib/hero-slides";
import { getLocale, getTranslations } from "next-intl/server";

function HeroTopFallback() {
  return (
    <div className="relative min-h-[78vh] w-full bg-[#0b1f3a] lg:min-h-[820px]">
      <div className="mx-auto flex min-h-[78vh] flex-col justify-start px-4 pb-32 pt-14 sm:px-6 lg:px-[100px] lg:pt-28">
        <div className="h-12 w-72 animate-pulse rounded-xl bg-white/15 sm:h-16 sm:w-[28rem]" />
        <div className="mt-6 h-5 w-full max-w-md animate-pulse rounded-lg bg-white/10" />
        <div className="mt-10">
          <HomeSectionSkeleton variant="search" />
        </div>
      </div>
    </div>
  );
}

async function HeroTop() {
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const t = await getTranslations("home");
  const initialHeroSlides = await getHeroSlides();

  return (
    <div className="relative min-h-[78vh] w-full lg:min-h-[820px]">
      <HeroBannerInteractive
        initialSlides={initialHeroSlides}
        fallbackImage={heroImage}
        fallbackAlt={t("heroImageAlt")}
      >
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className="pointer-events-none relative z-30 mx-auto flex h-full min-h-[78vh] w-full flex-col items-start justify-start px-4 pb-32 pt-14 text-start sm:px-6 md:px-4 md:pb-36 md:pt-16 lg:px-[100px] lg:pb-48 lg:pt-28"
        >
          <div
            className={`w-full max-w-[640px] animate-[heroFade_700ms_ease-out] ${
              isRtl ? "lg:ml-auto lg:mr-0" : ""
            }`}
          >
            <h1 className="text-start text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[3rem] lg:text-[3.75rem]">
              <span>{t("heroTitle")}</span>
              <br />
              <span className="mt-2 block sm:mt-3">{t("heroTitleAccent")}</span>
            </h1>
            <p className="mt-6 text-start text-[0.95rem] font-normal leading-relaxed text-white/90 sm:mt-8 sm:text-[1.125rem]">
              {t("heroSubtitle")}
            </p>
          </div>

          <div className="pointer-events-auto relative z-40 mt-8 w-full animate-[heroFade_900ms_ease-out] sm:mt-10">
            <HeroSearchBarSlot />
          </div>
        </div>
      </HeroBannerInteractive>
    </div>
  );
}

/** Sync shell — hero, search, and categories stream independently with skeletons. */
export function HeroBanner() {
  return (
    <section className="relative w-full bg-white">
      <Suspense fallback={<HeroTopFallback />}>
        <HeroTop />
      </Suspense>
      <HeroCategoryCardsSlot />
    </section>
  );
}
