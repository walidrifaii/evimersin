import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { announcementService } from "@/server/services/announcement.service";
import { ok } from "@/server/utils/response";
import { guestPresenceSchema } from "@/server/validators/announcement.validator";

export const runtime = "nodejs";

export const POST = compose(withHandler)(async (request) => {
  const input = validateBody(guestPresenceSchema, await parseJsonBody(request));

  await announcementService.updatePresence({
    session_id: input.sessionId,
    path: input.path,
    locale: input.locale,
  });

  return ok({ ok: true });
});
