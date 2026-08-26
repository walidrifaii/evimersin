import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { HeroBanner } from "@/features/home/components/HeroBanner";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import {
  getFeaturedPropertyListings,
  getHotDealPropertyListings,
} from "@/features/products/server-data";

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
  const listings = await getFeaturedPropertyListings(12);
  return <FeaturedProperties listings={listings} />;
}

async function HotDealsSection() {
  const listings = await getHotDealPropertyListings(12);
  return <HotDeals listings={listings} />;
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
