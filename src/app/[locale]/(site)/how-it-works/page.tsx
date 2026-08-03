import type { Metadata } from "next";
import { HowItWorksCta } from "@/features/how-it-works/components/HowItWorksCta";
import { HowItWorksFaq } from "@/features/how-it-works/components/HowItWorksFaq";
import { HowItWorksHero } from "@/features/how-it-works/components/HowItWorksHero";
import { HowItWorksSteps } from "@/features/how-it-works/components/HowItWorksSteps";
import { config } from "@/constants/config";

export const metadata: Metadata = {
  title: `How It Works | ${config.appName}`,
  description:
    "Learn how EviMersin helps you find, view, and buy property in Mersin — from browsing listings to closing your deal with expert support.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <HowItWorksHero />
      <HowItWorksSteps />
      <HowItWorksFaq />
      <HowItWorksCta />
    </div>
  );
}
