"use client";

import { getLocaleFromPathname } from "@/lib/locale";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { Locale } from "@/i18n/routing";

export function useAppLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPathname(pathname);
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
