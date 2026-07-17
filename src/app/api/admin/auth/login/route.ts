import { ok } from "@/server/utils/response";
import {
  compose,
  parseJsonBody,
  validateBody,
  withHandler,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { loginSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

/**
 * @openapi
 * /api/admin/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Admin login
 *     description: Returns access token and refresh token for dashboard admin.
 */
const handler = compose(withHandler)(async (request) => {
  const body = validateBody(loginSchema, await parseJsonBody(request));
  const result = await adminService.login(body);
  return ok(result);
});

export const POST = handler;
