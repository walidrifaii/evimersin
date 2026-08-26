import { Suspense } from "react";
import { HeroBanner } from "@/features/home/components/HeroBanner";
import { FeaturedProperties } from "@/features/home/components/FeaturedProperties";
import { HotDeals } from "@/features/home/components/HotDeals";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";
import { NewsletterSection } from "@/features/home/components/NewsletterSection";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import {
  getFeaturedPropertyListingsPage,
  getHotDealPropertyListingsPage,
} from "@/features/products/server-data";
import { HOME_LISTINGS_PAGE_SIZE } from "@/features/products/types";

export const revalidate = 60;

async function FeaturedSection() {
  const initialPage = await getFeaturedPropertyListingsPage(
    1,
    HOME_LISTINGS_PAGE_SIZE,
  );
  if (initialPage.items.length === 0) return null;
  return <FeaturedProperties initialPage={initialPage} />;
}

async function HotDealsSection() {
  const initialPage = await getHotDealPropertyListingsPage(
    1,
    HOME_LISTINGS_PAGE_SIZE,
  );
  if (initialPage.items.length === 0) return null;
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
