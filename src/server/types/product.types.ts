import type { Status } from "@/server/types/lookup.types";
import type { DiscountType } from "@/lib/product-pricing";
import { calculateFinalPrice } from "@/lib/product-pricing";
import type { PropertySpecFieldKey } from "@/constants/property-specs";

export type { DiscountType };

export type ProductSpecFields = {
  land_area: number | null;
  land_type: string | null;
  zoning: string | null;
  road_access: Status | null;
  allowed_floors: number | null;
  electricity: Status | null;
  water: Status | null;
  built_area: number | null;
  floors: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  living_rooms: number | null;
  parking: Status | null;
  garden: Status | null;
  pool: Status | null;
  furnished: Status | null;
  floor_number: number | null;
  balconies: number | null;
  elevator: Status | null;
  frontage: number | null;
  storage: Status | null;
  mezzanine: Status | null;
  rooms: number | null;
};

export type Product = ProductSpecFields & {
  id: number;
  name: string;
  image: string | null;
  position: number;
  description: string | null;
  price: number;
  discount_type: DiscountType;
  discount_value: number;
  final_price: number;
  category_id: number;
  purpose_id: number;
  city_id: number;
  category_name: string;
  purpose_name: string;
  city_name: string;
  status: Status;
  is_hot_deal: Status;
  is_featured: Status;
  date_created: string;
};

export type ProductImage = {
  id: number;
  product_id: number;
  image: string;
  status: Status;
};

export type ProductDetail = Product & {
  images: ProductImage[];
};

export type CreateProductInput = Partial<ProductSpecFields> & {
  name: string;
  image?: string | null;
  position?: number;
  description?: string | null;
  price: number;
  discount_type?: DiscountType;
  discount_value?: number;
  category_id: number;
  purpose_id: number;
  city_id: number;
  status?: Status;
  is_hot_deal?: Status;
  is_featured?: Status;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateProductImageInput = {
  product_id: number;
  image: string;
  status?: Status;
};

export const PRODUCT_SPEC_COLUMN_KEYS: PropertySpecFieldKey[] = [
  "land_area",
  "land_type",
  "zoning",
  "road_access",
  "allowed_floors",
  "electricity",
  "water",
  "built_area",
  "floors",
  "bedrooms",
  "bathrooms",
  "living_rooms",
  "parking",
  "garden",
  "pool",
  "furnished",
  "floor_number",
  "balconies",
  "elevator",
  "frontage",
  "storage",
  "mezzanine",
  "rooms",
];

/** Columns that can be written to the products table (excludes join/computed fields). */
export const PRODUCT_WRITABLE_KEYS = [
  "name",
  "image",
  "position",
  "description",
  "price",
  "discount_type",
  "discount_value",
  "category_id",
  "purpose_id",
  "city_id",
  "status",
  "is_hot_deal",
  "is_featured",
  ...PRODUCT_SPEC_COLUMN_KEYS,
] as const;

export function pickWritableProductInput(
  input: UpdateProductInput,
): UpdateProductInput {
  const allowed = new Set<string>(PRODUCT_WRITABLE_KEYS);
  const next: UpdateProductInput = {};

  for (const key of PRODUCT_WRITABLE_KEYS) {
    const value = input[key];
    if (value !== undefined && allowed.has(key)) {
      (next as Record<string, unknown>)[key] = value;
    }
  }

  return next;
}

export function withProductPricing<
  T extends {
    price: number;
    discount_type: DiscountType;
    discount_value: number;
  },
>(product: T) {
  return {
    ...product,
    final_price: calculateFinalPrice(
      product.price,
      product.discount_type,
      product.discount_value,
    ),
  };
}
