import { productService } from "@/server/services/product.service";
import { compose, validateBody, withAuth, withHandler, type ApiContext } from "@/server/middleware";
import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import { saveImageUpload } from "@/server/utils/upload";
import { createProductImageSchema } from "@/server/validators/product.validator";

export const runtime = "nodejs";

function parseId(params: Record<string, string>) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid product id", 400);
  }
  return id;
}

export const POST = compose(withAuth, withHandler)(async (request, context: ApiContext) => {
  const productId = parseId(await context.params);
  const formData = await request.formData();
  const imageFile = formData.get("image");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    throw new AppError("Image file is required", 422);
  }

  const image = await saveImageUpload(imageFile, "uploads/products/gallery");
  const input = validateBody(createProductImageSchema, {
    image,
    status: Number(formData.get("status") ?? 1),
  });

  return ok(
    await productService.addImage({
      product_id: productId,
      image: input.image,
      status: input.status,
    }),
    201,
  );
});
