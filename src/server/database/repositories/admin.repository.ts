import { execute, query } from "@/server/database/connection";
import type { AdminRecord, CreateAdminInput, UpdateAdminInput } from "@/server/types/admin.types";

const SELECT_FIELDS = `
  id, username, password, name, email, status, created_at, updated_at
`;

let ensurePromise: Promise<void> | null = null;

async function ensureEmailColumn() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      try {
        await execute(
          `ALTER TABLE admin ADD COLUMN email VARCHAR(255) NULL AFTER name`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("Duplicate column name")) {
          throw error;
        }
      }

      const defaultEmail =
        process.env.MAIL_ORDER_NOTIFY_TO ??
        process.env.MAIL_FROM_ADDRESS ??
        "info@evimersin.com";

      await execute(
        `UPDATE admin SET email = :email WHERE email IS NULL OR email = ''`,
        { email: defaultEmail },
      );
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  await ensurePromise;
}

export const adminRepository = {
  async findAll(): Promise<AdminRecord[]> {
    await ensureEmailColumn();

    return query<AdminRecord[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin
       ORDER BY id DESC`,
    );
  },

  async findById(id: number): Promise<AdminRecord | null> {
    await ensureEmailColumn();

    const rows = await query<AdminRecord[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin
       WHERE id = :id
       LIMIT 1`,
      { id },
    );

    return rows[0] ?? null;
  },

  async findByUsername(username: string): Promise<AdminRecord | null> {
    await ensureEmailColumn();

    const rows = await query<AdminRecord[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin
       WHERE username = :username
       LIMIT 1`,
      { username },
    );

    return rows[0] ?? null;
  },

  async findByEmailOrUsername(identifier: string): Promise<AdminRecord | null> {
    await ensureEmailColumn();

    const rows = await query<AdminRecord[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin
       WHERE username = :identifier OR email = :identifier
       LIMIT 1`,
      { identifier },
    );

    return rows[0] ?? null;
  },

  async create(input: CreateAdminInput & { password: string }): Promise<number> {
    await ensureEmailColumn();

    const result = await execute(
      `INSERT INTO admin (username, password, name, email, status)
       VALUES (:username, :password, :name, :email, :status)`,
      {
        username: input.username,
        password: input.password,
        name: input.name,
        email: input.email,
        status: input.status ?? 1,
      },
    );

    return result.insertId;
  },

  async update(id: number, input: UpdateAdminInput & { password?: string }): Promise<boolean> {
    await ensureEmailColumn();

    const fields: string[] = [];
    const params: Record<string, string | number> = { id };

    if (input.username !== undefined) {
      fields.push("username = :username");
      params.username = input.username;
    }
    if (input.name !== undefined) {
      fields.push("name = :name");
      params.name = input.name;
    }
    if (input.email !== undefined) {
      fields.push("email = :email");
      params.email = input.email;
    }
    if (input.status !== undefined) {
      fields.push("status = :status");
      params.status = input.status;
    }
    if (input.password !== undefined) {
      fields.push("password = :password");
      params.password = input.password;
    }

    if (fields.length === 0) return false;

    const result = await execute(
      `UPDATE admin SET ${fields.join(", ")} WHERE id = :id`,
      params,
    );

    return result.affectedRows > 0;
  },

  async delete(id: number): Promise<boolean> {
    await ensureEmailColumn();

    const result = await execute(`DELETE FROM admin WHERE id = :id`, { id });

    return result.affectedRows > 0;
  },
};
