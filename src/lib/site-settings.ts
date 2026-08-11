import { unstable_cache } from "next/cache";
import { cache } from "react";
import { settingsService } from "@/server/services/settings.service";
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

/** Returns saved settings from the database, or null if unavailable (never config defaults). */
export const getSiteSettings = cache(async (): Promise<PublicSiteSettings | null> => {
  try {
    return await getCachedSiteSettings();
  } catch (error) {
    console.error("[site-settings] Database unavailable:", error);
    return null;
  }
});
