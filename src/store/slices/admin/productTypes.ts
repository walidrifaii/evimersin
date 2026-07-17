import type { Status } from "@/store/slices/admin/lookupTypes";
import type { DiscountType } from "@/lib/product-pricing";

export type { DiscountType };

export type Product = {
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

export type ProductFormInput = {
  name: string;
  description?: string | null;
  price: number;
  discount_type?: DiscountType;
  discount_value?: number;
  position?: number;
  category_id: number;
  purpose_id: number;
  city_id: number;
  status?: Status;
  is_featured?: Status;
  image?: File | null;
  images?: File[];
};
