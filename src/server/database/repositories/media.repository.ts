import { execute, query } from "@/server/database/connection";

export type MediaFile = {
  path: string;
  content_type: string;
  byte_size: number;
  data: Buffer;
};

let ensurePromise: Promise<void> | null = null;

async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await execute(`
        CREATE TABLE IF NOT EXISTS media_files (
          path VARCHAR(255) NOT NULL PRIMARY KEY,
          content_type VARCHAR(100) NOT NULL,
          byte_size INT NOT NULL,
          data LONGBLOB NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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

export const mediaRepository = {
  ensureTable,

  async save(input: { path: string; contentType: string; data: Buffer }) {
    await ensureTable();
    await execute(
      `INSERT INTO media_files (path, content_type, byte_size, data)
       VALUES (:path, :content_type, :byte_size, :data)
       ON DUPLICATE KEY UPDATE
         content_type = VALUES(content_type),
         byte_size = VALUES(byte_size),
         data = VALUES(data)`,
      {
        path: input.path,
        content_type: input.contentType,
        byte_size: input.data.byteLength,
        data: input.data,
      },
    );
  },

  async findByPath(path: string) {
    await ensureTable();
    const rows = await query<MediaFile[]>(
      `SELECT path, content_type, byte_size, data
       FROM media_files WHERE path = :path LIMIT 1`,
      { path },
    );
    return rows[0] ?? null;
  },

  async exists(path: string) {
    await ensureTable();
    const rows = await query<{ path: string }[]>(
      `SELECT path FROM media_files WHERE path = :path LIMIT 1`,
      { path },
    );
    return rows.length > 0;
  },

  async remove(path: string) {
    await ensureTable();
    await execute(`DELETE FROM media_files WHERE path = :path`, { path });
  },

  async listPaths() {
    await ensureTable();
    const rows = await query<{ path: string }[]>(
      `SELECT path FROM media_files ORDER BY path ASC`,
    );
    return rows.map((row) => row.path);
  },
};
