import { adminRepository } from "@/server/database/repositories/admin.repository";
import {
  generateOtpCode,
  passwordResetRepository,
  verifyOtpHash,
} from "@/server/database/repositories/password-reset.repository";
import {
  refreshTokenRepository,
} from "@/server/database/repositories/refresh-token.repository";
import {
  getRefreshExpiryDate,
  signAccessToken,
  signRefreshJwt,
  verifyRefreshJwt,
} from "@/server/auth/jwt";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { mailService } from "@/server/services/mail.service";
import { AppError } from "@/server/utils/errors";
import type {
  AdminPublic,
  CreateAdminInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateAdminInput,
  VerifyOtpInput,
} from "@/server/types/admin.types";

const OTP_EXPIRY_MINUTES = 10;

async function findActiveAdminByIdentifier(identifier: string) {
  const admin = await adminRepository.findByEmailOrUsername(identifier.trim());
  if (!admin || admin.status !== 1) return null;
  return admin;
}

function toPublicAdmin(admin: {
  id: number;
  username: string;
  name: string;
  email: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}): AdminPublic {
  return {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    email: admin.email,
    status: admin.status,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
}

async function issueTokenPair(admin: {
  id: number;
  username: string;
  name: string;
  email: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}) {
  const payload = {
    sub: admin.id,
    username: admin.username,
    name: admin.name,
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshJwt(payload);

  // Store hashed opaque-compatible token value (JWT string hashed)
  await refreshTokenRepository.create(
    admin.id,
    refreshToken,
    getRefreshExpiryDate(),
  );

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer" as const,
    expiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m",
    admin: toPublicAdmin(admin),
  };
}

export const adminService = {
  async list(): Promise<AdminPublic[]> {
    const admins = await adminRepository.findAll();
    return admins.map(toPublicAdmin);
  },

  async getById(id: number): Promise<AdminPublic> {
    const admin = await adminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);
    return toPublicAdmin(admin);
  },

  async create(input: CreateAdminInput): Promise<AdminPublic> {
    const existing = await adminRepository.findByUsername(input.username);
    if (existing) throw new AppError("Username already exists", 409);

    const passwordHash = await hashPassword(input.password);
    const id = await adminRepository.create({
      ...input,
      password: passwordHash,
    });

    return this.getById(id);
  },

  async update(id: number, input: UpdateAdminInput): Promise<AdminPublic> {
    const admin = await adminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);

    if (input.username && input.username !== admin.username) {
      const existing = await adminRepository.findByUsername(input.username);
      if (existing) throw new AppError("Username already exists", 409);
    }

    const payload: UpdateAdminInput & { password?: string } = { ...input };
    if (input.password) {
      payload.password = await hashPassword(input.password);
    }

    await adminRepository.update(id, payload);
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const deleted = await adminRepository.delete(id);
    if (!deleted) throw new AppError("Admin not found", 404);
  },

  async login(input: LoginInput) {
    const admin = await adminRepository.findByUsername(input.username);
    if (!admin) throw new AppError("Invalid username or password", 401);

    if (admin.status !== 1) throw new AppError("Account is inactive", 403);

    const valid = await verifyPassword(input.password, admin.password);
    if (!valid) throw new AppError("Invalid username or password", 401);

    return issueTokenPair(admin);
  },

  async refresh(refreshToken: string) {
    let payload;
    try {
      payload = await verifyRefreshJwt(refreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const stored = await refreshTokenRepository.findValidByToken(refreshToken);
    if (!stored || stored.admin_id !== payload.sub) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const admin = await adminRepository.findById(payload.sub);
    if (!admin || admin.status !== 1) {
      throw new AppError("Account is inactive", 403);
    }

    // Rotate refresh token
    await refreshTokenRepository.revokeByToken(refreshToken);
    return issueTokenPair(admin);
  },

  async logout(refreshToken?: string, adminId?: number) {
    if (refreshToken) {
      await refreshTokenRepository.revokeByToken(refreshToken);
      return { message: "Logged out successfully" };
    }

    if (adminId) {
      await refreshTokenRepository.revokeAllForAdmin(adminId);
      return { message: "Logged out successfully" };
    }

    throw new AppError("Refresh token is required", 400);
  },

  async me(adminId: number) {
    return this.getById(adminId);
  },

  async requestPasswordReset(input: ForgotPasswordInput) {
    const admin = await findActiveAdminByIdentifier(input.identifier);

    if (!admin || !admin.email?.trim()) {
      return {
        message:
          "If the account exists, an OTP has been sent to the admin email.",
      };
    }

    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await passwordResetRepository.create(admin.id, otp, expiresAt);
    await mailService.sendPasswordResetOtp({
      to: admin.email.trim(),
      username: admin.username,
      adminName: admin.name,
      otp,
    });

    return {
      message: "If the account exists, an OTP has been sent to the admin email.",
    };
  },

  async verifyPasswordResetOtp(input: VerifyOtpInput) {
    const admin = await findActiveAdminByIdentifier(input.identifier);
    if (!admin) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    const record = await passwordResetRepository.findLatestValid(admin.id);
    if (!record || !verifyOtpHash(input.otp, record.otp_hash)) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    return { message: "OTP verified. You can set a new password." };
  },

  async resetPassword(input: ResetPasswordInput) {
    const admin = await findActiveAdminByIdentifier(input.identifier);
    if (!admin) {
      throw new AppError("Invalid username or OTP", 400);
    }

    const record = await passwordResetRepository.findLatestValid(admin.id);
    if (!record || !verifyOtpHash(input.otp, record.otp_hash)) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    const passwordHash = await hashPassword(input.password);
    await adminRepository.update(admin.id, { password: passwordHash });
    await passwordResetRepository.markUsed(record.id);
    await refreshTokenRepository.revokeAllForAdmin(admin.id);

    return { message: "Password updated successfully. You can sign in now." };
  },
};
