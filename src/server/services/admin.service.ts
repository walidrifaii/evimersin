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
  signChangePasswordChallenge,
  signRefreshJwt,
  verifyChangePasswordChallenge,
  verifyRefreshJwt,
} from "@/server/auth/jwt";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { mailService } from "@/server/services/mail.service";
import { AppError } from "@/server/utils/errors";
import type {
  AdminPublic,
  ChangePasswordConfirmInput,
  ChangePasswordRequestInput,
  CreateAdminInput,
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  UpdateAdminInput,
  VerifyOtpInput,
} from "@/server/types/admin.types";

const OTP_EXPIRY_MINUTES = 10;

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
}


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

  async requestChangePassword(adminId: number, input: ChangePasswordRequestInput) {
    const admin = await adminRepository.findById(adminId);
    if (!admin || admin.status !== 1) {
      throw new AppError("Admin not found", 404);
    }

    const valid = await verifyPassword(input.currentPassword, admin.password);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    const email = input.email.trim().toLowerCase();
    const newPassword = input.newPassword?.trim() || "";
    const emailChanged = email !== admin.email.trim().toLowerCase();
    const passwordChanged = newPassword.length > 0;

    if (!emailChanged && !passwordChanged) {
      throw new AppError("Change your email and/or enter a new password", 400);
    }

    if (passwordChanged && newPassword === input.currentPassword) {
      throw new AppError("New password must be different from the current password", 400);
    }

    if (passwordChanged && newPassword.length < 6) {
      throw new AppError("New password must be at least 6 characters", 400);
    }

    const passwordHash = passwordChanged ? await hashPassword(newPassword) : null;
    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await passwordResetRepository.create(admin.id, otp, expiresAt);
    const challengeToken = await signChangePasswordChallenge({
      sub: admin.id,
      passwordHash,
      email,
    });

    await mailService.sendChangePasswordOtp({
      to: email,
      username: admin.username,
      adminName: admin.name,
      otp,
    });

    const changing = [
      passwordChanged ? "password" : null,
      emailChanged ? "email" : null,
    ]
      .filter(Boolean)
      .join(" and ");

    return {
      message: `OTP sent to ${maskEmail(email)}. Enter it to confirm your ${changing} update.`,
      challengeToken,
      emailMasked: maskEmail(email),
    };
  },

  async confirmChangePassword(adminId: number, input: ChangePasswordConfirmInput) {
    let challenge;
    try {
      challenge = await verifyChangePasswordChallenge(input.challengeToken);
    } catch {
      throw new AppError("Security challenge expired. Start again.", 400);
    }

    if (challenge.sub !== adminId) {
      throw new AppError("Unauthorized", 401);
    }

    const admin = await adminRepository.findById(adminId);
    if (!admin || admin.status !== 1) {
      throw new AppError("Admin not found", 404);
    }

    const record = await passwordResetRepository.findLatestValid(admin.id);
    if (!record || !verifyOtpHash(input.otp, record.otp_hash)) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    const updatePayload: { email: string; password?: string } = {
      email: challenge.email,
    };
    if (challenge.passwordHash) {
      updatePayload.password = challenge.passwordHash;
    }

    await adminRepository.update(admin.id, updatePayload);
    await passwordResetRepository.markUsed(record.id);

    if (challenge.passwordHash) {
      await refreshTokenRepository.revokeAllForAdmin(admin.id);
    }

    const updated = await this.getById(admin.id);
    const message = challenge.passwordHash
      ? "Password and email updated successfully."
      : "Email updated successfully.";

    return {
      message,
      admin: updated,
    };
  },
};
