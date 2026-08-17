import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const CANONICAL_HOST = "evimersin.co";
const LEGACY_HOST = "amctag-evimersin.38f0fz.easypanel.host";

/** Hostname the visitor used, not the internal EasyPanel/Traefik Host. */
function getPublicHost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host");
  const raw = (forwarded ?? host ?? "").split(",")[0]?.trim().toLowerCase() ?? "";
  return raw.split(":")[0] ?? "";
}

export default function middleware(request: NextRequest) {
  const publicHost = getPublicHost(request);

  if (publicHost === LEGACY_HOST) {
    const canonical = new URL(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
      `https://${CANONICAL_HOST}`,
    );
    return NextResponse.redirect(canonical, 308);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|dashboard|login|api-docs|uploads|firebase-messaging-sw|_next|_vercel|.*\\..*).*)",
  ],
};
