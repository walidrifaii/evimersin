"use client";

import { routing, type Locale } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export function useAppLocale(): Locale {
  const params = useParams();
  const paramLocale = params?.locale;

  if (
    typeof paramLocale === "string" &&
    routing.locales.includes(paramLocale as Locale)
  ) {
    return paramLocale as Locale;
  }

  return routing.defaultLocale;
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
