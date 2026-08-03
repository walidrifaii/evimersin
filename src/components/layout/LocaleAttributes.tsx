"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { routing, type Locale } from "@/i18n/routing";

export function useAppLocale(): Locale {
  const intlLocale = useLocale();
  const params = useParams();
  const paramLocale = params?.locale;

  if (
    typeof paramLocale === "string" &&
    routing.locales.includes(paramLocale as Locale)
  ) {
    return paramLocale as Locale;
  }

  return intlLocale as Locale;
}

export function LocaleAttributes() {
  const locale = useAppLocale();
  const isRtl = locale === "ar";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    document.body.classList.toggle("font-[family-name:var(--font-arabic)]", isRtl);
    document.body.classList.toggle("font-sans", !isRtl);
  }, [locale, isRtl]);

  return null;
}
