import { execute, query } from "@/server/database/connection";
import type { AdminRecord, CreateAdminInput, UpdateAdminInput } from "@/server/types/admin.types";

export const adminRepository = {
  async findAll(): Promise<AdminRecord[]> {
    return query<AdminRecord[]>(
      `SELECT id, username, password, name, status, created_at, updated_at
       FROM admin
       ORDER BY id DESC`,
    );
  },

  async findById(id: number): Promise<AdminRecord | null> {
    const rows = await query<AdminRecord[]>(
      `SELECT id, username, password, name, status, created_at, updated_at
       FROM admin
       WHERE id = :id
       LIMIT 1`,
      { id },
    );

    return rows[0] ?? null;
  },

  async findByUsername(username: string): Promise<AdminRecord | null> {
    const rows = await query<AdminRecord[]>(
      `SELECT id, username, password, name, status, created_at, updated_at
       FROM admin
       WHERE username = :username
       LIMIT 1`,
      { username },
    );

    return rows[0] ?? null;
  },

  async create(input: CreateAdminInput & { password: string }): Promise<number> {
    const result = await execute(
      `INSERT INTO admin (username, password, name, status)
       VALUES (:username, :password, :name, :status)`,
      {
        username: input.username,
        password: input.password,
        name: input.name,
        status: input.status ?? 1,
      },
    );

    return result.insertId;
  },

  async update(id: number, input: UpdateAdminInput & { password?: string }): Promise<boolean> {
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
    const result = await execute(`DELETE FROM admin WHERE id = :id`, { id });

    return result.affectedRows > 0;
  },
};
