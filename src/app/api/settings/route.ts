import { compose, withHandler } from "@/server/middleware";
import { settingsService } from "@/server/services/settings.service";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";

export const GET = compose(withHandler)(async () =>
  ok(await settingsService.get()),
);
