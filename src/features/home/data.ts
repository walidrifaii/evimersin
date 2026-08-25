import type { StaticImageData } from "next/image";
import type { ComponentType, SVGProps } from "react";
import featuredPropertyImage from "@/assets/images/featured-property.webp";
import { BadgeCheckIcon } from "@/components/icons/BadgeCheckIcon";
import { DollarCircleIcon } from "@/components/icons/DollarCircleIcon";
import { MoreCircleIcon } from "@/components/icons/MoreCircleIcon";
import { ShieldCheckIcon } from "@/components/icons/ShieldCheckIcon";
import { UserIcon } from "@/components/icons/UserIcon";
import { ApartmentIcon } from "@/components/icons/ApartmentIcon";
import { CommercialIcon } from "@/components/icons/CommercialIcon";
import { LandIcon } from "@/components/icons/LandIcon";
import { ShopIcon } from "@/components/icons/ShopIcon";
import { StudioIcon } from "@/components/icons/StudioIcon";
import { VillaIcon } from "@/components/icons/VillaIcon";
import { routes } from "@/constants/routes";

export const homeData = {
  title: "Find Your",
  titleAccent: "Dream Property",
  subtitle: "Discover the best properties in Lebanon",
  search: {
    city: {
      label: "City",
      placeholder: "All Cities",
      options: ["All Cities", "Mersin", "Tarsus", "Erdemli", "Silifke", "Anamur", "Mut"],
    },
    propertyType: {
      label: "Property Type",
      placeholder: "All Types",
      options: ["All Types", "Villa", "Apartment", "Studio", "Land", "Shop", "Commercial", "Penthouse"],
    },
    purpose: {
      label: "Purpose",
      placeholder: "Buy / Rent",
      options: ["Buy / Rent", "For Sale", "For Rent", "Daily Rent"],
    },
    priceRange: {
      label: "Price Range",
      placeholder: "Any Price",
      options: [
        "Any Price",
        "$0 - $100,000",
        "$100,000 - $500,000",
        "$500,000 - $1,000,000",
        "$1,000,000+",
      ],
    },
    button: "Search Property",
  },
} as const;

export type PropertyTypeCardId =
  | "villas"
  | "apartments"
  | "studios"
  | "lands"
  | "shops"
  | "commercial"
  | "office"
  | "more";

export type PublicCategoryItem = {
  id: number;
  name: string;
  icon: string | null;
  position: number;
};

export type PropertyTypeCardItem = {
  id: string;
  title: string;
  shortTitle?: string;
  subtitle: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconSrc?: string | null;
  categoryId?: number | null;
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

const propertyTypeIconByKey: Record<
  string,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  villa: VillaIcon,
  villas: VillaIcon,
  apartment: ApartmentIcon,
  apartments: ApartmentIcon,
  apts: ApartmentIcon,
  studio: StudioIcon,
  studios: StudioIcon,
  land: LandIcon,
  lands: LandIcon,
  shop: ShopIcon,
  shops: ShopIcon,
  commercial: CommercialIcon,
  office: CommercialIcon,
  offices: CommercialIcon,
  penthouse: ApartmentIcon,
  penthouses: ApartmentIcon,
};

const propertyTypeCardKeyByLabel: Record<
  string,
  Exclude<PropertyTypeCardId, "more">
> = {
  villa: "villas",
  villas: "villas",
  apartment: "apartments",
  apartments: "apartments",
  apts: "apartments",
  studio: "studios",
  studios: "studios",
  land: "lands",
  lands: "lands",
  shop: "shops",
  shops: "shops",
  commercial: "commercial",
  office: "office",
  offices: "office",
};

/** Fallback SVG icons when a category has no uploaded icon. */
export function getPropertyTypeFallbackIcon(
  name: string,
): ComponentType<SVGProps<SVGSVGElement>> {
  const key = name.trim().toLowerCase().replace(/\s+/g, "");
  return propertyTypeIconByKey[key] ?? ApartmentIcon;
}

const knownPropertyTypeCardKeys = new Set<Exclude<PropertyTypeCardId, "more">>([
  "villas",
  "apartments",
  "studios",
  "lands",
  "shops",
  "commercial",
  "office",
]);

export function resolvePropertyTypeCardKey(
  name: string,
): Exclude<PropertyTypeCardId, "more"> | null {
  const key = name.trim().toLowerCase().replace(/\s+/g, "");
  return propertyTypeCardKeyByLabel[key] ?? null;
}

/** Only true for labels that have entries in messages `propertyTypes`. */
export function isKnownPropertyTypeCardKey(
  key: string | null | undefined,
): key is Exclude<PropertyTypeCardId, "more"> {
  return Boolean(key && knownPropertyTypeCardKeys.has(key as Exclude<PropertyTypeCardId, "more">));
}

export const morePropertyTypeCard: PropertyTypeCardItem = {
  id: "more",
  title: "More",
  subtitle: "Browse More",
  href: routes.properties,
  Icon: MoreCircleIcon,
  iconSrc: null,
  categoryId: null,
};

/** Hardcoded fallbacks only when the backend returns no active categories. */
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
    id: "lands",
    title: "Lands",
    subtitle: "Prime Land Plots",
    href: `${routes.properties}?type=lands`,
    Icon: LandIcon,
  },
  {
    id: "shops",
    title: "Shops",
    subtitle: "Retail Shops",
    href: `${routes.properties}?type=shops`,
    Icon: ShopIcon,
  },
  {
    id: "commercial",
    title: "Commercial",
    subtitle: "Commercial Spaces",
    href: `${routes.properties}?type=commercial`,
    Icon: CommercialIcon,
  },
  morePropertyTypeCard,
];

export function buildPropertyTypeCardsFromCategories(
  categories: PublicCategoryItem[],
  options?: { includeMore?: boolean },
): PropertyTypeCardItem[] {
  const cards = categories.map((category) => {
    const typeKey = resolvePropertyTypeCardKey(category.name);
    return {
      id: typeKey ?? `category-${category.id}`,
      title: category.name,
      shortTitle:
        typeKey === "apartments"
          ? "Apts"
          : category.name.length > 10
            ? `${category.name.slice(0, 8)}…`
            : category.name,
      subtitle: category.name,
      href: `${routes.properties}?categoryId=${category.id}`,
      Icon: getPropertyTypeFallbackIcon(category.name),
      iconSrc: category.icon,
      categoryId: category.id,
    } satisfies PropertyTypeCardItem;
  });

  if (options?.includeMore === false) return cards;
  return [...cards, morePropertyTypeCard];
}

export function withCategoryIdHrefs(
  cards: PropertyTypeCardItem[],
  resolveCategoryId: (slug: string) => number | null,
) {
  return cards.map((card) => {
    if (card.id === "more" || card.categoryId != null) return card;
    const categoryId = resolveCategoryId(card.id);
    return {
      ...card,
      categoryId,
      href:
        categoryId !== null
          ? `${routes.properties}?categoryId=${categoryId}`
          : routes.properties,
    };
  });
}
