import type { ResultSetHeader } from "mysql2/promise";
import { createHash, randomBytes } from "crypto";
import { execute, getPool, query } from "@/server/database/connection";

export type RefreshTokenRecord = {
  id: number;
  admin_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at?: Date;
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString("hex");
}

export const refreshTokenRepository = {
  async create(adminId: number, token: string, expiresAt: Date): Promise<number> {
    const result = await execute(
      `INSERT INTO refresh_tokens (admin_id, token_hash, expires_at)
       VALUES (:admin_id, :token_hash, :expires_at)`,
      {
        admin_id: adminId,
        token_hash: hashToken(token),
        expires_at: expiresAt,
      },
    );

    return result.insertId;
  },

  /** One active refresh token per admin — removes previous rows, then inserts. */
  async replaceForAdmin(
    adminId: number,
    token: string,
    expiresAt: Date,
  ): Promise<number> {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute(
        "DELETE FROM refresh_tokens WHERE admin_id = ?",
        [adminId],
      );
      const [result] = await connection.execute(
        `INSERT INTO refresh_tokens (admin_id, token_hash, expires_at)
         VALUES (?, ?, ?)`,
        [adminId, hashToken(token), expiresAt],
      );
      await connection.commit();
      return (result as ResultSetHeader).insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findValidByToken(token: string): Promise<RefreshTokenRecord | null> {
    const rows = await query<RefreshTokenRecord[]>(
      `SELECT id, admin_id, token_hash, expires_at, revoked_at, created_at
       FROM refresh_tokens
       WHERE token_hash = :token_hash
         AND revoked_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      { token_hash: hashToken(token) },
    );

    return rows[0] ?? null;
  },

  async revokeByToken(token: string): Promise<boolean> {
    const result = await execute(
      `DELETE FROM refresh_tokens
       WHERE token_hash = :token_hash`,
      { token_hash: hashToken(token) },
    );

    return result.affectedRows > 0;
  },

  async revokeAllForAdmin(adminId: number): Promise<void> {
    await execute(`DELETE FROM refresh_tokens WHERE admin_id = :admin_id`, {
      admin_id: adminId,
    });
  },
};
