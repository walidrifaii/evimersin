import { ok } from "@/server/utils/response";
import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { refreshTokenSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

const handler = compose(withHandler)(async (request) => {
  const body = validateBody(refreshTokenSchema, await parseJsonBody(request));
  const result = await adminService.refresh(body.refreshToken);
  return ok(result);
});

export const POST = handler;
