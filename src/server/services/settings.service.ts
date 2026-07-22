import { config } from "@/constants/config";
import { settingsRepository } from "@/server/database/repositories/settings.repository";
import type {
  SiteSettings,
  UpdateSiteSettingsInput,
} from "@/server/types/settings.types";

export const defaultSiteSettings: UpdateSiteSettingsInput = {
  email: config.contact.email,
  phone: config.contact.phone,
  phone_label: config.contact.phoneLabel,
  whatsapp_phone: config.whatsapp.phone,
  whatsapp_message: config.whatsapp.message,
  instagram_url: config.social.instagram,
  instagram_handle: config.social.instagramHandle,
  facebook_url: config.social.facebook,
  facebook_handle: config.social.facebookHandle,
};

function toPublicSettings(row: SiteSettings): UpdateSiteSettingsInput & {
  id: number;
  updated_at: Date | string;
} {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    phone_label: row.phone_label,
    whatsapp_phone: row.whatsapp_phone,
    whatsapp_message: row.whatsapp_message,
    instagram_url: row.instagram_url,
    instagram_handle: row.instagram_handle,
    facebook_url: row.facebook_url,
    facebook_handle: row.facebook_handle,
    updated_at: row.updated_at,
  };
}

export const settingsService = {
  async get() {
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
  },

  async update(input: UpdateSiteSettingsInput) {
    await settingsRepository.upsert(input);
    return this.get();
  },
};
