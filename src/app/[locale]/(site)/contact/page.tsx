import type { Metadata } from "next";
import { ContactHero } from "@/features/contact/components/ContactHero";
import { ContactSection } from "@/features/contact/components/ContactSection";
import { config } from "@/constants/config";

export const metadata: Metadata = {
  title: `Contact Us | ${config.appName}`,
  description:
    "Contact EviMersin for property inquiries, viewings, and expert real estate guidance in Mersin, Turkey.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <ContactHero />
      <ContactSection />
    </div>
  );
}
