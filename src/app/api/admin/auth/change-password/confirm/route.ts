import { AppError } from "@/server/utils/errors";
import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { ok } from "@/server/utils/response";
import { changePasswordConfirmSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

export const POST = compose(
  withAuth,
  withHandler,
)(async (request, context) => {
  if (!context.admin?.sub) throw new AppError("Unauthorized", 401);
  const body = validateBody(
    changePasswordConfirmSchema,
    await parseJsonBody(request),
  );
  const result = await adminService.confirmChangePassword(context.admin.sub, body);
  return ok(result);
});
