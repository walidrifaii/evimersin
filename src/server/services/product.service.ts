import {
  categoryRepository,
  cityRepository,
  purposeRepository,
} from "@/server/database/repositories/lookup.repository";
import {
  productImageRepository,
  productRepository,
} from "@/server/database/repositories/product.repository";
import type {
  CreateProductImageInput,
  CreateProductInput,
  UpdateProductInput,
} from "@/server/types/product.types";
import { AppError } from "@/server/utils/errors";
import { removeUploadedFile, toRelativeUploadPath } from "@/server/utils/upload";
import { hasActiveDiscount } from "@/lib/product-pricing";

function normalizeStoredImagePath(image: string | null | undefined) {
  if (image === undefined) return undefined;
  if (image === null || image === "") return null;
  return toRelativeUploadPath(image) ?? image;
}

function normalizeDiscount(
  input: CreateProductInput | UpdateProductInput,
  price: number,
): CreateProductInput | UpdateProductInput {
  // Partial updates: leave discount fields untouched when omitted.
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
}) {
  const [category, purpose, city] = await Promise.all([
    categoryRepository.findById(input.category_id),
    purposeRepository.findById(input.purpose_id),
    cityRepository.findById(input.city_id),
  ]);

  if (!category) throw new AppError("Category not found", 404);
  if (!purpose) throw new AppError("Purpose not found", 404);
  if (!city) throw new AppError("City not found", 404);
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
  list: () => productRepository.findAll(),

  async getById(id: number) {
    const product = await productRepository.findDetailById(id);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async create(input: CreateProductInput, galleryImages: string[] = []) {
    await validateRelations(input);
    const normalized = normalizeDiscount(input, input.price) as CreateProductInput;
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
    const current = await this.getById(id);

    if (
      input.category_id !== undefined ||
      input.purpose_id !== undefined ||
      input.city_id !== undefined
    ) {
      await validateRelations({
        category_id: input.category_id ?? current.category_id,
        purpose_id: input.purpose_id ?? current.purpose_id,
        city_id: input.city_id ?? current.city_id,
      });
    }

    const normalized = normalizeDiscount(
      input,
      input.price ?? current.price,
    ) as UpdateProductInput;

    await productRepository.update(id, {
      ...normalized,
      image:
        normalized.image !== undefined
          ? normalizeStoredImagePath(normalized.image)
          : undefined,
    });
    await addGalleryImages(
      id,
      galleryImages
        .map((image) => normalizeStoredImagePath(image))
        .filter((image): image is string => Boolean(image)),
    );

    if (input.image !== undefined && input.image !== current.image) {
      await removeUploadedFile(current.image);
    }

    return this.getById(id);
  },

  async remove(id: number) {
    const product = await this.getById(id);
    await productRepository.delete(id);
    await removeUploadedFile(product.image);

    for (const image of product.images) {
      await removeUploadedFile(image.image);
    }
  },

  async addImage(input: CreateProductImageInput) {
    await this.getById(input.product_id);
    const imageId = await productImageRepository.create(input);
    const image = await productImageRepository.findById(imageId);
    if (!image) throw new AppError("Product image not found", 404);
    return image;
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
