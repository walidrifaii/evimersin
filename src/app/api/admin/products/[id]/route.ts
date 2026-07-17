import { productService } from "@/server/services/product.service";
import { compose, validateBody, withAuth, withHandler, type ApiContext } from "@/server/middleware";
import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import { saveImageUpload } from "@/server/utils/upload";
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

export const GET = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  return ok(await productService.getById(id));
});

export const PUT = compose(withAuth, withHandler)(async (request, context: ApiContext) => {
  const id = parseId(await context.params);
  const current = await productService.getById(id);
  const formData = await request.formData();
  const imageFile = formData.get("image");
  const nextImage =
    imageFile instanceof File && imageFile.size > 0
      ? await saveImageUpload(imageFile, "uploads/products")
      : current.image;
  const galleryImages = await Promise.all(
    getImageFiles(formData, "images").map((file) =>
      saveImageUpload(file, "uploads/products/gallery"),
    ),
  );

  const input = validateBody(updateProductSchema, {
    name: formData.get("name"),
    position: Number(formData.get("position") ?? current.position),
    description: formData.get("description"),
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
    status: Number(formData.get("status") ?? current.status),
    is_featured: Number(formData.get("is_featured") ?? current.is_featured),
    image: nextImage,
  });

  return ok(await productService.update(id, input, galleryImages));
});

export const DELETE = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  await productService.remove(id);
  return ok({ message: "Product deleted successfully" });
});
