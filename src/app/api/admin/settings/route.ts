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
  return ok(await settingsService.update(input));
});
