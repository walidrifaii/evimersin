import type { Metadata } from "next";
import { AboutCta } from "@/features/about/components/AboutCta";
import { AboutHero } from "@/features/about/components/AboutHero";
import { AboutMission } from "@/features/about/components/AboutMission";
import { AboutStats } from "@/features/about/components/AboutStats";
import { AboutStory } from "@/features/about/components/AboutStory";
import { AboutValues } from "@/features/about/components/AboutValues";
import { config } from "@/constants/config";

export const metadata: Metadata = {
  title: `About Us | ${config.appName}`,
  description:
    "Learn about EviMersin — your trusted real estate partner in Mersin for verified properties, expert guidance, and a smooth buying experience.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <AboutHero />
      <AboutStory />
      <AboutStats />
      <AboutValues />
      <AboutMission />
      <AboutCta />
    </div>
  );
}
