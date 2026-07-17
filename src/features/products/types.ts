import type { StaticImageData } from "next/image";

export type PropertyImage = StaticImageData | string;

export type PropertyListing = {
  id: string;
  badge: string;
  title: string;
  location: string;
  city: string;
  propertyType: string;
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
  city: string;
  propertyType: string;
  purpose: string;
  priceMin: number;
  priceMax: number;
  sort: string;
};

export type PropertyFilterOptions = {
  city: string[];
  propertyType: string[];
  purpose: string[];
  sort: Array<{ value: string; label: string }>;
  priceMin: number;
  priceMax: number;
};
