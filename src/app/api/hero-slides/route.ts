import { compose, withHandler } from "@/server/middleware";
import { getHeroSlides } from "@/lib/hero-slides";
import { ok } from "@/server/utils/response";

export const runtime = "nodejs";
export const revalidate = 60;

/** Public hero slider data — images served via /api/media/... */
export const GET = compose(withHandler)(async () => ok(await getHeroSlides()));
