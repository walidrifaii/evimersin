import featuredPropertyImage from "@/assets/images/featured-property.webp";
import aboutBuildingImage from "@/assets/images/about-building.webp";
import type { StaticImageData } from "next/image";
import { routes } from "@/constants/routes";
import type {
  FilterOption,
  PropertyFilterOptions,
  PropertyFiltersState,
  PropertyListing,
} from "./types";

export const propertyFilterOptions: PropertyFilterOptions = {
  city: [
    { id: null, label: "All Cities" },
    { id: 1, label: "Mersin" },
    { id: 2, label: "Tarsus" },
    { id: 3, label: "Erdemli" },
    { id: 4, label: "Silifke" },
    { id: 5, label: "Anamur" },
    { id: 6, label: "Mut" },
  ],
  propertyType: [
    { id: null, label: "All Types" },
    { id: 1, label: "Villa" },
    { id: 2, label: "Apartment" },
    { id: 3, label: "Studio" },
    { id: 4, label: "Land" },
    { id: 5, label: "Commercial" },
    { id: 6, label: "Penthouse" },
  ],
  purpose: [
    { id: null, label: "Buy / Rent" },
    { id: 1, label: "For Sale" },
    { id: 2, label: "For Rent" },
  ],
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
  cityId: null,
  categoryId: null,
  purposeId: null,
  priceMin: propertyFilterOptions.priceMin,
  priceMax: propertyFilterOptions.priceMax,
  sort: "newest",
};

function uniqueById(options: FilterOption[]) {
  const seen = new Set<string>();
  return options
    .filter((option) => Boolean(option.label))
    .filter((option) => {
      const key = `${option.id ?? "null"}:${option.label.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      if (a.id === null) return -1;
      if (b.id === null) return 1;
      return a.label.localeCompare(b.label);
    });
}

export function buildPropertyFilterOptions(
  listings: Array<
    Pick<
      PropertyListing,
      | "cityId"
      | "city"
      | "categoryId"
      | "propertyType"
      | "purposeId"
      | "purpose"
      | "priceValue"
    >
  >,
  lookups?: {
    cities?: FilterOption[];
    propertyTypes?: FilterOption[];
    purposes?: FilterOption[];
  },
): PropertyFilterOptions {
  const maxPrice = Math.max(
    propertyFilterOptions.priceMax,
    ...listings.map((item) => Math.ceil(item.priceValue / 10000) * 10000),
  );

  const cities =
    lookups?.cities && lookups.cities.length > 0
      ? lookups.cities
      : listings.map((item) => ({ id: item.cityId, label: item.city }));

  const propertyTypes =
    lookups?.propertyTypes && lookups.propertyTypes.length > 0
      ? lookups.propertyTypes
      : listings.map((item) => ({
          id: item.categoryId,
          label: item.propertyType,
        }));

  const purposes =
    lookups?.purposes && lookups.purposes.length > 0
      ? lookups.purposes
      : listings.map((item) => ({ id: item.purposeId, label: item.purpose }));

  return {
    ...propertyFilterOptions,
    city: [
      { id: null, label: "All Cities" },
      ...uniqueById(cities.filter((item) => item.id !== null)),
    ],
    propertyType: [
      { id: null, label: "All Types" },
      ...uniqueById(propertyTypes.filter((item) => item.id !== null)),
    ],
    purpose: [
      { id: null, label: "Buy / Rent" },
      ...uniqueById(purposes.filter((item) => item.id !== null)),
    ],
    priceMax: maxPrice,
  };
}

export function getDefaultPropertyFilters(
  options: PropertyFilterOptions = propertyFilterOptions,
): PropertyFiltersState {
  return {
    cityId: null,
    categoryId: null,
    purposeId: null,
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

function parseIdParam(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function findOptionById(id: number | null, options: FilterOption[]) {
  if (id === null) return options.find((option) => option.id === null) ?? null;
  return options.find((option) => option.id === id) ?? null;
}

function findOptionByLabel(value: string | null | undefined, options: FilterOption[]) {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  const mappedType = getPropertyTypeFromQuery(value);

  return (
    options.find((option) => option.label.toLowerCase() === normalized) ??
    options.find(
      (option) =>
        mappedType !== null &&
        option.label.toLowerCase() === mappedType.toLowerCase(),
    ) ??
    options.find(
      (option) =>
        option.label.toLowerCase().replace(/s$/, "") ===
        normalized.replace(/s$/, ""),
    ) ??
    null
  );
}

export function getFilterOptionLabel(
  options: FilterOption[],
  id: number | null,
  fallback: string,
) {
  return findOptionById(id, options)?.label ?? fallback;
}

export function filtersFromSearchParams(
  params: {
    cityId?: string | null;
    categoryId?: string | null;
    purposeId?: string | null;
    /** @deprecated name/slug support for old links */
    type?: string | null;
    city?: string | null;
    purpose?: string | null;
    priceMin?: string | null;
    priceMax?: string | null;
  },
  options: PropertyFilterOptions = propertyFilterOptions,
): PropertyFiltersState {
  const defaults = getDefaultPropertyFilters(options);

  const cityFromId = findOptionById(parseIdParam(params.cityId), options.city);
  const categoryFromId = findOptionById(
    parseIdParam(params.categoryId),
    options.propertyType,
  );
  const purposeFromId = findOptionById(
    parseIdParam(params.purposeId),
    options.purpose,
  );

  const city =
    cityFromId ??
    findOptionByLabel(params.city, options.city) ??
    findOptionById(null, options.city);
  const propertyType =
    categoryFromId ??
    findOptionByLabel(params.type, options.propertyType) ??
    findOptionById(null, options.propertyType);
  const purpose =
    purposeFromId ??
    findOptionByLabel(params.purpose, options.purpose) ??
    findOptionById(null, options.purpose);

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
    cityId: city?.id ?? null,
    categoryId: propertyType?.id ?? null,
    purposeId: purpose?.id ?? null,
    priceMin,
    priceMax,
  };
}

export function buildPropertiesSearchHref(
  filters: Pick<
    PropertyFiltersState,
    "cityId" | "categoryId" | "purposeId" | "priceMin" | "priceMax"
  >,
  options: PropertyFilterOptions = propertyFilterOptions,
) {
  const params = new URLSearchParams();

  if (filters.cityId !== null) params.set("cityId", String(filters.cityId));
  if (filters.categoryId !== null) {
    params.set("categoryId", String(filters.categoryId));
  }
  if (filters.purposeId !== null) {
    params.set("purposeId", String(filters.purposeId));
  }
  if (filters.priceMin > options.priceMin) {
    params.set("priceMin", String(filters.priceMin));
  }
  if (filters.priceMax < options.priceMax) {
    params.set("priceMax", String(filters.priceMax));
  }

  const query = params.toString();
  return query ? `${routes.properties}?${query}` : routes.properties;
}

export function resolveCategoryIdBySlug(
  slug: string,
  options: PropertyFilterOptions,
) {
  return findOptionByLabel(slug, options.propertyType)?.id ?? null;
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
    cityId: 1,
    city: "Mersin",
    categoryId: 1,
    propertyType: "Villa",
    purposeId: 1,
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
    cityId: 1,
    city: "Mersin",
    categoryId: 2,
    propertyType: "Apartment",
    purposeId: 1,
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
    cityId: 1,
    city: "Mersin",
    categoryId: 3,
    propertyType: "Studio",
    purposeId: 2,
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
    cityId: 3,
    city: "Erdemli",
    categoryId: 4,
    propertyType: "Land",
    purposeId: 1,
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
    cityId: 2,
    city: "Tarsus",
    categoryId: 1,
    propertyType: "Villa",
    purposeId: 1,
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
    cityId: 1,
    city: "Mersin",
    categoryId: 6,
    propertyType: "Penthouse",
    purposeId: 1,
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
    cityId: 4,
    city: "Silifke",
    categoryId: 5,
    propertyType: "Commercial",
    purposeId: 2,
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
    cityId: 5,
    city: "Anamur",
    categoryId: 2,
    propertyType: "Apartment",
    purposeId: 1,
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
    if (filters.cityId !== null && item.cityId !== filters.cityId) {
      return false;
    }
    if (filters.categoryId !== null && item.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.purposeId !== null && item.purposeId !== filters.purposeId) {
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
