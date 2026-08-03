"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LOCALE_COOKIE, routing, type Locale } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
};

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

function getActiveLocale(params: ReturnType<typeof useParams>): Locale {
  const paramLocale = params?.locale;

  if (
    typeof paramLocale === "string" &&
    routing.locales.includes(paramLocale as Locale)
  ) {
    return paramLocale as Locale;
  }

  return routing.defaultLocale;
}

function getHrefTarget(
  pathname: ReturnType<typeof usePathname>,
  params: ReturnType<typeof useParams>,
) {
  const routeParams = Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== "locale"),
  );

  if (Object.keys(routeParams).length === 0) {
    return pathname;
  }

  return {
    pathname,
    params: routeParams,
  } as Parameters<typeof Link>[0]["href"];
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const locale = getActiveLocale(params);
  const hrefTarget = getHrefTarget(pathname, params);
  const t = useTranslations("common");

  function handleSwitch(event: React.MouseEvent<HTMLAnchorElement>, nextLocale: Locale) {
    event.preventDefault();
    setLocaleCookie(nextLocale);
    window.location.assign(event.currentTarget.href);
  }

  return (
    <div
      dir="ltr"
      className="inline-flex items-center rounded-full border border-black/10 bg-white p-0.5"
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((item) => (
        <Link
          key={item}
          href={hrefTarget}
          locale={item}
          prefetch={false}
          scroll
          onClick={(event) => handleSwitch(event, item)}
          aria-current={item === locale ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors sm:px-3 sm:text-[13px] ${
            item === locale
              ? "bg-[var(--brand-navy)] text-white"
              : "text-[var(--nav-text)] hover:text-[var(--brand-red)]"
          }`}
        >
          {localeLabels[item]}
        </Link>
      ))}
    </div>
  );
}
