import { createHash, randomBytes } from "crypto";
import { execute, query } from "@/server/database/connection";

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
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token_hash = :token_hash
         AND revoked_at IS NULL`,
      { token_hash: hashToken(token) },
    );

    return result.affectedRows > 0;
  },

  async revokeAllForAdmin(adminId: number): Promise<void> {
    await execute(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE admin_id = :admin_id
         AND revoked_at IS NULL`,
      { admin_id: adminId },
    );
  },
};
