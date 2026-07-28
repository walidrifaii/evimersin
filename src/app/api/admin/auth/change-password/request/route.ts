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
import { changePasswordRequestSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

export const POST = compose(
  withAuth,
  withHandler,
)(async (request, context) => {
  if (!context.admin?.sub) throw new AppError("Unauthorized", 401);
  const body = validateBody(
    changePasswordRequestSchema,
    await parseJsonBody(request),
  );
  const result = await adminService.requestChangePassword(context.admin.sub, body);
  return ok(result);
});
