import crypto from "crypto";
import { execute, query } from "@/server/database/connection";

export type PasswordResetOtpRecord = {
  id: number;
  admin_id: number;
  otp_hash: string;
  expires_at: Date | string;
  used_at: Date | string | null;
  created_at: Date | string;
};

function hashOtp(otp: string) {
  const secret = process.env.JWT_SECRET ?? "evimersin-otp-secret";
  return crypto.createHash("sha256").update(`${otp}:${secret}`).digest("hex");
}

export function verifyOtpHash(otp: string, otpHash: string) {
  const normalized = otp.trim();
  if (!/^\d{6}$/.test(normalized)) return false;
  return hashOtp(normalized) === otpHash;
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const passwordResetRepository = {
  async invalidateForAdmin(adminId: number) {
    await execute(
      `UPDATE password_reset_otps
       SET used_at = CURRENT_TIMESTAMP
       WHERE admin_id = :adminId AND used_at IS NULL`,
      { adminId },
    );
  },

  async create(adminId: number, otp: string, expiresAt: Date) {
    await this.invalidateForAdmin(adminId);

    const result = await execute(
      `INSERT INTO password_reset_otps (admin_id, otp_hash, expires_at)
       VALUES (:adminId, :otpHash, :expiresAt)`,
      {
        adminId,
        otpHash: hashOtp(otp),
        expiresAt,
      },
    );

    return result.insertId;
  },

  async findLatestValid(adminId: number) {
    const rows = await query<PasswordResetOtpRecord[]>(
      `SELECT id, admin_id, otp_hash, expires_at, used_at, created_at
       FROM password_reset_otps
       WHERE admin_id = :adminId
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      { adminId },
    );

    return rows[0] ?? null;
  },

  async markUsed(id: number) {
    await execute(
      `UPDATE password_reset_otps SET used_at = CURRENT_TIMESTAMP WHERE id = :id`,
      { id },
    );
  },
};
