"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ar: "AR",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div
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
