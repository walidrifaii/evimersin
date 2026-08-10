import { config } from "@/constants/config";
import { SOCIAL_PLATFORMS } from "@/constants/social-platforms";
import { normalizeSocialSettings } from "@/lib/social-settings";
import { settingsRepository } from "@/server/database/repositories/settings.repository";
import type {
  SiteSettings,
  UpdateSiteSettingsInput,
} from "@/server/types/settings.types";
import { AppError } from "@/server/utils/errors";

const defaultSocialFields = SOCIAL_PLATFORMS.reduce((fields, platform) => {
  const urlKey = `${platform}_url` as const;
  const handleKey = `${platform}_handle` as const;
  const visibleKey = `${platform}_visible` as const;

  const url =
    platform === "instagram"
      ? config.social.instagram
      : platform === "facebook"
        ? config.social.facebook
        : "";

  fields[urlKey] = url;
  fields[handleKey] =
    platform === "instagram"
      ? config.social.instagramHandle
      : platform === "facebook"
        ? config.social.facebookHandle
        : platform.charAt(0).toUpperCase() + platform.slice(1);
  fields[visibleKey] = platform === "instagram" || platform === "facebook";

  return fields;
}, {} as SocialPlatformFieldsOnly);

type SocialPlatformFieldsOnly = Pick<
  UpdateSiteSettingsInput,
  `${(typeof SOCIAL_PLATFORMS)[number]}_url` | `${(typeof SOCIAL_PLATFORMS)[number]}_handle` | `${(typeof SOCIAL_PLATFORMS)[number]}_visible`
>;

export const defaultSiteSettings: UpdateSiteSettingsInput = {
  email: config.contact.email,
  phone: config.contact.phone,
  whatsapp_phone: config.whatsapp.phone,
  whatsapp_message: config.whatsapp.message,
  address_name: config.contact.addressName,
  address: config.contact.address,
  ...defaultSocialFields,
};

export type PublicSiteSettings = UpdateSiteSettingsInput & {
  id: number;
  updated_at: Date | string;
};

function toPublicSettings(row: SiteSettings): PublicSiteSettings {
  const social = SOCIAL_PLATFORMS.reduce((fields, platform) => {
    const urlKey = `${platform}_url` as const;
    const handleKey = `${platform}_handle` as const;
    const visibleKey = `${platform}_visible` as const;

    fields[urlKey] = row[urlKey] ?? "";
    fields[handleKey] = row[handleKey] ?? "";
    fields[visibleKey] = Number(row[visibleKey] ?? 0) === 1;

    return fields;
  }, {} as SocialPlatformFieldsOnly);

  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    whatsapp_phone: row.whatsapp_phone,
    whatsapp_message: row.whatsapp_message,
    address_name: row.address_name ?? config.contact.addressName,
    address: row.address ?? config.contact.address,
    ...social,
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
      const normalized = normalizeSocialSettings(input);
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
