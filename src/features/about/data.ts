import type { ComponentType, SVGProps } from "react";
import aboutImage from "@/assets/images/about-building.png";
import { BadgeCheckIcon } from "@/components/icons/BadgeCheckIcon";
import { ShieldCheckIcon } from "@/components/icons/ShieldCheckIcon";
import { UserIcon } from "@/components/icons/UserIcon";

export const aboutData = {
  hero: {
    title: "About EviMersin",
    subtitle:
      "Your trusted partner for finding premium properties across Mersin and the Mediterranean coast.",
  },
  story: {
    eyebrow: "Our Story",
    title: "Helping you find the right home with confidence",
    paragraphs: [
      "EviMersin was built with a simple goal: make property buying in Mersin transparent, personal, and stress-free. From coastal villas to city apartments and investment land, we guide every client with local expertise and honest advice.",
      "We combine verified listings, market insight, and responsive support so you can explore options clearly, visit properties with confidence, and move forward at your own pace.",
    ],
    image: aboutImage,
    imageAlt: "Modern apartment building in Mersin",
  },
  stats: [
    { id: "listings", value: "250+", label: "Verified Listings" },
    { id: "clients", value: "1,200+", label: "Happy Clients" },
    { id: "experience", value: "10+", label: "Years Experience" },
    { id: "areas", value: "15+", label: "Areas Covered" },
  ],
  mission: {
    title: "Our Mission",
    description:
      "To connect people with properties they love through trusted guidance, verified listings, and a smooth experience from first inquiry to final handover.",
    points: [
      "Transparent pricing and honest property details",
      "Personal support from local real estate experts",
      "A seamless journey for buyers, sellers, and investors",
    ],
  },
} as const;

export type AboutValueItem = {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const aboutValues: AboutValueItem[] = [
  {
    id: "trust",
    title: "Built on Trust",
    description: "Every listing is reviewed so you can search with confidence.",
    Icon: ShieldCheckIcon,
  },
  {
    id: "local",
    title: "Local Expertise",
    description: "Our team knows Mersin neighborhoods, trends, and opportunities.",
    Icon: UserIcon,
  },
  {
    id: "service",
    title: "End-to-End Support",
    description: "From shortlisting to viewing and paperwork, we stay with you.",
    Icon: BadgeCheckIcon,
  },
];
