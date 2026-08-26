import heroImage from "@/assets/images/hero.webp";
import { HeroBannerInteractive } from "@/features/home/components/HeroBannerInteractive";
import { PropertySearchBar } from "@/features/home/components/PropertySearchBar";
import { PropertyTypeCard } from "@/features/home/components/PropertyTypeCard";
import {
  buildPropertyTypeCardsFromCategories,
  isKnownPropertyTypeCardKey,
  propertyTypeCards,
  resolvePropertyTypeCardKey,
  withCategoryIdHrefs,
  type PublicCategoryItem,
} from "@/features/home/data";
import { resolveCategoryIdBySlug } from "@/features/products/data";
import type { PropertyFilterOptions } from "@/features/products/types";
import { getHeroSlides } from "@/lib/hero-slides";
import { getLocale, getTranslations } from "next-intl/server";

type HeroBannerProps = {
  filterOptions: PropertyFilterOptions;
  categories?: PublicCategoryItem[];
};

export async function HeroBanner({
  filterOptions,
  categories = [],
}: HeroBannerProps) {
  const locale = await getLocale();
  const isRtl = locale === "ar";
  const t = await getTranslations("home");
  const tTypes = await getTranslations("propertyTypes");
  const initialHeroSlides = await getHeroSlides();

  const cardCategories = categories.filter((category) => category.isVisible);

  const sourceCards =
    cardCategories.length > 0
      ? buildPropertyTypeCardsFromCategories(cardCategories, {
          includeMore: false,
          locale,
        })
      : withCategoryIdHrefs(
          propertyTypeCards.filter((item) => item.id !== "more"),
          (slug) => resolveCategoryIdBySlug(slug, filterOptions),
        );

  const cards = sourceCards.map((item) => {
    // Prefer DB name_ar / name. Fall back to message keys only when no
    // Arabic name is stored for a known English category slug.
    const category = cardCategories.find((entry) => entry.id === item.categoryId);
    const hasArabicName = Boolean(category?.nameAr?.trim());
    const knownKey = resolvePropertyTypeCardKey(category?.name ?? item.title);

    if (locale === "ar" && (hasArabicName || !isKnownPropertyTypeCardKey(knownKey))) {
      return {
        ...item,
        shortTitle: item.shortTitle ?? item.title,
        subtitle: item.subtitle || item.title,
      };
    }

    if (!isKnownPropertyTypeCardKey(knownKey)) {
      return {
        ...item,
        shortTitle: item.shortTitle ?? item.title,
        subtitle: item.subtitle || item.title,
      };
    }

    const subtitleKey = `${knownKey}Subtitle` as `${typeof knownKey}Subtitle`;
    return {
      ...item,
      title: tTypes(knownKey),
      subtitle: tTypes(subtitleKey),
      shortTitle: knownKey === "apartments" ? tTypes("apts") : tTypes(knownKey),
    };
  });

  const tabletCards = cards;
  const mobileCards = cards;
  const mobileCols = Math.max(mobileCards.length, 1);
  const desktopCols = Math.min(Math.max(tabletCards.length, 1), 6);

  return (
    <section className="relative w-full bg-white">
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
            <PropertySearchBar filterOptions={filterOptions} />
          </div>
        </div>
        </HeroBannerInteractive>
      </div>

      <div className="relative z-10 mx-auto -mt-[4.5rem] w-full px-3 sm:-mt-20 sm:px-6 md:-mt-18 md:px-4 lg:-mt-28 lg:px-[100px]">
        <div className="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.14)] ring-1 ring-black/[0.025] md:hidden">
          <div
            className="grid divide-x divide-[#e8edf4] rtl:divide-x-reverse"
            style={{
              gridTemplateColumns: `repeat(${mobileCols}, minmax(0, 1fr))`,
            }}
          >
            {mobileCards.map((item, index) => (
              <div
                key={item.id}
                className="min-w-0 animate-[heroRise_700ms_ease-out] [animation-fill-mode:both] motion-reduce:animate-none"
                style={{ animationDelay: `${120 + index * 60}ms` }}
              >
                <PropertyTypeCard
                  item={item}
                  compact
                  label={item.shortTitle ?? item.title}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden rounded-2xl bg-white p-2 shadow-[0_10px_30px_rgba(0,0,0,0.12)] md:block lg:hidden">
          <div
            className="grid divide-x divide-y divide-[#eef2f7] sm:divide-y-0 rtl:divide-x-reverse"
            style={{
              gridTemplateColumns: `repeat(${Math.min(tabletCards.length || 1, 6)}, minmax(0, 1fr))`,
            }}
          >
            {tabletCards.map((item, index) => (
              <div
                key={item.id}
                className="animate-[heroRise_700ms_ease-out] [animation-fill-mode:both]"
                style={{ animationDelay: `${120 + index * 60}ms` }}
              >
                <PropertyTypeCard item={item} compact />
              </div>
            ))}
          </div>
        </div>

        <div
          className="mx-auto hidden max-w-[1720px] justify-center gap-4 lg:grid"
          style={{
            gridTemplateColumns: `repeat(${desktopCols}, minmax(0, 1fr))`,
          }}
        >
          {tabletCards.map((item, index) => (
            <div
              key={item.id}
              className="animate-[heroRise_700ms_ease-out] [animation-fill-mode:both]"
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              <PropertyTypeCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
