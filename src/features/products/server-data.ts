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
import { ALL_PROPERTY_SPEC_KEYS } from "@/constants/property-specs";
import {
  categoryRepository,
  cityRepository,
  countryRepository,
  purposeRepository,
  regionRepository,
} from "@/server/database/repositories/lookup.repository";
import { productRepository } from "@/server/database/repositories/product.repository";
import type { Product, ProductDetail } from "@/server/types/product.types";
import type { PropertyListing } from "@/features/products/types";

function toBadge(product: Product) {
  if (Number(product.is_featured) === 1) return "FEATURED";
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
  const specs = Object.fromEntries(
    ALL_PROPERTY_SPEC_KEYS.map((key) => [key, product[key] ?? null]),
  );

  return {
    id: String(product.id),
    badge: toBadge(product),
    title: product.name,
    location: product.region_name
      ? `${product.region_name}, ${product.city_name}`
      : product.city_name,
    countryId: product.country_id != null ? Number(product.country_id) : null,
    country: product.country_name,
    cityId: Number(product.city_id),
    city: product.city_name,
    regionId: product.region_id != null ? Number(product.region_id) : null,
    region: product.region_name,
    categoryId: Number(product.category_id),
    propertyType: product.category_name,
    purposeId: Number(product.purpose_id),
    purpose: product.purpose_name,
    price: formatProductPrice(product.final_price),
    originalPrice: discounted ? formatProductPrice(product.price) : undefined,
    paymentMethod: product.payment_method,
    priceValue: product.final_price,
    originalPriceValue: product.price,
    beds: Number(product.bedrooms ?? 0),
    baths: Number(product.bathrooms ?? 0),
    sqm: Number(product.built_area ?? product.land_area ?? 0),
    image,
    images: [image, ...gallery],
    description: product.description ?? "",
    href: routes.property(String(product.id)),
    featured: Number(product.is_featured) === 1,
    hotDeal: discounted || Number(product.is_hot_deal) === 1,
    discountLabel: formatDiscountLabel(
      product.price,
      product.discount_type,
      product.discount_value,
    ),
    specs,
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
    if (!product || Number(product.status) !== 1) return null;

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
    countryRepository.findAll(),
    cityRepository.findAll(),
    regionRepository.findAll(),
    categoryRepository.findAll(),
    purposeRepository.findAll(),
  ]);

  const products =
    settled[0].status === "fulfilled" ? settled[0].value : [];
  const countries =
    settled[1].status === "fulfilled" ? settled[1].value : [];
  const cities =
    settled[2].status === "fulfilled" ? settled[2].value : [];
  const regions =
    settled[3].status === "fulfilled" ? settled[3].value : [];
  const categories =
    settled[4].status === "fulfilled" ? settled[4].value : [];
  const purposes =
    settled[5].status === "fulfilled" ? settled[5].value : [];

  for (const [index, result] of settled.entries()) {
    if (result.status === "rejected") {
      console.error(`[listings] Filter source ${index} failed:`, result.reason);
    }
  }

  const cityNames = cities
    .filter((city) => Number(city.status) === 1)
    .map((city) => ({
      id: city.id,
      label: city.name,
      countryId: city.country_id,
    }));

  return buildPropertyFilterOptions(
    products.map((product) => ({
      countryId: product.country_id,
      country: product.country_name,
      cityId: product.city_id,
      city: product.city_name,
      regionId: product.region_id,
      region: product.region_name,
      categoryId: product.category_id,
      propertyType: product.category_name,
      purposeId: product.purpose_id,
      purpose: product.purpose_name,
      priceValue: product.final_price,
    })),
    {
      countries: countries
        .filter((country) => Number(country.status) === 1)
        .map((country) => ({ id: country.id, label: country.name })),
      cities: cityNames,
      regions: regions
        .filter((region) => Number(region.status) === 1)
        .map((region) => ({
          id: region.id,
          label: region.name,
          cityId: region.city_id,
        })),
      propertyTypes: categories
        .filter((category) => Number(category.status) === 1)
        .map((category) => ({ id: category.id, label: category.name })),
      purposes: purposes
        .filter((purpose) => Number(purpose.status) === 1)
        .map((purpose) => ({ id: purpose.id, label: purpose.name })),
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
