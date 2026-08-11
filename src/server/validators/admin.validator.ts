import { z } from "zod";
import { ALL_PERMISSIONS } from "@/constants/permissions";

const permissionsSchema = z
  .array(z.string())
  .min(1, "Select at least one permission")
  .transform((values) =>
    values.filter((value) => ALL_PERMISSIONS.includes(value) || value === "*"),
  )
  .refine((values) => values.length > 0, {
    message: "Select at least one permission",
  });

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
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  permissions: permissionsSchema,
  status: z.union([z.literal(0), z.literal(1)]).optional().default(1),
});

export const updateAdminSchema = z
  .object({
    username: z.string().trim().min(3).max(100).optional(),
    password: z.string().min(6).max(128).optional(),
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().max(255).optional(),
    permissions: permissionsSchema.optional(),
    status: z.union([z.literal(0), z.literal(1)]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const adminIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const identifierSchema = z.string().trim().min(3).max(255);

export const forgotPasswordSchema = z.object({
  identifier: identifierSchema,
});

export const verifyOtpSchema = z.object({
  identifier: identifierSchema,
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z.object({
  identifier: identifierSchema,
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"),
  password: z.string().min(6).max(128),
});

export const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(6).max(128),
    newPassword: z
      .string()
      .max(128)
      .optional()
      .transform((value) => {
        const trimmed = value?.trim() ?? "";
        return trimmed.length > 0 ? trimmed : undefined;
      }),
    email: z.string().trim().email().max(255),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== undefined && data.newPassword.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be at least 6 characters",
        path: ["newPassword"],
      });
    }
  });

export const changePasswordConfirmSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"),
  challengeToken: z.string().trim().min(20),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type VerifyOtpSchema = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordRequestSchema = z.infer<typeof changePasswordRequestSchema>;
export type ChangePasswordConfirmSchema = z.infer<typeof changePasswordConfirmSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type CreateAdminSchema = z.infer<typeof createAdminSchema>;
export type UpdateAdminSchema = z.infer<typeof updateAdminSchema>;
