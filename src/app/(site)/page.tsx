import { HeroBanner } from "@/features/home/components/HeroBanner";
import { FeaturedProperties } from "@/features/home/components/FeaturedProperties";
import { HotDeals } from "@/features/home/components/HotDeals";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";
import {
  getFeaturedPropertyListings,
  getHotDealPropertyListings,
  getPropertyFilterOptions,
} from "@/features/products/server-data";

export const revalidate = 60;

export default async function HomePage() {
  const [filterOptions, featuredListings, hotDeals] = await Promise.all([
    getPropertyFilterOptions(),
    getFeaturedPropertyListings(4),
    getHotDealPropertyListings(4),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <HeroBanner filterOptions={filterOptions} />
      <FeaturedProperties listings={featuredListings} />
      <HotDeals listings={hotDeals} />
      <WhyChooseUs />
    </div>
  );
}
