import { unstable_cache } from "next/cache";
import { cache } from "react";
import {
  buildDefaultPublicSettings,
  settingsService,
} from "@/server/services/settings.service";
import type { UpdateSiteSettingsInput } from "@/server/types/settings.types";

export type PublicSiteSettings = UpdateSiteSettingsInput & {
  id: number;
  updated_at?: Date | string;
};

const getCachedSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => settingsService.get(),
  ["site-settings"],
  { tags: ["site-settings"], revalidate: 30 },
);

/** Per-request dedupe + short-lived cache. DB failures are not cached. */
export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  try {
    return await getCachedSiteSettings();
  } catch (error) {
    console.error("[site-settings] Database unavailable, using defaults:", error);
    return buildDefaultPublicSettings();
  }
});
