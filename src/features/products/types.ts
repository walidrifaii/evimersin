import type { StaticImageData } from "next/image";
import type { PropertySpecFieldKey } from "@/constants/property-specs";

export type PropertyImage = StaticImageData | string;

export type FilterOption = {
  id: number | null;
  label: string;
  count?: number;
};

export type RegionFilterOption = FilterOption & {
  cityId: number;
};

export type PropertyListing = {
  id: string;
  badge: string;
  title: string;
  location: string;
  cityId: number;
  city: string;
  regionId: number | null;
  region: string | null;
  categoryId: number;
  propertyType: string;
  purposeId: number;
  purpose: string;
  price: string;
  originalPrice?: string;
  priceValue: number;
  originalPriceValue?: number;
  beds: number;
  baths: number;
  sqm: number;
  image: PropertyImage;
  images: PropertyImage[];
  description: string;
  href: string;
  featured?: boolean;
  hotDeal?: boolean;
  discountLabel?: string | null;
  specs: Partial<Record<PropertySpecFieldKey, string | number | boolean | null>>;
};

export type PropertyFiltersState = {
  cityId: number | null;
  regionId: number | null;
  categoryId: number | null;
  purposeId: number | null;
  priceMin: number;
  priceMax: number;
  sort: string;
};

export type PropertyFilterOptions = {
  city: FilterOption[];
  region: RegionFilterOption[];
  propertyType: FilterOption[];
  purpose: FilterOption[];
  sort: Array<{ value: string; label: string }>;
  priceMin: number;
  priceMax: number;
};
