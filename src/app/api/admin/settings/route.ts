import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
  withPermission,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { settingsService } from "@/server/services/settings.service";
import { ok } from "@/server/utils/response";
import { revalidateSettingsCache } from "@/server/utils/revalidate";
import { updateSiteSettingsSchema } from "@/server/validators/settings.validator";

export const runtime = "nodejs";

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_READ),
  withHandler,
)(async () => ok(await settingsService.get()));

export const PUT = compose(
  withAuth,
  withPermission(PERMISSIONS.SETTINGS_WRITE),
  withHandler,
)(async (request) => {
  const input = validateBody(
    updateSiteSettingsSchema,
    await parseJsonBody(request),
  );
  const result = await settingsService.update(input);
  revalidateSettingsCache();
  return ok(result);
});
