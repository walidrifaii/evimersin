import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(20),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().min(20).optional(),
});

export const createAdminSchema = z.object({
  username: z.string().trim().min(3).max(100),
  password: z.string().min(6).max(128),
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  status: z.union([z.literal(0), z.literal(1)]).optional().default(1),
});

export const updateAdminSchema = z
  .object({
    username: z.string().trim().min(3).max(100).optional(),
    password: z.string().min(6).max(128).optional(),
    name: z.string().trim().min(2).max(150).optional(),
    email: z.string().trim().email().max(255).optional(),
    status: z.union([z.literal(0), z.literal(1)]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const adminIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const forgotPasswordSchema = z.object({
  username: z.string().trim().min(3).max(100),
});

export const resetPasswordSchema = z.object({
  username: z.string().trim().min(3).max(100),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"),
  password: z.string().min(6).max(128),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type CreateAdminSchema = z.infer<typeof createAdminSchema>;
export type UpdateAdminSchema = z.infer<typeof updateAdminSchema>;
