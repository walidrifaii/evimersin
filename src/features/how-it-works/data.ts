import type { IconType } from "react-icons";
import {
  HiOutlineCalendar,
  HiOutlineCheckCircle,
  HiOutlineHome,
  HiOutlineSearch,
} from "react-icons/hi";

export const howItWorksData = {
  hero: {
    title: "How It Works",
    subtitle:
      "Finding your property in Mersin is simple. Browse listings, connect with our team, and move forward with expert support at every step.",
  },
  stepsIntro: {
    title: "Your Property Journey in 4 Steps",
    description:
      "From your first search to final handover, we make the process clear, guided, and stress-free.",
  },
  faqIntro: {
    title: "Frequently Asked Questions",
    description: "Quick answers to common questions about buying property with EviMersin.",
  },
} as const;

export type HowItWorksStep = {
  id: string;
  step: string;
  title: string;
  description: string;
  Icon: IconType;
};

export const howItWorksSteps: HowItWorksStep[] = [
  {
    id: "search",
    step: "01",
    title: "Browse Properties",
    description:
      "Explore verified listings by city, property type, and budget. Filter villas, apartments, studios, land, and commercial spaces.",
    Icon: HiOutlineSearch,
  },
  {
    id: "contact",
    step: "02",
    title: "Contact Our Team",
    description:
      "Reach out via WhatsApp, phone, or our contact form. We help you shortlist options and schedule property viewings.",
    Icon: HiOutlineCalendar,
  },
  {
    id: "visit",
    step: "03",
    title: "Visit & Compare",
    description:
      "Tour properties with local experts, ask questions, and compare locations, pricing, and features before you decide.",
    Icon: HiOutlineHome,
  },
  {
    id: "close",
    step: "04",
    title: "Close the Deal",
    description:
      "We guide you through paperwork, negotiations, and final steps so you can complete your purchase with confidence.",
    Icon: HiOutlineCheckCircle,
  },
];

export const howItWorksFaqs = [
  {
    id: "cost",
    question: "Is there a fee to use EviMersin?",
    answer:
      "Browsing listings and contacting our team is free. Any service or agency fees will be explained clearly before you proceed.",
  },
  {
    id: "viewing",
    question: "How do I schedule a property viewing?",
    answer:
      "Contact us through WhatsApp, phone, or the contact form. Share the property you are interested in and we will arrange a visit.",
  },
  {
    id: "areas",
    question: "Which areas in Mersin do you cover?",
    answer:
      "We cover Mersin and surrounding areas including Yenişehir, Mezitli, Tarsus, Erdemli, and other popular neighborhoods.",
  },
  {
    id: "support",
    question: "Do you help with paperwork and negotiations?",
    answer:
      "Yes. Our team supports you through viewings, negotiations, and the closing process for a smooth buying experience.",
  },
] as const;
