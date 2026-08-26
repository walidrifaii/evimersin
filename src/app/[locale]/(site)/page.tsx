import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { HeroBanner } from "@/features/home/components/HeroBanner";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import {
  getFeaturedPropertyListingsPage,
  getHotDealPropertyListingsPage,
} from "@/features/products/server-data";
import { HOME_LISTINGS_PAGE_SIZE } from "@/features/products/types";

export const revalidate = 60;

const FeaturedProperties = nextDynamic(
  () =>
    import("@/features/home/components/FeaturedProperties").then((mod) => ({
      default: mod.FeaturedProperties,
    })),
  { loading: () => <HomeSectionSkeleton variant="cards" /> },
);

const HotDeals = nextDynamic(
  () =>
    import("@/features/home/components/HotDeals").then((mod) => ({
      default: mod.HotDeals,
    })),
  { loading: () => <HomeSectionSkeleton variant="cards" /> },
);

const WhyChooseUs = nextDynamic(
  () =>
    import("@/features/home/components/WhyChooseUs").then((mod) => ({
      default: mod.WhyChooseUs,
    })),
  { loading: () => <HomeSectionSkeleton variant="plain" /> },
);

const NewsletterSection = nextDynamic(
  () =>
    import("@/features/home/components/NewsletterSection").then((mod) => ({
      default: mod.NewsletterSection,
    })),
  { loading: () => <HomeSectionSkeleton variant="newsletter" /> },
);

async function FeaturedSection() {
  const initialPage = await getFeaturedPropertyListingsPage(
    1,
    HOME_LISTINGS_PAGE_SIZE,
  );
  return <FeaturedProperties initialPage={initialPage} />;
}

async function HotDealsSection() {
  const initialPage = await getHotDealPropertyListingsPage(
    1,
    HOME_LISTINGS_PAGE_SIZE,
  );
  return <HotDeals initialPage={initialPage} />;
}

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <HeroBanner />

      <Suspense fallback={<HomeSectionSkeleton variant="cards" />}>
        <FeaturedSection />
      </Suspense>

      <Suspense fallback={<HomeSectionSkeleton variant="cards" />}>
        <HotDealsSection />
      </Suspense>

      <WhyChooseUs />
      <NewsletterSection />
    </div>
  );
}
