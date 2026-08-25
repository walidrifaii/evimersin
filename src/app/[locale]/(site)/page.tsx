import { HeroBanner } from "@/features/home/components/HeroBanner";
import { FeaturedProperties } from "@/features/home/components/FeaturedProperties";
import { HotDeals } from "@/features/home/components/HotDeals";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";
import { NewsletterSection } from "@/features/home/components/NewsletterSection";
import {
  getFeaturedPropertyListings,
  getHotDealPropertyListings,
  getPropertyFilterOptions,
  getPublicCategories,
} from "@/features/products/server-data";
import { getLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const locale = await getLocale();
  const [filterOptions, categories, featuredListings, hotDeals] =
    await Promise.all([
      getPropertyFilterOptions(locale),
      getPublicCategories(),
      getFeaturedPropertyListings(12),
      getHotDealPropertyListings(12),
    ]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <HeroBanner filterOptions={filterOptions} categories={categories} />
      <FeaturedProperties listings={featuredListings} />
      <HotDeals listings={hotDeals} />
      <WhyChooseUs />
      <NewsletterSection />
    </div>
  );
}
