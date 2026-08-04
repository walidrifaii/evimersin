import { execute, query } from "@/server/database/connection";
import { roleRepository } from "@/server/database/repositories/role.repository";
import type { AdminRecord, CreateAdminInput, UpdateAdminInput } from "@/server/types/admin.types";

const SELECT_FIELDS = `
  a.id,
  a.username,
  a.password,
  a.name,
  a.email,
  a.status,
  a.role_id,
  a.created_at,
  a.updated_at,
  r.name AS role_name,
  r.label AS role_label,
  r.permissions AS role_permissions
`;

type AdminRow = AdminRecord & {
  role_name: string;
  role_label: string;
  role_permissions: string;
};

let ensurePromise: Promise<void> | null = null;

async function ensureEmailColumn() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await roleRepository.ensureReady();

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
  async findAll(): Promise<AdminRow[]> {
    await ensureEmailColumn();

    return query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       ORDER BY a.id DESC`,
    );
  },

  async findById(id: number): Promise<AdminRow | null> {
    await ensureEmailColumn();

    const rows = await query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       WHERE a.id = :id
       LIMIT 1`,
      { id },
    );

    return rows[0] ?? null;
  },

  async findByUsername(username: string): Promise<AdminRow | null> {
    await ensureEmailColumn();

    const rows = await query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       WHERE a.username = :username
       LIMIT 1`,
      { username },
    );

    return rows[0] ?? null;
  },

  async findByEmailOrUsername(identifier: string): Promise<AdminRow | null> {
    await ensureEmailColumn();

    const rows = await query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       WHERE a.username = :identifier OR a.email = :identifier
       LIMIT 1`,
      { identifier },
    );

    return rows[0] ?? null;
  },

  async findPrimaryNotifyEmail(): Promise<string | null> {
    await ensureEmailColumn();

    const rows = await query<Array<{ email: string }>>(
      `SELECT email
       FROM admin
       WHERE status = 1
         AND email IS NOT NULL
         AND TRIM(email) <> ''
       ORDER BY id ASC
       LIMIT 1`,
    );

    const email = rows[0]?.email?.trim();
    return email || null;
  },

  async countByRole(roleId: number) {
    await ensureEmailColumn();
    const rows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total FROM admin WHERE role_id = :roleId`,
      { roleId },
    );
    return Number(rows[0]?.total ?? 0);
  },

  async create(input: CreateAdminInput & { password: string }): Promise<number> {
    await ensureEmailColumn();

    const result = await execute(
      `INSERT INTO admin (username, password, name, email, status, role_id)
       VALUES (:username, :password, :name, :email, :status, :role_id)`,
      {
        username: input.username,
        password: input.password,
        name: input.name,
        email: input.email,
        status: input.status ?? 1,
        role_id: input.roleId ?? 4,
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
    if (input.roleId !== undefined) {
      fields.push("role_id = :role_id");
      params.role_id = input.roleId;
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

export type { AdminRow };
