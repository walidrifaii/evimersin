import { productService } from "@/server/services/product.service";
import { compose, withAuth, withHandler, type ApiContext } from "@/server/middleware";
import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import { revalidateListingsCache } from "@/server/utils/revalidate";

export const runtime = "nodejs";

function parseId(params: Record<string, string>, key: string) {
  const id = Number(params[key]);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${key}`, 400);
  }
  return id;
}

export const DELETE = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const params = await context.params;
  const productId = parseId(params, "id");
  const imageId = parseId(params, "imageId");
  await productService.removeImage(productId, imageId);
  revalidateListingsCache(productId);
  return ok({ message: "Product image deleted successfully" });
});
