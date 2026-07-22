import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { ok } from "@/server/utils/response";
import { forgotPasswordSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

export const POST = compose(withHandler)(async (request) => {
  const body = validateBody(forgotPasswordSchema, await parseJsonBody(request));
  const result = await adminService.requestPasswordReset(body);
  return ok(result);
});
