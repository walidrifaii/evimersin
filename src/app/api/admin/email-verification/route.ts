import { ok } from "@/server/utils/response";
import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
  withPermission,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { adminService } from "@/server/services/admin.service";
import { requestUserEmailVerificationSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

export const POST = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_CREATE),
  withHandler,
)(async (request, context) => {
  const body = validateBody(
    requestUserEmailVerificationSchema,
    await parseJsonBody(request),
  );
  const result = await adminService.requestUserEmailVerification(body, context.admin);
  return ok(result);
});
