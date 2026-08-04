import {
  adminRepository,
  getEffectivePermissions,
  type AdminRow,
} from "@/server/database/repositories/admin.repository";
import {
  emailVerificationRepository,
  verifyEmailOtpHash,
} from "@/server/database/repositories/email-verification.repository";
import {
  generateOtpCode,
  passwordResetRepository,
  verifyOtpHash,
} from "@/server/database/repositories/password-reset.repository";
import {
  refreshTokenRepository,
} from "@/server/database/repositories/refresh-token.repository";
import { roleRepository } from "@/server/database/repositories/role.repository";
import {
  getRefreshExpiryDate,
  signAccessToken,
  signChangePasswordChallenge,
  signRefreshJwt,
  verifyChangePasswordChallenge,
  verifyRefreshJwt,
} from "@/server/auth/jwt";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { hasPermission } from "@/lib/auth/permissions";
import { normalizePermissions, PERMISSIONS } from "@/constants/permissions";
import { mailService } from "@/server/services/mail.service";
import { AppError } from "@/server/utils/errors";
import type {
  AdminPublic,
  AuthTokenPayload,
  ChangePasswordConfirmInput,
  ChangePasswordRequestInput,
  CreateAdminInput,
  ForgotPasswordInput,
  LoginInput,
  RequestUserEmailVerificationInput,
  ResetPasswordInput,
  UpdateAdminInput,
  VerifyOtpInput,
} from "@/server/types/admin.types";

const OTP_EXPIRY_MINUTES = 10;
const SUPER_ADMIN_ROLE_ID = 1;

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

function toPublicAdmin(admin: AdminRow): AdminPublic {
  const permissions = getEffectivePermissions(admin);
  return {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    firstName: admin.first_name ?? admin.name.split(" ")[0] ?? "",
    lastName: admin.last_name ?? admin.name.split(" ").slice(1).join(" "),
    email: admin.email,
    status: admin.status,
    roleId: admin.role_id,
    roleName: admin.role_name,
    roleLabel: admin.role_id === 5 ? "Custom access" : admin.role_label,
    permissions,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
}

function toTokenPayload(admin: AdminRow): AuthTokenPayload {
  return {
    sub: admin.id,
    username: admin.username,
    name: admin.name,
    roleId: admin.role_id,
    roleName: admin.role_name,
    permissions: getEffectivePermissions(admin),
  };
}

async function verifyInviteEmailOtp(email: string, otp: string) {
  const record = await emailVerificationRepository.findLatestValid(email, "user-invite");
  if (!record || !verifyEmailOtpHash(otp, record.otp_hash)) {
    throw new AppError("Invalid or expired email verification code.", 400);
  }
  await emailVerificationRepository.markUsed(record.id);
}

async function issueTokenPair(admin: AdminRow) {
  const payload = toTokenPayload(admin);
  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshJwt(payload);

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

  function assertCanManageUsers(actor?: AuthTokenPayload) {
  if (
    !actor ||
    !(
      hasPermission(actor.permissions, PERMISSIONS.USERS_WRITE) ||
      hasPermission(actor.permissions, PERMISSIONS.USERS_CREATE) ||
      hasPermission(actor.permissions, PERMISSIONS.USERS_UPDATE) ||
      hasPermission(actor.permissions, PERMISSIONS.USERS_DELETE)
    )
  ) {
    throw new AppError("You do not have permission to manage dashboard users.", 403);
  }
}

async function assertSafeAdminMutation(input: {
  actor?: AuthTokenPayload;
  targetId: number;
  nextStatus?: number;
  deleting?: boolean;
}) {
  assertCanManageUsers(input.actor);

  const target = await adminRepository.findById(input.targetId);
  if (!target) throw new AppError("Admin not found", 404);

  if (input.deleting && input.actor?.sub === input.targetId) {
    throw new AppError("You cannot delete your own account.", 400);
  }

  if (target.role_id === SUPER_ADMIN_ROLE_ID) {
    const superAdminCount = await adminRepository.countByRole(SUPER_ADMIN_ROLE_ID);
    const willLoseSuperAdmin =
      input.deleting ||
      (input.nextStatus !== undefined && input.nextStatus === 0);

    if (willLoseSuperAdmin && superAdminCount <= 1) {
      throw new AppError("At least one active super admin is required.", 400);
    }
  }

  return target;
}

export const adminService = {
  list(actor?: AuthTokenPayload): Promise<AdminPublic[]> {
    if (!actor || !hasPermission(actor.permissions, PERMISSIONS.USERS_READ)) {
      throw new AppError("You do not have permission to view dashboard users.", 403);
    }

    return adminRepository.findAll().then((admins) => admins.map(toPublicAdmin));
  },

  async getById(id: number, actor?: AuthTokenPayload): Promise<AdminPublic> {
    if (!actor || !hasPermission(actor.permissions, PERMISSIONS.USERS_READ)) {
      throw new AppError("You do not have permission to view dashboard users.", 403);
    }

    const admin = await adminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);
    return toPublicAdmin(admin);
  },

  async requestUserEmailVerification(
    input: RequestUserEmailVerificationInput,
    actor?: AuthTokenPayload,
  ) {
    assertCanManageUsers(actor);

    const email = input.email.trim().toLowerCase();
    const existing = await adminRepository.findByEmail(email);
    if (existing) {
      throw new AppError("This email is already used by another dashboard user.", 409);
    }

    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await emailVerificationRepository.create({
      email,
      otp,
      expiresAt,
      purpose: "user-invite",
      createdBy: actor?.sub,
    });

    await mailService.sendUserEmailVerificationOtp({
      to: email,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      otp,
    });

    return {
      message: `Verification code sent to ${maskEmail(email)}.`,
      emailMasked: maskEmail(email),
    };
  },

  async create(input: CreateAdminInput, actor?: AuthTokenPayload): Promise<AdminPublic> {
    assertCanManageUsers(actor);

    const existingUsername = await adminRepository.findByUsername(input.username);
    if (existingUsername) throw new AppError("Username already exists", 409);

    const email = input.email.trim().toLowerCase();
    const existingEmail = await adminRepository.findByEmail(email);
    if (existingEmail) throw new AppError("Email already exists", 409);

    const permissions = normalizePermissions(input.permissions);
    if (permissions.length === 0) {
      throw new AppError("Select at least one permission for this user.", 400);
    }

    await verifyInviteEmailOtp(email, input.emailOtp);

    const passwordHash = await hashPassword(input.password);
    const id = await adminRepository.create({
      ...input,
      email,
      permissions,
      password: passwordHash,
    });

    return this.getById(id, actor);
  },

  async update(
    id: number,
    input: UpdateAdminInput,
    actor?: AuthTokenPayload,
  ): Promise<AdminPublic> {
    const target = await assertSafeAdminMutation({
      actor,
      targetId: id,
      nextStatus: input.status,
    });

    if (target.role_id === SUPER_ADMIN_ROLE_ID && (input.permissions || input.status === 0)) {
      throw new AppError("Super admin access cannot be changed from here.", 400);
    }

    const admin = await adminRepository.findById(id);
    if (!admin) throw new AppError("Admin not found", 404);

    if (input.username && input.username !== admin.username) {
      const existing = await adminRepository.findByUsername(input.username);
      if (existing) throw new AppError("Username already exists", 409);
    }

    const nextEmail = input.email?.trim().toLowerCase();
    const emailChanged = !!nextEmail && nextEmail !== admin.email.trim().toLowerCase();

    if (emailChanged) {
      if (!input.emailOtp) {
        throw new AppError("Email verification code is required when changing email.", 400);
      }
      const taken = await adminRepository.findByEmail(nextEmail);
      if (taken && taken.id !== id) {
        throw new AppError("This email is already used by another dashboard user.", 409);
      }
      await verifyInviteEmailOtp(nextEmail, input.emailOtp);
    }

    if (input.permissions !== undefined) {
      const permissions = normalizePermissions(input.permissions);
      if (permissions.length === 0) {
        throw new AppError("Select at least one permission for this user.", 400);
      }
      input.permissions = permissions;
    }

    const payload: UpdateAdminInput & { password?: string } = { ...input };
    if (input.password) {
      payload.password = await hashPassword(input.password);
    }

    await adminRepository.update(id, payload);
    return this.getById(id, actor);
  },

  async remove(id: number, actor?: AuthTokenPayload): Promise<void> {
    await assertSafeAdminMutation({
      actor,
      targetId: id,
      deleting: true,
    });

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
    const admin = await adminRepository.findById(adminId);
    if (!admin) throw new AppError("Admin not found", 404);
    return toPublicAdmin(admin);
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

    const updated = await this.me(admin.id);
    const message = challenge.passwordHash
      ? "Password and email updated successfully."
      : "Email updated successfully.";

    return {
      message,
      admin: updated,
    };
  },
};

export const roleService = {
  list: () => roleRepository.findAll(),
};
