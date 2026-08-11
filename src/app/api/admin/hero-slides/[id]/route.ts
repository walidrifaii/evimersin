import {
  compose,
  validateBody,
  withAuth,
  withHandler,
  withPermission,
  type ApiContext,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { heroSlideService } from "@/server/services/hero-slide.service";
import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import { revalidateHeroSlidesCache } from "@/server/utils/revalidate";
import {
  removeUploadedFile,
  saveImageUpload,
  toRelativeUploadPath,
} from "@/server/utils/upload";
import { readUpdateFormData } from "@/server/utils/form-data";
import { updateHeroSlideSchema } from "@/server/validators/hero-slide.validator";

export const runtime = "nodejs";

function parseId(params: Record<string, string>) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid hero slide id", 400);
  }
  return id;
}

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_READ),
  withHandler,
)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  return ok(await heroSlideService.getById(id));
});

const updateHeroSlide = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_UPDATE),
  withHandler,
)(async (request, context: ApiContext) => {
  const id = parseId(await context.params);
  const current = await heroSlideService.getById(id);
  const formData = await readUpdateFormData(request, "hero slide");
  const imageFile = formData.get("image");
  const nextImage =
    imageFile instanceof File && imageFile.size > 0
      ? await saveImageUpload(imageFile, "uploads/hero-slides")
      : toRelativeUploadPath(current.image);

  const input = validateBody(updateHeroSlideSchema, {
    image: nextImage,
    alt_text: formData.get("alt_text") ?? "",
    sort_order: formData.get("sort_order") ?? current.sort_order,
    status: formData.get("status") ?? current.status,
  });

  const updated = await heroSlideService.update(id, input);

  if (nextImage !== toRelativeUploadPath(current.image)) {
    await removeUploadedFile(current.image);
  }

  revalidateHeroSlidesCache();
  return ok(updated);
});

export const PUT = updateHeroSlide;
/** Some proxies drop multipart bodies on PUT, so the dashboard posts updates. */
export const POST = updateHeroSlide;

export const DELETE = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_UPDATE),
  withHandler,
)(async (_request, context: ApiContext) => {
  const id = parseId(await context.params);
  const current = await heroSlideService.getById(id);
  await heroSlideService.remove(id);
  await removeUploadedFile(current.image);
  revalidateHeroSlidesCache();
  return ok({ message: "Hero slide deleted successfully" });
});
