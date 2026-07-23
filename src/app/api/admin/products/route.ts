import { productService } from "@/server/services/product.service";
import { compose, validateBody, withAuth, withHandler } from "@/server/middleware";
import { ok } from "@/server/utils/response";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { saveImageUpload } from "@/server/utils/upload";
import { createProductSchema } from "@/server/validators/product.validator";

export const runtime = "nodejs";

export const GET = compose(withAuth, withHandler)(async () =>
  ok(await productService.list()),
);

function getImageFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((file): file is File => file instanceof File && file.size > 0);
}

function parseDiscountType(value: FormDataEntryValue | null) {
  if (value === "fixed" || value === "percentage") return value;
  return null;
}

export const POST = compose(withAuth, withHandler)(async (request) => {
  const formData = await request.formData();
  const imageFile = formData.get("image");
  const image =
    imageFile instanceof File && imageFile.size > 0
      ? await saveImageUpload(imageFile, "uploads/products")
      : null;
  const galleryImages = await Promise.all(
    getImageFiles(formData, "images").map((file) =>
      saveImageUpload(file, "uploads/products/gallery"),
    ),
  );

  const input = validateBody(createProductSchema, {
    name: formData.get("name"),
    position: Number(formData.get("position") ?? 0),
    description: formData.get("description"),
    price: Number(formData.get("price") ?? 0),
    discount_type: parseDiscountType(formData.get("discount_type")),
    discount_value: Number(formData.get("discount_value") ?? 0),
    category_id: Number(formData.get("category_id")),
    purpose_id: Number(formData.get("purpose_id")),
    city_id: Number(formData.get("city_id")),
    status: Number(formData.get("status") ?? 1),
    is_featured: Number(formData.get("is_featured") ?? 0),
    image,
  });

  const created = await productService.create(input, galleryImages);
  revalidateListingsCache(created.id);
  return ok(created, 201);
});
