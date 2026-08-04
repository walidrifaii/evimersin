import { hasPermission } from "@/lib/auth/permissions";
import { fail } from "@/server/utils/response";
import type { ApiHandler } from "@/server/middleware/api.middleware";

export function withPermission(required: string) {
  return (handler: ApiHandler): ApiHandler =>
    async (request, context) => {
      if (!context.admin || !hasPermission(context.admin.permissions, required)) {
        return fail("You do not have permission to perform this action.", 403);
      }
      return handler(request, context);
    };
}
