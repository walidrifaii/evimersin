import type { StaticImageData } from "next/image";

export type PropertyImage = StaticImageData | string;

export type FilterOption = {
  id: number | null;
  label: string;
};

export type PropertyListing = {
  id: string;
  badge: string;
  title: string;
  location: string;
  cityId: number;
  city: string;
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
};

export type PropertyFiltersState = {
  cityId: number | null;
  categoryId: number | null;
  purposeId: number | null;
  priceMin: number;
  priceMax: number;
  sort: string;
};

export type PropertyFilterOptions = {
  city: FilterOption[];
  propertyType: FilterOption[];
  purpose: FilterOption[];
  sort: Array<{ value: string; label: string }>;
  priceMin: number;
  priceMax: number;
};
