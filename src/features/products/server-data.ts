import featuredPropertyImage from "@/assets/images/featured-property.png";
import { routes } from "@/constants/routes";
import { toDisplayImageSrc } from "@/lib/image-url";
import { formatDiscountLabel, formatProductPrice, hasActiveDiscount } from "@/lib/product-pricing";
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
    hotDeal: discounted,
    discountLabel: formatDiscountLabel(
      product.price,
      product.discount_type,
      product.discount_value,
    ),
  };
}

export async function getPropertyListings() {
  const products = await productRepository.findAll();
  const details = await Promise.all(
    products.map((product) => productRepository.findDetailById(product.id)),
  );

  return details
    .filter((product): product is ProductDetail => Boolean(product))
    .filter((product) => product.status === 1)
    .map(toPropertyListing);
}

export async function getPropertyListingById(id: string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;

  const product = await productRepository.findDetailById(numericId);
  if (!product || product.status !== 1) return null;

  return toPropertyListing(product);
}
