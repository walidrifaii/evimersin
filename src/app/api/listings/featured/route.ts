import type { NextRequest } from "next/server";
import { compose, withHandler } from "@/server/middleware";
import { getFeaturedPropertyListingsPage } from "@/features/products/server-data";
import { HOME_LISTINGS_PAGE_SIZE } from "@/features/products/types";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";
export const revalidate = 60;

/** Public featured listings — paginated (default 6 per page). */
export const GET = compose(withHandler)(async (request: NextRequest) => {
  const page = Number(request.nextUrl.searchParams.get("page") ?? 1);
  const pageSize = Number(
    request.nextUrl.searchParams.get("pageSize") ?? HOME_LISTINGS_PAGE_SIZE,
  );

  return ok(await getFeaturedPropertyListingsPage(page, pageSize));
});
