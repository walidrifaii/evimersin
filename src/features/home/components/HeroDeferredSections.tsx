import { Suspense } from "react";
import { PropertySearchBar } from "@/features/home/components/PropertySearchBar";
import { PropertyTypeCard } from "@/features/home/components/PropertyTypeCard";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import {
  buildPropertyTypeCardsFromCategories,
  isKnownPropertyTypeCardKey,
  propertyTypeCards,
  resolvePropertyTypeCardKey,
  withCategoryIdHrefs,
} from "@/features/home/data";
import { resolveCategoryIdBySlug } from "@/features/products/data";
import {
  getPropertyFilterOptions,
  getPublicCategories,
} from "@/features/products/server-data";
import { getLocale, getTranslations } from "next-intl/server";

async function HeroSearchBar() {
  const locale = await getLocale();
  const filterOptions = await getPropertyFilterOptions(locale);
  return <PropertySearchBar filterOptions={filterOptions} />;
}

async function HeroCategoryCards() {
  const locale = await getLocale();
  const tTypes = await getTranslations("propertyTypes");
  const categories = await getPublicCategories();
  const cardCategories = categories.filter((category) => category.isVisible);

  let sourceCards;
  if (cardCategories.length > 0) {
    sourceCards = buildPropertyTypeCardsFromCategories(cardCategories, {
      includeMore: false,
      locale,
    });
  } else {
    const filterOptions = await getPropertyFilterOptions(locale);
    sourceCards = withCategoryIdHrefs(
      propertyTypeCards.filter((item) => item.id !== "more"),
      (slug) => resolveCategoryIdBySlug(slug, filterOptions),
    );
  }

  const cards = sourceCards.map((item) => {
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
  );
}

export function HeroSearchBarSlot() {
  return (
    <Suspense fallback={<HomeSectionSkeleton variant="search" />}>
      <HeroSearchBar />
    </Suspense>
  );
}

export function HeroCategoryCardsSlot() {
  return (
    <Suspense fallback={<HomeSectionSkeleton variant="categories" />}>
      <HeroCategoryCards />
    </Suspense>
  );
}
