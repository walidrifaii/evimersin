import { HeroBanner } from "@/features/home/components/HeroBanner";
import { FeaturedProperties } from "@/features/home/components/FeaturedProperties";
import { HotDeals } from "@/features/home/components/HotDeals";
import { WhyChooseUs } from "@/features/home/components/WhyChooseUs";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <HeroBanner />
      <FeaturedProperties />
      <HotDeals />
      <WhyChooseUs />
    </div>
  );
}
