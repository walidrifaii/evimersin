import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
} from "@/server/middleware";
import { settingsService } from "@/server/services/settings.service";
import { ok } from "@/server/utils/response";
import { updateSiteSettingsSchema } from "@/server/validators/settings.validator";
import { revalidatePath, revalidateTag } from "next/cache";

export const runtime = "nodejs";

export const GET = compose(
  withAuth,
  withHandler,
)(async () => ok(await settingsService.get()));

export const PUT = compose(
  withAuth,
  withHandler,
)(async (request) => {
  const input = validateBody(
    updateSiteSettingsSchema,
    await parseJsonBody(request),
  );
  const result = await settingsService.update(input);
  revalidateTag("site-settings", "max");
  revalidatePath("/", "layout");
  return ok(result);
});
