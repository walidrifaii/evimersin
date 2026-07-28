import { searchService } from "@/server/services/search.service";
import { compose, withAuth, withHandler } from "@/server/middleware";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";

export const GET = compose(withAuth, withHandler)(async (request) => {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return ok(await searchService.search(q));
});
