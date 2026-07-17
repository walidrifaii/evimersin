import { HeroBanner } from "@/features/home/components/HeroBanner";
import { FeaturedProperties } from "@/features/home/components/FeaturedProperties";
import { HotDeals } from "@/features/home/components/HotDeals";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";
import { buildPropertyFilterOptions } from "@/features/products/data";
import { getPropertyListings } from "@/features/products/server-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const listings = await getPropertyListings();
  const filterOptions = buildPropertyFilterOptions(listings);
  const featuredListings = listings.filter((item) => item.featured).slice(0, 4);
  const hotDeals = listings.filter((item) => item.hotDeal).slice(0, 4);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <HeroBanner filterOptions={filterOptions} />
      <FeaturedProperties listings={featuredListings} />
      <HotDeals listings={hotDeals} />
      <WhyChooseUs />
    </div>
  );
}
