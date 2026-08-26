import { execute, query } from "@/server/database/connection";
import { SOCIAL_PLATFORMS } from "@/constants/social-platforms";
import type {
  SiteSettings,
  UpdateSiteSettingsInput,
} from "@/server/types/settings.types";

const SOCIAL_SELECT = SOCIAL_PLATFORMS.flatMap((platform) => [
  `${platform}_url`,
  `${platform}_handle`,
  `${platform}_visible`,
]).join(",\n  ");

const SELECT_FIELDS = `
  id,
  email,
  phone,
  phone_label,
  whatsapp_phone,
  whatsapp_message,
  address_name,
  address,
  ${SOCIAL_SELECT},
  updated_at
`;

let ensurePromise: Promise<void> | null = null;

/** Create table if missing only — no runtime ALTER TABLE. */
async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = execute(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT NOT NULL PRIMARY KEY DEFAULT 1,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        phone_label VARCHAR(50) NOT NULL,
        whatsapp_phone VARCHAR(30) NOT NULL,
        whatsapp_message VARCHAR(500) NOT NULL,
        address_name VARCHAR(100) NOT NULL DEFAULT 'EviMersin',
        address VARCHAR(500) NOT NULL DEFAULT 'Palmiye, 2.Cadde, 33110 Yenişehir/Mersin',
        instagram_url VARCHAR(500) NOT NULL,
        instagram_handle VARCHAR(100) NOT NULL,
        instagram_visible TINYINT NOT NULL DEFAULT 1,
        facebook_url VARCHAR(500) NOT NULL,
        facebook_handle VARCHAR(100) NOT NULL,
        facebook_visible TINYINT NOT NULL DEFAULT 1,
        x_url VARCHAR(500) NOT NULL DEFAULT '',
        x_handle VARCHAR(100) NOT NULL DEFAULT '',
        x_visible TINYINT NOT NULL DEFAULT 0,
        telegram_url VARCHAR(500) NOT NULL DEFAULT '',
        telegram_handle VARCHAR(100) NOT NULL DEFAULT '',
        telegram_visible TINYINT NOT NULL DEFAULT 0,
        youtube_url VARCHAR(500) NOT NULL DEFAULT '',
        youtube_handle VARCHAR(100) NOT NULL DEFAULT '',
        youtube_visible TINYINT NOT NULL DEFAULT 0,
        tiktok_url VARCHAR(500) NOT NULL DEFAULT '',
        tiktok_handle VARCHAR(100) NOT NULL DEFAULT '',
        tiktok_visible TINYINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
      .then(() => undefined)
      .catch((error) => {
        ensurePromise = null;
        throw error;
      });
  }

  await ensurePromise;
}

function toDbPayload(input: UpdateSiteSettingsInput) {
  const payload: Record<string, string | number> = {
    email: input.email,
    phone: input.phone,
    whatsapp_phone: input.whatsapp_phone,
    whatsapp_message: input.whatsapp_message,
    address_name: input.address_name,
    address: input.address,
  };

  for (const platform of SOCIAL_PLATFORMS) {
    payload[`${platform}_url`] = input[`${platform}_url`];
    payload[`${platform}_handle`] = input[`${platform}_handle`];
    payload[`${platform}_visible`] = input[`${platform}_visible`] ? 1 : 0;
  }

  return payload;
}

const SOCIAL_INSERT_COLUMNS = SOCIAL_PLATFORMS.flatMap((platform) => [
  `${platform}_url`,
  `${platform}_handle`,
  `${platform}_visible`,
]).join(",\n        ");

const SOCIAL_INSERT_VALUES = SOCIAL_PLATFORMS.flatMap((platform) => [
  `:${platform}_url`,
  `:${platform}_handle`,
  `:${platform}_visible`,
]).join(",\n        ");

const SOCIAL_UPDATE_SET = SOCIAL_PLATFORMS.flatMap((platform) => [
  `${platform}_url = VALUES(${platform}_url)`,
  `${platform}_handle = VALUES(${platform}_handle)`,
  `${platform}_visible = VALUES(${platform}_visible)`,
]).join(",\n        ");

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
        address_name,
        address,
        ${SOCIAL_INSERT_COLUMNS}
      ) VALUES (
        1,
        :email,
        :phone,
        :phone,
        :whatsapp_phone,
        :whatsapp_message,
        :address_name,
        :address,
        ${SOCIAL_INSERT_VALUES}
      )
      ON DUPLICATE KEY UPDATE
        email = VALUES(email),
        phone = VALUES(phone),
        phone_label = VALUES(phone),
        whatsapp_phone = VALUES(whatsapp_phone),
        whatsapp_message = VALUES(whatsapp_message),
        address_name = VALUES(address_name),
        address = VALUES(address),
        ${SOCIAL_UPDATE_SET}`,
      toDbPayload(input),
    );
  },
};
