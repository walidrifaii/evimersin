"use client";

import { routing, type Locale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
};

function buildLocalizedHref(pathname: string, search: string, nextLocale: Locale) {
  let path = pathname;

  for (const item of routing.locales) {
    if (path === `/${item}`) {
      path = "/";
      break;
    }
    if (path.startsWith(`/${item}/`)) {
      path = path.slice(item.length + 1) || "/";
      break;
    }
  }

  if (nextLocale === routing.defaultLocale) {
    return `${path}${search}`;
  }

  const localizedPath = path === "/" ? `/${nextLocale}` : `/${nextLocale}${path}`;
  return `${localizedPath}${search}`;
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    const href = buildLocalizedHref(
      window.location.pathname,
      window.location.search,
      nextLocale,
    );

    window.location.assign(href);
  }

  return (
    <div
      dir="ltr"
      className="inline-flex items-center rounded-full border border-black/10 bg-white p-0.5"
      role="group"
      aria-label={t("language")}
    >
      {routing.locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => switchLocale(item)}
          aria-pressed={item === locale}
          aria-current={item === locale ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition-colors sm:px-3 sm:text-[13px] ${
            item === locale
              ? "bg-[var(--brand-navy)] text-white"
              : "text-[var(--nav-text)] hover:text-[var(--brand-red)]"
          }`}
        >
          {localeLabels[item]}
        </button>
      ))}
    </div>
  );
}
