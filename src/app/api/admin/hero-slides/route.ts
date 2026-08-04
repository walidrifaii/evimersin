import {
  compose,
  validateBody,
  withAuth,
  withHandler,
  withPermission,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { heroSlideService } from "@/server/services/hero-slide.service";
import { ok } from "@/server/utils/response";
import { revalidateHeroSlidesCache } from "@/server/utils/revalidate";
import { AppError } from "@/server/utils/errors";
import { saveImageUpload } from "@/server/utils/upload";
import { createHeroSlideSchema } from "@/server/validators/hero-slide.validator";

export const runtime = "nodejs";

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_READ),
  withHandler,
)(async () => ok(await heroSlideService.list()));

export const POST = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_UPDATE),
  withHandler,
)(async (request) => {
  const formData = await request.formData();
  const imageFile = formData.get("image");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    throw new AppError("Hero slide image is required", 422);
  }

  const image = await saveImageUpload(imageFile, "uploads/hero-slides");

  const input = validateBody(createHeroSlideSchema, {
    image,
    alt_text: formData.get("alt_text"),
    sort_order: formData.get("sort_order"),
    status: formData.get("status"),
  });

  const created = await heroSlideService.create(input);
  revalidateHeroSlidesCache();
  return ok(created, 201);
});
