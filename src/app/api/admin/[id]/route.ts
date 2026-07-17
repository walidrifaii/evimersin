import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
  type ApiContext,
} from "@/server/middleware";
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

const getHandler = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const params = await context.params;
  const admin = await adminService.getById(parseId(params));
  return ok(admin);
});

const putHandler = compose(withAuth, withHandler)(async (request, context: ApiContext) => {
  const params = await context.params;
  const body = validateBody(updateAdminSchema, await parseJsonBody(request));
  const admin = await adminService.update(parseId(params), body);
  return ok(admin);
});

const deleteHandler = compose(withAuth, withHandler)(async (_request, context: ApiContext) => {
  const params = await context.params;
  await adminService.remove(parseId(params));
  return ok({ message: "Admin deleted successfully" });
});

export const GET = getHandler;
export const PUT = putHandler;
export const DELETE = deleteHandler;
