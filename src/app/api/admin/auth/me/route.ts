import { AppError } from "@/server/utils/errors";
import { ok } from "@/server/utils/response";
import { compose, withAuth, withHandler } from "@/server/middleware";
import { adminService } from "@/server/services/admin.service";

export const runtime = "nodejs";

const handler = compose(withAuth, withHandler)(async (_request, context) => {
  if (!context.admin?.sub) throw new AppError("Unauthorized", 401);
  const admin = await adminService.me(context.admin.sub);
  return ok(admin);
});

export const GET = handler;
