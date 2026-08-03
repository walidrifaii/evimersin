import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|dashboard|login|api-docs|uploads|firebase-messaging-sw|_next|_vercel|.*\\..*).*)",
  ],
};
