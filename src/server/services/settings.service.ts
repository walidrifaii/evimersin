import { config } from "@/constants/config";
import { deriveSocialHandleFromUrl } from "@/lib/social-settings";
import { settingsRepository } from "@/server/database/repositories/settings.repository";
import type {
  SiteSettings,
  UpdateSiteSettingsInput,
} from "@/server/types/settings.types";
import { AppError } from "@/server/utils/errors";

export const defaultSiteSettings: UpdateSiteSettingsInput = {
  email: config.contact.email,
  phone: config.contact.phone,
  whatsapp_phone: config.whatsapp.phone,
  whatsapp_message: config.whatsapp.message,
  instagram_url: config.social.instagram,
  instagram_handle: config.social.instagramHandle,
  instagram_visible: true,
  facebook_url: config.social.facebook,
  facebook_handle: config.social.facebookHandle,
  facebook_visible: true,
};

export type PublicSiteSettings = UpdateSiteSettingsInput & {
  id: number;
  updated_at: Date | string;
};

function toPublicSettings(row: SiteSettings): PublicSiteSettings {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    whatsapp_phone: row.whatsapp_phone,
    whatsapp_message: row.whatsapp_message,
    instagram_url: row.instagram_url,
    instagram_handle: row.instagram_handle,
    instagram_visible: Number(row.instagram_visible ?? 1) === 1,
    facebook_url: row.facebook_url,
    facebook_handle: row.facebook_handle,
    facebook_visible: Number(row.facebook_visible ?? 1) === 1,
    updated_at: row.updated_at,
  };
}

export const settingsService = {
  async get() {
    try {
      const existing = await settingsRepository.find();
      if (existing) return toPublicSettings(existing);

      await settingsRepository.upsert(defaultSiteSettings);
      const created = await settingsRepository.find();
      if (!created) {
        return {
          id: 1,
          ...defaultSiteSettings,
          updated_at: new Date().toISOString(),
        };
      }
      return toPublicSettings(created);
    } catch (error) {
      console.error("[settings] Falling back to defaults:", error);
      return {
        id: 1,
        ...defaultSiteSettings,
        updated_at: new Date().toISOString(),
      };
    }
  },

  async update(input: UpdateSiteSettingsInput) {
    try {
      const normalized: UpdateSiteSettingsInput = {
        ...input,
        instagram_handle: deriveSocialHandleFromUrl(
          input.instagram_url,
          "instagram",
        ),
        facebook_handle: deriveSocialHandleFromUrl(input.facebook_url, "facebook"),
      };
      await settingsRepository.upsert(normalized);
      const saved = await settingsRepository.find();
      if (!saved) {
        throw new AppError("Settings were saved but could not be loaded", 500);
      }
      return toPublicSettings(saved);
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("[settings] Failed to update:", error);
      throw new AppError(
        "Failed to save settings. Make sure the database is reachable.",
        500,
      );
    }
  },
};
