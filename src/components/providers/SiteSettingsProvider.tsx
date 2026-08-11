"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { getWhatsAppUrlFromSettings } from "@/constants/config";

const SiteSettingsContext = createContext<PublicSiteSettings | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: PublicSiteSettings | null;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): PublicSiteSettings | null {
  return useContext(SiteSettingsContext);
}

export function useWhatsAppUrl(customMessage?: string): string | null {
  const settings = useSiteSettings();
  if (!settings?.whatsapp_phone?.trim()) return null;
  return getWhatsAppUrlFromSettings(settings, customMessage);
}
