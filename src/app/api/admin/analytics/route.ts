import { analyticsService } from "@/server/services/analytics.service";
import { compose, withAuth, withHandler } from "@/server/middleware";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";

export const GET = compose(withAuth, withHandler)(async () =>
  ok(await analyticsService.getOverview()),
);
