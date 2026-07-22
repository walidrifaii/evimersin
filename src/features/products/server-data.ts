import { unstable_cache } from "next/cache";
import { cache } from "react";
import featuredPropertyImage from "@/assets/images/featured-property.webp";
import { routes } from "@/constants/routes";
import { toDisplayImageSrc } from "@/lib/image-url";
import {
  formatDiscountLabel,
  formatProductPrice,
  hasActiveDiscount,
} from "@/lib/product-pricing";
import { buildPropertyFilterOptions } from "@/features/products/data";
import {
  categoryRepository,
  cityRepository,
  purposeRepository,
} from "@/server/database/repositories/lookup.repository";
import { productRepository } from "@/server/database/repositories/product.repository";
import type { Product, ProductDetail } from "@/server/types/product.types";
import type { PropertyListing } from "@/features/products/types";

function toBadge(product: Product) {
  if (product.is_featured === 1) return "FEATURED";
  return product.category_name.toUpperCase();
}

function toPropertyListing(product: ProductDetail): PropertyListing {
  const image = toDisplayImageSrc(product.image) || featuredPropertyImage;
  const gallery = product.images
    .map((item) => toDisplayImageSrc(item.image))
    .filter(Boolean);
  const discounted = hasActiveDiscount(
    product.discount_type,
    product.discount_value,
  );

  return {
    id: String(product.id),
    badge: toBadge(product),
    title: product.name,
    location: product.city_name,
    city: product.city_name,
    propertyType: product.category_name,
    purpose: product.purpose_name,
    price: formatProductPrice(product.final_price),
    originalPrice: discounted ? formatProductPrice(product.price) : undefined,
    priceValue: product.final_price,
    originalPriceValue: product.price,
    beds: 0,
    baths: 0,
    sqm: 0,
    image,
    images: [image, ...gallery],
    description: product.description ?? "",
    href: routes.property(String(product.id)),
    featured: product.is_featured === 1,
    hotDeal: discounted || product.is_hot_deal === 1,
    discountLabel: formatDiscountLabel(
      product.price,
      product.discount_type,
      product.discount_value,
    ),
  };
}

async function loadPropertyListings() {
  try {
    const details = await productRepository.findActiveDetails();
    return details.map(toPropertyListing);
  } catch (error) {
    console.error("[listings] Failed to load property listings:", error);
    return [];
  }
}

async function loadFeaturedListings(limit: number) {
  try {
    const details = await productRepository.findFeaturedDetails(limit);
    return details.map(toPropertyListing);
  } catch (error) {
    console.error("[listings] Failed to load featured listings:", error);
    return [];
  }
}

async function loadHotDealListings(limit: number) {
  try {
    const details = await productRepository.findHotDealDetails(limit);
    return details.map(toPropertyListing);
  } catch (error) {
    console.error("[listings] Failed to load hot deal listings:", error);
    return [];
  }
}

async function loadPropertyListingById(id: string) {
  try {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) return null;

    const product = await productRepository.findDetailById(numericId);
    if (!product || product.status !== 1) return null;

    return toPropertyListing(product);
  } catch (error) {
    console.error("[listings] Failed to load property:", error);
    return null;
  }
}

const getCachedPropertyListings = unstable_cache(
  loadPropertyListings,
  ["property-listings"],
  { revalidate: 60, tags: ["property-listings"] },
);

const getCachedFeaturedListings = unstable_cache(
  async (limit: number) => loadFeaturedListings(limit),
  ["property-featured"],
  { revalidate: 60, tags: ["property-listings"] },
);

const getCachedHotDealListings = unstable_cache(
  async (limit: number) => loadHotDealListings(limit),
  ["property-hot-deals"],
  { revalidate: 60, tags: ["property-listings"] },
);

const getCachedPropertyListingById = unstable_cache(
  async (id: string) => loadPropertyListingById(id),
  ["property-listing-by-id"],
  { revalidate: 60, tags: ["property-listings"] },
);

async function loadPropertyFilterOptions() {
  const settled = await Promise.allSettled([
    productRepository.findActive(),
    cityRepository.findActiveByCountry("Lebanon"),
    categoryRepository.findAll(),
    purposeRepository.findAll(),
  ]);

  const products =
    settled[0].status === "fulfilled" ? settled[0].value : [];
  const cities =
    settled[1].status === "fulfilled" ? settled[1].value : [];
  const categories =
    settled[2].status === "fulfilled" ? settled[2].value : [];
  const purposes =
    settled[3].status === "fulfilled" ? settled[3].value : [];

  for (const [index, result] of settled.entries()) {
    if (result.status === "rejected") {
      console.error(`[listings] Filter source ${index} failed:`, result.reason);
    }
  }

  // Fallback: if Lebanon filter returned nothing, use any city in the database.
  let cityNames = cities.map((city) => city.name);
  if (cityNames.length === 0) {
    try {
      const allCities = await cityRepository.findAll();
      cityNames = allCities.map((city) => city.name);
    } catch (error) {
      console.error("[listings] Failed to load fallback cities:", error);
    }
  }

  return buildPropertyFilterOptions(
    products.map((product) => ({
      city: product.city_name,
      propertyType: product.category_name,
      purpose: product.purpose_name,
      priceValue: product.final_price,
    })),
    {
      cities: cityNames,
      propertyTypes: categories
        .filter((category) => Number(category.status) === 1)
        .map((category) => category.name),
      purposes: purposes
        .filter((purpose) => Number(purpose.status) === 1)
        .map((purpose) => purpose.name),
    },
  );
}

/** Fresh each request so city filters never stick on an empty build cache. */
export const getPropertyFilterOptions = cache(async () => {
  return loadPropertyFilterOptions();
});

/** Per-request dedupe + cross-request ISR cache (60s). */
export const getPropertyListings = cache(async () => {
  return getCachedPropertyListings();
});

export const getFeaturedPropertyListings = cache(async (limit = 4) => {
  return getCachedFeaturedListings(limit);
});

export const getHotDealPropertyListings = cache(async (limit = 4) => {
  return getCachedHotDealListings(limit);
});

export const getPropertyListingById = cache(async (id: string) => {
  return getCachedPropertyListingById(id);
});
