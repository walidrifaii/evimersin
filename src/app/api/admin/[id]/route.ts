import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
  withPermission,
  type ApiContext,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { adminService } from "@/server/services/admin.service";
import { updateAdminSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

function parseId(params: Record<string, string>) {
  const parsed = Number(params.id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError("Invalid admin id", 400);
  }
  return parsed;
}

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_READ),
  withHandler,
)(async (_request, context: ApiContext) => {
  const params = await context.params;
  const admin = await adminService.getById(parseId(params), context.admin);
  return ok(admin);
});

export const PUT = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_UPDATE),
  withHandler,
)(async (request, context: ApiContext) => {
  const params = await context.params;
  const body = validateBody(updateAdminSchema, await parseJsonBody(request));
  const admin = await adminService.update(parseId(params), body, context.admin);
  return ok(admin);
});

export const DELETE = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_DELETE),
  withHandler,
)(async (_request, context: ApiContext) => {
  const params = await context.params;
  await adminService.remove(parseId(params), context.admin);
  return ok({ message: "Admin deleted successfully" });
});
