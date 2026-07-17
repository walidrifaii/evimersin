import { ok } from "@/server/utils/response";
import {
  compose,
  withAuth,
  withHandler,
  type ApiContext,
} from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";
import { logoutSchema } from "@/server/validators/admin.validator";

export const runtime = "nodejs";

const handler = compose(withAuth, withHandler)(async (request, context: ApiContext) => {
  let body: { refreshToken?: string } = {};

  try {
    const json = await request.json();
    body = logoutSchema.parse(json ?? {});
  } catch {
    body = {};
  }

  const result = await adminService.logout(body.refreshToken, context.admin?.sub);
  return ok(result);
});

export const POST = handler;
