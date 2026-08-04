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
import { createAdminSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_READ),
  withHandler,
)(async (_request, context) => ok(await adminService.list(context.admin)));

export const POST = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_WRITE),
  withHandler,
)(async (request, context) => {
  const body = validateBody(createAdminSchema, await parseJsonBody(request));
  const admin = await adminService.create(body, context.admin);
  return ok(admin, 201);
});
