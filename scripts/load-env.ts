import fs from "fs";
import path from "path";

export function loadEnv() {
  const files = [".env.local", ".env"];

  for (const file of files) {
    const envPath = path.join(process.cwd(), file);
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }
}

function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "evimersin",
  };
}

async function runMigrations(connection: {
  query: (sql: string) => Promise<unknown>;
}) {
  const migrations = [
    `ALTER TABLE products
      ADD COLUMN discount_type VARCHAR(20) NULL COMMENT 'fixed, percentage, or NULL for no discount' AFTER price`,
    `ALTER TABLE products
      ADD COLUMN discount_value DOUBLE NOT NULL DEFAULT 0 AFTER discount_type`,
    `ALTER TABLE products
      ADD COLUMN is_hot_deal TINYINT NOT NULL DEFAULT 0 COMMENT '1 = hot deal, 0 = not hot deal' AFTER status`,
    `ALTER TABLE products
      ADD COLUMN is_featured TINYINT NOT NULL DEFAULT 0 COMMENT '1 = featured, 0 = not featured' AFTER is_hot_deal`,
    `CREATE TABLE IF NOT EXISTS site_settings (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `INSERT IGNORE INTO site_settings (
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
      'info@evimersin.com',
      '+90 555 123 45 67',
      '+90 555 123 45 67',
      '905551234567',
      'Hello EviMersin, I would like to know more about your properties.',
      'https://instagram.com/evimersin',
      '@evimersin',
      'https://facebook.com/evimersin',
      'EviMersin'
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_otps (
      id INT NOT NULL AUTO_INCREMENT,
      admin_id INT NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_password_reset_admin_id (admin_id),
      KEY idx_password_reset_expires_at (expires_at),
      CONSTRAINT fk_password_reset_admin
        FOREIGN KEY (admin_id) REFERENCES admin(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `ALTER TABLE admin
      ADD COLUMN email VARCHAR(255) NULL AFTER name`,
  ];

  for (const sql of migrations) {
    try {
      await connection.query(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        !message.includes("Duplicate column name") &&
        !message.includes("already exists")
      ) {
        throw error;
      }
    }
  }
}

export async function setupDatabase() {
  loadEnv();

  const config = getDatabaseConfig();
  const mysql = await import("mysql2/promise");
  const schemaPath = path.join(process.cwd(), "src/server/database/schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    multipleStatements: true,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE \`${config.database}\``);
    await connection.query(schemaSql);
    await runMigrations(connection);

    const defaultAdminEmail =
      process.env.MAIL_ORDER_NOTIFY_TO ??
      process.env.MAIL_FROM_ADDRESS ??
      "info@evimersin.com";

    await connection.query(
      `UPDATE admin SET email = ? WHERE email IS NULL OR email = ''`,
      [defaultAdminEmail],
    );

    console.log(`Database "${config.database}" is ready.`);
  } finally {
    await connection.end();
  }
}
