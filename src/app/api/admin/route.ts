import { ok } from "@/server/utils/response";
import {
  compose,
  parseJsonBody,
  validateBody,
  withAuth,
  withHandler,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { createAdminSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

const getHandler = compose(withAuth, withHandler)(async () => {
  const admins = await adminService.list();
  return ok(admins);
});

const postHandler = compose(withAuth, withHandler)(async (request) => {
  const body = validateBody(createAdminSchema, await parseJsonBody(request));
  const admin = await adminService.create(body);
  return ok(admin, 201);
});

export const GET = getHandler;
export const POST = postHandler;
