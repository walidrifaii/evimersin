import type { StaticImageData } from "next/image";
import type { ComponentType, SVGProps } from "react";
import featuredPropertyImage from "@/assets/images/featured-property.png";
import { BadgeCheckIcon } from "@/components/icons/BadgeCheckIcon";
import { DollarCircleIcon } from "@/components/icons/DollarCircleIcon";
import { MoreCircleIcon } from "@/components/icons/MoreCircleIcon";
import { ShieldCheckIcon } from "@/components/icons/ShieldCheckIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { ApartmentIcon } from "@/components/icons/ApartmentIcon";
import { CommercialIcon } from "@/components/icons/CommercialIcon";
import { LandIcon } from "@/components/icons/LandIcon";
import { StudioIcon } from "@/components/icons/StudioIcon";
import { VillaIcon } from "@/components/icons/VillaIcon";
import { routes } from "@/constants/routes";

export const homeData = {
  title: "Find Your",
  titleAccent: "Dream Property",
  subtitle: "Discover the best properties in Mersin",
  search: {
    city: {
      label: "City",
      placeholder: "All Cities",
      options: ["All Cities", "Mersin", "Tarsus", "Erdemli", "Silifke", "Anamur", "Mut"],
    },
    propertyType: {
      label: "Property Type",
      placeholder: "All Types",
      options: ["All Types", "Villa", "Apartment", "Studio", "Land", "Commercial", "Penthouse"],
    },
    purpose: {
      label: "Purpose",
      placeholder: "Buy / Rent",
      options: ["Buy / Rent", "For Sale", "For Rent", "Daily Rent"],
    },
    priceRange: {
      label: "Price Range",
      placeholder: "Any Price",
      options: ["Any Price", "$0 - $50,000", "$50,000 - $100,000", "$100,000 - $200,000", "$200,000 - $500,000", "$500,000+"],
    },
    button: "Search Property",
  },
} as const;

export type PropertyTypeCardItem = {
  id: string;
  title: string;
  shortTitle?: string;
  subtitle: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type FeaturedPropertyItem = {
  id: string;
  badge: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqm: number;
  image: StaticImageData;
  href: string;
};

export type HotDealItem = {
  id: string;
  discount: string;
  title: string;
  location: string;
  originalPrice: string;
  salePrice: string;
  image: StaticImageData;
  href: string;
};

export const hotDeals: HotDealItem[] = [
  {
    id: "mezitli-villa-deal",
    discount: "-15%",
    title: "Luxury Villa in Mezitli",
    location: "Mezitli, Mersin",
    originalPrice: "$500,000",
    salePrice: "$425,000",
    image: featuredPropertyImage,
    href: routes.property("mezitli-villa"),
  },
  {
    id: "marina-apartment-deal",
    discount: "-10%",
    title: "Modern Apartment",
    location: "Mersin, Marina District",
    originalPrice: "$200,000",
    salePrice: "$180,000",
    image: featuredPropertyImage,
    href: routes.property("city-apartment"),
  },
  {
    id: "erdemli-land-deal",
    discount: "-20%",
    title: "Coastal Land Plot",
    location: "Erdemli, Mersin",
    originalPrice: "$150,000",
    salePrice: "$120,000",
    image: featuredPropertyImage,
    href: routes.property("erdemli-land"),
  },
  {
    id: "tarsus-villa-deal",
    discount: "-12%",
    title: "Family Villa with Garden",
    location: "Tarsus, Mersin",
    originalPrice: "$312,000",
    salePrice: "$275,000",
    image: featuredPropertyImage,
    href: routes.property("tarsus-villa"),
  },
];

export const featuredProperties: FeaturedPropertyItem[] = [
  {
    id: "sea-view-villa",
    badge: "FEATURED",
    title: "Luxury Villa in Mezitli",
    location: "Mezitli, Mersin",
    price: "$350,000",
    beds: 4,
    baths: 3,
    sqm: 280,
    image: featuredPropertyImage,
    href: routes.property("mezitli-villa"),
  },
  {
    id: "luxury-apartment",
    badge: "APARTMENT",
    title: "Modern City Apartment",
    location: "Mersin, City Center",
    price: "$70,000 / Month",
    beds: 2,
    baths: 2,
    sqm: 120,
    image: featuredPropertyImage,
    href: routes.property("city-apartment"),
  },
  {
    id: "downtown-studio",
    badge: "STUDIO",
    title: "Cozy Studio Downtown",
    location: "Mersin, Yenişehir",
    price: "$55,000",
    beds: 1,
    baths: 1,
    sqm: 45,
    image: featuredPropertyImage,
    href: routes.property("downtown-studio"),
  },
  {
    id: "land-plot",
    badge: "LAND",
    title: "Prime Land Plot",
    location: "Erdemli, Mersin",
    price: "$120,000",
    beds: 0,
    baths: 0,
    sqm: 500,
    image: featuredPropertyImage,
    href: routes.property("erdemli-land"),
  },
];

export type WhyChooseUsItem = {
  id: string;
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const whyChooseUsItems: WhyChooseUsItem[] = [
  {
    id: "verified",
    title: "Verified Properties",
    description: "All properties are verified for your peace of mind.",
    Icon: ShieldCheckIcon,
  },
  {
    id: "price",
    title: "Best Price Guarantee",
    description: "We offer the best prices in the market.",
    Icon: DollarCircleIcon,
  },
  {
    id: "agents",
    title: "Expert Agents",
    description: "Our agents are always here to help you.",
    Icon: UserIcon,
  },
  {
    id: "process",
    title: "Fast & Easy Process",
    description: "Find, visit and buy your property easily.",
    Icon: BadgeCheckIcon,
  },
];

export const propertyTypeCards: PropertyTypeCardItem[] = [
  {
    id: "villas",
    title: "Villas",
    subtitle: "Luxury Villas",
    href: `${routes.properties}?type=villas`,
    Icon: VillaIcon,
  },
  {
    id: "apartments",
    title: "Apartments",
    shortTitle: "Apts",
    subtitle: "Modern Apartments",
    href: `${routes.properties}?type=apartments`,
    Icon: ApartmentIcon,
  },
  {
    id: "studios",
    title: "Studios",
    subtitle: "Comfortable Studios",
    href: `${routes.properties}?type=studios`,
    Icon: StudioIcon,
  },
  {
    id: "lands",
    title: "Lands",
    subtitle: "Prime Land Plots",
    href: `${routes.properties}?type=lands`,
    Icon: LandIcon,
  },
  {
    id: "commercial",
    title: "Commercial",
    subtitle: "Commercial Spaces",
    href: `${routes.properties}?type=commercial`,
    Icon: CommercialIcon,
  },
  {
    id: "more",
    title: "More",
    subtitle: "Browse More",
    href: routes.properties,
    Icon: MoreCircleIcon,
  },
];
