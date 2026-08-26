"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PublicSiteSettings } from "@/lib/site-settings";
import { getWhatsAppUrlFromSettings } from "@/constants/config";
import type { ApiResponse } from "@/store/api/types";

const SiteSettingsContext = createContext<PublicSiteSettings | null>(null);

export function SiteSettingsProvider({
  settings: initialSettings,
  children,
}: {
  settings: PublicSiteSettings | null;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<PublicSiteSettings | null>(
    initialSettings,
  );

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    if (initialSettings) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetch("/api/settings", { cache: "force-cache" })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as ApiResponse<PublicSiteSettings>;
        })
        .then((json) => {
          if (!cancelled && json?.success && json.data) {
            setSettings(json.data);
          }
        })
        .catch(() => {
          // Keep null settings on public site if API is unavailable.
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [initialSettings]);

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
