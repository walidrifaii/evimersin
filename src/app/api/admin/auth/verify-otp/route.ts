import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { ok } from "@/server/utils/response";
import { verifyOtpSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

export const POST = compose(withHandler)(async (request) => {
  const body = validateBody(verifyOtpSchema, await parseJsonBody(request));
  const result = await adminService.verifyPasswordResetOtp(body);
  return ok(result);
});
