import { routing, type Locale } from "@/i18n/routing";

export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    return "ar";
  }
  return routing.defaultLocale;
}

export function buildLocalizedHref(
  pathname: string,
  search: string,
  nextLocale: Locale,
) {
  const currentLocale = getLocaleFromPathname(pathname);
  let path = pathname;

  if (currentLocale !== routing.defaultLocale) {
    if (path === `/${currentLocale}`) {
      path = "/";
    } else if (path.startsWith(`/${currentLocale}/`)) {
      path = path.slice(currentLocale.length + 1) || "/";
    }
  }

  if (nextLocale === routing.defaultLocale) {
    return `${path}${search}`;
  }

  const localizedPath = path === "/" ? `/${nextLocale}` : `/${nextLocale}${path}`;
  return `${localizedPath}${search}`;
}
