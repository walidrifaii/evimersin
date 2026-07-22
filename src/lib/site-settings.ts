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
  { revalidate: 60, tags: ["site-settings"] },
);

/** Per-request dedupe + cross-request ISR cache (60s). */
export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  return getCachedSiteSettings();
});
