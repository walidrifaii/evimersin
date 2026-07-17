import { adminRepository } from "@/server/database/repositories/admin.repository";
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
import { AppError } from "@/server/utils/errors";
import type {
  AdminPublic,
  CreateAdminInput,
  LoginInput,
  UpdateAdminInput,
} from "@/server/types/admin.types";

function toPublicAdmin(admin: {
  id: number;
  username: string;
  name: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}): AdminPublic {
  return {
    id: admin.id,
    username: admin.username,
    name: admin.name,
    status: admin.status,
    created_at: admin.created_at,
    updated_at: admin.updated_at,
  };
}

async function issueTokenPair(admin: {
  id: number;
  username: string;
  name: string;
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
};
