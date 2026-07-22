import { cache } from "react";
import { settingsService } from "@/server/services/settings.service";
import type { UpdateSiteSettingsInput } from "@/server/types/settings.types";

export type PublicSiteSettings = UpdateSiteSettingsInput & {
  id: number;
  updated_at?: Date | string;
};

export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  return settingsService.get();
});
