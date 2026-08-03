import { routing, type Locale } from "@/i18n/routing";

export function getLocaleFromPathname(pathname: string): Locale {
  const path = pathname.split("?")[0] || "/";

  if (path === "/ar" || path.startsWith("/ar/")) {
    return "ar";
  }

  if (path === "/en" || path.startsWith("/en/")) {
    return routing.defaultLocale;
  }

  return routing.defaultLocale;
}

export function stripLocalePrefix(pathname: string): string {
  let path = pathname.split("?")[0] || "/";

  for (const locale of routing.locales) {
    if (path === `/${locale}`) {
      return "/";
    }
    if (path.startsWith(`/${locale}/`)) {
      return path.slice(locale.length + 1) || "/";
    }
  }

  return path;
}

export function buildLocalizedHref(
  pathname: string,
  search: string,
  nextLocale: Locale,
): string {
  const path = stripLocalePrefix(pathname);

  if (nextLocale === routing.defaultLocale) {
    return `${path}${search}`;
  }

  const localizedPath = path === "/" ? `/${nextLocale}` : `/${nextLocale}${path}`;
  return `${localizedPath}${search}`;
}
