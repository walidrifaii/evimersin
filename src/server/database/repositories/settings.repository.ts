import { execute, query } from "@/server/database/connection";
import type {
  SiteSettings,
  UpdateSiteSettingsInput,
} from "@/server/types/settings.types";

const SELECT_FIELDS = `
  id,
  email,
  phone,
  phone_label,
  whatsapp_phone,
  whatsapp_message,
  instagram_url,
  instagram_handle,
  facebook_url,
  facebook_handle,
  updated_at
`;

export const settingsRepository = {
  async find() {
    const rows = await query<SiteSettings[]>(
      `SELECT ${SELECT_FIELDS} FROM site_settings WHERE id = 1 LIMIT 1`,
    );
    return rows[0] ?? null;
  },

  async upsert(input: UpdateSiteSettingsInput) {
    await execute(
      `INSERT INTO site_settings (
        id,
        email,
        phone,
        phone_label,
        whatsapp_phone,
        whatsapp_message,
        instagram_url,
        instagram_handle,
        facebook_url,
        facebook_handle
      ) VALUES (
        1,
        :email,
        :phone,
        :phone_label,
        :whatsapp_phone,
        :whatsapp_message,
        :instagram_url,
        :instagram_handle,
        :facebook_url,
        :facebook_handle
      )
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        phone = VALUES(phone),
        phone_label = VALUES(phone_label),
        whatsapp_phone = VALUES(whatsapp_phone),
        whatsapp_message = VALUES(whatsapp_message),
        instagram_url = VALUES(instagram_url),
        instagram_handle = VALUES(instagram_handle),
        facebook_url = VALUES(facebook_url),
        facebook_handle = VALUES(facebook_handle)`,
      input,
    );
  },
};
