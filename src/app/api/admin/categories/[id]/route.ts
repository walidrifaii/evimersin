import { categoryService } from "@/server/services/lookup.service";
import { compose, validateBody, withAuth, withHandler, type ApiContext } from "@/server/middleware";
import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import { revalidateListingsCache } from "@/server/utils/revalidate";
import { removeUploadedFile, saveImageUpload } from "@/server/utils/upload";
import { updateCategorySchema } from "@/server/validators/lookup.validator";

export const runtime = "nodejs";

function parseId(params: Record<string, string>) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid category id", 400);
  }
  return id;
}

export const GET = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  return ok(await categoryService.getById(id));
});

export const PUT = compose(withAuth, withHandler)(async (request, context: ApiContext) => {
  const id = parseId(await context.params);
  const current = await categoryService.getById(id);
  const formData = await request.formData();
  const iconFile = formData.get("icon");
  const nextIcon =
    iconFile instanceof File && iconFile.size > 0
      ? await saveImageUpload(iconFile, "uploads/categories")
      : current.icon;

  const input = validateBody(updateCategorySchema, {
    name: formData.get("name"),
    status: Number(formData.get("status") ?? current.status),
    position: Number(formData.get("position") ?? current.position),
    icon: nextIcon,
  });

  const updated = await categoryService.update(id, input);

  if (nextIcon !== current.icon) {
    await removeUploadedFile(current.icon);
  }

  revalidateListingsCache();
  return ok(updated);
});

export const DELETE = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  const current = await categoryService.getById(id);
  await categoryService.remove(id);
  await removeUploadedFile(current.icon);
  revalidateListingsCache();
  return ok({ message: "Category deleted successfully" });
});
