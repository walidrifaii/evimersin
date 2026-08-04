import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { visitService } from "@/server/services/visit.service";
import { ok } from "@/server/utils/response";
import { trackVisitSchema } from "@/server/validators/notification.validator";

export const runtime = "nodejs";

export const POST = compose(withHandler)(async (request) => {
  const input = validateBody(trackVisitSchema, await parseJsonBody(request));
  const userAgent = request.headers.get("user-agent");

  const result = await visitService.trackVisit({
    session_id: input.sessionId,
    path: input.path,
    locale: input.locale,
    referrer: input.referrer || null,
    user_agent: userAgent?.slice(0, 500) ?? null,
  });

  return ok(result, 201);
});
