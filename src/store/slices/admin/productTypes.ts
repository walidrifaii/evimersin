import type { Status } from "@/store/slices/admin/lookupTypes";
import type { DiscountType } from "@/lib/product-pricing";
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
  region_id: number | null;
  category_name: string;
  purpose_name: string;
  city_name: string;
  region_name: string | null;
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

export type ProductFormInput = Partial<
  Record<PropertySpecFieldKey, string | number | boolean | null>
> & {
  name: string;
  description?: string | null;
  price: number;
  discount_type?: DiscountType;
  discount_value?: number;
  position?: number;
  category_id: number;
  purpose_id: number;
  city_id: number;
  region_id?: number | null;
  status?: Status;
  is_featured?: Status;
  image?: File | null;
};
