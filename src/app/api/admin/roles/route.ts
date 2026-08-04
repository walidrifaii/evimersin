import {
  compose,
  withAuth,
  withHandler,
  withPermission,
} from "@/server/middleware";
import { PERMISSIONS } from "@/constants/permissions";
import { roleService } from "@/server/services/admin.service";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";

export const GET = compose(
  withAuth,
  withPermission(PERMISSIONS.USERS_READ),
  withHandler,
)(async () => ok(await roleService.list()));
