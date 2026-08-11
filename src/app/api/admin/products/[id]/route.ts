import { MAX_PRODUCT_GALLERY_IMAGES } from "@/constants/config";
import { ALL_PROPERTY_SPEC_KEYS } from "@/constants/property-specs";
import { productService } from "@/server/services/product.service";
import {
  compose,
  validateBody,
  withAuth,
  withHandler,
  type ApiContext,
} from "@/server/middleware";
import { AppError } from "@/server/utils/errors";
import { parseProductSpecFieldsFromFormData } from "@/server/utils/product-specs";
import { ok } from "@/server/utils/response";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { saveImageUpload, toRelativeUploadPath } from "@/server/utils/upload";
import {
  readNullableFormString,
  readTrimmedFormField,
  readUpdateFormData,
} from "@/server/utils/form-data";
import { updateProductSchema } from "@/server/validators/product.validator";

export const runtime = "nodejs";

function parseId(params: Record<string, string>, key = "id") {
  const id = Number(params[key]);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${key}`, 400);
  }
  return id;
}

function getImageFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((file): file is File => file instanceof File && file.size > 0);
}

function parseDiscountType(value: FormDataEntryValue | null) {
  if (value === "fixed" || value === "percentage") return value;
  return null;
}

function parseOptionalRegionId(value: FormDataEntryValue | null) {
  if (value == null || String(value).trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export const GET = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  return ok(await productService.getById(id));
});

const updateProduct = compose(withAuth, withHandler)(async (request, context: ApiContext) => {
  const id = parseId(await context.params);
  const current = await productService.getById(id);
  const formData = await readUpdateFormData(request, "product");
  const galleryFiles = getImageFiles(formData, "images");
  if (current.images.length + galleryFiles.length > MAX_PRODUCT_GALLERY_IMAGES) {
    throw new AppError(
      `A residential unit can have at most ${MAX_PRODUCT_GALLERY_IMAGES} extra images. ` +
        `Delete a saved image before adding a new one.`,
      400,
    );
  }

  const imageFile = formData.get("image");
  const nextImage =
    imageFile instanceof File && imageFile.size > 0
      ? await saveImageUpload(imageFile, "uploads/products")
      : toRelativeUploadPath(current.image);
  const galleryImages = await Promise.all(
    galleryFiles.map((file) => saveImageUpload(file, "uploads/products/gallery")),
  );

  const parsedSpecs = parseProductSpecFieldsFromFormData(formData);
  const specs = Object.fromEntries(
    ALL_PROPERTY_SPEC_KEYS.map((key) => [
      key,
      formData.has(key) ? (parsedSpecs[key] ?? null) : current[key],
    ]),
  );

  const submittedName = readTrimmedFormField(formData, "name");
  const name = submittedName || current.name;

  const input = validateBody(updateProductSchema, {
    ...specs,
    name,
    position: Number(formData.get("position") ?? current.position),
    description: readNullableFormString(formData.get("description")),
    price: Number(formData.get("price") ?? current.price),
    discount_type: formData.has("discount_type")
      ? parseDiscountType(formData.get("discount_type"))
      : current.discount_type,
    discount_value: formData.has("discount_value")
      ? Number(formData.get("discount_value") ?? 0)
      : current.discount_value,
    category_id: Number(formData.get("category_id") ?? current.category_id),
    purpose_id: Number(formData.get("purpose_id") ?? current.purpose_id),
    city_id: Number(formData.get("city_id") ?? current.city_id),
    region_id: formData.has("region_id")
      ? parseOptionalRegionId(formData.get("region_id"))
      : current.region_id,
    status: Number(formData.get("status") ?? current.status),
    is_featured: Number(formData.get("is_featured") ?? current.is_featured),
    image: nextImage,
  });

  const updated = await productService.update(id, input, galleryImages);
  revalidateListingsCache(id);
  return ok(updated);
});

export const PUT = updateProduct;
/** Some proxies drop multipart bodies on PUT, so the dashboard posts updates. */
export const POST = updateProduct;

export const DELETE = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  await productService.remove(id);
  revalidateListingsCache(id);
  return ok({ message: "Product deleted successfully" });
});
