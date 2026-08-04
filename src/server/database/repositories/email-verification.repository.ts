import crypto from "crypto";
import { execute, query } from "@/server/database/connection";

export type EmailVerificationRecord = {
  id: number;
  email: string;
  otp_hash: string;
  purpose: string;
  created_by: number | null;
  expires_at: Date | string;
  used_at: Date | string | null;
  created_at: Date | string;
};

function hashOtp(otp: string) {
  const secret = process.env.JWT_SECRET ?? "evimersin-otp-secret";
  return crypto.createHash("sha256").update(`${otp}:${secret}`).digest("hex");
}

export function verifyEmailOtpHash(otp: string, otpHash: string) {
  const normalized = otp.trim();
  if (!/^\d{6}$/.test(normalized)) return false;
  return hashOtp(normalized) === otpHash;
}

export function generateEmailOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

let ensurePromise: Promise<void> | null = null;

async function ensureTable() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await execute(`
        CREATE TABLE IF NOT EXISTS email_verification_otps (
          id INT NOT NULL AUTO_INCREMENT,
          email VARCHAR(255) NOT NULL,
          otp_hash VARCHAR(64) NOT NULL,
          purpose VARCHAR(50) NOT NULL DEFAULT 'user-invite',
          created_by INT NULL,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY idx_email_verification_email (email),
          KEY idx_email_verification_valid (email, used_at, expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  await ensurePromise;
}

export const emailVerificationRepository = {
  ensureReady: () => ensureTable(),

  async invalidateForEmail(email: string, purpose = "user-invite") {
    await ensureTable();
    await execute(
      `UPDATE email_verification_otps
       SET used_at = CURRENT_TIMESTAMP
       WHERE email = :email
         AND purpose = :purpose
         AND used_at IS NULL`,
      { email: email.trim().toLowerCase(), purpose },
    );
  },

  async create(input: {
    email: string;
    otp: string;
    expiresAt: Date;
    purpose?: string;
    createdBy?: number;
  }) {
    await ensureTable();
    const email = input.email.trim().toLowerCase();

    await this.invalidateForEmail(email, input.purpose ?? "user-invite");

    const result = await execute(
      `INSERT INTO email_verification_otps (email, otp_hash, purpose, created_by, expires_at)
       VALUES (:email, :otpHash, :purpose, :createdBy, :expiresAt)`,
      {
        email,
        otpHash: hashOtp(input.otp),
        purpose: input.purpose ?? "user-invite",
        createdBy: input.createdBy ?? null,
        expiresAt: input.expiresAt,
      },
    );

    return result.insertId;
  },

  async findLatestValid(email: string, purpose = "user-invite") {
    await ensureTable();
    const rows = await query<EmailVerificationRecord[]>(
      `SELECT id, email, otp_hash, purpose, created_by, expires_at, used_at, created_at
       FROM email_verification_otps
       WHERE email = :email
         AND purpose = :purpose
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY id DESC
       LIMIT 1`,
      { email: email.trim().toLowerCase(), purpose },
    );

    return rows[0] ?? null;
  },

  async markUsed(id: number) {
    await ensureTable();
    await execute(
      `UPDATE email_verification_otps SET used_at = CURRENT_TIMESTAMP WHERE id = :id`,
      { id },
    );
  },
};
