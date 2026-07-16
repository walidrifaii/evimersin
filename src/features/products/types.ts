import type { StaticImageData } from "next/image";

export type PropertyListing = {
  id: string;
  badge: string;
  title: string;
  location: string;
  city: string;
  propertyType: string;
  purpose: "For Sale" | "For Rent" | "Daily Rent";
  price: string;
  priceValue: number;
  beds: number;
  baths: number;
  sqm: number;
  image: StaticImageData;
  images: StaticImageData[];
  description: string;
  href: string;
  featured?: boolean;
};

export type PropertyFiltersState = {
  city: string;
  propertyType: string;
  purpose: string;
  priceMin: number;
  priceMax: number;
  sort: string;
};
