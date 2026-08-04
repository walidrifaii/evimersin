import { execute, query } from "@/server/database/connection";
import { roleRepository } from "@/server/database/repositories/role.repository";
import { normalizePermissions } from "@/constants/permissions";
import type { AdminRecord, CreateAdminInput, UpdateAdminInput } from "@/server/types/admin.types";

const SELECT_FIELDS = `
  a.id,
  a.username,
  a.password,
  a.name,
  a.first_name,
  a.last_name,
  a.email,
  a.status,
  a.role_id,
  a.custom_permissions,
  a.created_at,
  a.updated_at,
  r.name AS role_name,
  r.label AS role_label,
  r.permissions AS role_permissions
`;

export type AdminRow = AdminRecord & {
  role_name: string;
  role_label: string;
  role_permissions: string;
};

const CUSTOM_ROLE_ID = 5;

let ensurePromise: Promise<void> | null = null;

function parsePermissionsJson(raw: string | string[] | null | undefined) {
  return roleRepository.parsePermissions(raw);
}

export function getEffectivePermissions(admin: AdminRow) {
  if (admin.role_id === 1) {
    return ["*"];
  }

  const custom = parsePermissionsJson(admin.custom_permissions);
  if (custom.length > 0) {
    return custom;
  }

  return parsePermissionsJson(admin.role_permissions);
}

function buildFullName(firstName: string, lastName: string) {
  return `${firstName}`.trim() + (lastName.trim() ? ` ${lastName.trim()}` : "");
}

async function ensureAdminColumns() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await roleRepository.ensureReady();

      try {
        await execute(
          `ALTER TABLE admin ADD COLUMN email VARCHAR(255) NULL AFTER name`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("Duplicate column name")) throw error;
      }

      try {
        await execute(
          `ALTER TABLE admin ADD COLUMN first_name VARCHAR(100) NULL AFTER name`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("Duplicate column name")) throw error;
      }

      try {
        await execute(
          `ALTER TABLE admin ADD COLUMN last_name VARCHAR(100) NULL AFTER first_name`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("Duplicate column name")) throw error;
      }

      try {
        await execute(
          `ALTER TABLE admin ADD COLUMN custom_permissions JSON NULL AFTER role_id`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("Duplicate column name")) throw error;
      }

      const defaultEmail =
        process.env.MAIL_ORDER_NOTIFY_TO ??
        process.env.MAIL_FROM_ADDRESS ??
        "info@evimersin.com";

      await execute(
        `UPDATE admin SET email = :email WHERE email IS NULL OR email = ''`,
        { email: defaultEmail },
      );

      await execute(`
        UPDATE admin
        SET first_name = CASE
          WHEN first_name IS NULL OR TRIM(first_name) = '' THEN
            CASE
              WHEN LOCATE(' ', TRIM(name)) > 0 THEN SUBSTRING_INDEX(TRIM(name), ' ', 1)
              ELSE TRIM(name)
            END
          ELSE first_name
        END,
        last_name = CASE
          WHEN last_name IS NULL OR TRIM(last_name) = '' THEN
            CASE
              WHEN LOCATE(' ', TRIM(name)) > 0 THEN SUBSTRING(TRIM(name), LOCATE(' ', TRIM(name)) + 1)
              ELSE ''
            END
          ELSE last_name
        END
        WHERE name IS NOT NULL
      `);
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  await ensurePromise;
}

export const adminRepository = {
  async findAll(): Promise<AdminRow[]> {
    await ensureAdminColumns();

    return query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       ORDER BY a.id DESC`,
    );
  },

  async findById(id: number): Promise<AdminRow | null> {
    await ensureAdminColumns();

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
    await ensureAdminColumns();

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

  async findByEmail(email: string): Promise<AdminRow | null> {
    await ensureAdminColumns();

    const rows = await query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       WHERE LOWER(a.email) = :email
       LIMIT 1`,
      { email: email.trim().toLowerCase() },
    );

    return rows[0] ?? null;
  },

  async findByEmailOrUsername(identifier: string): Promise<AdminRow | null> {
    await ensureAdminColumns();

    const rows = await query<AdminRow[]>(
      `SELECT ${SELECT_FIELDS}
       FROM admin a
       INNER JOIN admin_roles r ON r.id = a.role_id
       WHERE a.username = :identifier OR LOWER(a.email) = LOWER(:identifier)
       LIMIT 1`,
      { identifier },
    );

    return rows[0] ?? null;
  },

  async findPrimaryNotifyEmail(): Promise<string | null> {
    await ensureAdminColumns();

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
    await ensureAdminColumns();
    const rows = await query<Array<{ total: number }>>(
      `SELECT COUNT(*) AS total FROM admin WHERE role_id = :roleId`,
      { roleId },
    );
    return Number(rows[0]?.total ?? 0);
  },

  async create(input: CreateAdminInput & { password: string }): Promise<number> {
    await ensureAdminColumns();

    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const permissions = normalizePermissions(input.permissions);

    const result = await execute(
      `INSERT INTO admin (username, password, name, first_name, last_name, email, status, role_id, custom_permissions)
       VALUES (:username, :password, :name, :first_name, :last_name, :email, :status, :role_id, :custom_permissions)`,
      {
        username: input.username,
        password: input.password,
        name: buildFullName(firstName, lastName),
        first_name: firstName,
        last_name: lastName,
        email: input.email.trim().toLowerCase(),
        status: input.status ?? 1,
        role_id: CUSTOM_ROLE_ID,
        custom_permissions: JSON.stringify(permissions),
      },
    );

    return result.insertId;
  },

  async update(id: number, input: UpdateAdminInput & { password?: string }): Promise<boolean> {
    await ensureAdminColumns();

    const fields: string[] = [];
    const params: Record<string, string | number> = { id };

    if (input.username !== undefined) {
      fields.push("username = :username");
      params.username = input.username;
    }

    const nextFirstName = input.firstName?.trim();
    const nextLastName = input.lastName?.trim();

    if (nextFirstName !== undefined) {
      fields.push("first_name = :first_name");
      params.first_name = nextFirstName;
    }
    if (nextLastName !== undefined) {
      fields.push("last_name = :last_name");
      params.last_name = nextLastName;
    }
    if (nextFirstName !== undefined || nextLastName !== undefined) {
      const current = await this.findById(id);
      const firstName = nextFirstName ?? current?.first_name ?? "";
      const lastName = nextLastName ?? current?.last_name ?? "";
      fields.push("name = :name");
      params.name = buildFullName(firstName, lastName);
    }

    if (input.email !== undefined) {
      fields.push("email = :email");
      params.email = input.email.trim().toLowerCase();
    }
    if (input.status !== undefined) {
      fields.push("status = :status");
      params.status = input.status;
    }
    if (input.permissions !== undefined) {
      fields.push("custom_permissions = :custom_permissions");
      params.custom_permissions = JSON.stringify(normalizePermissions(input.permissions));
      fields.push("role_id = :role_id");
      params.role_id = CUSTOM_ROLE_ID;
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
    await ensureAdminColumns();

    const result = await execute(`DELETE FROM admin WHERE id = :id`, { id });

    return result.affectedRows > 0;
  },
};

export { CUSTOM_ROLE_ID };
