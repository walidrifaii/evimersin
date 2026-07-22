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

let ensurePromise: Promise<void> | null = null;

async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await execute(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id INT NOT NULL PRIMARY KEY DEFAULT 1,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          phone_label VARCHAR(50) NOT NULL,
          whatsapp_phone VARCHAR(30) NOT NULL,
          whatsapp_message VARCHAR(500) NOT NULL,
          instagram_url VARCHAR(500) NOT NULL,
          instagram_handle VARCHAR(100) NOT NULL,
          facebook_url VARCHAR(500) NOT NULL,
          facebook_handle VARCHAR(100) NOT NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  await ensurePromise;
}

export const settingsRepository = {
  ensureTable,

  async find() {
    await ensureTable();
    const rows = await query<SiteSettings[]>(
      `SELECT ${SELECT_FIELDS} FROM site_settings WHERE id = 1 LIMIT 1`,
    );
    return rows[0] ?? null;
  },

  async upsert(input: UpdateSiteSettingsInput) {
    await ensureTable();
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
