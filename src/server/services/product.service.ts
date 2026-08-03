import {
  categoryRepository,
  cityRepository,
  purposeRepository,
  regionRepository,
} from "@/server/database/repositories/lookup.repository";
import {
  productImageRepository,
  productRepository,
} from "@/server/database/repositories/product.repository";
import type {
  CreateProductImageInput,
  CreateProductInput,
  Product,
  ProductDetail,
  ProductImage,
  UpdateProductInput,
} from "@/server/types/product.types";
import { PRODUCT_SPEC_COLUMN_KEYS, pickWritableProductInput } from "@/server/types/product.types";
import { AppError } from "@/server/utils/errors";
import { removeUploadedFile, toRelativeUploadPath } from "@/server/utils/upload";
import { hasActiveDiscount } from "@/lib/product-pricing";
import { toAbsoluteImageUrl } from "@/lib/image-url";
import { clearUnusedSpecValues } from "@/constants/property-specs";

function normalizeStoredImagePath(image: string | null | undefined) {
  if (image === undefined) return undefined;
  if (image === null || image === "") return null;
  return toRelativeUploadPath(image) ?? image;
}

function withAbsoluteProductImage(product: Product): Product {
  return {
    ...product,
    image: toAbsoluteImageUrl(product.image),
  };
}

function withAbsoluteProductDetail(product: ProductDetail): ProductDetail {
  return {
    ...withAbsoluteProductImage(product),
    images: product.images.map((item) => withAbsoluteGalleryImage(item)),
  };
}

function withAbsoluteGalleryImage(image: ProductImage): ProductImage {
  return {
    ...image,
    image: toAbsoluteImageUrl(image.image) ?? image.image,
  };
}

function normalizeDiscount(
  input: CreateProductInput | UpdateProductInput,
  price: number,
): CreateProductInput | UpdateProductInput {
  if (input.discount_type === undefined && input.discount_value === undefined) {
    return input;
  }

  if (input.discount_type === null || input.discount_type === undefined) {
    return {
      ...input,
      discount_type: null,
      discount_value: 0,
      is_hot_deal: 0,
    };
  }

  const discountValue = input.discount_value ?? 0;
  if (discountValue <= 0) {
    throw new AppError("Discount value must be greater than 0", 422);
  }

  if (input.discount_type === "fixed" && discountValue > price) {
    throw new AppError("Fixed discount cannot exceed product price", 422);
  }

  if (input.discount_type === "percentage" && discountValue > 100) {
    throw new AppError("Percentage discount cannot exceed 100%", 422);
  }

  return {
    ...input,
    is_hot_deal: hasActiveDiscount(input.discount_type, discountValue) ? 1 : 0,
  };
}

async function validateRelations(input: {
  category_id: number;
  purpose_id: number;
  city_id: number;
  region_id?: number | null;
}) {
  const [category, purpose, city] = await Promise.all([
    categoryRepository.findById(input.category_id),
    purposeRepository.findById(input.purpose_id),
    cityRepository.findById(input.city_id),
  ]);

  if (!category) throw new AppError("Category not found", 404);
  if (!purpose) throw new AppError("Purpose not found", 404);
  if (!city) throw new AppError("City not found", 404);

  if (input.region_id != null) {
    const region = await regionRepository.findById(input.region_id);
    if (!region) throw new AppError("Region not found", 404);
    if (region.city_id !== input.city_id) {
      throw new AppError("Region does not belong to the selected city", 422);
    }
  }

  return { category, purpose, city };
}

function applyCategorySpecCleanup(
  categoryName: string,
  input: CreateProductInput | UpdateProductInput,
) {
  const cleaned = clearUnusedSpecValues(categoryName, input);
  const next = { ...input };
  for (const key of PRODUCT_SPEC_COLUMN_KEYS) {
    next[key] = cleaned[key] as never;
  }
  return next;
}

async function addGalleryImages(productId: number, images: string[]) {
  if (images.length === 0) return;

  await Promise.all(
    images.map((image) =>
      productImageRepository.create({
        product_id: productId,
        image,
        status: 1,
      }),
    ),
  );
}

export const productService = {
  async list() {
    const products = await productRepository.findAll();
    return products.map(withAbsoluteProductImage);
  },

  async getById(id: number) {
    const product = await productRepository.findDetailById(id);
    if (!product) throw new AppError("Product not found", 404);
    return withAbsoluteProductDetail(product);
  },

  async create(input: CreateProductInput, galleryImages: string[] = []) {
    const { category } = await validateRelations(input);
    const withSpecs = applyCategorySpecCleanup(
      category.name,
      input,
    ) as CreateProductInput;
    const normalized = normalizeDiscount(
      withSpecs,
      withSpecs.price,
    ) as CreateProductInput;
    const id = await productRepository.create({
      ...normalized,
      image: normalizeStoredImagePath(normalized.image) ?? null,
    });
    await addGalleryImages(
      id,
      galleryImages
        .map((image) => normalizeStoredImagePath(image))
        .filter((image): image is string => Boolean(image)),
    );
    return this.getById(id);
  },

  async update(
    id: number,
    input: UpdateProductInput,
    galleryImages: string[] = [],
  ) {
    const current = await productRepository.findDetailById(id);
    if (!current) throw new AppError("Product not found", 404);

    const relations = await validateRelations({
      category_id: input.category_id ?? current.category_id,
      purpose_id: input.purpose_id ?? current.purpose_id,
      city_id: input.city_id ?? current.city_id,
      region_id:
        input.region_id !== undefined ? input.region_id : current.region_id,
    });

    const withSpecs = applyCategorySpecCleanup(relations.category.name, {
      ...current,
      ...input,
    }) as UpdateProductInput;

    const normalized = normalizeDiscount(
      withSpecs,
      withSpecs.price ?? current.price,
    ) as UpdateProductInput;

    const nextImage =
      normalized.image !== undefined
        ? normalizeStoredImagePath(normalized.image)
        : undefined;

    const writable = pickWritableProductInput({
      ...normalized,
      image: nextImage,
    });

    await productRepository.update(id, writable);
    await addGalleryImages(
      id,
      galleryImages
        .map((image) => normalizeStoredImagePath(image))
        .filter((image): image is string => Boolean(image)),
    );

    if (nextImage !== undefined && nextImage !== current.image) {
      await removeUploadedFile(current.image);
    }

    return this.getById(id);
  },

  async remove(id: number) {
    const product = await productRepository.findDetailById(id);
    if (!product) throw new AppError("Product not found", 404);

    await productRepository.delete(id);
    await removeUploadedFile(product.image);

    for (const image of product.images) {
      await removeUploadedFile(image.image);
    }
  },

  async addImage(input: CreateProductImageInput) {
    await this.getById(input.product_id);
    const imageId = await productImageRepository.create({
      ...input,
      image: normalizeStoredImagePath(input.image) ?? input.image,
    });
    const image = await productImageRepository.findById(imageId);
    if (!image) throw new AppError("Product image not found", 404);
    return withAbsoluteGalleryImage(image);
  },

  async removeImage(productId: number, imageId: number) {
    await this.getById(productId);
    const image = await productImageRepository.findById(imageId);
    if (!image || image.product_id !== productId) {
      throw new AppError("Product image not found", 404);
    }

    await productImageRepository.delete(imageId);
    await removeUploadedFile(image.image);
  },
};
