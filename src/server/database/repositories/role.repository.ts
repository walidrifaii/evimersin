import { execute, query } from "@/server/database/connection";
import { ALL_PERMISSIONS, SUPER_ADMIN_PERMISSION } from "@/constants/permissions";

export type AdminRoleRecord = {
  id: number;
  name: string;
  label: string;
  permissions: string;
  created_at?: string;
  updated_at?: string;
};

export type AdminRolePublic = {
  id: number;
  name: string;
  label: string;
  permissions: string[];
};

let ensurePromise: Promise<void> | null = null;

function parsePermissions(raw: string | string[] | null | undefined) {
  if (Array.isArray(raw)) return raw;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function toPublicRole(role: AdminRoleRecord): AdminRolePublic {
  return {
    id: role.id,
    name: role.name,
    label: role.label,
    permissions: parsePermissions(role.permissions),
  };
}

async function ensureRolesTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await execute(`
        CREATE TABLE IF NOT EXISTS admin_roles (
          id INT NOT NULL AUTO_INCREMENT,
          name VARCHAR(50) NOT NULL,
          label VARCHAR(100) NOT NULL,
          permissions JSON NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uq_admin_roles_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      try {
        await execute(
          `ALTER TABLE admin ADD COLUMN role_id INT NOT NULL DEFAULT 1 AFTER status`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("Duplicate column name")) throw error;
      }

      const superAdminPermissions = JSON.stringify([SUPER_ADMIN_PERMISSION]);
      const managerPermissions = JSON.stringify(
        ALL_PERMISSIONS.filter((item) => !item.startsWith("users:")),
      );
      const editorPermissions = JSON.stringify([
        "overview:read",
        "announcements:read",
        "announcements:write",
        "products:read",
        "products:write",
        "categories:read",
        "categories:write",
        "cities:read",
        "cities:write",
        "regions:read",
        "regions:write",
        "purposes:read",
        "purposes:write",
        "security:read",
      ]);
      const viewerPermissions = JSON.stringify([
        "overview:read",
        "products:read",
        "categories:read",
        "cities:read",
        "regions:read",
        "purposes:read",
        "security:read",
      ]);

      await execute(
        `INSERT INTO admin_roles (id, name, label, permissions)
         VALUES
           (1, 'super_admin', 'Super Admin', :superAdmin),
           (2, 'manager', 'Manager', :manager),
           (3, 'editor', 'Editor', :editor),
           (4, 'viewer', 'Viewer', :viewer)
         ON DUPLICATE KEY UPDATE
           label = VALUES(label),
           permissions = VALUES(permissions)`,
        {
          superAdmin: superAdminPermissions,
          manager: managerPermissions,
          editor: editorPermissions,
          viewer: viewerPermissions,
        },
      );

      await execute(`UPDATE admin SET role_id = 1 WHERE role_id IS NULL OR role_id = 0`);
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  await ensurePromise;
}

export const roleRepository = {
  ensureReady: () => ensureRolesTable(),

  async findAll(): Promise<AdminRolePublic[]> {
    await ensureRolesTable();
    const rows = await query<AdminRoleRecord[]>(
      `SELECT id, name, label, permissions, created_at, updated_at
       FROM admin_roles
       ORDER BY id ASC`,
    );
    return rows.map(toPublicRole);
  },

  async findById(id: number): Promise<AdminRolePublic | null> {
    await ensureRolesTable();
    const rows = await query<AdminRoleRecord[]>(
      `SELECT id, name, label, permissions, created_at, updated_at
       FROM admin_roles
       WHERE id = :id
       LIMIT 1`,
      { id },
    );
    const role = rows[0];
    return role ? toPublicRole(role) : null;
  },

  parsePermissions,
};
