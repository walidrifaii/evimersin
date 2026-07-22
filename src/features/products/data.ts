import featuredPropertyImage from "@/assets/images/featured-property.webp";
import aboutBuildingImage from "@/assets/images/about-building.webp";
import type { StaticImageData } from "next/image";
import { routes } from "@/constants/routes";
import type {
  PropertyFilterOptions,
  PropertyFiltersState,
  PropertyListing,
} from "./types";

export const propertyFilterOptions: PropertyFilterOptions = {
  city: ["All Cities", "Mersin", "Tarsus", "Erdemli", "Silifke", "Anamur", "Mut"],
  propertyType: [
    "All Types",
    "Villa",
    "Apartment",
    "Studio",
    "Land",
    "Commercial",
    "Penthouse",
  ],
  purpose: ["Buy / Rent", "For Sale", "For Rent", "Daily Rent"],
  sort: [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "featured", label: "Featured First" },
  ],
  priceMin: 0,
  priceMax: 1_000_000,
};

export const defaultPropertyFilters: PropertyFiltersState = {
  city: "All Cities",
  propertyType: "All Types",
  purpose: "Buy / Rent",
  priceMin: propertyFilterOptions.priceMin,
  priceMax: propertyFilterOptions.priceMax,
  sort: "newest",
};

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function buildPropertyFilterOptions(
  listings: Array<
    Pick<PropertyListing, "city" | "propertyType" | "purpose" | "priceValue">
  >,
  lookups?: {
    cities?: string[];
    propertyTypes?: string[];
    purposes?: string[];
  },
): PropertyFilterOptions {
  const maxPrice = Math.max(
    propertyFilterOptions.priceMax,
    ...listings.map((item) => Math.ceil(item.priceValue / 10000) * 10000),
  );

  const cities =
    lookups?.cities && lookups.cities.length > 0
      ? uniqueSorted(lookups.cities)
      : uniqueSorted(listings.map((item) => item.city));

  const propertyTypes =
    lookups?.propertyTypes && lookups.propertyTypes.length > 0
      ? uniqueSorted(lookups.propertyTypes)
      : uniqueSorted(listings.map((item) => item.propertyType));

  const purposes =
    lookups?.purposes && lookups.purposes.length > 0
      ? uniqueSorted(lookups.purposes)
      : uniqueSorted(listings.map((item) => item.purpose));

  return {
    ...propertyFilterOptions,
    city: ["All Cities", ...cities],
    propertyType: ["All Types", ...propertyTypes],
    purpose: ["Buy / Rent", ...purposes],
    priceMax: maxPrice,
  };
}

export function getDefaultPropertyFilters(
  options: PropertyFilterOptions = propertyFilterOptions,
): PropertyFiltersState {
  return {
    city: options.city[0] ?? "All Cities",
    propertyType: options.propertyType[0] ?? "All Types",
    purpose: options.purpose[0] ?? "Buy / Rent",
    priceMin: options.priceMin,
    priceMax: options.priceMax,
    sort: "newest",
  };
}

const typeQueryMap: Record<string, string> = {
  villas: "Villa",
  villa: "Villa",
  apartments: "Apartment",
  apartment: "Apartment",
  apts: "Apartment",
  studios: "Studio",
  studio: "Studio",
  lands: "Land",
  land: "Land",
  commercial: "Commercial",
  penthouse: "Penthouse",
  penthouses: "Penthouse",
};

export function getPropertyTypeFromQuery(type?: string | null) {
  if (!type) return null;
  const normalized = type.trim().toLowerCase();
  return typeQueryMap[normalized] ?? null;
}

function findOptionMatch(value: string | null | undefined, options: string[]) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return (
    options.find((option) => option.toLowerCase() === normalized) ??
    options.find((option) => option.toLowerCase().replace(/s$/, "") === normalized.replace(/s$/, "")) ??
    null
  );
}

export function filtersFromSearchParams(params: {
  type?: string | null;
  city?: string | null;
  purpose?: string | null;
  priceMin?: string | null;
  priceMax?: string | null;
}, options: PropertyFilterOptions = propertyFilterOptions): PropertyFiltersState {
  const defaults = getDefaultPropertyFilters(options);
  const propertyTypeAlias = getPropertyTypeFromQuery(params.type);
  const propertyType =
    findOptionMatch(propertyTypeAlias, options.propertyType) ??
    findOptionMatch(params.type, options.propertyType) ??
    defaults.propertyType;

  const city =
    findOptionMatch(params.city, options.city) ?? defaults.city;

  const purpose =
    findOptionMatch(params.purpose, options.purpose) ?? defaults.purpose;

  const parsedMin = Number(params.priceMin);
  const parsedMax = Number(params.priceMax);
  const priceMin = Number.isFinite(parsedMin)
    ? Math.max(options.priceMin, Math.min(parsedMin, options.priceMax))
    : defaults.priceMin;
  const priceMax = Number.isFinite(parsedMax)
    ? Math.max(priceMin, Math.min(parsedMax, options.priceMax))
    : defaults.priceMax;

  return {
    ...defaults,
    propertyType,
    city,
    purpose,
    priceMin,
    priceMax,
  };
}

function gallery(...images: StaticImageData[]) {
  return images;
}

export const propertiesListings: PropertyListing[] = [
  {
    id: "mezitli-villa",
    badge: "FEATURED",
    title: "Luxury Villa in Mezitli",
    location: "Mezitli, Mersin",
    city: "Mersin",
    propertyType: "Villa",
    purpose: "For Sale",
    price: "$350,000",
    priceValue: 350000,
    beds: 4,
    baths: 3,
    sqm: 280,
    image: featuredPropertyImage,
    images: gallery(
      featuredPropertyImage,
      aboutBuildingImage,
      featuredPropertyImage,
      aboutBuildingImage,
      featuredPropertyImage,
      aboutBuildingImage,
    ),
    description:
      "A stunning luxury villa featuring modern architecture, spacious living areas, a private garden, and a swimming pool. Perfect for families seeking comfort and elegance by the Mediterranean coast.",
    href: routes.property("mezitli-villa"),
    featured: true,
  },
  {
    id: "city-apartment",
    badge: "APARTMENT",
    title: "Modern City Apartment",
    location: "Yenişehir, Mersin",
    city: "Mersin",
    propertyType: "Apartment",
    purpose: "For Sale",
    price: "$185,000",
    priceValue: 185000,
    beds: 2,
    baths: 2,
    sqm: 120,
    image: aboutBuildingImage,
    images: gallery(
      aboutBuildingImage,
      featuredPropertyImage,
      aboutBuildingImage,
      featuredPropertyImage,
    ),
    description:
      "Bright and modern apartment in Yenişehir with open living spaces, upgraded finishes, and easy access to shops, schools, and city amenities.",
    href: routes.property("city-apartment"),
  },
  {
    id: "downtown-studio",
    badge: "STUDIO",
    title: "Cozy Studio Downtown",
    location: "Mersin, City Center",
    city: "Mersin",
    propertyType: "Studio",
    purpose: "For Rent",
    price: "$850 / Month",
    priceValue: 850,
    beds: 1,
    baths: 1,
    sqm: 45,
    image: featuredPropertyImage,
    images: gallery(featuredPropertyImage, aboutBuildingImage, featuredPropertyImage),
    description:
      "A cozy downtown studio ideal for professionals or students. Compact layout, efficient kitchen, and walking distance to cafes and transport.",
    href: routes.property("downtown-studio"),
  },
  {
    id: "erdemli-land",
    badge: "LAND",
    title: "Prime Coastal Land Plot",
    location: "Erdemli, Mersin",
    city: "Erdemli",
    propertyType: "Land",
    purpose: "For Sale",
    price: "$120,000",
    priceValue: 120000,
    beds: 0,
    baths: 0,
    sqm: 500,
    image: aboutBuildingImage,
    images: gallery(aboutBuildingImage, featuredPropertyImage, aboutBuildingImage),
    description:
      "Prime coastal land plot in Erdemli with strong investment potential. Flat terrain, clear access roads, and proximity to the sea.",
    href: routes.property("erdemli-land"),
  },
  {
    id: "tarsus-villa",
    badge: "FEATURED",
    title: "Family Villa with Garden",
    location: "Tarsus, Mersin",
    city: "Tarsus",
    propertyType: "Villa",
    purpose: "For Sale",
    price: "$275,000",
    priceValue: 275000,
    beds: 5,
    baths: 3,
    sqm: 320,
    image: featuredPropertyImage,
    images: gallery(
      featuredPropertyImage,
      aboutBuildingImage,
      featuredPropertyImage,
      aboutBuildingImage,
      featuredPropertyImage,
    ),
    description:
      "Spacious family villa with a large garden, five bedrooms, and generous living areas. Ideal for those who want privacy and outdoor space in Tarsus.",
    href: routes.property("tarsus-villa"),
    featured: true,
  },
  {
    id: "marina-penthouse",
    badge: "PENTHOUSE",
    title: "Marina View Penthouse",
    location: "Marina District, Mersin",
    city: "Mersin",
    propertyType: "Penthouse",
    purpose: "For Sale",
    price: "$520,000",
    priceValue: 520000,
    beds: 3,
    baths: 3,
    sqm: 210,
    image: aboutBuildingImage,
    images: gallery(
      aboutBuildingImage,
      featuredPropertyImage,
      aboutBuildingImage,
      featuredPropertyImage,
      aboutBuildingImage,
    ),
    description:
      "Elegant marina-view penthouse with panoramic vistas, premium finishes, and an open-plan living area designed for modern coastal living.",
    href: routes.property("marina-penthouse"),
  },
  {
    id: "silifke-commercial",
    badge: "COMMERCIAL",
    title: "Street-Front Commercial Unit",
    location: "Silifke, Mersin",
    city: "Silifke",
    propertyType: "Commercial",
    purpose: "For Rent",
    price: "$2,400 / Month",
    priceValue: 2400,
    beds: 0,
    baths: 1,
    sqm: 160,
    image: featuredPropertyImage,
    images: gallery(featuredPropertyImage, aboutBuildingImage, featuredPropertyImage),
    description:
      "High-visibility street-front commercial unit in Silifke. Great for retail or office use, with strong foot traffic and flexible interior layout.",
    href: routes.property("silifke-commercial"),
  },
  {
    id: "anamur-apartment",
    badge: "APARTMENT",
    title: "Sea Breeze Apartment",
    location: "Anamur, Mersin",
    city: "Anamur",
    propertyType: "Apartment",
    purpose: "For Sale",
    price: "$95,000",
    priceValue: 95000,
    beds: 2,
    baths: 1,
    sqm: 95,
    image: aboutBuildingImage,
    images: gallery(aboutBuildingImage, featuredPropertyImage, aboutBuildingImage),
    description:
      "Affordable sea-breeze apartment in Anamur with two bedrooms, natural light, and a relaxed coastal lifestyle setting.",
    href: routes.property("anamur-apartment"),
  },
];

export function getPropertyById(id: string) {
  return propertiesListings.find((item) => item.id === id) ?? null;
}

export function formatPriceLabel(value: number) {
  if (value >= propertyFilterOptions.priceMax) return "$1,000,000+";
  return `$${value.toLocaleString("en-US")}`;
}

export function formatPriceLabelForOptions(
  value: number,
  options: PropertyFilterOptions = propertyFilterOptions,
) {
  if (value >= options.priceMax) return `$${options.priceMax.toLocaleString("en-US")}+`;
  return `$${value.toLocaleString("en-US")}`;
}

export function filterProperties(
  listings: PropertyListing[],
  filters: PropertyFiltersState,
) {
  let result = listings.filter((item) => {
    if (
      filters.city !== "All Cities" &&
      item.city.toLowerCase() !== filters.city.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.propertyType !== "All Types" &&
      item.propertyType.toLowerCase() !== filters.propertyType.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.purpose !== "Buy / Rent" &&
      item.purpose.toLowerCase() !== filters.purpose.toLowerCase()
    ) {
      return false;
    }
    if (item.priceValue < filters.priceMin || item.priceValue > filters.priceMax) {
      return false;
    }
    return true;
  });

  switch (filters.sort) {
    case "price-asc":
      result = [...result].sort((a, b) => a.priceValue - b.priceValue);
      break;
    case "price-desc":
      result = [...result].sort((a, b) => b.priceValue - a.priceValue);
      break;
    case "featured":
      result = [...result].sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
      break;
    default:
      break;
  }

  return result;
}
